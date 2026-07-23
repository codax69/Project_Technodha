from decimal import Decimal
from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.products.models import Product
from .models import Order, OrderItem

class OrderService:
    @staticmethod
    def create_order(customer, items_data: list) -> Order:
        """
        Executes order placement inside a database transaction.
        1. Validates non-empty item list.
        2. Sorts product IDs to lock rows in consistent order (prevents deadlocks).
        3. Locks Product rows using select_for_update().
        4. Validates stock for all requested items.
        5. Computes unit prices, subtotals, and total_price server-side.
        6. Decrements product stock and saves Order + OrderItems.
        """
        if not items_data:
            raise ValidationError({"items": "Order must contain at least one item."})

        # Consolidate duplicate products in request if any
        product_quantities = {}
        for item in items_data:
            p_id = item.get('product_id')
            qty = item.get('quantity')
            if not p_id or not isinstance(qty, int) or qty <= 0:
                raise ValidationError({"items": "Each item must specify valid product_id and positive integer quantity."})
            product_quantities[p_id] = product_quantities.get(p_id, 0) + qty

        sorted_product_ids = sorted(product_quantities.keys())

        with transaction.atomic():
            # Lock product records sorted by ID to avoid deadlock
            products_map = {
                p.id: p for p in Product.objects.filter(id__in=sorted_product_ids).select_for_update()
            }

            # Verify all requested products exist and are active
            missing_ids = [pid for pid in sorted_product_ids if pid not in products_map]
            if missing_ids:
                raise ValidationError({"items": f"Products with IDs {missing_ids} do not exist."})

            # Check stock for each line item
            insufficient_stock_errors = []
            for p_id in sorted_product_ids:
                product = products_map[p_id]
                requested_qty = product_quantities[p_id]
                
                if not product.is_active:
                    insufficient_stock_errors.append(
                        f"Product '{product.name}' is currently inactive."
                    )
                elif product.stock_quantity < requested_qty:
                    insufficient_stock_errors.append(
                        f"Insufficient stock for '{product.name}'. Requested: {requested_qty}, Available: {product.stock_quantity}."
                    )

            if insufficient_stock_errors:
                raise ValidationError({"stock_error": insufficient_stock_errors})

            # Create Order instance
            order = Order.objects.create(
                customer=customer,
                status=Order.Status.PENDING,
                total_price=Decimal('0.00')
            )

            total_price = Decimal('0.00')
            order_items_to_create = []

            for p_id in sorted_product_ids:
                product = products_map[p_id]
                qty = product_quantities[p_id]
                
                # Server-side price calculation
                unit_price = Decimal(str(product.price))
                subtotal = unit_price * qty
                total_price += subtotal

                # Decrement stock quantity
                product.stock_quantity -= qty
                product.save(update_fields=['stock_quantity', 'updated_at'])

                order_items_to_create.append(
                    OrderItem(
                        order=order,
                        product=product,
                        quantity=qty,
                        unit_price_at_purchase=unit_price,
                        subtotal=subtotal
                    )
                )

            OrderItem.objects.bulk_create(order_items_to_create)
            order.total_price = total_price
            order.save(update_fields=['total_price', 'updated_at'])

            return order

    @staticmethod
    def cancel_order(order: Order, requesting_user) -> Order:
        """
        Cancels a pending order and restocks items inside an atomic transaction block.
        """
        with transaction.atomic():
            # Refresh and lock order instance
            locked_order = Order.objects.select_for_update().get(id=order.id)

            if locked_order.status == Order.Status.CANCELLED:
                raise ValidationError({"order": "Order is already cancelled."})

            if locked_order.status != Order.Status.PENDING:
                raise ValidationError({"order": f"Cannot cancel order in '{locked_order.status}' status. Only pending orders can be cancelled."})

            # Fetch and lock order items' products
            items = locked_order.items.select_related('product').all()
            product_ids = sorted([item.product_id for item in items])
            
            products_map = {
                p.id: p for p in Product.objects.filter(id__in=product_ids).select_for_update()
            }

            # Restock items
            for item in items:
                product = products_map.get(item.product_id)
                if product:
                    product.stock_quantity += item.quantity
                    product.save(update_fields=['stock_quantity', 'updated_at'])

            locked_order.status = Order.Status.CANCELLED
            locked_order.save(update_fields=['status', 'updated_at'])
            return locked_order

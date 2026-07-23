import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.authentication.models import User
from apps.products.models import Category, Product
from apps.orders.models import Order, OrderItem

def seed():
    print("Starting Database Seeding...")

    # 1. Create Users (Admin & Customer)
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@technodha.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if not admin_user.check_password('admin123'):
        admin_user.set_password('admin123')
        admin_user.save()

    customer_user, _ = User.objects.get_or_create(
        username='customer1',
        defaults={
            'email': 'customer1@example.com',
            'role': 'customer',
        }
    )
    if not customer_user.check_password('customer123'):
        customer_user.set_password('customer123')
        customer_user.save()

    print("Users seeded (admin: admin123, customer1: customer123)")

    # 2. Create Categories
    categories_data = [
        {"name": "Electronics & Computers", "slug": "electronics-computers"},
        {"name": "Peripherals & Accessories", "slug": "peripherals-accessories"},
        {"name": "Networking & Storage", "slug": "networking-storage"},
        {"name": "Smart Home & Gadgets", "slug": "smart-home-gadgets"},
        {"name": "Office Supplies", "slug": "office-supplies"},
    ]

    categories = []
    for cat_info in categories_data:
        cat, created = Category.objects.get_or_create(
            slug=cat_info['slug'],
            defaults={'name': cat_info['name']}
        )
        categories.append(cat)

    print(f"Seeded {len(categories)} categories.")

    # 3. Create Products
    products_data = [
        {
            "name": "Technodha ProBook Laptop 15.6\"",
            "description": "High performance laptop with 16GB RAM and 512GB NVMe SSD for power users.",
            "price": Decimal("54999.00"),
            "stock_quantity": 15,
            "category": categories[0],
            "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
            "is_active": True,
        },
        {
            "name": "Mechanical RGB Gaming Keyboard",
            "description": "Tactile mechanical switches with customizable per-key RGB backlighting.",
            "price": Decimal("3499.00"),
            "stock_quantity": 25,
            "category": categories[1],
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
            "is_active": True,
        },
        {
            "name": "Ergonomic Wireless Mouse",
            "description": "Dual-mode Bluetooth & 2.4GHz wireless precision optical mouse.",
            "price": Decimal("1299.00"),
            "stock_quantity": 3,
            "category": categories[1],
            "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
            "is_active": True,
        },
        {
            "name": "UltraWide 27\" IPS Monitor",
            "description": "4K UHD IPS display with 144Hz refresh rate and USB-C connectivity.",
            "price": Decimal("24999.00"),
            "stock_quantity": 8,
            "category": categories[0],
            "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
            "is_active": True,
        },
        {
            "name": "Dual-Band Wi-Fi 6 Router",
            "description": "High-speed Gigabit Wi-Fi 6 mesh router supporting up to 3000 Mbps.",
            "price": Decimal("4999.00"),
            "stock_quantity": 2,
            "category": categories[2],
            "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
            "is_active": True,
        },
        {
            "name": "Smart Ambient Desk Lamp",
            "description": "Dimmable LED lamp with smartphone integration and wireless charging pad.",
            "price": Decimal("2199.00"),
            "stock_quantity": 18,
            "category": categories[3],
            "image_url": "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=600&q=80",
            "is_active": True,
        },
        {
            "name": "Noise Cancelling Headphones",
            "description": "Over-ear active noise cancelling headphones with 30hr battery life.",
            "price": Decimal("8999.00"),
            "stock_quantity": 5,
            "category": categories[1],
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
            "is_active": True,
        },
    ]

    products = []
    for prod_info in products_data:
        p, created = Product.objects.get_or_create(
            name=prod_info['name'],
            defaults=prod_info
        )
        products.append(p)

    print(f"Seeded {len(products)} products.")

    # 4. Create 25 Sample Orders
    statuses = ['completed', 'processing', 'pending', 'cancelled']
    current_orders_count = Order.objects.count()
    target_count = 25

    orders_to_create = target_count - current_orders_count
    if orders_to_create > 0:
        print(f"Creating {orders_to_create} new orders to reach 25 total orders...")
        for i in range(orders_to_create):
            status_choice = random.choice(statuses)

            # Pick 1 to 3 random products for each order
            selected_prods = random.sample(products, k=random.randint(1, min(3, len(products))))

            total_price = Decimal("0.00")

            order = Order.objects.create(
                customer=customer_user,
                status=status_choice,
                total_price=Decimal("0.00")
            )

            for prod in selected_prods:
                qty = random.randint(1, 2)
                unit_price = prod.price
                subtotal = unit_price * qty
                total_price += subtotal

                OrderItem.objects.create(
                    order=order,
                    product=prod,
                    quantity=qty,
                    unit_price_at_purchase=unit_price,
                    subtotal=subtotal
                )

            order.total_price = total_price
            order.save()

        print(f"Successfully seeded {orders_to_create} orders.")
    else:
        print(f"Already have {current_orders_count} orders (>= 25).")

    print(f"Total Orders in DB: {Order.objects.count()}")
    print("Database Seeding Completed Successfully!")

if __name__ == '__main__':
    seed()

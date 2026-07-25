import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiClient } from '../api/client';
import { getErrorMessage } from '../utils/errorHandler';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Package,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await apiClient.post('/orders/', payload);
      const order = res.data;
      clearCart();
      setSuccessOrder(order.id);
      toast.create({
        title: "Order Placed Successfully!",
        description: `Order confirmed for ₹${parseFloat(order.total_price).toFixed(2)}`,
        type: "success",
      });
    } catch (err) {
      let msg = getErrorMessage(err, 'Failed to place order due to stock constraints.');
      setErrorMessage(msg);
      toast.create({
        title: "Order Placement Failed",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = (product) => {
    removeFromCart(product.id);
    toast.create({
      title: "Item Removed",
      description: `Removed "${product.name}" from cart`,
      type: "info",
    });
  };

  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-coral-50 text-coral-500 rounded-3xl flex items-center justify-center mx-auto border border-coral-100 shadow-md animate-in zoom-in-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-charcoal-900">Order Placed Successfully!</h2>
          <p className="text-charcoal-700 text-sm leading-relaxed">
            Your order has been confirmed and inventory locked via atomic database transaction.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-4">
          <Button onClick={() => navigate('/orders')} className="rounded-2xl px-6 gap-2 font-bold shadow-md bg-coral-500 hover:bg-coral-600 text-cream-100">
            View Order History <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/products')} className="rounded-2xl px-6 font-bold border-cream-200 text-charcoal-700 bg-white">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream-200 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal-900 dark:text-neutral-100 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-coral-500" />
            Shopping Cart
          </h1>
          <p className="text-xs text-charcoal-700 dark:text-neutral-400 mt-1">Review selected inventory items before completing order</p>
        </div>
        {cart.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => navigate('/products')} className="gap-1.5 text-xs rounded-xl font-bold border-cream-200 dark:border-neutral-700 text-charcoal-700 dark:text-neutral-300 bg-white dark:bg-neutral-900">
            Add More Items
          </Button>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="rounded-2xl border border-coral-100 dark:border-coral-900/40 bg-coral-50 dark:bg-coral-950/40 text-coral-700 dark:text-coral-300">
          <AlertTriangle className="w-5 h-5 text-coral-600" />
          <div>
            <AlertTitle className="font-bold text-sm">Stock Constraint / Transaction Error</AlertTitle>
            <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
          </div>
        </Alert>
      )}

      {cart.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl space-y-4 border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <ShoppingBag className="w-16 h-16 text-charcoal-700/40 dark:text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-neutral-100">Your cart is empty</h2>
            <p className="text-charcoal-700 dark:text-neutral-400 text-xs">Browse our catalogue and select items to place an order.</p>
          </div>
          <Button onClick={() => navigate('/products')} className="rounded-2xl px-6 gap-2 font-bold shadow-md bg-coral-500 hover:bg-coral-600 text-cream-100">
            Explore Product Catalogue <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(({ product, quantity }) => (
              <Card key={product.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs hover:shadow-md transition-all rounded-2xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-cream-200/50 dark:bg-neutral-800/60 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-cream-200 dark:border-neutral-800">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-charcoal-700/40 dark:text-neutral-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-charcoal-900 dark:text-neutral-100 text-base line-clamp-1">{product.name}</h3>
                    <p className="text-charcoal-700 dark:text-neutral-400 text-xs font-medium">₹{product.price} each</p>
                    <Badge variant="outline" className="text-[10px] font-bold text-charcoal-700 dark:text-neutral-300 border-cream-200 dark:border-neutral-700">
                      Available Stock: {product.stock_quantity}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-cream-200 dark:border-neutral-800">
                  {/* Stepper */}
                  <div className="flex items-center space-x-2 border border-cream-200 dark:border-neutral-700 rounded-xl p-1 bg-cream-100 dark:bg-neutral-800">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-lg text-charcoal-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-700"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-bold text-charcoal-900 dark:text-neutral-100">{quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-lg text-charcoal-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-700"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-[10px] text-charcoal-700 dark:text-neutral-400 block font-medium">Subtotal</span>
                    <span className="font-black text-charcoal-900 dark:text-neutral-100 text-base">
                      ₹{(parseFloat(product.price) * quantity).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemove(product)}
                    className="text-charcoal-700 dark:text-neutral-300 hover:text-coral-600 rounded-xl hover:bg-coral-50 dark:hover:bg-coral-950/40"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <Card className="p-6 rounded-3xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-fit space-y-6 shadow-md">
            <h2 className="text-xl font-bold border-b border-cream-200 dark:border-neutral-800 pb-4 flex items-center gap-2 text-charcoal-900 dark:text-neutral-100">
              <Sparkles className="w-5 h-5 text-coral-500" /> Order Summary
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-charcoal-700 dark:text-neutral-400">
                <span>Subtotal ({cart.reduce((a, c) => a + c.quantity, 0)} items)</span>
                <span className="font-bold text-charcoal-900 dark:text-neutral-100">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal-700 dark:text-neutral-400 items-center">
                <span className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-coral-500" /> Atomic Stock Lock
                </span>
                <span className="text-coral-500 font-bold text-xs">Enabled</span>
              </div>
              <div className="border-t border-cream-200 dark:border-neutral-800 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-base text-charcoal-900 dark:text-neutral-100">Grand Total</span>
                <span className="font-black text-2xl text-coral-500 dark:text-white">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-6 text-base font-bold gap-2 rounded-2xl shadow-lg bg-coral-500 hover:bg-coral-600 text-cream-100 shadow-coral-500/20 hover:scale-[1.01] transition-all"
            >
              <span>{isSubmitting ? 'Processing Transaction...' : 'Place Order Now'}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

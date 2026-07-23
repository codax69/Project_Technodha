import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiClient } from '../api/client';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    } catch (err) {
      if (err.response?.data?.stock_error) {
        const errors = err.response.data.stock_error;
        setErrorMessage(Array.isArray(errors) ? errors.join(' ') : errors);
      } else if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else {
        setErrorMessage('Failed to place order due to stock constraints.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Order Placed Successfully!</h2>
        <p className="text-slate-400">
          Order <span className="text-sky-400 font-bold">#{successOrder}</span> has been confirmed and stock locked in database transaction.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/orders"
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl shadow-lg transition-all"
          >
            View Order History
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-sky-400" />
        Your Shopping Cart
      </h1>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-1">Transaction Conflict / Stock Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl space-y-4 border border-slate-800">
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto" />
          <h2 className="text-xl font-bold text-slate-300">Your cart is empty</h2>
          <p className="text-slate-500 text-sm">Browse our catalogue and select items to build your order.</p>
          <Link
            to="/products"
            className="inline-block mt-4 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl shadow-lg transition-all"
          >
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-800">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{product.name}</h3>
                    <p className="text-slate-400 text-xs">${product.price} each</p>
                    <p className="text-[11px] text-sky-400">Available Stock: {product.stock_quantity}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Subtotal</span>
                    <span className="font-bold text-white text-base">
                      ${(parseFloat(product.price) * quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 h-fit space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items Total</span>
                <span className="font-medium text-slate-200">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Stock Integrity Check</span>
                <span className="text-emerald-400 font-semibold">Active (Atomic)</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-base">
                <span className="font-bold text-white">Estimated Total</span>
                <span className="font-black text-2xl text-sky-400">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              * Final totals and unit prices are calculated strictly on the backend during transaction execution.
            </p>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Processing Transaction...' : 'Place Order Now'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

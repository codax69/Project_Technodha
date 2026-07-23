import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Package, Clock, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';

export const OrderHistory = () => {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState(null);

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/');
      if (Array.isArray(res.data)) return res.data;
      return res.data.results;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId) => {
      setCancellingId(orderId);
      const res = await apiClient.post(`/orders/${orderId}/cancel/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCancellingId(null);
    },
    onError: () => {
      setCancellingId(null);
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Pending</span>;
      case 'processing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">Processing</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C2C2C] tracking-tight">Order History</h1>
          <p className="text-slate-600 text-sm">View your placed orders and status updates</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card h-40 rounded-2xl animate-pulse bg-white" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className="text-rose-700 font-semibold">Failed to fetch order history.</p>
        </div>
      ) : !ordersData || ordersData.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl space-y-4 border border-slate-200 bg-white shadow-sm">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-[#2C2C2C]">No orders found</h2>
          <p className="text-slate-500 text-sm">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ordersData.map((order) => (
            <div
              key={order.id}
              className="glass-card p-6 rounded-3xl border border-slate-200 bg-white space-y-4 hover:border-[#FB6557]/30 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-[#2C2C2C]">Order #{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Placed on {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Price</span>
                    <span className="font-black text-xl text-[#FB6557]">${order.total_price}</span>
                  </div>

                  {order.status === 'pending' && (
                    <button
                      onClick={() => cancelMutation.mutate(order.id)}
                      disabled={cancellingId === order.id}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {cancellingId === order.id ? 'Restocking...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Line Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-[#FB6557] flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-[#2C2C2C]">{item.product_name}</p>
                          <p className="text-xs text-slate-500">
                            {item.quantity} × ${item.unit_price_at_purchase}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-[#2C2C2C]">${item.subtotal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

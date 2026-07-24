import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Package, Clock, XCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrderHistory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCancellingId(null);
      toast.create({
        title: "Order Cancelled",
        description: `Order #${variables} cancelled and stock restocked to inventory.`,
        type: "info",
      });
    },
    onError: (err) => {
      setCancellingId(null);
      toast.create({
        title: "Cancellation Failed",
        description: err.response?.data?.order || "Could not cancel order.",
        type: "error",
      });
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px]">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600 hover:bg-blue-700 font-bold text-[10px]">Processing</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="font-bold text-[10px]">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-600 font-bold text-[10px]">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream-200 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-charcoal-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-coral-500" /> Order History
          </h1>
          <p className="text-xs text-charcoal-700 mt-1">
            Track status updates and line item details ({ordersData?.length || 0} orders found)
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/products')} className="rounded-2xl gap-2 text-xs font-bold border-cream-200 text-charcoal-700 bg-white">
          Browse Catalogue <ArrowRight className="w-3.5 h-3.5 text-coral-500" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 rounded-3xl space-y-4 bg-white border border-cream-200">
              <Skeleton className="h-6 w-1/3 bg-cream-200" />
              <Skeleton className="h-16 w-full bg-cream-200" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center text-coral-700 text-sm font-semibold border-coral-100 bg-coral-50 rounded-3xl">
          <AlertCircle className="w-10 h-10 text-coral-600 mx-auto mb-2" />
          Failed to fetch your order history from server.
        </Card>
      ) : !ordersData || ordersData.length === 0 ? (
        <Card className="p-12 text-center rounded-3xl space-y-4 border border-cream-200 bg-white shadow-xs">
          <ShoppingBag className="w-16 h-16 text-charcoal-700/40 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-charcoal-900">No orders found</h2>
            <p className="text-charcoal-700 text-xs">You haven't placed any hardware orders yet.</p>
          </div>
          <Button onClick={() => navigate('/products')} className="rounded-2xl px-6 font-bold shadow-md bg-coral-500 hover:bg-coral-600 text-cream-100">
            Start Shopping
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {ordersData.map((order) => (
            <Card key={order.id} className="p-6 rounded-3xl border border-cream-200 bg-white space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-cream-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg text-charcoal-900">Order #{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-xs text-charcoal-700 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Placed on {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-charcoal-700 block font-medium">Total Amount</span>
                    <span className="font-black text-xl text-coral-500">₹{order.total_price}</span>
                  </div>

                  {order.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger render={
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={cancellingId === order.id}
                          className="border-coral-100 text-coral-600 hover:bg-coral-50 rounded-xl gap-1 text-xs font-bold bg-white"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {cancellingId === order.id ? 'Restocking...' : 'Cancel Order'}
                        </Button>
                      } />
                      <AlertDialogContent className="rounded-3xl bg-white border border-cream-200 text-charcoal-900">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-black text-charcoal-900">Cancel Order #{order.id}?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs leading-relaxed text-charcoal-700">
                            Are you sure you want to cancel this order? The reserved inventory stock will be immediately returned to the product catalogue.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-bold border-cream-200 text-charcoal-700 bg-white">Keep Order</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelMutation.mutate(order.id)}
                            className="bg-coral-600 hover:bg-coral-700 text-cream-100 rounded-xl font-bold"
                          >
                            Confirm Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              {/* Purchased Items Grid */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-extrabold uppercase text-charcoal-700 tracking-wider">Purchased Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl border border-cream-200 bg-cream-100 flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-500 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-charcoal-900 line-clamp-1">{item.product_name}</p>
                          <p className="text-xs text-charcoal-700 font-medium">
                            {item.quantity} × ₹{item.unit_price_at_purchase}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-charcoal-900">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};




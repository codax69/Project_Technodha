import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AdminPageLayout } from './components/AdminPageLayout';
import { ManageOrders } from './components/ManageOrders';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { ShoppingBag, Clock, Loader2, DollarSign } from 'lucide-react';

export const ManageOrdersPage = () => {
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/?limit=100');
      return res.data.results;
    },
  });

  const orderStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiClient.patch(`/orders/${id}/status/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;
  const processingOrders = orders?.filter((o) => o.status === 'processing').length || 0;
  const totalRevenue =
    orders
      ?.filter((o) => o.status !== 'cancelled')
      .reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0) || 0;

  return (
    <AdminPageLayout
      icon={<ShoppingBag className="w-6 h-6 text-primary" />}
      title="Manage Orders"
      description="Order fulfillment, status updates, and line item details"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Orders</CardDescription>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time placed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Pending</CardDescription>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Processing</CardDescription>
            <Loader2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">In fulfillment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Revenue</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Excludes cancelled orders</p>
          </CardContent>
        </Card>
      </div>

      <ManageOrders orders={orders} orderStatusMutation={orderStatusMutation} />
    </AdminPageLayout>
  );
};

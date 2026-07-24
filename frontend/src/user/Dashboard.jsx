import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, ShoppingBag, DollarSign, ArrowRight, LayoutDashboard, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/dashboard/');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32 rounded-2xl animate-pulse bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const customerData = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" /> Customer Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome back, <strong className="text-primary">{user?.username}</strong> ({user?.email})
          </p>
        </div>

        <Button onClick={() => navigate('/products')} className="rounded-xl gap-2 text-xs">
          Browse Catalogue <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-6 rounded-3xl border bg-card space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Orders Placed</span>
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <p className="text-3xl font-black text-foreground">{customerData?.total_orders || 0}</p>
        </Card>

        <Card className="p-6 rounded-3xl border bg-card space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-600">Total Spent</span>
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">₹{customerData?.total_spent || '0.00'}</p>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="p-6 rounded-3xl border bg-card space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Recent Orders</h3>
          <Link to="/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!customerData?.recent_orders || customerData.recent_orders.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No recent orders found.</p>
        ) : (
          <div className="space-y-3">
            {customerData?.recent_orders?.map((ord) => (
              <div key={ord.id} className="bg-muted/30 p-4 rounded-2xl border flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-foreground">Order #{ord.id}</span>
                  <span className="block text-xs text-muted-foreground">{new Date(ord.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground text-base">₹{ord.total_price}</span>
                  <span className="block">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {ord.status}
                    </Badge>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

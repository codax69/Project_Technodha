import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AdminPageLayout } from './components/AdminPageLayout';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import {
  Shield,
  Package,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AdminPanel = () => {
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await apiClient.get('/products/?limit=100');
      return res.data.results;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/products/categories/');
      if (res.data && 'results' in res.data) return res.data.results;
      return res.data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/?limit=100');
      return res.data.results;
    },
  });

  const totalRevenue =
    orders
      ?.filter((o) => o.status !== 'cancelled')
      .reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0) || 0;
  const lowStockCount = products?.filter((p) => p.is_low_stock).length || 0;

  const shortcuts = [
    {
      title: 'Product Management',
      description: 'Add, edit, and manage stock for products',
      icon: <Package className="w-5 h-5 text-primary" />,
      path: '/admin/products',
    },
    {
      title: 'Category Management',
      description: 'Organize your catalogue into categories',
      icon: <Layers className="w-5 h-5 text-primary" />,
      path: '/admin/categories',
    },
    {
      title: 'Manage Orders',
      description: 'Fulfill orders and update their status',
      icon: <ShoppingBag className="w-5 h-5 text-primary" />,
      path: '/admin/orders',
    },
  ];

  return (
    <AdminPageLayout
      icon={<Shield className="w-6 h-6 text-primary" />}
      title="Admin Dashboard"
      description="Overview of inventory, order fulfillment, and revenue metrics"
    >
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Products</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Revenue</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Cumulative earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Orders</CardDescription>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Placed customer orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Low Stock Items</CardDescription>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs restocking soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Analytics Chart */}
      <ChartAreaInteractive />

      {/* Shortcuts to dedicated management pages */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-3">Manage Your Store</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.path}
              to={shortcut.path}
              className="group p-4 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {shortcut.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{shortcut.title}</h3>
                  <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AdminPageLayout>
  );
};

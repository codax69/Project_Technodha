import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Package, AlertTriangle, ShoppingBag, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();

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
            <div key={i} className="glass-card h-32 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data?.role === 'admin') {
    const adminData = data;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Overview Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time inventory metrics, order statistics, and revenue tracking</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Products</span>
              <Package className="w-6 h-6 text-sky-400" />
            </div>
            <p className="text-3xl font-black text-white">{adminData.total_products}</p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-400">Low Stock (&lt; 5)</span>
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-amber-400">{adminData.low_stock_products}</p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Orders</span>
              <ShoppingBag className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-3xl font-black text-white">{adminData.total_orders}</p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400">Total Revenue</span>
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">${adminData.revenue}</p>
          </div>
        </div>

        {/* Orders Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Orders Breakdown by Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(adminData.orders_by_status || {}).map(([status, count]) => (
              <div key={status} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase">{status}</span>
                <p className="text-2xl font-bold text-white mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const customerData = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Dashboard</h1>
        <p className="text-slate-400 text-sm">Welcome back, <span className="text-sky-400 font-bold">{user?.username}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Orders Placed</span>
            <ShoppingBag className="w-6 h-6 text-sky-400" />
          </div>
          <p className="text-3xl font-black text-white">{customerData?.total_orders || 0}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-400">Total Spent</span>
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">${customerData?.total_spent || '0.00'}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Recent Orders</h3>
          <Link to="/orders" className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {customerData?.recent_orders?.map((ord) => (
            <div key={ord.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white text-sm">Order #{ord.id}</span>
                <span className="block text-xs text-slate-500">{new Date(ord.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white text-base">${ord.total_price}</span>
                <span className="block text-[11px] uppercase font-bold text-sky-400">{ord.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

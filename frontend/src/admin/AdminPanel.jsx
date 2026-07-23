import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { ProductManagement } from './components/ProductManagement';
import { CategoryManagement } from './components/CategoryManagement';
import { ManageOrders } from './components/ManageOrders';
import {
  Shield,
  Package,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';

export const AdminPanel = ({ initialTab }) => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = () => {
    if (location.pathname.includes('/categories')) return 'categories';
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/products')) return 'products';
    return initialTab || 'products';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  // Queries
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await apiClient.get('/products/');
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
      const res = await apiClient.get('/orders/');
      return res.data.results;
    },
  });

  // Calculated metrics
  const totalRevenue = orders?.reduce((acc, curr) => acc + parseFloat(curr.total_price || 0), 0) || 0;
  const lowStockCount = products?.filter((p) => p.stock_quantity < 5).length || 0;

  // Product Create/Update Mutation
  const productMutation = useMutation({
    mutationFn: async (payload) => {
      if (payload.id) {
        return apiClient.put(`/products/${payload.id}/`, payload);
      }
      return apiClient.post('/products/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Product Delete Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/products/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Stock Direct Update Mutation
  const stockMutation = useMutation({
    mutationFn: async ({ id, stock_quantity }) => {
      return apiClient.post(`/products/${id}/stock/`, { stock_quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Category Create Mutation
  const categoryMutation = useMutation({
    mutationFn: async (name) => {
      return apiClient.post('/products/categories/', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  // Category Update Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      return apiClient.put(`/products/categories/${id}/`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  // Category Delete Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/products/categories/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  // Order Status Update Mutation
  const orderStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiClient.patch(`/orders/${id}/status/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-[calc(100vh-4rem)] w-full bg-background text-foreground">
        <AppSidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        <SidebarInset className="flex flex-col flex-1">
          <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto">
            {/* Header Title with SidebarTrigger & Navigation Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-foreground hover:bg-accent border p-2 rounded-lg" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Admin Operations Panel
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Full CRUD product inventory, category controls, and order status fulfillment
                  </p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-3 w-full sm:w-[360px]">
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

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
                  <p className="text-xs text-muted-foreground mt-1">Stock quantity &lt; 5</p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Analytics Chart */}
            <ChartAreaInteractive />

            {/* Dynamic Active Tab View */}
            {activeTab === 'products' && (
              <ProductManagement
                products={products}
                categories={categories}
                productMutation={productMutation}
                stockMutation={stockMutation}
                deleteProductMutation={deleteProductMutation}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManagement
                categories={categories}
                categoryMutation={categoryMutation}
                updateCategoryMutation={updateCategoryMutation}
                deleteCategoryMutation={deleteCategoryMutation}
              />
            )}

            {activeTab === 'orders' && (
              <ManageOrders
                orders={orders}
                orderStatusMutation={orderStatusMutation}
              />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

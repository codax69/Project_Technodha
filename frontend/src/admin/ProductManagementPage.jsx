import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AdminPageLayout } from './components/AdminPageLayout';
import { ProductManagement } from './components/ProductManagement';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Package, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const ProductManagementPage = () => {
  const queryClient = useQueryClient();

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

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/products/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const stockMutation = useMutation({
    mutationFn: async ({ id, stock_quantity }) => {
      return apiClient.post(`/products/${id}/stock/`, { stock_quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p) => p.is_active).length || 0;
  const lowStockCount = products?.filter((p) => p.is_low_stock).length || 0;
  const outOfStockCount = products?.filter((p) => p.is_out_of_stock).length || 0;

  return (
    <AdminPageLayout
      icon={<Package className="w-6 h-6 text-primary" />}
      title="Product Management"
      description="Full CRUD product inventory, stock control, and product image uploads"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Products</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">All catalogue items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Active Products</CardDescription>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Visible to customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Low Stock</CardDescription>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Nearing depletion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Out of Stock</CardDescription>
            <XCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs restocking</p>
          </CardContent>
        </Card>
      </div>

      <ProductManagement
        products={products}
        categories={categories}
        productMutation={productMutation}
        stockMutation={stockMutation}
        deleteProductMutation={deleteProductMutation}
      />
    </AdminPageLayout>
  );
};

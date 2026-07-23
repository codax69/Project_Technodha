import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AdminPageLayout } from './components/AdminPageLayout';
import { CategoryManagement } from './components/CategoryManagement';
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { Layers, Package, PackageX } from 'lucide-react';

export const CategoryManagementPage = () => {
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/products/categories/');
      if (res.data && 'results' in res.data) return res.data.results;
      return res.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await apiClient.get('/products/?limit=100');
      return res.data.results;
    },
  });

  const categoryMutation = useMutation({
    mutationFn: async (name) => {
      return apiClient.post('/products/categories/', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      return apiClient.put(`/products/categories/${id}/`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.delete(`/products/categories/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const totalCategories = categories?.length || 0;
  const totalProducts = products?.length || 0;
  const emptyCategories = categories?.filter(
    (cat) => !products?.some((p) => p.category === cat.id)
  ).length || 0;

  return (
    <AdminPageLayout
      icon={<Layers className="w-6 h-6 text-primary" />}
      title="Category Management"
      description="Create, update, or remove product categories"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Categories</CardDescription>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground mt-1">Active catalogue groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Total Products</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-medium">Empty Categories</CardDescription>
            <PackageX className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{emptyCategories}</div>
            <p className="text-xs text-muted-foreground mt-1">No products assigned yet</p>
          </CardContent>
        </Card>
      </div>

      <CategoryManagement
        categories={categories}
        categoryMutation={categoryMutation}
        updateCategoryMutation={updateCategoryMutation}
        deleteCategoryMutation={deleteCategoryMutation}
      />
    </AdminPageLayout>
  );
};

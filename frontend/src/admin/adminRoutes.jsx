import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLogin } from './AdminLogin';
import { AdminPanel } from './AdminPanel';
import { ProductManagementPage } from './ProductManagementPage';
import { CategoryManagementPage } from './CategoryManagementPage';
import { ManageOrdersPage } from './ManageOrdersPage';

export const AdminRoutes = (
  <>
    {/* Admin Routes */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Admin Protected Routes - each section is its own full page */}
    <Route element={<ProtectedRoute requiredRole="admin" />}>
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/products" element={<ProductManagementPage />} />
      <Route path="/admin/categories" element={<CategoryManagementPage />} />
      <Route path="/admin/orders" element={<ManageOrdersPage />} />
    </Route>
  </>
);

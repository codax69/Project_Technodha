import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from './Login';
import { Register } from './Register';
import { ProductCatalogue } from './ProductCatalogue';
import { CartPage } from './CartPage';
import { OrderHistory } from './OrderHistory';
import { Dashboard } from './Dashboard';

export const UserRoutes = (
  <>
    {/* Public Routes */}
    <Route path="/" element={<ProductCatalogue />} />
    <Route path="/products" element={<ProductCatalogue />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Customer Protected Routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>
  </>
);

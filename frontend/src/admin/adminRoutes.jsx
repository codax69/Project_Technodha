import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLogin } from './AdminLogin';
import { AdminPanel } from './AdminPanel';

export const AdminRoutes = (
  <>
    {/* Admin Routes */}
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Admin Protected Routes */}
    <Route element={<ProtectedRoute requiredRole="admin" />}>
      <Route path="/admin" element={<AdminPanel />} />
    </Route>
  </>
);

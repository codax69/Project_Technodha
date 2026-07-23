import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requiredRole }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If unauthenticated
  if (!user) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // If admin role is required but current user is not admin
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/products" replace />;
  }

  // Generic role requirement check
  if (requiredRole && user.role !== requiredRole && !isAdmin) {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
};

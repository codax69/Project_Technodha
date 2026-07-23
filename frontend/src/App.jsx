import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProductCatalogue } from './pages/ProductCatalogue';
import { CartPage } from './pages/CartPage';
import { OrderHistory } from './pages/OrderHistory';
import { AdminPanel } from './pages/AdminPanel';
import { Dashboard } from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
              <Navbar />
              <main className="flex-1 pb-12">
                <Routes>
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

                  {/* Admin Protected Routes */}
                  <Route element={<ProtectedRoute requiredRole="admin" />}>
                    <Route path="/admin" element={<AdminPanel />} />
                  </Route>

                  {/* Fallback Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

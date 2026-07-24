import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toast';
import { Navbar } from './components/Navbar';
import { UserRoutes } from './user/userRoutes';
import { AdminRoutes } from './admin/adminRoutes';
import { NotFound } from './components/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const routeTitles = {
  '/': 'Technodha - Next-Gen Tech Hardware',
  '/products': 'Product Catalogue - Technodha',
  '/login': 'Sign In - Technodha',
  '/register': 'Create Account - Technodha',
  '/cart': 'Shopping Cart - Technodha',
  '/orders': 'My Orders - Technodha',
  '/admin/login': 'Admin Sign In - Technodha',
  '/admin': 'Admin Dashboard - Technodha',
  '/admin/products': 'Product Management - Technodha Admin',
  '/admin/categories': 'Category Management - Technodha Admin',
  '/admin/orders': 'Order Management - Technodha Admin',
};

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/products/') && pathname !== '/products') {
      document.title = 'Product Details - Technodha';
    } else {
      document.title = routeTitles[pathname] || 'Page Not Found - Technodha';
    }
  }, [location]);

  return null;
};

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 dark:bg-neutral-950 text-charcoal-900 dark:text-neutral-100 transition-colors duration-300">
      <PageTitleUpdater />
      <Navbar />
      <main className={`flex-1 ${isAdmin ? '' : 'pb-12'}`}>
        <Routes>
          {UserRoutes}
          {AdminRoutes}
          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster>
                <Router>
                  <AppLayout />
                </Router>
              </Toaster>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

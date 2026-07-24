import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster>
                <Router>
                  <div className="min-h-screen flex flex-col bg-cream-100 dark:bg-neutral-950 text-charcoal-900 dark:text-neutral-100 transition-colors duration-300">
                    <Navbar />
                    <main className="flex-1 pb-12">
                      <Routes>
                        {UserRoutes}
                        {AdminRoutes}
                        {/* 404 Catch-all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
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

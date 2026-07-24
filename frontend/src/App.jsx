import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
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
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster>
              <Router>
                <div className="min-h-screen flex flex-col bg-[#FBFBF8] text-[#2C2C2C]">
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
    </QueryClientProvider>
  );
};

export default App;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home, Package } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-lg relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-coral-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-coral-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* 404 Icon & Badge */}
          <div className="w-20 h-20 bg-coral-50 text-coral-500 rounded-3xl flex items-center justify-center mx-auto border border-coral-100 shadow-sm animate-bounce">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-5xl font-black tracking-tight text-coral-500 block">404</span>
            <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Page Not Found</h1>
            <p className="text-xs text-charcoal-700 leading-relaxed font-medium">
              The requested inventory page or route does not exist or may have been relocated.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto rounded-2xl px-5 gap-2 font-bold shadow-md bg-coral-500 hover:bg-coral-600 text-cream-100"
            >
              <Home className="w-4 h-4" /> Go to Homepage
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="w-full sm:w-auto rounded-2xl px-5 gap-2 font-bold border-cream-200 text-charcoal-700 bg-white hover:bg-cream-200/50"
            >
              <Package className="w-4 h-4 text-coral-500" /> Browse Catalogue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

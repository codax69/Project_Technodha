import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Package, LayoutDashboard, LogOut, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoFailed, setLogoFailed] = useState(false);

  // Remove top navbar on all admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 border-b backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 group">
            {!logoFailed ? (
              <img
                src="/technodha_logo.webp"
                alt="TECHNODHA Logo"
                onError={() => setLogoFailed(true)}
                className="h-7 w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-xs">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/products"
              className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              Catalogue
            </Link>

            {user && (
              <Link
                to="/orders"
                className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                Orders
              </Link>
            )}

            {user && (
              <Link
                to="/dashboard"
                className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 border border-primary/30 rounded-md transition-colors flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative p-1.5 rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-all border"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-semibold text-foreground leading-none">{user.username}</span>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                  isAdmin ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' : 'bg-primary/10 text-primary border border-primary/30'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-xs transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

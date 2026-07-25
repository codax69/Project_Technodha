import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Logo } from './Logo';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Package,
  LayoutDashboard,
  LogOut,
  Shield,
  Home,
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoFailed, setLogoFailed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide top navbar completely on all admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    toast.create({
      title: "Signed Out",
      description: "Successfully logged out of your account.",
      type: "info",
    });
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-cream-200 dark:border-neutral-800 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Desktop Navigation */}
        <div className="flex items-center space-x-8">
          <Logo subname="Store"/>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-cream-200/50 dark:bg-neutral-800/60 p-1 rounded-2xl border border-cream-200 dark:border-neutral-800">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-white dark:bg-neutral-900 text-coral-500 font-bold shadow-xs border border-cream-200 dark:border-neutral-800'
                  : 'text-charcoal-700 dark:text-neutral-300 hover:text-charcoal-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </Link>

            <Link
              to="/products"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive('/products')
                  ? 'bg-white dark:bg-neutral-900 text-coral-500 font-bold shadow-xs border border-cream-200 dark:border-neutral-800'
                  : 'text-charcoal-700 dark:text-neutral-300 hover:text-charcoal-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Catalogue
            </Link>

            {user && (
              <Link
                to="/orders"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive('/orders')
                    ? 'bg-white dark:bg-neutral-900 text-coral-500 font-bold shadow-xs border border-cream-200 dark:border-neutral-800'
                    : 'text-charcoal-700 dark:text-neutral-300 hover:text-charcoal-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-neutral-800/60'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> My Orders
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-coral-50 dark:bg-coral-950/40 text-coral-600 dark:text-coral-400 border border-coral-100 dark:border-coral-900/40 hover:bg-coral-100 dark:hover:bg-coral-900/60 transition-all flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-coral-500" /> Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions: Theme Toggle, Cart & User Account Menu */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {/* Cart Button */}
          <Link to="/cart">
            <Button
              variant="outline"
              size="sm"
              className="relative rounded-2xl gap-2 px-3.5 py-1.5 bg-white dark:bg-neutral-900 border-cream-200 dark:border-neutral-800 hover:border-coral-500 shadow-xs hover:shadow-sm text-charcoal-900 dark:text-neutral-100 transition-all font-bold"
            >
              <ShoppingCart className="w-4 h-4 text-coral-500" />
              <span className="hidden sm:inline text-xs">Cart</span>
              {totalItems > 0 && (
                <Badge className="bg-coral-500 text-cream-100 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs animate-in zoom-in-50">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Account Dropdown or Sign In Actions */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-2xl gap-2.5 font-semibold text-xs border border-cream-200 dark:border-neutral-800 hover:bg-cream-200/50 dark:hover:bg-neutral-800 px-3 py-1.5 text-charcoal-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 flex items-center shadow-xs cursor-pointer outline-none transition-colors">
                <div className="w-6 h-6 rounded-full bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center font-bold text-[10px]">
                  {user.username ? user.username.substring(0, 2).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate">{user.username}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl border border-cream-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-charcoal-900 dark:text-neutral-100">
                <DropdownMenuLabel className="font-normal px-2.5 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-charcoal-900 dark:text-neutral-100">{user.username}</p>
                    <p className="text-xs text-charcoal-700 dark:text-neutral-400 leading-none truncate">
                      {user.email || 'customer@technodha.com'}
                    </p>
                    <div className="pt-1.5">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-coral-500 border-coral-100 dark:border-coral-900/40 bg-coral-50 dark:bg-coral-950/40">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cream-200 dark:bg-neutral-800" />

                <DropdownMenuItem onClick={() => navigate('/products')} className="rounded-xl cursor-pointer text-charcoal-700 dark:text-neutral-300 hover:text-coral-500 dark:hover:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950/40">
                  <Package className="w-4 h-4 mr-2 text-coral-500" /> Product Catalogue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded-xl cursor-pointer text-charcoal-700 dark:text-neutral-300 hover:text-coral-500 dark:hover:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950/40">
                  <ShoppingBag className="w-4 h-4 mr-2 text-coral-500" /> Order History
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-cream-200 dark:bg-neutral-800" />
                    <DropdownMenuItem
                      onClick={() => navigate('/admin')}
                      className="rounded-xl cursor-pointer font-bold text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950/40"
                    >
                      <Shield className="w-4 h-4 mr-2 text-coral-500" /> Admin Operations
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-cream-200 dark:bg-neutral-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl text-coral-700 dark:text-coral-300 hover:bg-coral-50 dark:hover:bg-coral-950/40 cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs font-semibold text-charcoal-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="rounded-xl text-xs font-bold shadow-md bg-coral-500 hover:bg-coral-600 text-cream-100 gap-1"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
          )}

          {/* Mobile Navigation Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden rounded-xl text-charcoal-700 dark:text-neutral-300 hover:bg-cream-200 dark:hover:bg-neutral-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-200 dark:border-neutral-800 bg-cream-100 dark:bg-neutral-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
              isActive('/') && location.pathname === '/'
                ? 'bg-coral-50 dark:bg-coral-950/40 text-coral-500 font-bold'
                : 'hover:bg-cream-200 dark:hover:bg-neutral-800 text-charcoal-700 dark:text-neutral-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Home
            </span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </Link>

          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
              isActive('/products')
                ? 'bg-coral-50 dark:bg-coral-950/40 text-coral-500 font-bold'
                : 'hover:bg-cream-200 dark:hover:bg-neutral-800 text-charcoal-700 dark:text-neutral-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" /> Catalogue
            </span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </Link>

          {user && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                isActive('/orders')
                  ? 'bg-coral-50 dark:bg-coral-950/40 text-coral-500 font-bold'
                  : 'hover:bg-cream-200 dark:hover:bg-neutral-800 text-charcoal-700 dark:text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> My Orders
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl text-sm font-bold bg-coral-50 dark:bg-coral-950/40 text-coral-600 dark:text-coral-400 border border-coral-100 dark:border-coral-900/40 hover:bg-coral-100 dark:hover:bg-coral-900/60 transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-coral-500" /> Admin Panel
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          )}
        </div>
      )}
    </header>
  );

};


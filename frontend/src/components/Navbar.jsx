import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
    <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-xl border-b border-cream-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Desktop Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex flex-col items-end justify-center group">
            {!logoFailed ? (
              <img
                src="/technodha_logo.webp"
                alt="TECHNODHA Logo"
                loading="lazy"
                onError={() => setLogoFailed(true)}
                className="h-6 sm:h-7 w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-coral-500 flex items-center justify-center shadow-xs text-cream-100 font-black">
                <Package className="w-4 h-4" />
              </div>
            )}
            <span className="text-[8px] sm:text-[9px] font-extrabold tracking-wider text-coral-500 uppercase mt-0.5 leading-none">
              Inventory & Store
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-cream-200/50 p-1 rounded-2xl border border-cream-200">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-white text-coral-500 font-bold shadow-xs border border-cream-200'
                  : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </Link>

            <Link
              to="/products"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive('/products')
                  ? 'bg-white text-coral-500 font-bold shadow-xs border border-cream-200'
                  : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-white/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Catalogue
            </Link>

            {user && (
              <Link
                to="/orders"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive('/orders')
                    ? 'bg-white text-coral-500 font-bold shadow-xs border border-cream-200'
                    : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-white/60'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" /> My Orders
              </Link>
            )}



            {isAdmin && (
              <Link
                to="/admin"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-coral-50 text-coral-600 border border-coral-100 hover:bg-coral-100 transition-all flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-coral-500" /> Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions: Cart & User Account Menu */}
        <div className="flex items-center space-x-3">
          {/* Cart Button */}
          <Link to="/cart">
            <Button
              variant="outline"
              size="sm"
              className="relative rounded-2xl gap-2 px-3.5 py-1.5 bg-white border-cream-200 hover:border-coral-500 shadow-xs hover:shadow-sm text-charcoal-900 transition-all font-bold"
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
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-2xl gap-2.5 font-semibold text-xs border border-cream-200 hover:bg-cream-200/50 px-3 py-1.5 text-charcoal-900 bg-white"
                  >
                    <div className="w-6 h-6 rounded-full bg-coral-50 text-coral-500 flex items-center justify-center font-bold text-[10px]">
                      {user.username ? user.username.substring(0, 2).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="hidden sm:inline max-w-[110px] truncate">{user.username}</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 shadow-xl border border-cream-200 bg-white">
                <DropdownMenuLabel className="font-normal px-2.5 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-charcoal-900">{user.username}</p>
                    <p className="text-xs text-charcoal-700 leading-none truncate">
                      {user.email || 'customer@technodha.com'}
                    </p>
                    <div className="pt-1.5">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-coral-500 border-coral-100 bg-coral-50">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cream-200" />

                <DropdownMenuItem onClick={() => navigate('/products')} className="rounded-xl cursor-pointer text-charcoal-700 hover:text-coral-500 hover:bg-coral-50">
                  <Package className="w-4 h-4 mr-2 text-coral-500" /> Product Catalogue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded-xl cursor-pointer text-charcoal-700 hover:text-coral-500 hover:bg-coral-50">
                  <ShoppingBag className="w-4 h-4 mr-2 text-coral-500" /> Order History
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-cream-200" />
                    <DropdownMenuItem
                      onClick={() => navigate('/admin')}
                      className="rounded-xl cursor-pointer font-bold text-coral-600 hover:bg-coral-50"
                    >
                      <Shield className="w-4 h-4 mr-2 text-coral-500" /> Admin Operations
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-cream-200" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl text-coral-700 hover:bg-coral-50 cursor-pointer font-medium"
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
                className="rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-200"
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
            className="md:hidden rounded-xl text-charcoal-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-200 bg-cream-100 px-4 py-4 space-y-2 animate-in slide-in-from-top-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              isActive('/') && location.pathname === '/' ? 'bg-coral-50 text-coral-500 font-bold' : 'hover:bg-cream-200 text-charcoal-700'
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
            className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              isActive('/products') ? 'bg-coral-50 text-coral-500 font-bold' : 'hover:bg-cream-200 text-charcoal-700'
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
              className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                isActive('/orders') ? 'bg-coral-50 text-coral-500 font-bold' : 'hover:bg-cream-200 text-charcoal-700'
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
              className="px-3.5 py-2.5 rounded-xl text-sm font-bold bg-coral-50 text-coral-600 border border-coral-100 flex items-center justify-between"
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


import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Package, LayoutDashboard, LogOut, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-sky-400">
                TECHNODHA
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-sky-400 font-semibold">
                Inventory & Orders
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/products"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Catalogue
            </Link>

            {user && (
              <Link
                to="/orders"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Orders
              </Link>
            )}

            {user && (
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-sky-400" />
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-sm font-medium text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border border-sky-500/20 transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-all border border-slate-700/50"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/50">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="block text-sm font-semibold text-slate-200">{user.username}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
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

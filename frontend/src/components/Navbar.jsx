import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Package, LayoutDashboard, LogOut, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF8]/90 border-b border-[#2C2C2C]/10 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-3 group">
            {!logoFailed ? (
              <img
                src="/technodha_logo.webp"
                alt="TECHNODHA Logo"
                onError={() => setLogoFailed(true)}
                className="h-10 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#FB6557] flex items-center justify-center shadow-lg shadow-[#FB6557]/20 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6 text-[#FBFBF8]" />
              </div>
            )}
            {/* <div>
              <span className="font-bold text-xl tracking-tight text-[#2C2C2C]">
                TECHNODHA
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#FB6557] font-semibold">
                Inventory & Orders
              </span>
            </div> */}
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/products"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#2C2C2C]/80 hover:text-[#2C2C2C] hover:bg-[#2C2C2C]/5 transition-colors"
            >
              Catalogue
            </Link>

            {user && (
              <Link
                to="/orders"
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#2C2C2C]/80 hover:text-[#2C2C2C] hover:bg-[#2C2C2C]/5 transition-colors"
              >
                Orders
              </Link>
            )}

            {user && (
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#2C2C2C]/80 hover:text-[#2C2C2C] hover:bg-[#2C2C2C]/5 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FB6557]" />
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#FB6557] hover:bg-[#FB6557]/10 border border-[#FB6557]/30 transition-colors flex items-center gap-1.5"
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
              className="relative p-2 rounded-xl bg-[#2C2C2C]/5 hover:bg-[#2C2C2C]/10 text-[#2C2C2C] transition-all border border-[#2C2C2C]/10"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FB6557] text-[#FBFBF8] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-[#FB6557]/40">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-[#2C2C2C]/10">
              <div className="text-right hidden sm:block">
                <span className="block text-sm font-semibold text-[#2C2C2C]">{user.username}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' : 'bg-[#FB6557]/10 text-[#FB6557] border border-[#FB6557]/30'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#2C2C2C]/60 hover:text-[#FB6557] hover:bg-[#FB6557]/10 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-[#2C2C2C]/80 hover:text-[#2C2C2C] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-[#FB6557] hover:bg-[#e05345] text-[#FBFBF8] rounded-xl shadow-md shadow-[#FB6557]/30 transition-all hover:scale-[1.02]"
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

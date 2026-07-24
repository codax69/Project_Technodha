import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import {
  Package,
  ShieldCheck,
  Zap,
  Truck,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowRight,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-cream-200 dark:border-neutral-800 text-charcoal-900 dark:text-neutral-200 transition-colors">
      {/* Top Feature Bar */}
      <div className="border-b border-cream-200 dark:border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Atomic Stock Lock</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Real-time DB reservation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">100% Genuine</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Verified factory hardware</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Express Delivery</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Fast insured dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">₹ INR Pricing</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Transparent catalog prices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand Info */}
        <div className="md:col-span-4 space-y-4">
          <Link to="/" className="inline-block">
            <Logo size="md" />
          </Link>
          <p className="text-xs text-charcoal-700 dark:text-neutral-400 leading-relaxed max-w-sm">
            Technodha is an advanced inventory, order execution, and hardware retail storefront built with precision real-time stock tracking.
          </p>
          <div className="flex items-center gap-3 text-xs text-charcoal-700 dark:text-neutral-400 pt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coral-500" />
              <span>Tech Hub, India</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-coral-500" />
              <span>support@technodha.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 dark:text-neutral-100">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Home Page
              </Link>
            </li>
            <li>
              <Link to="/products" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Product Catalogue
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Order History
              </Link>
            </li>
          </ul>
        </div>

        {/* Popular Categories */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 dark:text-neutral-100">
            Hardware Categories
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/products?category__slug=processors" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Processors & CPUs
              </Link>
            </li>
            <li>
              <Link to="/products?category__slug=graphics-cards" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Graphics Cards & GPUs
              </Link>
            </li>
            <li>
              <Link to="/products?category__slug=monitors" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Monitors & Display
              </Link>
            </li>
            <li>
              <Link to="/products?category__slug=storage" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                SSD & High-Speed Storage
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Account */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 dark:text-neutral-100">
            Account & Support
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/login" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                Create Account
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="text-charcoal-700/60 dark:text-neutral-500 hover:text-coral-500 transition-colors">
                Admin Portal →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream-200 dark:border-neutral-800 py-4 bg-cream-100/50 dark:bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-700 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Technodha Inventory & Retail System. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Crafted for <span className="font-bold text-coral-500">Project Technodha</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

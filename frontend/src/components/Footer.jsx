import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import {
  Package,
  ShieldCheck,
  Zap,
  Truck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Send,
  User,
  LogOut,
  Shield,
  ShoppingBag,
} from 'lucide-react';

export const Footer = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Fetch Live Product Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/products/categories/');
      if (res.data && 'results' in res.data) return res.data.results;
      return res.data;
    },
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setSubscribed(true);
    toast.create({
      title: "Subscribed to Newsletter!",
      description: `Thank you for joining! Deal updates will be sent to ${newsletterEmail}`,
      type: "success",
    });
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-cream-200 dark:border-neutral-800 text-charcoal-900 dark:text-neutral-200 transition-colors relative">
      {/* Top Feature Highlights Bar */}
      <div className="border-b border-cream-200 dark:border-neutral-800 py-6 bg-cream-50/50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0 border border-coral-100 dark:border-coral-900/40">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Atomic Stock Lock</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Real-time DB reservation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0 border border-coral-100 dark:border-coral-900/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">100% Genuine</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Verified hardware parts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0 border border-coral-100 dark:border-coral-900/40">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">Express Delivery</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Fast insured dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-coral-50 dark:bg-coral-950/40 text-coral-500 flex items-center justify-center flex-shrink-0 border border-coral-100 dark:border-coral-900/40">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-charcoal-900 dark:text-neutral-100">₹ INR Pricing</h5>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400">Transparent prices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand Info & Newsletter */}
        <div className="md:col-span-4 space-y-4">
          <div className="inline-block">
            <Logo size="md" subname="Store" />
          </div>
          <p className="text-xs text-charcoal-700 dark:text-neutral-400 leading-relaxed">
            Technodha is an inventory management and retail storefront system with instant transactional ordering and stock tracking.
          </p>

          {/* Interactive Newsletter Signup Form */}
          <div className="pt-2 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-coral-500" /> Subscribe for Deals
            </h5>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                required
                placeholder="Enter your email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-cream-100 dark:bg-neutral-800 border-cream-200 dark:border-neutral-700 text-xs rounded-xl focus:ring-1 focus:ring-coral-500"
              />
              <Button type="submit" size="sm" className="rounded-xl font-bold bg-coral-500 hover:bg-coral-600 text-cream-100 gap-1 flex-shrink-0">
                {subscribed ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-700 dark:text-neutral-400 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-coral-500" />
              <span>Tech Hub, India</span>
            </div>
            <a href="mailto:support@technodha.com" className="flex items-center gap-1.5 hover:text-coral-500 transition-colors">
              <Mail className="w-4 h-4 text-coral-500" />
              <span>support@technodha.com</span>
            </a>
          </div>
        </div>

        {/* Quick Navigation Links */}
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
            {user && (
              <li>
                <Link to="/orders" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors">
                  Order History
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Live Hardware Categories from API */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 dark:text-neutral-100">
            Live Categories
          </h4>
          <ul className="space-y-2 text-xs">
            {categories && categories.length > 0 ? (
              categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category__slug=${cat.slug}`}
                    className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 dark:hover:text-coral-400 transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-40" />
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link to="/products" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 transition-colors">
                    Processors & CPUs
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 transition-colors">
                    Graphics Cards & GPUs
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-charcoal-700 dark:text-neutral-400 hover:text-coral-500 transition-colors">
                    High-Speed SSD Storage
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Customer Account & Support */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 dark:text-neutral-100">
            Account Access
          </h4>
          {user ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-charcoal-900 dark:text-neutral-100 font-bold">
                <User className="w-3.5 h-3.5 text-coral-500" />
                <span className="truncate">{user.username}</span>
              </div>
              <p className="text-[11px] text-charcoal-700 dark:text-neutral-400 uppercase font-semibold">{user.role}</p>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 font-bold text-coral-500 hover:underline pt-1"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Dashboard
                </Link>
              )}

              <button
                onClick={logout}
                className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline pt-2 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
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
                <Link to="/admin/login" className="text-charcoal-700/60 dark:text-neutral-500 hover:text-coral-500 transition-colors flex items-center gap-1">
                  Admin Portal →
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Bottom Legal & Back to Top Bar */}
      <div className="border-t border-cream-200 dark:border-neutral-800 py-4 bg-cream-100/50 dark:bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-700 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Technodha Inventory System. All rights reserved.</p>
          
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1 text-[11px]">
              Crafted for <span className="font-bold text-coral-500">Project Technodha</span>
            </p>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-cream-200 dark:border-neutral-700 hover:border-coral-500 text-charcoal-900 dark:text-neutral-100 transition-all flex items-center gap-1 text-[11px] font-bold shadow-xs cursor-pointer"
              title="Scroll back to top"
            >
              <ArrowUp className="w-3.5 h-3.5 text-coral-500" /> Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

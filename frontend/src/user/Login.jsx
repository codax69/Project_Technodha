import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';

import { getErrorMessage } from '../utils/errorHandler';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/login/', data);
      const { access, refresh, user } = res.data;
      login(access, refresh, user);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid username or password.'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-xl border border-cream-200 dark:border-neutral-800 space-y-6 relative overflow-hidden bg-white dark:bg-neutral-900 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <Logo subname="Store" showSubtitle={true} />
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-neutral-100 tracking-tight">Welcome Back</h2>
          <p className="text-charcoal-700 dark:text-neutral-400 text-sm">Sign in to manage inventory or place orders</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-900 dark:text-neutral-200 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3.5 top-3.5 text-charcoal-700/50 dark:text-neutral-500" />
              <input
                {...register('username')}
                type="text"
                placeholder="enter username"
                className="w-full bg-cream-100 dark:bg-neutral-800 border border-cream-200 dark:border-neutral-700 focus:border-coral-500 focus:ring-1 focus:ring-coral-500 rounded-xl pl-11 pr-4 py-3 text-charcoal-900 dark:text-neutral-100 placeholder-charcoal-700/40 dark:placeholder-neutral-500 text-sm outline-none transition-all"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-rose-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-900 dark:text-neutral-200 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-charcoal-700/50 dark:text-neutral-500" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-cream-100 dark:bg-neutral-800 border border-cream-200 dark:border-neutral-700 focus:border-coral-500 focus:ring-1 focus:ring-coral-500 rounded-xl pl-11 pr-4 py-3 text-charcoal-900 dark:text-neutral-100 placeholder-charcoal-700/40 dark:placeholder-neutral-500 text-sm outline-none transition-all"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-coral-500 hover:bg-coral-600 text-cream-100 font-semibold rounded-xl shadow-lg shadow-coral-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-sm text-charcoal-700 dark:text-neutral-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-coral-500 font-medium hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

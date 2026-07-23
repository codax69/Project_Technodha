import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { Lock, User as UserIcon, Mail, Shield, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['customer', 'admin']),
});

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await apiClient.post('/auth/register/', data);
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        const fieldErrors = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(fieldErrors || 'Registration failed.');
      } else {
        setError('Failed to register account.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-sm">Join Technodha Platform as Admin or Customer</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                {...register('username')}
                type="text"
                placeholder="johndoe"
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-rose-400">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800/50 has-[:checked]:border-sky-500 has-[:checked]:bg-sky-500/10 transition-all">
                <input
                  {...register('role')}
                  type="radio"
                  value="customer"
                  className="sr-only"
                />
                <span className="text-sm font-medium text-slate-200">Customer</span>
              </label>
              <label className="relative flex items-center justify-center p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:bg-slate-800/50 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10 transition-all">
                <input
                  {...register('role')}
                  type="radio"
                  value="admin"
                  className="sr-only"
                />
                <span className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Admin
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

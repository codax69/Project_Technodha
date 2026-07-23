import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { Lock, User as UserIcon, Mail, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await apiClient.post('/auth/register/', { ...data, role: 'customer' });
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
      <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-xl border border-[#2C2C2C]/10 space-y-6 relative overflow-hidden bg-white">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[#2C2C2C] tracking-tight">Create User Account</h2>
          <p className="text-slate-600 text-sm">Join Technodha Platform to browse inventory and place orders</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                {...register('username')}
                type="text"
                placeholder="johndoe"
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#FB6557] focus:ring-1 focus:ring-[#FB6557] rounded-xl pl-11 pr-4 py-3 text-[#2C2C2C] placeholder-slate-400 text-sm outline-none transition-all"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-rose-500">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#FB6557] focus:ring-1 focus:ring-[#FB6557] rounded-xl pl-11 pr-4 py-3 text-[#2C2C2C] placeholder-slate-400 text-sm outline-none transition-all"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#FB6557] focus:ring-1 focus:ring-[#FB6557] rounded-xl pl-11 pr-4 py-3 text-[#2C2C2C] placeholder-slate-400 text-sm outline-none transition-all"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#FB6557] hover:bg-[#e05345] text-[#FBFBF8] font-semibold rounded-xl shadow-lg shadow-[#FB6557]/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Register User Account'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FB6557] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

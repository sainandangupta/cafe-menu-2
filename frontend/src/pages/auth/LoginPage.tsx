import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { LoginSchema, LoginInput } from '../../utils/validators';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Detect if this is owner or admin login based on referrer or default
  const isOwnerLogin = location.search.includes('role=owner') || location.pathname.includes('owner');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setErrorMsg('');
      await login(data);

      const role = localStorage.getItem('role');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid credentials. Please try again.');
    }
  };

  // Theme config based on portal type
  const theme = isOwnerLogin
    ? {
      bg: 'from-teal-50 to-white',
      iconBg: 'bg-[#134e4a]',
      title: 'QuickCafe Owner',
      subtitle: 'Secure Operational Hub',
      subtitleBg: 'bg-[#134e4a] text-white',
      btnBg: 'bg-[#134e4a] hover:bg-[#0f3d3d]',
      focusRing: 'focus:border-teal-600 focus:ring-teal-100',
      footer: 'Cafe owner access only',
      footerLinks: ['PRIVACY POLICY', 'HELP CENTER', 'TECHNICAL SUPPORT'],
    }
    : {
      bg: 'from-blue-50 to-white',
      iconBg: 'bg-[#2563eb]',
      title: 'Bucks Cafe',
      subtitle: 'Owner Terminal Access',
      subtitleBg: 'text-gray-500',
      btnBg: 'bg-[#2563eb] hover:bg-[#1d4ed8]',
      focusRing: 'focus:border-blue-500 focus:ring-blue-100',
      footer: 'OWNER ACCESS ONLY',
      footerLinks: [],
    };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} flex flex-col items-center justify-center px-4`}>
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className={`w-14 h-14 ${theme.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <span className="material-symbols-outlined text-white text-3xl">restaurant</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{theme.title}</h1>
          {isOwnerLogin ? (
            <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${theme.subtitleBg}`}>
              {theme.subtitle}
            </span>
          ) : (
            <p className={`mt-1 text-sm ${theme.subtitleBg}`}>{theme.subtitle}</p>
          )}
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">mail</span>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  className={`input-field !pl-10 ${theme.focusRing} ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                {isOwnerLogin && (
                  <button type="button" className="text-xs font-medium text-teal-600 hover:text-teal-700">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field !pl-10 !pr-10 ${theme.focusRing} ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            {/* Error message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${theme.btnBg} text-white py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : (
                <>
                  Login
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          {isOwnerLogin ? (
            <>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                {theme.footer}
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                {theme.footerLinks.map((link, i) => (
                  <span key={i} className="text-[10px] text-gray-400 uppercase tracking-wider">{link}</span>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                <span className="material-symbols-outlined text-sm">shield</span>
                {theme.footer}
              </span>
              <p className="text-xs text-gray-400 mt-3">
                Authorized use only. Unauthorized access is strictly prohibited and monitored.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

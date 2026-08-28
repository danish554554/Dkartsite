import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-12 sm:py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-card space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="Dkart" className="h-11 mx-auto w-auto object-contain" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-dkart-charcoal tracking-tight pt-2">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-gray-500">
              Access your order history, saved addresses, and profile details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-bold text-dkart-charcoal">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-dkart-charcoal">Password</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl font-bold shadow-dkart transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-dkart-blue hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

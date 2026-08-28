import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both administrator email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(email, password);

      // Verify that the logged in user is actually an admin
      if (loggedUser && loggedUser.role !== 'admin') {
        logout();
        addToast('Access denied. This portal is restricted to store administrators.', 'error');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      addToast(err.message || 'Administrator authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4 selection:bg-dkart-blue selection:text-white">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Card */}
        <div className="bg-[#1A1D24] rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6 text-white">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
              <img src="/logo.png" alt="Dkart" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-dkart-blue text-white px-2.5 py-0.5 rounded-full">
                Admin Control Portal
              </span>
              <h1 className="text-xl font-black tracking-tight text-gray-100 mt-2">
                Executive Authentication
              </h1>
              <p className="text-xs text-gray-400">
                Restricted access for Dkart store management
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-300">Admin Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admindkart@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 pl-10 bg-[#12141A] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-dkart-blue text-xs font-medium"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-300">Secret Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 pl-10 bg-[#12141A] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-dkart-blue text-xs"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl font-bold shadow-dkart transition-all flex items-center justify-center gap-2 active:scale-98 text-xs"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Authenticate & Open Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-gray-800/80 flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
            <Lock size={12} />
            <span>256-Bit SSL Encrypted Admin Gateway</span>
          </div>
        </div>

        {/* Back to Live Store Link */}
        <div className="text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 transition">
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

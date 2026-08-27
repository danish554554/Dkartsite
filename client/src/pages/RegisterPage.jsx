import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setLoading(true);
      await register(formData.name, formData.email, formData.password, formData.phone);
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-12 sm:py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-card space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="Dkart" className="h-11 mx-auto w-auto object-contain" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-dkart-charcoal tracking-tight pt-2">
              Create Your Account
            </h1>
            <p className="text-xs text-gray-500">
              Join Dkart for faster checkout, order tracking, and exclusive discounts
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-bold text-dkart-charcoal">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Danish Riaz"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue"
                  required
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-dkart-charcoal">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-dkart-charcoal">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="03001234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue"
                />
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-dkart-charcoal">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue"
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
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-dkart-blue hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

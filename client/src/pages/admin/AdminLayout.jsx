import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Image as ImageIcon,
  Layers,
  Tag,
  ArrowLeft,
  Menu,
  X,
  Store,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1D24] flex items-center justify-center text-white text-xs font-bold">
        <span className="w-5 h-5 border-2 border-dkart-blue border-t-transparent rounded-full animate-spin mr-2"></span>
        Loading Admin Portal...
      </div>
    );
  }

  // If not admin, redirect to private admin login portal
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Products', path: '/admin/products', icon: <Package size={18} /> },
    { label: 'Categories', path: '/admin/categories', icon: <Layers size={18} /> },
    { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={18} /> },
    { label: 'Inventory', path: '/admin/inventory', icon: <Boxes size={18} /> },
    { label: 'Customers', path: '/admin/customers', icon: <Users size={18} /> },
    { label: 'Coupons', path: '/admin/coupons', icon: <Tag size={18} /> },
    { label: 'Banners', path: '/admin/banners', icon: <ImageIcon size={18} /> },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1A1D24] text-gray-300 border-r border-gray-800 p-5 space-y-6 flex-shrink-0">
        {/* Brand */}
        <div className="pb-4 border-b border-gray-800 flex items-center justify-between">
          <div className="bg-white px-3 py-1.5 rounded-xl shadow-xs">
            <img src="/logo.png" alt="Dkart" className="h-8 w-auto object-contain" />
          </div>
          <span className="text-[10px] font-black tracking-wider uppercase bg-dkart-blue text-white px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 mb-2">
            Store Management
          </p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive(item.path)
                  ? 'bg-dkart-blue text-white shadow-dkart'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Storefront link & Logout */}
        <div className="pt-4 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <Store size={16} />
            <span>Visit Live Store</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 transition text-left"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE TOPBAR */}
      <div className="md:hidden bg-[#1A1D24] text-white p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-gray-300 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="bg-white px-2.5 py-1 rounded-lg">
            <img src="/logo.png" alt="Dkart" className="h-7 w-auto object-contain" />
          </div>
          <span className="text-[10px] font-bold bg-dkart-blue px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <Link to="/" className="text-xs text-gray-300 flex items-center gap-1">
          <Store size={14} /> Store
        </Link>
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-[#1A1D24] text-gray-300 h-full p-5 flex flex-col z-10 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Dkart Admin</span>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive(item.path)
                      ? 'bg-dkart-blue text-white shadow-dkart'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-gray-800">
              <Link to="/" className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Store size={16} /> Back to Storefront
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

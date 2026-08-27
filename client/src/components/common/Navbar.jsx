import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Truck,
  ShieldCheck,
  Headphones,
  SlidersHorizontal,
  Home,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const { totalCount, setIsCartOpen } = useCart();
  const { totalWishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  // Fetch categories for navigation
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Navbar category load failed:', err);
      }
    }
    loadCats();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setCategoryDropdownOpen(false);
    setSearchSuggestions([]);
  }, [location.pathname]);

  // Live search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.getProducts({ q: searchQuery, limit: 5 });
        if (res.success) setSearchSuggestions(res.data);
      } catch (e) {
        // ignore search error
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchSuggestions([]);
    }
  };

  return (
    <>
      {/* 1. ANNOUNCEMENT BAR */}
      <div className="bg-dkart-dark text-white text-[12px] md:text-[13px] py-2 px-4 select-none border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-4 text-gray-300">
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ⚡ Nationwide Express Delivery
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck size={14} className="text-dkart-orange" />
              Cash on Delivery Available Across Pakistan
            </span>
            <span className="hidden lg:inline text-gray-500">|</span>
            <span className="hidden lg:flex items-center gap-1 text-amber-300 font-medium">
              Free Delivery on orders above Rs. 3,000!
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-300 text-xs">
            <Link to="/track-order" className="hover:text-white transition underline-offset-2 hover:underline">
              Track Order
            </Link>
            <span className="text-gray-600">•</span>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-emerald-400 transition"
            >
              <Headphones size={13} />
              WhatsApp Help: 0300-1234567
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile menu trigger */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-dkart-charcoal hover:text-dkart-blue rounded-lg transition active:scale-95"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Official Dkart Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 group py-1">
              <img
                src="/logo.png"
                alt="Dkart Store Pakistan"
                className="h-10 md:h-12 w-auto object-contain transition group-hover:opacity-95"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-dkart-charcoal">
              <Link to="/" className={`transition hover:text-dkart-blue ${location.pathname === '/' ? 'text-dkart-blue font-semibold' : ''}`}>
                Home
              </Link>
              <Link to="/shop" className={`transition hover:text-dkart-blue ${location.pathname === '/shop' ? 'text-dkart-blue font-semibold' : ''}`}>
                All Products
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" onMouseEnter={() => setCategoryDropdownOpen(true)} onMouseLeave={() => setCategoryDropdownOpen(false)}>
                <button className="flex items-center gap-1 py-2 hover:text-dkart-blue transition">
                  <span>Categories</span>
                  <ChevronDown size={15} className={`transition duration-200 ${categoryDropdownOpen ? 'rotate-180 text-dkart-blue' : ''}`} />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-fade-in">
                    <div className="px-4 py-1 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2">
                      Shop By Category
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-dkart-blue-light/40 hover:text-dkart-blue text-sm transition"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{cat.product_count || 0}</span>
                      </Link>
                    ))}
                    <div className="mt-2 pt-2 border-t px-4">
                      <Link to="/shop" className="text-xs font-semibold text-dkart-blue flex items-center gap-1 hover:underline">
                        View All Categories <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/payment-delivery" className={`transition hover:text-dkart-blue ${location.pathname === '/payment-delivery' ? 'text-dkart-blue font-semibold' : ''}`}>
                COD & Delivery
              </Link>

              <Link to="/track-order" className={`transition hover:text-dkart-blue ${location.pathname === '/track-order' ? 'text-dkart-blue font-semibold' : ''}`}>
                Track Order
              </Link>

              {isAdmin && (
                <Link to="/admin" className="px-3 py-1 bg-dkart-blue-light text-dkart-blue text-xs font-bold rounded-full hover:bg-dkart-blue hover:text-white transition">
                  Admin Portal
                </Link>
              )}
            </nav>

            {/* Live Search Bar (Desktop) */}
            <div className="hidden lg:block flex-1 max-w-xs xl:max-w-md relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search smartwatches, stylers, earbuds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-dkart-blue/20 focus:border-dkart-blue transition placeholder-gray-400"
                />
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>

              {/* Autocomplete suggestions popup */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                  <div className="p-2 text-xs font-bold uppercase text-gray-400 border-b">Suggested Products</div>
                  {searchSuggestions.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/product/${prod.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b last:border-0"
                    >
                      <img src={prod.primary_image} alt={prod.title} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dkart-charcoal truncate">{prod.title}</p>
                        <p className="text-xs text-dkart-blue font-bold">{formatPrice(prod.sale_price || prod.price)}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 text-center text-xs font-semibold text-dkart-blue bg-blue-50/50 hover:bg-blue-50 transition"
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-dkart-charcoal hover:text-dkart-blue rounded-full hover:bg-gray-100 transition"
                aria-label="Search"
              >
                <Search size={22} />
              </button>

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-2 text-dkart-charcoal hover:text-dkart-blue rounded-full hover:bg-gray-100 transition"
                aria-label="Wishlist"
              >
                <Heart size={22} />
                {totalWishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-dkart-orange text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalWishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-dkart-charcoal hover:text-dkart-blue rounded-full hover:bg-gray-100 transition active:scale-95"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag size={22} />
                {totalCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-dkart-blue text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse-subtle">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown / Login */}
              {user ? (
                <div className="hidden sm:flex items-center pl-2">
                  <Link
                    to="/account"
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-dkart-blue transition text-sm font-medium"
                  >
                    <div className="w-7 h-7 rounded-full bg-dkart-blue text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline max-w-[90px] truncate text-xs font-semibold">{user.name.split(' ')[0]}</span>
                  </Link>
                </div>
              ) : (
                <div className="hidden sm:flex items-center pl-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-gray-300 text-dkart-charcoal hover:border-dkart-blue hover:text-dkart-blue transition"
                  >
                    <User size={15} />
                    <span>Login</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Overlay Bar */}
          {isSearchOpen && (
            <div className="lg:hidden py-3 border-t border-gray-100 animate-slide-up">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products in Pakistan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-dkart-blue/20 focus:border-dkart-blue"
                />
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* 3. MOBILE SLIDE-OVER DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-up">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <img src="/logo.png" alt="Dkart" className="h-9 w-auto object-contain" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* User Greeting */}
              <div className="p-3 bg-dkart-blue-light/50 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dkart-blue text-white flex items-center justify-center font-bold">
                  {user ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Welcome to Dkart,</p>
                  <p className="text-sm font-bold text-dkart-charcoal">
                    {user ? user.name : 'Guest Shopper'}
                  </p>
                </div>
              </div>

              {/* Navigation links */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Explore</p>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <Home size={18} className="text-dkart-blue" /> Home
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <Compass size={18} className="text-dkart-blue" /> All Products
                </Link>
                <Link
                  to="/track-order"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <Truck size={18} className="text-dkart-orange" /> Track My Parcel
                </Link>
                <Link
                  to="/payment-delivery"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <ShieldCheck size={18} className="text-emerald-600" /> COD & Delivery Info
                </Link>
              </div>

              {/* Categories list */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">Categories</p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-gray-400">{cat.product_count}</span>
                  </Link>
                ))}
              </div>

              {/* Customer Account / Admin */}
              <div className="space-y-1 pt-4 border-t">
                {user ? (
                  <>
                    <Link
                      to="/account"
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
                    >
                      My Orders & Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 text-sm font-bold text-dkart-blue hover:bg-dkart-blue-light rounded-xl"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 py-2.5 text-center text-xs font-bold border border-gray-300 rounded-xl text-gray-700"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 py-2.5 text-center text-xs font-bold bg-dkart-blue text-white rounded-xl shadow-dkart"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Helpline Footer */}
            <div className="p-4 bg-gray-50 border-t text-xs text-center text-gray-500">
              WhatsApp Support: <span className="font-bold text-emerald-600">+92 300 1234567</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. MOBILE BOTTOM APP BAR (Ultra-responsive thumb bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 py-2 px-3 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-xs ${location.pathname === '/' ? 'text-dkart-blue font-bold' : 'text-gray-500'}`}
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link
          to="/shop"
          className={`flex flex-col items-center gap-0.5 text-xs ${location.pathname === '/shop' ? 'text-dkart-blue font-bold' : 'text-gray-500'}`}
        >
          <Compass size={20} />
          <span>Shop</span>
        </Link>
        <Link
          to="/wishlist"
          className={`flex flex-col items-center gap-0.5 text-xs relative ${location.pathname === '/wishlist' ? 'text-dkart-blue font-bold' : 'text-gray-500'}`}
        >
          <Heart size={20} />
          {totalWishlistCount > 0 && (
            <span className="absolute -top-1 right-2 bg-dkart-orange text-white text-[10px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {totalWishlistCount}
            </span>
          )}
          <span>Saved</span>
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-0.5 text-xs relative text-gray-500"
        >
          <ShoppingBag size={20} />
          {totalCount > 0 && (
            <span className="absolute -top-1 right-2 bg-dkart-blue text-white text-[10px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
          <span>Cart</span>
        </button>
        <Link
          to={user ? "/account" : "/login"}
          className={`flex flex-col items-center gap-0.5 text-xs ${location.pathname.includes('/account') || location.pathname.includes('/login') ? 'text-dkart-blue font-bold' : 'text-gray-500'}`}
        >
          <User size={20} />
          <span>{user ? 'Account' : 'Login'}</span>
        </Link>
      </div>
    </>
  );
}

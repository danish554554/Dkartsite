import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { api } from '../services/api';
import { formatPrice } from '../utils/helpers';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/initialCatalog';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Instant 0ms Pre-Hydrated State
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('dkart_cache_shop_all');
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('dkart_home_cats');
      return cached ? JSON.parse(cached) : INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  });

  const [loading, setLoading] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Active filter state
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  // Fetch categories once
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCats();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const params = {
          category: currentCategory,
          q: currentSearch,
          sort: currentSort,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice,
          inStock: currentInStock ? 'true' : ''
        };
        const res = await api.getProducts(params);
        if (res.success) setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, currentInStock]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentSearch || currentMinPrice || currentMaxPrice || currentInStock
  );

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Category Catalog'
              : currentSearch
              ? `Results for "${currentSearch}"`
              : 'All Products'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Showing {products.length} products available for nationwide Cash on Delivery
          </p>
        </div>

        {/* Filter Controls Bar (Mobile and Desktop) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/80 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-dkart-charcoal rounded-xl text-xs font-bold transition active:scale-95"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-dkart-blue inline-block"></span>
            )}
          </button>

          {/* Quick Category Chips (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => updateFilter('category', '')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                !currentCategory
                  ? 'bg-dkart-blue text-white shadow-dkart'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter('category', cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  currentCategory === cat.slug
                    ? 'bg-dkart-blue text-white shadow-dkart'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">Sort By:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-dkart-charcoal focus:outline-none focus:border-dkart-blue"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Best Sellers</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-gray-400 font-semibold">Active Filters:</span>
            {currentCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-xs font-semibold rounded-full text-dkart-charcoal shadow-2xs">
                Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <button onClick={() => updateFilter('category', '')} className="text-gray-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            )}
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-xs font-semibold rounded-full text-dkart-charcoal shadow-2xs">
                Search: "{currentSearch}"
                <button onClick={() => updateFilter('q', '')} className="text-gray-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            )}
            {currentInStock && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-xs font-semibold rounded-full text-dkart-charcoal shadow-2xs">
                In Stock Only
                <button onClick={() => updateFilter('inStock', '')} className="text-gray-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            )}
            {currentMaxPrice && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 text-xs font-semibold rounded-full text-dkart-charcoal shadow-2xs">
                Under {formatPrice(currentMaxPrice)}
                <button onClick={() => updateFilter('maxPrice', '')} className="text-gray-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-red-500 hover:underline ml-1"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Layout: Sidebar (Desktop) + Product Grid */}
        <div className="flex gap-8">
          {/* Desktop Left Sidebar Filter */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-dkart-charcoal mb-3">
                  Categories
                </h3>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-dkart-blue cursor-pointer">
                    <input
                      type="radio"
                      name="catFilter"
                      checked={!currentCategory}
                      onChange={() => updateFilter('category', '')}
                      className="text-dkart-blue focus:ring-dkart-blue"
                    />
                    <span>All Products</span>
                  </label>
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between text-xs font-medium text-gray-600 hover:text-dkart-blue cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="catFilter"
                          checked={currentCategory === cat.slug}
                          onChange={() => updateFilter('category', cat.slug)}
                          className="text-dkart-blue focus:ring-dkart-blue"
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-normal">({cat.product_count || 0})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dkart-charcoal mb-3">
                  Price Filter
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min Rs."
                      value={currentMinPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max Rs."
                      value={currentMaxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dkart-charcoal mb-3">
                  Availability
                </h3>
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentInStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                    className="rounded text-dkart-blue focus:ring-dkart-blue"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse space-y-3">
                    <div className="aspect-square bg-gray-200 rounded-xl" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Search size={30} />
                </div>
                <h3 className="text-lg font-bold text-dkart-charcoal">No Products Found</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                  We couldn't find any products matching your current filters. Try resetting filters or searching with a different term.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-dkart-blue text-white rounded-xl text-xs font-bold shadow-dkart hover:bg-dkart-blue-hover transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE SLIDE-OUT FILTER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-up ml-auto">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-dkart-blue" />
                <h3 className="text-sm font-bold text-dkart-charcoal">Filter Products</h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category options */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateFilter('category', '');
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                      !currentCategory ? 'bg-dkart-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateFilter('category', c.slug);
                        setIsFilterDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                        currentCategory === c.slug ? 'bg-dkart-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[11px] opacity-70">({c.product_count || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Price Limit (PKR)</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min Rs."
                    value={currentMinPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-1/2 p-2 text-xs border rounded-xl"
                  />
                  <input
                    type="number"
                    placeholder="Max Rs."
                    value={currentMaxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-1/2 p-2 text-xs border rounded-xl"
                  />
                </div>
              </div>

              {/* In stock */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={currentInStock}
                    onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                    className="rounded text-dkart-blue"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 text-xs font-bold border border-gray-300 rounded-xl text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold bg-dkart-blue text-white rounded-xl shadow-dkart"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

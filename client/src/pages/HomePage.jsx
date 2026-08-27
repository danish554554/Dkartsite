import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Flame, Star, ArrowRight, ShieldCheck, Quote } from 'lucide-react';
import HeroBanner from '../components/home/HeroBanner';
import CategorySection from '../components/home/CategorySection';
import TrustSection from '../components/home/TrustSection';
import PromoStrip from '../components/home/PromoStrip';
import ProductCard from '../components/common/ProductCard';
import { api } from '../services/api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catsRes, featRes, trendRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true, limit: 4 }),
          api.getProducts({ trending: true, limit: 8 })
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (featRes.success) setFeaturedProducts(featRes.data);
        if (trendRes.success) {
          setTrendingProducts(trendRes.data);
          // Split some as bestsellers
          setBestsellerProducts(trendRes.data.filter((p) => p.badge === 'Bestseller' || p.rating_average >= 4.8));
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-0">
      {/* 1. HERO SLIDER */}
      <HeroBanner />

      {/* 2. SHOP BY CATEGORY */}
      <CategorySection categories={categories} />

      {/* 3. BESTSELLERS / FEATURED SECTION */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-dkart-blue mb-1">
                <Flame size={15} className="text-dkart-orange" />
                <span>Most Loved in Pakistan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight">
                Trending Best Sellers
              </h2>
            </div>

            <Link
              to="/shop?sort=popular"
              className="text-xs sm:text-sm font-bold text-dkart-blue hover:text-dkart-blue-hover flex items-center gap-1"
            >
              <span>View All Best Sellers</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse bg-gray-50">
                  <div className="aspect-square bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. PROMO STRIP WITH COUNTDOWN */}
      <PromoStrip />

      {/* 5. EXPLORE NEW ARRIVALS & TRENDING */}
      <section className="py-14 bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-dkart-blue mb-1">
                <Sparkles size={15} className="text-dkart-orange" />
                <span>Next-Gen Lifestyle Innovations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight">
                New Arrivals & Featured Deals
              </h2>
            </div>

            <Link
              to="/shop"
              className="text-xs sm:text-sm font-bold text-dkart-blue hover:text-dkart-blue-hover flex items-center gap-1"
            >
              <span>Explore All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRUST BUILDING SECTION */}
      <TrustSection />

      {/* 7. PAKISTANI CUSTOMER REVIEWS & TESTIMONIALS */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-dkart-blue">
              Verified Buyers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight mt-1">
              What Pakistani Customers Say About Dkart
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-gray-100 bg-[#FBFBFC] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-dkart-charcoal italic leading-relaxed">
                  "I was hesitant about ordering a hair brush styler online, but Dkart delivered to Lahore via TCS in just 2 days. The negative ion blowout dries my thick hair in 10 minutes. 100% genuine quality!"
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dkart-charcoal">Ayesha Khan</h4>
                  <p className="text-[11px] text-gray-500">DHA Phase 6, Lahore</p>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Verified Order
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 bg-[#FBFBFC] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-dkart-charcoal italic leading-relaxed">
                  "The Dkart Titan Pro smartwatch has better AMOLED clarity than watches double its price. Urdu WhatsApp messages read perfectly, and Bluetooth call speaker is super crisp. Cash on delivery was seamless."
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dkart-charcoal">Zubair Ahmed</h4>
                  <p className="text-[11px] text-gray-500">Gulshan-e-Iqbal, Karachi</p>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Verified Order
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 bg-[#FBFBFC] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-dkart-charcoal italic leading-relaxed">
                  "Kemie rechargeable shaver is painless and doesn’t leave any bumps or irritation. Customer support on WhatsApp answered my query within 5 minutes. Truly professional Pakistani store."
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dkart-charcoal">Hira Siddiqui</h4>
                  <p className="text-[11px] text-gray-500">F-10/2, Islamabad</p>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Verified Order
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

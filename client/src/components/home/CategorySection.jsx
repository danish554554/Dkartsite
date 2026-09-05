import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CategorySection({ categories = [] }) {
  // Only display categories that currently have active products
  const activeCategories = (categories || []).filter(
    (c) => Number(c.product_count || c.actual_product_count || 0) > 0
  );

  if (activeCategories.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-[#FBFBFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-dkart-blue mb-1 block">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-dkart-blue hover:text-dkart-blue-hover flex items-center gap-1 group"
          >
            <span>Explore All</span>
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </Link>
        </div>

        {/* Dynamic Responsive Categories Grid */}
        <div className={`grid gap-4 sm:gap-6 ${
          activeCategories.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : activeCategories.length <= 4
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        }`}>
          {activeCategories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-gray-200/80 shadow-xs hover:shadow-card-hover transition-all duration-300 flex flex-col justify-end p-5 min-h-[200px] sm:min-h-[250px]"
            >
              {/* Category Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={category.image_url}
                  alt={`${category.name} collection - Shop online at Dkart Pakistan`}
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="260"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
              </div>

              {/* Category Text & Count */}
              <div className="relative z-10 space-y-1">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {category.product_count} {Number(category.product_count) === 1 ? 'Product' : 'Products'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-blue-200 transition">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

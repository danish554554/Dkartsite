import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CategorySection({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

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

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-xs hover:shadow-card-hover transition-all duration-300 flex flex-col justify-end p-4 min-h-[170px] sm:min-h-[220px]"
            >
              {/* Category Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={category.image_url}
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent"></div>
              </div>

              {/* Category Text & Count */}
              <div className="relative z-10 space-y-1">
                <p className="text-[11px] font-semibold text-amber-300">
                  {category.product_count || 10}+ Products
                </p>
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-blue-200 transition">
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

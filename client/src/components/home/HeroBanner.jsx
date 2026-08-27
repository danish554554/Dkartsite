import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    badge: 'NEW ARRIVAL • 2026 EDITION',
    title: 'Dkart Titan Pro AMOLED Watch',
    subtitle: '1.43" Ultra HD Retina Display, Bluetooth Calling & 7-Day Battery. Flat 35% OFF this week.',
    ctaText: 'Shop Titan Pro',
    ctaLink: '/product/dkart-titan-pro-amoled-smartwatch',
    priceText: 'From Rs. 6,499',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=85',
    bgGradient: 'from-slate-950 via-slate-900 to-blue-950'
  },
  {
    badge: 'VIRAL SALON ESSENTIAL',
    title: '3-in-1 Heated Hot Air Volumizer Brush',
    subtitle: 'Salon-grade blowout volume, smooth shine, and quick morning styling in a single step.',
    ctaText: 'Get Salon Hair Now',
    ctaLink: '/product/dkart-3-in-1-hot-air-dryer-volumizer-brush',
    priceText: 'Save 36% • Rs. 2,899',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=85',
    bgGradient: 'from-zinc-950 via-gray-900 to-indigo-950'
  },
  {
    badge: 'ACTIVE NOISE CANCELLATION',
    title: 'Dkart Pods Max Wireless ANC',
    subtitle: '35dB Hybrid Active Noise Cancellation + Quad-mic ENC for crystal-clear calls on Pakistani roads.',
    ctaText: 'Discover Audio',
    ctaLink: '/product/dkart-pods-max-anc-wireless-earbuds',
    priceText: 'Special Price • Rs. 3,799',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1600&q=85',
    bgGradient: 'from-gray-950 via-slate-900 to-blue-900'
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white min-h-[500px] lg:min-h-[580px] flex items-center">
      {/* Background Image with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-all duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30"></div>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="max-w-2xl space-y-6 animate-fade-in key={currentSlide}">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dkart-blue/30 border border-dkart-blue/50 text-blue-300 text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles size={14} className="text-dkart-orange" />
            <span>{slide.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed max-w-xl">
            {slide.subtitle}
          </p>

          {/* Price highlight */}
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-bold text-dkart-orange bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              {slide.priceText}
            </span>
            <span className="text-xs text-gray-400">Cash on Delivery Available</span>
          </div>

          {/* Primary CTA & Secondary Action */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              to={slide.ctaLink}
              className="px-7 py-3.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-dkart-lg hover:shadow-dkart transition-all duration-200 active:scale-95"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/shop"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition"
            >
              Browse All Products
            </Link>
          </div>

          {/* Trust points */}
          <div className="pt-4 flex items-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Truck size={15} className="text-emerald-400" />
              <span>Free Delivery Above Rs. 3,000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-dkart-blue" />
              <span>7-Day Replacement Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2">
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition border border-white/10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition border border-white/10"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-dkart-blue' : 'w-2 bg-white/30'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

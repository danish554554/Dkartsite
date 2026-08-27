import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ArrowRight, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function PromoStrip() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('DKART10');
    setCopied(true);
    addToast('Coupon "DKART10" copied! 10% OFF added to your clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const format2 = (n) => String(n).padStart(2, '0');

  return (
    <section className="bg-gradient-to-r from-blue-900 via-dkart-blue to-indigo-900 text-white py-10 relative overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-dkart-orange/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          {/* Left Text */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dkart-orange text-white text-xs font-black uppercase tracking-wider shadow-sm">
              <Flame size={15} className="animate-bounce" />
              <span>Limited-Time Flash Sale</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Get an Extra 10% OFF Your First Order
            </h3>
            <p className="text-sm text-blue-100 max-w-lg">
              Apply coupon code during checkout. Enjoy verified Cash on Delivery across Pakistan.
            </p>
          </div>

          {/* Right Timer & Code */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Timer boxes */}
            <div className="flex items-center gap-2 bg-black/25 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
              <Clock size={18} className="text-amber-300 mr-1" />
              <div className="flex items-center gap-1.5 font-mono">
                <div className="text-center">
                  <span className="text-lg font-black bg-white/15 px-2 py-1 rounded-md inline-block min-w-[32px]">
                    {format2(timeLeft.hours)}
                  </span>
                  <span className="block text-[10px] text-gray-300 uppercase mt-0.5">Hrs</span>
                </div>
                <span className="text-lg font-bold pb-2">:</span>
                <div className="text-center">
                  <span className="text-lg font-black bg-white/15 px-2 py-1 rounded-md inline-block min-w-[32px]">
                    {format2(timeLeft.minutes)}
                  </span>
                  <span className="block text-[10px] text-gray-300 uppercase mt-0.5">Min</span>
                </div>
                <span className="text-lg font-bold pb-2">:</span>
                <div className="text-center">
                  <span className="text-lg font-black bg-white/15 px-2 py-1 rounded-md inline-block min-w-[32px] text-dkart-orange">
                    {format2(timeLeft.seconds)}
                  </span>
                  <span className="block text-[10px] text-gray-300 uppercase mt-0.5">Sec</span>
                </div>
              </div>
            </div>

            {/* Coupon Code Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-dkart-charcoal font-black text-sm hover:bg-gray-100 transition shadow-md group"
              >
                <span className="text-xs text-gray-400">CODE:</span>
                <span className="text-dkart-blue tracking-wider font-extrabold">DKART10</span>
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-gray-400 group-hover:text-dkart-blue" />}
              </button>

              <Link
                to="/shop"
                className="px-5 py-3 rounded-xl bg-dkart-orange hover:bg-dkart-orange-hover text-white font-extrabold text-sm flex items-center gap-1.5 shadow-lg transition active:scale-95"
              >
                <span>Shop Deals</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  MapPin,
  Phone,
  ArrowUpRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#191D24] text-gray-300 pt-14 pb-24 md:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              {/* White background container for logo to ensure maximum crispness */}
              <div className="bg-white px-3.5 py-2 rounded-2xl inline-block shadow-xs">
                <img src="/logo.png" alt="Dkart Store" className="h-10 w-auto object-contain" />
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Pakistan's trusted destination for high-performance lifestyle technology, salon-grade hair care, and smart personal grooming essentials. Built for premium daily living.
            </p>

            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-dkart-orange flex-shrink-0" />
                <span>Head Office: Shahrah-e-Faisal, Karachi, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-dkart-orange flex-shrink-0" />
                <span>Helpline / WhatsApp: +92 342 5097760 (24/7 Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-dkart-orange flex-shrink-0" />
                <span>Official Inquiries: care@dkart.pk</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/shop?category=hair-styling" className="hover:text-white transition">
                  Hair Styling & Care
                </Link>
              </li>
              <li>
                <Link to="/shop?category=personal-care" className="hover:text-white transition">
                  Personal Care & Grooming
                </Link>
              </li>
              <li>
                <Link to="/shop?category=smart-wearables" className="hover:text-white transition">
                  Smart Wearables & Watches
                </Link>
              </li>
              <li>
                <Link to="/shop?category=audio-sound" className="hover:text-white transition">
                  Wireless ANC Earbuds
                </Link>
              </li>
              <li>
                <Link to="/shop?category=mobile-accessories" className="hover:text-white transition">
                  GaN Chargers & Power Banks
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-dkart-orange font-semibold hover:underline">
                  Browse Full Catalog →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/track-order" className="hover:text-white transition">
                  Track Your Parcel
                </Link>
              </li>
              <li>
                <Link to="/payment-delivery" className="hover:text-white transition">
                  Cash on Delivery Info
                </Link>
              </li>
              <li>
                <Link to="/payment-delivery#returns" className="hover:text-white transition">
                  7-Day Return & Exchange
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/923425097760"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  WhatsApp Helpdesk <ArrowUpRight size={13} />
                </a>
              </li>
            </ul>
          </div>

          {/* Trust Highlights */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-2">
              Dkart Promises
            </h4>
            <div className="bg-gray-800/60 p-3.5 rounded-xl space-y-2 text-xs border border-gray-700/60">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Truck size={16} className="text-dkart-orange" />
                <span>Nationwide Shipping</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-snug">
                Fast courier delivery via TCS & Leopard to 250+ cities across Pakistan.
              </p>
            </div>

            <div className="bg-gray-800/60 p-3.5 rounded-xl space-y-2 text-xs border border-gray-700/60">
              <div className="flex items-center gap-2 text-white font-semibold">
                <RotateCcw size={16} className="text-emerald-400" />
                <span>Easy 7-Day Exchange</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-snug">
                Defective parcel? Instant door-to-door replacement guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Payment Methods & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Dkart Pakistan (dkart.pk). All rights reserved.</p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-gray-400 text-xs font-semibold">Accepted Payments:</span>
            <span className="px-2.5 py-1 bg-gray-800 rounded text-gray-300 font-bold text-[11px]">
              Cash on Delivery (COD)
            </span>
            <span className="px-2.5 py-1 bg-gray-800 rounded text-gray-300 font-bold text-[11px]">
              EasyPaisa
            </span>
            <span className="px-2.5 py-1 bg-gray-800 rounded text-gray-300 font-bold text-[11px]">
              JazzCash
            </span>
            <span className="px-2.5 py-1 bg-gray-800 rounded text-gray-300 font-bold text-[11px]">
              Visa / MasterCard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

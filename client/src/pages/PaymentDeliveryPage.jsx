import React from 'react';
import {
  CreditCard,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  HelpCircle,
  Headphones
} from 'lucide-react';

export default function PaymentDeliveryPage() {
  return (
    <div className="bg-[#F8F9FB] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-dkart-blue bg-blue-50 px-3.5 py-1 rounded-full">
            Buyer Protection & Logistics
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-dkart-charcoal tracking-tight">
            Payment & Delivery Information
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Everything you need to know about ordering, cash on delivery, nationwide courier dispatch, and our 7-day hassle-free exchange policy.
          </p>
        </div>

        {/* 1. Cash on Delivery (COD) Deep Dive */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-dkart-blue flex items-center justify-center font-bold">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-dkart-charcoal">
                1. Cash on Delivery (COD) Across Pakistan
              </h2>
              <p className="text-xs text-gray-400">Zero advance payment required</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              At Dkart, we understand that trust is the foundation of online shopping in Pakistan. That is why over <strong>95% of our customers</strong> choose our official Cash on Delivery service.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <h4 className="font-bold text-dkart-charcoal">How it works:</h4>
                <p className="text-xs text-gray-500">
                  Select "Cash on Delivery" at checkout. We pack and dispatch your order. When the TCS or Leopard rider arrives at your doorstep, hand over the exact cash amount and receive your parcel.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <h4 className="font-bold text-dkart-charcoal">Available Payment Options:</h4>
                <p className="text-xs text-gray-500">
                  • Cash on Delivery (COD)<br />
                  • EasyPaisa / JazzCash digital transfer<br />
                  • Visa & MasterCard debit/credit cards
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Delivery Times & Charges */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-dkart-orange flex items-center justify-center font-bold">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-dkart-charcoal">
                2. Shipping Timelines & Delivery Charges
              </h2>
              <p className="text-xs text-gray-400">Dispatched from our Karachi fulfillment hub</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900 font-semibold">
              <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Free Delivery Offer:</strong> All orders with a cart subtotal of <strong>Rs. 3,000 or above</strong> automatically qualify for 100% Free Shipping anywhere in Pakistan!
              </span>
            </div>

            <table className="w-full text-left border border-gray-200 rounded-2xl overflow-hidden">
              <thead className="bg-gray-100 text-dkart-charcoal font-bold text-xs uppercase">
                <tr>
                  <th className="p-3">Destination Region</th>
                  <th className="p-3">Estimated Time</th>
                  <th className="p-3">Standard Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr>
                  <td className="p-3 font-semibold">Karachi (Same/Next Day)</td>
                  <td className="p-3">24 to 48 Hours</td>
                  <td className="p-3 font-bold text-dkart-blue">Rs. 199 (Free over 3k)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Lahore, Islamabad, Rawalpindi</td>
                  <td className="p-3">2 to 3 Business Days</td>
                  <td className="p-3 font-bold text-dkart-blue">Rs. 199 (Free over 3k)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Faisalabad, Multan, Peshawar, Gujranwala</td>
                  <td className="p-3">3 to 4 Business Days</td>
                  <td className="p-3 font-bold text-dkart-blue">Rs. 199 (Free over 3k)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Rest of Pakistan (AJK, GB, Balochistan)</td>
                  <td className="p-3">3 to 5 Business Days</td>
                  <td className="p-3 font-bold text-dkart-blue">Rs. 199 (Free over 3k)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 7-Day Return & Exchange Policy */}
        <div id="returns" className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <RotateCcw size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-dkart-charcoal">
                3. Hassle-Free 7-Day Replacement Guarantee
              </h2>
              <p className="text-xs text-gray-400">Complete customer satisfaction guaranteed</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              We want you to shop with complete peace of mind. If your product is received with any manufacturing defect, physical courier damage, or does not match description, you are eligible for an immediate replacement:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Contact our customer support team within <strong>7 days</strong> of delivery.</li>
              <li>Share a brief photo or video of the parcel and defective item via WhatsApp to <strong>0300-1234567</strong>.</li>
              <li>Once verified, our courier partner will deliver a brand-new replacement unit to your doorstep.</li>
            </ul>
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="bg-gradient-to-r from-dkart-blue to-indigo-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Have an urgent question about your delivery?</h3>
            <p className="text-xs text-blue-200">Our customer support team is available on WhatsApp 7 days a week.</p>
          </div>
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2"
          >
            <Headphones size={16} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

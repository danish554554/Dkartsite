import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Truck,
  Search,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  Headphones
} from 'lucide-react';
import { api } from '../services/api';
import { formatPrice } from '../utils/helpers';

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter your Dkart Order ID (e.g. DK-10492)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setOrder(null);
      const res = await api.trackOrder(orderId.trim(), phone.trim());
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      setError(err.message || 'No order found matching the provided details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleSearch();
    }
  }, [initialOrderId]);

  const currentStepIndex = order ? STEPS.indexOf(order.status) : 0;

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-dkart-blue flex items-center justify-center mx-auto">
            <Truck size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight">
            Track Your Dkart Parcel
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Enter your Order ID (from SMS or receipt) and phone number to monitor live delivery status across Pakistan.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-card space-y-4">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-dkart-charcoal mb-1">
                Order ID *
              </label>
              <input
                type="text"
                placeholder="e.g. DK-10492"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl uppercase font-bold text-xs sm:text-sm focus:outline-none focus:border-dkart-blue"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-dkart-charcoal mb-1">
                Phone (Optional)
              </label>
              <input
                type="text"
                placeholder="03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-dkart-blue"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl font-bold text-xs sm:text-sm shadow-dkart transition flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Search size={15} /> Track
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Tracking Progress Card */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-8 animate-fade-in">
            {/* Meta info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase">Order ID</span>
                <h3 className="text-xl font-black text-dkart-charcoal">{order.id}</h3>
                <p className="text-xs text-gray-500">Customer: {order.customerName}</p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-gray-400 font-bold uppercase">Courier Tracking</span>
                <p className="text-base font-bold text-dkart-blue">
                  {order.trackingNumber || 'TCS Express'}
                </p>
                <span className="text-xs text-emerald-600 font-semibold">TCS Pakistan Network</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Delivery Timeline
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'border-dkart-blue bg-dkart-blue-light/50 font-bold text-dkart-blue shadow-xs'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-gray-100 bg-gray-50 text-gray-400'
                      }`}
                    >
                      <div className="text-xs font-bold mb-1">
                        {isDone ? '✓ ' : `${idx + 1}. `}
                      </div>
                      <p className="text-[11px] font-semibold leading-tight">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ordered Items Mini */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Package Contents
              </h4>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-200" />
                      <div>
                        <p className="font-bold text-dkart-charcoal">{item.title}</p>
                        <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-dkart-charcoal">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help CTA */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-dkart-charcoal font-medium">
                <Headphones size={18} className="text-dkart-blue flex-shrink-0" />
                <span>Need urgent delivery support? WhatsApp us with your Order ID.</span>
              </div>
              <a
                href={`https://wa.me/923001234567?text=Hello%20Dkart,%20inquiring%20about%20Order%20${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-dkart-blue hover:underline whitespace-nowrap"
              >
                WhatsApp Help →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

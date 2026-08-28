import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { formatPrice } from '../utils/helpers';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    if (!order && id) {
      async function fetchOrder() {
        try {
          const res = await api.getOrderById(id);
          if (res.success) setOrder(res.order);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto" />
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-dkart-charcoal">Order Found</h2>
        <p className="text-gray-500">Could not retrieve details for order {id}.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-dkart-blue text-white rounded-xl text-xs font-bold">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const address = order.shippingAddress || order.shipping_address || {};

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Celebration Banner Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-card text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Order Confirmed & Booked
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight pt-2">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Your parcel has been booked for nationwide delivery. You will pay in cash upon receiving the parcel.
            </p>
          </div>

          {/* Quick Tracking Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-lg mx-auto">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/60 text-left">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Order ID</span>
              <p className="text-base font-black text-dkart-blue">{order.id}</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/60 text-left">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Courier Tracking</span>
              <p className="text-base font-black text-emerald-600">
                {order.trackingNumber || order.tracking_number || 'TCS-PENDING'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <h3 className="text-base font-black text-dkart-charcoal border-b pb-3">
            Itemized Order Receipt
          </h3>

          {/* Items */}
          <div className="divide-y divide-gray-100 space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="pt-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80'}
                    alt=""
                    className="w-12 h-12 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-dkart-charcoal">{item.title}</h4>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-dkart-charcoal">
                  {formatPrice(item.subtotal || item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-dkart-charcoal">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>
                {order.shippingFee === 0 || order.shipping_fee === 0 ? (
                  <strong className="text-emerald-600 uppercase font-bold">FREE</strong>
                ) : (
                  formatPrice(order.shippingFee || order.shipping_fee)
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-dkart-charcoal pt-3 border-t">
              <span>Total Payable on Delivery (COD)</span>
              <span className="text-dkart-blue text-lg">
                {formatPrice(order.totalAmount || order.total_amount)}
              </span>
            </div>
          </div>

          {/* Shipping Address Summary */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 text-xs space-y-1">
            <h4 className="font-bold text-dkart-charcoal flex items-center gap-1.5 mb-1">
              <MapPin size={14} className="text-dkart-orange" />
              Delivery Destination:
            </h4>
            <p className="font-semibold text-gray-800">
              {order.customerName || order.customer_name} ({order.customerPhone || order.customer_phone})
            </p>
            <p className="text-gray-500">
              {address.streetAddress || address.street_address}, {address.area ? `${address.area}, ` : ''}{address.city}, {address.province}
            </p>
          </div>

          {/* Actions: Track & WhatsApp */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/track-order?orderId=${order.id}`}
              className="flex-1 py-3.5 px-4 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl font-bold text-xs sm:text-sm text-center shadow-dkart transition flex items-center justify-center gap-1.5"
            >
              <Truck size={16} />
              <span>Track Live Delivery Status</span>
            </Link>

            <a
              href={`https://wa.me/923425097760?text=Hi%20Dkart,%20I%20have%20an%20inquiry%20regarding%20my%20order%20${order.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm text-center transition flex items-center justify-center gap-1.5"
            >
              <MessageSquare size={16} />
              <span>WhatsApp Order Inquiries</span>
            </a>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs font-bold text-dkart-charcoal hover:text-dkart-blue">
              ← Return to Dkart Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

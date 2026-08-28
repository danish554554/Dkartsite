import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatPrice, PAKISTAN_PROVINCES, POPULAR_CITIES, trackEvent } from '../utils/helpers';

export default function CheckoutPage() {
  const { cartItems, subtotal, shippingFee, discountAmount, finalTotal, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    phone: user?.phone || '',
    email: user ? user.email : '',
    province: 'Punjab',
    city: 'Lahore',
    area: '',
    streetAddress: '',
    notes: '',
    paymentMethod: 'cod' // 'cod' | 'card' | 'easypaisa'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-dkart-charcoal">Your cart is empty</h2>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-dkart-blue text-white rounded-xl text-xs font-bold">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      addToast('Please enter your full name.', 'error');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      addToast('Please provide a valid Pakistani mobile/WhatsApp number.', 'error');
      return;
    }
    if (!formData.streetAddress.trim()) {
      addToast('Please enter your complete street/house address.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email || null,
        shippingAddress: {
          province: formData.province,
          city: formData.city,
          area: formData.area,
          streetAddress: formData.streetAddress
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantName: item.variantName,
          quantity: item.quantity,
          image: item.image
        })),
        couponCode: coupon?.code || null,
        notes: formData.notes
      };

      const res = await api.createOrder(orderPayload);

      if (res.success) {
        // Track Purchase event for Meta Pixel / GA4
        trackEvent('Purchase', {
          content_type: 'product',
          contents: cartItems.map(item => ({ id: item.productId, quantity: item.quantity })),
          value: finalTotal,
          currency: 'PKR',
          num_items: cartItems.length
        });

        clearCart();
        navigate(`/order-success/${res.order.id}`, { state: { order: res.order } });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      addToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
          <Link to="/cart" className="flex items-center gap-1 hover:text-dkart-blue">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <span>/</span>
          <span className="font-semibold text-dkart-charcoal">Checkout</span>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: CUSTOMER & ADDRESS FORM (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Contact Info */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-black text-dkart-charcoal">
                    1. Contact Information
                  </h3>
                  <span className="text-[11px] text-gray-400">Required for courier SMS & call</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-dkart-charcoal">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Danish Riaz"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-dkart-charcoal">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="03001234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs sm:text-sm"
                      required
                    />
                    <p className="text-[10px] text-gray-400">Courier rider will call on this number</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-dkart-charcoal">Email Address (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@domain.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs sm:text-sm"
                    />
                    <p className="text-[10px] text-gray-400">Receive order receipt & PDF invoice</p>
                  </div>
                </div>
              </div>

              {/* 2. Pakistani Delivery Address */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-black text-dkart-charcoal">
                    2. Delivery Address in Pakistan
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Truck size={13} /> TCS Express Delivery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-dkart-charcoal">Province *</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs sm:text-sm focus:outline-none focus:border-dkart-blue"
                    >
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-dkart-charcoal">City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      value={formData.city}
                      onChange={handleChange}
                      list="pakistan-cities"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs sm:text-sm"
                      required
                    />
                    <datalist id="pakistan-cities">
                      {POPULAR_CITIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-dkart-charcoal">Area / Town / Sector (Optional)</label>
                    <input
                      type="text"
                      name="area"
                      placeholder="e.g. DHA Phase 5, Gulberg, F-10, North Nazimabad"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-dkart-charcoal">Street / House / Floor Address *</label>
                    <textarea
                      name="streetAddress"
                      rows={2}
                      placeholder="e.g. House # 14, Street # 2, Near Jamia Masjid"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-gray-500">Order Delivery Notes (Optional)</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="e.g. Please deliver after 2:00 PM or leave with security guard"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Selection */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div className="border-b pb-3">
                  <h3 className="text-base font-black text-dkart-charcoal">
                    3. Select Payment Method
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery (COD) - Default & Highlighted */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod'
                        ? 'border-dkart-blue bg-blue-50/40 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="mt-1 text-dkart-blue focus:ring-dkart-blue"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-dkart-charcoal flex items-center gap-1.5">
                          <Banknote size={18} className="text-dkart-blue" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay with cash directly to the courier rider upon delivery at your doorstep. Safe & zero risk.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Online Card / EasyPaisa / JazzCash */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'card'
                        ? 'border-dkart-blue bg-blue-50/40 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="mt-1 text-dkart-blue focus:ring-dkart-blue"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-dkart-charcoal flex items-center gap-1.5">
                          <CreditCard size={18} className="text-gray-600" />
                          Online Payment (Debit / Credit / EasyPaisa)
                        </span>
                        <span className="text-xs text-gray-400">Instant Verification</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Seamless instant digital payment simulation with full receipt generation.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5 sticky top-24">
                <h3 className="text-base font-black text-dkart-charcoal border-b pb-3">
                  Your Order ({cartItems.length} items)
                </h3>

                {/* Items List Mini */}
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1 no-scrollbar space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-50"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-dkart-charcoal truncate">
                          {item.title}
                        </h4>
                        {item.variantName && item.variantName !== 'Standard' && (
                          <p className="text-[11px] text-gray-400">{item.variantName}</p>
                        )}
                      </div>

                      <span className="text-xs font-bold text-dkart-charcoal flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-xs pt-3 border-t border-gray-100 text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-dkart-charcoal">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount ({coupon?.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Nationwide Delivery</span>
                    <span>
                      {shippingFee === 0 ? (
                        <strong className="text-emerald-600 uppercase font-bold">FREE</strong>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-black text-dkart-charcoal pt-3 border-t border-gray-200">
                    <span>Total Payable</span>
                    <span className="text-dkart-blue text-lg">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Primary Conversion CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-dkart-orange hover:bg-dkart-orange-hover text-white rounded-xl font-black text-sm sm:text-base shadow-md transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Booking Your Order...
                    </span>
                  ) : (
                    <span>
                      {formData.paymentMethod === 'cod'
                        ? `Place Order (Pay ${formatPrice(finalTotal)} on Delivery)`
                        : `Complete Order (${formatPrice(finalTotal)})`}
                    </span>
                  )}
                </button>

                {/* Trust Footer */}
                <div className="space-y-2 pt-2 text-[11px] text-gray-400 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-medium text-dkart-charcoal">
                    <Lock size={12} className="text-emerald-600" />
                    <span>256-Bit SSL Encrypted & Protected Checkout</span>
                  </div>
                  <p>
                    By placing your order, you agree to Dkart's 7-Day Replacement Policy and Terms of Service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

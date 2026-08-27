import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Tag,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    subtotal,
    shippingFee,
    remainingForFreeShipping,
    progressToFreeShipping,
    coupon,
    discountAmount,
    finalTotal,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setApplyingCoupon(false);
    setCouponInput('');
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-up">
          {/* Cart Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-dkart-blue-light text-dkart-blue flex items-center justify-center font-bold">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-dkart-charcoal">Your Shopping Cart</h2>
                <p className="text-xs text-gray-500">{cartItems.length} unique items</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-blue-50/60 p-3.5 border-b border-blue-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-dkart-charcoal mb-1.5">
              <Truck size={15} className="text-dkart-blue flex-shrink-0" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-dkart-blue">{formatPrice(remainingForFreeShipping)}</strong> more to get{' '}
                  <span className="text-emerald-600 uppercase font-bold">Free Nationwide Delivery</span>!
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Congratulations! You unlocked FREE Delivery across Pakistan!
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-dkart-blue h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <ShoppingBag size={36} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dkart-charcoal">Your cart is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Explore our collection of bestselling smart gadgets, stylers, and grooming gear.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-dkart-blue text-white rounded-xl text-xs font-bold shadow-dkart hover:bg-dkart-blue-hover transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition shadow-xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'}
                    alt={item.title}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-dkart-charcoal line-clamp-1">
                          {item.title}
                        </h4>
                        {item.variantName && item.variantName !== 'Standard' && (
                          <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {item.variantName}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantName)}
                        className="text-gray-400 hover:text-red-500 p-1 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition text-xs font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-dkart-charcoal bg-white min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition text-xs font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-dkart-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 space-y-3">
              {/* Coupon Form */}
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <Tag size={14} />
                    <span>Coupon <strong>{coupon.code}</strong> applied (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. DKART10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs uppercase bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-dkart-blue"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 py-2 bg-dkart-dark text-white rounded-xl text-xs font-bold hover:bg-black transition disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Details */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dkart-charcoal">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-600 uppercase">FREE</strong>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-dkart-charcoal pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-dkart-blue">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Prominent Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-dkart hover:shadow-dkart-lg transition-all duration-200 active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-center text-gray-400">
                🔒 Safe & Secure Checkout • Cash on Delivery Available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

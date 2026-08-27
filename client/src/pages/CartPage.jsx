import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

export default function CartPage() {
  const {
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
    clearCart
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-black text-dkart-charcoal">Your Cart is Currently Empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Explore our trending Pakistani collection of smartwatches, stylers, and personal grooming gear.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-dkart-blue text-white rounded-xl font-bold text-sm shadow-dkart hover:bg-dkart-blue-hover transition"
        >
          Start Shopping Now
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal mb-6">
          Shopping Cart ({cartItems.length} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Cart Items Table */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free shipping banner */}
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-dkart-charcoal">
                <Truck size={18} className="text-dkart-blue flex-shrink-0" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-dkart-blue">{formatPrice(remainingForFreeShipping)}</strong> more to get{' '}
                    <strong className="text-emerald-700">FREE Nationwide Delivery!</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    🎉 You have qualified for FREE Shipping across Pakistan!
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

            {/* Items Card List */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-50 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      to={`/product/${item.slug}`}
                      className="text-sm sm:text-base font-bold text-dkart-charcoal hover:text-dkart-blue transition line-clamp-1"
                    >
                      {item.title}
                    </Link>

                    {item.variantName && item.variantName !== 'Standard' && (
                      <p className="text-xs text-gray-500">Edition: {item.variantName}</p>
                    )}

                    <p className="text-sm font-extrabold text-dkart-blue">
                      {formatPrice(item.price)}
                    </p>

                    {/* Mobile Stepper and Remove */}
                    <div className="flex items-center gap-4 pt-2 sm:hidden">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 font-bold"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 font-bold"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.variantName)}
                        className="text-xs text-red-500 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Desktop Stepper & Line Total */}
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition font-bold"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition font-bold"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <p className="text-base font-black text-dkart-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.variantName)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link to="/shop" className="text-xs font-bold text-dkart-blue hover:underline">
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs font-bold text-gray-400 hover:text-red-500"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-black text-dkart-charcoal border-b pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-dkart-charcoal">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
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
              <div className="flex justify-between text-lg font-black text-dkart-charcoal pt-3 border-t">
                <span>Final Total</span>
                <span className="text-dkart-blue">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-dkart hover:shadow-dkart-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2 font-bold text-dkart-charcoal">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Cash on Delivery Available</span>
              </div>
              <p className="text-[11px]">
                Inspect your parcel upon arrival and pay cash directly to the TCS / Leopard courier rider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

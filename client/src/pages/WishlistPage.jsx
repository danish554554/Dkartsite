import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto">
          <Heart size={38} />
        </div>
        <h2 className="text-2xl font-black text-dkart-charcoal">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Save your favorite smart gadgets, stylers, and personal grooming essentials to purchase later.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-dkart-blue text-white rounded-xl font-bold text-xs shadow-dkart hover:bg-dkart-blue-hover transition"
        >
          Explore Best Sellers
        </Link>
      </div>
    );
  }

  const handleMoveToCart = (item) => {
    addToCart(item, null, 1);
    removeFromWishlist(item.id);
  };

  return (
    <div className="bg-[#F8F9FB] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight">
              My Saved Items ({wishlistItems.length})
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Items saved to your wishlist are available for quick ordering with Cash on Delivery.
            </p>
          </div>

          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-gray-400 hover:text-red-500 transition"
          >
            Clear Wishlist
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-card transition"
            >
              <div className="space-y-3">
                <div className="relative aspect-square rounded-xl bg-gray-50 overflow-hidden">
                  <img
                    src={item.primary_image || (item.images && item.images[0]?.url) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/90 text-gray-400 hover:text-red-500 rounded-full shadow-xs transition"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {item.category_name || 'Category'}
                  </span>
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="text-sm font-bold text-dkart-charcoal hover:text-dkart-blue transition line-clamp-2 mt-0.5">
                      {item.title}
                    </h3>
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-dkart-charcoal">
                    {formatPrice(item.sale_price || item.price)}
                  </span>
                  {item.sale_price && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  className="w-full py-2.5 bg-dkart-blue hover:bg-dkart-blue-hover text-white rounded-xl text-xs font-bold shadow-dkart flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <ShoppingBag size={14} />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

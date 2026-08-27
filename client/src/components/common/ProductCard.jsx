import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/helpers';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const currentPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price;
  const originalPrice = product.sale_price ? product.price : null;
  const discountPercent = product.discount_percentage || (originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

    setTimeout(() => {
      addToCart(product, null, 1);
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }, 200);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#F6F7F9] overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="bg-dkart-orange text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm tracking-tight">
              -{discountPercent}% OFF
            </span>
          )}
          {product.badge && (
            <span className="bg-dkart-dark/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition shadow-xs ${
            isFavorite
              ? 'bg-red-50 text-red-500'
              : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Product Link & Main Image */}
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="truncate max-w-[130px] font-medium text-gray-400">
              {product.category_name || 'Electronics & Care'}
            </span>
            <div className="flex items-center gap-1 font-semibold text-amber-500">
              <Star size={13} fill="currentColor" />
              <span>{product.rating_average || 4.8}</span>
              {product.rating_count > 0 && (
                <span className="text-gray-400 font-normal text-[11px]">({product.rating_count})</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-semibold text-dkart-charcoal hover:text-dkart-blue transition line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-dkart-charcoal tracking-tight">
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Action Button: Add to Cart */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || product.is_in_stock === false}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : product.is_in_stock === false
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-dkart-blue hover:bg-dkart-blue-hover text-white shadow-dkart hover:shadow-dkart-lg'
            }`}
          >
            {justAdded ? (
              <>
                <Check size={16} /> Added to Cart!
              </>
            ) : product.is_in_stock === false ? (
              'Out of Stock'
            ) : isAdding ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <ShoppingBag size={15} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

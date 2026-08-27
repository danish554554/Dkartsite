import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  Zap,
  Heart,
  Check,
  ChevronRight,
  Share2,
  ChevronDown,
  Info,
  Clock,
  MapPin,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatPrice, calculateDiscount, trackEvent } from '../utils/helpers';
import ProductCard from '../components/common/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('features'); // 'features' | 'specs' | 'delivery' | 'reviews'

  // Review submission state
  const [reviewForm, setReviewForm] = useState({ name: '', city: 'Karachi', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Sticky mobile bottom bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buySectionRef = useRef(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await api.getProductBySlug(slug);
        if (res.success) {
          setProduct(res.data);
          setSelectedImageIndex(0);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariant(res.data.variants[0]);
          }
          // Analytics Track Product View
          trackEvent('ViewContent', {
            content_name: res.data.title,
            content_category: res.data.category_name,
            content_ids: [res.data.id],
            value: res.data.sale_price || res.data.price,
            currency: 'PKR'
          });
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  // Observer for sticky buy bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!buySectionRef.current) return;
      const rect = buySectionRef.current.getBoundingClientRect();
      // Show sticky bar when the main button has scrolled out of view
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-gray-500">The product you are looking for might have been moved or discontinued.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-dkart-blue text-white rounded-xl font-bold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const effectivePrice = (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price) + (selectedVariant?.price_modifier || 0);
  const originalPrice = product.sale_price ? product.price + (selectedVariant?.price_modifier || 0) : null;
  const discountPercent = product.discount_percentage || (originalPrice ? calculateDiscount(originalPrice, effectivePrice) : 0);
  const isFavorite = isInWishlist(product.id);

  const images = product.images || [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' }];

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      addToast('Please enter your name and comments.', 'error');
      return;
    }
    try {
      setIsSubmittingReview(true);
      const res = await api.submitReview({
        productId: product.id,
        userName: reviewForm.name,
        city: reviewForm.city,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      if (res.success) {
        addToast('Thank you! Your verified review was added.', 'success');
        setReviewForm({ name: '', city: 'Karachi', rating: 5, comment: '' });
        // Refresh product data
        const updated = await api.getProductBySlug(slug);
        if (updated.success) setProduct(updated.data);
      }
    } catch (err) {
      addToast('Failed to submit review. Try again.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24 md:pb-16">
      {/* 1. BREADCRUMBS */}
      <div className="bg-gray-50 border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-dkart-blue whitespace-nowrap">Home</Link>
          <ChevronRight size={13} />
          <Link to="/shop" className="hover:text-dkart-blue whitespace-nowrap">Shop</Link>
          <ChevronRight size={13} />
          <Link to={`/shop?category=${product.category_slug}`} className="hover:text-dkart-blue whitespace-nowrap">
            {product.category_name}
          </Link>
          <ChevronRight size={13} />
          <span className="font-semibold text-dkart-charcoal truncate max-w-[200px] sm:max-w-none">
            {product.title}
          </span>
        </div>
      </div>

      {/* 2. MAIN PRODUCT HERO LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: MULTI-IMAGE GALLERY (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-3xl bg-[#F6F7F9] border border-gray-200/80 overflow-hidden group">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {discountPercent > 0 && (
                  <span className="bg-dkart-orange text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.badge && (
                  <span className="bg-dkart-dark text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 z-10 p-3 rounded-full shadow-sm backdrop-blur-md transition ${
                  isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>

              <img
                src={images[selectedImageIndex]?.url || product.primary_image}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                      selectedImageIndex === idx
                        ? 'border-dkart-blue shadow-md scale-102'
                        : 'border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT INFO & CONVERSION ACTIONS (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Brand Tag */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-dkart-blue bg-dkart-blue-light px-2.5 py-0.5 rounded-md">
                  {product.brand || 'Dkart Official'}
                </span>
                <span className="text-xs text-gray-400">• SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight leading-snug">
                {product.title}
              </h1>

              {product.tagline && (
                <p className="text-sm text-gray-500 font-medium">
                  {product.tagline}
                </p>
              )}
            </div>

            {/* Rating Stars & Customer Count */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(product.rating_average || 5) ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="ml-1 text-dkart-charcoal">{product.rating_average || 4.8}</span>
              </div>
              <span className="text-gray-300">|</span>
              <a href="#reviews" className="text-xs font-semibold text-dkart-blue hover:underline">
                {product.reviews?.length || 0} Verified Pakistani Reviews
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check size={14} /> 100% Original
              </span>
            </div>

            {/* High-Impact Price Section */}
            <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-gray-200/80 space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-dkart-charcoal tracking-tight">
                  {formatPrice(effectivePrice)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-gray-400 line-through font-semibold">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-dkart-orange text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                    Save {discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  <strong>In Stock:</strong> Ready for express courier dispatch from Karachi Hub
                </span>
              </div>
            </div>

            {/* Variant Selector (e.g. Colors, Editions) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-dkart-charcoal">
                  Select Edition / Color: <strong className="text-dkart-blue">{selectedVariant?.variant_name}</strong>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-dkart-blue bg-dkart-blue-light/40 text-dkart-blue shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      {v.variant_name}
                      {v.price_modifier > 0 && ` (+${formatPrice(v.price_modifier)})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-dkart-charcoal">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-200 transition font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-sm bg-white min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2 text-gray-600 hover:bg-gray-200 transition font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  Total: <strong className="text-dkart-charcoal">{formatPrice(effectivePrice * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* CONVERSION ACTION BUTTONS (Add to Cart & Buy Now) */}
            <div ref={buySectionRef} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm bg-white border-2 border-dkart-blue text-dkart-blue hover:bg-dkart-blue-light transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm bg-dkart-blue hover:bg-dkart-blue-hover text-white shadow-dkart-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Zap size={18} className="fill-white" />
                  <span>Buy Now (Cash on Delivery)</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-gray-400 font-medium">
                ⚡ Order within the next 4 hours for dispatch tomorrow!
              </p>
            </div>

            {/* Delivery & Trust Reassurance Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs">
              <div className="flex items-start gap-2.5">
                <Truck size={18} className="text-dkart-orange flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-dkart-charcoal">Nationwide Delivery</h4>
                  <p className="text-gray-500 text-[11px]">2-4 Business days via TCS / Leopard</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-dkart-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-dkart-charcoal">Cash on Delivery</h4>
                  <p className="text-gray-500 text-[11px]">Pay when your parcel arrives</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <RotateCcw size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-dkart-charcoal">7-Day Replacement</h4>
                  <p className="text-gray-500 text-[11px]">Doorstep exchange for defects</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-dkart-charcoal">Origin Guarantee</h4>
                  <p className="text-gray-500 text-[11px]">Inspected & certified Dkart stock</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT DETAILS ACCORDION & TABS */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          {/* Tab buttons */}
          <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-4 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'features'
                  ? 'border-dkart-blue text-dkart-blue'
                  : 'border-transparent text-gray-500 hover:text-dkart-charcoal'
              }`}
            >
              Key Features & Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-dkart-blue text-dkart-blue'
                  : 'border-transparent text-gray-500 hover:text-dkart-charcoal'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`pb-4 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'delivery'
                  ? 'border-dkart-blue text-dkart-blue'
                  : 'border-transparent text-gray-500 hover:text-dkart-charcoal'
              }`}
            >
              Delivery & COD Policies
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              id="reviews"
              className={`pb-4 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-dkart-blue text-dkart-blue'
                  : 'border-transparent text-gray-500 hover:text-dkart-charcoal'
              }`}
            >
              Customer Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6 max-w-4xl">
                <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>

                {product.key_features && product.key_features.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h3 className="text-base font-bold text-dkart-charcoal">Highlight Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.key_features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                          <Check size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specs Tab */}
            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                  <tbody>
                    {Object.entries(product.specs || {}).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 font-bold text-dkart-charcoal w-1/3 border-b border-gray-100">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-gray-600 border-b border-gray-100">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-gray-600">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                  <h4 className="font-bold text-dkart-blue">How Cash on Delivery Works in Pakistan:</h4>
                  <p>
                    1. You place your order online with your complete address and mobile number.
                    <br />
                    2. Our logistics team verifies your parcel and hands it to TCS or Leopard courier.
                    <br />
                    3. The rider brings the parcel to your doorstep in 2 to 4 business days.
                    <br />
                    4. You pay the exact rupee amount in cash to the rider upon receiving the package.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-bold text-dkart-charcoal">7-Day Replacement Policy:</h4>
                  <p>
                    Every Dkart product is thoroughly tested before packing. If your item arrives damaged, non-functional, or missing accessories, WhatsApp our official helpline at <strong>0300-1234567</strong> within 7 days for a free replacement.
                  </p>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="max-w-4xl space-y-8">
                {/* Review Summary Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-gray-50 border border-gray-200/80 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black text-dkart-charcoal">
                      {product.rating_average || 4.8}
                    </div>
                    <div>
                      <div className="flex text-amber-500 gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={18} fill="currentColor" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {product.reviews?.length || 0} Pakistani customer ratings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl border border-gray-200 space-y-4">
                  <h4 className="text-sm font-bold text-dkart-charcoal">Write a Review for this Product</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="p-2.5 border rounded-xl bg-gray-50"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Your City (e.g. Lahore, Karachi)"
                      value={reviewForm.city}
                      onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
                      className="p-2.5 border rounded-xl bg-gray-50"
                    />
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      className="p-2.5 border rounded-xl bg-gray-50 font-semibold text-amber-600"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                      <option value="3">⭐⭐⭐ (3 Stars - Average)</option>
                      <option value="2">⭐⭐ (2 Stars)</option>
                      <option value="1">⭐ (1 Star)</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Describe your experience with the product, delivery speed, and build quality..."
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 text-xs focus:outline-none focus:border-dkart-blue"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 bg-dkart-blue text-white rounded-xl text-xs font-bold hover:bg-dkart-blue-hover transition"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Post Verified Review'}
                  </button>
                </form>

                {/* Existing Reviews List */}
                <div className="space-y-3">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-dkart-charcoal">{rev.user_name}</span>
                            <span className="text-gray-400">• {rev.city}</span>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                              Verified Buyer
                            </span>
                          </div>
                          <div className="flex text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={13} fill={s <= rev.rating ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. RELATED PRODUCTS CAROUSEL */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-xl sm:text-2xl font-black text-dkart-charcoal mb-6">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {product.relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. STICKY MOBILE ADD TO CART / BUY NOW BAR (Conversion Booster for Ads) */}
      {showStickyBar && (
        <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={images[0]?.url || product.primary_image}
              alt=""
              className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-dkart-charcoal truncate">{product.title}</p>
              <p className="text-xs font-extrabold text-dkart-blue">{formatPrice(effectivePrice)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-xl border border-dkart-blue text-dkart-blue bg-blue-50 font-bold active:scale-95"
              aria-label="Add to cart"
            >
              <ShoppingBag size={18} />
            </button>
            <button
              onClick={handleBuyNow}
              className="px-4 py-2.5 bg-dkart-blue text-white rounded-xl text-xs font-extrabold shadow-dkart active:scale-95 whitespace-nowrap"
            >
              Buy Now (COD)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

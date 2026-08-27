import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';
import { trackEvent } from '../utils/helpers';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dkart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('dkart_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('dkart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('dkart_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('dkart_coupon');
    }
  }, [coupon]);

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const FREE_SHIPPING_THRESHOLD = 3000;
  const STANDARD_SHIPPING = 199;

  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  // Recalculate discount based on current subtotal
  const discountAmount = useMemo(() => {
    if (!coupon || subtotal === 0) return 0;
    if (coupon.discountType === 'percentage') {
      return Math.round((subtotal * coupon.discountValue) / 100);
    }
    return Math.min(coupon.discountValue, subtotal);
  }, [coupon, subtotal]);

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const addToCart = (product, selectedVariant = null, quantity = 1) => {
    const variantName = selectedVariant ? selectedVariant.variant_name : 'Standard';
    const effectivePrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price;
    const finalUnitPrice = effectivePrice + (selectedVariant?.price_modifier || 0);

    const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || '';

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variantName === variantName
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `${product.id}-${variantName}`,
            productId: product.id,
            title: product.title,
            slug: product.slug,
            price: finalUnitPrice,
            image: primaryImage,
            variantName,
            quantity,
            stockQuantity: product.stock_quantity || 50
          }
        ];
      }
    });

    addToast(`Added "${product.title}" to cart.`, 'success');
    setIsCartOpen(true);

    trackEvent('AddToCart', {
      content_name: product.title,
      content_category: product.category_name,
      content_ids: [product.id],
      value: finalUnitPrice * quantity,
      currency: 'PKR'
    });
  };

  const updateQuantity = (productId, variantName, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, variantName);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantName === variantName
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, variantName) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantName === variantName))
    );
    addToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.verifyCoupon(code, subtotal);
      if (res.success) {
        setCoupon(res.coupon);
        addToast(res.message, 'success');
        return { success: true };
      }
    } catch (error) {
      addToast(error.message || 'Invalid coupon code', 'error');
      return { success: false, message: error.message };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Coupon removed.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCount,
        subtotal,
        shippingFee,
        remainingForFreeShipping,
        progressToFreeShipping,
        coupon,
        discountAmount,
        finalTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

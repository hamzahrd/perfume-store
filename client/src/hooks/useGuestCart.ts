import { useState, useEffect, useCallback } from "react";

interface GuestCartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
}

const GUEST_CART_KEY = "guest-cart";

// Custom event to sync cart across components
const CART_UPDATE_EVENT = "guest-cart-updated";

export function useGuestCart() {
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      if (stored) {
        try {
          setCartItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse guest cart:", e);
        }
      }
    };
    
    loadCart();
    
    // Listen for cart updates from other components
    const handleCartUpdate = () => loadCart();
    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
    };
  }, []);

  const saveCart = useCallback((items: GuestCartItem[]) => {
    setCartItems(items);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    // Dispatch event to sync other components
    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT));
  }, []);

  const addItem = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    const currentItems: GuestCartItem[] = stored ? JSON.parse(stored) : [];
    
    const existing = currentItems.find((item) => 
      item.productId === productId && item.selectedSize === selectedSize
    );

    let newItems: GuestCartItem[];
    if (existing) {
      newItems = currentItems.map((item) =>
        item.productId === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...currentItems, { productId, quantity, selectedSize }];
    }
    
    saveCart(newItems);
  }, [saveCart]);

  const removeItem = useCallback((productId: string, selectedSize?: string) => {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    const currentItems: GuestCartItem[] = stored ? JSON.parse(stored) : [];
    
    const filtered = currentItems.filter(
      (item) => !(item.productId === productId && item.selectedSize === selectedSize)
    );
    saveCart(filtered);
  }, [saveCart]);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    const currentItems: GuestCartItem[] = stored ? JSON.parse(stored) : [];
    
    if (quantity <= 0) {
      const filtered = currentItems.filter(
        (item) => !(item.productId === productId && item.selectedSize === selectedSize)
      );
      saveCart(filtered);
    } else {
      const updated = currentItems.map((item) =>
        item.productId === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      );
      saveCart(updated);
    }
  }, [saveCart]);

  const clearCart = useCallback(() => {
    saveCart([]);
  }, [saveCart]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
  };
}

"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  whatsapp?: string;
  loyaltyPoints: number;
  addresses?: Array<{
    id: string;
    landmark?: string;
    area: string;
    fullAddress: string;
  }>;
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  user: User | null;
  token: string | null;
  loginUser: (token: string, user: User) => void;
  logoutUser: () => void;
  appliedCoupon: { code: string; discountPercent: number; maxDiscount: number | null } | null;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCouponCode: () => void;
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppContextType['appliedCoupon']>(null);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('ziyafat_cart');
    const savedToken = localStorage.getItem('ziyafat_token');
    const savedUser = localStorage.getItem('ziyafat_user');
    const savedLang = localStorage.getItem('ziyafat_lang');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedLang) setLanguage(savedLang as 'en' | 'ur');
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('ziyafat_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const loginUser = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ziyafat_token', newToken);
    localStorage.setItem('ziyafat_user', JSON.stringify(newUser));
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ziyafat_token');
    localStorage.removeItem('ziyafat_user');
  };

  const applyCouponCode = async (code: string) => {
    try {
      const res = await fetch(`${API_BASE}/coupons/validate?code=${code}`);
      const data = await res.json();
      if (data.valid) {
        const couponInfo = {
          code: code.toUpperCase(),
          discountPercent: data.discountPercent,
          maxDiscount: data.maxDiscount,
        };
        setAppliedCoupon(couponInfo);
        return { success: true, message: `Promo code ${code} applied successfully!` };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
    } catch (err) {
      return { success: false, message: 'Server connection error. Failed to validate coupon.' };
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  const toggleLanguage = (lang: 'en' | 'ur') => {
    setLanguage(lang);
    localStorage.setItem('ziyafat_lang', lang);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        user,
        token,
        loginUser,
        logoutUser,
        appliedCoupon,
        applyCouponCode,
        removeCouponCode,
        language,
        setLanguage: toggleLanguage,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

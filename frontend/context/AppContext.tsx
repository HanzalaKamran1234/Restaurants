"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
  size: string;
  color: string;
}

export interface CustomerAddress {
  id: string;
  title: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  whatsapp?: string;
  addresses?: CustomerAddress[];
  favoriteItems?: any[];
  loyaltyPoints?: number;
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, customQuantity?: number) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  user: User | null;
  token: string | null;
  loginUser: () => void;
  logoutUser: () => Promise<void>;
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Address Management
  addresses: CustomerAddress[];
  addAddress: (title: string, fullAddress: string, city: string, province: string, postalCode: string, phone: string) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  
  // Favorites
  favorites: any[];
  toggleFavorite: (itemId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Address & favorite states
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('vestra_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  // Sync profile details if Clerk reports signed-in status
  useEffect(() => {
    const syncProfile = async () => {
      if (isSignedIn) {
        try {
          const sessionToken = await getToken();
          setToken(sessionToken);

          // Call internal profile sync API
          const res = await fetch('/api/auth/profile');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              if (data.user.addresses) setAddresses(data.user.addresses);
              if (data.user.favorites) setFavorites(data.user.favorites);
            }
          }
        } catch (err) {
          console.error('Error synchronizing database profile with Clerk:', err);
        }
      } else {
        setUser(null);
        setToken(null);
        setAddresses([]);
        setFavorites([]);
      }
    };

    syncProfile();
  }, [isSignedIn, clerkUser]);

  // Save cart to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('vestra_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (item: CartItem, customQuantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size && i.color === item.color);
      if (existing) {
        return prev.map((i) => (i.id === item.id && i.size === item.size && i.color === item.color ? { ...i, quantity: i.quantity + customQuantity } : i));
      }
      return [...prev, { ...item, quantity: customQuantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size && item.color === color)));
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const loginUser = () => {
    window.location.href = '/login';
  };

  const logoutUser = async () => {
    await signOut();
    setUser(null);
    setToken(null);
    setAddresses([]);
    setFavorites([]);
    window.location.href = '/';
  };

  // Saved Addresses Operations
  const addAddress = async (title: string, fullAddress: string, city: string, province: string, postalCode: string, phone: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, fullAddress, city, province, postalCode, phone })
      });
      if (res.ok) {
        // Refresh profile details to load updated addresses
        const profileRes = await fetch('/api/auth/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.user?.addresses) {
            setAddresses(profileData.user.addresses);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Favorites Operations
  const toggleFavorite = async (itemId: string) => {
    try {
      const res = await fetch(`/api/auth/favorites/${itemId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const profileRes = await fetch('/api/auth/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.user?.favorites) {
            setFavorites(profileData.user.favorites);
          }
        }
      }
    } catch (err) {
      console.log('Error toggling favorite item');
    }
  };

  const toggleLanguage = (lang: 'en' | 'ur') => {
    // English only, no-op
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
        language,
        setLanguage: toggleLanguage,
        isCartOpen,
        setIsCartOpen,
        addresses,
        addAddress,
        deleteAddress,
        favorites,
        toggleFavorite
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

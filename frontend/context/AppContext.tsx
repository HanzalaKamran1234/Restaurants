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
}

export interface DeliveryArea {
  id: string;
  name: string;
  deliveryCharge: number;
  estimatedTime: string;
  minOrderAmount: number;
  available: boolean;
}

export interface CustomerAddress {
  id: string;
  title: string;
  landmark?: string;
  areaId: string;
  area: DeliveryArea;
  fullAddress: string;
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
  addToCart: (item: Omit<CartItem, 'quantity'>, customQuantity?: number) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
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
  addAddress: (title: string, areaId: string, landmark: string, fullAddress: string) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  
  // Favorites
  favorites: any[];
  toggleFavorite: (itemId: string) => Promise<void>;
  
  // Delivery Areas
  deliveryAreas: DeliveryArea[];
  loadDeliveryAreas: () => void;
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

  // address & favorite states
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('ziyafat_cart');
    const savedLang = localStorage.getItem('ziyafat_lang');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedLang) setLanguage(savedLang as 'en' | 'ur');

    loadDeliveryAreas();
  }, []);

  // Fetch Delivery Areas from database
  const loadDeliveryAreas = async () => {
    try {
      const res = await fetch('/api/extra/delivery-areas');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDeliveryAreas(data);
      }
    } catch (err) {
      console.log('Failed to fetch delivery areas, using fallback');
      setDeliveryAreas([
        {
          id: 'area-north',
          name: 'North Nazimabad',
          deliveryCharge: 150,
          estimatedTime: '30 Mins',
          minOrderAmount: 300,
          available: true
        }
      ]);
    }
  };

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
              if (data.user.favoriteItems) setFavorites(data.user.favoriteItems);
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
      localStorage.setItem('ziyafat_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, customQuantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size);
      if (existing) {
        return prev.map((i) => (i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + customQuantity } : i));
      }
      return [...prev, { ...item, quantity: customQuantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id && item.size === size ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const loginUser = () => {
    // Redirect to Clerk sign in wrap
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
  const addAddress = async (title: string, areaId: string, landmark: string, fullAddress: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, areaId, landmark, fullAddress })
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
          if (profileData.user?.favoriteItems) {
            setFavorites(profileData.user.favoriteItems);
          }
        }
      }
    } catch (err) {
      console.log('Error toggling favorite item');
    }
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
        language,
        setLanguage: toggleLanguage,
        isCartOpen,
        setIsCartOpen,
        addresses,
        addAddress,
        deleteAddress,
        favorites,
        toggleFavorite,
        deliveryAreas,
        loadDeliveryAreas
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

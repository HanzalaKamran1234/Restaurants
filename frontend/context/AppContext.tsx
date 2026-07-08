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
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // v2 Address Management
  addresses: CustomerAddress[];
  addAddress: (title: string, areaId: string, landmark: string, fullAddress: string) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  
  // v2 Favorites
  favorites: any[];
  toggleFavorite: (itemId: string) => Promise<void>;
  
  // v2 Delivery Areas
  deliveryAreas: DeliveryArea[];
  loadDeliveryAreas: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // v2 states
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);

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

    loadDeliveryAreas();
  }, []);

  // Fetch Delivery Areas from database
  const loadDeliveryAreas = async () => {
    try {
      const res = await fetch(`${API_BASE}/extra/delivery-areas`);
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

  // Sync profile details if logged in
  useEffect(() => {
    if (token) {
      fetchProfileData();
    } else {
      setAddresses([]);
      setFavorites([]);
    }
  }, [token]);

  const fetchProfileData = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        if (data.user.addresses) setAddresses(data.user.addresses);
        if (data.user.favoriteItems) setFavorites(data.user.favoriteItems);
      }
    } catch (err) {
      console.log('Error loading user profile details');
    }
  };

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
    setAddresses([]);
    setFavorites([]);
    localStorage.removeItem('ziyafat_token');
    localStorage.removeItem('ziyafat_user');
  };

  // v2 Saved Addresses Operations
  const addAddress = async (title: string, areaId: string, landmark: string, fullAddress: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, areaId, landmark, fullAddress })
      });
      if (res.ok) {
        await fetchProfileData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchProfileData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // v2 Favorites Operations
  const toggleFavorite = async (itemId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/favorites/${itemId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchProfileData();
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

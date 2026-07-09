"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  Search, Star, Clock, ShoppingCart, Flame, Heart, X, Plus, Minus,
  AlertCircle, Check, Loader2, ArrowRight
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients?: string;
  calories?: number;
  spiceLevel: string;
  servingSize: string;
  price: number;
  discount: number;
  available: boolean;
  prepTime: number;
  rating: number;
  image: string;
  categoryId: string;
  sizes?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const categoryPills = [
  { label: 'All', slug: 'all', ur: 'تمام' },
  { label: 'Fast Food', slug: 'fast-food', ur: 'فاسٹ فوڈ' },
  { label: 'Burgers', slug: 'burgers', ur: 'برگر' },
  { label: 'Hot Wings', slug: 'hot-wings', ur: 'ہوٹ ونگز' },
  { label: 'Shawarma', slug: 'shawarma', ur: 'شاورما' },
  { label: 'Rolls', slug: 'paratha-roll', ur: 'رول' },
  { label: 'Snacks', slug: 'snacks', ur: 'سنیکس' },
  { label: 'Pasta', slug: 'pasta-macaroni', ur: 'پاستا' },
  { label: 'Desi Cuisine', slug: 'desi-cuisine', ur: 'روایتی کھانے' },
  { label: 'Karahi', slug: 'karahi', ur: 'کڑاہی' }
];

export default function Menu() {
  const { language, addToCart, favorites, toggleFavorite, token, cart, setIsCartOpen } = useApp();
  const t = translations[language];

  // States
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Selected item modal detail
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Card interaction states
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  // Sync category and search query parameters from URL on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const searchParam = params.get('search');
      if (catParam) setSelectedCategory(catParam);
      if (searchParam) setSearchQuery(searchParam);
    }
  }, []);

  // Fetch Menu from API
  const loadMenu = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/menu`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Connection failed. Server returned an error.');
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          throw new Error('Malformed menu data received.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Server connection error. Failed to retrieve dishes.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMenu();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-text-muted font-sans text-xs">
        Loading Ziyafat Gastronomy...
      </div>
    );
  }

  // Categories helper mapping for snacks/sub-slugs
  const matchCategory = (item: MenuItem, slug: string) => {
    if (slug === 'all') return true;
    const itemCat = item.category?.slug || '';
    if (slug === 'snacks') {
      return ['spring-rolls', 'samosa', 'chicken-samosa', 'sandwiches'].includes(itemCat);
    }
    return itemCat === slug;
  };

  // Filter & Search Logic
  const filtered = items.filter((item) => {
    // 1. Category
    if (!matchCategory(item, selectedCategory)) return false;

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = item.name.toLowerCase();
      const desc = item.description.toLowerCase();
      const catName = item.category?.name.toLowerCase() || '';
      if (!name.includes(q) && !desc.includes(q) && !catName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    }
    // Default Popular
    return b.rating - a.rating;
  });

  // Size/Portion selections helpers
  const getSelectedSizeName = (item: MenuItem) => {
    if (selectedSizes[item.id]) return selectedSizes[item.id];
    let parsedSizes = [];
    if (item.sizes) {
      try {
        parsedSizes = JSON.parse(item.sizes);
      } catch (e) {}
    }
    return parsedSizes[0]?.size || 'Regular';
  };

  const handleSelectSize = (itemId: string, sizeName: string) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: sizeName }));
  };

  const getQuantity = (itemId: string) => {
    return quantities[itemId] || 1;
  };

  const adjustQty = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const cur = prev[itemId] || 1;
      return { ...prev, [itemId]: Math.max(1, cur + delta) };
    });
  };

  // Add to Cart from card
  const handleAddToCart = (item: MenuItem) => {
    let parsedSizes = [];
    if (item.sizes) {
      try {
        parsedSizes = JSON.parse(item.sizes);
      } catch (e) {}
    }

    const sizeName = selectedSizes[item.id] || parsedSizes[0]?.size || 'Regular';
    const matchedSizeObj = parsedSizes.find((s: any) => s.size === sizeName);
    const sizePrice = matchedSizeObj ? matchedSizeObj.price : item.price;
    const qty = quantities[item.id] || 1;

    addToCart({
      id: item.id,
      name: item.name,
      price: sizePrice,
      discount: item.discount,
      image: item.image,
      size: sizeName
    }, qty);

    // Trigger visual animation feedback
    setAddedStatus((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedStatus((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  // Floating sticky cart calculations
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);

  return (
    <div className="w-full relative z-10 font-sans min-h-screen bg-[#060606] text-white">
      
      {/* 1. PREMIUM CULINARY HERO */}
      <section className="relative h-[320px] flex items-center justify-center overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-15 filter blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-background/90 to-background/50"></div>
        {/* Ambient Red glow leaks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/20 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-4 max-w-xl px-4 mt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 border border-primary/30 rounded-full text-[10px] font-bold text-primary-light uppercase tracking-wider">
            <Flame size={12} className="animate-pulse text-primary-light" />
            <span>{language === 'en' ? 'Royal Gastronomy' : 'شاہی ضیافت'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-wide text-white">
            {language === 'en' ? 'Our Menu' : <span className="font-urdu">ہمارا مینو</span>}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted font-light tracking-wide">
            Freshly Prepared • Premium Quality • Delivered to Your Door
          </p>

          {/* Interactive Hero Search */}
          <div className="pt-2">
            <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-full focus-within:border-primary/50 shadow-xl transition-all max-w-md mx-auto">
              <Search className="text-text-muted ml-3 flex-shrink-0" size={16} />
              <input
                type="text"
                aria-label={t.searchPlaceholder}
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 py-2.5 pl-2.5 pr-4 text-xs text-white focus:outline-none placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-white/10 rounded-full text-text-muted hover:text-white mr-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* 2. CATEGORY PILLS (Horizontal Scroll Container) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-wider">
            <span>Browse Categories</span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-primary-light hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div 
            className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoryPills.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-primary shadow-lg shadow-primary/20 scale-102'
                      : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {language === 'en' ? cat.label : cat.ur}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. CONTROLS TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/5 p-4.5 rounded-2xl">
          <div className="text-xs text-text-muted">
            {loading ? (
              <span>Preparing delicacies grid...</span>
            ) : (
              <span>
                Showing <span className="text-white font-bold">{sorted.length}</span> signature dishes
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-text-muted hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#121212] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="popular">Popularity</option>
              <option value="newest">Newest Additions</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* 4. MAIN LAYOUT (Loading / Error / Empty / Grid) */}
        {loading ? (
          // Loading Skeletons Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-3xl overflow-hidden border border-white/5 p-4 space-y-4 animate-pulse">
                <div className="h-44 bg-white/5 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-5/6"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
                <div className="h-7 bg-white/5 rounded-xl w-full"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-10 bg-white/5 rounded-xl flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Elegant error state
          <div className="max-w-md mx-auto text-center p-8 glass rounded-3xl border border-primary/20 space-y-4">
            <div className="flex justify-center text-primary">
              <AlertCircle size={44} />
            </div>
            <h3 className="text-base font-bold text-white uppercase">Fetch Connection Failed</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              We encountered a server connection error while loading the dynamic Ziyafat menu. Please check your network or try again.
            </p>
            <button
              onClick={loadMenu}
              className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : sorted.length === 0 ? (
          // Empty State
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 glass rounded-3xl border border-white/5">
            <div className="text-4xl text-text-muted">🍽️</div>
            <h3 className="text-sm font-bold text-white">No delicacies found</h3>
            <p className="text-xs text-text-muted max-w-xs font-light">
              We couldn't find matches for "{searchQuery}". Reset filters to see our full signature menu.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSortBy('popular');
              }}
              className="px-5 py-2.5 bg-primary/25 border border-primary/45 rounded-xl text-white text-xs font-bold hover:bg-primary transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          // FOOD GRID (Responsive equal height layouts)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sorted.map((item) => {
              // Portions sizing setup
              let parsedSizes = [];
              if (item.sizes) {
                try {
                  parsedSizes = JSON.parse(item.sizes);
                } catch (e) {}
              }

              const sizeSelected = getSelectedSizeName(item);
              const matchedSizeObj = parsedSizes.find((s: any) => s.size === sizeSelected);
              const activePrice = matchedSizeObj ? matchedSizeObj.price : item.price;
              const discountedPrice = activePrice * (1 - item.discount / 100);

              const qty = getQuantity(item.id);
              const cartBtnAdded = addedStatus[item.id] || false;

              return (
                <div
                  key={item.id}
                  className="group glass rounded-3xl overflow-hidden border border-white/5 hover:border-primary/25 hover:shadow-[0_0_20px_rgba(196,30,58,0.15)] flex flex-col justify-between transition-all duration-300 relative"
                >
                  {/* Top Interactive overlays */}
                  <div>
                    {/* Discount Tag */}
                    {item.discount > 0 && (
                      <span className="absolute top-3.5 left-3.5 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded shadow z-10 uppercase">
                        -{item.discount}% Save
                      </span>
                    )}

                    {/* Heart Toggler */}
                    {token && (
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        aria-label="Toggle Favorite"
                        className="absolute top-3.5 right-3.5 p-1.5 bg-black/60 hover:bg-black rounded-full text-primary-light z-10 border border-white/10 hover:border-primary/30 transition-all focus:outline-none"
                      >
                        <Heart
                          size={13}
                          className={favorites.some((f) => f.id === item.id) ? "fill-current text-primary-light" : "text-white"}
                        />
                      </button>
                    )}

                    {/* Food HD Image */}
                    <div 
                      className="h-44 overflow-hidden relative cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                      
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white">
                        <span className="flex items-center gap-0.5 bg-black/50 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-sm">
                          <Star size={10} className="text-gold fill-current" />
                          <span className="font-bold">{item.rating}</span>
                        </span>
                        <span className="flex items-center gap-0.5 bg-black/50 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-sm">
                          <Clock size={10} className="text-text-muted" />
                          <span>{item.prepTime} mins</span>
                        </span>
                      </div>
                    </div>

                    {/* Food Card Content */}
                    <div className="p-4.5 space-y-3">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold">
                        <span className={item.spiceLevel === 'SPICY' ? 'text-primary-light' : 'text-text-muted'}>
                          {item.spiceLevel} Spice
                        </span>
                        <span className="text-gold">{item.servingSize || '1 Person'}</span>
                      </div>

                      <h3 
                        onClick={() => setSelectedItem(item)}
                        className="text-sm font-bold text-white hover:text-primary transition-colors cursor-pointer line-clamp-1"
                      >
                        {item.name}
                      </h3>

                      <p className="text-[11px] text-text-muted font-light leading-relaxed line-clamp-2 h-8">
                        {item.description}
                      </p>

                      {/* Portions radio capsules */}
                      {parsedSizes.length > 1 && (
                        <div className="space-y-1.5 pt-1.5">
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Portion / Size:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedSizes.map((s: any) => {
                              const active = sizeSelected === s.size;
                              return (
                                <button
                                  key={s.size}
                                  type="button"
                                  onClick={() => handleSelectSize(item.id, s.size)}
                                  className={`px-3 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                                    active
                                      ? 'border-primary bg-primary/10 text-white'
                                      : 'border-white/5 bg-white/5 text-text-muted hover:border-white/10 hover:text-white'
                                  }`}
                                >
                                  {s.size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing, Quantity & Add Controls */}
                  <div className="p-4.5 border-t border-white/5 flex flex-col gap-3 mt-auto bg-black/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-text-muted"> Порция Цена</div>
                        <div className="text-base font-extrabold text-white">
                          Rs. {Math.round(discountedPrice * qty)}
                        </div>
                        {item.discount > 0 && (
                          <div className="text-[10px] text-text-muted line-through">
                            Rs. {Math.round(activePrice * qty)}
                          </div>
                        )}
                      </div>

                      {/* Card Quantity Stepper */}
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-1.5 py-0.5">
                        <button
                          onClick={() => adjustQty(item.id, -1)}
                          className="p-1 hover:text-primary transition-colors focus:outline-none"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold px-2.5 text-white w-6 text-center">{qty}</span>
                        <button
                          onClick={() => adjustQty(item.id, 1)}
                          className="p-1 hover:text-primary transition-colors focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      className={`w-full flex items-center justify-center gap-1.5 font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs focus:outline-none ${
                        !item.available
                          ? 'bg-white/5 text-text-muted cursor-not-allowed border border-white/5'
                          : cartBtnAdded
                            ? 'bg-green-700 text-white border border-green-600 shadow-green-900/10'
                            : 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white shadow-primary/10 hover:shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                    >
                      {cartBtnAdded ? (
                        <>
                          <Check size={14} />
                          <span>Added to Cart</span>
                        </>
                      ) : !item.available ? (
                        <span>Sold Out</span>
                      ) : (
                        <>
                          <ShoppingCart size={13} />
                          <span>Add portion to cart</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. FLOATING MOBILE CART BADGE (Sticky-first layout) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-slide-in">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Cart"
            className="flex items-center gap-3.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold p-4.5 rounded-full shadow-2xl shadow-primary/30 border border-primary/20 transform hover:scale-105 active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2.5 -right-2.5 bg-gold text-background text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border border-[#060606] shadow">
                {totalCartCount}
              </span>
            </div>
            <div className="text-left text-xs pr-1.5 hidden sm:block">
              <div className="text-[10px] text-white/70 uppercase tracking-widest font-normal">My Order</div>
              <div className="font-extrabold">Rs. {Math.round(cartSubtotal)}</div>
            </div>
          </button>
        </div>
      )}

      {/* 6. DETAIL MODAL DIALOG */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-premium rounded-3xl border border-primary/20 overflow-hidden relative shadow-2xl animate-fade-in flex flex-col md:flex-row">
            
            {/* Close */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 p-1.5 bg-black/60 hover:bg-primary border border-white/10 rounded-full text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Left Image block */}
            <div className="w-full md:w-1/2 h-52 md:h-auto bg-surface relative">
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent"></div>
            </div>

            {/* Right details content */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-5 text-xs text-text-muted leading-relaxed font-light">
              <div className="space-y-4">
                <span className="text-[9px] bg-primary/15 border border-primary/30 rounded-full px-3 py-1 font-bold text-primary-light uppercase tracking-wider inline-block">
                  {selectedItem.spiceLevel} Spice
                </span>

                <h2 className="text-lg font-bold text-white">{selectedItem.name}</h2>
                <p className="text-text-muted">{selectedItem.description}</p>

                {/* Info grids */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Prep Time</div>
                    <div className="font-extrabold text-white mt-0.5">{selectedItem.prepTime} Minutes</div>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Serving Size</div>
                    <div className="font-extrabold text-white mt-0.5">{selectedItem.servingSize}</div>
                  </div>
                  {selectedItem.calories && (
                    <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                      <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Calories</div>
                      <div className="font-extrabold text-white mt-0.5">{selectedItem.calories} Kcal</div>
                    </div>
                  )}
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Rating</div>
                    <div className="font-extrabold text-white mt-0.5 flex items-center gap-1">
                      <Star size={11} className="text-gold fill-current" />
                      <span>{selectedItem.rating} / 5.0</span>
                    </div>
                  </div>
                </div>

                {selectedItem.ingredients && (
                  <div className="space-y-1 pt-1">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Ingredients</h4>
                    <p className="text-[11px] font-light leading-relaxed">{selectedItem.ingredients}</p>
                  </div>
                )}
              </div>

              {/* Portion picker inside modal */}
              {(() => {
                let parsedSizes = [];
                if (selectedItem.sizes) {
                  try {
                    parsedSizes = JSON.parse(selectedItem.sizes);
                  } catch (e) {}
                }
                if (parsedSizes.length > 1) {
                  const sizeSelected = getSelectedSizeName(selectedItem);
                  return (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider block">Portions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedSizes.map((s: any) => {
                          const active = sizeSelected === s.size;
                          return (
                            <button
                              key={s.size}
                              type="button"
                              onClick={() => handleSelectSize(selectedItem.id, s.size)}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                active
                                  ? 'border-primary bg-primary/10 text-white'
                                  : 'border-white/5 bg-white/5 text-text-muted hover:border-white/10 hover:text-white'
                              }`}
                            >
                              {s.size} (Rs. {s.price})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Price and Cart Submission */}
              <div className="flex items-center justify-between pt-4.5 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-text-muted uppercase">Portion Price</span>
                  <div className="text-xl font-black text-white">
                    Rs. {Math.round(
                      (selectedSizes[selectedItem.id]
                        ? (JSON.parse(selectedItem.sizes || '[]').find((s: any) => s.size === selectedSizes[selectedItem.id])?.price || selectedItem.price)
                        : (JSON.parse(selectedItem.sizes || '[]')[0]?.price || selectedItem.price)
                      ) * (1 - selectedItem.discount / 100) * getQuantity(selectedItem.id)
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                  disabled={!selectedItem.available}
                  className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={14} />
                  <span>{t.addToCart}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  Search, Star, Clock, ShoppingCart, Flame, Heart, X, Plus, Minus,
  Check, ArrowRight, SlidersHorizontal
} from 'lucide-react';

export default function Menu() {
  const { language, addToCart, favorites, toggleFavorite, token, cart, setIsCartOpen } = useApp();
  const t = translations[language];

  // API Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [spiceFilter, setSpiceFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('name'); // name, price-low, price-high, rating

  // Selected item modal detail
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Card interaction states
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch Categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error('Error loading categories:', err));
  }, []);

  // Fetch Menu Items dynamically when filters change
  useEffect(() => {
    setIsLoading(true);
    let url = `/api/menu?sort=${sortOption}`;
    if (selectedCategorySlug !== 'all') {
      url += `&category=${selectedCategorySlug}`;
    }
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }
    if (spiceFilter !== 'all') {
      url += `&spiceLevel=${spiceFilter}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMenuItems(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading menu items:', err);
        setIsLoading(false);
      });
  }, [selectedCategorySlug, searchQuery, spiceFilter, sortOption]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center text-text-muted font-sans text-xs">
        Preparing Ziyafat Portions...
      </div>
    );
  }

  // Parse sizes array from string safely
  const getItemSizes = (item: any) => {
    if (!item.sizes) return [];
    if (Array.isArray(item.sizes)) return item.sizes;
    try {
      return JSON.parse(item.sizes);
    } catch (e) {
      return [];
    }
  };

  // Sizing & Portions Helpers
  const getActiveSize = (item: any) => {
    const sizes = getItemSizes(item);
    return selectedSizes[item.id] || sizes[0]?.size || 'Regular';
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

  // Add Item to Cart
  const handleAddToCart = (item: any) => {
    const sizeName = getActiveSize(item);
    const sizes = getItemSizes(item);
    const matchedSize = sizes.find((s: any) => s.size === sizeName);
    const price = matchedSize ? matchedSize.price : item.price;
    const qty = quantities[item.id] || 1;

    addToCart({
      id: item.id,
      name: item.name,
      price: price,
      discount: item.discount,
      image: item.image,
      size: sizeName
    }, qty);

    setAddedStatus((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedStatus((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  // Sticky Floating Cart calculations
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * (1 - item.discount / 100)) * item.quantity, 0);

  return (
    <div className="w-full relative z-10 font-sans min-h-screen bg-[#060606] text-white">
      
      {/* 1. CINEMATIC HERO */}
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden border-b border-primary/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-15 filter blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-background/90 to-background/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/20 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-4 max-w-xl px-4 mt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 border border-primary/30 rounded-full text-[10px] font-bold text-primary-light uppercase tracking-wider">
            <Flame size={12} className="animate-pulse" />
            <span>{language === 'en' ? 'Authentic Feast' : 'روایتی ضیافت'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-wide text-white">
            {language === 'en' ? 'Our Menu' : <span className="font-urdu">ہمارا مینو</span>}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted font-light tracking-wide">
            Freshly Prepared • Premium Quality • Delivered to Your Door
          </p>

          {/* Search bar */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* 2. FILTERS HEADER */}
        <div className="sticky top-[72px] z-30 bg-[#060606]/85 backdrop-blur-md py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs Scroll */}
          <div 
            className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar max-w-full md:max-w-[70%]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => setSelectedCategorySlug('all')}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategorySlug === 'all'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-white'
              }`}
            >
              {language === 'en' ? 'All' : 'تمام'}
            </button>

            {categories.map((cat) => {
              const active = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Advanced Sorting & Spice Filters */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <SlidersHorizontal size={14} className="text-gold" />
            
            {/* Spice Filter */}
            <select
              value={spiceFilter}
              onChange={(e) => setSpiceFilter(e.target.value)}
              className="bg-surface border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Spice Levels</option>
              <option value="none">No Spice (None)</option>
              <option value="mild">Mild</option>
              <option value="medium">Medium</option>
              <option value="spicy">Spicy</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-surface border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="name">Alphabetical</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Best Rated</option>
            </select>
          </div>
        </div>

        {/* 3. MENU ITEMS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass rounded-3xl h-[420px] border border-white/5 animate-pulse bg-white/5 flex flex-col justify-between p-5">
                <div className="w-full h-44 bg-white/10 rounded-2xl"></div>
                <div className="w-[80%] h-5 bg-white/10 rounded mt-4"></div>
                <div className="w-[50%] h-3 bg-white/10 rounded mt-2"></div>
                <div className="w-full h-10 bg-white/10 rounded-xl mt-6"></div>
              </div>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="text-3xl">🍲</div>
            <h3 className="text-lg font-bold text-white">No Delicacies Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              We couldn't locate any menu items matches. Try adjusting your filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-4">
            {menuItems.map((item) => {
              const sizes = getItemSizes(item);
              const activeSize = getActiveSize(item);
              const matchedSize = sizes.find((s: any) => s.size === activeSize);
              const currentPrice = matchedSize ? matchedSize.price : item.price;
              const finalPrice = currentPrice * (1 - item.discount / 100);

              const qty = getQuantity(item.id);
              const isAdded = addedStatus[item.id] || false;

              return (
                <div
                  key={item.id}
                  id={`card-item-${item.id}`}
                  className="group glass rounded-3xl overflow-hidden border border-white/5 hover:border-primary/20 hover:shadow-[0_0_15px_rgba(196,30,58,0.12)] flex flex-col justify-between transition-all duration-300 relative"
                >
                  <div>
                    {/* Heart Favorite Toggler */}
                    {token && (
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        aria-label="Favorite Dish"
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
                      className="h-48 overflow-hidden relative cursor-pointer bg-surface"
                      onClick={() => setSelectedItem(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                      
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white">
                        <span className="flex items-center gap-0.5 bg-black/55 px-2.5 py-0.5 rounded-full border border-white/5 backdrop-blur-sm">
                          <Star size={10} className="text-gold fill-current" />
                          <span className="font-bold">{item.rating}</span>
                        </span>
                        <span className="flex items-center gap-0.5 bg-black/55 px-2.5 py-0.5 rounded-full border border-white/5 backdrop-blur-sm">
                          <Clock size={10} className="text-text-muted" />
                          <span>{item.prepTime} mins</span>
                        </span>
                      </div>
                    </div>

                    {/* Info section details */}
                    <div className="p-5 space-y-3.5">
                      <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
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

                      {/* Portions picker */}
                      {sizes.length > 1 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Portions:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {sizes.map((sz: any) => {
                              const active = activeSize === sz.size;
                              return (
                                <button
                                  key={sz.size}
                                  type="button"
                                  onClick={() => handleSelectSize(item.id, sz.size)}
                                  className={`px-3 py-1 text-[10px] font-bold border rounded-lg transition-all ${
                                    active
                                      ? 'border-primary bg-primary/10 text-white'
                                      : 'border-white/5 bg-white/5 text-text-muted hover:border-white/10 hover:text-white'
                                  }`}
                                >
                                  {sz.size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing, Quantity & Cart Steppers */}
                  <div className="p-5 border-t border-white/5 flex flex-col gap-3 mt-auto bg-black/25">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[9px] text-text-muted uppercase">Computed price</div>
                        <div className="text-base font-extrabold text-white">
                          Rs. {Math.round(finalPrice * qty)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
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

                    {/* Add to Cart button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-full flex items-center justify-center gap-1.5 font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs focus:outline-none ${
                        isAdded
                          ? 'bg-green-700 text-white border border-green-600'
                          : 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white shadow-primary/15 hover:shadow-primary/25 transform hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>Added successfully</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={13} />
                          <span>Add to Cart</span>
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

      {/* 4. STICKY FLOATING CART BADGE */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-slide-in">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Shopping Cart"
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

      {/* 5. ITEM DETAIL MODAL popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-premium rounded-3xl border border-primary/20 overflow-hidden relative shadow-2xl animate-fade-in flex flex-col md:flex-row">
            
            {/* Close Button */}
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

            {/* Right Information details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-5 text-xs text-text-muted leading-relaxed font-light">
              <div className="space-y-4">
                <span className="text-[9px] bg-primary/15 border border-primary/30 rounded-full px-3 py-1 font-bold text-primary-light uppercase tracking-wider inline-block">
                  {selectedItem.spiceLevel} Spice
                </span>

                <h2 className="text-lg font-bold text-white">{selectedItem.name}</h2>
                <p className="text-text-muted">{selectedItem.description}</p>

                {/* Nutritional Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Prep Time</div>
                    <div className="font-extrabold text-white mt-0.5">{selectedItem.prepTime} Minutes</div>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Serving Size</div>
                    <div className="font-extrabold text-white mt-0.5">{selectedItem.servingSize || '1 Person'}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl col-span-2">
                    <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Rating</div>
                    <div className="font-extrabold text-white mt-0.5 flex items-center gap-1">
                      <Star size={11} className="text-gold fill-current" />
                      <span>{selectedItem.rating} / 5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizing portions inside detail modal */}
              {getItemSizes(selectedItem).length > 1 && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider block">Portions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getItemSizes(selectedItem).map((s: any) => {
                      const active = getActiveSize(selectedItem) === s.size;
                      return (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() => handleSelectSize(selectedItem.id, s.size)}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                            active
                              ? 'border-primary bg-primary/10 text-white'
                              : 'border-white/5 bg-white/5 text-text-muted hover:border-white/10'
                          }`}
                        >
                          {s.size} (Rs. {s.price})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pricing & Cart submission */}
              <div className="flex items-center justify-between pt-4.5 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-text-muted uppercase">Portion Price</span>
                  <div className="text-xl font-black text-white">
                    Rs. {Math.round(
                      (getItemSizes(selectedItem).find((s: any) => s.size === getActiveSize(selectedItem))?.price || selectedItem.price) *
                      (1 - selectedItem.discount / 100) *
                      getQuantity(selectedItem.id)
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-lg shadow-primary/20"
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

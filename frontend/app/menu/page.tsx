"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Search, Star, Clock, ShoppingCart, SlidersHorizontal, Flame, Heart, X } from 'lucide-react';

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

export default function Menu() {
  const { language, addToCart, favorites, toggleFavorite, token } = useApp();
  const t = translations[language];

  // Menu items state
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpice, setSelectedSpice] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('default');

  // Selected item modal detail
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // Active Size / Price inside Modal
  const [activeSize, setActiveSize] = useState<string>('Regular');
  const [activePrice, setActivePrice] = useState<number>(0);

  // Sync parameters from URL on mount
  useEffect(() => {
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
    fetch('http://localhost:5000/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch(() => {
        console.log("Failed to load backend menu items, using fallback");
      });
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Filter application logic
  useEffect(() => {
    let result = [...items];

    // Category filter using category slug
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category?.slug === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.ingredients && item.ingredients.toLowerCase().includes(q))
      );
    }

    // Spice levels
    if (selectedSpice !== 'all') {
      result = result.filter(item => item.spiceLevel.toLowerCase() === selectedSpice.toLowerCase());
    }

    // Price limit (Uses first/default price of item)
    result = result.filter(item => {
      const finalPrice = item.price * (1 - item.discount / 100);
      return finalPrice <= maxPriceFilter;
    });

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.price * (1 - a.discount / 100)) - (b.price * (1 - b.discount / 100)));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.price * (1 - b.discount / 100)) - (a.price * (1 - a.discount / 100)));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredItems(result);
  }, [items, selectedCategory, searchQuery, selectedSpice, maxPriceFilter, sortBy]);

  // Modal Open details helper
  const handleOpenItem = (item: MenuItem) => {
    setSelectedItem(item);
    let defaultSize = 'Regular';
    let defaultPrice = item.price;
    if (item.sizes) {
      try {
        const parsed = JSON.parse(item.sizes);
        if (parsed.length > 0) {
          defaultSize = parsed[0].size;
          defaultPrice = parsed[0].price;
        }
      } catch (e) {}
    }
    setActiveSize(defaultSize);
    setActivePrice(defaultPrice);
  };

  // Add directly from card helper
  const handleAddToCartDirect = (item: MenuItem) => {
    let sizesList = [];
    if (item.sizes) {
      try {
        sizesList = JSON.parse(item.sizes);
      } catch (e) {}
    }
    if (sizesList.length > 1) {
      handleOpenItem(item);
    } else {
      const sizeName = sizesList.length === 1 ? sizesList[0].size : 'Regular';
      const sizePrice = sizesList.length === 1 ? sizesList[0].price : item.price;
      addToCart({
        id: item.id,
        name: item.name,
        price: sizePrice,
        discount: item.discount,
        image: item.image,
        size: sizeName
      });
    }
  };

  const categoriesFilterList = [
    { label: 'All Cuisines', slug: 'all' },
    { label: 'Fast Food', slug: 'fast-food' },
    { label: 'Burgers', slug: 'burgers' },
    { label: 'Hot Wings', slug: 'hot-wings' },
    { label: 'Shawarma', slug: 'shawarma' },
    { label: 'Rolls', slug: 'paratha-roll' },
    { label: 'Spring Rolls', slug: 'spring-rolls' },
    { label: 'Samosa', slug: 'samosa' },
    { label: 'Chicken Samosa', slug: 'chicken-samosa' },
    { label: 'Sandwiches', slug: 'sandwiches' },
    { label: 'Pasta', slug: 'pasta-macaroni' },
    { label: 'Desi Cuisine', slug: 'desi-cuisine' },
    { label: 'Karahi', slug: 'karahi' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans relative z-10">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide">
          {language === 'en' ? 'Our Gourmet Menu' : 'ہمارا لذیذ مینو'}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted font-light max-w-md mx-auto">
          Explore Ziyafat's carefully curated signature delicacies, cooked to traditional standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS PANEL (Desktop sidebar) */}
        <aside className="hidden lg:block space-y-6 glass p-6 rounded-2xl border border-white/5 self-start">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal size={15} />
              <span>Filters</span>
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSelectedSpice('all');
                setMaxPriceFilter(3000);
                setSortBy('default');
              }}
              className="text-xs text-primary-light hover:text-white"
            >
              Reset All
            </button>
          </div>

          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase">Search</label>
            <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-lg">
              <Search className="text-text-muted ml-2" size={16} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 py-1.5 pl-2 pr-3 text-xs text-white focus:outline-none placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Categories select */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-white uppercase">Categories</label>
            <div className="flex flex-col gap-1.5 text-xs text-text-muted max-h-72 overflow-y-auto pr-1">
              {categoriesFilterList.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === cat.slug ? 'bg-primary text-white font-bold' : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spice levels filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase">Spice Level</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['all', 'none', 'mild', 'medium', 'spicy'].map((spice) => (
                <button
                  key={spice}
                  onClick={() => setSelectedSpice(spice)}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                    selectedSpice === spice
                      ? 'border-primary bg-primary/10 text-white font-bold'
                      : 'border-white/5 hover:border-white/20 text-text-muted'
                  }`}
                >
                  {spice.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Price slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-white">
              <span className="uppercase">Max Price</span>
              <span className="text-primary-light">Rs. {maxPriceFilter}</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="50"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(parseInt(e.target.value))}
              className="w-full accent-primary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </aside>

        {/* MENU MAIN AREA */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Controls Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass px-5 py-4 rounded-xl border border-white/5">
            <p className="text-xs text-text-muted">
              Showing <span className="text-white font-bold">{filteredItems.length}</span> delicacies
            </p>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="default">Default Sort</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              <button
                onClick={() => setShowFiltersMobile(true)}
                className="lg:hidden w-full flex items-center justify-center gap-1.5 px-4 py-2 border border-white/10 hover:border-primary/45 rounded-lg text-xs font-bold text-white focus:outline-none"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Food Grid */}
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 glass rounded-2xl border border-white/5">
              <div className="text-3xl">🍽️</div>
              <div className="text-sm text-text-muted">No dishes match your selected filters.</div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSelectedSpice('all');
                  setMaxPriceFilter(3000);
                  setSortBy('default');
                }}
                className="px-5 py-2 bg-primary/20 hover:bg-primary border border-primary/40 rounded-full text-white text-xs transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const finalPrice = item.price * (1 - item.discount / 100);
                return (
                  <div
                    key={item.id}
                    className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-primary/25 transition-all hover:shadow-2xl flex flex-col justify-between group relative cursor-pointer"
                    onClick={() => handleOpenItem(item)}
                  >
                    <div>
                      {/* Save Badge */}
                      {item.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded z-10">
                          -{item.discount}%
                        </span>
                      )}

                      {/* Favorite Heart Toggler */}
                      {token && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black border border-white/10 rounded-full text-primary-light z-10 focus:outline-none"
                        >
                          <Heart
                            size={14}
                            className={favorites.some((f) => f.id === item.id) ? "fill-current text-primary-light" : "text-white"}
                          />
                        </button>
                      )}

                      {/* Image */}
                      <div className="h-44 overflow-hidden bg-surface relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white">
                          <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <Star size={11} className="text-gold fill-current" />
                            <span>{item.rating}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <Clock size={11} className="text-text-muted" />
                            <span>{item.prepTime} mins</span>
                          </span>
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold tracking-wider ${item.spiceLevel === 'SPICY' ? 'text-primary-light' : 'text-text-muted'}`}>
                            {item.spiceLevel} Spice
                          </span>
                          <span className="text-[10px] text-gold">{item.servingSize}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed font-light">{item.description}</p>
                      </div>
                    </div>

                    <div
                      className="p-4 border-t border-white/5 mt-3 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()} // Prevent opening details modal when clicking add button
                    >
                      <div>
                        <div className="text-sm font-extrabold text-white">Rs. {Math.round(finalPrice)}</div>
                        {item.discount > 0 && (
                          <div className="text-[10px] text-text-muted line-through">Rs. {item.price}</div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCartDirect(item)}
                        className="flex items-center gap-1 bg-primary/20 hover:bg-primary text-white text-xs font-semibold py-2 px-3 rounded-lg border border-primary/30 transition-all focus:outline-none"
                      >
                        <ShoppingCart size={13} />
                        <span>{t.addToCart}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* DETAIL MODAL popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-premium rounded-3xl border border-primary/20 overflow-hidden relative shadow-2xl animate-fade-in flex flex-col md:flex-row">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 p-1.5 bg-black/60 hover:bg-primary border border-white/10 rounded-full text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Left Image block */}
            <div className="w-full md:w-1/2 h-52 md:h-auto bg-surface relative">
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-transparent to-transparent"></div>
            </div>

            {/* Right Information Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3.5">
                <span className="text-[10px] bg-primary/10 border border-primary/20 rounded-full px-3 py-1 font-bold text-primary-light">
                  {selectedItem.spiceLevel} Spice Level
                </span>

                <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedItem.name}</h2>
                <p className="text-xs text-text-muted leading-relaxed font-light">{selectedItem.description}</p>

                {/* Nutritional / details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
                    <div className="text-[10px] text-text-muted uppercase">Prep Time</div>
                    <div className="font-bold text-white mt-0.5">{selectedItem.prepTime} Minutes</div>
                  </div>
                  <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
                    <div className="text-[10px] text-text-muted uppercase">Serving Size</div>
                    <div className="font-bold text-white mt-0.5">{selectedItem.servingSize}</div>
                  </div>
                  {selectedItem.calories && (
                    <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
                      <div className="text-[10px] text-text-muted uppercase">Calories</div>
                      <div className="font-bold text-white mt-0.5">{selectedItem.calories} Kcal</div>
                    </div>
                  )}
                  <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
                    <div className="text-[10px] text-text-muted uppercase">Rating</div>
                    <div className="font-bold text-white mt-0.5 flex items-center gap-1">
                      <Star size={11} className="text-gold fill-current" />
                      <span>{selectedItem.rating} / 5.0</span>
                    </div>
                  </div>
                </div>

                {/* Size Selector */}
                {selectedItem.sizes && (() => {
                  try {
                    const parsedSizes = JSON.parse(selectedItem.sizes);
                    if (parsedSizes.length > 1) {
                      return (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider block">Choose Portion / Size:</span>
                          <div className="flex flex-wrap gap-2">
                            {parsedSizes.map((s: any) => (
                              <button
                                key={s.size}
                                type="button"
                                onClick={() => {
                                  setActiveSize(s.size);
                                  setActivePrice(s.price);
                                }}
                                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                  activeSize === s.size
                                    ? 'border-primary bg-primary/10 text-white'
                                    : 'border-white/5 bg-white/5 text-text-muted hover:border-white/10 hover:text-white'
                                }`}
                              >
                                {s.size} (Rs. {s.price})
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {}
                  return null;
                })()}

                {selectedItem.ingredients && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase">Ingredients</h4>
                    <p className="text-xs text-text-muted leading-relaxed font-light">{selectedItem.ingredients}</p>
                  </div>
                )}
              </div>

              {/* Price and Cart Submission */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <span className="text-xs text-text-muted">Total Price</span>
                  <div className="text-2xl font-extrabold text-white">
                    Rs. {Math.round(activePrice * (1 - selectedItem.discount / 100))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart({
                      id: selectedItem.id,
                      name: selectedItem.name,
                      price: activePrice,
                      discount: selectedItem.discount,
                      image: selectedItem.image,
                      size: activeSize
                    });
                    setSelectedItem(null);
                  }}
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 focus:outline-none"
                >
                  <ShoppingCart size={15} />
                  <span>{t.addToCart}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MOBILE FILTERS SIDE DRAWER */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFiltersMobile(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-xs glass-premium p-6 flex flex-col justify-between border-l border-primary/20">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-sm font-bold text-white uppercase">Filters</h3>
                <button onClick={() => setShowFiltersMobile(false)} className="text-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="space-y-1">
                <label className="text-xs text-white uppercase font-semibold">Search</label>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Mobile Categories */}
              <div className="space-y-1">
                <label className="text-xs text-white uppercase font-semibold">Category</label>
                <div className="flex flex-col gap-1.5 text-xs max-h-56 overflow-y-auto pr-1">
                  {categoriesFilterList.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setShowFiltersMobile(false);
                      }}
                      className={`text-left px-3 py-2 rounded-lg ${
                        selectedCategory === cat.slug ? 'bg-primary text-white font-bold' : 'bg-white/5 text-text-muted'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Spice */}
              <div className="space-y-1">
                <label className="text-xs text-white uppercase font-semibold">Spice Level</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {['all', 'none', 'mild', 'medium', 'spicy'].map((spice) => (
                    <button
                      key={spice}
                      onClick={() => setSelectedSpice(spice)}
                      className={`p-2 rounded-lg border text-center ${
                        selectedSpice === spice ? 'border-primary bg-primary/10 text-white' : 'border-white/5 text-text-muted'
                      }`}
                    >
                      {spice.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFiltersMobile(false)}
              className="w-full bg-primary py-3 rounded-xl text-white text-xs font-bold transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Search, Star, ShoppingBag, Heart, X, SlidersHorizontal, Eye, Tag } from 'lucide-react';
import Link from 'next/link';

interface ProductImage {
  url: string;
}

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  inventory: number;
}

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  rating: number;
  fabric: string;
  fit: string;
  category: {
    name: string;
    slug: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

export default function Shop() {
  const { language, addToCart, favorites, toggleFavorite, token } = useApp();
  const t = translations[language];

  // API Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('name'); // name, price-low, price-high, rating
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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

    // Fetch Collections
    fetch('/api/extra/collections')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCollections(data);
      })
      .catch(() => {
        // Fallback static collections
        setCollections([
          { id: 'col1', name: 'New Arrival', slug: 'new-arrival' }
        ]);
      });
  }, []);

  // Fetch Products dynamically when filters change
  useEffect(() => {
    setIsLoading(true);
    let url = `/api/menu?sort=${sortOption}`;
    
    if (selectedCategorySlug !== 'all') {
      url += `&category=${selectedCategorySlug}`;
    }
    if (selectedCollectionSlug !== 'all') {
      url += `&collection=${selectedCollectionSlug}`;
    }
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }
    if (selectedSize !== 'all') {
      url += `&size=${selectedSize}`;
    }
    if (selectedColor !== 'all') {
      url += `&color=${encodeURIComponent(selectedColor)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setIsLoading(false);
      });
  }, [selectedCategorySlug, selectedCollectionSlug, searchQuery, selectedSize, selectedColor, sortOption]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-text-muted font-sans text-xs">
        LOADING THE VESTRA COLLECTIONS...
      </div>
    );
  }

  // Predefined filter options
  const filterSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const filterColors = ['Ivory White', 'Off-White', 'Charcoal Grey', 'Prussian White'];

  return (
    <div className="w-full relative z-10 font-sans min-h-screen bg-background text-white">
      
      {/* 1. CINEMATIC SHOP BANNER */}
      <section className="relative h-[250px] flex items-center justify-center overflow-hidden border-b border-white/5 bg-secondaryBg">
        <div className="absolute inset-0 bg-[url('/products/tshirts/product-03/image-03-back.png')] bg-cover bg-center opacity-10 filter grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-4 max-w-xl px-4 mt-6">
          <span className="text-[9px] tracking-[0.3em] text-primary font-bold uppercase block">THE VESTRA CATALOG</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-widest text-white uppercase">
            ARCHITECTURAL PIECES
          </h1>
          <p className="text-[10px] text-text-muted font-light tracking-widest uppercase">
            Explore ready-to-wear essentials crafted for high-end styling.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 2. FILTERS COLUMN - SIDEBAR */}
          <div className={`lg:block ${showFiltersMobile ? 'block fixed inset-0 z-50 bg-background p-8 overflow-y-auto' : 'hidden'} space-y-8`}>
            
            <div className="flex justify-between items-center lg:hidden border-b border-white/10 pb-4 mb-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white">Filters</h3>
              <button onClick={() => setShowFiltersMobile(false)} className="text-text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Search filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Search</h4>
              <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded focus-within:border-primary/50 transition-all">
                <Search className="text-text-muted ml-2.5 flex-shrink-0" size={14} />
                <input
                  type="text"
                  placeholder="Search pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 py-2 pl-2 pr-4 text-xs text-white focus:outline-none placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Categories filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Category</h4>
              <div className="flex flex-col gap-2.5 text-xs font-light text-text-muted">
                <button
                  onClick={() => setSelectedCategorySlug('all')}
                  className={`text-left hover:text-white transition-colors ${selectedCategorySlug === 'all' ? 'text-primary font-bold' : ''}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={`text-left hover:text-white transition-colors uppercase tracking-wider text-[11px] ${selectedCategorySlug === cat.slug ? 'text-primary font-bold' : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Collections filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Collections</h4>
              <div className="flex flex-col gap-2.5 text-xs font-light text-text-muted">
                <button
                  onClick={() => setSelectedCollectionSlug('all')}
                  className={`text-left hover:text-white transition-colors ${selectedCollectionSlug === 'all' ? 'text-primary font-bold' : ''}`}
                >
                  All Collections
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollectionSlug(col.slug)}
                    className={`text-left hover:text-white transition-colors uppercase tracking-wider text-[11px] ${selectedCollectionSlug === col.slug ? 'text-primary font-bold' : ''}`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Size</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${
                    selectedSize === 'all' ? 'border-primary bg-primary text-black' : 'border-white/10 text-text-muted hover:border-white/20'
                  }`}
                >
                  ALL
                </button>
                {filterSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 text-[10px] font-bold border rounded transition-all ${
                      selectedSize === sz ? 'border-primary bg-primary text-black' : 'border-white/10 text-text-muted hover:border-white/20'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Color</h4>
              <div className="flex flex-col gap-2 text-xs font-light text-text-muted">
                <button
                  onClick={() => setSelectedColor('all')}
                  className={`text-left hover:text-white transition-colors ${selectedColor === 'all' ? 'text-primary font-bold' : ''}`}
                >
                  All Colors
                </button>
                {filterColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`text-left hover:text-white transition-colors uppercase tracking-wider text-[11px] ${selectedColor === col ? 'text-primary font-bold' : ''}`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Sort By</h4>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="name">Alphabetical</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>

          </div>

          {/* 3. PRODUCTS GRID BLOCK */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Header controls for mobile */}
            <div className="flex justify-between items-center bg-secondaryBg p-4 border border-white/5 rounded-xl lg:hidden">
              <button
                onClick={() => setShowFiltersMobile(true)}
                className="flex items-center gap-2 text-xs tracking-widest font-bold text-white uppercase"
              >
                <SlidersHorizontal size={14} className="text-primary" />
                <span>Filter / Sort</span>
              </button>
              <span className="text-[10px] text-text-muted uppercase tracking-widest">{products.length} Pieces</span>
            </div>

            {/* Products catalog listing */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-secondaryBg border border-white/5 p-4 rounded-2xl h-[450px] animate-pulse space-y-4">
                    <div className="h-[320px] bg-white/5 rounded-xl"></div>
                    <div className="h-4 bg-white/10 w-2/3 rounded"></div>
                    <div className="h-3 bg-white/10 w-1/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 text-center space-y-4 border border-white/5 rounded-3xl bg-secondaryBg">
                <div className="text-3xl">🧥</div>
                <h3 className="text-sm font-serif font-bold uppercase text-white tracking-widest">No Pieces Found</h3>
                <p className="text-[11px] text-text-muted max-w-xs mx-auto font-light leading-relaxed">
                  We could not find any garments matching your active filters. Try resetting search queries or color options.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const finalPrice = product.price * (1 - product.discount / 100);
                  const mainImage = product.images?.[0]?.url || '/products/tshirts/product-01/image-01-front.png';
                  const hoverImage = product.images?.[1]?.url || mainImage;
                  
                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col justify-between hover-lift border border-white/5 p-4 rounded-2xl relative bg-secondaryBg"
                    >
                      {/* Favorite Button */}
                      {token && (
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute top-6 right-6 p-2 bg-black/60 hover:bg-black rounded-full text-primary z-10 border border-white/10 hover:border-primary/30 transition-all focus:outline-none"
                        >
                          <Heart
                            size={12}
                            className={favorites.some((f) => f.id === product.id) ? "fill-current text-primary" : "text-white"}
                          />
                        </button>
                      )}

                      {/* Image block */}
                      <Link href={`/shop/${product.id}`} className="relative h-[320px] overflow-hidden rounded-xl bg-surface block">
                        {product.discount > 0 && (
                          <span className="absolute top-4 left-4 bg-primary text-black text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase z-10">
                            SAVE {product.discount}%
                          </span>
                        )}
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover grayscale group-hover:hidden transition-all duration-700"
                        />
                        <img
                          src={hoverImage}
                          alt={product.name}
                          className="w-full h-full object-cover grayscale hidden group-hover:block transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-black/10 z-0"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <div className="p-3 bg-black/80 rounded-full text-white border border-white/10">
                            <Eye size={16} />
                          </div>
                        </div>
                      </Link>

                      {/* Details block */}
                      <div className="pt-5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-primary">
                            <span>{product.fit}</span>
                            <span className="text-text-muted flex items-center gap-0.5">
                              <Star size={9} className="text-primary fill-current" />
                              {product.rating}
                            </span>
                          </div>
                          <Link href={`/shop/${product.id}`} className="block mt-1">
                            <h3 className="text-xs font-bold text-white tracking-widest uppercase group-hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-[10px] text-text-muted font-light line-clamp-2 leading-relaxed mt-1">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/5">
                          <div>
                            <div className="text-xs font-bold text-white font-sans">Rs. {Math.round(finalPrice)}</div>
                            {product.discount > 0 && (
                              <div className="text-[9px] text-text-muted line-through font-sans">Rs. {product.price}</div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              discount: product.discount,
                              image: mainImage,
                              size: product.variants?.[0]?.size || 'M',
                              color: product.variants?.[0]?.color || 'Black',
                              quantity: 1
                            })}
                            className="p-2 bg-transparent border border-white/10 hover:border-primary text-text-muted hover:text-black hover:bg-primary rounded-lg transition-all"
                          >
                            <ShoppingBag size={12} />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { useApp } from '../../../context/AppContext';
import { Star, ShoppingBag, Heart, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ProductImage {
  id: string;
  url: string;
}

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  inventory: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  profile: {
    fullName: string;
  };
}

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  rating: number;
  fabric: string;
  fit: string;
  brand: string;
  shippingInfo: string;
  returnsInfo: string;
  categoryId: string;
  category: {
    name: string;
    slug: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { addToCart, favorites, toggleFavorite, token } = useApp();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery State
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Selection States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [added, setAdded] = useState(false);

  // Zoom State
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  // Accordion States
  const [activeAccordion, setActiveAccordion] = useState<string | null>('fabric');

  useEffect(() => {
    setLoading(true);
    // Fetch product by ID
    fetch(`/api/menu/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0].url);
          }
          
          // Set initial variants selection
          if (data.variants && data.variants.length > 0) {
            const colors = Array.from(new Set(data.variants.map((v: any) => v.color))) as string[];
            setSelectedColor(colors[0] || '');
            
            const sizesForColor = data.variants
              .filter((v: any) => v.color === colors[0])
              .map((v: any) => v.size) as string[];
            setSelectedSize(sizesForColor[0] || '');
          }

          // Fetch related products in same category
          fetch(`/api/menu?category=${data.category.slug}`)
            .then(res => res.json())
            .then(relData => {
              if (Array.isArray(relData)) {
                setRelatedProducts(relData.filter((p: any) => p.id !== data.id).slice(0, 4));
              }
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [productId]);

  // Adjust size choices when active color selection changes
  useEffect(() => {
    if (product && selectedColor) {
      const sizesForColor = product.variants
        .filter(v => v.color === selectedColor)
        .map(v => v.size);
      if (sizesForColor.length > 0 && !sizesForColor.includes(selectedSize)) {
        setSelectedSize(sizesForColor[0]);
      }
    }
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-text-muted text-xs tracking-widest font-sans">
        LOADING PRODUCT DETAILS...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-muted space-y-4 font-sans text-xs">
        <p>THE REQUESTED PIECE COULD NOT BE LOCATED.</p>
        <Link href="/shop" className="text-primary font-bold tracking-widest uppercase hover:underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  const finalPrice = product.price * (1 - product.discount / 100);

  // Extract unique colors and sizes available for selected color
  const availableColors = Array.from(new Set(product.variants.map(v => v.color)));
  const availableSizes = product.variants
    .filter(v => v.color === selectedColor)
    .map(v => v.size);

  // Check inventory for current selection
  const currentVariant = product.variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  );
  const stockLevel = currentVariant ? currentVariant.inventory : 0;

  const handleAddToBag = () => {
    if (stockLevel <= 0) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.images?.[0]?.url || '',
      size: selectedSize,
      color: selectedColor,
      quantity: qty
    }, qty);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (stockLevel <= 0) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.images?.[0]?.url || '',
      size: selectedSize,
      color: selectedColor,
      quantity: qty
    }, qty);

    window.location.href = '/checkout';
  };

  const isFavorite = favorites.some((f) => f.id === product.id);

  return (
    <div className="min-h-screen bg-background text-white font-sans py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex gap-2 text-[10px] text-text-muted uppercase tracking-[0.2em] mb-12">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-white transition-colors">{product.category.name}</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        {/* Core Product Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Gallery Block (Col-span-7) */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-4">
            
            {/* Thumbnails (Col-span-2) */}
            <div className="col-span-2 space-y-3">
              {product.images?.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-full aspect-[3/4] overflow-hidden rounded-lg border bg-surface transition-all ${
                    activeImage === img.url ? 'border-primary' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={img.url} alt="Product View" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Active Image (Col-span-10) */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="col-span-10 relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/5 bg-secondaryBg group cursor-zoom-in"
            >
              <img
                src={activeImage}
                alt={product.name}
                style={zoomStyle}
                className="w-full h-full object-cover transition-transform duration-100 ease-out"
              />
            </div>

          </div>

          {/* Details Block (Col-span-5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Title & Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] tracking-[0.3em] text-primary font-bold uppercase">Brand: {product.brand || 'THE VESTRA'}</span>
                <span className="text-text-muted text-[9px]">•</span>
                <span className="text-text-muted text-[9px] tracking-[0.25em] uppercase">{product.category.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-widest text-white uppercase">{product.name}</h1>
              
              <div className="flex items-center gap-4 text-xs">
                <span className="text-text-muted uppercase tracking-wider text-[10px]">{product.fit}</span>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-primary fill-current" />
                  <span className="text-[10px] font-bold mt-0.5">{product.rating}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-b border-white/5 py-4 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold font-sans">Rs. {Math.round(finalPrice)}</span>
                {product.discount > 0 && (
                  <span className="text-sm text-text-muted line-through font-sans">Rs. {product.price}</span>
                )}
              </div>
              <p className="text-[10px] text-primary font-light">Tax included. Free shipping inside Pakistan over Rs. 5000.</p>
            </div>

            {/* Color Select */}
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.2em] font-bold text-white uppercase block">
                Color: <span className="text-text-muted font-normal ml-1">{selectedColor}</span>
              </span>
              <div className="flex gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border text-[10px] tracking-wider font-semibold rounded-lg transition-all uppercase ${
                      selectedColor === color
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 text-text-muted hover:border-white/20'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Select */}
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.2em] font-bold text-white uppercase block">
                Size: <span className="text-text-muted font-normal ml-1">{selectedSize}</span>
              </span>
              <div className="flex gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 w-12 border text-[10px] font-bold rounded-lg flex items-center justify-center transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 text-text-muted hover:border-white/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Level Warning */}
            {stockLevel <= 0 ? (
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">Piece Currently Sold Out</span>
            ) : stockLevel < 5 ? (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Only {stockLevel} pieces left in stock</span>
            ) : null}

            {/* Action Bar (Qty + Add to bag + Favorites) */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              
              {/* Qty selector */}
              {stockLevel > 0 && (
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg h-12 px-3 sm:w-28 flex-shrink-0">
                  <button
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    className="p-1 hover:text-primary"
                    disabled={stockLevel <= 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-sans">{qty}</span>
                  <button
                    onClick={() => setQty(prev => Math.min(stockLevel, prev + 1))}
                    className="p-1 hover:text-primary"
                    disabled={stockLevel <= 0}
                  >
                    +
                  </button>
                </div>
              )}

              {/* Add to Cart button */}
              <button
                onClick={handleAddToBag}
                disabled={stockLevel <= 0}
                className={`flex-1 h-12 rounded-lg font-bold tracking-[0.15em] transition-all text-xs uppercase flex items-center justify-center gap-2 ${
                  stockLevel <= 0
                    ? 'bg-white/5 text-text-muted border border-white/5 cursor-not-allowed w-full'
                    : added
                      ? 'bg-green-700 text-white border border-green-600'
                      : 'bg-primary text-black hover:bg-primary-light shadow-lg shadow-primary/10'
                }`}
              >
                {added ? (
                  <span>ADDED TO BAG</span>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>ADD TO BAG</span>
                  </>
                )}
              </button>

              {/* Buy Now button */}
              {stockLevel > 0 && (
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-12 rounded-lg font-bold tracking-[0.15em] hover:bg-white hover:text-black border border-white text-white transition-all text-xs uppercase flex items-center justify-center gap-2"
                >
                  <span>BUY NOW</span>
                </button>
              )}

              {/* Favorite toggle */}
              {token && (
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-all ${
                    isFavorite
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 text-text-muted hover:border-white/20'
                  }`}
                  title="Save to wishlist"
                >
                  <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                </button>
              )}

            </div>

            {/* Accordions (Fabric, Fit, Shipping) */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              
              {/* Fabric & Details */}
              <div className="border-b border-white/5 pb-4">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'fabric' ? null : 'fabric')}
                  className="w-full flex justify-between items-center text-[10px] tracking-[0.15em] font-bold text-white uppercase focus:outline-none"
                >
                  <span>Fabric & Details</span>
                  {activeAccordion === 'fabric' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {activeAccordion === 'fabric' && (
                  <p className="text-[11px] text-text-muted leading-relaxed font-light mt-3 pl-1">
                    Material: {product.fabric || '100% Premium Cotton'}. Spun from organic yarns, engineered for breathability and structural hold. Finished with precision overlock stitching.
                  </p>
                )}
              </div>

              {/* Fit Guide */}
              <div className="border-b border-white/5 pb-4">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'fit' ? null : 'fit')}
                  className="w-full flex justify-between items-center text-[10px] tracking-[0.15em] font-bold text-white uppercase focus:outline-none"
                >
                  <span>Fit & Sizing</span>
                  {activeAccordion === 'fit' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {activeAccordion === 'fit' && (
                  <p className="text-[11px] text-text-muted leading-relaxed font-light mt-3 pl-1">
                    Silhouete: {product.fit || 'Relaxed Fit'}. Model is 6'1" wearing size Medium. Fit is true to sizing guidelines. Recommend sizing down for a fitted silhouette.
                  </p>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="border-b border-white/5 pb-4">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex justify-between items-center text-[10px] tracking-[0.15em] font-bold text-white uppercase focus:outline-none"
                >
                  <span>Shipping & Returns</span>
                  {activeAccordion === 'shipping' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="text-[11px] text-text-muted leading-relaxed font-light mt-3 pl-1 space-y-2">
                    <p>{product.shippingInfo || 'Flat rate shipping Rs. 200 nationwide. Dispatch within 24 hours.'}</p>
                    <p>{product.returnsInfo || '30-day complimentary returns and size exchanges.'}</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Dynamic Reviews Block */}
        <section className="py-20 border-t border-white/5 mt-20 space-y-12">
          <div className="space-y-2">
            <span className="text-[9px] tracking-[0.3em] text-primary font-bold uppercase block">CRITIQUE CORNER</span>
            <h2 className="text-xl font-serif tracking-widest text-white uppercase">Client Reviews ({product.reviews?.length || 0})</h2>
          </div>

          {product.reviews?.length === 0 ? (
            <p className="text-[11px] text-text-muted font-light">No reviews submitted for this piece yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.reviews?.map((review) => (
                <div key={review.id} className="p-6 rounded-xl border border-white/5 bg-secondaryBg space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white uppercase tracking-wider">{review.profile.fullName}</span>
                    <div className="flex items-center gap-0.5 text-primary">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={10} className="fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed font-light italic">
                    "{review.comment}"
                  </p>
                  <span className="text-[9px] text-text-muted font-light tracking-wide block pt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-20 border-t border-white/5 mt-10 space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <span className="text-[9px] tracking-[0.3em] text-primary font-bold uppercase block">CAPSULE CROSS-SELL</span>
                <h2 className="text-xl font-serif tracking-widest text-white uppercase">Related Pieces</h2>
              </div>
              <Link href="/shop" className="text-[10px] tracking-widest text-text-muted hover:text-white font-bold uppercase flex items-center gap-1.5 transition-all">
                <span>View Shop</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const finalPPrice = p.price * (1 - p.discount / 100);
                return (
                  <div key={p.id} className="group flex flex-col justify-between hover-lift border border-white/5 p-4 rounded-xl relative bg-secondaryBg">
                    <Link href={`/shop/${p.id}`} className="relative h-64 overflow-hidden rounded-lg bg-surface block">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="pt-4 space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-primary tracking-widest uppercase block">{p.servingSize}</span>
                        <Link href={`/shop/${p.id}`} className="block mt-0.5">
                          <h4 className="text-[11px] font-bold text-white tracking-widest uppercase group-hover:text-primary transition-colors truncate">{p.name}</h4>
                        </Link>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2">
                        <span className="text-[11px] font-bold font-sans">Rs. {Math.round(finalPPrice)}</span>
                        <span className="text-[10px] text-text-muted font-light flex items-center gap-0.5"><Star size={10} className="text-primary fill-current" />{p.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

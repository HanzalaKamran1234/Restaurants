"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Sparkles, Eye, ArrowUpRight } from 'lucide-react';
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
  images: ProductImage[];
  variants: ProductVariant[];
}

export default function Home() {
  const { language, addToCart } = useApp();
  const t = translations[language];

  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from backend menu/product API
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Take top 4 rated items for homepage showcase
          const sorted = [...data].sort((a, b) => b.rating - a.rating).slice(0, 4);
          setFeaturedProducts(sorted);
        }
        setLoading(false);
      })
      .catch(() => {
        console.log("Failed to load dynamic specials, using fallback");
        setLoading(false);
      });
  }, []);

  const stylingReviews = [
    {
      name: "Sartorial Weekly",
      area: "Editorial Review",
      comment: "THE VESTRA has completely redefined the menswear landscape in South Asia. Their heavy combed organic cotton tees drape like architectural structures. Timeless minimalism at its peak.",
      rating: 5
    },
    {
      name: "Hassan Raza",
      area: "Verified Collector",
      comment: "The Selvedge denim is outstanding. Sourced and structured beautifully. It feels like wearing pure confidence. The packaging and custom box unboxing experience is extremely premium.",
      rating: 5
    },
    {
      name: "Vogue Menswear",
      area: "Critic",
      comment: "Exceptional attention to details. From double-faced heavyweight loopback fleece to placket-less polos, they maintain an exquisite balance of relaxed comfort and formal precision.",
      rating: 5
    }
  ];

  return (
    <div className="w-full relative z-10 font-sans overflow-hidden bg-background">
      
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-16 pb-24">
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0 bg-[url('/products/tshirts/product-01/image-01-front.png')] bg-cover bg-center opacity-25 filter grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="space-y-8 text-center lg:text-left lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              <Sparkles size={11} className="animate-pulse" />
              <span>THE VESTRA EDITORIAL CAPSULE</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-serif font-black tracking-[0.08em] text-white leading-[1.1] uppercase">
              WEAR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">CONFIDENCE.</span>
            </h1>

            <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide">
              An international design language tailored for modern men. Sculpted structures, heavyweight luxury weaves, and refined essentials engineered to withstand time. Designed for modern Pakistan and global horizons.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/shop"
                className="btn-gold text-[10px] font-bold py-4 px-8 rounded flex items-center justify-center gap-2 uppercase"
              >
                <span>EXPLORE SHOP</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/story"
                className="border border-white/10 hover:border-white hover:bg-white/5 text-white text-[10px] tracking-[0.15em] font-bold py-4 px-8 rounded flex items-center justify-center gap-1.5 transition-all uppercase"
              >
                <span>OUR STORY</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Hero Right Floating Cards */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative h-[500px]">
            <div className="absolute w-[400px] h-[400px] radial-glow opacity-80 animate-pulse"></div>

            {/* Showcase Image */}
            <div className="relative z-10 w-[350px] h-[470px] overflow-hidden border border-white/10 rounded-2xl shadow-2xl group">
              <img
                src="/products/tshirts/product-01/image-01-front.png"
                alt="Springfield Explore Further Graphic Tee"
                className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
              
              {/* Product Label Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-xl flex items-center justify-between border border-white/10">
                <div>
                  <span className="text-[9px] text-text-muted tracking-widest block uppercase">New Arrival</span>
                  <span className="text-xs font-serif font-bold text-white tracking-wider uppercase mt-1 block">Explore Further Tee</span>
                </div>
                <span className="text-xs font-bold text-primary font-sans">Rs. 999</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CURATED COLLECTION BANNER */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 relative border-t border-white/5">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] tracking-[0.3em] text-primary uppercase font-bold">Curated Portfolio</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white uppercase tracking-wider">SPRINGFIELD SERIES</h2>
        </div>

        <Link href="/shop" className="relative group overflow-hidden rounded-2xl h-[500px] border border-white/5 hover:border-primary/20 transition-all flex flex-col justify-end">
          <img
            src="/products/tshirts/product-01/image-01-front.png"
            alt="New Arrival"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="p-8 sm:p-12 z-20 space-y-3">
            <span className="text-[10px] tracking-[0.25em] text-primary font-bold uppercase">Featured Collection</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-widest uppercase">New Arrival Capsule</h3>
            <p className="text-xs sm:text-sm text-text-muted font-light leading-relaxed max-w-md">Experience high-density cotton, modern relaxed fits, and bespoke graphic art from the new Springfield series. Every piece is tailored with luxury finishing.</p>
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold tracking-widest uppercase pt-2">
              <span>EXPLORE CAPSULE</span>
              <ArrowRight size={11} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </Link>
      </section>

      {/* 3. NEW ARRIVALS & BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6">
          <div className="text-center sm:text-left space-y-2">
            <span className="text-[10px] tracking-[0.3em] text-primary font-bold uppercase">EDITORIAL SPOTLIGHT</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white uppercase tracking-wider">NEW ARRIVALS</h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-xs tracking-widest text-text-muted hover:text-white font-bold uppercase transition-colors"
          >
            <span>VIEW ALL PIECES</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dynamic Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="h-[380px] bg-white/5 rounded-2xl"></div>
                <div className="h-4 bg-white/10 w-2/3 rounded"></div>
                <div className="h-3 bg-white/10 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => {
              const finalPrice = product.price * (1 - product.discount / 100);
              const mainImage = product.images?.[0]?.url || '/products/tshirts/product-01/image-01-front.png';
              const hoverImage = product.images?.[1]?.url || mainImage;
              
              return (
                <div key={product.id} className="group flex flex-col justify-between hover-lift border border-white/5 p-4 rounded-2xl relative bg-secondaryBg">
                  
                  {/* Image Holder with hover swap */}
                  <Link href={`/shop/${product.id}`} className="relative h-[380px] overflow-hidden rounded-xl bg-surface block">
                    {product.discount > 0 && (
                      <span className="absolute top-4 left-4 bg-primary text-black text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase z-10">
                        -{product.discount}%
                      </span>
                    )}
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:hidden transition-all duration-700"
                    />
                    <img
                      src={hoverImage}
                      alt={product.name}
                      className="w-full h-full object-cover hidden group-hover:block transition-all duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="p-3 bg-black/80 rounded-full text-white border border-white/10">
                        <Eye size={18} />
                      </div>
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="pt-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-primary tracking-[0.2em] font-semibold uppercase">{product.fit}</span>
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
                        className="p-2.5 bg-transparent border border-white/10 hover:border-primary text-text-muted hover:text-black hover:bg-primary rounded-lg transition-all"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. THE EXPERIENCE / VALUES */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass p-8 rounded-2xl border border-white/5 flex gap-5 hover:border-primary/20 transition-all">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Premium Curation</h3>
              <p className="text-[11px] text-text-muted leading-relaxed font-light">
                Every garment undergoes strict quality inspection. Woven with two-ply Egyptian long-staple cotton and tailored with pristine fits.
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl border border-white/5 flex gap-5 hover:border-primary/20 transition-all">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Complimentary Concierge</h3>
              <p className="text-[11px] text-text-muted leading-relaxed font-light">
                Enjoy 30-day premium return and exchange options. Contact our dedicated support team via WhatsApp for personalized styling help.
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl border border-white/5 flex gap-5 hover:border-primary/20 transition-all">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <ShoppingBag size={18} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Worldwide Logistics</h3>
              <p className="text-[11px] text-text-muted leading-relaxed font-light">
                Enjoy complimentary shipping inside Pakistan for orders over Rs. 5000. Securely boxed and tracked packages dispatched within 24 hours.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. BRAND STORY BANNER */}
      <section className="relative h-[480px] flex items-center justify-center px-6 text-center border-t border-b border-white/5 bg-secondaryBg">
        <div className="absolute inset-0 bg-[url('/products/tshirts/product-03/image-03-back.png')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <span className="text-[9px] tracking-[0.35em] text-primary font-bold uppercase block">OUR PHILOSOPHY</span>
          <h2 className="text-3xl font-serif font-medium text-white uppercase tracking-widest leading-relaxed">
            THE ARCHITECTURE OF SILHOUETTE
          </h2>
          <p className="text-[11px] text-text-muted font-light leading-relaxed tracking-wide">
            THE VESTRA was founded on a simple premise: menswear should be structured, timeless, and clean. By rejecting fleeting trends, we focus on material density, neckline geometry, and organic color palettes. We wear confidence.
          </p>
          <div className="pt-4">
            <Link
              href="/story"
              className="inline-block border border-primary hover:bg-primary hover:text-black text-primary text-[9px] tracking-widest font-bold px-8 py-3.5 rounded transition-all uppercase"
            >
              READ OUR STORY
            </Link>
          </div>
        </div>
      </section>

      {/* 6. STYLE EDITORIAL CRITIQUES */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center relative border-b border-white/5">
        <span className="text-[10px] tracking-[0.25em] text-primary font-bold uppercase">EDITORIAL REVIEWS</span>
        
        <div className="mt-8 relative h-40 flex items-center justify-center">
          <div className="space-y-4">
            <p className="text-sm sm:text-base italic text-white leading-relaxed max-w-2xl font-serif font-light">
              "{stylingReviews[activeReviewIndex].comment}"
            </p>
            <div className="pt-2">
              <div className="text-[10px] tracking-widest font-bold text-white uppercase">{stylingReviews[activeReviewIndex].name}</div>
              <div className="text-[9px] tracking-wider text-text-muted uppercase mt-0.5">{stylingReviews[activeReviewIndex].area}</div>
            </div>
          </div>
        </div>

        {/* Dots slider indicators */}
        <div className="flex justify-center space-x-2.5 mt-6">
          {stylingReviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveReviewIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                activeReviewIndex === idx ? 'bg-primary w-6' : 'bg-white/20 w-1.5'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 7. INSTAGRAM EDITORIAL BANNER */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 text-center space-y-12">
        <div className="space-y-2">
          <span className="text-[10px] tracking-[0.3em] text-primary font-bold uppercase">DIGITAL DIARY</span>
          <h2 className="text-2xl font-serif text-white uppercase tracking-wider">INSTAGRAM EDITORIAL</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            '/products/tshirts/product-01/image-01-front.png',
            '/products/tshirts/product-02/image-02-front.png',
            '/products/tshirts/product-03/image-03-front.png',
            '/products/tshirts/product-04/image-04-front.png'
          ].map((url, idx) => (
            <div key={idx} className="relative h-64 md:h-80 overflow-hidden rounded-xl border border-white/5 group">
              <img
                src={url}
                alt="Instagram Look"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

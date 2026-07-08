"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Search, ArrowRight, Star, Clock, ShoppingCart, ShieldCheck, Flame, Gift } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  spiceLevel: string;
  image: string;
  rating: number;
  prepTime: number;
}

const STATIC_FALLBACK_ITEMS: MenuItem[] = [
  {
    id: "f1",
    name: "Ziyafat Royal Beef Burger",
    description: "Gourmet double beef patties, melted cheddar, caramelized onions, house truffle mayo in a brioche bun.",
    price: 850,
    discount: 10,
    spiceLevel: "MILD",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    prepTime: 15
  },
  {
    id: "d1",
    name: "Special Spicy Chicken Biryani",
    description: "Karachi style aromatic basmati rice layered with spicy chicken masala, potatoes, saffron, and fresh mint.",
    price: 390,
    discount: 10,
    spiceLevel: "SPICY",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    prepTime: 15
  },
  {
    id: "d2",
    name: "Desi Ghee Mutton Karahi",
    description: "Premium mutton cooked in pure desi ghee with fresh ginger, ripe tomatoes, and green chilies.",
    price: 2400,
    discount: 0,
    spiceLevel: "SPICY",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    prepTime: 30
  },
  {
    id: "f2",
    name: "Creamy Fettuccine Alfredo",
    description: "Rich parmesan heavy cream sauce with sliced grilled chicken breast and fresh mushrooms over pasta.",
    price: 950,
    discount: 0,
    spiceLevel: "NONE",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    prepTime: 20
  }
];

export default function Home() {
  const { language, addToCart } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>(STATIC_FALLBACK_ITEMS);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    // Attempt to fetch fresh menu items from backend API
    fetch('http://localhost:5000/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Take top 4 rated items
          const sorted = [...data].sort((a, b) => b.rating - a.rating).slice(0, 4);
          setFeaturedItems(sorted);
        }
      })
      .catch(() => {
        // Fall back silently to static seed data if backend is offline
        console.log("Using local static data for home specials");
      });
  }, []);

  const reviews = [
    {
      name: "Ayesha Siddiqui",
      area: "North Nazimabad, Block L",
      comment: "The Biryani is outstanding! It arrived steaming hot, packaged in a gorgeous premium cardboard box. The hospitality of Ziyafat is unmatched.",
      rating: 5
    },
    {
      name: "Bilal Farooqi",
      area: "North Nazimabad, Block F",
      comment: "Absolutely loved the Royal Beef Burger. The meat was smashed to perfection, juicy and flavorful. A truly five-star experience in Karachi.",
      rating: 5
    },
    {
      name: "Chef Zain-ul-Abideen",
      area: "Culinary Critic",
      comment: "The balance of authentic spices in their Mutton Karahi cooked in pure Desi Ghee is phenomenal. High-end dining standard delivered home.",
      rating: 5
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/menu?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="w-full relative z-10 font-sans overflow-hidden">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        
        {/* Background Image Parallax Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-10 filter blur-xs"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary-light">
              <Flame size={13} className="animate-pulse" />
              <span>{language === 'en' ? 'The Art of Royal Hospitality' : 'شاہی ضیافت کا منفرد فن'}</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {language === 'en' ? (
                <>
                  Savor the Feast of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold font-urdu font-black text-5xl sm:text-7xl">ضیافت</span>
                </>
              ) : (
                <>
                  روایتی لذت اور شاہی <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gold font-urdu font-black text-6xl sm:text-8xl">ضیافت</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-lg text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              {language === 'en' 
                ? "Karachi's ultimate luxury food experience. Fusing the premium standards of a Michelin-starred kitchen with express gourmet delivery to North Nazimabad."
                : "کراچی کا سب سے پرتعیش فوڈ ڈلیوری برانڈ۔ اب اپنے پسندیدہ دیسی کھانے اور فاسٹ فوڈ گھر بیٹھے حاصل کریں۔"}
            </p>

            {/* Instant Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto lg:mx-0 mt-8">
              <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-full focus-within:border-primary shadow-xl">
                <Search className="text-text-muted ml-4" size={20} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 py-3 pl-3 pr-4 text-sm text-white focus:outline-none placeholder:text-text-muted"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2.5 px-6 rounded-full flex items-center gap-1.5 transition-all focus:outline-none"
                >
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* Hero Right Floating Cards */}
          <div className="relative flex justify-center items-center h-[350px] sm:h-[450px]">
            {/* Animated Glow Backdrops */}
            <div className="absolute w-[300px] h-[300px] radial-glow opacity-80 animate-pulse"></div>

            {/* Large Cinematic Food Showcase */}
            <div className="relative z-10 w-[260px] sm:w-[360px] h-[260px] sm:h-[360px] animate-float">
              <img
                src="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800"
                alt="Karachi Biryani Feast"
                className="w-full h-full object-cover rounded-full border-4 border-gold/30 shadow-2xl"
              />
              {/* Float badge 1 */}
              <div className="absolute top-4 -left-6 glass-premium p-3.5 rounded-2xl flex items-center gap-2 animate-float-delayed border border-gold/20">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="text-[10px] text-text-muted">Top Pick</div>
                  <div className="text-xs font-bold text-white">Shahi Biryani</div>
                </div>
              </div>

              {/* Float badge 2 */}
              <div className="absolute bottom-4 -right-6 glass-premium p-3.5 rounded-2xl flex items-center gap-2 animate-float border border-primary/20">
                <div className="text-2xl">👑</div>
                <div>
                  <div className="text-[10px] text-text-muted">Desi Ghee</div>
                  <div className="text-xs font-bold text-white">Mutton Karahi</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORIES SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs tracking-widest text-gold uppercase font-bold">Categories</span>
          <h2 className="text-3xl font-extrabold text-white">Browse By Feast Types</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fast Food Block */}
          <Link href="/menu?category=fast-food" className="relative group overflow-hidden rounded-3xl h-64 border border-white/5 hover:border-primary/40 shadow-2xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
              alt="Fast Food category"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-6 left-6 z-20 space-y-2">
              <span className="text-[10px] bg-primary text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider">Premium Selection</span>
              <h3 className="text-2xl font-bold text-white tracking-wide">FAST FOOD</h3>
              <p className="text-xs text-text-muted max-w-xs font-light">Royal Smash Burgers, Alfredo Pastas, Shawarmas, and Flaky Rolls.</p>
              <div className="flex items-center gap-1 text-xs text-gold font-semibold pt-1">
                <span>Browse Category</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Desi Khany Block */}
          <Link href="/menu?category=desi-khany" className="relative group overflow-hidden rounded-3xl h-64 border border-white/5 hover:border-gold/40 shadow-2xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800"
              alt="Desi Khany category"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-6 left-6 z-20 space-y-2">
              <span className="text-[10px] bg-gold text-background font-bold px-3 py-1 rounded-full uppercase tracking-wider">Royal Recipes</span>
              <h3 className="text-2xl font-bold text-white tracking-wide font-urdu">روایتی دیسی کھانے</h3>
              <p className="text-xs text-text-muted max-w-xs font-light">Aromatic Biryanis, Buttered Lentils, Shahi Haleems, and Wok Karahis.</p>
              <div className="flex items-center gap-1 text-xs text-primary-light font-semibold pt-1">
                <span>Browse Category</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. TODAY'S SPECIALS & RECOMMENDED GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs tracking-widest text-primary font-bold uppercase">{t.todaysSpecials}</span>
            <h2 className="text-3xl font-extrabold text-white">Chef's Signature Recommendations</h2>
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-1 text-sm text-text-muted hover:text-white font-semibold transition-colors"
          >
            <span>View Full Menu</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Specials Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => {
            const finalPrice = item.price * (1 - item.discount / 100);
            return (
              <div key={item.id} className="glass rounded-2xl overflow-hidden flex flex-col border border-white/5 hover:border-primary/20 transition-all hover:shadow-2xl relative group">
                
                {/* Discount Badge */}
                {item.discount > 0 && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                    SAVE {item.discount}%
                  </span>
                )}

                {/* Card Top Image */}
                <div className="h-48 overflow-hidden bg-surface relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Star size={12} className="text-gold fill-current" />
                      <span>{item.rating}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <Clock size={12} className="text-text-muted" />
                      <span>{item.prepTime} mins</span>
                    </span>
                  </div>
                </div>

                {/* Card Content details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${item.spiceLevel === 'SPICY' ? 'text-primary' : 'text-text-muted'}`}>
                        {item.spiceLevel}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed font-light">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-4">
                    <div>
                      <div className="text-sm font-bold text-white">Rs. {Math.round(finalPrice)}</div>
                      {item.discount > 0 && (
                        <div className="text-[10px] text-text-muted line-through">Rs. {item.price}</div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, discount: item.discount, image: item.image })}
                      className="p-2 bg-primary hover:bg-primary-light rounded-lg text-white transition-all focus:outline-none"
                    >
                      <ShoppingCart size={15} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 4. WHY CHOOSE ZIYAFAT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-gold/20 flex gap-4 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Michelin Standards</h3>
              <p className="text-xs text-text-muted leading-relaxed font-light">
                Our kitchen runs with ultra-high sanitization protocols. Every culinary master has years of expert traditional experience.
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-primary/20 flex gap-4 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light flex-shrink-0">
              <Clock size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Express Delivery</h3>
              <p className="text-xs text-text-muted leading-relaxed font-light">
                Freshly cooked meals dispatched with dedicated riders to ensure delivery in North Nazimabad while the food is still piping hot.
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 hover:border-gold/20 flex gap-4 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
              <Gift size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Loyalty & Rewards</h3>
              <p className="text-xs text-text-muted leading-relaxed font-light">
                Earn feast reward points on every single order. Redeem points on checkouts for grand discounts and complimentary rolls.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center relative">
        <span className="text-xs tracking-widest text-gold font-bold uppercase">{language === 'en' ? 'Gourmet Critiques' : 'تبصرے'}</span>
        
        <div className="mt-6 relative h-48 flex items-center justify-center">
          <div className="space-y-4">
            <p className="text-base sm:text-xl italic text-white leading-relaxed max-w-2xl font-light">
              "{reviews[activeReviewIndex].comment}"
            </p>
            <div>
              <div className="text-sm font-bold text-primary-light">{reviews[activeReviewIndex].name}</div>
              <div className="text-xs text-text-muted">{reviews[activeReviewIndex].area}</div>
            </div>
          </div>
        </div>

        {/* Dots slider indicators */}
        <div className="flex justify-center space-x-2.5 mt-4">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveReviewIndex(idx)}
              className={`h-2 w-2 rounded-full transition-all ${
                activeReviewIndex === idx ? 'bg-primary w-5' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION NEWSLETTER */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="glass-premium p-8 sm:p-12 rounded-[2rem] border border-primary/20 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 radial-glow pointer-events-none opacity-50"></div>
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Join the Ziyafat Feast Circle</h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto font-light leading-relaxed">
            Subscribe to receive updates about secret dishes, weekly discounts, and grand chef specials exclusively in Karachi.
          </p>

          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
            />
            <button className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

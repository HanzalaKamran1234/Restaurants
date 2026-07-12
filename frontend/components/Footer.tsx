"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch('/api/extra/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail('');
      }
    } catch (e) {
      // Fallback UI
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-secondaryBg border-t border-white/5 pt-20 pb-12 font-sans relative z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-16">
        
        {/* Brand Info Column */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex flex-col select-none">
            <span className="text-lg font-serif font-black tracking-[0.25em] text-white">
              THE VESTRA
            </span>
            <span className="text-[7px] tracking-[0.35em] text-primary font-medium uppercase mt-0.5">
              WEAR CONFIDENCE.
            </span>
          </Link>
          <p className="text-[11px] text-text-muted leading-relaxed font-light">
            Crafting architectural garments, minimal silhouettes, and luxury essentials for the modern man. Engineered in Pakistan with premium materials.
          </p>
        </div>

        {/* Shop Navigation */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-serif font-bold tracking-[0.2em] text-white uppercase">Collections</h4>
          <ul className="space-y-2 text-[11px] text-text-muted font-light">
            <li><Link href="/shop?category=t-shirts" className="hover:text-white transition-colors">T-Shirts & Polos</Link></li>
            <li><Link href="/shop?category=jeans" className="hover:text-white transition-colors">Premium Denim</Link></li>
            <li><Link href="/shop?category=hoodies" className="hover:text-white transition-colors">Hoodies & Sweatshirts</Link></li>
            <li><Link href="/shop?category=jackets" className="hover:text-white transition-colors">Jackets & Coats</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Concierge Navigation */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-serif font-bold tracking-[0.2em] text-white uppercase">Client Services</h4>
          <ul className="space-y-2 text-[11px] text-text-muted font-light">
            <li><Link href="/faq" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">Complimentary Returns</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">Fitting & Sizing Guide</Link></li>
            <li><Link href="/story" className="hover:text-white transition-colors">Heritage & Craft</Link></li>
            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-serif font-bold tracking-[0.2em] text-white uppercase">THE VESTRA Letter</h4>
          <p className="text-[11px] text-text-muted font-light leading-relaxed">
            Subscribe to receive priority access to seasonal lookbooks, capsule collections, and brand updates.
          </p>
          
          {subscribed ? (
            <p className="text-[10px] text-primary font-bold tracking-wider">WELCOME TO THE VESTRA CIRCLE.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
                required
              />
              <button 
                type="submit"
                className="bg-primary hover:bg-primary-light text-black text-[9px] tracking-widest font-bold px-4 py-2 rounded transition-all uppercase"
              >
                Join
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Footer Bottom copyright details */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-text-muted font-light gap-4">
        <span>© {new Date().getFullYear()} THE VESTRA. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-6">
          <Link href="/faq" className="hover:text-white transition-colors">PRIVACY POLICY</Link>
          <Link href="/faq" className="hover:text-white transition-colors">TERMS OF SERVICE</Link>
        </div>
      </div>
    </footer>
  );
};

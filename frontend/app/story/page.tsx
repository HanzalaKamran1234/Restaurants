"use client";

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Award, Scissors } from 'lucide-react';

export default function Story() {
  const { language } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 font-sans relative z-10 space-y-20">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs tracking-[0.25em] text-primary font-bold uppercase">THE VESTRA Legacy</span>
        <h1 className="text-2xl sm:text-4xl font-serif tracking-widest text-white uppercase">Our Editorial Journey</h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
          Redefining international fashion standards with an uncompromising commitment to minimalist aesthetics, structural tailoring, and premium fabrics.
        </p>
      </div>

      {/* Main Story Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-serif tracking-widest text-white uppercase">A Minimalist Silhouette Transformed</h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
            In Latin, <strong>THE VESTRA</strong> represents ownership and identity. We founded THE VESTRA with a singular mission: to construct luxury essentials that empower individuals to wear confidence.
          </p>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
            Every garment is crafted from hand-picked, extra-long staple combed cotton. Every seam is double-flatlocked for durability. We believe that everyday clothing should feel premium and look like a billion-dollar statement.
          </p>

          <div className="border-l-2 border-primary pl-4 py-2 italic text-xs text-primary leading-relaxed uppercase tracking-wider">
            "WEAR CONFIDENCE. Every stitch is a statement of intent, crafted for the modern silhouette."
          </div>
        </div>

        <div className="h-80 sm:h-96 rounded overflow-hidden border border-white/10 relative shadow-2xl bg-surface">
          <img
            src="/products/tshirts/product-02/image-02-front.png"
            alt="THE VESTRA Tailoring Studio"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
        </div>
      </div>

      {/* Tailoring highlights */}
      <section className="pt-8 space-y-12">
        <h3 className="text-lg sm:text-xl font-serif tracking-widest text-white text-center uppercase">Our Uncompromising Standards</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass p-8 rounded border border-white/5 space-y-4">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Pure Luxury Materials</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              We source organic loopback French terry cotton, heavy 260GSM combed cottons, and vegetable-tanned Italian leather hides. No cheap synthetic blends.
            </p>
          </div>

          <div className="glass p-8 rounded border border-white/5 space-y-4">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Scissors size={16} />
            </div>
            <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Master Craftsmanship</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              Our tailoring team operates under standard pattern designs. Each garment undergoes strict quality inspection for exact fit proportions and structural drape.
            </p>
          </div>

          <div className="glass p-8 rounded border border-white/5 space-y-4">
            <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Award size={16} />
            </div>
            <h4 className="text-xs font-serif font-bold text-white uppercase tracking-wider">Dust Bag Packaging</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              Every shipment is dispatched in custom heavyweight matte-black garment boxes, wrapped in acid-free tissue paper, complete with luxury cotton dust bags.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

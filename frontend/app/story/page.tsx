"use client";

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, UtensilsCrossed, ShieldAlert, Award } from 'lucide-react';

export default function Story() {
  const { language } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans relative z-10 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs tracking-widest text-gold font-bold uppercase">The Ziyafat Legacy</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Our Culinary Story</h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
          Redefining traditional hospitality in Karachi with an uncompromising commitment to premium recipes and high culinary standards.
        </p>
      </div>

      {/* Main Story Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">A Traditional Feast Transformed</h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
            In Urdu, <strong>ضیافت (Ziyafat)</strong> means a premium feast, a celebration of traditional hospitality, and a coming-together of flavors. We founded Ziyafat with a singular mission: to bring the luxury and taste of premium fine dining directly to the comfort of your home.
          </p>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
            Every Biryani is simmered with hand-picked basmati grains and authentic saffron. Every burger patty is hand-smashed with prime-cut grass-fed local beef. We believe that food delivery should never mean sacrificing visual and culinary excellence.
          </p>

          <div className="border-l-4 border-primary pl-4 py-2 italic text-sm text-gold font-urdu leading-loose">
            "روایتی مہمان نوازی اور بہترین ذائقوں کا حسین سنگم - یہ ہے ضیافت کا فلسفہ۔"
          </div>
        </div>

        <div className="h-80 sm:h-96 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-surface">
          <img
            src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800"
            alt="Chef preparing Karahi"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
        </div>
      </div>

      {/* Chef standards highlights */}
      <section className="pt-8 space-y-8">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white text-center">Our Uncompromising Standards</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary-light flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <h4 className="text-base font-bold text-white">Pure Desi Ingredients</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              We never use cheap palm oils or artificial tenderizers. Our Desi Khany are prepared using pure Desi Ghee and hand-ground spices directly sourced from local farmers.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 text-gold flex items-center justify-center">
              <UtensilsCrossed size={18} />
            </div>
            <h4 className="text-base font-bold text-white">Michelin Grade Kitchen</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              Our executive chefs have worked in five-star hotels and Michelin-recognized international kitchens, ensuring standard preparation protocols on every dish.
            </p>
          </div>

          <div className="glass p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary-light flex items-center justify-center">
              <Award size={18} />
            </div>
            <h4 className="text-base font-bold text-white">Premium Eco-Packaging</h4>
            <p className="text-xs text-text-muted leading-relaxed font-light">
              Our meals are delivered in insulated, premium custom matte black cardboard boxes to prevent moisture condensation and ensure the food arrives pristine and hot.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

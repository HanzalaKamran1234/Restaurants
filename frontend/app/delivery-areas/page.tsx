"use client";

import React from 'react';
import { MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function DeliveryAreas() {
  const regions = [
    {
      name: "North Nazimabad",
      blocks: "Blocks A, B, C, D, E, F, G, H, I, J, K, L, M, N, R, T",
      time: "20 - 30 Mins",
      charge: "Rs. 150 (Free over Rs. 1500)",
      minOrder: "Rs. 300"
    },
    {
      name: "Gulshan-e-Iqbal",
      blocks: "Blocks 1 to 14, University Road, Civic Center vicinity",
      time: "35 - 45 Mins",
      charge: "Rs. 250 (Free over Rs. 2500)",
      minOrder: "Rs. 1000"
    },
    {
      name: "Clifton & DHA",
      blocks: "DHA Phases 1-8, Clifton Blocks 1-9",
      time: "45 - 60 Mins",
      charge: "Rs. 350 (Free over Rs. 4000)",
      minOrder: "Rs. 1500"
    },
    {
      name: "Federal B Area & Gulberg",
      blocks: "Water Pump, Ancholi, Gulberg Block 1-13",
      time: "30 - 40 Mins",
      charge: "Rs. 180 (Free over Rs. 2000)",
      minOrder: "Rs. 500"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 font-sans relative z-10 space-y-12">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs tracking-widest text-gold font-bold uppercase">Coverage Map</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Karachi Delivery Zones</h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
          Dispatched from our primary culinary hub on Sher Shah Suri Rd to ensure optimal freshness.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regions.map((r, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl border border-white/5 space-y-4 hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin size={18} className="text-primary-light" />
                <span>{r.name}</span>
              </h3>
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary-light font-bold px-2 py-0.5 rounded">
                Active Zone
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed font-light">
              <strong>Sectors Covered:</strong> {r.blocks}
            </p>

            <div className="grid grid-cols-3 gap-2.5 text-[11px] pt-2 border-t border-white/5">
              <div>
                <span className="text-text-muted block uppercase text-[9px] font-bold">Delivery Time</span>
                <span className="text-white font-medium">{r.time}</span>
              </div>
              <div>
                <span className="text-text-muted block uppercase text-[9px] font-bold">Delivery Fare</span>
                <span className="text-white font-medium">{r.charge}</span>
              </div>
              <div>
                <span className="text-text-muted block uppercase text-[9px] font-bold">Min Order</span>
                <span className="text-white font-medium">{r.minOrder}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Freshness banner */}
      <div className="glass-premium p-8 rounded-3xl border border-primary/20 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Insulated Hot Bag Deliveries</h4>
            <p className="text-xs text-text-muted font-light max-w-sm mt-0.5">
              Our riders use professional thermal heating bags to lock in heat and steam during transit across Karachi.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
          <Clock size={14} className="text-gold" />
          <span>Hot & Fresh Guarantee</span>
        </div>
      </div>

    </div>
  );
}

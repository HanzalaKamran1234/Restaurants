"use client";

import React from 'react';
import { MapPin, Clock, ShieldCheck, Box } from 'lucide-react';

export default function ShippingLogistics() {
  const regions = [
    {
      name: "Karachi Metro",
      blocks: "All residential and commercial zones",
      time: "24 - 48 Hours",
      charge: "Rs. 200 (Free over Rs. 5000)",
      minOrder: "No minimum spend"
    },
    {
      name: "Punjab & Islamabad",
      blocks: "Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, etc.",
      time: "2 - 3 Business Days",
      charge: "Rs. 200 (Free over Rs. 5000)",
      minOrder: "No minimum spend"
    },
    {
      name: "Sindh (Interior) & KPK",
      blocks: "Peshawar, Abbottabad, Hyderabad, Sukkur, Larkana, etc.",
      time: "3 - 4 Business Days",
      charge: "Rs. 200 (Free over Rs. 5000)",
      minOrder: "No minimum spend"
    },
    {
      name: "Balochistan & Gilgit",
      blocks: "Quetta, Gwadar, Gilgit, Skardu, Hunza, etc.",
      time: "4 - 5 Business Days",
      charge: "Rs. 200 (Free over Rs. 5000)",
      minOrder: "No minimum spend"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans relative z-10 space-y-12">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs tracking-[0.25em] text-primary font-bold uppercase block">Logistics Network</span>
        <h1 className="text-2xl sm:text-4xl font-serif tracking-widest text-white uppercase">Shipping & Destinations</h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-light">
          Dispatched from our primary fulfillment studio in Karachi via secure premium courier service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regions.map((r, idx) => (
          <div key={idx} className="glass p-6 rounded border border-white/5 space-y-4 hover:border-primary/20 transition-all text-xs font-light">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <MapPin size={14} className="text-primary" />
                <span>{r.name}</span>
              </h3>
              <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Active Region
              </span>
            </div>

            <p className="text-text-muted leading-relaxed">
              <strong>Coverage:</strong> {r.blocks}
            </p>

            <div className="grid grid-cols-3 gap-2.5 text-[10px] pt-3 border-t border-white/5 font-semibold tracking-wider">
              <div>
                <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wide">Transit Time</span>
                <span className="text-white font-medium">{r.time}</span>
              </div>
              <div>
                <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wide">Courier Fare</span>
                <span className="text-white font-medium">{r.charge}</span>
              </div>
              <div>
                <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wide">Min Order</span>
                <span className="text-white font-medium">{r.minOrder}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Packaging protection banner */}
      <div className="glass-premium p-8 rounded border border-primary/20 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="h-12 w-12 rounded bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Box size={20} />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-white uppercase tracking-widest">Premium Fabric Care Handling</h4>
            <p className="text-[11px] text-text-muted font-light max-w-sm mt-1 leading-relaxed">
              Garments are pre-inspected and shipped in rigid matte black storage boxes with protective cotton dust bags.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-white bg-white/5 border border-white/10 px-4 py-2.5 rounded uppercase">
          <Clock size={12} className="text-primary" />
          <span>Fulfillment Guarantee</span>
        </div>
      </div>

    </div>
  );
}

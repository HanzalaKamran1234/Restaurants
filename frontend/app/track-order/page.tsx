"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function TrackOrderSearch() {
  const [orderIdInput, setOrderIdInput] = useState('');

  const handleSearchTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      window.location.href = `/track-order/${encodeURIComponent(orderIdInput.trim())}`;
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center space-y-8 relative z-10 font-sans">
      <div className="glass-premium p-8 rounded-3xl border border-primary/20 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Track Your Feast</h1>
        <p className="text-xs text-text-muted leading-relaxed font-light">
          Enter your Ziyafat order reference code (e.g. your database ID or order code) to view the live status from kitchen to doorstep.
        </p>

        <form onSubmit={handleSearchTrack} className="space-y-4">
          <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-xl focus-within:border-primary">
            <Search className="text-text-muted ml-3" size={18} />
            <input
              type="text"
              placeholder="Enter Order ID"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full bg-transparent border-0 py-3 pl-2 pr-3 text-xs text-white focus:outline-none placeholder:text-text-muted"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl transition-all focus:outline-none"
          >
            Track Status
          </button>
        </form>
      </div>
    </div>
  );
}

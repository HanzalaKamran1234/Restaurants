"use client";

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-36 text-center space-y-6 relative z-10 font-sans">
      <div className="glass-premium p-10 rounded-3xl border border-primary/20 space-y-6 shadow-2xl">
        <span className="text-8xl font-black text-primary font-urdu animate-pulse select-none">
          ۴۰۴
        </span>
        <h1 className="text-2xl font-bold text-white tracking-wide">Feast Location Lost</h1>
        <p className="text-xs text-text-muted leading-relaxed font-light">
          The recipe or page you are looking for has been moved or is currently not cooking. Return to our signature main course.
        </p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

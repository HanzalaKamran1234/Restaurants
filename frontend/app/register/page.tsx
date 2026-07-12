"use client";

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { translations } from '../../utils/translations';
import { useApp } from '../../context/AppContext';
import { clerkAppearance } from '../../utils/auth-styles';

export default function Register() {
  const { language } = useApp();
  const t = translations[language];

  return (
    <div className="max-w-md mx-auto px-6 py-20 font-sans relative z-10 flex flex-col justify-center items-center">
      <div className="glass-premium p-6 rounded border border-primary/20 space-y-6 w-full">
        
        <div className="text-center space-y-2">
          <span className="text-xl font-serif tracking-[0.25em] text-white uppercase block">THE VESTRA</span>
          <h1 className="text-base font-serif tracking-widest text-white uppercase">{t.register}</h1>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-light">Create a premium client profile</p>
        </div>

        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          appearance={clerkAppearance}
        />

      </div>
    </div>
  );
}

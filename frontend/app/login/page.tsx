"use client";

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { translations } from '../../utils/translations';
import { useApp } from '../../context/AppContext';
import { clerkAppearance } from '../../utils/auth-styles';

export default function Login() {
  const { language } = useApp();
  const t = translations[language];

  return (
    <div className="max-w-md mx-auto px-4 py-20 font-sans relative z-10 flex flex-col justify-center items-center">
      <div className="glass-premium p-6 rounded-3xl border border-primary/20 space-y-6 w-full">
        
        <div className="text-center space-y-1">
          <span className="text-3xl font-extrabold text-primary font-urdu">ضیافت</span>
          <h1 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h1>
          <p className="text-xs text-text-muted">Enter credentials to unlock traditional feasts</p>
        </div>

        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          appearance={clerkAppearance}
        />

      </div>
    </div>
  );
}

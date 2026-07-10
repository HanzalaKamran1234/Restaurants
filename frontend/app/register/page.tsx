"use client";

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { translations } from '../../utils/translations';
import { useApp } from '../../context/AppContext';

export default function Register() {
  const { language } = useApp();
  const t = translations[language];

  return (
    <div className="max-w-md mx-auto px-4 py-20 font-sans relative z-10 flex flex-col justify-center items-center">
      <div className="glass-premium p-6 rounded-3xl border border-primary/20 space-y-6 w-full">
        
        <div className="text-center space-y-1">
          <span className="text-3xl font-extrabold text-primary font-urdu">ضیافت</span>
          <h1 className="text-2xl font-bold text-white tracking-wide">Register Account</h1>
          <p className="text-xs text-text-muted">Create a Ziyafat loyalty membership</p>
        </div>

        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          appearance={{
            variables: {
              colorPrimary: '#c41e3a',
              colorText: '#f5f5f7',
              colorTextSecondary: '#a1a1a6',
              colorBackground: '#0d0d0d',
              colorInputBackground: '#1a1a1a',
              colorInputText: '#ffffff',
              colorDanger: '#e63946',
            },
            elements: {
              cardBox: "shadow-none border-0 bg-transparent w-full",
              card: "bg-transparent shadow-none border-0 p-0 w-full",
              header: "hidden",
              footer: "bg-transparent text-text-muted",
              footerActionLink: "text-primary-light hover:text-white font-bold",
              formButtonPrimary: "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-3.5 px-4 rounded-xl border-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-xs uppercase tracking-wider w-full",
              formFieldInput: "bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3.5 focus:border-primary placeholder:text-text-muted focus:ring-1 focus:ring-primary",
              formFieldLabel: "text-text-muted text-xs font-semibold mb-1",
              socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-2.5",
              socialButtonsBlockButtonText: "text-white text-xs font-bold",
              dividerLine: "bg-white/10",
              dividerText: "text-text-muted text-xs",
              identityPreviewText: "text-white font-medium",
              identityPreviewEditButtonIcon: "text-white",
              formFieldInputShowPasswordButton: "text-text-muted hover:text-white",
              alert: "bg-primary/10 border border-primary/40 text-primary-light rounded-xl p-3.5 text-xs",
              alertText: "text-primary-light",
            }
          }}
        />

      </div>
    </div>
  );
}

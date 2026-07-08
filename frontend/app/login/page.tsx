"use client";

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const { loginUser, language } = useApp();
  const t = translations[language];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        loginUser(data.token, data.user);
        // If user is Admin, redirect to Admin panel, otherwise home
        if (data.user.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setErrorMessage(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Server connection error. Failed to log in.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-28 font-sans relative z-10">
      <div className="glass-premium p-8 rounded-3xl border border-primary/20 space-y-6">
        
        <div className="text-center space-y-1">
          <span className="text-3xl font-extrabold text-primary font-urdu">ضیافت</span>
          <h1 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h1>
          <p className="text-xs text-text-muted">Enter credentials to unlock traditional feasts</p>
        </div>

        {errorMessage && (
          <div className="bg-primary/10 border border-primary/40 text-primary-light p-3.5 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert size={14} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-text-muted">Email Address</label>
            <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-lg focus-within:border-primary">
              <Mail className="text-text-muted ml-3" size={16} />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 py-2.5 pl-2.5 pr-3 text-xs text-white focus:outline-none placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-muted">Password</label>
            <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-lg focus-within:border-primary">
              <Lock className="text-text-muted ml-3" size={16} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 py-2.5 pl-2.5 pr-3 text-xs text-white focus:outline-none placeholder:text-text-muted"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-3 rounded-xl transition-all focus:outline-none text-xs uppercase tracking-wider"
          >
            <span>{isLoading ? 'Processing...' : 'Login'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-xs text-text-muted">Don't have an account? </span>
          <Link href="/register" className="text-xs text-primary-light hover:text-white font-bold">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}

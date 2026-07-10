"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu as MenuIcon, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { cart, user, logoutUser, language, setLanguage, setIsCartOpen } = useApp();
  const pathname = usePathname();
  const t = translations[language];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: t.home, path: '/' },
    { name: t.menu, path: '/menu' },
    { name: t.story, path: '/story' },
    { name: t.track, path: '/track-order' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-3xl font-black text-primary font-urdu group-hover:text-primary-light transition-colors select-none">
              ضیافت
            </span>
            <div className="hidden sm:block border-l border-white/10 h-8"></div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold tracking-widest text-white uppercase group-hover:text-primary transition-colors">
                ZIYAFAT
              </span>
              <span className="text-[9px] tracking-wider text-gold font-light uppercase">
                Karachi Feast
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'text-primary font-bold'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Utility Controls */}
          <div className="flex items-center space-x-4">
            


            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20 rounded-full text-white transition-all focus:outline-none"
            >
              <ShoppingBag size={18} />
              {cartQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background">
                  {cartQuantity}
                </span>
              )}
            </button>

            {/* User Profile / Login dropdown */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 bg-white/5 hover:bg-primary/10 border border-white/10 rounded-full text-white transition-all focus:outline-none"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-gold flex items-center justify-center text-xs font-bold text-white uppercase">
                      {user.name.charAt(0)}
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl glass-premium shadow-xl border border-primary/20 py-2 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard size={15} />
                          <span>{t.adminPanel}</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logoutUser();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-primary-light hover:bg-primary/10 transition-colors"
                      >
                        <LogOut size={15} />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-xs font-bold rounded-lg text-white shadow-md shadow-primary/10 transition-all"
                >
                  <User size={14} />
                  <span>{t.login}</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 py-4 px-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-base font-medium py-1.5 ${
                isActive(link.path) ? 'text-primary font-bold' : 'text-text-muted hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary rounded-lg text-sm font-bold text-white"
            >
              <User size={16} />
              <span>{t.login}</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

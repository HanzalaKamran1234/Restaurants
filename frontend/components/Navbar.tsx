"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu as MenuIcon, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { cart, user, logoutUser, setIsCartOpen } = useApp();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: "HOME", path: '/' },
    { name: "SHOP ALL", path: '/shop' },
    { name: "STORY", path: '/story' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass font-sans transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo Branding */}
          <Link href="/" className="flex flex-col group tracking-widest text-left select-none">
            <span className="text-xl sm:text-2xl font-serif font-black tracking-[0.25em] text-white group-hover:text-primary transition-colors">
              THE VESTRA
            </span>
            <span className="text-[8px] tracking-[0.35em] text-primary font-medium uppercase mt-1">
              WEAR CONFIDENCE.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-xs font-semibold tracking-[0.2em] transition-colors relative py-2 ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Utility Controls */}
          <div className="flex items-center space-x-6">
            
            {/* Shopping Bag Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20 rounded-full text-white transition-all focus:outline-none"
            >
              <ShoppingBag size={16} />
              {cartQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-black font-sans ring-2 ring-background">
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
                    className="flex items-center gap-2 p-1 bg-white/5 hover:bg-primary/10 border border-white/10 rounded-full text-white transition-all focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-serif font-bold text-black uppercase">
                      {user.name.charAt(0)}
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-60 rounded-xl glass-premium shadow-2xl border border-primary/20 py-2 z-50 text-xs">
                      <div className="px-5 py-3 border-b border-white/10">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-5 py-2.5 text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User size={13} />
                        <span>ACCOUNT DETAILS</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-5 py-2.5 text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard size={13} />
                          <span>VESTRA CMS</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logoutUser();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-5 py-2.5 text-primary hover:bg-primary/10 transition-colors font-semibold"
                      >
                        <LogOut size={13} />
                        <span>SIGN OUT</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-[10px] tracking-[0.15em] font-bold rounded-lg text-black hover:bg-primary-light transition-all uppercase"
                >
                  <User size={12} />
                  <span>SIGN IN</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 py-6 px-8 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-xs tracking-[0.15em] font-semibold py-2 ${
                isActive(link.path) ? 'text-primary' : 'text-text-muted hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary rounded-lg text-xs tracking-[0.15em] font-bold text-black uppercase"
            >
              <User size={14} />
              <span>SIGN IN</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

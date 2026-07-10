"use client";

import React from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { Phone, Mail, MapPin, Instagram, Facebook, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useApp();
  const t = translations[language];

  return (
    <footer className="bg-[#030303] border-t border-primary/20 pt-16 pb-8 font-sans mt-20 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 radial-glow pointer-events-none opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-4xl font-extrabold text-primary font-urdu">ضیافت</span>
            <h3 className="text-base font-bold tracking-widest text-white mt-1">ZIYAFAT</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Experience the pinnacle of traditional Pakistani luxury dining and modern culinary innovation in Karachi.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 bg-white/5 hover:bg-primary/20 rounded-full text-text-muted hover:text-white transition-all">
                <Instagram size={15} />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-primary/20 rounded-full text-text-muted hover:text-white transition-all">
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase border-l-2 border-primary pl-2.5 mb-5">
              Explore
            </h4>
            <ul className="space-y-3 text-xs text-text-muted">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-primary transition-colors">Our Menu</Link>
              </li>
              <li>
                <Link href="/story" className="hover:text-primary transition-colors">Our Culinary Story</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-primary transition-colors">Track Your Feast</Link>
              </li>
            </ul>
          </div>

          {/* Delivery Areas */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase border-l-2 border-primary pl-2.5 mb-5">
              Karachi Delivery
            </h4>
            <ul className="space-y-3 text-xs text-text-muted">
              <li className="flex items-center gap-1.5">
                <MapPin size={12} className="text-primary-light" />
                <span>North Nazimabad (Block A-N)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin size={12} className="text-primary-light" />
                <span>Gulshan-e-Iqbal</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin size={12} className="text-primary-light" />
                <span>Clifton & DHA</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock size={12} className="text-gold" />
                <span>Daily: 12:00 PM - 02:00 AM</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase border-l-2 border-primary pl-2.5 mb-5">
              Reservations & Support
            </h4>
            <ul className="space-y-3.5 text-xs text-text-muted">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary-light" />
                <a href="tel:0370349146" className="hover:text-white transition-colors">0370349146</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary-light" />
                <a href="mailto:info@ziyafat.com" className="hover:text-white transition-colors">info@ziyafat.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary-light mt-0.5" />
                <span>Main Sher Shah Suri Rd, Block L, North Nazimabad, Karachi, Pakistan</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Ziyafat. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

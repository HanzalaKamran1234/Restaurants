"use client";

import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
    language,
  } = useApp();

  const t = translations[language];

  if (!isCartOpen) return null;

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const finalPrice = item.price * (1 - item.discount / 100);
    return sum + finalPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal >= 5000 ? 0 : (cart.length > 0 ? 200 : 0);
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel */}
        <div className="w-screen max-w-md glass-premium flex flex-col shadow-2xl relative animate-slide-in">
          {/* Header */}
          <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold tracking-[0.2em] text-white flex items-center gap-2 uppercase">
              <ShoppingBag size={16} className="text-primary" />
              <span>{t.cart}</span>
              <span className="text-[10px] font-sans font-light text-text-muted">({cart.length} PIECES)</span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-md text-text-muted hover:text-white focus:outline-none focus:ring-2 focus:ring-primary p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-5">
            {cart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-6">
                <div className="text-text-muted font-light text-xs tracking-widest uppercase">YOUR BAG IS EMPTY.</div>
                <p className="text-[10px] text-text-muted/70 max-w-xs leading-relaxed">
                  Explore our luxury minimalist collections and wear confidence.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 border border-primary hover:bg-primary hover:text-black rounded text-primary text-[10px] font-bold tracking-widest uppercase transition-all"
                >
                  SHOP ALL PIECES
                </Link>
              </div>
            ) : (
              cart.map((item) => {
                const finalPrice = item.price * (1 - item.discount / 100);
                return (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5 relative group hover:border-primary/20 transition-all">
                    {/* Item Image */}
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded border border-white/10 bg-surface">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-xs font-bold text-white tracking-widest uppercase group-hover:text-primary transition-colors flex flex-col gap-1">
                            <span className="line-clamp-1">{item.name}</span>
                            <span className="text-[9px] text-text-muted font-normal tracking-wide lowercase">
                              {item.color} / {item.size}
                            </span>
                          </h4>
                          <span className="text-xs font-bold text-white font-sans pl-2">Rs. {Math.round(finalPrice * item.quantity)}</span>
                        </div>
                        {item.discount > 0 && (
                          <div className="text-[9px] text-primary flex items-center gap-1.5 mt-0.5">
                            <span className="line-through text-text-muted font-sans">Rs. {item.price}</span>
                            <span>({item.discount}% OFF)</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1.5 bg-black/40 border border-white/10 rounded px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                            className="text-text-muted hover:text-white p-0.5"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-[10px] font-bold px-1.5 text-white w-4 text-center font-sans">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                            className="text-text-muted hover:text-white p-0.5"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="text-text-muted hover:text-primary transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing & Checkout Summary */}
          {cart.length > 0 && (
            <div className="border-t border-white/5 bg-black/40 px-6 py-6 space-y-4">
              {/* Pricing breakdown */}
              <div className="space-y-2 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="text-white font-medium font-sans">Rs. {Math.round(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.deliveryCharge}</span>
                  <span className="text-white font-sans">
                    {shippingFee === 0 ? "FREE" : `Rs. ${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white border-t border-white/5 pt-3 mt-1 uppercase tracking-wider">
                  <span>{t.grandTotal}</span>
                  <span className="text-primary font-sans text-sm">Rs. {grandTotal}</span>
                </div>
              </div>

              {/* Checkout link button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-black text-xs font-bold py-3.5 px-4 rounded transition-all text-center uppercase tracking-widest"
              >
                <CreditCard size={14} />
                <span>Secure Checkout</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

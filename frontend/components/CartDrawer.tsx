"use client";

import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { X, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
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

  const deliveryCharge = cart.length > 0 ? 150 : 0;
  const tax = Math.round(subtotal * 0.13); // 13% GST
  const grandTotal = subtotal + deliveryCharge + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel */}
        <div className="w-screen max-w-md glass-premium flex flex-col shadow-2xl relative animate-slide-in">
          {/* Header */}
          <div className="px-6 py-5 border-b border-primary/20 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
              <span className="text-primary font-urdu">ضیافت</span>
              <span>{t.cart}</span>
              <span className="text-sm font-light text-text-muted">({cart.length} items)</span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-md text-text-muted hover:text-white focus:outline-none focus:ring-2 focus:ring-primary p-1"
            >
              <X size={22} />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-5">
            {cart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-text-muted font-light text-lg">Your cart is currently empty.</div>
                <div className="text-sm text-primary-light">Savor our traditional rich menu!</div>
                <Link
                  href="/menu"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2 border border-primary/40 hover:border-primary bg-primary/10 rounded-full text-white text-sm transition-all"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              cart.map((item) => {
                const finalPrice = item.price * (1 - item.discount / 100);
                return (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 relative group hover:border-primary/20 transition-all">
                    {/* Item Image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{item.name}</h4>
                          <span className="text-sm font-bold text-white pl-2">Rs. {Math.round(finalPrice * item.quantity)}</span>
                        </div>
                        {item.discount > 0 && (
                          <div className="text-xs text-primary-light flex items-center gap-1.5 mt-0.5">
                            <span className="line-through text-text-muted">Rs. {item.price}</span>
                            <span>({item.discount}% Off)</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1.5 bg-black/40 border border-white/10 rounded-full px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-text-muted hover:text-white p-1"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs font-semibold px-1.5 text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-text-muted hover:text-white p-1"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-text-muted hover:text-primary transition-colors p-1"
                        >
                          <Trash2 size={15} />
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
            <div className="border-t border-primary/20 bg-black/40 px-6 py-6 space-y-4">
              {/* Pricing breakdown */}
              <div className="space-y-2 text-sm text-text-muted">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="text-white font-medium">Rs. {Math.round(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.deliveryCharge}</span>
                  <span className="text-white">Rs. {deliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.tax}</span>
                  <span className="text-white">Rs. {tax}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white border-t border-white/10 pt-3 mt-1">
                  <span>{t.grandTotal}</span>
                  <span className="text-primary-light">Rs. {grandTotal}</span>
                </div>
              </div>

              {/* Checkout link button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all text-center"
              >
                <CreditCard size={18} />
                <span>Proceed to Checkout</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { CreditCard, MapPin, Phone, User, Landmark, Tag, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const KARACHI_AREAS = [
  "North Nazimabad",
  "Gulshan-e-Iqbal",
  "Clifton",
  "DHA",
  "Federal B Area",
  "Gulberg",
  "Bahadurabad",
  "PECHS"
];

export default function Checkout() {
  const {
    cart,
    clearCart,
    appliedCoupon,
    language,
    user,
    token
  } = useApp();

  const t = translations[language];

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState(KARACHI_AREAS[0]);
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, JAZZCASH, CARD

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [whatsappApiLink, setWhatsappApiLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill details if user logged in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
      if (user.addresses && user.addresses.length > 0) {
        setAddress(user.addresses[0].fullAddress);
        setArea(user.addresses[0].area);
        setLandmark(user.addresses[0].landmark || '');
      }
    }
  }, [user]);

  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-6 relative z-10 font-sans">
        <h1 className="text-2xl font-bold text-white">Your Cart is Empty</h1>
        <p className="text-sm text-text-muted">You cannot proceed to checkout with an empty feast.</p>
        <Link href="/menu" className="inline-block bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors">
          Browse Cuisines
        </Link>
      </div>
    );
  }

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const finalPrice = item.price * (1 - item.discount / 100);
    return sum + finalPrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = subtotal * (appliedCoupon.discountPercent / 100);
    if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
      discountAmount = appliedCoupon.maxDiscount;
    }
  }

  const netSubtotal = Math.max(0, subtotal - discountAmount);
  const deliveryCharge = 150;
  const tax = Math.round(netSubtotal * 0.13); // 13% GST
  const grandTotal = netSubtotal + deliveryCharge + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setErrorMessage('Please fill in Name, Phone, and Complete Address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      items: cart.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
      deliveryAddress: address,
      nearestLandmark: landmark || undefined,
      area,
      instructions: instructions || undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      paymentMethod,
      customerName: name,
      customerPhone: phone,
    };

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setCreatedOrder(data.order);
        setWhatsappApiLink(data.whatsappLink);
        clearCart();

        // Proactively open WhatsApp in new tab for instant structured order submission
        if (data.whatsappLink) {
          window.open(data.whatsappLink, '_blank');
        }
      } else {
        setErrorMessage(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Server connection error. Failed to place order.');
    }
  };

  // SUCCESS CONFIRMATION PANEL
  if (createdOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 font-sans text-center relative z-10 space-y-8">
        <div className="glass-premium p-8 rounded-3xl border border-gold/20 space-y-6">
          <div className="flex justify-center text-green-400">
            <CheckCircle2 size={64} className="animate-bounce" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Feast Placed Successfully!</h1>
          <p className="text-sm text-text-muted">
            Your order <span className="text-primary-light font-bold">#{createdOrder.orderNumber}</span> has been saved in the Ziyafat database.
          </p>

          <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs text-text-muted space-y-2 text-left">
            <div><strong>Order ID:</strong> {createdOrder.id}</div>
            <div><strong>Grand Total:</strong> Rs. {createdOrder.finalAmount}</div>
            <div><strong>Address:</strong> {createdOrder.deliveryAddress}, {createdOrder.area}</div>
          </div>

          <div className="space-y-3.5">
            {whatsappApiLink && (
              <a
                href={whatsappApiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-4 rounded-xl transition-all"
              >
                <MessageSquare size={18} />
                <span>Submit Order via WhatsApp</span>
              </a>
            )}

            <Link
              href={`/track-order/${createdOrder.id}`}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-3.5 px-4 rounded-xl transition-all"
            >
              <span>Go to Live Order Tracking</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans relative z-10">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-8">Secure Checkout</h1>

      {errorMessage && (
        <div className="bg-primary/10 border border-primary/40 text-primary-light p-4 rounded-xl text-sm mb-6">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
          
          {/* Customer info */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <User size={15} className="text-gold" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-muted">WhatsApp Number (Optional - for order confirmations)</label>
              <input
                type="text"
                placeholder="e.g. +923001234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Delivery Location */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin size={15} className="text-gold" />
              <span>Delivery Details (Karachi)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Nearest Landmark</label>
                <div className="relative">
                  <Landmark size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder={t.landmarkPlaceholder}
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-muted">Select Delivery Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {KARACHI_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-muted">Complete Delivery Address</label>
              <textarea
                required
                rows={3}
                placeholder={t.addressPlaceholder}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-muted">Special Chef / Rider Instructions</label>
              <input
                type="text"
                placeholder={t.notesPlaceholder}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <CreditCard size={15} className="text-gold" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-primary"
                />
                <div>
                  <div className="text-xs font-bold text-white">{t.cod}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Pay with cash upon package handoff.</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'JAZZCASH' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'JAZZCASH'}
                  onChange={() => setPaymentMethod('JAZZCASH')}
                  className="accent-primary"
                />
                <div>
                  <div className="text-xs font-bold text-white">{t.jazzcash}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Easy mobile transfer (EasyPaisa/JazzCash).</div>
                </div>
              </label>
            </div>
          </div>

        </form>

        {/* Order Items Summary */}
        <aside className="lg:col-span-5 glass-premium p-6 rounded-2xl border border-primary/20 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
            Feast Order Summary
          </h3>

          <div className="space-y-4 max-h-72 overflow-y-auto">
            {cart.map((item) => {
              const itemPrice = item.price * (1 - item.discount / 100);
              return (
                <div key={item.id} className="flex justify-between items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-light">{item.quantity}x</span>
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                  <span className="text-white">Rs. {Math.round(itemPrice * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-text-muted">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span className="text-white">Rs. {Math.round(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-primary-light">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>- Rs. {Math.round(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t.deliveryCharge}</span>
              <span className="text-white">Rs. {deliveryCharge}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.tax}</span>
              <span className="text-white">Rs. {tax}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white border-t border-white/10 pt-4 mt-2">
              <span>{t.grandTotal}</span>
              <span className="text-primary-light">Rs. {grandTotal}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all text-center focus:outline-none"
          >
            <span>{isSubmitting ? 'Submitting Order...' : t.placeOrder}</span>
          </button>
        </aside>

      </div>
    </div>
  );
}

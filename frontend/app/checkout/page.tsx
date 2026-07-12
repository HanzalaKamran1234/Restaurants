"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { CreditCard, MapPin, Phone, User, Landmark, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Checkout() {
  const {
    cart,
    clearCart,
    language,
    user,
    token,
    addresses
  } = useApp();

  const t = translations[language];

  const [mounted, setMounted] = useState(false);

  // Selected saved address ID (or 'custom')
  const [selectedAddressId, setSelectedAddressId] = useState('custom');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Karachi');
  const [province, setProvince] = useState('Sindh');
  const [postalCode, setPostalCode] = useState('74600');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, CARD, JAZZCASH, EASYPAISA

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill details if user logged in
  useEffect(() => {
    setMounted(true);
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Handle saved address change selection
  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'custom') {
      setAddress('');
      setCity('Karachi');
      setProvince('Sindh');
      setPostalCode('74600');
      setPhone(user?.phone || '');
    } else {
      const selected = addresses.find(addr => addr.id === id);
      if (selected) {
        setAddress(selected.fullAddress);
        setCity(selected.city);
        setProvince(selected.province);
        setPostalCode(selected.postalCode || '74600');
        setPhone(selected.phone || user?.phone || '');
      }
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-xs text-text-muted font-sans relative z-10">
        Preparing secure checkout session...
      </div>
    );
  }

  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center space-y-6 relative z-10 font-sans">
        <h1 className="text-xl font-serif tracking-widest text-white uppercase">Your Bag is Empty</h1>
        <p className="text-xs text-text-muted font-light">You cannot proceed to checkout without adding garments first.</p>
        <Link href="/shop" className="inline-block bg-primary hover:bg-primary-light text-black text-[10px] tracking-widest font-bold px-8 py-3.5 rounded transition-all uppercase">
          Explore collections
        </Link>
      </div>
    );
  }

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const finalPrice = item.price * (1 - item.discount / 100);
    return sum + finalPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal >= 5000 ? 0 : 200;
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !city || !province) {
      setErrorMessage('Please fill in Name, Phone Number, City, Province, and Complete Shipping Address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formattedAddress = `${address}, ${city}, ${province} ${postalCode ? `(${postalCode})` : ''}`;

    const payload = {
      items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, size: i.size, color: i.color })),
      shippingAddress: formattedAddress,
      paymentMethod,
      notes: instructions || undefined,
      addressId: selectedAddressId !== 'custom' ? selectedAddressId : undefined,
      customerName: name,
      customerPhone: phone
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setCreatedOrder(data.order);
        clearCart();
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
      <div className="max-w-xl mx-auto px-6 py-20 font-sans text-center relative z-10 space-y-8">
        <div className="glass-premium p-8 rounded-2xl border border-primary/20 space-y-6">
          <div className="flex justify-center text-primary">
            <CheckCircle2 size={56} className="animate-bounce" />
          </div>
          <h1 className="text-xl font-serif tracking-widest text-white uppercase">Purchase Placed Successfully!</h1>
          <p className="text-xs text-text-muted font-light leading-relaxed">
            Your order <span className="text-primary font-bold">#{createdOrder.orderNumber}</span> has been processed. We will send an SMS dispatch notification shortly.
          </p>

          <div className="bg-white/5 border border-white/5 p-5 rounded-lg text-xs text-text-muted space-y-2 text-left font-light leading-relaxed">
            <div><strong>Order Reference:</strong> {createdOrder.orderNumber}</div>
            <div><strong>Subtotal:</strong> Rs. {createdOrder.subtotal}</div>
            <div><strong>Shipping Charge:</strong> {createdOrder.shippingCharge === 0 ? 'FREE' : `Rs. ${createdOrder.shippingCharge}`}</div>
            <div><strong>Grand Total:</strong> Rs. {createdOrder.finalAmount}</div>
            <div><strong>Shipping Address:</strong> {createdOrder.shippingAddress}</div>
            <div><strong>Payment Method:</strong> {createdOrder.paymentMethod}</div>
          </div>

          <div className="space-y-3 pt-4">
            <Link
              href="/"
              className="w-full flex items-center justify-center bg-primary hover:bg-primary-light text-black font-bold tracking-widest py-3 px-4 rounded text-xs transition-all uppercase"
            >
              <span>CONTINUE SHOPPING</span>
            </Link>

            <Link
              href="/profile"
              className="w-full flex items-center justify-center border border-white/10 hover:border-white hover:bg-white/5 text-white font-bold tracking-widest py-3 px-4 rounded text-xs transition-all uppercase"
            >
              <span>VIEW ORDER HISTORY</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 font-sans relative z-10">
      <h1 className="text-xl sm:text-2xl font-serif tracking-widest text-white uppercase mb-10">Secure Checkout</h1>

      {errorMessage && (
        <div className="bg-primary/10 border border-primary/40 text-primary p-4 rounded-xl text-xs mb-8 flex items-center gap-2">
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-8">
          
          {/* Multiple Saved Addresses Picker */}
          {user && addresses.length > 0 && (
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-3">
                <MapPin size={14} className="text-primary" />
                <span>Choose Shipping Address</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                      selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span>{addr.title}</span>
                      <input
                        type="radio"
                        name="address-picker"
                        checked={selectedAddressId === addr.id}
                        onChange={() => handleAddressChange(addr.id)}
                        className="accent-primary"
                      />
                    </div>
                    <div className="text-text-muted truncate font-light mt-1">{addr.fullAddress}</div>
                    <div className="text-[10px] text-primary mt-1 uppercase font-semibold">{addr.city}, {addr.province}</div>
                  </label>
                ))}

                <label
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                    selectedAddressId === 'custom' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>Use Custom Address</span>
                    <input
                      type="radio"
                      name="address-picker"
                      checked={selectedAddressId === 'custom'}
                      onChange={() => handleAddressChange('custom')}
                      className="accent-primary"
                    />
                  </div>
                  <div className="text-text-muted font-light mt-1">Specify new destination</div>
                </label>
              </div>
            </div>
          )}

          {/* Contact details */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-3">
              <User size={14} className="text-primary" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hanzala Kamran"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted font-light"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Contact Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 03700349146"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted font-light"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address fields */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin size={14} className="text-primary" />
              <span>Shipping Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">City</label>
                <input
                  type="text"
                  required
                  disabled={selectedAddressId !== 'custom'}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 disabled:opacity-50 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted font-light"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Province</label>
                <input
                  type="text"
                  required
                  disabled={selectedAddressId !== 'custom'}
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 disabled:opacity-50 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted font-light"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider block">Postal Code</label>
                <input
                  type="text"
                  disabled={selectedAddressId !== 'custom'}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 disabled:opacity-50 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted font-light"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wider block">Complete Street Address</label>
              <textarea
                required
                rows={3}
                disabled={selectedAddressId !== 'custom'}
                placeholder="House/Apartment #, street, area details..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 disabled:opacity-50 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted resize-none font-light leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-muted uppercase tracking-wider block">Delivery Instructions / Courier Notes</label>
              <input
                type="text"
                placeholder="e.g. Please leave with guard, call before arrival..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted font-light"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-3">
              <CreditCard size={14} className="text-primary" />
              <span>Payment Option</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-4 rounded-xl border cursor-pointer flex gap-3 items-start transition-all ${
                paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/10'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-primary mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Cash on Delivery (COD)</div>
                  <div className="text-[10px] text-text-muted mt-1 font-light leading-relaxed">Pay with cash upon package handoff.</div>
                </div>
              </label>

              <label className={`p-4 rounded-xl border cursor-pointer flex gap-3 items-start transition-all ${
                paymentMethod === 'CARD' ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/10'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  className="accent-primary mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Credit / Debit Card</div>
                  <div className="text-[10px] text-text-muted mt-1 font-light leading-relaxed">Pay securely using Visa, Mastercard, or UnionPay.</div>
                </div>
              </label>
            </div>
          </div>

        </form>

        {/* Order Items Summary */}
        <aside className="lg:col-span-5 glass-premium p-6 rounded-2xl border border-primary/20 space-y-6">
          <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3">
            Garment Order Summary
          </h3>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => {
              const itemPrice = item.price * (1 - item.discount / 100);
              return (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-center gap-4 text-xs font-light">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{item.quantity}x</span>
                    <span className="text-white uppercase tracking-wide">
                      {item.name} <span className="text-text-muted text-[10px] font-normal lowercase tracking-normal">({item.color} / {item.size})</span>
                    </span>
                  </div>
                  <span className="text-white font-sans font-semibold">Rs. {Math.round(itemPrice * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-text-muted font-light">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span className="text-white font-semibold font-sans">Rs. {Math.round(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-white font-sans">
                {shippingFee === 0 ? "FREE" : `Rs. ${shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold text-white border-t border-white/5 pt-4 mt-2 uppercase tracking-widest">
              <span>{t.grandTotal}</span>
              <span className="text-primary font-sans text-sm">Rs. {grandTotal}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-50 text-black font-bold py-3.5 px-4 rounded text-xs transition-all text-center uppercase tracking-widest"
          >
            <span>{isSubmitting ? 'Processing Purchase...' : 'Complete Purchase'}</span>
          </button>
        </aside>

      </div>
    </div>
  );
}

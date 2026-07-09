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
    addresses,
    deliveryAreas
  } = useApp();

  const t = translations[language];

  const [mounted, setMounted] = useState(false);

  // Selected saved address ID (or 'custom')
  const [selectedAddressId, setSelectedAddressId] = useState('custom');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, JAZZCASH, CARD

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [whatsappApiLink, setWhatsappApiLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill details if user logged in
  useEffect(() => {
    setMounted(true);
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
    }
  }, [user]);

  // Set default area on load
  useEffect(() => {
    if (deliveryAreas.length > 0) {
      setSelectedAreaId(deliveryAreas[0].id);
    }
  }, [deliveryAreas]);

  // Handle saved address change selection
  const handleAddressChange = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'custom') {
      setAddress('');
      setLandmark('');
      if (deliveryAreas.length > 0) setSelectedAreaId(deliveryAreas[0].id);
    } else {
      const selected = addresses.find(addr => addr.id === id);
      if (selected) {
        setAddress(selected.fullAddress);
        setLandmark(selected.landmark || '');
        setSelectedAreaId(selected.areaId);
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

  // Active delivery area configurations
  const activeArea = deliveryAreas.find(a => a.id === selectedAreaId) || deliveryAreas[0];
  const deliveryCharge = activeArea ? activeArea.deliveryCharge : 150;
  const minOrderAmount = activeArea ? activeArea.minOrderAmount : 300;
  const isAreaOpen = activeArea ? activeArea.available : true;
  const isMinOrderMet = subtotal >= minOrderAmount;

  const tax = Math.round(subtotal * 0.13); // 13% GST
  const grandTotal = subtotal + deliveryCharge + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !selectedAreaId) {
      setErrorMessage('Please fill in Name, Phone, Area, and Complete Address.');
      return;
    }

    if (!isMinOrderMet) {
      setErrorMessage(`Minimum order of Rs. ${minOrderAmount} is required for this area.`);
      return;
    }

    if (!isAreaOpen) {
      setErrorMessage(`Delivery to this area is currently closed.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      items: cart.map((i) => ({ menuItemId: i.id, quantity: i.quantity, size: i.size })),
      deliveryAddress: address,
      nearestLandmark: landmark || undefined,
      areaId: selectedAreaId,
      instructions: instructions || undefined,
      paymentMethod,
      customerName: name,
      customerPhone: phone,
      whatsappNumber: whatsapp || undefined
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
            <div><strong>Order Reference:</strong> {createdOrder.orderNumber}</div>
            <div><strong>Grand Total:</strong> Rs. {createdOrder.finalAmount}</div>
            <div><strong>Address:</strong> {createdOrder.deliveryAddress}</div>
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
        <div className="bg-primary/10 border border-primary/40 text-primary-light p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
          
          {/* Multiple Saved Addresses Picker */}
          {user && addresses.length > 0 && (
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
                <MapPin size={15} className="text-gold" />
                <span>Choose Saved Address</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
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
                    <div className="text-text-muted truncate">{addr.fullAddress}</div>
                    <div className="text-[10px] text-gold mt-1">{addr.area.name}</div>
                  </label>
                ))}

                <label
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
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
                  <div className="text-text-muted">Type new delivery address</div>
                </label>
              </div>
            </div>
          )}

          {/* Contact details */}
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
              <label className="text-xs text-text-muted">WhatsApp Number (For order details)</label>
              <input
                type="text"
                placeholder="e.g. 03331234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Delivery Address fields */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin size={15} className="text-gold" />
              <span>Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Nearest Landmark</label>
                <div className="relative">
                  <Landmark size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    disabled={selectedAddressId !== 'custom'}
                    placeholder={t.landmarkPlaceholder}
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 disabled:opacity-50 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-text-muted">Select Delivery Area</label>
                <select
                  value={selectedAreaId}
                  disabled={selectedAddressId !== 'custom'}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full bg-surface border border-white/10 disabled:opacity-50 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  {deliveryAreas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-muted">Complete Delivery Address</label>
              <textarea
                required
                rows={3}
                disabled={selectedAddressId !== 'custom'}
                placeholder={t.addressPlaceholder}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 disabled:opacity-50 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted resize-none"
              />
            </div>

            {activeArea && (
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">Area Status:</span>
                  <span className={isAreaOpen ? 'text-green-400 font-bold' : 'text-primary-light font-bold'}>
                    {isAreaOpen ? 'Open & Taking Orders' : 'Delivery Currently Closed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Minimum Spend Required:</span>
                  <span className="text-white font-medium">Rs. {minOrderAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Delivery Fare:</span>
                  <span className="text-white font-medium">Rs. {deliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Estimated Delivery Time:</span>
                  <span className="text-white font-medium">{activeArea.estimatedTime}</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-text-muted">Special Instructions</label>
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
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-light">{item.quantity}x</span>
                    <span className="text-white font-medium">
                      {item.name} <span className="text-gold font-normal">({item.size})</span>
                    </span>
                  </div>
                  <span className="text-white">Rs. {Math.round(itemPrice * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-text-muted">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span className="text-white font-semibold">Rs. {Math.round(subtotal)}</span>
            </div>
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

          {/* Checkout Button with minimum order check validation */}
          {!isMinOrderMet && activeArea && (
            <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-xl text-xs text-primary-light flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>Minimum order of Rs. {minOrderAmount} is required for delivery here.</span>
            </div>
          )}

          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !isMinOrderMet || !isAreaOpen}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all text-center focus:outline-none"
          >
            <span>{isSubmitting ? 'Submitting Order...' : t.placeOrder}</span>
          </button>
        </aside>

      </div>
    </div>
  );
}

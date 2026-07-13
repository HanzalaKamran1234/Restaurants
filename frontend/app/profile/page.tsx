"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { User, MapPin, Heart, ListOrdered, Plus, Trash2, ShieldAlert, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfileDashboard() {
  const {
    user,
    token,
    addresses,
    addAddress,
    deleteAddress,
    favorites,
    toggleFavorite,
    addToCart,
    language
  } = useApp();

  const t = translations[language];

  // Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'favorites'>('orders');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New Address Form
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrFull, setAddrFull] = useState('');
  const [addrCity, setAddrCity] = useState('Karachi');
  const [addrProvince, setAddrProvince] = useState('Sindh');
  const [addrPostal, setAddrPostal] = useState('74600');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrSuccess, setAddrSuccess] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Order History
  useEffect(() => {
    if (token) {
      setLoadingOrders(true);
      fetch('/api/orders/user')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setOrderHistory(data);
          setLoadingOrders(false);
        })
        .catch(() => {
          setLoadingOrders(false);
        });
    }
  }, [token]);

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center text-xs text-text-muted font-sans">
        Loading profile details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-32 text-center space-y-6 relative z-10 font-sans">
        <div className="glass-premium p-8 rounded-2xl border border-primary/20 space-y-4">
          <div className="flex justify-center text-primary">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-lg font-serif tracking-widest text-white uppercase">Authentication Required</h1>
          <p className="text-xs text-text-muted font-light leading-relaxed">
            Please sign in to your profile to view your shipping destinations and luxury purchase history.
          </p>
          <Link href="/login" className="inline-block bg-primary hover:bg-primary-light text-black text-[10px] tracking-widest font-bold px-8 py-3 rounded uppercase transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Address Submit
  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle || !addrFull || !addrCity || !addrProvince) return;

    const success = await addAddress(addrTitle, addrFull, addrCity, addrProvince, addrPostal, addrPhone);
    if (success) {
      setAddrSuccess('Address saved successfully!');
      setAddrFull('');
      setAddrPhone('');
      setAddrPostal('74600');
      setTimeout(() => setAddrSuccess(''), 3000);
    }
  };

  // Reorder Item handler
  const handleReorder = (orderItems: any[]) => {
    orderItems.forEach((oi) => {
      addToCart({
        id: oi.product.id,
        name: oi.product.name,
        price: oi.price,
        discount: oi.product.discount,
        image: oi.product.images?.[0]?.url || '',
        size: oi.size || 'M',
        color: oi.color || 'Black',
        quantity: oi.quantity
      }, oi.quantity);
    });
    // Redirect to checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 font-sans relative z-10 space-y-10">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 gap-6">
        <div>
          <span className="text-[10px] text-primary tracking-[0.25em] font-bold uppercase block">Customer Profile</span>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-widest text-white uppercase mt-1">Welcome, {user.name}</h1>
          <p className="text-xs text-text-muted mt-1 font-light tracking-wide">{user.email}</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 bg-white/5 border border-white/10 p-1 rounded text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded transition-all text-[10px] ${
              activeTab === 'orders' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
            }`}
          >
            <ListOrdered size={12} />
            <span>Purchases</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded transition-all text-[10px] ${
              activeTab === 'addresses' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
            }`}
          >
            <MapPin size={12} />
            <span>Destinations ({addresses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded transition-all text-[10px] ${
              activeTab === 'favorites' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
            }`}
          >
            <Heart size={12} />
            <span>Wishlist ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Tab Panel */}
        <main className="lg:col-span-8 space-y-6">
          
          {/* ORDERS HISTORY */}
          {activeTab === 'orders' && (
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest">Previous Purchases</h3>
              
              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-text-muted">Loading purchase history...</div>
              ) : orderHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted space-y-4 font-light">
                  <p>No transactions registered yet.</p>
                  <Link href="/shop" className="inline-block bg-primary/10 border border-primary/30 px-6 py-2.5 rounded text-primary text-[10px] tracking-widest font-bold uppercase transition-all">
                    Shop Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 hover:border-primary/20 transition-all flex flex-col sm:flex-row justify-between sm:items-center text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-widest">#{order.orderNumber}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase font-bold ${
                            order.status === 'DELIVERED' ? 'bg-green-950 text-green-400' : 'bg-primary/10 text-primary'
                          }`}>{order.status}</span>
                        </div>
                        <div className="text-text-muted text-[10px] font-light">{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-text-muted font-light mt-1 uppercase tracking-wide text-[10px]">
                          {order.items.map((i: any) => `${i.quantity}x ${i.product.name} (${i.color}/${i.size})`).join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 justify-between">
                        <span className="font-bold text-white font-sans">Rs. {order.finalAmount}</span>
                        <div className="flex items-center gap-2 font-bold tracking-widest">
                          <button
                            onClick={() => handleReorder(order.items)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-light text-[9px] text-black rounded uppercase transition-all"
                          >
                            <ShoppingBag size={11} />
                            <span>Reorder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESS MANAGER */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest">Shipping Destinations</h3>

                {addresses.length === 0 ? (
                  <p className="text-xs text-text-muted py-2 font-light">No saved addresses found. Add one below.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between hover:border-primary/20 transition-all relative text-xs font-light">
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="absolute top-4 right-4 text-text-muted hover:text-primary transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div>
                          <h4 className="font-bold text-white uppercase tracking-wider">{addr.title}</h4>
                          <p className="text-text-muted mt-1 leading-relaxed">{addr.fullAddress}</p>
                          {addr.phone && <div className="text-[10px] text-text-muted mt-1">Phone: {addr.phone}</div>}
                        </div>
                        <span className="text-[10px] text-primary uppercase font-bold tracking-wider mt-3 block">{addr.city}, {addr.province} {addr.postalCode}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Address Form */}
              <form onSubmit={handleAddAddressSubmit} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-3">
                  <Plus size={14} className="text-primary" />
                  <span>Add Shipping Destination</span>
                </h3>

                {addrSuccess && (
                  <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/30 p-2.5 rounded-lg font-light">{addrSuccess}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase tracking-wider block">Title (e.g. Home, Office)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Home"
                      value={addrTitle}
                      onChange={(e) => setAddrTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase tracking-wider block">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="Recipient contact number..."
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase tracking-wider block">City</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase tracking-wider block">Province</label>
                    <input
                      type="text"
                      required
                      value={addrProvince}
                      onChange={(e) => setAddrProvince(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase tracking-wider block">Postal Code</label>
                    <input
                      type="text"
                      value={addrPostal}
                      onChange={(e) => setAddrPostal(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase tracking-wider block">Complete Street Address</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="House/Apartment #, street name, area..."
                    value={addrFull}
                    onChange={(e) => setAddrFull(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary resize-none font-light leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-black text-[9px] tracking-widest font-bold py-3 px-6 rounded uppercase transition-all"
                >
                  Save Destination
                </button>
              </form>
            </div>
          )}

          {/* WISHLIST LIST */}
          {activeTab === 'favorites' && (
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest">My Wishlist</h3>
              
              {favorites.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted space-y-3 font-light">
                  <div>No items in your wishlist.</div>
                  <Link href="/shop" className="inline-block bg-primary/10 border border-primary/30 px-6 py-2 rounded text-primary text-[10px] tracking-widest font-bold uppercase transition-all">
                    Explore Shop
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((item) => (
                    <div key={item.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-3 hover:border-primary/20 transition-all relative text-xs">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-3 right-3 text-primary hover:scale-110 transition-transform"
                      >
                        <Heart size={14} className="fill-current" />
                      </button>
                      
                      <div className="h-16 w-12 rounded overflow-hidden flex-shrink-0 bg-surface border border-white/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="font-bold text-white truncate max-w-[150px] uppercase tracking-wider text-[10px]">{item.name}</h4>
                          <span className="text-[10px] text-text-muted mt-0.5 block font-sans font-semibold">Rs. {item.price}</span>
                        </div>
                        <button
                          onClick={() => addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            discount: item.discount || 0,
                            image: item.image,
                            size: 'M',
                            color: 'Black',
                            quantity: 1
                          })}
                          className="flex items-center gap-1 text-primary font-bold text-[9px] tracking-widest hover:text-white uppercase"
                        >
                          <span>Add to Bag</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>

        {/* Sidebar Info */}
        <aside className="lg:col-span-4 glass p-6 rounded-2xl border border-white/5 space-y-6 text-xs font-light">
          <div className="space-y-4">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              <span>User Information</span>
            </h3>
            
            <div className="text-text-muted space-y-2 leading-relaxed">
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              {user.phone && <div><strong>Phone:</strong> {user.phone}</div>}
              {user.whatsapp && <div><strong>WhatsApp:</strong> {user.whatsapp}</div>}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

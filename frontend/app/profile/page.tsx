"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { User, MapPin, Heart, ListOrdered, Lock, Plus, Trash2, ShieldAlert, ShoppingBag, ArrowRight } from 'lucide-react';
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
    deliveryAreas,
    addToCart,
    language
  } = useApp();

  const t = translations[language];

  // Forms state
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'favorites' | 'password'>('orders');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New Address Form
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrAreaId, setAddrAreaId] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrFull, setAddrFull] = useState('');
  const [addrSuccess, setAddrSuccess] = useState('');

  // Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [mounted, setMounted] = useState(false);

  // Sync delivery area default select
  useEffect(() => {
    setMounted(true);
    if (deliveryAreas.length > 0) {
      setAddrAreaId(deliveryAreas[0].id);
    }
  }, [deliveryAreas]);

  // Load Order History
  useEffect(() => {
    if (token) {
      setLoadingOrders(true);
      fetch('http://localhost:5000/api/orders/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
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
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6 relative z-10 font-sans">
        <div className="glass-premium p-8 rounded-3xl border border-primary/20 space-y-4">
          <div className="flex justify-center text-primary-light">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-xl font-bold text-white">Login Required</h1>
          <p className="text-xs text-text-muted">
            Please log in to your account to view your saved addresses and order history.
          </p>
          <Link href="/login" className="inline-block bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-2.5 rounded-lg">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Address Submit
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle || !addrAreaId || !addrFull) return;

    const success = await addAddress(addrTitle, addrAreaId, addrLandmark, addrFull);
    if (success) {
      setAddrSuccess('Address saved successfully!');
      setAddrFull('');
      setAddrLandmark('');
      setTimeout(() => setAddrSuccess(''), 3000);
    }
  };

  // Reorder Item handler
  const handleReorder = (orderItems: any[]) => {
    orderItems.forEach((oi) => {
      addToCart({
        id: oi.menuItem.id,
        name: oi.menuItem.name,
        price: oi.price, // use price of the size they ordered!
        discount: oi.menuItem.discount,
        image: oi.menuItem.image,
        size: oi.size || 'Regular'
      });
    });
    // Redirect to checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans relative z-10 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <span className="text-xs text-gold font-bold uppercase">Customer Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Salamat, {user.name}</h1>
          <p className="text-xs text-text-muted mt-1">{user.email}</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'orders' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            <ListOrdered size={14} />
            <span>Order History</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'addresses' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            <MapPin size={14} />
            <span>Saved Addresses ({addresses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'favorites' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            <Heart size={14} />
            <span>Favorites ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* 2. TAB BLOCKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Tab Panel */}
        <main className="lg:col-span-8 space-y-6">
          
          {/* ORDERS HISTORY */}
          {activeTab === 'orders' && (
            <div className="glass p-6 rounded-3xl border border-white/5 space-y-6 animate-fade-in">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Previous Orders</h3>
              
              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-text-muted">Loading your past orders...</div>
              ) : orderHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted space-y-3.5">
                  <div>No orders placed yet.</div>
                  <Link href="/menu" className="inline-block bg-primary/20 hover:bg-primary border border-primary/30 px-5 py-2 rounded-full text-white text-xs">
                    Order a Feast
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 hover:border-primary/20 transition-all flex flex-col sm:flex-row justify-between sm:items-center">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">#{order.orderNumber}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            order.status === 'DELIVERED' ? 'bg-green-950 text-green-400' : 'bg-gold/10 text-gold'
                          }`}>{order.status}</span>
                        </div>
                        <div className="text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-text-muted font-light mt-1">
                          {order.items.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 justify-between">
                        <span className="text-sm font-bold text-white">Rs. {order.finalAmount}</span>
                        <div className="flex items-center gap-2">
                          <Link href={`/track-order/${order.id}`} className="px-3.5 py-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs text-white rounded-lg">
                            Track
                          </Link>
                          <button
                            onClick={() => handleReorder(order.items)}
                            className="flex items-center gap-1 px-3.5 py-1.5 bg-primary hover:bg-primary-light text-xs font-bold text-white rounded-lg"
                          >
                            <ShoppingBag size={12} />
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
              <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Saved Addresses</h3>

                {addresses.length === 0 ? (
                  <p className="text-xs text-text-muted py-2">No saved addresses found. Add one below.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-all relative">
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="absolute top-4 right-4 text-text-muted hover:text-primary-light transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">{addr.title}</h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed font-light">{addr.fullAddress}</p>
                          {addr.landmark && <span className="text-[10px] text-text-muted block mt-1">Landmark: {addr.landmark}</span>}
                        </div>
                        <span className="text-[10px] text-gold mt-3 block">{addr.area.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Address Form */}
              <form onSubmit={handleAddAddress} className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={16} className="text-gold" />
                  <span>Add New Address</span>
                </h3>

                {addrSuccess && (
                  <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/30 p-2.5 rounded-lg">{addrSuccess}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-text-muted">Title (e.g. Home, Office)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Home"
                      value={addrTitle}
                      onChange={(e) => setAddrTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-text-muted">Delivery Area (Karachi)</label>
                    <select
                      value={addrAreaId}
                      onChange={(e) => setAddrAreaId(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    >
                      {deliveryAreas.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-muted">Nearest Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. near Shipowner College"
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-muted">Full Address</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Apartment/House details..."
                    value={addrFull}
                    onChange={(e) => setAddrFull(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all"
                >
                  Save Address
                </button>
              </form>
            </div>
          )}

          {/* FAVORITE ITEMS LIST */}
          {activeTab === 'favorites' && (
            <div className="glass p-6 rounded-3xl border border-white/5 space-y-6 animate-fade-in">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Favorite Dishes</h3>
              
              {favorites.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted space-y-3">
                  <div>No favorited items yet.</div>
                  <Link href="/menu" className="inline-block bg-primary/20 hover:bg-primary border border-primary/30 px-5 py-2 rounded-full text-white text-xs">
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((item) => (
                    <div key={item.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex gap-3 hover:border-primary/20 transition-all relative">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-2 right-2 text-primary-light hover:scale-110 transition-transform"
                      >
                        <Heart size={15} className="fill-current" />
                      </button>
                      
                      <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex flex-col justify-between py-0.5 text-xs">
                        <div>
                          <h4 className="font-bold text-white truncate max-w-[150px]">{item.name}</h4>
                          <span className="text-[10px] text-text-muted mt-0.5 block">Rs. {item.price}</span>
                        </div>
                        <button
                          onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, discount: item.discount, image: item.image, size: 'Regular' })}
                          className="flex items-center gap-1 text-primary-light font-bold text-[10px] hover:text-white"
                        >
                          <span>Add to Cart</span>
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

        {/* Sidebar Info & details */}
        <aside className="lg:col-span-4 glass p-6 rounded-3xl border border-white/5 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 flex items-center gap-1.5">
              <User size={16} className="text-gold" />
              <span>User Information</span>
            </h3>
            
            <div className="text-xs text-text-muted space-y-2">
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

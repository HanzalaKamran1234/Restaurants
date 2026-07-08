"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, ShoppingBag, ToggleLeft, ToggleRight, Edit, Check, ShieldAlert, Award, DollarSign, ListOrdered, CheckCircle, TrendingUp } from 'lucide-react';

interface AnalyticsMetrics {
  totalRevenue: number;
  todayRevenue: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  averageOrderValue: number;
  totalOrdersCount: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  deliveryCharge: number;
  tax: number;
  finalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  area: string;
  status: string;
  createdAt: string;
}

interface AdminMenuItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  category: {
    name: string;
  };
}

export default function AdminDashboard() {
  const { user, token } = useApp();

  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 54200,
    todayRevenue: 3400,
    todayOrdersCount: 6,
    pendingOrdersCount: 2,
    completedOrdersCount: 24,
    cancelledOrdersCount: 1,
    averageOrderValue: 2250,
    totalOrdersCount: 27
  });

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'menu'>('analytics');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Authorization Check
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6 relative z-10 font-sans">
        <div className="glass-premium p-8 rounded-3xl border border-primary/20 space-y-4">
          <div className="flex justify-center text-primary-light">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="text-xs text-text-muted">
            The administrator panel requires special credentials. Please log in with an authorized admin account.
          </p>
          <a href="/login" className="inline-block bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Load Dashboard Data
  const loadDashboardData = () => {
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch Metrics
    fetch('http://localhost:5000/api/analytics/dashboard', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      })
      .catch(() => console.log("Using static data fallback for admin metrics"));

    // Fetch Orders
    fetch('http://localhost:5000/api/orders/admin', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => console.log("Failed to load admin orders"));

    // Fetch Menu Items
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMenuItems(data);
      })
      .catch(() => console.log("Failed to load admin menu items"));
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setStatusMsg('Order status updated successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle item availability
  const handleToggleAvailable = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:5000/api/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (res.ok) {
        setStatusMsg('Menu item availability toggled!');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update item price
  const handleUpdatePrice = async (itemId: string) => {
    const priceFloat = parseFloat(editingPrice);
    if (isNaN(priceFloat)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: priceFloat })
      });

      if (res.ok) {
        setStatusMsg('Item price updated!');
        setEditingItemId(null);
        setEditingPrice('');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans relative z-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <span className="text-xs text-gold font-bold uppercase">ZIYAFAT CONTROL PANEL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Admin Dashboard</h1>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            Analytics Summary
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'orders' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            Manage Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'menu' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
            }`}
          >
            Menu CMS
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-green-600/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 2. TAB DETAILS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs uppercase font-bold">Total Sales</span>
                <DollarSign size={16} className="text-gold" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">Rs. {metrics.totalRevenue}</div>
              <p className="text-[10px] text-text-muted mt-1">Lifetime completed orders</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs uppercase font-bold">Today's Orders</span>
                <ListOrdered size={16} className="text-primary-light" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">{metrics.todayOrdersCount} Orders</div>
              <p className="text-[10px] text-text-muted mt-1">Today's gross activity</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs uppercase font-bold">Pending Orders</span>
                <ShieldAlert size={16} className="text-primary-light animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">{metrics.pendingOrdersCount} Pending</div>
              <p className="text-[10px] text-text-muted mt-1">Awaiting kitchen prep</p>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs uppercase font-bold">AOV (Average Order)</span>
                <TrendingUp size={16} className="text-gold" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">Rs. {metrics.averageOrderValue}</div>
              <p className="text-[10px] text-text-muted mt-1">Completed order average</p>
            </div>

          </div>

          {/* Graphical Simulated Box */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Trend (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between pt-10 px-4 border-b border-white/10 gap-2">
              {[
                { day: "Thu", rev: 4500 },
                { day: "Fri", rev: 9200 },
                { day: "Sat", rev: 14000 },
                { day: "Sun", rev: 11000 },
                { day: "Mon", rev: 5200 },
                { day: "Tue", rev: 6900 },
                { day: "Wed", rev: 3400 }
              ].map((item, idx) => {
                const max = 15000;
                const pct = (item.rev / max) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <span className="text-[10px] text-primary-light opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      Rs. {item.rev}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-primary-dark to-primary group-hover:to-gold rounded-t-lg transition-all duration-700"
                      style={{ height: `${pct}px`, minHeight: '8px' }}
                    ></div>
                    <span className="text-[10px] text-text-muted uppercase mt-1">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glass p-6 rounded-3xl border border-white/5 overflow-x-auto animate-fade-in">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Active Feast Orders</h3>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">No orders recorded in database yet.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gold border-b border-white/10 font-bold">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Address / Area</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Date Placed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-text-muted">
                    <td className="py-4 px-4 font-bold text-white">#{o.orderNumber}</td>
                    <td className="py-4 px-4 font-light">
                      <div className="truncate max-w-[200px]">{o.deliveryAddress}</div>
                      <div className="text-[10px] text-text-muted font-bold mt-0.5">{o.area}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">Rs. {o.finalAmount}</td>
                    <td className="py-4 px-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        o.status === 'DELIVERED' 
                          ? 'bg-green-950 text-green-400' 
                          : o.status === 'CANCELLED' 
                            ? 'bg-red-950 text-red-400' 
                            : 'bg-gold/10 text-gold'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="bg-surface border border-white/10 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="glass p-6 rounded-3xl border border-white/5 animate-fade-in space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Menu Item CMS Settings</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gold border-b border-white/10 font-bold">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Price Edit</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-text-muted">
                    <td className="py-4 px-4 font-bold text-white">{item.name}</td>
                    <td className="py-4 px-4 uppercase text-[10px] tracking-wider">{item.category.name}</td>
                    <td className="py-4 px-4 font-bold text-white">Rs. {item.price}</td>
                    
                    {/* Toggle Availability */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleAvailable(item.id, item.available)}
                        className="flex items-center text-text-muted hover:text-white transition-colors"
                      >
                        {item.available ? (
                          <div className="flex items-center gap-1 text-green-400 font-bold">
                            <ToggleRight size={22} className="stroke-2" />
                            <span>Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <ToggleLeft size={22} className="stroke-2" />
                            <span>Sold Out</span>
                          </div>
                        )}
                      </button>
                    </td>

                    {/* Price edit CMS inline */}
                    <td className="py-4 px-4">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            className="w-16 bg-[#1a1a1a] border border-white/20 rounded px-1.5 py-0.5 text-white"
                          />
                          <button
                            onClick={() => handleUpdatePrice(item.id)}
                            className="p-1 bg-green-700 text-white rounded hover:bg-green-600"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="text-xs text-text-muted hover:text-white pl-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingPrice(String(item.price));
                          }}
                          className="flex items-center gap-1 text-primary-light hover:text-white transition-colors"
                        >
                          <Edit size={12} />
                          <span>Change Price</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

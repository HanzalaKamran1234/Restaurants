"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert, DollarSign, ListOrdered, CheckCircle, TrendingUp, Users,
  Truck, Settings, MessageSquare, Clock, MapPin, ToggleLeft, ToggleRight, Edit, Check, X, Plus, Trash2
} from 'lucide-react';

interface AnalyticsMetrics {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  averageOrderValue: number;
  totalOrdersCount: number;
  customerCount: number;
  returningCustomers: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  finalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  nearestLandmark?: string;
  area?: {
    id: string;
    name: string;
  };
  instructions?: string;
  status: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  whatsappNumber?: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    size: string;
    menuItem: {
      name: string;
    }
  }>;
}

interface AdminMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  prepTime: number;
  available: boolean;
  categoryId: string;
  sizes: string;
  image: string;
  category: {
    id: string;
    name: string;
  };
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

export default function AdminDashboard() {
  const { user, token, deliveryAreas, loadDeliveryAreas } = useApp();
  const [mounted, setMounted] = useState(false);

  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 54200,
    todayRevenue: 3400,
    monthRevenue: 42000,
    todayOrdersCount: 6,
    pendingOrdersCount: 2,
    preparingOrdersCount: 1,
    completedOrdersCount: 24,
    cancelledOrdersCount: 1,
    averageOrderValue: 2250,
    totalOrdersCount: 27,
    customerCount: 12,
    returningCustomers: 4
  });

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'menu' | 'delivery'>('analytics');
  
  // CRUD Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<AdminMenuItem | null>(null); // Null for Add, MenuItem object for Edit

  // Form Fields State
  const [itemName, setItemName] = useState('');
  const [itemCatId, setItemCatId] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImg, setItemImg] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemPrep, setItemPrep] = useState('15');
  const [itemAvail, setItemAvail] = useState(true);
  const [itemSizes, setItemSizes] = useState<Array<{ size: string; price: number }>>([]);

  // Delivery Area editing state
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [areaCharge, setAreaCharge] = useState('');
  const [areaTime, setAreaTime] = useState('');
  const [areaMin, setAreaMin] = useState('');

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Authorization Guard
  if (!mounted) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center text-xs text-text-muted font-sans">
        Verifying Ziyafat administrator status...
      </div>
    );
  }

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

    // Fetch Categories list
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategoriesList(data);
      })
      .catch(() => console.log("Failed to load categories"));
      
    loadDeliveryAreas();
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Update order status action triggers
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });

      if (res.ok) {
        setStatusMsg(`Order status marked as ${newStatus}!`);
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle item availability quick
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

  // CRUD Form triggers
  const handleOpenAddModal = () => {
    setCurrentItem(null);
    setItemName('');
    setItemCatId(categoriesList[0]?.id || '');
    setItemDesc('');
    setItemImg('');
    setItemPrice('');
    setItemPrep('15');
    setItemAvail(true);
    setItemSizes([{ size: 'Regular', price: 0 }]);
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item: AdminMenuItem) => {
    setCurrentItem(item);
    setItemName(item.name);
    setItemCatId(item.categoryId);
    setItemDesc(item.description);
    setItemImg(item.image);
    setItemPrice(String(item.price));
    setItemPrep(String(item.prepTime));
    setItemAvail(item.available);
    
    let sizesList = [];
    if (item.sizes) {
      try {
        sizesList = JSON.parse(item.sizes);
      } catch (e) {}
    }
    if (sizesList.length === 0) {
      sizesList = [{ size: 'Regular', price: item.price }];
    }
    setItemSizes(sizesList);
    setShowItemModal(true);
  };

  const handleAddSizeInput = () => {
    setItemSizes([...itemSizes, { size: '', price: 0 }]);
  };

  const handleRemoveSizeInput = (idx: number) => {
    setItemSizes(itemSizes.filter((_, i) => i !== idx));
  };

  const handleSizeChange = (idx: number, field: 'size' | 'price', value: any) => {
    const updated = [...itemSizes];
    if (field === 'size') {
      updated[idx].size = value;
    } else {
      updated[idx].price = parseFloat(value) || 0;
    }
    setItemSizes(updated);
  };

  // Save Item (Add/Edit)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemCatId || !itemImg || !itemPrice) return;

    // The base price is the price of the first size option or custom base
    const finalBasePrice = itemSizes.length > 0 ? itemSizes[0].price : parseFloat(itemPrice);

    const payload = {
      name: itemName,
      categoryId: itemCatId,
      description: itemDesc,
      image: itemImg,
      price: finalBasePrice,
      prepTime: parseInt(itemPrep) || 15,
      available: itemAvail,
      sizes: itemSizes.filter(s => s.size.trim()) // filter empty sizes
    };

    const method = currentItem ? 'PUT' : 'POST';
    const url = currentItem 
      ? `http://localhost:5000/api/menu/${currentItem.id}`
      : 'http://localhost:5000/api/menu';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatusMsg(currentItem ? 'Item updated successfully!' : 'Item added successfully!');
        setShowItemModal(false);
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error saving item');
      }
    } catch (err) {
      alert('Network error. Failed to save item.');
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this delicacy?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setStatusMsg('Menu item deleted successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.log('Error deleting item');
    }
  };

  // Update Delivery Area settings
  const handleUpdateDeliveryArea = async (areaId: string) => {
    const chargeVal = parseFloat(areaCharge);
    const minVal = parseFloat(areaMin);
    
    if (isNaN(chargeVal) || isNaN(minVal) || !areaTime) return;

    try {
      const res = await fetch(`http://localhost:5000/api/extra/delivery-areas/${areaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryCharge: chargeVal,
          estimatedTime: areaTime,
          minOrderAmount: minVal
        })
      });

      if (res.ok) {
        setStatusMsg('Delivery area configurations updated!');
        setEditingAreaId(null);
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAreaAvailable = async (areaId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:5000/api/extra/delivery-areas/${areaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (res.ok) {
        setStatusMsg('Delivery area status toggled!');
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
        <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
          {['analytics', 'orders', 'menu', 'delivery'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-bold transition-all uppercase ${
                activeTab === tab ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="bg-green-600/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-5 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total Sales</span>
                <DollarSign size={16} className="text-gold" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">Rs. {metrics.totalRevenue}</div>
              <p className="text-[9px] text-text-muted mt-1">Gross completed orders</p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Sales This Month</span>
                <TrendingUp size={16} className="text-gold" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">Rs. {metrics.monthRevenue}</div>
              <p className="text-[9px] text-text-muted mt-1">Monthly gross totals</p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Active Customers</span>
                <Users size={16} className="text-gold" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">{metrics.customerCount} Customers</div>
              <p className="text-[9px] text-text-muted mt-1">{metrics.returningCustomers} Returning members</p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Active Orders</span>
                <ListOrdered size={16} className="text-primary-light" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {metrics.pendingOrdersCount} Pnd / {metrics.preparingOrdersCount} Prp
              </div>
              <p className="text-[9px] text-text-muted mt-1">Pending and cooking</p>
            </div>
          </div>

          {/* Simple Chart Bar simulation */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Revenue Stream</h3>
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

      {/* ORDERS PANEL (With Actions) */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Incoming & Active Orders</h3>

          {orders.length === 0 ? (
            <div className="glass p-12 text-center text-xs text-text-muted rounded-3xl border border-white/5">
              No orders recorded in database yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => (
                <div key={o.id} className="glass p-6 rounded-2xl border border-white/5 space-y-4 hover:border-primary/20 transition-all text-xs flex flex-col justify-between">
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div>
                        <span className="font-bold text-white text-sm">#{o.orderNumber}</span>
                        <span className="text-[10px] text-text-muted block mt-0.5">{new Date(o.createdAt).toLocaleString()}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        o.status === 'DELIVERED' 
                          ? 'bg-green-950 text-green-400' 
                          : o.status === 'CANCELLED' 
                            ? 'bg-red-950 text-red-400' 
                            : 'bg-gold/10 text-gold'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    {/* Customer Info details */}
                    <div className="space-y-1 text-text-muted">
                      <div><strong>Customer Name:</strong> {o.customerName || 'Ziyafat Guest'}</div>
                      <div><strong>Phone Number:</strong> {o.customerPhone || 'N/A'}</div>
                      {o.whatsappNumber && <div><strong>WhatsApp Number:</strong> {o.whatsappNumber}</div>}
                      <div><strong>Delivery Area:</strong> {o.area ? o.area.name : 'N/A'}</div>
                      <div><strong>Address:</strong> {o.deliveryAddress}</div>
                      {o.nearestLandmark && <div><strong>Landmark:</strong> {o.nearestLandmark}</div>}
                      {o.instructions && <div className="italic text-primary-light">"Notes: {o.instructions}"</div>}
                    </div>

                    {/* Ordered items */}
                    <div className="border-t border-white/5 pt-3.5 space-y-2">
                      <h5 className="font-bold text-white uppercase text-[10px]">Ordered Items</h5>
                      <div className="space-y-1.5 text-text-muted">
                        {o.items.map((it) => (
                          <div key={it.id} className="flex justify-between">
                            <span>{it.quantity}x {it.menuItem.name} <span className="text-gold font-normal">({it.size})</span></span>
                            <span>Rs. {Math.round(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2 text-xs">
                        <span>Grand Total:</span>
                        <span className="text-primary-light">Rs. {o.finalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 mt-2">
                    {o.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'ACCEPTED')}
                          className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded text-[10px] transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'CANCELLED')}
                          className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 rounded text-[10px] transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {o.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'PREPARING')}
                        className="col-span-3 bg-primary hover:bg-primary-light text-white font-bold py-2 rounded text-[10px] transition-colors"
                      >
                        Mark Preparing
                      </button>
                    )}
                    {o.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'READY')}
                        className="col-span-3 bg-gold hover:bg-gold-light text-background font-bold py-2 rounded text-[10px] transition-colors"
                      >
                        Mark Ready (Package)
                      </button>
                    )}
                    {o.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'OUT_FOR_DELIVERY')}
                        className="col-span-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-[10px] transition-colors"
                      >
                        Dispatch Rider
                      </button>
                    )}
                    {o.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'DELIVERED')}
                        className="col-span-3 bg-green-700 hover:bg-green-600 text-white font-bold py-2 rounded text-[10px] transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'CANCELLED')}
                        className="col-span-3 border border-red-700/40 hover:border-red-600 hover:bg-red-950/20 text-primary-light py-1.5 rounded text-[10px] mt-1 transition-all"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MENU CMS TAB */}
      {activeTab === 'menu' && (
        <div className="glass p-6 rounded-3xl border border-white/5 animate-fade-in space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dishes CMS Management</h3>
            
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
            >
              <Plus size={14} />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gold border-b border-white/10 font-bold">
                  <th className="py-3 px-4">Dish Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Starting Price</th>
                  <th className="py-3 px-4">Sizes & Portions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">CMS Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => {
                  let sizesLabel = 'N/A';
                  try {
                    const parsed = JSON.parse(item.sizes);
                    if (parsed.length > 0) {
                      sizesLabel = parsed.map((s: any) => `${s.size} (Rs.${s.price})`).join(', ');
                    }
                  } catch(e) {}
                  
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-text-muted">
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded-lg border border-white/10" />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-4 px-4 uppercase text-[10px] tracking-wider">{item.category?.name || 'N/A'}</td>
                      <td className="py-4 px-4 font-bold text-white">Rs. {item.price}</td>
                      <td className="py-4 px-4 truncate max-w-[200px]" title={sizesLabel}>{sizesLabel}</td>
                      
                      {/* Toggle Availability status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleAvailable(item.id, item.available)}
                          className="flex items-center text-text-muted"
                        >
                          {item.available ? (
                            <span className="text-green-400 font-bold">In Stock</span>
                          ) : (
                            <span className="text-red-500">Sold Out</span>
                          )}
                        </button>
                      </td>

                      {/* Edit or Delete CMS */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="flex items-center gap-1 text-primary-light hover:text-white transition-colors"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex items-center gap-1 text-red-500/80 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELIVERY AREA CONFIG TAB */}
      {activeTab === 'delivery' && (
        <div className="glass p-6 rounded-3xl border border-white/5 animate-fade-in space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Delivery Zones Manager</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gold border-b border-white/10 font-bold">
                  <th className="py-3 px-4">Area Name</th>
                  <th className="py-3 px-4">Delivery Charge</th>
                  <th className="py-3 px-4">Delivery Time</th>
                  <th className="py-3 px-4">Min Order Amount</th>
                  <th className="py-3 px-4">Area Availability</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryAreas.map((area) => (
                  <tr key={area.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-text-muted">
                    <td className="py-4 px-4 font-bold text-white">{area.name}</td>
                    
                    {/* Delivery Fare Charge */}
                    <td className="py-4 px-4">
                      {editingAreaId === area.id ? (
                        <input
                          type="text"
                          value={areaCharge}
                          onChange={(e) => setAreaCharge(e.target.value)}
                          className="w-16 bg-[#1a1a1a] border border-white/20 rounded px-1.5 py-0.5 text-white"
                        />
                      ) : (
                        <span>Rs. {area.deliveryCharge}</span>
                      )}
                    </td>

                    {/* Delivery Duration Time */}
                    <td className="py-4 px-4">
                      {editingAreaId === area.id ? (
                        <input
                          type="text"
                          value={areaTime}
                          onChange={(e) => setAreaTime(e.target.value)}
                          className="w-20 bg-[#1a1a1a] border border-white/20 rounded px-1.5 py-0.5 text-white"
                        />
                      ) : (
                        <span>{area.estimatedTime}</span>
                      )}
                    </td>

                    {/* Minimum Order Spend */}
                    <td className="py-4 px-4">
                      {editingAreaId === area.id ? (
                        <input
                          type="text"
                          value={areaMin}
                          onChange={(e) => setAreaMin(e.target.value)}
                          className="w-16 bg-[#1a1a1a] border border-white/20 rounded px-1.5 py-0.5 text-white"
                        />
                      ) : (
                        <span>Rs. {area.minOrderAmount}</span>
                      )}
                    </td>

                    {/* Availability Toggle Open/Closed */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleAreaAvailable(area.id, area.available)}
                        className="flex items-center text-text-muted"
                      >
                        {area.available ? (
                          <div className="flex items-center gap-1 text-green-400 font-bold">
                            <ToggleRight size={22} />
                            <span>Open</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <ToggleLeft size={22} />
                            <span>Closed</span>
                          </div>
                        )}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-4">
                      {editingAreaId === area.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateDeliveryArea(area.id)}
                            className="p-1 bg-green-700 text-white rounded hover:bg-green-600"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingAreaId(null)}
                            className="text-text-muted hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingAreaId(area.id);
                            setAreaCharge(String(area.deliveryCharge));
                            setAreaTime(area.estimatedTime);
                            setAreaMin(String(area.minOrderAmount));
                          }}
                          className="flex items-center gap-1 text-primary-light hover:text-white transition-colors"
                        >
                          <Settings size={12} />
                          <span>Configure</span>
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

      {/* 4. CRUD MENU ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0f0f0f] border border-primary/20 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto font-sans text-xs">
            <button
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white p-1"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3 mb-5 uppercase tracking-wide">
              {currentItem ? 'Edit Ziyafat Delicacy' : 'Add New Ziyafat Delicacy'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-text-muted font-semibold">Portion / Dish Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. White Chicken Karahi"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-text-muted font-semibold">Category</label>
                  <select
                    value={itemCatId}
                    onChange={(e) => setItemCatId(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-semibold">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe this gourmet dish..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-semibold">Image URL (Unsplash or direct WebP link)</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={itemImg}
                  onChange={(e) => setItemImg(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-text-muted font-semibold">Base Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-text-muted font-semibold">Prep Time (mins)</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={itemPrep}
                    onChange={(e) => setItemPrep(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-white font-bold mb-1">
                    <input
                      type="checkbox"
                      checked={itemAvail}
                      onChange={(e) => setItemAvail(e.target.checked)}
                      className="accent-primary h-4 w-4 rounded"
                    />
                    <span>Available In Stock</span>
                  </label>
                </div>
              </div>

              {/* Sizes / pricing matrix */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white uppercase">Sizes & Portion Pricing Matrix</label>
                  <button
                    type="button"
                    onClick={handleAddSizeInput}
                    className="flex items-center gap-1 text-primary-light hover:text-white"
                  >
                    <Plus size={12} />
                    <span>Add Portion Size</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {itemSizes.map((sz, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="e.g. Half KG, 6 Pieces, Regular"
                        value={sz.size}
                        onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none"
                      />
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-2 w-32">
                        <span className="text-text-muted mr-1.5">Rs.</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={sz.price === 0 ? '' : sz.price}
                          onChange={(e) => handleSizeChange(idx, 'price', e.target.value)}
                          className="w-full bg-transparent border-0 py-2 text-white focus:outline-none"
                        />
                      </div>
                      
                      {itemSizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeInput(idx)}
                          className="text-text-muted hover:text-primary-light"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-all"
                >
                  Save Delicacy
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert, DollarSign, ListOrdered, CheckCircle, TrendingUp, Users,
  Truck, Settings, MessageSquare, MapPin, Edit, Check, X, Plus, Trash2, ShoppingBag, Layers, CreditCard
} from 'lucide-react';

interface AnalyticsMetrics {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number; // maps to PROCESSING + SHIPPED
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
  subtotal: number;
  shippingCharge: number;
  tax: number;
  finalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  notes?: string;
  status: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
    product: {
      name: string;
    }
  }>;
}

interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  fabric: string;
  fit: string;
  brand: string;
  available: boolean;
  categoryId: string;
  collectionId?: string;
  images: Array<{ url: string }>;
  variants: Array<{ id: string; color: string; size: string; inventory: number; sku: string }>;
  category: {
    id: string;
    name: string;
  };
  collection?: {
    id: string;
    name: string;
  };
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function AdminDashboard() {
  const { user, token } = useApp();
  const [mounted, setMounted] = useState(false);

  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    todayOrdersCount: 0,
    pendingOrdersCount: 0,
    preparingOrdersCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0,
    averageOrderValue: 0,
    totalOrdersCount: 0,
    customerCount: 0,
    returningCustomers: 0
  });

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>([]);
  const [collectionsList, setCollectionsList] = useState<AdminCollection[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'collections'>('analytics');
  
  // CRUD Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<AdminProduct | null>(null);

  // Form Fields State
  const [prodName, setProdName] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodCollId, setProdCollId] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodFabric, setProdFabric] = useState('');
  const [prodFit, setProdFit] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodImg, setProdImg] = useState(''); // Primary image
  const [prodGallery, setProdGallery] = useState<string>(''); // comma separated image URLs
  const [prodBrand, setProdBrand] = useState('THE VESTRA');
  const [prodAvailable, setProdAvailable] = useState(true);
  const [prodVariants, setProdVariants] = useState<Array<{ color: string; size: string; inventory: number }>>([
    { color: 'Black', size: 'M', inventory: 50 }
  ]);

  // Collection Creator fields
  const [collName, setCollName] = useState('');
  const [collSlug, setCollSlug] = useState('');
  const [collDesc, setCollDesc] = useState('');

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadDashboardData = () => {
    // Fetch Metrics
    fetch('/api/analytics/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      })
      .catch(() => console.log("Using static data fallback for admin metrics"));

    // Fetch Orders
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => console.log("Failed to load admin orders"));

    // Fetch Products (we call /api/menu which retrieves products list)
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => console.log("Failed to load admin products"));

    // Fetch Categories list
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategoriesList(data);
      })
      .catch(() => console.log("Failed to load categories"));
      
    // Fetch Collections list
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCollectionsList(data);
      })
      .catch(() => console.log("Failed to load collections"));
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Update order status action triggers
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
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

  // Toggle availability quick
  const handleToggleAvailable = async (prodId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/menu/${prodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (res.ok) {
        setStatusMsg('Product availability toggled!');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Form triggers
  const handleOpenAddModal = () => {
    setCurrentProduct(null);
    setProdName('');
    setProdCatId(categoriesList[0]?.id || '');
    setProdCollId('');
    setProdDesc('');
    setProdFabric('100% Combed Cotton');
    setProdFit('Relaxed Fit');
    setProdBrand('THE VESTRA');
    setProdImg('');
    setProdGallery('');
    setProdPrice('');
    setProdDiscount('0');
    setProdAvailable(true);
    setProdVariants([{ color: 'Black', size: 'M', inventory: 50 }]);
    setShowItemModal(true);
  };

  const handleOpenEditModal = (prod: AdminProduct) => {
    setCurrentProduct(prod);
    setProdName(prod.name);
    setProdCatId(prod.categoryId);
    setProdCollId(prod.collectionId || '');
    setProdDesc(prod.description);
    setProdFabric(prod.fabric);
    setProdFit(prod.fit);
    setProdBrand(prod.brand || 'THE VESTRA');
    setProdImg(prod.images?.[0]?.url || '');
    setProdGallery(prod.images?.slice(1).map(img => img.url).join(', ') || '');
    setProdPrice(prod.price.toString());
    setProdDiscount(prod.discount.toString());
    setProdAvailable(prod.available);
    setProdVariants(prod.variants.map(v => ({ color: v.color, size: v.size, inventory: v.inventory })));
    setShowItemModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This is permanent.')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg('Product deleted successfully.');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Variant row controls
  const handleAddVariantRow = () => {
    setProdVariants([...prodVariants, { color: 'Black', size: 'M', inventory: 50 }]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setProdVariants(prodVariants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...prodVariants];
    updated[index] = { ...updated[index], [field]: value };
    setProdVariants(updated);
  };

  // Submit Product Form
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodCatId || !prodImg) {
      alert('Please enter Name, Price, Category, and Primary Image URL');
      return;
    }

    const galleryUrls = prodGallery.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      discount: parseFloat(prodDiscount || '0'),
      fabric: prodFabric,
      fit: prodFit,
      brand: prodBrand,
      categoryId: prodCatId,
      collectionId: prodCollId || undefined,
      image: prodImg,
      gallery: galleryUrls,
      variants: prodVariants,
      available: prodAvailable
    };

    const url = currentProduct ? `/api/menu/${currentProduct.id}` : `/api/menu`;
    const method = currentProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatusMsg(currentProduct ? 'Product updated successfully!' : 'New product created successfully!');
        setShowItemModal(false);
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Operation failed'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Server connection error.');
    }
  };

  // Collections form
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collName || !collSlug) return;
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: collName, slug: collSlug, description: collDesc })
      });
      if (res.ok) {
        setStatusMsg('New collection added!');
        setCollName('');
        setCollSlug('');
        setCollDesc('');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMsg('Collection removed.');
        setTimeout(() => setStatusMsg(''), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Authorization check guard
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center text-xs text-text-muted font-sans relative z-10">
        Verifying administrator role...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 font-sans relative z-10 space-y-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <span className="text-[10px] text-primary tracking-[0.25em] font-bold uppercase block">THE VESTRA CMS</span>
          <h1 className="text-xl sm:text-2xl font-serif tracking-widest text-white uppercase mt-1">Operations Control Panel</h1>
          <p className="text-xs text-text-muted mt-1 font-light">Manage fashion collections, stock variant levels, and client orders.</p>
        </div>

        {/* Status Msg Toast Banner */}
        {statusMsg && (
          <div className="bg-primary/20 border border-primary/50 text-white font-bold uppercase tracking-widest text-[9px] px-4 py-2 rounded animate-pulse">
            {statusMsg}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 bg-white/5 border border-white/10 p-1 rounded uppercase tracking-wider font-bold text-[10px]">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all ${
              activeTab === 'analytics' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
            }`}
          >
            <TrendingUp size={11} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all ${
              activeTab === 'orders' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
            }`}
          >
            <ListOrdered size={11} />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all ${
              activeTab === 'products' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
            }`}
          >
            <ShoppingBag size={11} />
            <span>Products ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all ${
              activeTab === 'collections' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
            }`}
          >
            <Layers size={11} />
            <span>Collections ({collectionsList.length})</span>
          </button>
        </div>
      </div>

      {/* 1. ANALYTICS METRICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in text-xs font-light">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass p-5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="uppercase tracking-wider text-[9px] font-bold">Total Sales</span>
                <DollarSign size={14} className="text-primary" />
              </div>
              <div className="text-lg font-bold text-white font-sans">Rs. {metrics.totalRevenue.toLocaleString()}</div>
            </div>

            <div className="glass p-5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="uppercase tracking-wider text-[9px] font-bold">Month's Sales</span>
                <DollarSign size={14} className="text-primary animate-pulse" />
              </div>
              <div className="text-lg font-bold text-white font-sans">Rs. {metrics.monthRevenue.toLocaleString()}</div>
            </div>

            <div className="glass p-5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="uppercase tracking-wider text-[9px] font-bold">Average Spend (AOV)</span>
                <CheckCircle size={14} className="text-primary" />
              </div>
              <div className="text-lg font-bold text-white font-sans">Rs. {Math.round(metrics.averageOrderValue).toLocaleString()}</div>
            </div>

            <div className="glass p-5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-text-muted">
                <span className="uppercase tracking-wider text-[9px] font-bold">Registered Clients</span>
                <Users size={14} className="text-primary" />
              </div>
              <div className="text-lg font-bold text-white font-sans">{metrics.customerCount} <span className="text-[10px] text-text-muted font-normal">({metrics.returningCustomers} returning)</span></div>
            </div>
          </div>

          {/* Queues breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest">Order Processing Status</h3>
              <div className="space-y-3 font-semibold text-[10px] uppercase tracking-wider">
                <div className="flex justify-between items-center p-2.5 bg-white/5 rounded border border-white/5">
                  <span className="text-text-muted">Unprocessed Purchases (PENDING)</span>
                  <span className="bg-primary/20 text-white px-2 py-0.5 rounded font-sans font-bold">{metrics.pendingOrdersCount}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white/5 rounded border border-white/5">
                  <span className="text-text-muted">In Inspection & Packaging (PROCESSING/SHIPPED)</span>
                  <span className="bg-primary/20 text-white px-2 py-0.5 rounded font-sans font-bold">{metrics.preparingOrdersCount}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white/5 rounded border border-white/5">
                  <span className="text-text-muted">Successful Shipments (DELIVERED)</span>
                  <span className="bg-green-950/20 text-green-400 px-2 py-0.5 rounded font-sans font-bold">{metrics.completedOrdersCount}</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest mb-3">Concierge Logistics Status</h3>
                <p className="text-text-muted leading-relaxed font-light text-xs">
                  THE VESTRA logistics pipeline manages flat-rate shipments nationwide. Free shipping thresholds (orders at or above Rs. 5,000) are automatically compiled in sales reporting. Decremented variant stock values are processed in real-time.
                </p>
              </div>
              <div className="flex gap-4 border-t border-white/5 pt-4 text-[10px] text-text-muted uppercase font-bold tracking-wider">
                <div>Total orders today: <span className="text-white font-sans">{metrics.todayOrdersCount}</span></div>
                <div>Awaiting confirmation: <span className="text-white font-sans">{metrics.pendingOrdersCount}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in text-xs font-light">
          <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3">Client Transaction Queue</h3>
          
          {orders.length === 0 ? (
            <p className="py-8 text-center text-text-muted text-xs">No transactions registered in system database.</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4 hover:border-primary/20 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white tracking-widest text-sm">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                          order.status === 'DELIVERED' ? 'bg-green-950 text-green-400' : 'bg-primary/20 text-white'
                        }`}>{order.status}</span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-1 font-sans">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 uppercase font-bold text-[9px] tracking-wider items-center">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                          className="bg-white hover:bg-neutral-200 text-black px-3 py-1.5 rounded"
                        >
                          Send to Processing
                        </button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                          className="bg-white hover:bg-neutral-200 text-black px-3 py-1.5 rounded"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {(order.status === 'PROCESSING' || order.status === 'SHIPPED') && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          className="bg-primary hover:bg-primary-light text-black px-3 py-1.5 rounded"
                        >
                          Complete Delivery
                        </button>
                      )}
                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                          className="border border-white/10 hover:border-white/20 text-text-muted hover:text-white px-3 py-1.5 rounded"
                        >
                          Cancel Purchase
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-light">
                    {/* Buyer Information */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Customer Details</h4>
                      <div>Name: <span className="text-white font-medium">{order.customerName}</span></div>
                      <div>Phone: <span className="text-white font-medium font-sans">{order.customerPhone}</span></div>
                      <div>Method: <span className="text-white font-medium uppercase">{order.paymentMethod}</span></div>
                    </div>

                    {/* Address details */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Shipping Address</h4>
                      <div className="text-white font-medium leading-relaxed">{order.shippingAddress}</div>
                      {order.notes && <div className="text-[10px] text-primary italic mt-1 font-medium">Instructions: "{order.notes}"</div>}
                    </div>

                    {/* Purchased items list */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Garments Ordered</h4>
                      <div className="space-y-1">
                        {order.items.map((i) => (
                          <div key={i.id} className="flex justify-between text-white text-[11px]">
                            <span>{i.quantity}x {i.product.name} ({i.color} / {i.size})</span>
                            <span className="font-sans font-semibold">Rs. {Math.round(i.price * i.quantity)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-white/5 pt-1.5 text-xs font-bold text-primary">
                          <span>TOTAL VALUE</span>
                          <span className="font-sans">Rs. {order.finalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PRODUCTS LIST CMS */}
      {activeTab === 'products' && (
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in text-xs font-light">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest">Garment Catalog</h3>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-black font-bold uppercase tracking-widest text-[9px] px-4 py-2 rounded"
            >
              <Plus size={12} />
              <span>Add Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-light">
              <thead>
                <tr className="border-b border-white/5 text-[9px] text-text-muted uppercase tracking-wider font-bold">
                  <th className="py-3 px-2">Garment</th>
                  <th className="py-3 px-2">Brand</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Collection</th>
                  <th className="py-3 px-2">Base Price</th>
                  <th className="py-3 px-2">Discount</th>
                  <th className="py-3 px-2">Stock Variants</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const totalStock = item.variants.reduce((sum, v) => sum + v.inventory, 0);
                  return (
                    <tr key={item.id} className="border-b border-white/5 text-[11px] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-2 flex items-center gap-3">
                        <div className="h-10 w-8 rounded overflow-hidden flex-shrink-0 bg-surface border border-white/5">
                          <img src={item.images?.[0]?.url || ''} alt={item.name} className="h-full w-full object-cover grayscale" />
                        </div>
                        <div>
                          <div className="font-bold text-white uppercase tracking-wide">{item.name}</div>
                          <div className="text-[10px] text-text-muted italic mt-0.5">{item.fabric}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-white font-medium uppercase">{item.brand}</td>
                      <td className="py-3.5 px-2 text-white font-medium">{item.category?.name}</td>
                      <td className="py-3.5 px-2 text-text-muted font-medium">{item.collection?.name || 'None'}</td>
                      <td className="py-3.5 px-2 text-white font-medium font-sans">Rs. {item.price}</td>
                      <td className="py-3.5 px-2 text-primary font-bold font-sans">{item.discount > 0 ? `${item.discount}% Off` : '-'}</td>
                      <td className="py-3.5 px-2 font-medium">
                        <span className="text-white font-sans">{totalStock} units</span>
                        <span className="text-[9px] text-text-muted block lowercase tracking-normal">
                          ({item.variants.length} SKU codes)
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <button
                          onClick={() => handleToggleAvailable(item.id, item.available)}
                          className={`inline-block font-sans px-2 py-0.5 rounded text-[8px] font-bold ${
                            item.available ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {item.available ? 'ACTIVE' : 'DRAFT'}
                        </button>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-text-muted hover:text-white transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-1.5 text-text-muted hover:text-primary transition-colors"
                          >
                            <Trash2 size={13} />
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

      {/* 4. COLLECTIONS LIST CMS */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-xs font-light">
          {/* Left panel: List collections */}
          <div className="lg:col-span-8 glass p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/5 pb-3">Active Collections</h3>
            
            {collectionsList.length === 0 ? (
              <p className="py-8 text-center text-text-muted text-xs">No active collections found in DB.</p>
            ) : (
              <div className="space-y-3">
                {collectionsList.map((c) => (
                  <div key={c.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white uppercase tracking-wider">{c.name}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">Slug: {c.slug}</div>
                      {c.description && <p className="text-[11px] text-text-muted font-light mt-1 max-w-md">{c.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteCollection(c.id)}
                      className="p-2 text-text-muted hover:text-primary transition-colors border border-white/5 rounded hover:bg-white/5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: Add collection form */}
          <form onSubmit={handleCreateCollection} className="lg:col-span-4 glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              <span>Create Collection</span>
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] text-text-muted uppercase block tracking-wider">Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Loungewear Collection"
                value={collName}
                onChange={(e) => setCollName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-muted uppercase block tracking-wider">Slug</label>
              <input
                type="text"
                required
                placeholder="e.g. loungewear"
                value={collSlug}
                onChange={(e) => setCollSlug(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-text-muted uppercase block tracking-wider">Description</label>
              <textarea
                rows={3}
                placeholder="Editorial text details..."
                value={collDesc}
                onChange={(e) => setCollDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary resize-none font-light leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-black text-[9px] tracking-widest font-bold py-3 px-4 rounded uppercase transition-all"
            >
              Add Collection
            </button>
          </form>
        </div>
      )}

      {/* 5. ADD / EDIT PRODUCT MODAL OVERLAY */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowItemModal(false)} />
          
          <div className="flex items-center justify-center min-h-screen py-10 px-4">
            <form onSubmit={handleSubmitProduct} className="relative w-full max-w-2xl bg-[#111] border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6 text-xs font-light text-text-muted">
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-sm font-serif font-bold text-white uppercase tracking-widest">
                  {currentProduct ? `Edit: ${currentProduct.name}` : 'Add New Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="text-text-muted hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Garment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. THE VESTRA Heavyweight Oversized Tee"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase block tracking-wider">Base Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      placeholder="3500"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-muted uppercase block tracking-wider">Markdown (% Off)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={prodDiscount}
                      onChange={(e) => setProdDiscount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Category</label>
                  <select
                    value={prodCatId}
                    onChange={(e) => setProdCatId(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-medium"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Collection (Optional)</label>
                  <select
                    value={prodCollId}
                    onChange={(e) => setProdCollId(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-medium"
                  >
                    <option value="">No Collection</option>
                    {collectionsList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Springfield"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Fabric Material details</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Combed Cotton, 260GSM"
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Fit Profile details</label>
                  <input
                    type="text"
                    placeholder="e.g. Oversized drop-shoulder silhouette"
                    value={prodFit}
                    onChange={(e) => setProdFit(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase block tracking-wider">Description</label>
                <textarea
                  rows={2}
                  placeholder="Garment descriptions, silhouette details..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary resize-none font-light leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Primary Image URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={prodImg}
                    onChange={(e) => setProdImg(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-text-muted uppercase block tracking-wider">Gallery Images (Comma separated URLs)</label>
                  <input
                    type="text"
                    placeholder="https://image1.jpg, https://image2.jpg"
                    value={prodGallery}
                    onChange={(e) => setProdGallery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs text-white focus:outline-none focus:border-primary font-light"
                  />
                </div>
              </div>

              {/* Variant Stock Builders */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <h4 className="text-[10px] text-white font-serif uppercase tracking-widest font-bold">Garment Stock Variants</h4>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="flex items-center gap-1 text-primary hover:text-white uppercase font-bold text-[9px] tracking-wider"
                  >
                    <Plus size={11} />
                    <span>Add Size/Color Variant</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {prodVariants.map((variant, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Color (e.g. Slate Grey)"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-primary font-light"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Size (e.g. M, L)"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        className="w-20 bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-primary text-center font-bold"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Stock"
                        value={variant.inventory}
                        onChange={(e) => handleVariantChange(index, 'inventory', parseInt(e.target.value) || 0)}
                        className="w-24 bg-white/5 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-primary text-center font-bold font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(index)}
                        disabled={prodVariants.length <= 1}
                        className="text-text-muted hover:text-primary disabled:opacity-30 p-2"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status toggles */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="available-check"
                    checked={prodAvailable}
                    onChange={(e) => setProdAvailable(e.target.checked)}
                    className="accent-primary h-4 w-4"
                  />
                  <label htmlFor="available-check" className="text-white select-none uppercase tracking-wider text-[10px] font-bold">
                    Mark product as active catalog listing
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="border border-white/10 hover:border-white text-text-muted hover:text-white font-bold tracking-widest text-[9px] px-6 py-3 rounded uppercase transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-light text-black font-bold tracking-widest text-[9px] px-6 py-3 rounded uppercase transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

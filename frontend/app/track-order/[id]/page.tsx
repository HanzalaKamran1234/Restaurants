"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { translations } from '../../../utils/translations';
import { Clock, MapPin, CheckCircle2, Truck, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product: {
    name: string;
    images: Array<{ url: string }>;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCharge: number;
  tax: number;
  finalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

import { use } from 'react';

export default function TrackOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { language } = useApp();
  const t = translations[language];

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchOrder = () => {
      fetch(`/api/orders/${resolvedParams.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Order not found');
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => {
          setErrorMsg('Failed to locate order details.');
          setLoading(false);
        });
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center space-y-4 relative z-10 font-sans">
        <div className="text-xs text-text-muted font-light tracking-widest uppercase">Loading live tracking details...</div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto px-6 py-32 text-center space-y-6 relative z-10 font-sans">
        <div className="glass p-8 rounded border border-primary/20 space-y-4">
          <h1 className="text-lg font-serif tracking-widest text-white uppercase">Tracking Code Not Found</h1>
          <p className="text-xs text-text-muted font-light leading-relaxed">
            The reference code provided does not match any current active orders. Please check your spelling or contact concierge.
          </p>
          <Link href="/track-order" className="inline-block bg-primary hover:bg-primary-light text-black text-[10px] tracking-widest font-bold px-6 py-2.5 rounded uppercase transition-all">
            Try Another ID
          </Link>
        </div>
      </div>
    );
  }

  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStatusIdx = statuses.indexOf(order.status.toUpperCase());

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "Order registered and awaiting verification";
      case "PROCESSING": return "Garments are being quality inspected and packaged";
      case "SHIPPED": return "Package has been handed over to logistics courier";
      case "DELIVERED": return "Delivered. Enjoy your garments. Wear Confidence.";
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 font-sans relative z-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 mb-10 gap-4">
        <div>
          <span className="text-[10px] text-primary tracking-[0.25em] font-bold uppercase block">LIVE PURCHASE PROGRESS</span>
          <h1 className="text-xl sm:text-2xl font-serif tracking-widest text-white uppercase mt-1">Purchase Order #{order.orderNumber}</h1>
          <p className="text-xs text-text-muted mt-1 font-light">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded">
            <Clock size={16} className="text-primary" />
            <div>
              <div className="text-[8px] text-text-muted uppercase tracking-wider">Estimated Dispatch</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">24-48 Hours</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Timeline Tracking */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Status timeline */}
          <div className="glass p-6 sm:p-8 rounded border border-white/5 space-y-6">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest">Order Status</h3>
            
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/15">
              {statuses.map((status, index) => {
                const isPassed = index <= currentStatusIdx;
                const isActive = index === currentStatusIdx;
                return (
                  <div key={status} className="flex gap-4 relative">
                    {/* Circle Indicator */}
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center border z-10 transition-all ${
                      isActive 
                        ? 'bg-primary border-primary text-black scale-110 shadow-lg shadow-primary/20' 
                        : isPassed 
                          ? 'bg-neutral-800 border-neutral-700 text-primary' 
                          : 'bg-background border-white/10 text-text-muted'
                    }`}>
                      {isPassed ? <CheckCircle2 size={13} className="fill-current" /> : <div className="h-1 w-1 rounded-full bg-current" />}
                    </div>

                    {/* Text info */}
                    <div className="flex-1 pt-0.5 text-xs">
                      <h4 className={`font-serif font-bold tracking-wider uppercase ${isActive ? 'text-primary' : isPassed ? 'text-white' : 'text-text-muted'}`}>
                        {status.toUpperCase()}
                      </h4>
                      <p className="text-text-muted font-light mt-0.5">{getStatusLabel(status)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Details Card */}
          <div className="glass p-6 rounded border border-white/5 space-y-4">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Truck size={14} className="text-primary" />
              <span>Logistics Delivery Details</span>
            </h3>

            <div className="bg-[#0c0c0d] border border-white/5 p-5 rounded space-y-4 text-xs font-light">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] text-text-muted uppercase tracking-wider">Shipping Carrier</div>
                  <div className="text-white mt-0.5 font-medium uppercase tracking-wide">THE VESTRA Concierge / TCS</div>
                </div>
                <div>
                  <div className="text-[9px] text-text-muted uppercase tracking-wider">Tracking Reference</div>
                  <div className="text-white mt-0.5 font-sans font-semibold">VST-{order.orderNumber}-LOG</div>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-3.5 flex gap-2 items-center text-text-muted">
                <Package size={14} className="text-primary" />
                <span>Custom rigid packaging inspect verification completed.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Order Details Sidebar */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="glass p-6 rounded border border-white/5 space-y-4 text-xs font-light">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              <span>Shipping Destination</span>
            </h3>

            <div className="text-text-muted space-y-3">
              <div className="space-y-1">
                <div className="font-bold text-white uppercase text-[9px] tracking-wider">Recipient Details</div>
                <div className="leading-relaxed">Valued Client</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white uppercase text-[9px] tracking-wider">Shipping Address</div>
                <div className="text-white leading-relaxed">{order.shippingAddress}</div>
              </div>
              {order.notes && (
                <div className="space-y-1">
                  <div className="font-bold text-white uppercase text-[9px] tracking-wider">Instructions</div>
                  <div className="italic text-primary">"{order.notes}"</div>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary list */}
          <div className="glass p-6 rounded border border-white/5 space-y-4 text-xs font-light">
            <h3 className="text-xs font-serif font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary" />
              <span>Purchase Summary</span>
            </h3>

            <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-8 rounded overflow-hidden bg-surface border border-white/10 flex-shrink-0">
                      <img src={item.product?.images?.[0]?.url || ''} alt={item.product?.name} className="h-full w-full object-cover grayscale" />
                    </div>
                    <div>
                      <div className="text-white font-medium uppercase tracking-wide">{item.product?.name}</div>
                      <div className="text-[9px] text-text-muted uppercase tracking-wider">{item.color} / {item.size}</div>
                    </div>
                  </div>
                  <span className="text-white font-sans font-bold">Rs. {Math.round(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3.5 space-y-2 text-text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-sans text-white">Rs. {Math.round(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-sans text-white">
                  {order.shippingCharge === 0 ? "FREE" : `Rs. ${order.shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white border-t border-white/5 pt-3 mt-1 uppercase tracking-widest">
                <span>Total Value</span>
                <span className="text-primary font-sans text-sm">Rs. {order.finalAmount}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

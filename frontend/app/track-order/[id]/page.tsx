"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { translations } from '../../../utils/translations';
import { Clock, MapPin, CheckCircle2, ChevronRight, Phone, MessageSquare, Truck } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryCharge: number;
  tax: number;
  finalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  area: string;
  nearestLandmark: string;
  instructions: string;
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
  const [simulatedMinutes, setSimulatedMinutes] = useState(25);

  useEffect(() => {
    const fetchOrder = () => {
      fetch(`/api/orders/${resolvedParams.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Order not found');
          return res.json();
        })
        .then((data) => {
          // Remap properties from db if needed (e.g. mapping subtotal to totalAmount)
          setOrder({
            ...data,
            totalAmount: data.subtotal,
            area: data.area?.name || 'North Nazimabad'
          });
          setLoading(false);
        })
        .catch(() => {
          setErrorMsg('Failed to locate order details.');
          setLoading(false);
        });
    };

    fetchOrder();
    // Poll order status every 10 seconds for real-time changes
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-4 relative z-10 font-sans">
        <div className="text-sm text-text-muted">Loading live tracking systems...</div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6 relative z-10 font-sans">
        <div className="glass p-8 rounded-3xl border border-primary/20 space-y-4">
          <h1 className="text-xl font-bold text-white">Tracking Reference Not Found</h1>
          <p className="text-xs text-text-muted">
            The ID provided does not match any current active orders. Please check your spelling or contact support.
          </p>
          <Link href="/track-order" className="inline-block bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-2.5 rounded-lg">
            Try Another ID
          </Link>
        </div>
      </div>
    );
  }

  const statuses = ["PENDING", "ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStatusIdx = statuses.indexOf(order.status.toUpperCase());

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "Awaiting kitchen confirmation";
      case "ACCEPTED": return "Order accepted by chef";
      case "PREPARING": return "In kitchen preparation";
      case "READY": return "Prepared and packaged";
      case "OUT_FOR_DELIVERY": return "Rider dispatched";
      case "DELIVERED": return "Delivered & ready to feast";
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans relative z-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs text-primary-light font-bold">LIVE PROGRESS</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Order #{order.orderNumber}</h1>
          <p className="text-xs text-text-muted mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
            <Clock size={20} className="text-gold" />
            <div>
              <div className="text-[10px] text-text-muted uppercase">Estimated Delivery</div>
              <div className="text-sm font-bold text-white">{simulatedMinutes} Minutes Remaining</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Timeline Tracking & Details */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Status timeline */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Timeline</h3>
            
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
              {statuses.map((status, index) => {
                const isPassed = index <= currentStatusIdx;
                const isActive = index === currentStatusIdx;
                return (
                  <div key={status} className="flex gap-4 relative">
                    {/* Circle Indicator */}
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center border z-10 ${
                      isActive 
                        ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20' 
                        : isPassed 
                          ? 'bg-green-600 border-green-600 text-white' 
                          : 'bg-background border-white/10 text-text-muted'
                    }`}>
                      {isPassed ? <CheckCircle2 size={14} className="fill-current" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </div>

                    {/* Text info */}
                    <div className="flex-1 pt-0.5">
                      <h4 className={`text-xs sm:text-sm font-bold ${isActive ? 'text-primary-light' : isPassed ? 'text-white' : 'text-text-muted'}`}>
                        {status.toUpperCase().replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">{getStatusLabel(status)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Simulation Widget */}
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Truck size={16} className="text-gold" />
              <span>Rider Live Position Tracker</span>
            </h3>

            {/* Map Simulator Canvas */}
            <div className="relative h-64 bg-[#0a0a0b] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              
              {/* Grid map styling */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-60"></div>
              
              {/* Simulated path road */}
              <svg className="absolute w-full h-full stroke-primary/30 stroke-[3] fill-none" viewBox="0 0 500 200">
                <path d="M 50,150 Q 150,50 250,120 T 450,80" />
              </svg>
              
              {/* Simulated active route path */}
              <svg className="absolute w-full h-full stroke-primary stroke-[4] stroke-dasharray-[10,5] fill-none" viewBox="0 0 500 200">
                <path d="M 50,150 Q 150,50 250,120 T 450,80" />
              </svg>

              {/* Start node */}
              <div className="absolute left-[45px] bottom-[35px] flex flex-col items-center">
                <div className="h-3.5 w-3.5 rounded-full bg-gold border-2 border-background"></div>
                <span className="text-[9px] text-gold font-bold mt-1 uppercase">Ziyafat Kitchen</span>
              </div>

              {/* End node */}
              <div className="absolute right-[35px] top-[75px] flex flex-col items-center">
                <div className="h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background"></div>
                <span className="text-[9px] text-green-400 font-bold mt-1 uppercase">Your House</span>
              </div>

              {/* Moving Rider dot */}
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div 
                  className="absolute h-9 w-9 rounded-full bg-primary border-2 border-gold flex items-center justify-center text-white shadow-lg shadow-primary/30 animate-pulse transition-all duration-1000"
                  style={{
                    left: `${currentStatusIdx === 0 ? 55 : currentStatusIdx === 1 ? 110 : currentStatusIdx === 2 ? 180 : currentStatusIdx === 3 ? 250 : currentStatusIdx === 4 ? 340 : 380}px`,
                    top: `${currentStatusIdx === 0 ? 135 : currentStatusIdx === 1 ? 95 : currentStatusIdx === 2 ? 65 : currentStatusIdx === 3 ? 100 : currentStatusIdx === 4 ? 85 : 75}px`,
                  }}
                >
                  <Truck size={14} />
                </div>
              )}

              <div className="absolute bottom-3 left-3 bg-black/60 border border-white/10 rounded px-2.5 py-1 text-[10px] text-text-muted backdrop-blur-sm uppercase">
                Simulated satellite GPS data
              </div>
            </div>
          </div>
        </section>

        {/* Order Details Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
              Delivery Info
            </h3>

            <div className="text-xs text-text-muted space-y-3">
              <div className="space-y-1">
                <div className="font-bold text-white uppercase text-[10px]">Recipient</div>
                <div>Valued Ziyafat Guest</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white uppercase text-[10px]">Zone / Area</div>
                <div>{order.area}</div>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white uppercase text-[10px]">Full Address</div>
                <div className="text-white leading-relaxed font-light">{order.deliveryAddress}</div>
              </div>
              {order.nearestLandmark && (
                <div className="space-y-1">
                  <div className="font-bold text-white uppercase text-[10px]">Nearest Landmark</div>
                  <div className="text-white">{order.nearestLandmark}</div>
                </div>
              )}
              {order.instructions && (
                <div className="space-y-1">
                  <div className="font-bold text-white uppercase text-[10px]">Instructions</div>
                  <div className="italic text-primary-light">"{order.instructions}"</div>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary list */}
          <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
              Items Summary
            </h3>

            <div className="space-y-3.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-light">{item.quantity}x</span>
                    <span className="text-white font-medium">{item.menuItem.name}</span>
                  </div>
                  <span className="text-white">Rs. {Math.round(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3.5 space-y-2 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {Math.round(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>Rs. {order.deliveryCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (13%)</span>
                <span>Rs. {order.tax}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white border-t border-white/10 pt-3 mt-1">
                <span>Grand Total</span>
                <span className="text-primary-light">Rs. {order.finalAmount}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FAQ() {
  const faqs: FaqItem[] = [
    {
      q: "What is THE VESTRA's sizing and fit standard?",
      a: "Our garments are designed with modern minimalist proportions. Many items feature a relaxed or oversized silhouette. Please consult the detailed 'Fit Guide' on individual product pages to find your perfect measurements."
    },
    {
      q: "Where do you ship to?",
      a: "We provide secure premium shipping nationwide across Pakistan (Karachi, Lahore, Islamabad, and all major cities) as well as select international hubs."
    },
    {
      q: "What are the shipping charges and delivery timeframes?",
      a: "We charge a flat rate of Rs. 200 nationwide, which is waived (FREE shipping) for all orders above Rs. 5,000. Deliveries take 2 to 4 business days, with Karachi orders arriving in 24 to 48 hours."
    },
    {
      q: "What is your exchange and return policy?",
      a: "We offer a 7-day complimentary exchange window for all unworn garments with original tags intact. Simply contact our support concierge via WhatsApp to arrange a reverse courier pickup."
    },
    {
      q: "How are the garments packaged?",
      a: "To ensure absolute fabric protection, every garment is wrapped in acid-free tissue paper, packed in a premium rigid matte-black box, and accompanied by a luxury cotton dust bag."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-sans relative z-10 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs tracking-[0.25em] text-primary font-bold uppercase">Frequently Asked Questions</span>
        <h1 className="text-2xl sm:text-3xl font-serif tracking-widest text-white uppercase">THE VESTRA Help Portal</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="glass rounded border border-white/5 overflow-hidden transition-all">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-white focus:outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold flex items-center gap-3 uppercase tracking-wider">
                  <HelpCircle size={14} className="text-primary" />
                  <span>{faq.q}</span>
                </span>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-white/5 text-[11px] sm:text-xs text-text-muted leading-relaxed font-light">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

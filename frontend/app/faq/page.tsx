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
      q: "Is Ziyafat food 100% Halal?",
      a: "Yes, absolutely. We source all our meats from certified premium local suppliers in Karachi, ensuring 100% Halal and Tayyab standards of preparation."
    },
    {
      q: "What areas do you deliver to in Karachi?",
      a: "Our primary quick-delivery zone is North Nazimabad (Blocks A through N). We also cater to Gulshan-e-Iqbal, Clifton, and DHA for larger family feast packages."
    },
    {
      q: "How does the WhatsApp ordering work?",
      a: "When you checkout, our system formats your name, phone, address, and shopping cart items into a structured text. You can submit it instantly to our Business WhatsApp line with a single click."
    },
    {
      q: "What are your delivery timings?",
      a: "We are open daily from 12:00 PM to 02:00 AM. Last kitchen orders are accepted at 01:30 AM."
    },
    {
      q: "What is your refund policy?",
      a: "If your food is delivered cold or damaged, contact our WhatsApp support within 15 minutes. We will issue a replacement feast or refund the full bill amount."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 font-sans relative z-10 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs tracking-widest text-gold font-bold uppercase">Frequently Asked Questions</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Ziyafat Help Portal</h1>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="glass rounded-2xl border border-white/5 overflow-hidden transition-all">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-white focus:outline-none"
              >
                <span className="text-sm sm:text-base font-semibold flex items-center gap-3">
                  <HelpCircle size={18} className="text-primary-light" />
                  <span>{faq.q}</span>
                </span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-white/5 text-xs sm:text-sm text-text-muted leading-relaxed font-light">
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

"use client";

import React from 'react';
import { MessageSquare, Phone } from 'lucide-react';

export const FloatingActions: React.FC = () => {
  const whatsappNumber = '923700349146';
  const phoneNumber = '03700349146';
  const welcomeText = encodeURIComponent("Salam Ziyafat! I'd like to ask about today's specials.");

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3.5 font-sans">
      {/* Phone Button */}
      <a
        href={`tel:${phoneNumber}`}
        className="flex items-center justify-center h-12 w-12 rounded-full bg-gold hover:bg-gold-light text-background shadow-lg hover:shadow-gold/30 hover:scale-105 transition-all focus:outline-none"
        title="Call Ziyafat Support"
      >
        <Phone size={20} />
      </a>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${welcomeText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg hover:shadow-[#25D366]/30 hover:scale-105 transition-all focus:outline-none"
        title="Chat on WhatsApp"
      >
        <MessageSquare size={20} />
      </a>
    </div>
  );
};

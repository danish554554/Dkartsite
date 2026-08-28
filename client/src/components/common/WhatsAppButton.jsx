import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  const WHATSAPP_NUMBER = '923001234567'; // Dkart Official WhatsApp Helpdesk
  const DEFAULT_MESSAGE = encodeURIComponent("Hi Dkart! I'm shopping on dkart.pk and need quick assistance with my order.");

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`, '_blank');
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-40 flex flex-col items-end gap-2 print:hidden select-none">
      {/* Help tooltip bubble on hover/tap */}
      {isOpen && (
        <div className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 max-w-xs w-72 mb-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                dK
              </div>
              <div>
                <h4 className="font-bold text-xs text-dkart-charcoal">Dkart Helpdesk</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online • Instant Reply</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs text-gray-600 my-3 leading-relaxed">
            Need help with product selection, delivery timelines, or placing a Cash on Delivery order?
          </p>

          <button
            onClick={openWhatsApp}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-98"
          >
            <MessageCircle size={15} />
            <span>Chat on WhatsApp</span>
          </button>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        title="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
        <MessageCircle size={22} className="fill-current" />
        <span className="hidden sm:inline font-bold text-xs tracking-tight">WhatsApp Help</span>
      </button>
    </div>
  );
}

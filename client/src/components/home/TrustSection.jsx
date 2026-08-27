import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Sparkles } from 'lucide-react';

export default function TrustSection() {
  const features = [
    {
      icon: <CreditCard className="text-dkart-blue" size={26} />,
      title: 'Cash on Delivery (COD)',
      description: 'Order with zero risk. Inspect your package and pay cash right at your doorstep.'
    },
    {
      icon: <Truck className="text-dkart-orange" size={26} />,
      title: 'Nationwide Express Shipping',
      description: 'Dispatched via TCS & Leopard Express to all cities, towns & villages across Pakistan.'
    },
    {
      icon: <RotateCcw className="text-emerald-600" size={26} />,
      title: '7-Day Easy Exchange',
      description: 'Received a damaged or defective item? We provide fast, hassle-free doorstep replacements.'
    },
    {
      icon: <Headphones className="text-indigo-600" size={26} />,
      title: '24/7 WhatsApp Support',
      description: 'Real Pakistani customer support agents ready to help with orders, tracking & inquiries.'
    }
  ];

  return (
    <section className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-dkart-blue">
            The Dkart Guarantee
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-dkart-charcoal tracking-tight mt-1">
            Built on Trust for Pakistani Shoppers
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-100 bg-[#F9FAFC] hover:bg-white hover:border-blue-100 hover:shadow-card transition-all duration-300 flex flex-col items-start gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center border border-gray-100">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-dkart-charcoal mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

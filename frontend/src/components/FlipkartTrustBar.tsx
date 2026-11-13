import React from 'react';
import { ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

export const FlipkartTrustBar: React.FC = () => {
  const perks = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#ED2C23]" />,
      bg: 'bg-red-50 border-red-200/80',
      title: '100% Genuine Quality',
      subtitle: 'Verified batch warranty',
    },
    {
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/80',
      title: 'Fast Express Delivery',
      subtitle: 'Free shipping on orders',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200/80',
      title: '7 Days Easy Exchange',
      subtitle: 'Hassle-free size replacement',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200/80',
      title: 'Secure Razorpay Payments',
      subtitle: 'UPI, Cards & NetBanking',
    },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200/90 py-3.5 px-4 sm:px-6 shadow-2xs">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {perks.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${item.bg} border shadow-2xs flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5 font-medium">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

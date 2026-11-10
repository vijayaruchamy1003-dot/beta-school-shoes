import React from 'react';
import { ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

export const FlipkartTrustBar: React.FC = () => {
  const perks = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      title: '100% Genuine Walkaroo',
      subtitle: 'Official batch warranty',
    },
    {
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      title: 'Fast Express Delivery',
      subtitle: 'Free shipping on orders',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-amber-600" />,
      title: '7 Days Easy Exchange',
      subtitle: 'Hassle-free size replacement',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      title: 'Secure Razorpay Payments',
      subtitle: 'UPI, Cards & NetBanking',
    },
  ];

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 py-3.5 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-4">
        {perks.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

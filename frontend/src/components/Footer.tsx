import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 md:pt-20">
        
        {/* Main 4-Column Grid */}
        <div className="grid gap-10 pb-14 md:grid-cols-12 md:pb-16">
          
          {/* Brand & Partner Column */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3" aria-label="SM Enterprises Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-sm">
                SM
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black uppercase tracking-tight text-white leading-none">
                  SM Enterprises
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-1">
                  Official Walkaroo Company Partner
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-slate-400">
              SM Enterprises is the officially authorized institutional distributor partnering with Walkaroo Company. Delivering certified durable school shoes, PT sneakers, and uniform footwear directly to institutions, students, and parents.
            </p>

            <div className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5 text-xs text-slate-300 border border-slate-700/60 max-w-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official Institutional Partner ID: <strong>SM-WLK-DIST-2024/902</strong></span>
            </div>
          </div>

          {/* Shop Categories */}
          <nav className="md:col-span-2" aria-label="Shop categories">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shop Footwear
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors">
                  All School Shoes
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=BOYS_FORMAL" className="hover:text-white transition-colors">
                  Boys Formal Derby
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=GIRLS_FORMAL" className="hover:text-white transition-colors">
                  Girls Formal Buckle
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=SPORTS_PT" className="hover:text-white transition-colors">
                  Sports & PT Canvas
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=JUNIOR_VELCRO" className="hover:text-white transition-colors">
                  Junior Velcro Strap
                </Link>
              </li>
            </ul>
          </nav>

          {/* Institutional Services */}
          <nav className="md:col-span-3" aria-label="Institutional services">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Institutional Solutions
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/bulk-enquiry" className="hover:text-white transition-colors">
                  Bulk School Enquiries & Tenders
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Track Student Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Campus Fitment Camps
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Contact: orders@smenterprises.in</span>
              </li>
              <li>
                <span className="text-slate-500">Wholesale: tenders@smenterprises.in</span>
              </li>
            </ul>
          </nav>

          {/* School Newsletter / Tenders */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              School Updates & Catalogs
            </h3>
            <p className="text-xs text-slate-400">
              Receive new term sizing guides and institutional rate cards directly in your inbox.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Thank you! We will dispatch the Walkaroo catalog.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex rounded-xl bg-slate-800 border border-slate-700 overflow-hidden p-1">
                <input
                  type="email"
                  required
                  placeholder="Principal or School Email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Sub-footer Bar */}
        <div className="border-t border-slate-800 py-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} <strong>SM Enterprises</strong>. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Officially Partnered with <strong>Walkaroo Company</strong></span>
            <span>•</span>
            <span>Razorpay Secure Payments</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

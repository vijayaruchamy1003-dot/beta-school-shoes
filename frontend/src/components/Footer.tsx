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
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Shoes Net Home">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ED2C23] via-[#D91E18] to-[#991B1B] text-white shadow-md">
                <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current" aria-hidden="true">
                  <path d="M4 21.5c0-1.4 1.1-2.5 2.5-2.5h2.2c1.8 0 3.5-.8 4.6-2.2l2.9-3.6c.6-.7 1.6-.9 2.4-.5l1.9 1c1.2.6 2.5 1 3.8 1.2l2.3.3c1.9.3 3.4 1.9 3.4 3.8v2.5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2zm2.5 3.5h21c.8 0 1.5.7 1.5 1.5S28.3 28 27.5 28h-21C5.7 28 5 27.3 5 26.5S5.7 25 6.5 25z" />
                </svg>
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <div className="flex items-baseline gap-0.5 leading-none">
                  <span className="text-xl font-black uppercase tracking-tight text-white">
                    SHOES
                  </span>
                  <span className="text-xl font-black uppercase tracking-tight text-[#ED2C23]">
                    .NET
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 mt-1">
                  Premium Footwear &amp; School Shoes
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-slate-400">
              Shoes Net delivers durable school shoes, sports sneakers, and everyday footwear directly to institutions, students, families, and individuals across India.
            </p>
          </div>

          {/* Shop Categories */}
          <nav className="md:col-span-2" aria-label="Shop categories">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shop Footwear
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=BOYS" className="hover:text-white transition-colors">
                  Boys
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=GIRLS" className="hover:text-white transition-colors">
                  Girls
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=MEN" className="hover:text-white transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=WOMEN" className="hover:text-white transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=SCHOOL_SHOES" className="hover:text-white transition-colors">
                  School Shoes
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
                <span className="text-slate-500">Contact: orders@shoesnet.in</span>
              </li>
              <li>
                <span className="text-slate-500">Wholesale: tenders@shoesnet.in</span>
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
                <span>Thank you! We will dispatch the latest catalog.</span>
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
                  className="rounded-lg bg-[#ED2C23] hover:bg-[#D41C14] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Sub-footer Bar */}
        <div className="border-t border-slate-800 py-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} <strong>Shoes Net</strong>. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Razorpay Secure Payments</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

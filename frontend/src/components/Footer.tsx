import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

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
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
        
        {/* Main 4-Column Grid */}
        <div className="grid gap-12 pb-16 md:grid-cols-12 md:pb-20">
          
          {/* Brand & Mission Column */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-2.5" aria-label="BETA home">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-foreground shrink-0" fill="currentColor" aria-hidden="true">
                <path d="M8.7 1.5h6.6l7.2 7.2v6.6l-7.2 7.2H8.7l-7.2-7.2V8.7l7.2-7.2z"></path>
              </svg>
              <span className="font-display text-2xl font-black uppercase leading-none tracking-tight">
                BETA
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-primary-foreground/70 font-sans">
              Official institutional distributor of genuine BETA school footwear. Uniform-compliant, high-density soles, and scuff-resistant leather designed to withstand every term.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground/60">
              <ShieldCheck className="w-4 h-4 text-primary-foreground/80" />
              <span>Partner ID: BETA-INS-DIST-2024/902</span>
            </div>
          </div>

          {/* Shop Links */}
          <nav className="md:col-span-2" aria-label="Shop links">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/50">
              Shop Shoes
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link to="/catalogue" className="transition-colors hover:text-primary-foreground/70">
                  All School Shoes
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=BOYS_FORMAL" className="transition-colors hover:text-primary-foreground/70">
                  Boys Formal Oxford
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=GIRLS_FORMAL" className="transition-colors hover:text-primary-foreground/70">
                  Girls Formal Buckle
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=SPORTS_PT" className="transition-colors hover:text-primary-foreground/70">
                  Sports & PT Canvas
                </Link>
              </li>
              <li>
                <Link to="/catalogue?category=JUNIOR_VELCRO" className="transition-colors hover:text-primary-foreground/70">
                  Junior Velcro
                </Link>
              </li>
            </ul>
          </nav>

          {/* Institutional / Company */}
          <nav className="md:col-span-2" aria-label="Company links">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/50">
              Institution
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link to="/bulk-enquiry" className="transition-colors hover:text-primary-foreground/70">
                  Bulk School Orders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-primary-foreground/70">
                  Contact Distributor
                </Link>
              </li>
              <li>
                <Link to="/track" className="transition-colors hover:text-primary-foreground/70">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-primary-foreground/90 font-bold hover:underline transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </nav>

          {/* Institutional Bulletin Newsletter */}
          <div className="md:col-span-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/50">
              Uniform Supply Bulletin
            </h3>
            <p className="mt-4 mb-5 text-sm text-primary-foreground/70">
              Receive updates on seasonal school admissions restocks, sizing camp schedules, and wholesale institutional quotes.
            </p>
            {subscribed ? (
              <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground bg-primary-foreground/10 p-3">
                ✓ Thank you. You are subscribed to distributor bulletins.
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-stretch border-b-2 border-primary-foreground/40">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Principal or School Email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-current placeholder:opacity-50 text-primary-foreground"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.14em] transition-transform active:scale-95 text-primary-foreground hover:opacity-80"
                >
                  <ArrowRight className="h-4 w-4" />
                  Join
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Signature Octo Giant Watermark */}
        <div className="pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <div className="font-display -mb-[0.22em] text-center text-[27vw] font-black uppercase leading-[0.8] tracking-tight text-primary-foreground/10">
            BETA
          </div>
        </div>

      </div>

      {/* Sub-footer Bar */}
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-primary-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} BETA School Shoes. Single-Vendor Institutional Footwear Store.</p>
          <p>Official Distributor · Apex Footwear · Razorpay Verified Checkout</p>
        </div>
      </div>
    </footer>
  );
};

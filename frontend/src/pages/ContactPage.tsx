import React, { useState } from 'react';
import { MapPin, Mail, Phone, MessageSquare, Check, ArrowRight } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main className="flex-1">
      {/* Top Header Banner */}
      <section className="border-b border-foreground/15 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Contact us
          </p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Talk to the<br />distributor
          </h1>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:gap-20">
          
          {/* Left Column: Form */}
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
              Send a message
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sizing advice, school uniform committee tenders, order inquiries, or institutional campus supply — our official desk answers within one working day.
            </p>

            {submitted ? (
              <div className="mt-8 border border-foreground/25 bg-card p-8 space-y-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-display font-black">
                  ✓
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                  Message Dispatched
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thank you for contacting the Shoes Net institutional sales desk. A dedicated footwear coordinator will reach out to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', message: '' });
                  }}
                  className="mt-4 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-xs font-bold uppercase tracking-[0.16em] hover:text-muted-foreground transition-colors"
                >
                  Send another message →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={120}
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="+91 98450 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    maxLength={2000}
                    rows={6}
                    placeholder="Tell us about your student sizing needs, bulk delivery, or school uniform timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center justify-center gap-3 bg-primary px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98] disabled:opacity-60"
                >
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Atelier / Showroom Details */}
          <div>
            {/* Paper Shadow Editorial Card */}
            <div className="paper-shadow border border-foreground/15 bg-card p-4 md:rotate-1">
              <div className="aspect-[3/2] w-full overflow-hidden bg-secondary relative flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop"
                  alt="Shoes Net distribution depot and shoe warehouse"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
                  Shoes Net Distribution Depot
                </div>
              </div>
            </div>

            {/* Contact Rows */}
            <div className="mt-10 space-y-0">
              <div className="flex gap-5 border-t border-foreground/20 py-6">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em]">
                    Visit the distribution depot
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Commercial Crescent No. 48, Central Business District, Bengaluru, Karnataka 560001<br />
                    Monday – Saturday, 09:30 – 18:30
                  </p>
                </div>
              </div>

              <div className="flex gap-5 border-t border-foreground/20 py-6">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em]">
                    Write to us
                  </h3>
                  <a
                    href="mailto:orders@shoesnet.in"
                    className="mt-1.5 block text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    orders@shoesnet.in
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Institutional school tenders: tenders@shoesnet.in
                  </p>
                </div>
              </div>

              <div className="flex gap-5 border-y border-foreground/20 py-6">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em]">
                    Call the distribution desk
                  </h3>
                  <a
                    href="tel:+919845012345"
                    className="mt-1.5 block text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    +91 98450 12345 / +91 80 2345 6789
                  </a>
                  <a
                    href="https://wa.me/919845012345"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-foreground" />
                    <span>Chat on Institutional WhatsApp Desk</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Registry Badge */}
            <div className="mt-6 border border-foreground/15 p-4 bg-secondary/40 text-xs text-muted-foreground">
              <span className="font-bold text-foreground uppercase tracking-wider block mb-0.5">
                Distribution Registry:
              </span>
              Code: <code className="font-mono text-foreground font-semibold">SN-DIST-2024/902</code> — Shoes Net Institutional & Retail Footwear Supply.
            </div>

          </div>

        </div>
      </section>
    </main>
  );
};

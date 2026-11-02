import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/client';
import { PublicProduct } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ArrowUpRight, ArrowRight, ShieldCheck, Award, Ruler, CheckCircle } from 'lucide-react';
import { ShoeVector } from '../components/ShoeVector';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const categoryParam = activeCategory === 'ALL' ? undefined : activeCategory;
    productApi.getPublicCatalogue({ category: categoryParam, size: 8 })
      .then(res => setProducts(res.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <main className="flex-1 bg-background text-foreground">
      
      {/* Section 0: Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-16 text-center md:pb-24 md:pt-28">
          
          <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground md:text-sm">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-700" fill="currentColor" aria-hidden="true">
              <path d="M8.7 1.5h6.6l7.2 7.2v6.6l-7.2 7.2H8.7l-7.2-7.2V8.7l7.2-7.2z"></path>
            </svg>
            <span>SM Enterprises · Official Partner of Walkaroo Company</span>
          </p>

          <h1 className="font-display mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-8xl">
            Find your<br />perfect pair
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Engineered for academic rigor, playground sprints, and all-day comfort. Single-vendor authorized distribution with server-verified stock and instant Razorpay checkout.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#collection"
              className="flex items-center gap-3 bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98]"
            >
              Shop the collection
            </a>

            <Link
              to="/bulk-enquiry"
              className="flex items-center gap-2 border border-foreground/30 bg-transparent px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-foreground transition-all hover:border-foreground hover:bg-secondary/40 active:scale-[0.98]"
            >
              Bulk School Orders
            </Link>
          </div>

        </div>
      </section>

      {/* Section 1: Hero Banner Stage */}
      <section className="relative border-y border-foreground/15 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Institutional Excellence
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-black uppercase tracking-tight">
              Approved Uniform Standards
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every shoe meets strict institutional guidelines for formal dress codes, PT physical training, and safety standards across schools nationwide.
            </p>
          </div>

          <div className="flex-1 w-full max-w-md flex items-center justify-center p-6 bg-card border border-foreground/15 paper-shadow-sm">
            <ShoeVector sku="BETA-SCH-OX01" className="w-full h-auto max-h-48 drop-shadow-md" />
          </div>
        </div>

        <p className="absolute bottom-0 left-0 bg-background border-t border-r border-foreground/15 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
          Batch No. 2026 — Official Walkaroo School Footwear
        </p>
      </section>

      {/* Section 2: Explore the Collection */}
      <section className="py-20 md:py-28" id="collection">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                The current batch
              </p>
              <h2 className="font-display mt-3 text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
                Explore the<br />collection
              </h2>
            </div>

            <Link
              to="/catalogue"
              className="group flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.16em] transition-colors hover:text-muted-foreground"
            >
              View all shoes
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-10 flex flex-wrap gap-2 border-b border-foreground/15 pb-4">
            {[
              { id: 'ALL', label: 'All Shoes' },
              { id: 'BOYS_FORMAL', label: 'Boys Formal Oxford' },
              { id: 'GIRLS_FORMAL', label: 'Girls Formal Buckle' },
              { id: 'SPORTS_PT', label: 'Sports & PT Canvas' },
              { id: 'JUNIOR_VELCRO', label: 'Junior Velcro' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
              <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Loading footwear collection...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-foreground/20 p-12 text-center bg-card">
              <p className="font-display text-lg font-bold uppercase">No shoes found in this category</p>
              <button
                onClick={() => setActiveCategory('ALL')}
                className="mt-4 border-b-2 border-foreground pb-1 text-xs font-bold uppercase tracking-wider"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Section 3: Three Crafts. One Cut. */}
      <section className="border-t border-foreground/15 bg-secondary/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-xl md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Institutional Quality
            </p>
            <h2 className="font-display mt-3 text-4xl font-black uppercase leading-none tracking-tight md:text-5xl">
              Three crafts. One purpose.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Engineered by Walkaroo specifically to outlast playground friction, morning assembly drills, and unpredictable weather throughout the academic year.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="border border-foreground/15 bg-card p-8 space-y-4">
              <div className="w-10 h-10 border border-foreground flex items-center justify-center font-display font-black text-sm">
                01
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                Scuff-Resistant Finish
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                High-grade action leather with polyurethane treatment. Repels dust, cleans with a damp wipe, and maintains high-gloss uniform shine.
              </p>
            </div>

            <div className="border border-foreground/15 bg-card p-8 space-y-4">
              <div className="w-10 h-10 border border-foreground flex items-center justify-center font-display font-black text-sm">
                02
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                Shock-Absorbing Soles
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Direct-injection lightweight soles with anatomical arch contours, preventing heel fatigue during long standing assemblies and sports periods.
              </p>
            </div>

            <div className="border border-foreground/15 bg-card p-8 space-y-4">
              <div className="w-10 h-10 border border-foreground flex items-center justify-center font-display font-black text-sm">
                03
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                Breathable In-Sock
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Perforated moisture-wicking footbeds with anti-odor antimicrobial lining to keep growing feet hygienic, dry, and cool all day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Made by hand / Institutional Guarantee */}
      <section className="bg-primary py-20 text-primary-foreground md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
          <div className="paper-shadow-bone border border-primary-foreground/20">
            <img
              src="https://images.hostinger.com/deecd9e7-3dd1-45af-a949-d7facb171fbd.png"
              alt="Quality assurance in Walkaroo footwear production"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/60">
              SM Enterprises · Walkaroo Official Partner
            </p>
            <h2 className="font-display text-4xl font-black uppercase leading-tight md:text-5xl">
              Engineered for endurance, on purpose
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              As the officially authorized institutional distributor partnering with Walkaroo Company, SM Enterprises delivers verified, authentic uniform footwear directly to parents, schools, and institutional trusts.
            </p>
            <ul className="space-y-3 text-sm text-primary-foreground/90 font-sans">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-primary-foreground" />
                <span>Zero counterfeit guarantee with genuine Walkaroo batch certification</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-primary-foreground" />
                <span>Instant payment verification via official Razorpay modal</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-primary-foreground" />
                <span>Row-locked PostgreSQL inventory preventing overselling</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/bulk-enquiry"
                className="inline-flex items-center gap-3 border border-primary-foreground px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-primary-foreground hover:text-primary active:scale-[0.98]"
              >
                Inquire for School Trusts →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Editorial Quote */}
      <section className="py-20 md:py-28">
        <blockquote className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            “A school shoe should outlive the toughest term it was bought for.”
          </p>
          <footer className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            SM Enterprises · Walkaroo Official Institutional Footwear Partner · Single-Vendor Supply
          </footer>
        </blockquote>
      </section>

      {/* Section 6: Large Watermark Bulk Callout */}
      <section className="relative overflow-hidden border-t border-foreground/15 bg-secondary py-20 md:py-28">
        <div
          className="font-display pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[10rem] font-black uppercase leading-none text-foreground/5 md:text-[14rem]"
          aria-hidden="true"
        >
          WALKAROO
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <h2 className="font-display max-w-xl text-4xl font-black uppercase leading-none tracking-tight md:text-5xl">
            Supplying schools nationwide
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Need student footwear for an entire institution or uniform trust? We conduct on-campus sizing camps, offer wholesale tiers, and maintain semester buffer stocks.
          </p>
          <div className="mt-8">
            <Link
              to="/bulk-enquiry"
              className="inline-flex items-center gap-3 bg-primary px-10 py-4 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:paper-shadow-sm active:scale-[0.98]"
            >
              Submit School Enquiry
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/client';
import { PublicProduct } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CategoryRail } from '../components/CategoryRail';
import { FlipkartBannerCarousel } from '../components/FlipkartBannerCarousel';
import { FlipkartTrustBar } from '../components/FlipkartTrustBar';
import { ArrowUpRight, ArrowRight, ShieldCheck, Award, Ruler, CheckCircle, Flame, Sparkles, Tag } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [deals, setDeals] = useState<PublicProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const categoryParam = activeCategory === 'ALL' ? undefined : activeCategory;
    productApi.getPublicCatalogue({ category: categoryParam, size: 8 })
      .then(res => {
        setProducts(res.data.content);
        // If deals not populated yet, pick items with discounts or bestsellers
        if (deals.length === 0 && res.data.content.length > 0) {
          const featuredDeals = res.data.content.slice(0, 4);
          setDeals(featuredDeals);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <main className="flex-1 bg-[#f1f3f6] text-foreground min-h-screen">
      
      {/* 1. Flipkart-Style Top Category Navigation Bar */}
      <CategoryRail />

      {/* 2. Flipkart-Style Hero Banner Carousel */}
      <div className="w-full">
        <FlipkartBannerCarousel />
      </div>

      {/* 3. Flipkart-Style Trust & Guarantee Bar */}
      <FlipkartTrustBar />

      {/* 4. Flipkart-Style "Deals of the Day / Top Offers" Section */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6 md:py-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <Flame className="w-5 h-5 fill-rose-500 text-rose-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Top Offers on School Footwear
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs">
                    DEALS OF THE DAY
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Exclusive student & institutional discounts on genuine Walkaroo pairs
                </p>
              </div>
            </div>

            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Deal Cards Grid */}
          <div className="p-4 sm:p-6 bg-slate-50/50">
            {loading && products.length === 0 ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Loading top footwear deals...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {(deals.length > 0 ? deals : products.slice(0, 4)).map((p, idx) => (
                  <ProductCard key={`deal-${p.id}`} product={p} index={idx} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. Main Collection Explorer Section */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-4 md:py-6" id="collection">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-8">
          
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Authorized Walkaroo Catalogue
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Explore the Uniform Collection
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Certified uniform compliance, heavy-duty vulcanized soles, and anti-slip tread patterns for daily campus wear.
              </p>
            </div>

            <Link
              to="/catalogue"
              className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 hover:text-blue-800 transition-colors"
            >
              <span>Full Catalogue</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Category Filter Pills (Flipkart/Asian Footwears style) */}
          <div className="mb-8 flex flex-wrap gap-2">
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
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Loading footwear collection...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-12 text-center bg-slate-50">
              <p className="text-base font-bold text-slate-800 uppercase">No shoes found in this category</p>
              <button
                onClick={() => setActiveCategory('ALL')}
                className="mt-3 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 6. Three-Pillar Uniform Excellence Badges */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Scuff-Resistant Synthetic Leather
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              High-tensile polyurethane leather upper treated with scuff-guard polymer, keeping a mirror polish with simple wipe-down care.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Shock-Absorbing EVA Soles
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Direct-injection lightweight soles with anatomical arch contours, preventing heel fatigue during long morning assemblies and sports drills.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Breathable Anti-Odor In-Sock
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Perforated moisture-wicking footbeds with anti-odor antimicrobial lining to keep growing feet hygienic, dry, and cool all day.
            </p>
          </div>

        </div>
      </section>

      {/* 7. Institutional Partnership & Quality Guarantee */}
      <section className="bg-slate-900 py-16 text-white md:py-20 mt-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16">
          <div className="overflow-hidden rounded-3xl border border-slate-700 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop"
              alt="Quality assurance in Walkaroo shoe manufacturing and stitching"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/60 border border-blue-600/50 px-3 py-1 text-xs font-bold text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Shoes Net · Walkaroo Official Partner</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight text-white">
              Engineered for endurance, on purpose
            </h2>
            
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              As the officially authorized institutional distributor partnering with Walkaroo Company, Shoes Net delivers verified, authentic uniform footwear directly to parents, schools, and institutional trusts.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-200 font-sans">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Zero counterfeit guarantee with genuine Walkaroo batch certification</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Instant payment verification via official Razorpay modal (UPI, Cards, NetBanking)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Direct guest checkout — no login required to purchase shoes</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Row-locked PostgreSQL inventory preventing overselling</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/bulk-enquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md hover:bg-amber-300 transition-all active:scale-95"
              >
                <span>Inquire for School Trusts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-700 transition-all"
              >
                Browse All Shoes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Editorial Quote */}
      <section className="py-16 md:py-20 bg-white border-y border-slate-200">
        <blockquote className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900">
            “A school shoe should outlive the toughest term it was bought for.”
          </p>
          <footer className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Shoes Net · Walkaroo Official Institutional Footwear Partner · Single-Vendor Supply
          </footer>
        </blockquote>
      </section>

      {/* 9. Large Watermark Bulk Callout (Clean Watermark "WALKAROO") */}
      <section className="relative overflow-hidden bg-slate-100 py-16 md:py-24 border-b border-slate-200">
        <div
          className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none text-[8rem] sm:text-[12rem] md:text-[15rem] font-black uppercase leading-none text-slate-200/80"
          aria-hidden="true"
        >
          WALKAROO
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Nationwide Logistics & Tenders
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight text-slate-900">
              Supplying schools nationwide
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Need student footwear for an entire institution or uniform trust? We conduct on-campus sizing camps, offer wholesale tiers, and maintain semester buffer stocks.
            </p>
            <div className="pt-2">
              <Link
                to="/bulk-enquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-800 transition-all active:scale-95"
              >
                <span>Submit School Enquiry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

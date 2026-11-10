import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, ArrowRight, Truck, Award, CheckCircle } from 'lucide-react';

interface BannerSlide {
  id: string;
  pill: string;
  pillBg: string;
  title: string;
  highlight: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryText?: string;
  secondaryLink?: string;
  bgGradient: string;
  badgeText: string;
  tags: string[];
  imageSrc: string;
  imageAlt: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'back-to-school',
    pill: 'WALKAROO OFFICIAL STORE • BACK TO SCHOOL FEST',
    pillBg: 'bg-amber-400 text-slate-950',
    title: 'BACK TO SCHOOL MEGA SALE',
    highlight: 'UP TO 40% OFF',
    description: 'Institutional-approved Oxford, Derby and Mary Jane buckle shoes. Shock-absorbing lightweight soles engineered for 365 days of rigorous campus life.',
    ctaText: 'Shop All Shoes',
    ctaLink: '/catalogue',
    secondaryText: 'Boys Formal Pairs',
    secondaryLink: '/catalogue?category=BOYS_FORMAL',
    bgGradient: 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900',
    badgeText: 'MIN. 30% - 40% OFF',
    tags: ['🚚 Free Express Delivery', '★ 4.9/5 Certified Rating', '100% Genuine Walkaroo'],
    imageSrc: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=900&auto=format&fit=crop',
    imageAlt: 'Walkaroo durable formal school footwear',
  },
  {
    id: 'sports-pt-special',
    pill: 'PT & DRILL PERFORMANCE • STARTING ₹399',
    pillBg: 'bg-emerald-400 text-slate-950',
    title: 'SPORTS & PT DAY ESSENTIALS',
    highlight: 'STARTING AT ₹399',
    description: 'High-traction non-marking white sneakers and breathable mesh runners. Built for playground sprints, morning assembly parades, and physical fitness.',
    ctaText: 'Explore Sports PT',
    ctaLink: '/catalogue?category=SPORTS_PT',
    secondaryText: 'Girls Buckle Shoes',
    secondaryLink: '/catalogue?category=GIRLS_FORMAL',
    bgGradient: 'bg-gradient-to-r from-slate-900 via-teal-900 to-emerald-950',
    badgeText: 'SPECIAL PT PRICING',
    tags: ['⚡ Non-Marking White Soles', '🛡️ Shock-Absorbing EVA', 'Air-Mesh Breathable'],
    imageSrc: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=900&auto=format&fit=crop',
    imageAlt: 'Walkaroo sports and PT school sneakers',
  },
  {
    id: 'institutional-bulk',
    pill: 'DIRECT INSTITUTIONAL SUPPLY • SHOES NET',
    pillBg: 'bg-amber-300 text-slate-950',
    title: 'SUPPLYING 500+ SCHOOLS NATIONWIDE',
    highlight: 'DIRECT TRUST PRICING',
    description: 'Authorized single-vendor supply for school trusts, management committees & academies. Direct factory dispatch with on-campus sizing fitment camps.',
    ctaText: 'Submit School Tender',
    ctaLink: '/bulk-enquiry',
    secondaryText: 'Contact Distribution Desk',
    secondaryLink: '/contact',
    bgGradient: 'bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900',
    badgeText: 'INSTITUTIONAL TENDER',
    tags: ['🏫 On-Campus Sizing Camps', '📋 GST B2B Invoices', '📦 Buffer Stock Assurance'],
    imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop',
    imageAlt: 'Institutional school shoes bulk procurement',
  },
];

export const FlipkartBannerCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = SLIDES.length;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, total]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const slide = SLIDES[currentSlide];

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional Banners Carousel"
    >
      {/* Slide Container */}
      <div className={`relative min-h-[380px] sm:min-h-[420px] md:min-h-[460px] text-white flex items-center transition-colors duration-700 ${slide.bgGradient}`}>
        
        {/* Decorative Grid Texture */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true" 
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-10 w-full relative z-10 grid md:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column (7 cols) */}
          <div className="md:col-span-7 space-y-4 sm:space-y-5 animate-fade-in">
            
            {/* Top Pill Offer Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm transition-all">
              <span className={`px-2 py-0.5 rounded-full ${slide.pillBg}`}>
                {slide.pill}
              </span>
            </div>

            {/* Title & Highlight */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-[1.05]">
                {slide.title}
              </h2>
              <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-amber-300">
                {slide.highlight}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-slate-200/90 leading-relaxed max-w-xl">
              {slide.description}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-200">
              {slide.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action CTA Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                to={slide.ctaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-md hover:bg-amber-300 hover:shadow-lg transition-all active:scale-95"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {slide.secondaryLink && slide.secondaryText && (
                <Link
                  to={slide.secondaryLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-xs px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all active:scale-95"
                >
                  {slide.secondaryText}
                </Link>
              )}
            </div>

          </div>

          {/* Right Visual Image Column (5 cols) */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900/40 backdrop-blur-xs group">
              <img
                src={slide.imageSrc}
                alt={slide.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* Offer Badge Overlay on Image */}
              <div className="absolute top-4 right-4 bg-rose-600 text-white font-black text-[11px] sm:text-xs uppercase px-3 py-1 rounded-xl shadow-lg border border-white/20 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{slide.badgeText}</span>
              </div>

              {/* Bottom Authentic Seal */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-slate-200">
                <span className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shoes Net • Walkaroo Official</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Prev / Next Arrows (Flipkart Style rounded pills) */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-14 sm:w-12 sm:h-20 bg-white/90 hover:bg-white text-slate-900 rounded-r-xl sm:rounded-r-2xl shadow-xl flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 text-slate-800" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-14 sm:w-12 sm:h-20 bg-white/90 hover:bg-white text-slate-900 rounded-l-xl sm:rounded-l-2xl shadow-xl flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
      >
        <ChevronRight className="w-6 h-6 text-slate-800" />
      </button>

      {/* Indicator Dots (Flipkart Style) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-7 h-2 bg-amber-400 shadow-sm'
                : 'w-2 h-2 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

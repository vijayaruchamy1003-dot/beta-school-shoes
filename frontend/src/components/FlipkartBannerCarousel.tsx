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
    pill: 'WALKAROO OFFICIAL STORE • MEGA BACK TO SCHOOL FEST',
    pillBg: 'bg-white text-[#ED2C23] font-black shadow-sm',
    title: 'WALKAROO UNIFORM EXCELLENCE',
    highlight: 'UP TO 40% OFF + FREE SHIPPING',
    description: 'Official uniform-compliant Oxford, Derby and Mary Jane buckle shoes. Direct injection PU soles built for 365 days of active campus endurance.',
    ctaText: 'Shop School Shoes',
    ctaLink: '/catalogue?category=SCHOOL_SHOES',
    secondaryText: 'Boys Collection',
    secondaryLink: '/catalogue?category=BOYS',
    bgGradient: 'bg-gradient-to-r from-[#ED2C23] via-[#E52D27] to-[#FA8C16]',
    badgeText: 'MIN. 30% - 40% OFF',
    tags: ['🚚 Free Express Delivery', '★ 4.9/5 Certified Rating', '100% Genuine Walkaroo'],
    imageSrc: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=900&auto=format&fit=crop',
    imageAlt: 'Walkaroo durable formal school footwear',
  },
  {
    id: 'sports-pt-special',
    pill: 'MEN, WOMEN & KIDS • STARTING ₹399',
    pillBg: 'bg-amber-300 text-slate-950 font-black shadow-sm',
    title: 'EVERYDAY & ACTIVE FOOTWEAR',
    highlight: 'STARTING AT ₹399 ONLY',
    description: 'Ultra-lightweight non-marking sneakers, daily wear sandals, and breathable air-mesh runners for Men, Women, Boys, and Girls.',
    ctaText: 'Explore Men & Women',
    ctaLink: '/catalogue?category=MEN',
    secondaryText: 'Girls Collection',
    secondaryLink: '/catalogue?category=GIRLS',
    bgGradient: 'bg-gradient-to-r from-[#0284C7] via-[#2563EB] to-[#4F46E5]',
    badgeText: 'SPECIAL PT PRICING',
    tags: ['⚡ Non-Marking White Soles', '🛡️ Shock-Absorbing EVA', 'Air-Mesh Breathable'],
    imageSrc: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=900&auto=format&fit=crop',
    imageAlt: 'Walkaroo sports and PT school sneakers',
  },
  {
    id: 'institutional-bulk',
    pill: 'DIRECT INSTITUTIONAL SUPPLY • SHOES NET',
    pillBg: 'bg-white text-emerald-800 font-black shadow-sm',
    title: 'SUPPLYING 500+ SCHOOLS NATIONWIDE',
    highlight: 'DIRECT TRUST PRICING',
    description: 'Authorized single-vendor supply for school trusts, management committees & academies. Direct factory dispatch with on-campus sizing fitment camps.',
    ctaText: 'Submit School Tender',
    ctaLink: '/bulk-enquiry',
    secondaryText: 'Contact Distribution Desk',
    secondaryLink: '/contact',
    bgGradient: 'bg-gradient-to-r from-[#059669] via-[#10B981] to-[#F59E0B]',
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
      className="relative w-full overflow-hidden bg-slate-900 shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional Banners Carousel"
    >
      {/* Slide Container with Bright Walkaroo Gradient */}
      <div className={`relative min-h-[380px] sm:min-h-[420px] md:min-h-[460px] text-white flex items-center transition-colors duration-700 ${slide.bgGradient}`}>
        
        {/* Decorative Grid Texture */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]"
          aria-hidden="true" 
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-10 w-full relative z-10 grid md:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Column (7 cols) */}
          <div className="md:col-span-7 space-y-4 sm:space-y-5 animate-fade-in">
            
            {/* Top Pill Offer Badge */}
            <div className="inline-flex items-center gap-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all">
              <span className={`px-3 py-1 rounded-full ${slide.pillBg}`}>
                {slide.pill}
              </span>
            </div>

            {/* Title & Highlight */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-[1.05] drop-shadow-xs">
                {slide.title}
              </h2>
              <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-amber-200 drop-shadow-xs">
                {slide.highlight}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-white/95 leading-relaxed max-w-xl font-medium">
              {slide.description}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-white">
              {slide.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-black/15 backdrop-blur-xs border border-white/20 shadow-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action CTA Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                to={slide.ctaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg hover:bg-amber-100 hover:shadow-xl transition-all active:scale-95"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-[#ED2C23]" />
              </Link>

              {slide.secondaryLink && slide.secondaryText && (
                <Link
                  to={slide.secondaryLink}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 backdrop-blur-xs px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all active:scale-95"
                >
                  {slide.secondaryText}
                </Link>
              )}
            </div>

          </div>

          {/* Right Visual Image Column (5 cols) */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] rounded-3xl overflow-hidden border-2 border-white/40 shadow-2xl bg-white/10 backdrop-blur-xs group">
              <img
                src={slide.imageSrc}
                alt={slide.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Offer Badge Overlay on Image */}
              <div className="absolute top-4 right-4 bg-[#ED2C23] text-white font-black text-[11px] sm:text-xs uppercase px-3 py-1.5 rounded-xl shadow-lg border border-white/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{slide.badgeText}</span>
              </div>

              {/* Bottom Authentic Seal */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-white">
                <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
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
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-14 sm:w-12 sm:h-20 bg-white/95 hover:bg-white text-slate-900 rounded-r-xl sm:rounded-r-2xl shadow-xl flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6 text-slate-800" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-14 sm:w-12 sm:h-20 bg-white/95 hover:bg-white text-slate-900 rounded-l-xl sm:rounded-l-2xl shadow-xl flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 z-20 cursor-pointer"
      >
        <ChevronRight className="w-6 h-6 text-slate-800" />
      </button>

      {/* Indicator Dots (Walkaroo Style) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-8 h-2.5 bg-white shadow-md'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ShieldCheck, Flame, Percent, GraduationCap, Package } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  subtitle: string;
  path: string;
  badge?: string;
  iconBg: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    name: 'All Footwear',
    subtitle: 'Full Uniform Range',
    path: '/catalogue',
    iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <Package className="w-6 h-6" />,
  },
  {
    id: 'boys-formal',
    name: 'Boys Formal',
    subtitle: 'Oxford & Derby',
    path: '/catalogue?category=BOYS_FORMAL',
    iconBg: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: (
      <span className="text-2xl" role="img" aria-label="Formal shoe">
        👞
      </span>
    ),
  },
  {
    id: 'girls-formal',
    name: 'Girls Buckle',
    subtitle: 'Mary Jane & Strap',
    path: '/catalogue?category=GIRLS_FORMAL',
    iconBg: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: (
      <span className="text-2xl" role="img" aria-label="Buckle shoe">
        👡
      </span>
    ),
  },
  {
    id: 'sports-pt',
    name: 'Sports & PT',
    subtitle: 'White & Mesh Trainers',
    path: '/catalogue?category=SPORTS_PT',
    badge: 'TRENDING',
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <Trophy className="w-6 h-6 text-emerald-600" />,
  },
  {
    id: 'junior-velcro',
    name: 'Junior Velcro',
    subtitle: 'Easy Fastener Straps',
    path: '/catalogue?category=JUNIOR_VELCRO',
    iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Sparkles className="w-6 h-6 text-amber-600" />,
  },
  {
    id: 'top-deals',
    name: 'Top Deals',
    subtitle: 'Up to 40% Off',
    path: '/catalogue?sort=bestseller',
    badge: 'MIN 30% OFF',
    iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: <Percent className="w-6 h-6 text-rose-600" />,
  },
  {
    id: 'bulk-enquiry',
    name: 'School Trusts',
    subtitle: 'Direct Bulk Pricing',
    path: '/bulk-enquiry',
    badge: 'INSTITUTIONAL',
    iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
  },
];

export const CategoryRail: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b border-slate-200/80 shadow-xs" aria-label="Product categories rail">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center justify-between gap-3 overflow-x-auto py-3 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className="group flex flex-col items-center min-w-[84px] sm:min-w-[100px] flex-shrink-0 text-center transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              {/* Icon Container with Badge */}
              <div className="relative">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shadow-2xs transition-all group-hover:shadow-md group-hover:scale-105 ${cat.iconBg}`}
                >
                  {cat.icon}
                </div>
                {cat.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full bg-rose-600 text-white shadow-xs">
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <span className="mt-2 text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline leading-tight mt-0.5">
                {cat.subtitle}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

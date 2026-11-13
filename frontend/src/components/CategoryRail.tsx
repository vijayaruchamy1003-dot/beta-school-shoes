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
    iconBg: 'bg-red-50 text-[#ED2C23] border-red-200/80',
    icon: <Package className="w-6 h-6 text-[#ED2C23]" />,
  },
  {
    id: 'boys-formal',
    name: 'Boys Formal',
    subtitle: 'Oxford & Derby',
    path: '/catalogue?category=BOYS_FORMAL',
    iconBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
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
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200/80',
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
    badge: 'HOT',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-200/80',
    icon: <Trophy className="w-6 h-6 text-blue-600" />,
  },
  {
    id: 'junior-velcro',
    name: 'Junior Velcro',
    subtitle: 'Easy Fastener Straps',
    path: '/catalogue?category=JUNIOR_VELCRO',
    iconBg: 'bg-orange-50 text-orange-600 border-orange-200/80',
    icon: <Sparkles className="w-6 h-6 text-orange-600" />,
  },
  {
    id: 'top-deals',
    name: 'Top Deals',
    subtitle: 'Up to 40% Off',
    path: '/catalogue?sort=bestseller',
    badge: 'MIN 30% OFF',
    iconBg: 'bg-red-500 text-white border-red-500',
    icon: <Percent className="w-6 h-6 text-white" />,
  },
  {
    id: 'bulk-enquiry',
    name: 'School Trusts',
    subtitle: 'Direct Bulk Pricing',
    path: '/bulk-enquiry',
    badge: 'INSTITUTIONAL',
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
  },
];

export const CategoryRail: React.FC = () => {
  return (
    <nav className="w-full bg-white border-b border-slate-200/90 shadow-2xs" aria-label="Product categories rail">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center justify-between gap-3 overflow-x-auto py-3.5 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className="group flex flex-col items-center min-w-[84px] sm:min-w-[100px] flex-shrink-0 text-center transition-transform hover:-translate-y-1 active:scale-95"
            >
              {/* Icon Container with Badge */}
              <div className="relative">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border shadow-xs transition-all group-hover:shadow-md group-hover:scale-105 ${cat.iconBg}`}
                >
                  {cat.icon}
                </div>
                {cat.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full bg-[#ED2C23] text-white shadow-xs">
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <span className="mt-2 text-xs sm:text-[13px] font-black text-slate-800 group-hover:text-[#ED2C23] transition-colors leading-tight">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline leading-tight mt-0.5 font-medium">
                {cat.subtitle}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

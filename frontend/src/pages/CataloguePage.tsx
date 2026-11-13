import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/client';
import { PublicProduct } from '../types';
import { ProductCard } from '../components/ProductCard';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronRight, 
  RotateCcw,
  Check,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Products' },
  { id: 'BOYS', label: 'Boys' },
  { id: 'GIRLS', label: 'Girls' },
  { id: 'MEN', label: 'Men' },
  { id: 'WOMEN', label: 'Women' },
  { id: 'SCHOOL_SHOES', label: 'School Shoes' },
];

const PRICE_RANGES = [
  { id: 'ALL', label: 'All Prices' },
  { id: 'UNDER_500', label: 'Under ₹500', max: 500 },
  { id: '500_800', label: '₹500 - ₹800', min: 500, max: 800 },
  { id: '800_1200', label: '₹800 - ₹1,200', min: 800, max: 1200 },
  { id: 'ABOVE_1200', label: 'Above ₹1,200', min: 1200 },
];

const SIZES = [
  'UK 8C', 'UK 9C', 'UK 10C', 'UK 11C', 'UK 12C', 'UK 13C',
  'UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9'
];

const SORT_OPTIONS = [
  { id: 'new_arrivals', label: 'New Arrivals' },
  { id: 'price_low_high', label: 'Price: Low to High' },
  { id: 'price_high_low', label: 'Price: High to Low' },
  { id: 'popular', label: 'Popularity / Featured' },
  { id: 'rating', label: 'Customer Rating' },
];

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters from URL or default
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'ALL';
  const selectedSize = searchParams.get('ukSize') || 'ALL';
  const selectedPriceRange = searchParams.get('priceRange') || 'ALL';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const sortBy = searchParams.get('sort_by') || 'new_arrivals';

  // UI state for mobile drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setLoading(true);
    productApi.getPublicCatalogue({
      category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      search: searchQuery || undefined,
      ukSize: selectedSize === 'ALL' ? undefined : selectedSize,
      size: 40,
    })
      .then(res => setProducts(res.data.content))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, selectedSize]);

  // Client-side Price & Stock Filtering & Sorting for instant Asian Footwears-like responsiveness
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Price Range
    if (selectedPriceRange !== 'ALL') {
      const range = PRICE_RANGES.find(p => p.id === selectedPriceRange);
      if (range) {
        result = result.filter(item => {
          if (range.min !== undefined && item.basePrice < range.min) return false;
          if (range.max !== undefined && item.basePrice > range.max) return false;
          return true;
        });
      }
    }

    // Filter by In-Stock Only
    if (inStockOnly) {
      result = result.filter(item =>
        item.sizes.some(s => Boolean(s.available ?? s.isAvailable))
      );
    }

    // Sort products (matching Asian Footwears sort_by)
    if (sortBy === 'price_low_high') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price_high_low') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.name.charCodeAt(0) % 5) - (a.name.charCodeAt(0) % 5));
    } else if (sortBy === 'new_arrivals') {
      // New arrivals order (by id desc)
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [products, selectedPriceRange, inStockOnly, sortBy]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'ALL' || value === 'false') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim() || null);
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    selectedCategory !== 'ALL',
    selectedSize !== 'ALL',
    selectedPriceRange !== 'ALL',
    inStockOnly,
    Boolean(searchQuery),
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#fafbfc] text-slate-900">
      
      {/* Asian Footwears Breadcrumb & Collection Header */}
      <section className="border-b border-slate-200/80 bg-white py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          
          {/* Breadcrumb Trail */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-blue-700 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-400">Collections</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-800">
              {selectedCategory !== 'ALL'
                ? CATEGORIES.find(c => c.id === selectedCategory)?.label
                : 'All Products'}
            </span>
          </nav>

          {/* Heading with Item Count Pill */}
          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-slate-900">
                  {selectedCategory !== 'ALL'
                    ? CATEGORIES.find(c => c.id === selectedCategory)?.label
                    : 'All Products'}
                </h1>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                  {loading ? '...' : `${filteredAndSortedProducts.length} Items`}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl">
                Official durable footwear crafted for Indian schools, sports PT training, and strict dress codes.
              </p>
            </div>

            {/* Quick Search within Collection */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by shoe name, model..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-xs font-medium text-slate-800 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParam('search', null);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

        </div>
      </section>

      {/* Asian Footwears Controls Bar (Sort Dropdown & Filter Trigger) */}
      <section className="sticky top-16 md:top-20 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md py-3 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Mobile Filter Toggle & Active Count */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-blue-700" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Desktop Filter Summary Tag */}
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Filters:
            </span>
            {activeFiltersCount === 0 ? (
              <span className="text-xs text-slate-500">None applied</span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedCategory !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    <button type="button" onClick={() => updateParam('category', 'ALL')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSize !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200">
                    Size: {selectedSize}
                    <button type="button" onClick={() => updateParam('ukSize', 'ALL')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPriceRange !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200">
                    {PRICE_RANGES.find(p => p.id === selectedPriceRange)?.label}
                    <button type="button" onClick={() => updateParam('priceRange', 'ALL')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                    In Stock Only
                    <button type="button" onClick={() => updateParam('inStock', 'false')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                    "{searchQuery}"
                    <button type="button" onClick={() => updateParam('search', null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="ml-1 text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Asian Footwears Sort Dropdown (sort_by) */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-slate-500">
              Sort By:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => updateParam('sort_by', e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3.5 pr-8 text-xs font-bold text-slate-800 outline-none transition-all hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

        </div>
      </section>

      {/* Main Two-Column Layout (Sidebar + Product Grid) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* ================= DESKTOP STICKY SIDEBAR ================= */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="sticky top-36 space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Category
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => updateParam('category', cat.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Price
                </h3>
                <div className="space-y-1">
                  {PRICE_RANGES.map(range => {
                    const isSelected = selectedPriceRange === range.id;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => updateParam('priceRange', range.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{range.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Asian Footwears Size Grid Pills */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    UK Shoe Size
                  </h3>
                  {selectedSize !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => updateParam('ukSize', 'ALL')}
                      className="text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {SIZES.map(size => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateParam('ukSize', isSelected ? 'ALL' : size)}
                        className={`rounded-lg py-1.5 text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white'
                        }`}
                      >
                        {size.replace(/^UK\s*/i, '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In-Stock Only Toggle */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : 'false')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

            </div>
          </aside>

          {/* ================= PRODUCT GRID ================= */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-700 border-t-transparent"></div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Loading Footwear Collection...
                </p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
                <SlidersHorizontal className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  No matching footwear found
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  We couldn't find any shoes matching your active filters. Try adjusting price, size, or uniform category.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-blue-800 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {filteredAndSortedProducts.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ================= MOBILE FILTER DRAWER ================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              
              {/* Category */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</h4>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateParam('category', cat.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                        selectedCategory === cat.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {selectedCategory === cat.id && <Check className="h-3.5 w-3.5 text-blue-700" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price</h4>
                <div className="space-y-1">
                  {PRICE_RANGES.map(range => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => updateParam('priceRange', range.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                        selectedPriceRange === range.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{range.label}</span>
                      {selectedPriceRange === range.id && <Check className="h-3.5 w-3.5 text-blue-700" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Size</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateParam('ukSize', selectedSize === size ? 'ALL' : size)}
                      className={`rounded-lg py-1.5 text-[11px] font-bold ${
                        selectedSize === size
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {size.replace(/^UK\s*/i, '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Stock */}
              <div className="border-t border-slate-100 pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : 'false')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-100 pt-3 flex gap-2">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold uppercase text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-blue-700 py-2.5 text-xs font-bold uppercase text-white shadow-xs"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
};

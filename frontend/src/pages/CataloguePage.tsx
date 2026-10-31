import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/client';
import { PublicProduct } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Shoes' },
  { id: 'BOYS_FORMAL', label: 'Boys Formal' },
  { id: 'GIRLS_FORMAL', label: 'Girls Formal' },
  { id: 'SPORTS_PT', label: 'Sports & PT Canvas' },
  { id: 'JUNIOR_VELCRO', label: 'Junior Velcro' },
];

const SIZES = ['ALL', 'UK 8C', 'UK 9C', 'UK 10C', 'UK 11C', 'UK 12C', 'UK 13C', 'UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'];

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('ukSize') || 'ALL');

  useEffect(() => {
    setLoading(true);
    productApi.getPublicCatalogue({
      category: selectedCategory,
      search: searchQuery,
      ukSize: selectedSize,
      size: 24,
    })
      .then(res => setProducts(res.data.content))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, selectedSize]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'ALL') newParams.delete('category');
    else newParams.set('category', catId);
    setSearchParams(newParams);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const newParams = new URLSearchParams(searchParams);
    if (size === 'ALL') newParams.delete('ukSize');
    else newParams.set('ukSize', size);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('ALL');
    setSelectedSize('ALL');
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Top Banner Header */}
      <section className="border-b border-foreground/15 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            The full collection
          </p>
          <h1 className="font-display mt-3 text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
            Shop all
          </h1>

          {/* Search and Quick Category Bar */}
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-md items-center gap-2 border-b-2 border-foreground/40 pb-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <label htmlFor="shop-search" className="sr-only">Search shoes</label>
              <input
                id="shop-search"
                type="search"
                placeholder="Search by shoe name or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Quick Size Filter Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Filter UK Size:
              </span>
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="border border-foreground/25 bg-transparent px-3 py-1.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-foreground"
              >
                {SIZES.map(s => (
                  <option key={s} value={s} className="bg-background text-foreground">
                    {s === 'ALL' ? 'All Sizes' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-foreground/20 bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {(selectedCategory !== 'ALL' || selectedSize !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-destructive hover:underline"
              >
                Clear all filters ×
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Products Grid */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Loading official BETA models...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-foreground/20 p-16 text-center bg-card max-w-xl mx-auto space-y-4">
              <SlidersHorizontal className="w-10 h-10 text-muted-foreground mx-auto" />
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                No matching footwear found
              </h2>
              <p className="text-sm text-muted-foreground">
                Try selecting a different uniform category or resetting your UK size filter.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-primary px-8 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
              >
                Reset Filters
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
    </main>
  );
};

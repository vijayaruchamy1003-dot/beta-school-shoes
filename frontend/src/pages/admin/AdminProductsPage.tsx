import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { AdminProduct } from '../../types';
import { ShoeVector } from '../../components/ShoeVector';
import { ProductEditModal, getShortId } from '../../components/admin/ProductEditModal';
import { Search, Plus, Edit, Globe, GraduationCap } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'WEBSITE' | 'SCHOOL_ORDER'>('WEBSITE');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  const loadProducts = () => {
    setLoading(true);
    adminApi.getProducts({ catalogType: activeTab, search, category, size: 100 })
      .then(res => setProducts(res.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [activeTab, category]);

  const handleTabChange = (tab: 'WEBSITE' | 'SCHOOL_ORDER') => {
    setActiveTab(tab);
    setCategory('');
    setSearch('');
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await adminApi.toggleActive(id, !current);
      setProducts(products.map(p => p.id === id ? { ...p, isActive: !current } : p));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const categoryOptions = activeTab === 'WEBSITE'
    ? [
        { value: 'BOYS', label: 'Boys' },
        { value: 'GIRLS', label: 'Girls' },
        { value: 'MEN', label: 'Men' },
        { value: 'WOMEN', label: 'Women' },
        { value: 'SCHOOL_SHOES', label: 'School Shoes' },
      ]
    : [
        { value: 'SHOES', label: 'Shoes' },
        { value: 'SHIRTS', label: 'Shirts' },
        { value: 'PANTS', label: 'Pants' },
        { value: 'SHORTS', label: 'Shorts / Skirts' },
        { value: 'TSHIRTS', label: 'T-Shirts' },
        { value: 'SOCKS', label: 'Socks' },
        { value: 'BAGS', label: 'School Bags' },
      ];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Manage Products</h1>
          <p className="text-xs text-slate-500">
            Manage Website Storefront products and School Order catalogue products in separate tabs.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-navy-950 text-white text-xs font-bold hover:bg-navy-850 transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === 'WEBSITE' ? '+ Add Website Product' : '+ Add School Order Product'}
          </span>
        </button>
      </div>

      {/* Two Tabs: Website Products vs School Order Products */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('WEBSITE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold transition ${
            activeTab === 'WEBSITE'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Website Products</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('SCHOOL_ORDER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold transition ${
            activeTab === 'SCHOOL_ORDER'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>School Order Products</span>
        </button>
      </div>

      {/* Info Banner for School Order Products */}
      {activeTab === 'SCHOOL_ORDER' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-center justify-between gap-3">
          <div>
            <span className="font-black">School Order Catalogue:</span> Products added in this tab automatically appear in{' '}
            <span className="font-bold underline">Student Order Placing</span> (School Orders &amp; Visit Orders) with their sizes and prices.
          </div>
        </div>
      )}

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, category, or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
          />
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-navy-950"
        >
          <option value="">All Categories</option>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-navy-950 font-bold text-xs"
        >
          Search
        </button>
      </form>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-950 mx-auto"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">
              No {activeTab === 'WEBSITE' ? 'Website' : 'School Order'} products found.
            </p>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-navy-950 text-white text-xs font-bold hover:bg-navy-850 transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First {activeTab === 'WEBSITE' ? 'Website' : 'School Order'} Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category / Type</th>
                  <th className="py-3 px-4">Sizes</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-slate-100 p-1 flex items-center justify-center flex-shrink-0">
                        {product.primaryImageUrl ? (
                          <img src={product.primaryImageUrl} alt={product.name} className="max-h-10 w-auto object-contain" />
                        ) : (
                          <ShoeVector sku={product.sku} className="max-h-10 w-auto" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-navy-950">{product.name}</p>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {product.shortId || getShortId(product.id, product.sku)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400">SKU: {product.sku}</span>
                          {product.badgeText && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                              {product.badgeText}
                            </span>
                          )}
                          {product.isBestseller && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                              ★ Bestseller
                            </span>
                          )}
                          {product.isNewArrival && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              ✨ New Arrival
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-bold">
                        {product.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {product.sizes && product.sizes.length > 0 ? (
                          product.sizes.map(s => (
                            <span key={s.sizeId || s.ukSize} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                              {s.ukSize}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-navy-950">₹{product.basePrice.toFixed(2)}</div>
                      {product.mrp && product.mrp > product.basePrice && (
                        <div className="text-[10px] text-slate-400 line-through">MRP: ₹{product.mrp.toFixed(2)}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-navy-950">{product.totalCombinedStock}</span> units
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Product Popup Modal */}
      <ProductEditModal
        product={selectedProduct}
        defaultCatalogType={activeTab}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadProducts}
      />
    </div>
  );
};

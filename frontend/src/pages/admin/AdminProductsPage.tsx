import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { AdminProduct } from '../../types';
import { ShoeVector } from '../../components/ShoeVector';
import { ProductEditModal, getShortId, cleanSize } from '../../components/admin/ProductEditModal';
import { Search, Plus, Edit, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  const loadProducts = () => {
    setLoading(true);
    adminApi.getProducts({ search, category, size: 50 })
      .then(res => setProducts(res.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

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

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Manage Products</h1>
          <p className="text-xs text-slate-500">Configure Walkaroo school shoe catalogue items, prices, and status.</p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-navy-950 text-white text-xs font-bold hover:bg-navy-850 transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Shoe Model</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or ID..."
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
          <option value="BOYS">Boys</option>
          <option value="GIRLS">Girls</option>
          <option value="MEN">Men</option>
          <option value="WOMEN">Women</option>
          <option value="SCHOOL_SHOES">School Shoes</option>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Available Stock</th>
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
                      {product.category}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-navy-950">₹{product.basePrice.toFixed(2)}</div>
                      {product.mrp && product.mrp > product.basePrice && (
                        <div className="text-[10px] text-slate-400 line-through">MRP: ₹{product.mrp.toFixed(2)}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-navy-950">{product.totalCombinedStock}</span> pairs
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

      {/* Edit / Add Shoe Model Popup Modal */}
      <ProductEditModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadProducts}
      />
    </div>
  );
};

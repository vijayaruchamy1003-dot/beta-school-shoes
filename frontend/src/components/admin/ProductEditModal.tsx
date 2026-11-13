import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import { AdminProduct } from '../../types';
import { X, Plus, Trash2, AlertCircle, Globe, GraduationCap } from 'lucide-react';

interface SizeRow {
  sizeId?: string;
  ukSize: string;
  price: string;
  count: string;
}

interface ProductEditModalProps {
  product: AdminProduct | null; // null means Add New
  defaultCatalogType?: 'WEBSITE' | 'SCHOOL_ORDER';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Format clean short unique ID
export const getShortId = (id?: string, _sku?: string): string => {
  if (!id) return 'PRD-NEW';
  if (id.startsWith('11111111-1111-1111-1111-1111111111')) {
    return 'PRD-' + id.substring(id.length - 3);
  }
  if (id.length >= 36) {
    return 'PRD-' + id.substring(0, 6).toUpperCase();
  }
  return id;
};

export const cleanSize = (s: string): string => {
  return s ? s.replace(/^UK\s*/i, '').trim() : '';
};

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  defaultCatalogType = 'WEBSITE',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEdit = Boolean(product);

  const [catalogType, setCatalogType] = useState<'WEBSITE' | 'SCHOOL_ORDER'>(defaultCatalogType);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [badgeText, setBadgeText] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sizes, setSizes] = useState<SizeRow[]>([]);
  const [quickSizesText, setQuickSizesText] = useState('');
  const [defaultStockPerSize, setDefaultStockPerSize] = useState('50');

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setCatalogType((product.catalogType as 'WEBSITE' | 'SCHOOL_ORDER') || defaultCatalogType);
      setName(product.name || '');
      setSku(product.sku || '');
      setCategory(product.category || '');
      setBasePrice(product.basePrice != null ? product.basePrice.toString() : '');
      setMrp(product.mrp ? product.mrp.toString() : '');
      setIsBestseller(Boolean(product.isBestseller));
      setIsNewArrival(Boolean(product.isNewArrival));
      setBadgeText(product.badgeText || '');
      setShortDescription(product.shortDescription || '');
      setIsActive(product.isActive !== false);
      setImagePreview(product.primaryImageUrl || null);
      setSelectedImageFile(null);
      setQuickSizesText('');

      if (product.sizes && product.sizes.length > 0) {
        setSizes(
          product.sizes.map(s => ({
            sizeId: s.sizeId,
            ukSize: cleanSize(s.ukSize),
            price: s.price != null ? s.price.toString() : (product.basePrice != null ? product.basePrice.toString() : ''),
            count: s.totalStock != null ? s.totalStock.toString() : '50',
          }))
        );
      } else {
        setSizes([
          { ukSize: '1', price: product.basePrice ? product.basePrice.toString() : '599', count: '50' },
          { ukSize: '2', price: product.basePrice ? product.basePrice.toString() : '599', count: '50' },
          { ukSize: '3', price: product.basePrice ? product.basePrice.toString() : '599', count: '50' },
        ]);
      }
    } else {
      setCatalogType(defaultCatalogType);
      setName('');
      setSku('');
      setCategory(defaultCatalogType === 'SCHOOL_ORDER' ? 'SHOES' : 'BOYS');
      setBasePrice('599');
      setMrp('');
      setIsBestseller(false);
      setIsNewArrival(false);
      setBadgeText('');
      setShortDescription('');
      setIsActive(true);
      setImagePreview(null);
      setSelectedImageFile(null);
      setQuickSizesText('');
      setDefaultStockPerSize('50');
      setSizes([
        { ukSize: '1', price: '599', count: '50' },
        { ukSize: '2', price: '599', count: '50' },
        { ukSize: '3', price: '599', count: '50' },
        { ukSize: '4', price: '599', count: '50' },
        { ukSize: '5', price: '599', count: '50' },
      ]);
    }
    setErrorMsg('');
  }, [product, defaultCatalogType, isOpen]);

  if (!isOpen) return null;

  const handleApplyQuickSizes = () => {
    const parts = quickSizesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    const unitPriceStr = basePrice || '599';
    const stockStr = defaultStockPerSize || '50';
    const newRows: SizeRow[] = parts.map(sz => ({
      ukSize: sz,
      price: unitPriceStr,
      count: stockStr,
    }));
    setSizes(newRows);
    setQuickSizesText('');
  };

  const handleAddSizeRow = () => {
    setSizes([
      ...sizes,
      {
        ukSize: '',
        price: basePrice || '599',
        count: defaultStockPerSize || '50',
      },
    ]);
  };

  const handleRemoveSizeRow = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index: number, field: keyof SizeRow, value: string) => {
    const updated = [...sizes];
    updated[index] = { ...updated[index], [field]: value };
    setSizes(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    if (!category.trim()) {
      setErrorMsg('Category / Type is required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      // If user typed quick sizes without clicking apply, include them automatically
      let activeSizes = [...sizes];
      if (quickSizesText.trim()) {
        const parts = quickSizesText.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length > 0) {
          activeSizes = parts.map(sz => ({
            ukSize: sz,
            price: basePrice || '0',
            count: defaultStockPerSize || '50',
          }));
        }
      }

      const cleanSizesPayload = activeSizes
        .filter(s => s.ukSize.trim() !== '')
        .map(s => ({
          sizeId: s.sizeId,
          ukSize: s.ukSize.trim(),
          price: parseFloat(s.price) || parseFloat(basePrice) || 0,
          count: parseInt(s.count, 10) || 0,
        }));

      if (cleanSizesPayload.length === 0) {
        cleanSizesPayload.push({
          sizeId: undefined,
          ukSize: 'Free',
          price: parseFloat(basePrice) || 0,
          count: parseInt(defaultStockPerSize, 10) || 50,
        });
      }

      const payload = {
        name: name.trim(),
        sku: sku.trim() ? sku.trim().toUpperCase() : undefined,
        shortDescription: shortDescription.trim() || name.trim(),
        category: category.trim().toUpperCase(),
        catalogType,
        basePrice: parseFloat(basePrice) || 0,
        mrp: mrp ? parseFloat(mrp) : undefined,
        isBestseller,
        isNewArrival,
        badgeText: badgeText.trim() || undefined,
        isActive,
        sizes: cleanSizesPayload,
      };

      let saved;
      if (isEdit && product?.id) {
        const res = await adminApi.updateProduct(product.id, payload);
        saved = res.data;
      } else {
        const res = await adminApi.createProduct(payload);
        saved = res.data;
      }

      if (selectedImageFile && saved?.id) {
        const imgForm = new FormData();
        imgForm.append('file', selectedImageFile);
        await adminApi.uploadProductImage(saved.id, imgForm, true);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save product. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickCategories = catalogType === 'WEBSITE'
    ? [
        { id: 'BOYS', label: 'Boys' },
        { id: 'GIRLS', label: 'Girls' },
        { id: 'MEN', label: 'Men' },
        { id: 'WOMEN', label: 'Women' },
        { id: 'SCHOOL_SHOES', label: 'School Shoes' },
      ]
    : [
        { id: 'SHOES', label: 'Shoes' },
        { id: 'SHIRTS', label: 'Shirts' },
        { id: 'PANTS', label: 'Pants' },
        { id: 'SHORTS', label: 'Shorts' },
        { id: 'TSHIRTS', label: 'T-Shirts' },
        { id: 'SOCKS', label: 'Socks' },
        { id: 'BAGS', label: 'Bags' },
      ];

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-8 p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-navy-950">
              {isEdit ? 'Edit Product' : 'Simple Product Creation'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter product name, type/category, price, and sizes directly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Product Section Selector: Website vs School Orders */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Product Section *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCatalogType('WEBSITE');
                  if (!isEdit) setCategory('BOYS');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold border text-xs transition ${
                  catalogType === 'WEBSITE'
                    ? 'bg-navy-950 text-white border-navy-950 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Website Product</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCatalogType('SCHOOL_ORDER');
                  if (!isEdit) setCategory('SHOES');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold border text-xs transition ${
                  catalogType === 'SCHOOL_ORDER'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>School Order Product</span>
              </button>
            </div>
          </div>

          {/* Row 1: Product Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 block">Product Name *</label>
              <input
                type="text"
                required
                placeholder={catalogType === 'SCHOOL_ORDER' ? 'e.g. Black Velcro School Shoe / White Shirt' : 'e.g. Dual-Strap Boys School Shoe'}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-navy-950"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="599"
                value={basePrice}
                onChange={e => {
                  const val = e.target.value;
                  setBasePrice(val);
                  setSizes(prev => prev.map(s => ({ ...s, price: val })));
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-navy-950"
              />
            </div>
          </div>

          {/* Row 2: Category / Type (Input + Quick Pills) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Category / Type * <span className="font-normal text-slate-400">(Type anything or click a quick tag)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickCategories.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCategory(opt.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition ${
                    category.toUpperCase().replace(/\s+/g, '_') === opt.id
                      ? 'bg-navy-950 text-white border-navy-950'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              placeholder="Type category (e.g. BOYS, GIRLS, MEN, WOMEN, SCHOOL_SHOES, SHOES, SHIRTS, PANTS...)"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-navy-950 bg-white"
            />
          </div>

          {/* SIZES & STOCK SECTION */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-navy-950 text-xs block">
                  Sizes &amp; Stock
                </span>
                <span className="text-[11px] text-slate-500">
                  Type comma-separated sizes below or edit individual size rows.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddSizeRow}
                className="px-2.5 py-1 rounded bg-navy-950 text-white font-bold text-[11px] hover:bg-navy-850 transition flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Row</span>
              </button>
            </div>

            {/* Quick comma-separated size generator */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-lg border border-slate-200">
              <input
                type="text"
                placeholder="Quick sizes (comma separated): e.g. 1, 2, 3, 4, 5 or 28, 30, 32"
                value={quickSizesText}
                onChange={e => setQuickSizesText(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded border border-slate-300 text-xs focus:outline-none focus:border-navy-950"
              />
              <input
                type="number"
                min="0"
                placeholder="Stock per size"
                value={defaultStockPerSize}
                onChange={e => setDefaultStockPerSize(e.target.value)}
                className="w-28 px-2.5 py-1.5 rounded border border-slate-300 text-xs font-mono focus:outline-none focus:border-navy-950"
                title="Default stock count per size"
              />
              <button
                type="button"
                onClick={handleApplyQuickSizes}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shrink-0"
              >
                Set Sizes
              </button>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-500 px-1">
                <div className="col-span-4">Size</div>
                <div className="col-span-4">Price (₹)</div>
                <div className="col-span-3">Stock</div>
                <div className="col-span-1 text-center">Del</div>
              </div>

              {sizes.map((s, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-1.5 rounded-lg border border-slate-200">
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Size (e.g. 5, M, Free)"
                      value={s.ukSize}
                      onChange={e => handleSizeChange(idx, 'ukSize', e.target.value)}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 font-bold text-navy-950 text-xs focus:outline-none focus:border-navy-950"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={s.price}
                      onChange={e => handleSizeChange(idx, 'price', e.target.value)}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono text-xs focus:outline-none focus:border-navy-950"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={s.count}
                      onChange={e => handleSizeChange(idx, 'count', e.target.value)}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono font-bold text-navy-950 text-xs focus:outline-none focus:border-navy-950"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveSizeRow(idx)}
                      className="p-1 rounded text-red-400 hover:text-red-700 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Details: SKU, MRP, Description, Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                SKU Code <span className="font-normal text-slate-400">(Optional - auto-generated)</span>
              </label>
              <input
                type="text"
                placeholder="Auto-generated if left blank"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs uppercase focus:outline-none focus:border-navy-950"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                MRP (₹) <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 899"
                value={mrp}
                onChange={e => setMrp(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-navy-950"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Description <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Optional short description..."
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-navy-950"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Product Image <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0">
                  <img src={imagePreview} alt="Preview" className="max-h-12 w-auto object-contain" />
                </div>
              )}
              <label className="flex-1 cursor-pointer border border-dashed border-slate-300 rounded-lg py-2 px-3 text-center hover:border-navy-950 transition bg-slate-50/50">
                <span className="text-xs font-semibold text-navy-950 block">Click to upload image</span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Active checkbox */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded accent-navy-950"
              />
              <span className="font-bold text-slate-700">Active</span>
            </label>

            {catalogType === 'WEBSITE' && (
              <>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={e => setIsBestseller(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span className="font-semibold text-amber-700">★ Bestseller</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={e => setIsNewArrival(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="font-semibold text-emerald-700">✨ New Arrival</span>
                </label>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-navy-950 hover:bg-navy-850 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import { AdminProduct } from '../../types';
import { X, Plus, Trash2, Upload, AlertCircle, Check } from 'lucide-react';

interface SizeRow {
  sizeId?: string;
  ukSize: string;
  price: string;
  count: string;
}

interface ProductEditModalProps {
  product: AdminProduct | null; // null means Add New
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Format clean short unique ID
export const getShortId = (id?: string, sku?: string): string => {
  if (!id) return 'PRD-NEW';
  if (id.startsWith('11111111-1111-1111-1111-1111111111')) {
    return 'PRD-' + id.substring(id.length - 3);
  }
  // Check if it's standard UUID
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
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEdit = Boolean(product);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sizes, setSizes] = useState<SizeRow[]>([]);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setCategory(product.category || '');
      setBasePrice(product.basePrice ? product.basePrice.toString() : '');
      setShortDescription(product.shortDescription || '');
      setIsActive(product.isActive !== false);
      setImagePreview(product.primaryImageUrl || null);
      setSelectedImageFile(null);

      // Populate size rows
      if (product.sizes && product.sizes.length > 0) {
        setSizes(
          product.sizes.map(s => ({
            sizeId: s.sizeId,
            ukSize: cleanSize(s.ukSize),
            price: s.price != null ? s.price.toString() : (product.basePrice ? product.basePrice.toString() : ''),
            count: s.totalStock != null ? s.totalStock.toString() : '0',
          }))
        );
      } else {
        setSizes([
          { ukSize: '1', price: product.basePrice ? product.basePrice.toString() : '699', count: '20' },
          { ukSize: '2', price: product.basePrice ? product.basePrice.toString() : '699', count: '20' },
          { ukSize: '3', price: product.basePrice ? product.basePrice.toString() : '699', count: '20' },
        ]);
      }
    } else {
      // Add New defaults
      setName('');
      setSku('');
      setCategory('');
      setBasePrice('699.00');
      setShortDescription('');
      setIsActive(true);
      setImagePreview(null);
      setSelectedImageFile(null);
      setSizes([
        { ukSize: '1', price: '699', count: '20' },
        { ukSize: '2', price: '699', count: '20' },
        { ukSize: '3', price: '699', count: '20' },
        { ukSize: '4', price: '699', count: '20' },
        { ukSize: '5', price: '699', count: '20' },
      ]);
    }
    setErrorMsg('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleAddSizeRow = () => {
    setSizes([
      ...sizes,
      {
        ukSize: '',
        price: basePrice || '699',
        count: '10',
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
    if (!sku.trim()) {
      setErrorMsg('SKU is required.');
      return;
    }
    if (!category.trim()) {
      setErrorMsg('Category is required. Please type a category.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const cleanSizesPayload = sizes
        .filter(s => s.ukSize.trim() !== '')
        .map(s => ({
          sizeId: s.sizeId,
          ukSize: s.ukSize.trim(),
          price: parseFloat(s.price) || parseFloat(basePrice) || 0,
          count: parseInt(s.count, 10) || 0,
        }));

      const payload = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        shortDescription: shortDescription.trim() || name.trim(),
        category: category.trim(),
        basePrice: parseFloat(basePrice) || 0,
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

      // If user uploaded a new image file, upload it
      if (selectedImageFile && saved?.id) {
        const imgForm = new FormData();
        imgForm.append('file', selectedImageFile);
        await adminApi.uploadProductImage(saved.id, imgForm, true);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save shoe model. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const shortIdDisplay = isEdit ? (product?.shortId || getShortId(product?.id, product?.sku)) : 'NEW';

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-navy-950">
                {isEdit ? 'Edit Shoe Model' : 'Add New Shoe Model'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200">
                ID: {shortIdDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Type category name, product info, shoe sizes, prices, and available stock count.
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
          
          {/* Row 1: Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. BETA Dual-Strap Junior Action"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-navy-950"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">SKU Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. BETA-SCH-VC03"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs uppercase focus:outline-none focus:border-navy-950"
              />
            </div>
          </div>

          {/* Row 2: Category (Written Text Input - NO DROPDOWN) & Base Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Category * <span className="font-normal text-slate-400">(Written Text)</span>
              </label>
              <input
                type="text"
                required
                placeholder="Type category (e.g. Boys Formal, Junior Velcro, Sports)..."
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-navy-950 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Base Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="699.00"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-navy-950"
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Short Description</label>
            <textarea
              rows={2}
              placeholder="Concise description of the shoe model..."
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-navy-950"
            />
          </div>

          {/* SIZES, PRICE & COUNT SECTION */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-navy-950 text-xs block">
                  Shoe Sizes, Pricing & Count
                </span>
                <span className="text-[11px] text-slate-500">
                  Type size number, specific price, and inventory stock count for each size.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddSizeRow}
                className="px-2.5 py-1 rounded bg-navy-950 text-white font-bold text-[11px] hover:bg-navy-850 transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Size</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-500 px-1">
                <div className="col-span-4">Size (Plain Text)</div>
                <div className="col-span-4">Price (₹)</div>
                <div className="col-span-3">Count / Stock</div>
                <div className="col-span-1 text-center">Del</div>
              </div>

              {sizes.length === 0 ? (
                <p className="text-center text-slate-400 py-3 text-xs italic">
                  No sizes added yet. Click "+ Add Size" above to add sizes.
                </p>
              ) : (
                sizes.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    {/* Size text input */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        required
                        placeholder="e.g. 6, 7, 8C"
                        value={s.ukSize}
                        onChange={e => handleSizeChange(idx, 'ukSize', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-bold text-navy-950 text-xs focus:outline-none focus:border-navy-950"
                      />
                    </div>

                    {/* Price input */}
                    <div className="col-span-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={s.price}
                        onChange={e => handleSizeChange(idx, 'price', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:outline-none focus:border-navy-950"
                      />
                    </div>

                    {/* Count input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Count"
                        value={s.count}
                        onChange={e => handleSizeChange(idx, 'count', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold text-navy-950 text-xs focus:outline-none focus:border-navy-950"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSizeRow(idx)}
                        className="p-1 rounded text-red-400 hover:text-red-700 hover:bg-red-50 transition"
                        title="Remove size"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-slate-700 block">Product Image</label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0">
                  <img src={imagePreview} alt="Preview" className="max-h-12 w-auto object-contain" />
                </div>
              )}
              <label className="flex-1 cursor-pointer border border-dashed border-slate-300 rounded-lg py-2.5 px-3 text-center hover:border-navy-950 transition bg-slate-50/50">
                <span className="text-xs font-semibold text-navy-950 block">Click to select new image</span>
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

          {/* Active status */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded accent-navy-950"
              />
              <span className="font-bold text-slate-700">Display as Active in Public Storefront</span>
            </label>
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
              {submitting ? 'Saving...' : isEdit ? 'Update Shoe Model' : 'Create Shoe Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

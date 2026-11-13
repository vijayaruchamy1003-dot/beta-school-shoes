import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/client';
import { ArrowLeft, Upload, Check, AlertCircle } from 'lucide-react';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    shortDescription: '',
    category: 'SCHOOL_SHOES',
    basePrice: '',
    mrp: '',
    isBestseller: false,
    isNewArrival: false,
    badgeText: '',
    isActive: true,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      adminApi.getProductById(id)
        .then(res => {
          setFormData({
            name: res.data.name,
            sku: res.data.sku,
            shortDescription: res.data.shortDescription,
            category: res.data.category,
            basePrice: res.data.basePrice.toString(),
            mrp: res.data.mrp ? res.data.mrp.toString() : '',
            isBestseller: Boolean(res.data.isBestseller),
            isNewArrival: Boolean(res.data.isNewArrival),
            badgeText: res.data.badgeText || '',
            isActive: res.data.isActive,
          });
          if (res.data.primaryImageUrl) {
            setImagePreview(res.data.primaryImageUrl);
          }
        })
        .catch(err => setErrorMsg(err.response?.data?.message || 'Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        shortDescription: formData.shortDescription.trim(),
        category: formData.category,
        basePrice: parseFloat(formData.basePrice),
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        isBestseller: formData.isBestseller,
        isNewArrival: formData.isNewArrival,
        badgeText: formData.badgeText.trim() || undefined,
        isActive: formData.isActive,
        initialSizes: isEdit ? undefined : ['UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5', 'UK 6']
      };

      let savedProduct;
      if (isEdit && id) {
        const res = await adminApi.updateProduct(id, payload);
        savedProduct = res.data;
      } else {
        const res = await adminApi.createProduct(payload);
        savedProduct = res.data;
      }

      // If new image file uploaded, upload it now
      if (selectedImageFile && savedProduct.id) {
        const imgForm = new FormData();
        imgForm.append('file', selectedImageFile);
        await adminApi.uploadProductImage(savedProduct.id, imgForm, true);
      }

      navigate('/admin/products');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save product. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-950 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Products</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-bold text-navy-950">
            {isEdit ? 'Edit School Shoe Model' : 'Add New School Shoe Model'}
          </h1>
          <p className="text-xs text-slate-500">
            Single form containing product name, image upload, short description, category, and price.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. Product Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Classic Oxford Lace-Up"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-navy-950"
            />
          </div>

          {/* SKU */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">SKU Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. WLK-SCH-OX01"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs uppercase font-mono focus:outline-none focus:border-navy-950"
            />
          </div>

          {/* 2. Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Category * <span className="font-normal text-slate-400">(Written Text)</span>
              </label>
              <input
                type="text"
                required
                placeholder="Type category (e.g. Boys Formal, Junior Velcro, Sports)..."
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-navy-950"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Price (INR) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="799.00"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-navy-950"
              />
            </div>
          </div>

          {/* Badges & MRP */}
          <div className="rounded-xl border border-blue-200/70 bg-blue-50/40 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Promotional Badges & MRP
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-xs">Original MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 999.00"
                  value={formData.mrp}
                  onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-navy-950 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-xs">Custom Badge Text</label>
                <input
                  type="text"
                  placeholder="e.g. 40% OFF, TOP PICK, HOT"
                  value={formData.badgeText}
                  onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-navy-950 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={e => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="font-bold text-amber-700">★ Mark as Bestseller</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={e => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-emerald-700">✨ Mark as New Arrival</span>
              </label>
            </div>
          </div>

          {/* 3. Short Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Short Description *</label>
            <textarea
              rows={3}
              required
              placeholder="One concise, professional description highlighting school uniform suitability, materials, and grip."
              value={formData.shortDescription}
              onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-navy-950"
            />
          </div>

          {/* 4. Product Image Upload */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-700 block">Product Image Upload (PNG, JPG, WebP)</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 p-1 flex items-center justify-center flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="max-h-16 w-auto object-contain" />
                </div>
              )}
              <label className="flex-1 cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-navy-950 transition">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-navy-950 block">Click to select product image</span>
                <span className="text-[10px] text-slate-400">Stores persistently to production object storage</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-navy-950 accent-navy-950"
              />
              <span className="font-semibold text-slate-700">Display as Active in Public Storefront</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-navy-950 hover:bg-navy-850 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving Product...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

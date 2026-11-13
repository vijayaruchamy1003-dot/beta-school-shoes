import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  ShieldCheck
} from 'lucide-react';
import { adminApi, schoolOrderApi } from '../../api/client';
import { Student, SchoolProductCategory, SchoolOrderStatus, SchoolOrderStockPolicy, StudentOrder, AdminProduct } from '../../types';

export interface CatalogPreset {
  id: string;
  productId?: string;
  category: SchoolProductCategory;
  name: string;
  defaultPrice: number;
  availableSizes: string[];
}

export const mapToSchoolCategory = (raw?: string): SchoolProductCategory => {
  if (!raw) return 'SHOES';
  const u = raw.trim().toUpperCase().replace(/[-_\s]/g, '');
  if (u.includes('TSHIRT') || u.includes('TEE')) return 'TSHIRTS';
  if (u.includes('SHIRT')) return 'SHIRTS';
  if (u.includes('PANT') || u.includes('TROUSER')) return 'PANTS';
  if (u.includes('SHORT') || u.includes('SKIRT')) return 'SHORTS';
  if (u.includes('SOCK')) return 'SOCKS';
  if (u.includes('BAG') || u.includes('BACKPACK')) return 'BAGS';
  return 'SHOES';
};

export const CATALOG_PRESETS: CatalogPreset[] = [
  // Shoes
  { id: 'sh-1', category: 'SHOES', name: 'Classic Oxford Lace-Up School Shoe', defaultPrice: 749, availableSizes: ['10C', '11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7', '8'] },
  { id: 'sh-2', category: 'SHOES', name: 'Mary Jane Single-Strap Girls Shoe', defaultPrice: 749, availableSizes: ['10C', '11C', '12C', '13C', '1', '2', '3', '4', '5'] },
  { id: 'sh-3', category: 'SHOES', name: 'PT-Pro White Canvas Trainer', defaultPrice: 599, availableSizes: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  { id: 'sh-4', category: 'SHOES', name: 'Dual-Strap Junior Velcro Shoe', defaultPrice: 699, availableSizes: ['8C', '9C', '10C', '11C', '12C', '13C', '1', '2', '3'] },

  // Shirts
  { id: 'srt-1', category: 'SHIRTS', name: 'White Half Sleeve Uniform Shirt', defaultPrice: 450, availableSizes: ['26', '28', '30', '32', '34', '36', '38', '40'] },
  { id: 'srt-2', category: 'SHIRTS', name: 'White Full Sleeve Uniform Shirt', defaultPrice: 499, availableSizes: ['26', '28', '30', '32', '34', '36', '38', '40'] },

  // Pants
  { id: 'pnt-1', category: 'PANTS', name: 'Navy Formal Uniform Trousers', defaultPrice: 650, availableSizes: ['24', '26', '28', '30', '32', '34', '36'] },
  { id: 'pnt-2', category: 'PANTS', name: 'Grey Pleated Uniform Trousers', defaultPrice: 650, availableSizes: ['24', '26', '28', '30', '32', '34', '36'] },

  // Shorts
  { id: 'shr-1', category: 'SHORTS', name: 'Navy Junior Uniform Shorts', defaultPrice: 399, availableSizes: ['20', '22', '24', '26', '28', '30'] },
  { id: 'shr-2', category: 'SHORTS', name: 'White PT Sports Shorts', defaultPrice: 450, availableSizes: ['22', '24', '26', '28', '30'] },

  // T-Shirts
  { id: 'tsh-1', category: 'TSHIRTS', name: 'House Sports Dry-Fit T-Shirt', defaultPrice: 450, availableSizes: ['26', '28', '30', '32', '34', '36', '38'] },
  { id: 'tsh-2', category: 'TSHIRTS', name: 'White Classic PT T-Shirt', defaultPrice: 399, availableSizes: ['26', '28', '30', '32', '34', '36', '38'] },

  // Socks
  { id: 'sck-1', category: 'SOCKS', name: 'School Uniform Socks (2 Pairs)', defaultPrice: 199, availableSizes: ['Small', 'Medium', 'Large'] },

  // Bags
  { id: 'bag-1', category: 'BAGS', name: 'Ergonomic Institutional Backpack', defaultPrice: 850, availableSizes: ['Junior 16L', 'Standard 24L', 'Senior 32L'] },
];

export const convertAdminProductsToPresets = (products: AdminProduct[]): CatalogPreset[] => {
  const dynamicPresets: CatalogPreset[] = products
    .filter(p => p.isActive !== false)
    .map(p => ({
      id: p.id,
      productId: p.id,
      category: mapToSchoolCategory(p.category),
      name: p.name,
      defaultPrice: p.basePrice || 0,
      availableSizes: p.sizes && p.sizes.length > 0
        ? p.sizes.map(s => s.ukSize)
        : ['1', '2', '3', '4', '5'],
    }));

  // Merge dynamic products first, then fallback presets whose names aren't already present
  const existingNames = new Set(dynamicPresets.map(d => d.name.toLowerCase()));
  const merged = [...dynamicPresets];
  for (const fallback of CATALOG_PRESETS) {
    if (!existingNames.has(fallback.name.toLowerCase())) {
      merged.push(fallback);
    }
  }
  return merged;
};

export interface OrderItemDraft {
  id: string;
  productId?: string;
  category: SchoolProductCategory;
  productName: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  itemNotes: string;
}

interface SchoolOrderModalProps {
  schoolId: string;
  schoolName: string;
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: StudentOrder) => void;
}

export const SchoolOrderModal: React.FC<SchoolOrderModalProps> = ({
  schoolId,
  schoolName,
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [catalogItems, setCatalogItems] = useState<CatalogPreset[]>(CATALOG_PRESETS);
  const [selectedCategory, setSelectedCategory] = useState<SchoolProductCategory>('SHOES');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CATALOG_PRESETS[0].id);
  const [productNameInput, setProductNameInput] = useState<string>(CATALOG_PRESETS[0].name);
  const [selectedSize, setSelectedSize] = useState<string>(CATALOG_PRESETS[0].availableSizes[0]);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(CATALOG_PRESETS[0].defaultPrice);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Basket of items
  const [basket, setBasket] = useState<OrderItemDraft[]>([]);

  // Order Details
  const [status, setStatus] = useState<SchoolOrderStatus>('CONFIRMED');
  const [stockPolicy, setStockPolicy] = useState<SchoolOrderStockPolicy>('BOOKING_ONLY');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderNotes, setOrderNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    adminApi.getProducts({ catalogType: 'SCHOOL_ORDER', size: 200 })
      .then(res => {
        const merged = convertAdminProductsToPresets(res.data.content || []);
        setCatalogItems(merged);
        const shoes = merged.filter(p => p.category === 'SHOES');
        const first = shoes[0] || merged[0];
        if (first) {
          setSelectedCategory(first.category);
          setSelectedPresetId(first.id);
          setProductNameInput(first.name);
          setSelectedSize(first.availableSizes[0] || '3');
          setItemPrice(first.defaultPrice);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPresets = catalogItems.filter(p => p.category === selectedCategory);
  const activePreset = currentPresets.find(p => p.id === selectedPresetId) || currentPresets[0];

  const handleCategoryTab = (cat: SchoolProductCategory) => {
    setSelectedCategory(cat);
    const presetsForCat = catalogItems.filter(p => p.category === cat);
    if (presetsForCat.length > 0) {
      setSelectedPresetId(presetsForCat[0].id);
      setProductNameInput(presetsForCat[0].name);
      setSelectedSize(presetsForCat[0].availableSizes[0] || 'Standard');
      setItemPrice(presetsForCat[0].defaultPrice);
    } else {
      setSelectedPresetId('');
      setProductNameInput('');
      setSelectedSize('');
    }
  };

  const handlePresetSelect = (preset: CatalogPreset) => {
    setSelectedPresetId(preset.id);
    setProductNameInput(preset.name);
    setSelectedSize(preset.availableSizes[0] || 'Standard');
    setItemPrice(preset.defaultPrice);
  };

  const handleAddItemToBasket = () => {
    const finalName = productNameInput.trim() || activePreset?.name || '';
    const finalSize = selectedSize.trim();

    if (!finalName) {
      setErrorMsg('Please enter or select a product name');
      return;
    }
    if (!finalSize) {
      setErrorMsg('Please select or type a size');
      return;
    }

    const newItem: OrderItemDraft = {
      id: 'draft-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      productId: activePreset?.name === finalName ? activePreset?.productId : undefined,
      category: selectedCategory,
      productName: finalName,
      sizeLabel: finalSize,
      quantity: itemQuantity,
      unitPrice: Number(itemPrice) || 0,
      itemNotes: itemNotes.trim(),
    };

    setBasket([...basket, newItem]);
    setItemNotes('');
    setItemQuantity(1);
    setErrorMsg('');
  };

  const handleRemoveItem = (id: string) => {
    setBasket(basket.filter(i => i.id !== id));
  };

  const handleUpdateItemQty = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setBasket(basket.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const totalQuantity = basket.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = basket.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);

  const handleSubmitOrder = async () => {
    if (basket.length === 0) {
      setErrorMsg('Please add at least one product item to the order');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        schoolId,
        studentId: student.id,
        status,
        stockPolicy,
        visitDate,
        notes: orderNotes.trim(),
        items: basket.map(i => ({
          productId: i.productId,
          category: i.category,
          productName: i.productName,
          sizeLabel: i.sizeLabel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          itemNotes: i.itemNotes,
        }))
      };

      const res = await schoolOrderApi.createOrder(payload);
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to place school visit order.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (cat: SchoolProductCategory) => {
    switch (cat) {
      case 'SHOES': return 'bg-blue-600 text-white';
      case 'SHIRTS': return 'bg-sky-600 text-white';
      case 'PANTS': return 'bg-indigo-600 text-white';
      case 'SHORTS': return 'bg-teal-600 text-white';
      case 'TSHIRTS': return 'bg-amber-600 text-white';
      case 'SOCKS': return 'bg-purple-600 text-white';
      case 'BAGS': return 'bg-rose-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-4xl shadow-2xl rounded-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> No Payment Required
              </span>
              <span className="text-xs text-muted-foreground">{schoolName}</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2 mt-0.5">
              <span>Place Order for</span>
              <span className="text-primary underline decoration-primary/40 underline-offset-4">{student.fullName}</span>
              <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                Adm: {student.admissionNumber} ({student.gradeClass}{student.section ? `-${student.section}` : ''})
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {errorMsg && (
            <div className="p-3 rounded-lg text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Configuration Strip (Policy & Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-muted/30 border border-border rounded-xl text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Stock Policy *
              </label>
              <select
                value={stockPolicy}
                onChange={(e) => setStockPolicy(e.target.value as SchoolOrderStockPolicy)}
                className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="BOOKING_ONLY">Booking Only (Demand Track)</option>
                <option value="RESERVE_STOCK">Reserve Physical Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Order Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SchoolOrderStatus)}
                className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="DRAFT">Draft</option>
                <option value="PROCESSING">Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Visit / Measurement Date
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 font-semibold text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Section: Product Item Picker */}
          <div className="border border-border rounded-2xl p-4 md:p-5 bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">School Order Products</span>
                <h3 className="text-sm font-bold text-foreground">Select from School Products or Type Directly</h3>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(['SHOES', 'SHIRTS', 'PANTS', 'SHORTS', 'TSHIRTS', 'SOCKS', 'BAGS'] as SchoolProductCategory[]).map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryTab(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 ${
                      isActive
                        ? getCategoryColor(cat) + ' shadow-xs scale-[1.02]'
                        : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Product selection cards */}
            {currentPresets.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Available {selectedCategory} in School Catalogue (Click to select)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {currentPresets.map((preset) => {
                    const isSelected = activePreset?.id === preset.id && productNameInput === preset.name;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border bg-background hover:border-foreground/30'
                        }`}
                      >
                        <div className="text-xs font-bold text-foreground line-clamp-1">{preset.name}</div>
                        <div className="text-[11px] font-mono font-semibold text-primary mt-1">₹{preset.defaultPrice}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Size Selector Pills */}
            {activePreset && activePreset.availableSizes.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Quick Select Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activePreset.availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                          isSelected
                            ? 'bg-foreground text-background shadow-xs ring-2 ring-primary ring-offset-1'
                            : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Input Fields for Product Name, Size, Quantity, Price, Notes */}
            <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="Type or select product name"
                  value={productNameInput}
                  onChange={(e) => setProductNameInput(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Size *</label>
                <input
                  type="text"
                  placeholder="e.g. 5, 32"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Quantity Stepper */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Unit Price */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={itemPrice}
                  onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Add to Order Button */}
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItemToBasket}
                  className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Order Basket (Items Added) */}
          <div className="border border-border rounded-2xl p-4 md:p-5 bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Order Items ({basket.length} {basket.length === 1 ? 'item' : 'items'}, {totalQuantity} units)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-primary">
                Subtotal: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {basket.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                No items added yet. Select or type a product above and click "+ Add Item".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Size</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                      <th className="py-2 px-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {basket.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="py-2 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-foreground">
                          {item.productName}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-foreground">
                          {item.sizeLabel}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex items-center border border-border rounded bg-background">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.id, item.quantity - 1)}
                              className="px-1.5 py-0.5 text-xs hover:bg-muted"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.id, item.quantity + 1)}
                              className="px-1.5 py-0.5 text-xs hover:bg-muted"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                          ₹{(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Overall Order Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Order Remarks / Special Delivery Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Delivered with batch 1 during next Tuesday visit"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

        </div>

        {/* Footer with totals and action buttons */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground uppercase text-[10px] block font-bold">Total Items</span>
              <span className="text-sm font-bold text-foreground">{totalQuantity} units</span>
            </div>
            <div className="border-l border-border pl-4">
              <span className="text-muted-foreground uppercase text-[10px] block font-bold">Estimated Total</span>
              <span className="text-base font-black text-primary font-mono">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-none px-4 py-2 border border-border text-foreground hover:bg-muted text-xs font-bold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={submitting || basket.length === 0}
              className="flex-1 sm:flex-none px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Order (No Payment)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

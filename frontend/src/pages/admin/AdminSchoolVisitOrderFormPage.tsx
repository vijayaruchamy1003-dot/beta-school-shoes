import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { adminApi, schoolApi, studentApi, schoolOrderApi } from '../../api/client';
import { School, Student, SchoolProductCategory, SchoolOrderStatus, SchoolOrderStockPolicy } from '../../types';
import { CATALOG_PRESETS, CatalogPreset, convertAdminProductsToPresets } from '../../components/admin/SchoolOrderModal';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  UserPlus, 
  ShieldCheck, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

interface ItemEntry {
  id: string;
  productId?: string;
  category: SchoolProductCategory;
  productName: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  itemNotes: string;
}

export const AdminSchoolVisitOrderFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSchoolId = searchParams.get('schoolId') || '';
  const initialStudentId = searchParams.get('studentId') || '';

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(initialSchoolId);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);

  // New Student on-the-fly toggle
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    gradeClass: 'Class 5',
    section: 'A',
    parentName: '',
    parentPhone: '',
    gender: 'MALE',
  });

  // Order Details
  const [status, setStatus] = useState<SchoolOrderStatus>('CONFIRMED');
  const [stockPolicy, setStockPolicy] = useState<SchoolOrderStockPolicy>('BOOKING_ONLY');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderNotes, setOrderNotes] = useState('');

  // Dynamic School Order Products
  const [catalogItems, setCatalogItems] = useState<CatalogPreset[]>(CATALOG_PRESETS);
  const [selectedCategory, setSelectedCategory] = useState<SchoolProductCategory>('SHOES');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CATALOG_PRESETS[0].id);
  const [productNameInput, setProductNameInput] = useState<string>(CATALOG_PRESETS[0].name);
  const [selectedSize, setSelectedSize] = useState<string>(CATALOG_PRESETS[0].availableSizes[0]);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(CATALOG_PRESETS[0].defaultPrice);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Items in Order Basket
  const [basket, setBasket] = useState<ItemEntry[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Fetch all schools and School Order Products
  useEffect(() => {
    schoolApi.getSchools({ size: 100 }).then(res => {
      setSchools(res.data.content);
      if (!selectedSchoolId && res.data.content.length > 0) {
        setSelectedSchoolId(res.data.content[0].id);
      }
    });

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
  }, []);

  // Fetch students when school changes
  useEffect(() => {
    if (selectedSchoolId) {
      studentApi.getStudents(selectedSchoolId, { size: 100 }).then(res => {
        setStudents(res.data.content);
        if (initialStudentId && res.data.content.some(s => s.id === initialStudentId)) {
          setSelectedStudentId(initialStudentId);
        } else if (res.data.content.length > 0 && !isNewStudent) {
          setSelectedStudentId(res.data.content[0].id);
        }
      });
    }
  }, [selectedSchoolId]);

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
    const productName = productNameInput.trim() || activePreset?.name || '';
    const sizeLabel = selectedSize.trim();

    if (!productName) {
      setErrorMsg('Please select or type a product name');
      return;
    }
    if (!sizeLabel) {
      setErrorMsg('Please select or type a size');
      return;
    }

    const newItem: ItemEntry = {
      id: 'draft-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      productId: activePreset?.name === productName ? activePreset?.productId : undefined,
      category: selectedCategory,
      productName,
      sizeLabel,
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

  const handleSubmit = async (e: React.FormEvent, recordNextStudent: boolean = false) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (!selectedSchoolId) {
      setErrorMsg('Please select a partner school.');
      return;
    }

    if (!isNewStudent && !selectedStudentId) {
      setErrorMsg('Please select an existing student or choose to enroll a new student.');
      return;
    }

    if (isNewStudent) {
      if (!newStudentData.admissionNumber.trim() || !newStudentData.firstName.trim()) {
        setErrorMsg('Please complete admission number and student name.');
        return;
      }
    }

    if (basket.length === 0) {
      setErrorMsg('Please add at least one product item to the order.');
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        schoolId: selectedSchoolId,
        studentId: isNewStudent ? undefined : selectedStudentId,
        newStudent: isNewStudent ? {
          schoolId: selectedSchoolId,
          admissionNumber: newStudentData.admissionNumber.trim().toUpperCase(),
          firstName: newStudentData.firstName.trim(),
          lastName: newStudentData.lastName.trim() || '.',
          gradeClass: newStudentData.gradeClass.trim(),
          section: newStudentData.section.trim(),
          parentName: newStudentData.parentName.trim() || undefined,
          parentPhone: newStudentData.parentPhone.trim() || undefined,
          gender: newStudentData.gender,
        } : undefined,
        status,
        stockPolicy,
        visitDate,
        notes: orderNotes,
        items: basket.map(item => ({
          productId: item.productId,
          category: item.category,
          productName: item.productName,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemNotes: item.itemNotes,
        }))
      };

      const res = await schoolOrderApi.createOrder(payload);
      setSuccessNotice(`Order ${res.data.orderNumber} successfully recorded for ${res.data.studentName}!`);

      if (recordNextStudent) {
        setIsNewStudent(false);
        setNewStudentData({
          admissionNumber: '',
          firstName: '',
          lastName: '',
          gradeClass: newStudentData.gradeClass,
          section: newStudentData.section,
          parentName: '',
          parentPhone: '',
          gender: 'MALE',
        });
        setBasket([]);
        studentApi.getStudents(selectedSchoolId, { size: 100 }).then(sRes => {
          setStudents(sRes.data.content);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setTimeout(() => {
          navigate(`/admin/schools/${selectedSchoolId}`);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record school visit order');
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <Link
          to={selectedSchoolId ? `/admin/schools/${selectedSchoolId}` : '/admin/schools'}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to School View</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> No Payment Required
              </span>
              <span className="text-xs text-muted-foreground">Campus Institutional Sizing Session</span>
            </div>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-foreground">
              Record School Visit Order
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Record student uniform and footwear measurements directly during school visits. Products added in Products &rarr; School Order Products appear here automatically.
            </p>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="border border-emerald-500/40 bg-emerald-500/10 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 rounded-xl text-xs font-bold text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: 8 Cols */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Partner School */}
            <div className="border border-border bg-card rounded-2xl p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>1. Select Partner School</span>
              </h2>

              <div>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  {schools.map(sch => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({sch.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Student Information */}
            <div className="border border-border bg-card rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  <span>2. Student Information</span>
                </h2>

                <button
                  type="button"
                  onClick={() => setIsNewStudent(!isNewStudent)}
                  className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  {isNewStudent ? '← Choose Existing Student' : '+ Enroll New Student on the Fly'}
                </button>
              </div>

              {isNewStudent ? (
                <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                    Quick Student Registration:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-bold uppercase text-[10px] text-muted-foreground">Admission ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ADM-2026-088"
                        value={newStudentData.admissionNumber}
                        onChange={e => setNewStudentData({ ...newStudentData, admissionNumber: e.target.value })}
                        className="w-full border border-input rounded-lg bg-background p-2 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-bold uppercase text-[10px] text-muted-foreground">Gender</label>
                      <select
                        value={newStudentData.gender}
                        onChange={e => setNewStudentData({ ...newStudentData, gender: e.target.value })}
                        className="w-full border border-input rounded-lg bg-background p-2 font-bold"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-bold uppercase text-[10px] text-muted-foreground">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Student first name"
                        value={newStudentData.firstName}
                        onChange={e => setNewStudentData({ ...newStudentData, firstName: e.target.value })}
                        className="w-full border border-input rounded-lg bg-background p-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-bold uppercase text-[10px] text-muted-foreground">Last Name</label>
                      <input
                        type="text"
                        placeholder="Student last name"
                        value={newStudentData.lastName}
                        onChange={e => setNewStudentData({ ...newStudentData, lastName: e.target.value })}
                        className="w-full border border-input rounded-lg bg-background p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-bold uppercase text-[10px] text-muted-foreground">Class / Grade *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Class 5"
                        value={newStudentData.gradeClass}
                        onChange={e => setNewStudentData({ ...newStudentData, gradeClass: e.target.value })}
                        className="w-full border border-input rounded-lg bg-background p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-bold uppercase text-[10px] text-muted-foreground">Section</label>
                      <input
                        type="text"
                        placeholder="e.g. A"
                        value={newStudentData.section}
                        onChange={e => setNewStudentData({ ...newStudentData, section: e.target.value })}
                        className="w-full border border-input rounded-lg bg-background p-2 uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Select Enrolled Student *
                  </label>
                  {students.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">
                      No students registered for this school yet. Click "+ Enroll New Student" above to add one.
                    </p>
                  ) : (
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full border border-input bg-background rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.admissionNumber} — {s.fullName} ({s.gradeClass}{s.section ? `-${s.section}` : ''})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Product Quick-Picker */}
            <div className="border border-border bg-card rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">School Order Products</span>
                  <h3 className="text-sm font-bold text-foreground">3. Select Uniform &amp; Footwear Items</h3>
                </div>
                <Link
                  to="/admin/products"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Manage School Order Products
                </Link>
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

              {/* Presets Grid */}
              {currentPresets.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Select {selectedCategory} Product
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

              {/* Size Selector Pills */}
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

              {/* Direct Inputs for Product Name, Size, Quantity, Price & Add Button */}
              <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Product Name *</label>
                  <input
                    type="text"
                    placeholder="Type or select product"
                    value={productNameInput}
                    onChange={(e) => setProductNameInput(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Size *</label>
                  <input
                    type="text"
                    placeholder="Size"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

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

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-background border border-input rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

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

            {/* Order Basket */}
            <div className="border border-border bg-card rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Order Requirements Basket ({basket.length} {basket.length === 1 ? 'item' : 'items'}, {totalQuantity} units)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-primary">
                  Subtotal: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {basket.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  No items added yet. Pick a product above and click "+ Add Item".
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

          </div>

          {/* Right Column: 4 Cols (Order Config & Action Buttons) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-border bg-card rounded-2xl p-5 shadow-xs space-y-4 text-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border pb-3">
                Order Configuration
              </h2>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">
                  School Visit Date
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full border border-input rounded-lg bg-background p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SchoolOrderStatus)}
                  className="w-full border border-input rounded-lg bg-background p-2 font-bold uppercase text-xs"
                >
                  <option value="CONFIRMED">CONFIRMED (Active Booking)</option>
                  <option value="DRAFT">DRAFT (Fitting Notes / Proposal)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">
                  Inventory Stock Policy
                </label>
                <select
                  value={stockPolicy}
                  onChange={(e) => setStockPolicy(e.target.value as SchoolOrderStockPolicy)}
                  className="w-full border border-input rounded-lg bg-background p-2 font-bold text-xs"
                >
                  <option value="BOOKING_ONLY">Booking Only (Demand Track)</option>
                  <option value="RESERVE_STOCK">Reserve Physical Stock</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-wider text-muted-foreground">
                  Order Notes / Delivery Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deliver before term starts, sizing verified by principal"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full border border-input rounded-lg bg-background p-2 text-xs"
                />
              </div>

              {/* Order Summary Card */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Units:</span>
                  <span className="font-bold text-foreground">{totalQuantity}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-sm">
                  <span className="font-bold text-foreground">Estimated Total:</span>
                  <span className="font-black text-primary font-mono">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting || basket.length === 0}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submitting ? 'Saving Order...' : 'Confirm & Save Order'}</span>
                </button>

                <button
                  type="button"
                  disabled={submitting || basket.length === 0}
                  onClick={(e) => handleSubmit(e, true)}
                  className="w-full py-2.5 border border-primary text-primary hover:bg-primary/10 text-xs font-bold uppercase tracking-wider rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Save &amp; Record Next Student</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

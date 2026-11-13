import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { schoolApi, studentApi } from '../../api/client';
import { School, SchoolSummary, Student, StudentOrder } from '../../types';
import { 
  Building2, 
  ArrowLeft, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  Users, 
  ClipboardList, 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  X, 
  AlertCircle,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { SchoolOrderModal } from '../../components/admin/SchoolOrderModal';
import { SchoolOrderExcelImportModal, downloadSimpleSchoolOrderTemplate } from '../../components/admin/SchoolOrderExcelImportModal';

export const AdminSchoolDashboardPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();

  const [school, setSchool] = useState<School | null>(null);
  const [summary, setSummary] = useState<SchoolSummary | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [showSizeBreakdown, setShowSizeBreakdown] = useState(false);

  // Expandable Student Rows with their orders
  const [expandedStudentIds, setExpandedStudentIds] = useState<Set<string>>(new Set());
  const [studentOrdersMap, setStudentOrdersMap] = useState<Record<string, StudentOrder[]>>({});
  const [loadingOrdersStudentId, setLoadingOrdersStudentId] = useState<string | null>(null);

  // Student Create / Edit Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormData, setStudentFormData] = useState({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    gradeClass: '',
    section: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    gender: 'MALE',
    isActive: true,
  });
  const [studentFormError, setStudentFormError] = useState('');
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Order Placement Modal State
  const [orderingStudent, setOrderingStudent] = useState<Student | null>(null);
  const [orderToast, setOrderToast] = useState<string | null>(null);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);

  const handleOrderSuccess = async (createdOrder: StudentOrder) => {
    setOrderToast(`Order ${createdOrder.orderNumber} successfully recorded! Live category cards updated.`);
    setTimeout(() => setOrderToast(null), 5000);

    // Refresh school live category totals
    if (schoolId) {
      try {
        const summaryRes = await schoolApi.getSchoolSummary(schoolId);
        setSummary(summaryRes.data);
      } catch (err) {
        console.error('Failed to reload school summary', err);
      }
    }

    // Refresh students list to reflect updated order counter
    await fetchStudents();

    // Refresh this student's nested product orders and expand row
    if (orderingStudent) {
      try {
        const ordersRes = await studentApi.getStudentOrders(orderingStudent.id);
        setStudentOrdersMap(prev => ({ ...prev, [orderingStudent.id]: ordersRes.data }));
        setExpandedStudentIds(prev => new Set(prev).add(orderingStudent.id));
      } catch (err) {
        console.error('Failed to reload student orders', err);
      }
    }
  };

  const loadData = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const [schoolRes, summaryRes, classesRes, sectionsRes] = await Promise.all([
        schoolApi.getSchool(schoolId),
        schoolApi.getSchoolSummary(schoolId),
        studentApi.getSchoolClasses(schoolId),
        studentApi.getSchoolSections(schoolId),
      ]);
      setSchool(schoolRes.data);
      setSummary(summaryRes.data);
      setClasses(classesRes.data);
      setSections(sectionsRes.data);

      await fetchStudents();
    } catch (err) {
      console.error('Failed to load school dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!schoolId) return;
    try {
      const res = await studentApi.getStudents(schoolId, {
        search: search.trim() || undefined,
        gradeClass: selectedClass === 'ALL' ? undefined : selectedClass,
        section: selectedSection === 'ALL' ? undefined : selectedSection,
        size: 50,
      });
      setStudents(res.data.content);
    } catch (err) {
      console.error('Failed to search students', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId]);

  useEffect(() => {
    if (!loading) {
      fetchStudents();
    }
  }, [search, selectedClass, selectedSection]);

  const toggleStudentExpand = async (studentId: string) => {
    const newSet = new Set(expandedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
      setExpandedStudentIds(newSet);
    } else {
      newSet.add(studentId);
      setExpandedStudentIds(newSet);

      // Fetch student orders if not loaded
      if (!studentOrdersMap[studentId]) {
        try {
          setLoadingOrdersStudentId(studentId);
          const res = await studentApi.getStudentOrders(studentId);
          setStudentOrdersMap(prev => ({ ...prev, [studentId]: res.data }));
        } catch (err) {
          console.error('Failed to fetch student orders', err);
        } finally {
          setLoadingOrdersStudentId(null);
        }
      }
    }
  };

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormData({
      admissionNumber: '',
      firstName: '',
      lastName: '',
      gradeClass: classes.length > 0 ? classes[0] : 'Class 1',
      section: 'A',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      gender: 'MALE',
      isActive: true,
    });
    setStudentFormError('');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormData({
      admissionNumber: student.admissionNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      gradeClass: student.gradeClass,
      section: student.section || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '',
      gender: student.gender || 'MALE',
      isActive: student.isActive,
    });
    setStudentFormError('');
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    try {
      setSubmittingStudent(true);
      setStudentFormError('');
      if (editingStudent) {
        await studentApi.updateStudent(editingStudent.id, {
          ...studentFormData,
          schoolId,
        });
      } else {
        await studentApi.createStudent({
          ...studentFormData,
          schoolId,
        });
      }
      setIsStudentModalOpen(false);
      await loadData();
    } catch (err: any) {
      setStudentFormError(err.response?.data?.message || 'Failed to save student record');
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleExportCsv = async () => {
    if (!school) return;
    try {
      const res = await schoolApi.exportOrdersCsv(school.id);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${school.code}-student-orders-report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export orders CSV.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !school) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Loading school dashboard...
        </p>
      </div>
    );
  }

  // Categories config for the 7 required summary cards:
  // shoes, shirts, pants, shorts, T-shirts, socks and bags
  const categoryCards = [
    { label: 'Shoes', key: 'shoesCount', count: summary?.shoesCount ?? 0, icon: '👟' },
    { label: 'Shirts', key: 'shirtsCount', count: summary?.shirtsCount ?? 0, icon: '👔' },
    { label: 'Pants', key: 'pantsCount', count: summary?.pantsCount ?? 0, icon: '👖' },
    { label: 'Shorts', key: 'shortsCount', count: summary?.shortsCount ?? 0, icon: '🩳' },
    { label: 'T-Shirts', key: 'tshirtsCount', count: summary?.tshirtsCount ?? 0, icon: '👕' },
    { label: 'Socks', key: 'socksCount', count: summary?.socksCount ?? 0, icon: '🧦' },
    { label: 'Bags', key: 'bagsCount', count: summary?.bagsCount ?? 0, icon: '🎒' },
  ];

  return (
    <div className="space-y-8 print:p-0">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/15 pb-6 print:hidden">
        <div className="space-y-1">
          <Link
            to="/admin/schools"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Partner Schools</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">
              {school.name}
            </h1>
            <span className="font-mono text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 uppercase tracking-wider">
              {school.code}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {school.address}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {school.contactPerson}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {school.phone}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {school.email}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExcelImportOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 font-display text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel Orders</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSimpleSchoolOrderTemplate(school.code)}
            className="inline-flex items-center gap-2 border border-emerald-600/40 bg-emerald-50/60 text-emerald-900 px-3.5 py-3 font-display text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
            title="Download Simple Excel / CSV Template"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Excel Template</span>
          </button>

          <Link
            to={`/admin/school-visit-orders/new?schoolId=${school.id}`}
            className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:paper-shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Visit Order</span>
          </Link>

          <button
            onClick={handleOpenAddStudent}
            className="inline-flex items-center gap-2 border border-foreground/30 bg-card px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-foreground hover:border-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="p-3 border border-foreground/25 hover:border-foreground text-foreground transition-colors"
            title="Download CSV Orders Report"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-3 border border-foreground/25 hover:border-foreground text-foreground transition-colors"
            title="Print School Order Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block border-b border-black pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase">{school.name} ({school.code})</h1>
        <p className="text-xs text-gray-600">Institutional School Orders &amp; Product Demand Report · Shoes Net</p>
        <p className="text-xs mt-1">Contact: {school.contactPerson} | Phone: {school.phone} | Address: {school.address}</p>
      </div>

      {/* Order Success Toast Notification */}
      {orderToast && (
        <div className="p-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{orderToast}</span>
          </div>
          <button onClick={() => setOrderToast(null)} className="text-xs underline ml-2">Dismiss</button>
        </div>
      )}

      {/* 1. Category Summary Cards (Requirement: summary cards showing total quantities booked by product category: shoes, shirts, pants, shorts, T-shirts, socks and bags) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">
              Booked Quantities by Category
            </h2>
            <p className="text-xs text-muted-foreground">
              Total demand aggregated from confirmed and draft student order items ({summary?.totalItemsBooked ?? 0} total units booked).
            </p>
          </div>

          <button
            onClick={() => setShowSizeBreakdown(!showSizeBreakdown)}
            className="text-xs font-bold uppercase tracking-wider text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors print:hidden"
          >
            {showSizeBreakdown ? 'Hide Size Matrix' : 'View Size-Wise Breakdown →'}
          </button>
        </div>

        {/* 7 Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categoryCards.map((card) => (
            <div
              key={card.label}
              className="paper-shadow-sm border border-foreground/15 bg-card p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em]">
                  {card.label}
                </span>
                <span className="text-lg">{card.icon}</span>
              </div>
              <div>
                <span className="font-display text-3xl font-black text-foreground">
                  {card.count}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-0.5">
                  Units Booked
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Size-wise Detailed Breakdown Matrix */}
        {showSizeBreakdown && summary && summary.categorySizeBreakdown.length > 0 && (
          <div className="paper-shadow border border-foreground/15 bg-card p-6 space-y-4">
            <h3 className="font-display text-base font-bold uppercase tracking-tight">
              Detailed Size & Category Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {summary.categorySizeBreakdown.map((item, idx) => (
                <div key={idx} className="border border-foreground/15 p-3 bg-background/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    {item.category}
                  </span>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs">{item.sizeLabel}</span>
                    <span className="font-display font-black text-base text-foreground">{item.quantity} Qty</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Searchable Student Grid with Expandable Nested Order Items */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight">
              Student Order Grid
            </h2>
            <p className="text-xs text-muted-foreground">
              Search by student, filter by class/section, and click rows to expand product orders.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            {/* Search */}
            <div className="flex items-center gap-2 border border-foreground/25 bg-background px-3 py-1.5 text-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search student or admission ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none placeholder:text-muted-foreground w-44"
              />
            </div>

            {/* Class filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-foreground/25 bg-transparent px-2.5 py-1.5 text-xs font-bold uppercase outline-none focus:border-foreground"
              >
                <option value="ALL">All Classes</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">Sec:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="border border-foreground/25 bg-transparent px-2.5 py-1.5 text-xs font-bold uppercase outline-none focus:border-foreground"
              >
                <option value="ALL">All</option>
                {sections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        {students.length === 0 ? (
          <div className="paper-shadow border border-foreground/15 bg-card p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg font-bold uppercase tracking-tight">No students found</h3>
            <p className="text-xs text-muted-foreground">Click "Add Student" above to enroll students for this institution.</p>
          </div>
        ) : (
          <div className="paper-shadow border border-foreground/15 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-foreground/15 bg-secondary/50 font-display uppercase tracking-[0.16em] text-foreground">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">Admission ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class & Section</th>
                    <th className="p-3">Parent Contact</th>
                    <th className="p-3 text-center">Orders Placed</th>
                    <th className="p-3 text-right print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  {students.map((student) => {
                    const isExpanded = expandedStudentIds.has(student.id);
                    const orders = studentOrdersMap[student.id] || [];
                    const isLoadingOrders = loadingOrdersStudentId === student.id;

                    return (
                      <React.Fragment key={student.id}>
                        {/* Parent Student Row */}
                        <tr
                          onClick={() => toggleStudentExpand(student.id)}
                          className={`cursor-pointer transition-colors ${isExpanded ? 'bg-secondary/40 font-semibold' : 'hover:bg-secondary/20'}`}
                        >
                          <td className="p-3 text-center text-muted-foreground">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </td>

                          <td className="p-3 font-mono font-bold uppercase text-foreground">
                            {student.admissionNumber}
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-foreground text-sm block">
                              {student.fullName}
                            </span>
                            {student.gender && (
                              <span className="text-[10px] text-muted-foreground uppercase">{student.gender}</span>
                            )}
                          </td>

                          <td className="p-3">
                            <span className="bg-primary-foreground text-primary border border-primary/20 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                              {student.gradeClass}{student.section ? ` - ${student.section}` : ''}
                            </span>
                          </td>

                          <td className="p-3 space-y-0.5">
                            <p className="text-foreground">{student.parentName || 'Parent / Guardian'}</p>
                            <p className="text-muted-foreground font-mono text-[11px]">{student.parentPhone || '—'}</p>
                          </td>

                          <td className="p-3 text-center font-display font-bold">
                            <span className="inline-flex items-center gap-1">
                              <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                              {student.ordersCount}
                            </span>
                          </td>

                          <td className="p-3 text-right space-x-2 print:hidden" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setOrderingStudent(student)}
                              className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:opacity-90 rounded-lg shadow-xs transition"
                              title="Place Order for Student"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Place Order</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditStudent(student)}
                              className="p-1.5 border border-foreground/20 hover:border-foreground text-foreground rounded-lg transition"
                              title="Edit Student Information"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>

                        {/* Nested Product Grid (Expanded Row) */}
                        {isExpanded && (
                          <tr className="bg-background/80">
                            <td colSpan={7} className="p-5 border-y border-foreground/15 space-y-3">
                              <div className="flex items-center justify-between border-b border-foreground/15 pb-2">
                                <h4 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-foreground flex items-center gap-2">
                                  <PackageCheck className="w-4 h-4 text-primary" />
                                  <span>Product Requirements & Orders for {student.fullName}</span>
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setOrderingStudent(student)}
                                  className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-md"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Place New Order for this Student</span>
                                </button>
                              </div>

                              {isLoadingOrders ? (
                                <p className="text-xs text-muted-foreground py-4">Loading student order items...</p>
                              ) : orders.length === 0 ? (
                                <div className="py-4 text-center space-y-2">
                                  <p className="text-xs text-muted-foreground">
                                    No product requirements recorded yet for {student.fullName}.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setOrderingStudent(student)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition shadow-xs"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Place First Order Item</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {orders.map((ord) => (
                                    <div key={ord.id} className="border border-foreground/15 bg-card p-4 space-y-3">
                                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-foreground/10 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold">{ord.orderNumber}</span>
                                          <span className="bg-primary text-primary-foreground px-1.5 py-0.5 text-[10px] font-bold uppercase">
                                            {ord.status}
                                          </span>
                                          <span className="text-muted-foreground">
                                            Policy: <strong>{ord.stockPolicy}</strong>
                                          </span>
                                        </div>
                                        <div className="text-right font-display">
                                          <span className="text-muted-foreground mr-2">Visit Date: {ord.visitDate}</span>
                                          <span className="font-bold">Total: ₹{Number(ord.estimatedTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                      </div>

                                      {/* Order Items Nested Table */}
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="text-muted-foreground uppercase text-[10px] border-b border-foreground/10">
                                            <th className="py-1 text-left">Category</th>
                                            <th className="py-1 text-left">Product</th>
                                            <th className="py-1 text-left">Size</th>
                                            <th className="py-1 text-center">Qty</th>
                                            <th className="py-1 text-right">Unit Price</th>
                                            <th className="py-1 text-right">Subtotal</th>
                                            <th className="py-1 text-left pl-3">Notes</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-foreground/5">
                                          {ord.items.map((item) => (
                                            <tr key={item.id}>
                                              <td className="py-1.5 font-bold uppercase">{item.category}</td>
                                              <td className="py-1.5 text-foreground">{item.productName}</td>
                                              <td className="py-1.5 font-bold">{item.sizeLabel}</td>
                                              <td className="py-1.5 text-center font-display font-bold">{item.quantity}</td>
                                              <td className="py-1.5 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                                              <td className="py-1.5 text-right font-mono font-bold">₹{item.subtotal.toFixed(2)}</td>
                                              <td className="py-1.5 text-muted-foreground pl-3 text-[11px]">{item.itemNotes || '—'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Student Add / Edit Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg paper-shadow border border-foreground/20 bg-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-foreground/15 pb-4">
              <h2 className="font-display text-2xl font-black uppercase tracking-tight">
                {editingStudent ? 'Edit Student Details' : 'Enroll Student'}
              </h2>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentFormError && (
              <div className="border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{studentFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Admission / Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADM-2026-101"
                    value={studentFormData.admissionNumber}
                    onChange={(e) => setStudentFormData({ ...studentFormData, admissionNumber: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 font-mono uppercase outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Gender
                  </label>
                  <select
                    value={studentFormData.gender}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground font-bold uppercase"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Student first name"
                    value={studentFormData.firstName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Student last name"
                    value={studentFormData.lastName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Class / Grade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 5, Grade 7"
                    value={studentFormData.gradeClass}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gradeClass: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground font-bold"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A, B, C"
                    value={studentFormData.section}
                    onChange={(e) => setStudentFormData({ ...studentFormData, section: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 uppercase outline-none focus:border-foreground font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="Father / Mother name"
                    value={studentFormData.parentName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentName: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98450 12345"
                    value={studentFormData.parentPhone}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentPhone: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-foreground/15">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="border border-foreground/25 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider hover:bg-secondary/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStudent}
                  className="bg-primary px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:paper-shadow-sm disabled:opacity-60"
                >
                  {submittingStudent ? 'Saving...' : editingStudent ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Place Student Order Modal (Direct In-Dashboard Workflow) */}
      {orderingStudent && school && (
        <SchoolOrderModal
          schoolId={school.id}
          schoolName={school.name}
          student={orderingStudent}
          isOpen={!!orderingStudent}
          onClose={() => setOrderingStudent(null)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* Bulk Excel / CSV Import Modal */}
      {school && (
        <SchoolOrderExcelImportModal
          isOpen={isExcelImportOpen}
          onClose={() => setIsExcelImportOpen(false)}
          defaultSchoolId={school.id}
          defaultSchoolName={school.code}
          onSuccess={async (res) => {
            setOrderToast(
              `Imported ${res.ordersCreated} student orders (${res.totalItemsImported} items, ${res.newStudentsCreated} new students)!`
            );
            setTimeout(() => setOrderToast(null), 6000);
            setStudentOrdersMap({});
            await loadData();
          }}
        />
      )}
    </div>
  );
};

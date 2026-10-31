import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Building2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { schoolOrderApi, schoolApi } from '../../api/client';
import { StudentOrder, School, SchoolOrderStatus } from '../../types';

export const AdminSchoolVisitOrdersListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSchoolId = searchParams.get('schoolId') || '';

  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Expanded row state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Quick status update state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectedSchoolId, selectedStatus, page]);

  const fetchSchools = async () => {
    try {
      const res = await schoolApi.getSchools({ size: 100 });
      setSchools(res.data.content || []);
    } catch (err: any) {
      console.error('Failed to load schools', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        size: 15,
      };
      if (selectedSchoolId) params.schoolId = selectedSchoolId;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await schoolOrderApi.getAllOrders(params);
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load school visit orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: SchoolOrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setStatusMessage(null);
      await schoolOrderApi.updateOrderStatus(orderId, { status: newStatus });
      setStatusMessage({ type: 'success', text: `Order status updated to ${newStatus}` });
      fetchOrders();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update order status.'
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'SHOES': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'SHIRTS': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'PANTS': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'SHORTS': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'TSHIRTS': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'SOCKS': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'BAGS': return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800">
              No Payment Required
            </span>
            <span className="text-xs text-muted-foreground">Institutional On-Site Visits</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
            School Visit Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record, track, and manage student uniform and shoe requirements collected during on-site school visits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/school-visit-orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Record Visit Order
          </Link>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold">Institutional Workflow: </span>
          School-visit orders are recorded on behalf of students during campus sizing sessions. They operate without payment gateway authorization or credit card transactions, preserving clean institutional demand records. Stock is managed via configurable booking or physical reservation policies.
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-sm font-medium flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline ml-2">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* School filter */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Filter by School
            </label>
            <div className="relative">
              <select
                value={selectedSchoolId}
                onChange={(e) => {
                  setSelectedSchoolId(e.target.value);
                  setPage(0);
                }}
                className="w-full text-sm rounded-lg border border-input py-2 pl-3 pr-8 focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              >
                <option value="">All Schools ({schools.length})</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search query */}
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Search Orders / Students
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Order number, student name, admission ID, class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm rounded-lg border border-input py-2 pl-9 pr-3 focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Search Submit Button */}
          <div className="md:col-span-3 flex items-end gap-2">
            <button
              onClick={() => { setPage(0); fetchOrders(); }}
              className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={() => {
                setSelectedSchoolId('');
                setSelectedStatus('ALL');
                setSearchQuery('');
                setPage(0);
              }}
              className="px-3 py-2 border border-border text-foreground hover:bg-muted text-sm font-medium rounded-lg transition"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
          <span className="text-xs font-semibold text-muted-foreground mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'DRAFT', 'CONFIRMED', 'PROCESSING', 'FULFILLED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setPage(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedStatus === st
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Orders Recorded ({totalElements})
            </h2>
            <p className="text-xs text-muted-foreground">
              Click any order row to inspect full product categories, sizes, and requirements
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded border border-border transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm font-medium">Loading school visit orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-sm">{error}</p>
            <button onClick={fetchOrders} className="mt-2 text-xs underline">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No School Orders Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
              {searchQuery || selectedSchoolId || selectedStatus !== 'ALL'
                ? 'No orders match your filter criteria. Try resetting your search filters.'
                : 'No school visit orders have been recorded yet. Click below to start recording student measurements and uniform requirements.'}
            </p>
            <Link
              to="/admin/school-visit-orders/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> Record First Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Order / Date</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Products & Units</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Stock Policy</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const totalUnits = order.items.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        onClick={() => toggleExpand(order.id)}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          isExpanded ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-foreground">{order.orderNumber}</div>
                          <div className="text-[11px] text-muted-foreground font-sans">
                            {order.visitDate || new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/admin/schools/${order.schoolId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            {order.schoolName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">{order.studentName}</div>
                          <div className="text-xs text-muted-foreground font-mono">Adm: {order.admissionNumber}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground">
                            Class {order.gradeClass} {order.section ? `(${order.section})` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getCategoryBadgeClass(item.category)}`}
                              >
                                {item.category}: {item.quantity}x
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {order.items.length} product{order.items.length !== 1 ? 's' : ''} ({totalUnits} total units)
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          ₹{Number(order.estimatedTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          {order.stockPolicy === 'RESERVE_STOCK' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200" title="Warehouse physical stock reserved">
                              Reserved Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground border border-border" title="Demand tracking only; no physical stock deduction">
                              Booking Only
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as SchoolOrderStatus)}
                              className="text-xs font-semibold rounded border border-input py-1 pl-2 pr-6 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                              <option value="DRAFT">Draft</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="FULFILLED">Fulfilled</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted rounded transition"
                          >
                            {isExpanded ? (
                              <>
                                Less <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                Items <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order Items Detail View */}
                      {isExpanded && (
                        <tr className="bg-muted/20 border-b border-border">
                          <td colSpan={9} className="p-4 pl-12">
                            <div className="bg-card border border-border rounded-lg p-4 shadow-xs">
                              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Product Requirements for {order.studentName} ({order.admissionNumber})
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Recorded on visit: {order.visitDate} | Created by: {order.createdByName || 'Admin'}
                                  </p>
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                  {order.notes && <span className="italic mr-3">"{order.notes}"</span>}
                                  <span className="font-bold text-foreground">
                                    Total: ₹{Number(order.estimatedTotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                    <tr>
                                      <th className="py-2 px-3">Category</th>
                                      <th className="py-2 px-3">Product Name</th>
                                      <th className="py-2 px-3">Size</th>
                                      <th className="py-2 px-3 text-center">Quantity</th>
                                      <th className="py-2 px-3 text-right">Unit Price</th>
                                      <th className="py-2 px-3 text-right">Subtotal</th>
                                      <th className="py-2 px-3">Notes</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/40">
                                    {order.items.map((item) => (
                                      <tr key={item.id} className="hover:bg-muted/30">
                                        <td className="py-2 px-3">
                                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getCategoryBadgeClass(item.category)}`}>
                                            {item.category}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 font-medium text-foreground">
                                          {item.productName}
                                        </td>
                                        <td className="py-2 px-3 font-mono font-bold text-foreground">
                                          {item.sizeLabel}
                                        </td>
                                        <td className="py-2 px-3 text-center font-bold text-foreground">
                                          {item.quantity}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                                          ₹{Number(item.unitPrice).toFixed(2)}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                                          ₹{Number(item.subtotal).toFixed(2)}
                                        </td>
                                        <td className="py-2 px-3 text-muted-foreground italic">
                                          {item.itemNotes || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing page <span className="font-bold">{page + 1}</span> of{' '}
              <span className="font-bold">{totalPages}</span> ({totalElements} total orders)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-card border border-border rounded text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-card border border-border rounded text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

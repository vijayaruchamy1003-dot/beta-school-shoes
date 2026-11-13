import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/client';
import { DashboardSummary } from '../../types';
import { 
  Package, 
  ShoppingBag, 
  IndianRupee, 
  AlertTriangle, 
  HelpCircle, 
  ArrowUpRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSummary = () => {
    setLoading(true);
    setErrorMsg('');
    adminApi.getDashboardSummary()
      .then(res => setSummary(res.data))
      .catch(err => {
        console.error('Failed to load admin summary:', err);
        setErrorMsg(err.response?.data?.message || 'Could not connect to backend admin API');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-950 mx-auto"></div>
        <p className="mt-3 text-xs text-slate-500">Loading live executive metrics...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200 space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
        <h2 className="text-base font-bold text-navy-950">Unable to load dashboard data</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg}</p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 rounded-lg bg-navy-950 text-white text-xs font-bold hover:bg-navy-850 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600">Executive Overview</span>
          <h1 className="text-2xl font-black text-navy-950">Shoes Net Admin Dashboard</h1>
          <p className="text-xs text-slate-500">Operational metrics, inventory levels, and order fulfillment status.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 rounded-lg bg-navy-950 text-white text-xs font-bold hover:bg-navy-850 transition flex items-center gap-1.5"
          >
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-950 font-mono">
            ₹{Number(summary?.totalRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>From paid school orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-950 font-mono">
            {summary?.totalOrders ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">
            {summary?.paidOrders ?? 0} Paid • {summary?.pendingOrders ?? 0} Pending
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono">
            {summary?.lowStockAlertsCount ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">
            Sizes below reorder threshold
          </p>
        </div>

        {/* Bulk Enquiries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">School Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-navy-950 font-mono">
            {summary?.newBulkEnquiries ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">
            Pending review for quotations
          </p>
        </div>

      </div>

      {/* Low Stock Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-navy-950">Immediate Restocking Needed</h2>
            <p className="text-[11px] text-slate-500">Sizes with available stock at or below minimum threshold</p>
          </div>
          <Link to="/admin/inventory" className="text-xs font-bold text-navy-900 hover:underline flex items-center gap-1">
            <span>Manage All Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!summary?.lowStockItems || summary.lowStockItems.length === 0) ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <span>All shoe sizes currently have sufficient inventory buffers.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Shoe Size</th>
                  <th className="py-2.5">Total Physical</th>
                  <th className="py-2.5">Currently Reserved</th>
                  <th className="py-2.5">Available for Sale</th>
                  <th className="py-2.5">Threshold</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {summary.lowStockItems.slice(0, 6).map(item => (
                  <tr key={item.sizeId} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-navy-950">{item.ukSize}</td>
                    <td className="py-3 font-mono">{item.totalStock}</td>
                    <td className="py-3 font-mono text-amber-700">{item.reservedStock}</td>
                    <td className="py-3 font-mono font-bold text-red-600">{item.availableStock}</td>
                    <td className="py-3 font-mono text-slate-400">{item.lowStockThreshold}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

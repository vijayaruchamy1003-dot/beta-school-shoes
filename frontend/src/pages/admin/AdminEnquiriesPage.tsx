import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { BulkEnquiry } from '../../types';
import { Building2, Search, CheckCircle2, Clock } from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<BulkEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadEnquiries = () => {
    setLoading(true);
    adminApi.getBulkEnquiries({ status: statusFilter, size: 50 })
      .then(res => setEnquiries(res.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await adminApi.updateEnquiryStatus(id, { status: newStatus });
      setEnquiries(enquiries.map(e => e.id === id ? res.data : e));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update enquiry status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-950">Bulk School Uniform Enquiries</h1>
        <p className="text-xs text-slate-500">Review institutional school requests, prepare sample cases, and send formal quotations.</p>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-navy-950"
        >
          <option value="">All Enquiries</option>
          <option value="NEW">New (Unreviewed)</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="QUOTATION_SENT">Quotation Sent</option>
          <option value="CONVERTED">Converted to Order</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-950 mx-auto"></div>
          </div>
        ) : enquiries.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">No bulk school enquiries found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {enquiries.map(enquiry => (
              <div key={enquiry.id} className="p-5 space-y-3 hover:bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-navy-950">{enquiry.schoolName}</h3>
                    <p className="text-xs text-slate-500">
                      {enquiry.contactPerson} • {enquiry.phone} • {enquiry.email} • {enquiry.cityState}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Status:</span>
                    <select
                      value={enquiry.status}
                      disabled={updatingId === enquiry.id}
                      onChange={e => handleStatusChange(enquiry.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 bg-white"
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_REVIEW">IN REVIEW</option>
                      <option value="QUOTATION_SENT">QUOTATION SENT</option>
                      <option value="CONVERTED">CONVERTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Student Count</span>
                    <span className="font-bold text-navy-950">{enquiry.estimatedStudents ? `${enquiry.estimatedStudents} Students` : 'Not specified'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Shoe Models / Notes</span>
                    <p className="text-slate-700">{enquiry.shoeModelsRequested || enquiry.notes || 'No extra notes provided.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

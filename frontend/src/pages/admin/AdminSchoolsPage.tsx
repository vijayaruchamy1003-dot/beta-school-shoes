import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { schoolApi } from '../../api/client';
import { School } from '../../types';
import { 
  Building2, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Download, 
  Users, 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  X
} from 'lucide-react';

export const AdminSchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const activeParam = filterActive === 'ALL' ? undefined : filterActive === 'ACTIVE';
      const res = await schoolApi.getSchools({
        search: search.trim() || undefined,
        isActive: activeParam,
        page,
        size: 15,
      });
      setSchools(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to load schools', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [search, filterActive, page]);

  const handleOpenCreateModal = () => {
    setEditingSchool(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      isActive: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      address: school.address,
      contactPerson: school.contactPerson,
      phone: school.phone,
      email: school.email,
      isActive: school.isActive,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError('');
      if (editingSchool) {
        await schoolApi.updateSchool(editingSchool.id, formData);
      } else {
        await schoolApi.createSchool(formData);
      }
      setIsModalOpen(false);
      fetchSchools();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save school');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (school: School) => {
    try {
      if (school.isActive) {
        await schoolApi.deactivateSchool(school.id);
      } else {
        await schoolApi.activateSchool(school.id);
      }
      fetchSchools();
    } catch (err) {
      console.error('Failed to toggle school status', err);
    }
  };

  const handleExportCsv = async (school: School) => {
    try {
      const res = await schoolApi.exportOrdersCsv(school.id);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${school.code}-orders-report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('No orders found to export or error occurred.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/15 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Institutional Network
          </span>
          <h1 className="font-display mt-1 text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
            Schools Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage partnered institutions, track campus fitment visit orders, and view category requirements.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-primary px-6 py-3.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:paper-shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New School</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96 flex items-center gap-2 border border-foreground/25 bg-background px-3 py-2 text-sm focus-within:border-foreground">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search school by name, code, contact, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground text-xs"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter:</span>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterActive(opt)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                filterActive === opt
                  ? 'border-foreground bg-primary text-primary-foreground'
                  : 'border-foreground/20 text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Schools Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Loading institutional schools...</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="paper-shadow border border-foreground/15 bg-card p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-display text-xl font-bold uppercase tracking-tight">No schools found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search query or add a new school partner.</p>
        </div>
      ) : (
        <div className="paper-shadow border border-foreground/15 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-foreground/15 bg-secondary/50 font-display uppercase tracking-[0.16em] text-foreground">
                <tr>
                  <th className="p-4">School Code & Name</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Phone & Email</th>
                  <th className="p-4 text-center">Students</th>
                  <th className="p-4 text-center">Orders</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <Link
                          to={`/admin/schools/${school.id}`}
                          className="font-display font-bold uppercase text-foreground hover:underline text-sm block"
                        >
                          {school.name}
                        </Link>
                        <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                          Code: {school.code}
                        </span>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{school.address}</p>
                      </div>
                    </td>

                    <td className="p-4 font-medium text-foreground">
                      {school.contactPerson}
                    </td>

                    <td className="p-4 space-y-0.5">
                      <p className="text-foreground font-mono">{school.phone}</p>
                      <p className="text-muted-foreground text-[11px]">{school.email}</p>
                    </td>

                    <td className="p-4 text-center font-display font-bold text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {school.totalStudents}
                      </span>
                    </td>

                    <td className="p-4 text-center font-display font-bold text-sm">
                      <span className="inline-flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                        {school.totalOrders}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          school.isActive
                            ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-800'
                            : 'border-destructive/40 bg-destructive/10 text-destructive'
                        }`}
                      >
                        {school.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {/* Open School Dashboard */}
                      <Link
                        to={`/admin/schools/${school.id}`}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                        title="View School Dashboard & Requirements"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Dashboard</span>
                      </Link>

                      {/* Edit Modal */}
                      <button
                        onClick={() => handleOpenEditModal(school)}
                        className="p-1.5 border border-foreground/25 hover:border-foreground text-foreground transition-colors"
                        title="Edit School Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Export CSV */}
                      <button
                        onClick={() => handleExportCsv(school)}
                        className="p-1.5 border border-foreground/25 hover:border-foreground text-foreground transition-colors"
                        title="Export Orders CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Deactivate / Activate */}
                      <button
                        onClick={() => handleToggleActive(school)}
                        className={`p-1.5 border transition-colors ${
                          school.isActive
                            ? 'border-destructive/30 text-destructive hover:border-destructive'
                            : 'border-emerald-600/30 text-emerald-700 hover:border-emerald-600'
                        }`}
                        title={school.isActive ? 'Deactivate School' : 'Activate School'}
                      >
                        {school.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit School */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg paper-shadow border border-foreground/20 bg-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-foreground/15 pb-4">
              <h2 className="font-display text-2xl font-black uppercase tracking-tight">
                {editingSchool ? 'Edit School Details' : 'Add Partner School'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="border border-destructive/40 bg-destructive/10 p-4 text-xs font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier's International Academy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                  School Unique Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SCH-XAV-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 uppercase font-mono outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                  Campus Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Full physical campus address and pincode..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Principal / Administrator"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                    Official Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 80 2233 4455"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold uppercase tracking-[0.16em]">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@school.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-foreground/25 bg-transparent px-3 py-2.5 outline-none focus:border-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="school-is-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="school-is-active" className="font-bold uppercase tracking-wider cursor-pointer">
                  Active Partnership Channel
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-foreground/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-foreground/25 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider hover:bg-secondary/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary px-6 py-2.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground hover:paper-shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingSchool ? 'Update School' : 'Create School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

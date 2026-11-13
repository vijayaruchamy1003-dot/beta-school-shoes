import React, { useEffect, useState } from 'react';
import { userManagementApi } from '../../api/client';
import { AdminUser } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  KeyRound
} from 'lucide-react';

const ROLE_OPTIONS = [
  { id: 'ROLE_ADMIN', label: 'Admin', desc: 'Full access to all modules & user management', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'ROLE_MANAGER', label: 'Manager', desc: 'Manage products, schools, inventory & orders', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'ROLE_STAFF', label: 'Staff / School Executive', desc: 'Access school orders, student sizing & catalogue', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'ROLE_CUSTOMER', label: 'Customer', desc: 'Storefront shopping & order tracking access', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['ROLE_STAFF']);
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userManagementApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setSelectedRoles(['ROLE_STAFF']);
    setEnabled(true);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setFirstName(u.firstName || '');
    setLastName(u.lastName === '.' ? '' : (u.lastName || ''));
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setPassword('');
    setSelectedRoles(u.roles && u.roles.length > 0 ? u.roles : ['ROLE_STAFF']);
    setEnabled(u.enabled !== false);
    setErrorMsg('');
    setModalOpen(true);
  };

  const toggleRoleSelection = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== roleId));
      }
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!editingUser && (!password || password.trim().length < 6)) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      if (editingUser) {
        await userManagementApi.updateUser(editingUser.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim() || '.',
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password: password.trim() ? password.trim() : undefined,
          roles: selectedRoles,
          enabled,
        });
        setSuccessBanner(`User ${email.trim()} updated successfully.`);
      } else {
        await userManagementApi.createUser({
          firstName: firstName.trim(),
          lastName: lastName.trim() || '.',
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password: password.trim(),
          roles: selectedRoles,
          enabled,
        });
        setSuccessBanner(`User ${email.trim()} created! They can now sign in at /login.`);
      }

      setModalOpen(false);
      await loadUsers();
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const res = await userManagementApi.toggleUserStatus(user.id, !user.enabled);
      setUsers(users.map(u => u.id === user.id ? res.data : u));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete user account "${user.email}"?`)) return;
    try {
      await userManagementApi.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    const found = ROLE_OPTIONS.find(r => r.id === role);
    const label = found ? found.label : role.replace(/^ROLE_/, '');
    const cls = found ? found.badgeClass : 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span key={role} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
        <Shield className="w-2.5 h-2.5" />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-navy-950 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-700" />
            <span>User &amp; Role Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create user accounts and assign roles (Admin, Manager, Staff, Customer). Users created here have immediate login access.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-850 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create New User</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* Search & Role Filter */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-navy-950 bg-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white font-semibold focus:outline-none focus:border-navy-950"
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-navy-950 font-bold text-xs transition"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-950 mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email (Login ID)</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Assigned Roles</th>
                  <th className="py-3 px-4">Login Access</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-950">
                        {u.firstName} {u.lastName && u.lastName !== '.' ? u.lastName : ''}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Created {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles && u.roles.length > 0
                          ? u.roles.map(r => getRoleBadge(r))
                          : getRoleBadge('ROLE_CUSTOMER')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition ${
                          u.enabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.enabled ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit / Role</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="inline-flex items-center p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-navy-950">
                  {editingUser ? 'Edit User & Assign Roles' : 'Create New User Account'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingUser
                    ? 'Update user details, assigned roles, or reset password.'
                    : 'Set login email, password, and role permissions.'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vijay"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-navy-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kumar"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-navy-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email Address (Login ID) *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@shoesnet.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-navy-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-navy-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {editingUser ? 'New Password (leave blank to keep current password)' : 'Login Password * (min 6 characters)'}
                  </span>
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? 'Leave blank unless resetting password' : 'Enter password (min 6 chars)'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-navy-950"
                />
              </div>

              {/* Role Assignment */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Assign Role(s) *</label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLE_OPTIONS.map(r => {
                    const checked = selectedRoles.includes(r.id);
                    return (
                      <div
                        key={r.id}
                        onClick={() => toggleRoleSelection(r.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                          checked
                            ? 'border-navy-950 bg-blue-50/50 ring-1 ring-navy-950'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-navy-950">{r.label}</div>
                          <div className="text-[11px] text-slate-500">{r.desc}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="h-4 w-4 accent-navy-950 rounded"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={e => setEnabled(e.target.checked)}
                    className="rounded accent-navy-950 h-4 w-4"
                  />
                  <span className="font-bold text-slate-700">Account Active (Allow Login)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-navy-950 hover:bg-navy-850 text-white font-bold transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

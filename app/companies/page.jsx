'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  UserX,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';
import { StatusBadge } from '@/components/StatusBadge';
import { ModernDropdown } from '@/components/ModernDropdown';

export default function CompaniesPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subFilter, setSubFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Expanded rows track company IDs
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Suspend/Reactivate modal state
  const [actionCompany, setActionCompany] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toggle single user status
  const [actionUser, setActionUser] = useState(null);
  const [userReason, setUserReason] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);

  const fetchCompanies = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await superAdminService.getCompanies({
        page: p,
        limit: 10,
        search,
        status: statusFilter,
        subscription_status: subFilter
      });
      if (res?.data) {
        setItems(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        // Expand first company by default for quick visibility of parent-child tree
        if (res.data.length > 0 && p === 1) {
          setExpandedRows(new Set([res.data[0].id]));
        }
      }
    } catch (err) {
      console.error('Failed to fetch companies', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, subFilter]);

  useEffect(() => {
    fetchCompanies(1);
  }, [fetchCompanies]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedRows(new Set(items.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  const handleToggleStatus = async () => {
    if (!actionCompany) return;
    setActionLoading(true);
    try {
      const newStatus = !actionCompany.is_active;
      await superAdminService.toggleCompanyStatus(actionCompany.id, newStatus, reason);
      setActionCompany(null);
      setReason('');
      fetchCompanies(pagination.page);
    } catch (err) {
      alert(err.message || 'Error updating company status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!actionUser) return;
    setUserActionLoading(true);
    try {
      const newStatus = !actionUser.is_active;
      await superAdminService.toggleUserStatus(actionUser.id, newStatus, userReason);
      setActionUser(null);
      setUserReason('');
      fetchCompanies(pagination.page);
    } catch (err) {
      alert(err.message || 'Error updating user status');
    } finally {
      setUserActionLoading(false);
    }
  };

  // Compute platform aggregate summary from fetched items
  const stats = useMemo(() => {
    const totalCompanies = pagination.total || items.length;
    let totalAdmins = 0;
    let totalEmployees = 0;
    let totalUsers = 0;

    items.forEach((c) => {
      totalAdmins += c.admin_count || (c.admin_user ? 1 : 0);
      totalEmployees += c.employee_count || 0;
      totalUsers += c.user_count || 0;
    });

    return { totalCompanies, totalAdmins, totalEmployees, totalUsers };
  }, [items, pagination]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Companies & Platform Hierarchy</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchical parent–child architecture: Companies are parent entities; Company ADMIN and Employees are nested under their respective parent company.
          </p>
        </div>

        {/* Tree controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Aggregate Counts Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Parent Companies</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.totalCompanies}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Authoritative business entities</div>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Company ADMIN Accounts</div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.totalAdmins}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Primary tenant administrators</div>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Employee Users</div>
          <div className="text-xl font-black text-blue-900 mt-1">{stats.totalEmployees}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Billing, Cashier, Accountant, etc.</div>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Platform Subscriptions</div>
          <div className="text-xl font-black text-emerald-900 mt-1">{stats.totalCompanies}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">1 per parent company (₹599/mo)</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name, ID, owner, email, phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        <ModernDropdown
          value={subFilter}
          onChange={(val) => setSubFilter(val)}
          options={[
            { value: 'ALL', label: 'All Subscription Statuses' },
            { value: 'TRIALING', label: 'Trialing' },
            { value: 'ACTIVE', label: 'Active Paid' },
            { value: 'PENDING', label: 'Pending / Mandate' },
            { value: 'PAST_DUE', label: 'Past Due' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'EXPIRED', label: 'Expired' },
            { value: 'SUSPENDED', label: 'Suspended' }
          ]}
        />

        <ModernDropdown
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: '', label: 'All Account States' },
            { value: 'ACTIVE', label: 'Active Accounts' },
            { value: 'SUSPENDED', label: 'Suspended Accounts' }
          ]}
        />

        <button
          onClick={() => fetchCompanies(1)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Apply Filters</span>
        </button>
      </div>

      {/* Hierarchical Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Hierarchy</th>
                <th className="py-3.5 px-4">Parent Company / Child Users</th>
                <th className="py-3.5 px-4">Company ADMIN & Contact</th>
                <th className="py-3.5 px-4">Staff Breakdown</th>
                <th className="py-3.5 px-4">Company Subscription</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Registered</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading platform companies and user hierarchy...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                    No companies match your search criteria.
                  </td>
                </tr>
              ) : (
                items.map((company) => {
                  const isExpanded = expandedRows.has(company.id);
                  const adminUser = company.admin_user;
                  const employees = company.employees || [];
                  const sub = company.current_subscription;

                  return (
                    <React.Fragment key={company.id}>
                      {/* Parent Company Row */}
                      <tr className={`transition-colors ${isExpanded ? 'bg-blue-50/40 font-medium' : 'hover:bg-slate-50/80'}`}>
                        {/* Toggle button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleRow(company.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse Users' : 'Expand Users'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Company Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700">
                              <Building2 className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="font-black text-slate-900 text-sm">{company.business_name}</div>
                              <div className="text-[11px] font-mono font-bold text-blue-600">
                                {company.company_id || 'ID PENDING'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Company Admin & Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">
                            {adminUser?.name || company.owner_name || 'N/A'}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{adminUser?.email || company.email || 'No email'}</span>
                          </div>
                          {(adminUser?.phone || company.phone) && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{adminUser?.phone || company.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Users Count breakdown */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              <span>{company.user_count || 1} Total Users</span>
                            </span>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                                {company.admin_count || 1} ADMIN
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                {company.employee_count || 0} Staff
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Company Subscription (1 per company) */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 text-xs">
                            {sub?.subscription_plans?.plan_name || 'VEXA Invoice Monthly'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ₹{sub?.amount || 599} / {sub?.billing_interval?.toLowerCase() || 'month'}
                          </div>
                          <div className="mt-1">
                            <StatusBadge status={company.subscription_status} />
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              company.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {company.is_active ? 'ACTIVE' : 'SUSPENDED'}
                          </span>
                        </td>

                        {/* Registered */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(company.created_at).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/companies/${company.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-1 transition-all"
                            >
                              <span>Details</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                            <button
                              onClick={() => setActionCompany(company)}
                              className={`p-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                company.is_active
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                              }`}
                              title={company.is_active ? 'Suspend Company' : 'Reactivate Company'}
                            >
                              {company.is_active ? (
                                <ShieldAlert className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Nested Child Rows: Company ADMIN & Employee Users */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan="8" className="p-0 border-y border-slate-200">
                            <div className="p-4 pl-12 bg-slate-50/90 border-l-4 border-l-blue-600 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-blue-600" />
                                  <span>
                                    {company.business_name} — Organization Hierarchy ({company.user_count || 1} Accounts)
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  All child users inherit company license &bull; Billing is owned by Company ADMIN
                                </span>
                              </div>

                              <div className="rounded-xl border border-blue-200/80 bg-white overflow-hidden shadow-xs">
                                <table className="w-full text-left text-xs text-slate-600">
                                  <thead className="bg-blue-50/80 text-blue-900 font-bold text-[10px] uppercase border-b border-blue-100">
                                    <tr>
                                      <th className="py-2.5 px-4">User Account & Role</th>
                                      <th className="py-2.5 px-4">Role Classification</th>
                                      <th className="py-2.5 px-4">Contact (Email & Phone)</th>
                                      <th className="py-2.5 px-4">Account Status</th>
                                      <th className="py-2.5 px-4">Joined Date</th>
                                      <th className="py-2.5 px-4 text-right">User Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {/* 1. Primary Company ADMIN Account(s) */}
                                    {(company.admin_users && company.admin_users.length > 0
                                      ? company.admin_users
                                      : adminUser ? [adminUser] : []
                                    ).map((admin) => (
                                      <tr key={admin.id} className="bg-blue-50/30 hover:bg-blue-50/60 transition-colors">
                                        <td className="py-2.5 px-4">
                                          <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[10px] shadow-2xs">
                                              ADMIN
                                            </span>
                                            <div>
                                              <span className="font-black text-slate-900">{admin.name}</span>
                                              <span className="ml-2 text-[10px] font-bold text-blue-600 uppercase">
                                                (Company Owner & Billing Contact)
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                            COMPANY ADMIN
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-4">
                                          <div className="text-slate-800 font-medium">{admin.email}</div>
                                          <div className="text-[11px] text-slate-400">{admin.phone || 'No phone'}</div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                          <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                              admin.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}
                                          >
                                            {admin.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                                          {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="py-2.5 px-4 text-right">
                                          <button
                                            onClick={() => setActionUser(admin)}
                                            className="px-2 py-1 rounded-md text-[11px] font-bold border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                                          >
                                            {admin.is_active ? 'Deactivate' : 'Reactivate'}
                                          </button>
                                        </td>
                                      </tr>
                                    ))}

                                    {/* 2. Employee Child Users */}
                                    {employees.length === 0 ? (
                                      <tr>
                                        <td colSpan="6" className="py-3 px-4 text-slate-400 italic text-[11px]">
                                          No employee accounts registered under this company yet.
                                        </td>
                                      </tr>
                                    ) : (
                                      employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/80">
                                          <td className="py-2.5 px-4 pl-8">
                                            <div className="flex items-center gap-2">
                                              <span className="text-slate-300 font-bold">&bull;</span>
                                              <span className="font-bold text-slate-900">{emp.name}</span>
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-4">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                              {emp.custom_roles?.name || emp.role?.replace('_', ' ') || 'EMPLOYEE'}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-4">
                                            <div className="text-slate-800 font-medium">{emp.email}</div>
                                            <div className="text-[11px] text-slate-400">{emp.phone || 'No phone'}</div>
                                          </td>
                                          <td className="py-2.5 px-4">
                                            <span
                                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                emp.is_active
                                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                              }`}
                                            >
                                              {emp.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                                            {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'N/A'}
                                          </td>
                                          <td className="py-2.5 px-4 text-right">
                                            <button
                                              onClick={() => setActionUser(emp)}
                                              className="px-2 py-1 rounded-md text-[11px] font-bold border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                                            >
                                              {emp.is_active ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.pages || 1}</span> (Total{' '}
            <span className="font-bold text-slate-900">{pagination.total}</span> Companies)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchCompanies(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchCompanies(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Suspend/Reactivate Company */}
      {actionCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionCompany.is_active
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {actionCompany.is_active ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {actionCompany.is_active ? 'Suspend Company Account' : 'Reactivate Company Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {actionCompany.business_name} ({actionCompany.company_id})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {actionCompany.is_active
                ? 'Suspending this company will temporarily restrict login access for all users under this tenant. Business data, invoices, and records are safely preserved.'
                : 'Reactivating this company will restore operational access for authorized users under this tenant.'}
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Reason for Audit Log
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Non-payment, manual review, owner request..."
                rows="3"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActionCompany(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all shadow-sm ${
                  actionCompany.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading ? 'Processing...' : actionCompany.is_active ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Toggle Individual User */}
      {actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionUser.is_active
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {actionUser.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {actionUser.is_active ? 'Deactivate User Account' : 'Reactivate User Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {actionUser.name} &bull; {actionUser.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {actionUser.is_active
                ? 'Deactivating this user will prevent them from signing into the platform. Their audit logs and transaction history remain intact.'
                : 'Reactivating this user will allow them to log into the tenant dashboard according to their assigned role.'}
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Reason for Audit Log
              </label>
              <textarea
                value={userReason}
                onChange={(e) => setUserReason(e.target.value)}
                placeholder="e.g. Employee left company, role transfer, security request..."
                rows="3"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActionUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleUserStatus}
                disabled={userActionLoading}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all shadow-sm ${
                  actionUser.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {userActionLoading ? 'Processing...' : actionUser.is_active ? 'Confirm Deactivation' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Building2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Layers,
  UserCheck,
  UserX,
  CreditCard,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';
import { StatusBadge } from '@/components/StatusBadge';
import { ModernDropdown } from '@/components/ModernDropdown';

export default function UsersManagementPage() {
  const [companies, setCompanies] = useState([]);
  const [flatUsers, setFlatUsers] = useState([]);
  const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy' | 'flat'
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Expanded company IDs for dropdown view (defaults to all loaded companies open for instant visibility)
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Toggle user status modal
  const [actionUser, setActionUser] = useState(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch hierarchical data (grouped by parent company with admin + child users)
  const fetchHierarchy = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await superAdminService.getCompanies({
        page: p,
        limit: 15,
        search,
        status: statusFilter === 'ACTIVE' ? 'ACTIVE' : statusFilter === 'INACTIVE' ? 'SUSPENDED' : ''
      });
      if (res?.data) {
        setCompanies(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        // Automatically keep active companies expanded in clean hierarchy
        if (res.data.length > 0) {
          setExpandedRows(new Set(res.data.map((c) => c.id)));
        }
      }
    } catch (err) {
      console.error('Failed to fetch platform companies hierarchy', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Fetch flat users list (fallback/alternative view)
  const fetchFlatUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await superAdminService.getUsers({
        page: p,
        limit: 15,
        search,
        role: roleFilter,
        status: statusFilter
      });
      if (res?.data) {
        setFlatUsers(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch platform users', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (viewMode === 'hierarchy') {
      fetchHierarchy(1);
    } else {
      fetchFlatUsers(1);
    }
  }, [viewMode, fetchHierarchy, fetchFlatUsers]);

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

  const handleToggleStatus = async () => {
    if (!actionUser) return;
    setActionLoading(true);
    try {
      const newStatus = !actionUser.is_active;
      await superAdminService.toggleUserStatus(actionUser.id, newStatus, reason);
      setActionUser(null);
      setReason('');
      if (viewMode === 'hierarchy') {
        fetchHierarchy(pagination.page);
      } else {
        fetchFlatUsers(pagination.page);
      }
    } catch (err) {
      alert(err.message || 'Error updating user status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </span>
            <span>Platform Users & Organization Hierarchy</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Parent company entities with nested Company ADMIN and child employee user accounts.
          </p>
        </div>

        {/* Clean View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'hierarchy'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dropdown Tree View
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'flat'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flat Directory
          </button>
        </div>
      </div>

      {/* Modern, Clean & Unified Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, user name, email, phone..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Conditional Role Filter for Flat View */}
        {viewMode === 'flat' && (
          <ModernDropdown
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={[
              { value: 'ALL', label: 'All Roles' },
              { value: 'ADMIN', label: 'Company ADMIN' },
              { value: 'BILLING_STAFF', label: 'Billing Staff' },
              { value: 'ACCOUNTANT', label: 'Accountant' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'STOCK_STAFF', label: 'Stock Staff' }
            ]}
            placeholder="Select Role"
            className="w-full md:w-48"
          />
        )}

        {/* Account Status Filter */}
        <ModernDropdown
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: '', label: 'All Account Statuses' },
            { value: 'ACTIVE', label: 'Active Accounts' },
            { value: 'INACTIVE', label: 'Deactivated Accounts' }
          ]}
          placeholder="Filter Status"
          className="w-full md:w-48"
        />

        {/* Apply Button */}
        <button
          onClick={() => (viewMode === 'hierarchy' ? fetchHierarchy(1) : fetchFlatUsers(1))}
          className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Apply Filters</span>
        </button>
      </div>

      {/* Main Content Area */}
      {viewMode === 'hierarchy' ? (
        /* =================== HIERARCHICAL DROPDOWN TREE VIEW =================== */
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Toggle</th>
                  <th className="py-3.5 px-4">Parent Company</th>
                  <th className="py-3.5 px-4">Company ADMIN (Owner)</th>
                  <th className="py-3.5 px-4">Total Users / Breakdown</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400">
                      <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                      Loading organization hierarchy...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                      No companies match your search criteria.
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => {
                    const isExpanded = expandedRows.has(company.id);
                    const adminUser = company.admin_user;
                    const employees = company.employees || [];

                    return (
                      <React.Fragment key={company.id}>
                        {/* Parent Company Row */}
                        <tr
                          className={`transition-colors cursor-pointer select-none ${
                            isExpanded ? 'bg-blue-50/30 font-medium' : 'hover:bg-slate-50/80'
                          }`}
                          onClick={() => toggleRow(company.id)}
                        >
                          {/* Chevron Toggle button */}
                          <td className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(company.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-600 transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse Child Users' : 'Expand Child Users'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </td>

                          {/* Company Name & Company ID */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="p-2 rounded-xl bg-blue-100/70 text-blue-700 shrink-0">
                                <Building2 className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="font-black text-slate-900 text-sm hover:text-blue-600 block">
                                  {company.business_name}
                                </span>
                                <span className="text-[11px] font-mono font-bold text-blue-600">
                                  {company.company_id || 'ID PENDING'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Company ADMIN info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px]">
                                ADMIN
                              </span>
                              <span>{adminUser?.name || company.owner_name || 'N/A'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[220px]">
                              {adminUser?.email || company.email || 'No email recorded'}
                            </div>
                          </td>

                          {/* Users Breakdown */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              <span>{company.user_count || 1} Total Users</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
                                {company.admin_count || 1} Admin
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                {company.employee_count || 0} Staff
                              </span>
                            </div>
                          </td>

                          {/* Subscription Status */}
                          <td className="py-4 px-4">
                            <StatusBadge status={company.subscription_status} />
                          </td>

                          {/* Account Status */}
                          <td className="py-4 px-4">
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

                          {/* Company Details Action */}
                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/admin/companies/${company.id}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1 transition-all shadow-2xs"
                            >
                              <span>Details</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                          </td>
                        </tr>

                        {/* Nested Dropdown Child Rows */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70">
                            <td colSpan="7" className="p-0 border-y border-slate-200">
                              <div className="p-4 sm:p-5 pl-8 sm:pl-12 bg-slate-50/90 border-l-4 border-l-blue-600 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-600" />
                                    <span>
                                      {company.business_name} &bull; Users Directory ({company.user_count || 1} Accounts)
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Parent Company: <span className="font-bold text-slate-700">{company.business_name}</span> ({company.company_id})
                                  </span>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                                  <table className="w-full text-left text-xs text-slate-600">
                                    <thead className="bg-slate-100/80 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                                      <tr>
                                        <th className="py-2.5 px-4">User Name & Identity</th>
                                        <th className="py-2.5 px-4">Role Classification</th>
                                        <th className="py-2.5 px-4">Contact (Email & Phone)</th>
                                        <th className="py-2.5 px-4">Account Status</th>
                                        <th className="py-2.5 px-4">Joined Date</th>
                                        <th className="py-2.5 px-4 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {/* 1. Primary Company ADMIN Account */}
                                      {(company.admin_users && company.admin_users.length > 0
                                        ? company.admin_users
                                        : adminUser ? [adminUser] : []
                                      ).map((admin) => (
                                        <tr key={admin.id} className="bg-blue-50/30 hover:bg-blue-50/60 transition-colors">
                                          <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[10px] shadow-2xs">
                                                ADMIN
                                              </span>
                                              <div>
                                                <span className="font-black text-slate-900 text-sm">{admin.name}</span>
                                                <span className="ml-2 text-[10px] font-bold text-blue-600 uppercase">
                                                  (Company Admin)
                                                </span>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="py-3 px-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                              COMPANY ADMIN
                                            </span>
                                          </td>
                                          <td className="py-3 px-4">
                                            <div className="text-slate-900 font-semibold">{admin.email}</div>
                                            <div className="text-[11px] text-slate-400">{admin.phone || 'No phone'}</div>
                                          </td>
                                          <td className="py-3 px-4">
                                            <span
                                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                admin.is_active
                                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                              }`}
                                            >
                                              {admin.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                                            {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                                          </td>
                                          <td className="py-3 px-4 text-right">
                                            <button
                                              onClick={() => setActionUser(admin)}
                                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                                            >
                                              {admin.is_active ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                          </td>
                                        </tr>
                                      ))}

                                      {/* 2. Employee Child Users */}
                                      {employees.length === 0 ? (
                                        <tr>
                                          <td colSpan="6" className="py-4 px-4 text-slate-400 italic text-xs">
                                            No employee accounts registered under {company.business_name} yet.
                                          </td>
                                        </tr>
                                      ) : (
                                        employees.map((emp) => (
                                          <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 pl-6 sm:pl-8">
                                              <div className="flex items-center gap-2">
                                                <span className="text-slate-300 font-bold">&bull;</span>
                                                <span className="font-bold text-slate-900">{emp.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                  (Employee)
                                                </span>
                                              </div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {emp.custom_roles?.name || emp.role?.replace('_', ' ') || 'EMPLOYEE'}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <div className="text-slate-800 font-medium">{emp.email}</div>
                                              <div className="text-[11px] text-slate-400">{emp.phone || 'No phone'}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                  emp.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}
                                              >
                                                {emp.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                                              {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                              <button
                                                onClick={() => setActionUser(emp)}
                                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
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

          {/* Pagination */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.pages || 1}</span> (Total{' '}
              <span className="font-bold text-slate-900">{pagination.total}</span> Companies)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchHierarchy(pagination.page - 1)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchHierarchy(pagination.page + 1)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* =================== FLAT DIRECTORY VIEW =================== */
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User Name & Contact</th>
                  <th className="py-3.5 px-4">Associated Company</th>
                  <th className="py-3.5 px-4">Platform Identity</th>
                  <th className="py-3.5 px-4">Company Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-400">
                      <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                      Loading platform users...
                    </td>
                  </tr>
                ) : flatUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  flatUsers.map((user) => {
                    const isCompanyAdmin = user.role === 'ADMIN';
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{user.email || user.phone || 'No email'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/admin/companies/${user.businesses?.id}`}
                            className="font-semibold text-blue-600 hover:text-blue-700 block"
                          >
                            {user.businesses?.business_name || 'N/A'}
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400">
                            {user.businesses?.company_id || ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isCompanyAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                              Company Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Tenant Employee
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {user.custom_roles?.name || user.role}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              user.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {user.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setActionUser(user)}
                            className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                              user.is_active
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                            }`}
                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.is_active ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-900">{pagination.pages || 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchFlatUsers(pagination.page - 1)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchFlatUsers(pagination.page + 1)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for User Status Toggle */}
      {actionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
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
                ? 'Deactivating this user will prevent them from signing into the platform. Their data and transaction records remain intact.'
                : 'Reactivating this user will restore their ability to log into the tenant dashboard.'}
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Reason for Audit Log
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Staff resignation, administrative review..."
                rows="3"
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setActionUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all shadow-sm ${
                  actionUser.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading ? 'Processing...' : actionUser.is_active ? 'Confirm Deactivation' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

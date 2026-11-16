'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Building2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Boxes,
  UserCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Receipt,
  IndianRupee
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';
import { StatusBadge } from '@/components/StatusBadge';

export default function CompanyDetailPage({ params }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'subscriptions' | 'transactions'

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminService.getCompanyById(companyId);
      if (res?.data) {
        setCompany(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading company profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-semibold text-sm">Loading company audit profile...</p>
        <span className="text-xs text-slate-400 mt-1">Fetching live PostgreSQL records</span>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-3xl max-w-lg mx-auto text-center shadow-lg my-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Company Record Not Found</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{error || 'Could not locate company record or tenant has been removed.'}</p>
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Companies</span>
        </Link>
      </div>
    );
  }

  // Identify admin user and employee users
  const adminUser = company.users?.find((u) => u.role === 'ADMIN');
  const employees = company.users?.filter((u) => u.role !== 'ADMIN') || [];
  const latestSub = company.platform_subscriptions?.[0] || null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/companies"
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-all flex items-center justify-center group"
            title="Back to Companies"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Link href="/admin/companies" className="hover:text-blue-600 transition-colors">
                Companies
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold truncate max-w-[200px]">{company.business_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2.5">
              <span>{company.business_name}</span>
              <span className="text-xs font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold">
                {company.company_id || 'ID PENDING'}
              </span>
            </h1>
          </div>
        </div>

        {/* Status Badges Header */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <StatusBadge status={company.subscription_status} />
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              company.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${company.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {company.is_active ? 'ACTIVE ACCOUNT' : 'SUSPENDED'}
          </span>
        </div>
      </div>

      {/* Hero Quick Stat Cards (Mobile Scrollable & Desktop Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Company Users</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{company.users?.length || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-bold text-purple-700">1 Admin</span>
            <span>&bull;</span>
            <span>{employees.length} Staff Accounts</span>
          </div>
        </div>

        {/* Authoritative Subscription */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Plan</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{latestSub?.amount || 599}
            <span className="text-xs font-normal text-slate-400"> / mo</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cashfree Mandate Active</span>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Invoices / Sales</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{company._count?.sales || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">Total billed sales created</div>
        </div>

        {/* Inventory SKUs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog SKUs</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{company._count?.products || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Across catalog categories</span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company & Billing Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Organization Users ({company.users?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'subscriptions'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Subscription Lifecycles ({company.platform_subscriptions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Verified Payments ({company.payment_transactions?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PROFILE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Company Admin & Registration Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Company ADMIN & Contact</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Primary Owner
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Full Name</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{adminUser?.name || company.owner_name || 'N/A'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium break-all">{adminUser?.email || company.email || 'No email recorded'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{adminUser?.phone || company.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{company.city ? `${company.city}, ${company.state || ''}` : 'Address not configured'}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">GSTIN:</span>{' '}
                  <span className="font-mono text-slate-900">{company.gst_number || 'Unregistered'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Registered On:</span>{' '}
                  <span>{new Date(company.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Free Trial & Subscription Terms */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Subscription Lifecycle</span>
              </h3>
              <span className="text-xs text-blue-600 font-mono font-bold">₹599 / month</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Billing Model</span>
                <span className="text-xs font-bold text-slate-900 block">
                  VEXA Standard SaaS Plan (₹599 / mo)
                </span>
                <span className="text-[11px] text-slate-600 block leading-relaxed">
                  Single subscription covers entire parent company with unlimited employee access.
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Trial Period:</span>
                  <span className="font-bold text-slate-900">
                    {company.trial_end_at ? `Expires ${new Date(company.trial_end_at).toLocaleDateString()}` : 'Standard Lifecycle'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Auto-Renew Mandate:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{latestSub?.auto_renew ? 'ACTIVE' : 'OFF'}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Next Billing Renewal:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {latestSub?.next_billing_date ? new Date(latestSub.next_billing_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Provider Sub ID:</span>
                  <span className="font-mono text-[11px] text-blue-600 truncate max-w-[170px]" title={latestSub?.provider_subscription_id}>
                    {latestSub?.provider_subscription_id || 'Cashfree Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Activity Summary */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>Tenant Operational Data</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Postgres Live</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Customers</span>
                <span className="text-xl font-black text-slate-900">{company._count?.customers || 0}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Retail / Wholesale</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Suppliers</span>
                <span className="text-xl font-black text-slate-900">{company._count?.suppliers || 0}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Vendors</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Purchases</span>
                <span className="text-xl font-black text-slate-900">{company._count?.purchases || 0}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Inward orders</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Invoices</span>
                <span className="text-xl font-black text-slate-900">{company._count?.sales || 0}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Billed sales</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSOCIATED USERS HIERARCHY */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Organization Users Directory</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Company ADMIN owns tenant billing. All child employees inherit company license access.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 self-start sm:self-auto shadow-2xs">
              {company.users?.length || 0} Accounts Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">User Name & Identity</th>
                  <th className="py-3.5 px-4">Role Classification</th>
                  <th className="py-3.5 px-4">Contact (Email & Phone)</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Company Admin Row */}
                {adminUser && (
                  <tr className="bg-purple-50/30 hover:bg-purple-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700 font-black text-[10px]">
                          ADMIN
                        </span>
                        <div>
                          <div className="font-black text-slate-900 text-sm">{adminUser.name}</div>
                          <span className="text-[10px] font-bold text-purple-700 uppercase">
                            Company Admin & Billing Owner
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        COMPANY ADMIN
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{adminUser.email}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{adminUser.phone || 'No phone recorded'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          adminUser.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {adminUser.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(adminUser.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Primary Tenant Admin</span>
                    </td>
                  </tr>
                )}

                {/* 2. Employee Child Rows */}
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 italic text-xs">
                      No additional employee accounts created yet.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-bold">&bull;</span>
                          <span className="font-bold text-slate-900 text-sm">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {emp.role?.replace('_', ' ') || 'EMPLOYEE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{emp.email}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{emp.phone || 'No phone'}</div>
                      </td>
                      <td className="py-3.5 px-4">
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
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(emp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] text-blue-600 font-bold">Child Employee</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Cashfree Subscriptions & Recurring Mandates</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Authoritative subscription lifecycle history for this company.</p>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {company.platform_subscriptions?.length || 0} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Provider Subscription ID</th>
                  <th className="py-3.5 px-4">Lifecycle Status</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Mandate Status</th>
                  <th className="py-3.5 px-4">Auto-Renew</th>
                  <th className="py-3.5 px-4">Current Period End</th>
                  <th className="py-3.5 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {company.platform_subscriptions?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No subscription records found for this company.
                    </td>
                  </tr>
                ) : (
                  company.platform_subscriptions?.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-600 text-[11px]">
                        {sub.provider_subscription_id || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ₹{sub.amount}
                        <span className="text-[10px] font-normal text-slate-400"> / mo</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold text-[11px]">
                        {sub.mandate_status || 'PENDING'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${sub.auto_renew ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {sub.auto_renew ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFIED PAYMENT TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Verified Payment Records</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Authoritative transaction receipts verified by Cashfree gateway.</p>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {company.payment_transactions?.length || 0} Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Reference / Txn ID</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {company.payment_transactions?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No payment transactions recorded for this company yet.
                    </td>
                  </tr>
                ) : (
                  company.payment_transactions?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 text-[11px]">
                        {tx.reference_number || tx.id}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">₹{tx.amount}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            tx.status === 'VERIFIED' || tx.status === 'CLEARED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{tx.provider || 'CASHFREE'}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

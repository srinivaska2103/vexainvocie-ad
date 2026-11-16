'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';
import { StatusBadge } from '@/components/StatusBadge';

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminService.getDashboardMetrics();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const formatCurrency = (amt) => {
    return `₹${Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse shadow-sm"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center max-w-lg mx-auto shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { companies, users, subscriptions, revenue, expiring_soon, recent_companies } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>SaaS Platform Control Center</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live DB
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform-wide metrics, verified revenue, subscriptions, and tenant oversight.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Companies</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{companies?.total || 0}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-700 font-semibold">{companies?.active || 0} Active</span>
            <span>•</span>
            <span className="text-rose-600 font-semibold">{companies?.suspended || 0} Suspended</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{users?.total || 0}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-800 font-semibold">{users?.admins || 0} Admins</span>
            <span>•</span>
            <span className="text-slate-500 font-medium">{users?.employees || 0} Employees</span>
          </div>
        </div>

        {/* Verified Revenue Net */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Revenue Overall</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700">{formatCurrency(revenue?.total_net)}</div>
          <div className="mt-2 text-xs text-slate-500">
            Gross: {formatCurrency(revenue?.total_gross)} ({revenue?.verified_transactions_count || 0} verified txs)
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Recurring Revenue</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">{formatCurrency(revenue?.mrr)}</div>
          <div className="mt-2 text-xs text-slate-500">
            MTD Collections: <span className="text-slate-900 font-semibold">{formatCurrency(revenue?.mtd_net)}</span>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown Cards */}
      <div>
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4">
          Subscription Lifecycle Distribution (Core SaaS Monthly)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Trialing (7 Days)</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">{subscriptions?.trialing || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Active Paid</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{subscriptions?.active_paid || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Pending / Mandate</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{subscriptions?.pending || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Past Due / Failed</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{subscriptions?.past_due || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Cancelled</span>
            <div className="text-2xl font-bold text-slate-600 mt-1">{subscriptions?.cancelled || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Expired / Suspended</span>
            <div className="text-2xl font-bold text-orange-600 mt-1">{subscriptions?.expired || 0}</div>
          </div>
        </div>
      </div>

      {/* QR Self-Shopping & Lifetime Add-on Reporting Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            QR Self-Shopping & Lifetime Add-on Overview (₹59,999)
          </h2>
          <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            One-Time Feature Entitlement
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-purple-200/90 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Lifetime Active Purchases</span>
            <div className="text-3xl font-black text-slate-900 mt-1.5">{data?.lifetime_addon?.purchases_count || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Verified companies with permanent access</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified Lifetime Revenue</span>
            <div className="text-3xl font-black text-emerald-700 mt-1.5">{formatCurrency(data?.lifetime_addon?.verified_revenue || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">Net collections from ₹59,999 package</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Active 7-Day Trials</span>
            <div className="text-3xl font-black text-indigo-700 mt-1.5">{data?.self_shopping_trial?.active_trialing_companies || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Companies currently testing self-shopping</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Expired Self-Shopping Trials</span>
            <div className="text-3xl font-black text-rose-600 mt-1.5">{data?.self_shopping_trial?.expired_companies || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Prospective leads for ₹59,999 upgrade</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Expiring Soon vs Recent Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Upcoming Renewals & Expiring Trials</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Next 7 Days</span>
          </div>

          <div className="space-y-3">
            {expiring_soon?.trials?.length === 0 && expiring_soon?.renewals?.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No trials or renewals expiring within the next 7 days.
              </div>
            ) : (
              <>
                {expiring_soon?.trials?.map((sub) => (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{sub.businesses?.business_name || 'Company'}</div>
                      <div className="text-[11px] text-slate-500">ID: {sub.company_id} • Owner: {sub.businesses?.owner_name || 'N/A'}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Trial Ends {new Date(sub.trial_end_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}

                {expiring_soon?.renewals?.map((sub) => (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{sub.businesses?.business_name || 'Company'}</div>
                      <div className="text-[11px] text-slate-500">ID: {sub.company_id} • Plan: ₹{sub.amount}/mo</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Renews {new Date(sub.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Recently Registered Companies */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Recently Registered Companies</span>
            </h3>
            <Link
              href="/admin/companies"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recent_companies?.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{c.business_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {c.company_id || 'Pending ID'} • {c.email || 'No email'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.subscription_status} />
                  <Link
                    href={`/admin/companies/${c.id}`}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

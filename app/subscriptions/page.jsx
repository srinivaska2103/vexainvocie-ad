'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  IndianRupee,
  User,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';
import { StatusBadge } from '@/components/StatusBadge';
import { ModernDropdown } from '@/components/ModernDropdown';

export default function SubscriptionsManagementPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Selected subscription for detail view modal
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubscriptions = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await superAdminService.getSubscriptions({
        page: p,
        limit: 10,
        search,
        status: statusFilter
      });
      if (res?.data) {
        setSubscriptions(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching subscriptions', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchSubscriptions(1);
  }, [fetchSubscriptions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Platform Company Subscriptions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative Cashfree subscriptions tied strictly to parent companies and company ADMINs. Exactly 1 subscription per company.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Company Subscriptions: <span className="font-bold text-slate-900">{pagination.total}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, ID, owner email, provider ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        <ModernDropdown
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'TRIALING', label: 'Trialing' },
            { value: 'ACTIVE', label: 'Active Paid' },
            { value: 'PENDING', label: 'Pending Setup' },
            { value: 'PAST_DUE', label: 'Past Due' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'EXPIRED', label: 'Expired' }
          ]}
        />

        <button
          onClick={() => fetchSubscriptions(1)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Apply Filters</span>
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Parent Company</th>
                <th className="py-3.5 px-4">Company ADMIN / Owner</th>
                <th className="py-3.5 px-4">Plan & Amount</th>
                <th className="py-3.5 px-4">Lifecycle Status</th>
                <th className="py-3.5 px-4">Mandate & Renewal</th>
                <th className="py-3.5 px-4">Trial / Period Dates</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading company subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                    No subscriptions matching this filter.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Parent Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <div>
                          <Link
                            href={`/admin/companies/${sub.businesses?.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 text-sm block"
                          >
                            {sub.businesses?.business_name || 'N/A'}
                          </Link>
                          <div className="text-[11px] font-mono text-blue-600 font-bold">
                            {sub.businesses?.company_id || sub.company_id || 'ID PENDING'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company ADMIN / Owner */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]">
                          ADMIN
                        </span>
                        <span className="font-bold">{sub.admin_user?.name || sub.businesses?.owner_name || 'N/A'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sub.admin_user?.email || sub.businesses?.email || 'No email recorded'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Admin ID: <span className="text-slate-600">{sub.admin_id || sub.admin_user?.id?.slice(0, 8) || sub.businesses?.company_id || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Plan & Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900">
                        ₹{sub.amount} <span className="text-[10px] font-normal text-slate-500">/ month</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {sub.subscription_plans?.plan_name || 'VEXA Monthly Plan'}
                      </div>
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sub.status} />
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[140px]" title={sub.provider_subscription_id}>
                        {sub.provider_subscription_id || 'Cashfree ID Pending'}
                      </div>
                      {/* Self-Shopping Entitlement Tag */}
                      <div className="mt-1.5">
                        {sub.businesses?.self_shopping_status === 'LIFETIME_ACTIVE' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                            ★ Lifetime QR Active
                          </span>
                        ) : sub.businesses?.self_shopping_status === 'TRIALING' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            QR Trial (7d)
                          </span>
                        ) : sub.businesses?.self_shopping_status === 'EXPIRED' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            QR Trial Expired
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Mandate & Renewal */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] font-bold text-slate-700">
                        Mandate: <span className="font-mono text-blue-600">{sub.mandate_status || 'PENDING'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Auto-renew:{' '}
                        <span className={sub.auto_renew ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                          {sub.auto_renew ? 'ACTIVE' : 'OFF'}
                        </span>
                      </div>
                    </td>

                    {/* Trial / Period Dates */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {sub.status === 'TRIALING' ? (
                        <div>
                          <span className="text-amber-700 font-bold block">Trial Period</span>
                          <span className="text-slate-500">
                            Expires:{' '}
                            {sub.trial_end_at ? new Date(sub.trial_end_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-800 font-medium block">
                            Period End:{' '}
                            {sub.current_period_end
                              ? new Date(sub.current_period_end).toLocaleDateString()
                              : 'N/A'}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            Next billing:{' '}
                            {sub.next_billing_date
                              ? new Date(sub.next_billing_date).toLocaleDateString()
                              : 'Period end'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs cursor-pointer transition-all"
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.pages || 1}</span> (Total{' '}
            <span className="font-bold text-slate-900">{pagination.total}</span> Subscriptions)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchSubscriptions(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchSubscriptions(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Details & Verified Payment History Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Authoritative Subscription Details</span>
                </h3>
                <p className="text-xs text-blue-600 font-mono font-medium mt-0.5">
                  Cashfree Sub ID: {selectedSub.provider_subscription_id || 'Not registered with gateway'}
                </p>
              </div>
              <StatusBadge status={selectedSub.status} />
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Parent Company
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {selectedSub.businesses?.business_name}
                </span>
                <span className="text-blue-600 font-mono font-medium text-[11px]">
                  ID: {selectedSub.company_id}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Company ADMIN (Billing Owner)
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {selectedSub.businesses?.owner_name || 'N/A'}
                </span>
                <span className="text-slate-500 text-[11px] block">{selectedSub.businesses?.email}</span>
                <span className="text-slate-400 text-[10px]">{selectedSub.businesses?.phone}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Plan & Pricing
                </span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{selectedSub.amount} / month
                </span>
                <span className="text-slate-500 text-[11px] block">
                  {selectedSub.subscription_plans?.plan_name || 'Standard Tier'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Mandate & Auto-Renewal
                </span>
                <span className="font-mono font-bold text-slate-900 block">
                  {selectedSub.mandate_status || 'PENDING'}
                </span>
                <span className="text-[11px] text-slate-600">
                  Auto-renew mandate: {selectedSub.auto_renew ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Current Billing Period
                </span>
                <div className="text-slate-700 font-medium">
                  Start: {selectedSub.current_period_start ? new Date(selectedSub.current_period_start).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-slate-700 font-medium">
                  End: {selectedSub.current_period_end ? new Date(selectedSub.current_period_end).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                  Trial Timeline
                </span>
                <div className="text-slate-700 font-medium">
                  Trial Start: {selectedSub.trial_start_at ? new Date(selectedSub.trial_start_at).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-slate-700 font-medium">
                  Trial End: {selectedSub.trial_end_at ? new Date(selectedSub.trial_end_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Verified Payment History Section */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Payment Transactions</span>
              </h4>

              {selectedSub.payment_transactions && selectedSub.payment_transactions.length > 0 ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100/70 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Reference / Txn ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSub.payment_transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-700">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3 font-black text-slate-900">₹{tx.amount}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                tx.status === 'VERIFIED' || tx.status === 'CLEARED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            {tx.reference_number || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                  No verified payment transactions recorded for this subscription yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';
import { StatusBadge } from '@/components/StatusBadge';
import { ModernDropdown } from '@/components/ModernDropdown';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const paymentStatusOptions = [
    { value: 'ALL', label: 'All Payment Statuses' },
    { value: 'VERIFIED', label: 'Verified / Succeeded' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded' }
  ];

  const transactionTypeOptions = [
    { value: 'ALL', label: 'All Transaction Types' },
    { value: 'NEW_SUBSCRIPTION', label: 'New Subscription' },
    { value: 'RENEWAL', label: 'Renewal' },
    { value: 'NEW_LIFETIME_PURCHASE', label: 'Lifetime Add-on Purchase' },
    { value: 'CANCELLATION', label: 'Cancellation' },
    { value: 'REFUND', label: 'Refund' }
  ];

  const fetchPayments = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await superAdminService.getPayments({
        page: p,
        limit: 10,
        search,
        status: statusFilter,
        transaction_type: transactionTypeFilter
      });
      if (res?.data) {
        setPayments(res.data.transactions || []);
        setVerifiedTotal(res.data.verified_total_amount || 0);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching payments', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, transactionTypeFilter]);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTransactionTypeFilter('ALL');
  };

  const formatCurrency = (amt) => {
    return `₹${Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTxTypeBadge = (txType) => {
    switch (txType) {
      case 'NEW_LIFETIME_PURCHASE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
            Lifetime Add-on
          </span>
        );
      case 'RENEWAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            Renewal
          </span>
        );
      case 'CANCELLATION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Cancellation
          </span>
        );
      case 'REFUND':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Refund
          </span>
        );
      case 'NEW_SUBSCRIPTION':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            New Subscription
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-blue-600" />
            <span>Payments & Collections</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cashfree payment provider transactions, recurring charges, and verified platform collections.
          </p>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Revenue Overall</span>
          <span className="text-xl font-black text-emerald-700">{formatCurrency(verifiedTotal)}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference number, company, ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        {/* Payment Status Dropdown */}
        <ModernDropdown
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={paymentStatusOptions}
          placeholder="All Payment Statuses"
        />

        {/* Transaction Type Dropdown */}
        <ModernDropdown
          value={transactionTypeFilter}
          onChange={(val) => setTransactionTypeFilter(val)}
          options={transactionTypeOptions}
          placeholder="All Transaction Types"
        />

        {/* Action Buttons: Filter & Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPayments(1)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Apply</span>
          </button>
          {(search || statusFilter !== 'ALL' || transactionTypeFilter !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Reference & Provider</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Transaction & Plan</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verified By</th>
                <th className="py-3.5 px-4">Billing Period / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading verified transaction records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                    No payment records match criteria.
                  </td>
                </tr>
              ) : (
                payments.map((tx) => {
                  const sub = tx.platform_subscriptions;
                  const plan = sub?.subscription_plans;
                  const periodStart = sub?.current_period_start ? new Date(sub.current_period_start).toLocaleDateString() : null;
                  const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : null;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{tx.reference_number || 'N/A'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {tx.provider || 'CASHFREE'} {tx.provider_subscription_id ? `• ${tx.provider_subscription_id}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/companies/${tx.businesses?.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block truncate max-w-xs"
                        >
                          {tx.businesses?.business_name || 'N/A'}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">{tx.company_id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {formatTxTypeBadge(tx.transaction_type)}
                          <span className="text-[10px] text-slate-500 font-medium">{tx.payment_method}</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {plan?.plan_name ? `${plan.plan_name} (${plan.billing_cycle})` : (tx.payment_type?.replace(/_/g, ' ') || 'Subscription')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-black text-sm ${tx.transaction_type === 'CANCELLATION' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {formatCurrency(tx.amount)}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">{tx.currency}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{tx.verified_by || 'Cashfree Provider Sync'}</div>
                        {tx.notes && <div className="text-[10px] text-slate-400 italic truncate max-w-xs">{tx.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div className="font-medium text-slate-700">{new Date(tx.created_at).toLocaleString()}</div>
                        {periodStart && periodEnd && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Period: {periodStart} – {periodEnd}
                          </div>
                        )}
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
              onClick={() => fetchPayments(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchPayments(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

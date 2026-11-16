'use client';

import React from 'react';

export function StatusBadge({ status }) {
  if (!status) return null;
  const s = String(status).toUpperCase();

  const badgeStyles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    TRIALING: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PAYMENT_PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PAST_DUE: 'bg-rose-50 text-rose-700 border-rose-200',
    PAYMENT_FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    EXPIRED: 'bg-orange-50 text-orange-700 border-orange-200',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLEARED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const style = badgeStyles[s] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {s.replace(/_/g, ' ')}
    </span>
  );
}

export default StatusBadge;

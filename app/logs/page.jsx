'use client';

import React, { useEffect, useState } from 'react';
import {
  BellRing,
  ShieldCheck,
  Webhook,
  RefreshCw
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';

export default function LogsAndAuditPage() {
  const [data, setData] = useState({ audit_logs: [], recent_events: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await superAdminService.getLogs({ page: p, limit: 20 });
      if (res?.data) {
        setData({
          audit_logs: res.data.audit_logs || [],
          recent_events: res.data.recent_events || []
        });
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-blue-600" />
            <span>Audit Trail & Webhook Ingestion</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of Super Admin administrative interventions and real-time Cashfree webhook events.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(pagination.page)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Records</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Super Admin Audit Logs */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Super Admin Action History</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">{pagination.total} Logged Actions</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading audit events...</div>
            ) : data.audit_logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No administrative actions logged yet.</div>
            ) : (
              data.audit_logs.map((log) => {
                const metadata = log.new_data || {};
                return (
                  <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mb-1">
                      Target: <span className="font-semibold text-blue-600">{metadata.target_type || 'SYSTEM'}</span> • Company:{' '}
                      <span className="font-semibold text-slate-900">{log.businesses?.business_name || log.business_id}</span>
                    </div>
                    {metadata.details && (
                      <pre className="p-2 bg-slate-50 rounded-lg text-[10px] font-mono text-slate-700 overflow-x-auto border border-slate-200">
                        {JSON.stringify(metadata.details, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Incoming Webhook Events */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Webhook className="w-4 h-4 text-emerald-600" />
              <span>Processed Webhook Notifications</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Cashfree Gateway</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading webhook streams...</div>
            ) : data.recent_events.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No webhooks recorded yet.</div>
            ) : (
              data.recent_events.map((evt) => (
                <div key={evt.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-emerald-700 font-mono">{evt.event_type}</span>
                    <span className="text-[10px] text-slate-400">{new Date(evt.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2 font-mono">Event ID: {evt.event_id}</div>
                  <pre className="p-2 bg-slate-50 rounded-lg text-[10px] font-mono text-slate-700 overflow-x-auto border border-slate-200 max-h-32">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

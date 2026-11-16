'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  CreditCard,
  Server,
  Clock,
  ShieldCheck,
  Database,
  Activity,
  KeyRound,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';

export default function PlatformSettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSettings = async () => {
    try {
      setRefreshing(true);
      const res = await superAdminService.getSettings();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
        <span>Loading platform settings & operational parameters...</span>
      </div>
    );
  }

  const { plans, system_config } = data || {};
  const cashfree = system_config?.cashfree;
  const smtp = system_config?.smtp;
  const trial = system_config?.trial_policy;
  const security = system_config?.security_and_auth;
  const telemetry = system_config?.system_telemetry;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Platform Settings & System Parameters</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Server-side provider configurations, subscription plan models, security guards, and system telemetry.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Parameters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Subscription Plan Model */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Configured SaaS Subscription Plans</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 font-medium">
              {plans?.length || 0} Plans Configured
            </span>
          </div>

          <div className="space-y-3">
            {plans?.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 hover:bg-white hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{p.plan_name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  ₹{Number(p.price).toLocaleString()} <span className="text-xs font-normal text-slate-500">/ {p.billing_cycle}</span>
                </div>
                <p className="text-xs text-slate-600">{p.description}</p>
                <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-slate-200/60">
                  <span>Billing: <strong>{p.billing_type}</strong></span>
                  <span>GST: <strong>{p.tax_percentage}%</strong></span>
                  <span>Currency: <strong>{p.currency}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Free Trial & Access Policy */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Free Trial Policy Specifications</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Duration:</span>
              <span className="font-bold text-slate-900">{trial?.duration_days || 7} Calendar Days (Strict Backend Enforcement)</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Automated Transition:</span>
              <span className="font-bold text-slate-900">Prompts for ₹{trial?.standard_plan_price || 599}/month Cashfree Mandate</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Grace Period Access:</span>
              <span className="font-bold text-emerald-700">{trial?.grace_period_days || 3} Days with Renewal Reminders</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Restricted State:</span>
              <span className="font-bold text-slate-700">Navigation locked to /settings/subscription</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-200/70">
              <span className="text-slate-500">Enforcement Architecture:</span>
              <span className="font-mono text-[11px] font-semibold text-blue-600">{trial?.enforcement_model || 'Backend Middleware Guard'}</span>
            </div>
          </div>

          {/* Infrastructure Gateway Health */}
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 pt-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Infrastructure Gateway Health</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Cashfree Payment Gateway</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Env: {cashfree?.environment} • API: {cashfree?.api_version} • App: {cashfree?.app_id_masked}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  cashfree?.configured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {cashfree?.configured ? 'CONNECTED' : 'UNCONFIGURED'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">SMTP Email Dispatcher</span>
                <span className="text-[11px] text-slate-500">
                  {smtp?.host}:{smtp?.port} ({smtp?.secure}) • Admin: {smtp?.admin_notification_email}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  smtp?.configured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {smtp?.configured ? 'OPERATIONAL' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Security, Authentication & Data Protection */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Security, Auth & Compliance</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Super Admin Authentication:</span>
              <span className="font-bold text-slate-900">{security?.super_admin_auth || 'Email OTP Verification'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">JWT Signing Algorithm:</span>
              <span className="font-mono font-bold text-slate-900">{security?.token_algorithm || 'HS256'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Session Token Lifetime:</span>
              <span className="font-bold text-slate-900">{security?.token_expiry || '7d'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">OTP Validity Window:</span>
              <span className="font-bold text-slate-900">{security?.otp_expiry_minutes || 5} Minutes</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-200/70">
              <span className="text-slate-500">Tenant Data Isolation:</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {security?.data_isolation || 'Company-Scoped Middleware & RLS'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Webhook Signature Verification:</span>
              <span className="font-mono text-[11px] text-blue-600 font-bold">{cashfree?.webhook_status || 'VERIFIED'}</span>
            </div>
          </div>
        </div>

        {/* 4. Database & Operational Telemetry */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Database & System Telemetry</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Database Engine:</span>
              <span className="font-mono font-bold text-slate-900">{telemetry?.database_engine || 'PostgreSQL 16'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Runtime Environment:</span>
              <span className="font-mono uppercase font-bold text-slate-900">{telemetry?.node_env || 'Development'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Registered Companies:</span>
              <span className="font-bold text-slate-900">{telemetry?.total_companies_registered || 0}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Total Platform Users:</span>
              <span className="font-bold text-slate-900">{telemetry?.total_platform_users || 0}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">Active / Tracked Subscriptions:</span>
              <span className="font-bold text-blue-600">{telemetry?.total_subscriptions || 0}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-200/70">
              <span className="text-slate-500">Total Recorded Transactions:</span>
              <span className="font-bold text-emerald-700">{telemetry?.total_transactions || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

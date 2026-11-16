'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  RefreshCw,
  BarChart3,
  Calendar,
  Building2,
  Users,
  CreditCard,
  IndianRupee,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  Sparkles,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'users' | 'companies' | 'subscriptions'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async (selectedDays = days) => {
    setLoading(true);
    try {
      const res = await superAdminService.getAnalytics(selectedDays);
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const summary = data?.summary || {};
  const timeSeries = useMemo(() => data?.time_series || [], [data]);

  // Compute chart metrics dynamically
  const chartData = useMemo(() => {
    if (!timeSeries.length) return { points: [], maxVal: 1, total: 0 };

    const values = timeSeries.map((item) => {
      if (activeMetric === 'revenue') return item.revenue || 0;
      if (activeMetric === 'users') return item.users || 0;
      if (activeMetric === 'companies') return item.companies || 0;
      return item.subscriptions || 0;
    });

    const maxVal = Math.max(...values, 1);
    const total = values.reduce((acc, curr) => acc + curr, 0);

    return {
      points: timeSeries.map((item, idx) => ({
        date: item.date,
        val: values[idx],
        percentage: ((values[idx] / maxVal) * 100).toFixed(1)
      })),
      maxVal,
      total
    };
  }, [timeSeries, activeMetric]);

  // SVG Area / Line Chart Coordinates generator
  const svgPath = useMemo(() => {
    const pts = chartData.points;
    if (pts.length < 2) return { line: '', area: '' };

    const width = 800;
    const height = 220;
    const stepX = width / (pts.length - 1);

    const coords = pts.map((p, i) => {
      const x = i * stepX;
      // padding 20px top and bottom
      const y = height - (p.val / chartData.maxVal) * (height - 40) - 20;
      return { x, y, date: p.date, val: p.val };
    });

    const line = coords.reduce((acc, c, i) => {
      if (i === 0) return `M ${c.x} ${c.y}`;
      // Smooth cubic bezier curve
      const prev = coords[i - 1];
      const cx1 = prev.x + (c.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (c.x - prev.x) / 2;
      const cy2 = c.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${c.x} ${c.y}`;
    }, '');

    const area = `${line} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    return { line, area, coords };
  }, [chartData]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </span>
            <span>Growth & Financial Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative platform metrics, revenue trends, and tenant telemetry calculated from PostgreSQL events.
          </p>
        </div>

        {/* Range Selector & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  days === d
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(days)}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs cursor-pointer transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards (Interactive tabs to toggle chart metric) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Verified Revenue */}
        <div
          onClick={() => setActiveMetric('revenue')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            activeMetric === 'revenue'
              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Period Revenue ({days}d)</span>
            <span
              className={`p-2 rounded-xl ${
                activeMetric === 'revenue' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{Number(summary.total_revenue_period || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Cashfree Collections</span>
          </div>
        </div>

        {/* Metric 2: New Users */}
        <div
          onClick={() => setActiveMetric('users')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            activeMetric === 'users'
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">New Users ({days}d)</span>
            <span
              className={`p-2 rounded-xl ${
                activeMetric === 'users' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{summary.total_new_users || 0}</div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
            <span>Tenant staff & admin logins</span>
          </div>
        </div>

        {/* Metric 3: New Companies */}
        <div
          onClick={() => setActiveMetric('companies')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            activeMetric === 'companies'
              ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-500/20 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">New Companies ({days}d)</span>
            <span
              className={`p-2 rounded-xl ${
                activeMetric === 'companies' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'
              }`}
            >
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{summary.total_new_companies || 0}</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1 flex items-center gap-1">
            <span>Authoritative parent entities</span>
          </div>
        </div>

        {/* Metric 4: Trial Conversion */}
        <div
          onClick={() => setActiveMetric('subscriptions')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
            activeMetric === 'subscriptions'
              ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
              : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Subscriptions Initiated</span>
            <span
              className={`p-2 rounded-xl ${
                activeMetric === 'subscriptions' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-900">
            {timeSeries.reduce((acc, r) => acc + (r.subscriptions || 0), 0)}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-1 flex items-center gap-1">
            <span>Conversion rate: {summary.conversion_rate_percentage || 0}%</span>
          </div>
        </div>
      </div>

      {/* Modern Interactive SVG Timeline Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>
                {activeMetric === 'revenue' && 'Verified Revenue Flow (₹)'}
                {activeMetric === 'users' && 'New User Signups Over Time'}
                {activeMetric === 'companies' && 'Company Onboarding Velocity'}
                {activeMetric === 'subscriptions' && 'Subscription Checkout Pipeline'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any metric card above to switch trendlines. Hover points to inspect exact date-wise records.
            </p>
          </div>

          {/* Quick metric pill badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Peak: {activeMetric === 'revenue' ? `₹${chartData.maxVal.toLocaleString()}` : chartData.maxVal}
            </span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative w-full h-64 sm:h-72 select-none">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : timeSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No historical data points recorded for this window.
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-between">
              {/* SVG Area Graph */}
              <div className="relative flex-1 w-full overflow-hidden">
                <svg
                  viewBox="0 0 800 220"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={
                          activeMetric === 'revenue'
                            ? '#10b981'
                            : activeMetric === 'users'
                            ? '#2563eb'
                            : activeMetric === 'companies'
                            ? '#9333ea'
                            : '#6366f1'
                        }
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          activeMetric === 'revenue'
                            ? '#10b981'
                            : activeMetric === 'users'
                            ? '#2563eb'
                            : activeMetric === 'companies'
                            ? '#9333ea'
                            : '#6366f1'
                        }
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="20" x2="800" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="800" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Gradient Area Fill */}
                  {svgPath.area && <path d={svgPath.area} fill="url(#chartGradient)" />}

                  {/* Trend Line */}
                  {svgPath.line && (
                    <path
                      d={svgPath.line}
                      fill="none"
                      stroke={
                        activeMetric === 'revenue'
                          ? '#10b981'
                          : activeMetric === 'users'
                          ? '#2563eb'
                          : activeMetric === 'companies'
                          ? '#9333ea'
                          : '#6366f1'
                      }
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Interactive Nodes */}
                  {svgPath.coords?.map((c, i) => {
                    const isPositive = c.val > 0;
                    return (
                      <g key={i} className="cursor-pointer group">
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={isPositive ? '5' : '3'}
                          fill={isPositive ? '#ffffff' : '#cbd5e1'}
                          stroke={
                            activeMetric === 'revenue'
                              ? '#10b981'
                              : activeMetric === 'users'
                              ? '#2563eb'
                              : activeMetric === 'companies'
                              ? '#9333ea'
                              : '#6366f1'
                          }
                          strokeWidth={isPositive ? '3' : '1.5'}
                          className="transition-all hover:r-7"
                          onMouseEnter={() => setHoveredPoint(c)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full transition-all border border-slate-700"
                    style={{
                      left: `${(svgPath.coords?.find((c) => c.date === hoveredPoint.date)?.x / 800) * 100}%`,
                      top: `${svgPath.coords?.find((c) => c.date === hoveredPoint.date)?.y}px`,
                      marginTop: '-12px'
                    }}
                  >
                    <div className="font-mono text-[10px] text-slate-400">{hoveredPoint.date}</div>
                    <div className="font-bold text-white text-sm">
                      {activeMetric === 'revenue' ? `₹${hoveredPoint.val.toLocaleString()}` : hoveredPoint.val}
                    </div>
                  </div>
                )}
              </div>

              {/* X-Axis Date markers */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                <span>{timeSeries[0]?.date}</span>
                <span className="hidden sm:inline">{timeSeries[Math.floor(timeSeries.length / 2)]?.date}</span>
                <span>{timeSeries[timeSeries.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Log Table (Responsive & Clean) */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Daily Telemetry Ledger ({days} Days)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Authoritative day-by-day record of platform volume.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 self-start sm:self-auto shadow-2xs">
            {timeSeries.length} Days Recorded
          </span>
        </div>

        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">New Companies</th>
                <th className="py-3 px-4">New Users</th>
                <th className="py-3 px-4">Verified Revenue</th>
                <th className="py-3 px-4">Subscriptions Initiated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading telemetry ledger...
                  </td>
                </tr>
              ) : timeSeries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    No activity registered in this time period.
                  </td>
                </tr>
              ) : (
                timeSeries.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{row.date}</td>
                    <td className="py-2.5 px-4">
                      {row.companies > 0 ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          +{row.companies} Company
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {row.users > 0 ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          +{row.users} User
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-black text-slate-900">
                      {row.revenue > 0 ? (
                        <span className="text-emerald-700">₹{row.revenue.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {row.subscriptions > 0 ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          +{row.subscriptions} Initiated
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  Send,
  Download,
  Lock,
  MessageSquare,
  FileText,
  UserCheck,
  Building2,
  RefreshCw,
  X
} from 'lucide-react';
import superAdminService from '@/services/superAdminService';
import { ModernDropdown } from '@/components/ModernDropdown';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  WAITING_FOR_CUSTOMER: { label: 'Waiting for Customer', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RESOLVED: { label: 'Resolved', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' }
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  HIGH: { label: 'High', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  CRITICAL: { label: 'Urgent', color: 'bg-rose-50 text-rose-700 border-rose-200' }
};

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_FOR_CUSTOMER', label: 'Waiting for Customer' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' }
];

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...STATUS_OPTIONS
];

const PRIORITY_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical / Urgent' }
];

export default function SuperAdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    waiting: 0,
    resolved: 0,
    critical: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected ticket modal / drawer
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const showToast = (msg, isError = false) => {
    setNotificationMsg({ text: msg, isError });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getTickets({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery
      });
      const data = res?.data || res;
      setTickets(Array.isArray(data) ? data : (data?.tickets || []));
      if (res?.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      showToast('Failed to load platform tickets', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTickets();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, priorityFilter, searchQuery]);

  const handleOpenTicket = async (ticket) => {
    try {
      const res = await superAdminService.getTicketDetails(ticket.id);
      const details = res?.data || res;
      setSelectedTicket(details);
      setUpdatingStatus(details.status);
    } catch (err) {
      showToast('Could not fetch ticket details', true);
    }
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && updatingStatus === selectedTicket.status) {
      return;
    }

    try {
      setActionLoading(true);
      const isReply = !!replyText.trim();
      await superAdminService.updateTicket(selectedTicket.id, {
        action: isReply ? 'REPLY' : 'UPDATE_STATUS',
        message: replyText.trim() || undefined,
        replyMessage: replyText.trim() || undefined,
        isInternalNote,
        status: updatingStatus
      });

      showToast('Ticket updated successfully!');
      setReplyText('');
      setIsInternalNote(false);

      // Refresh ticket details
      const refreshed = await superAdminService.getTicketDetails(selectedTicket.id);
      const details = refreshed?.data || refreshed;
      setSelectedTicket(details);
      loadTickets();
    } catch (err) {
      showToast('Failed to submit ticket update', true);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Notification Banner */}
        {notificationMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              notificationMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span>{notificationMsg.text}</span>
            <button type="button" onClick={() => setNotificationMsg(null)} className="text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <span>Platform Control</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Support Operations</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
              <Ticket className="w-6 h-6 text-blue-600" />
              <span>Ticket Raise & Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified command center to monitor, assign, and resolve customer and tenant support inquiries.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={loadTickets}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tickets</span>
            <p className="text-2xl font-black text-slate-900">{metrics.total || tickets.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Open / New</span>
            <p className="text-2xl font-black text-emerald-700">{metrics.open || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">In Progress</span>
            <p className="text-2xl font-black text-blue-700">{metrics.inProgress || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Critical / Urgent</span>
            <p className="text-2xl font-black text-rose-700">{metrics.critical || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-1 col-span-2 md:col-span-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Resolved</span>
            <p className="text-2xl font-black text-purple-700">{metrics.resolved || 0}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, subject, tenant company..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <ModernDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={STATUS_FILTER_OPTIONS}
              className="w-full sm:w-44"
            />

            <ModernDropdown
              value={priorityFilter}
              onChange={(val) => setPriorityFilter(val)}
              options={PRIORITY_FILTER_OPTIONS}
              className="w-full sm:w-44"
            />
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
              <p className="text-xs">Loading support tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Support Tickets Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Company / Tenant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => {
                    const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
                    const priority = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => handleOpenTicket(t)}
                        className="hover:bg-blue-50/40 transition cursor-pointer"
                      >
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] text-blue-600 font-bold">
                              #{t.ticket_number}
                            </span>
                            <p className="font-bold text-slate-900 line-clamp-1">{t.subject}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800 line-clamp-1">
                              {t.business?.company_name || 'Individual User'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-600 font-medium">{t.category}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priority.color}`}>
                            {priority.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket Details & Response Drawer / Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      #{selectedTicket.ticket_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${PRIORITY_CONFIG[selectedTicket.priority]?.color}`}>
                      {PRIORITY_CONFIG[selectedTicket.priority]?.label}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900 leading-snug">{selectedTicket.subject}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Meta Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Tenant Company</span>
                    <p className="font-bold text-slate-900">{selectedTicket.business?.company_name || 'N/A'}</p>
                    <p className="text-slate-500 text-[11px]">{selectedTicket.business?.business_email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Submitted By</span>
                    <p className="font-bold text-slate-900">{selectedTicket.user?.name || 'Staff'}</p>
                    <p className="text-slate-500 text-[11px]">{selectedTicket.user?.email}</p>
                  </div>
                </div>

                {/* Original Issue Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reported Issue</h4>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attached Proofs</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={superAdminService.getAttachmentDownloadUrl(att.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold text-slate-700 transition flex items-center space-x-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{att.file_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Thread */}
                {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Discussion History</h4>
                    <div className="space-y-3">
                      {selectedTicket.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-4 rounded-2xl text-xs leading-relaxed ${
                            m.is_internal_note
                              ? 'bg-amber-50/70 border border-amber-200 text-amber-900'
                              : m.sender_role === 'SUPER_ADMIN'
                              ? 'bg-blue-50 border border-blue-200 text-blue-900 ml-4'
                              : 'bg-slate-50 border border-slate-200 text-slate-800 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-75">
                            <span>{m.sender_role === 'SUPER_ADMIN' ? 'VEXA Support Engineering' : (m.sender_name || 'Client Staff')}</span>
                            <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                {/* Action / Reply Footer */}
              <form onSubmit={handleSendAdminReply} className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700">Update Status:</span>
                    <ModernDropdown
                      value={updatingStatus}
                      onChange={(val) => setUpdatingStatus(val)}
                      options={STATUS_OPTIONS}
                      dropUp={true}
                      className="w-44"
                      buttonClassName="py-1 px-3 text-xs"
                    />
                  </div>

                  <label className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0"
                    />
                    <span>Internal note (hidden from customer)</span>
                  </label>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official response or internal team note..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Update</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}


'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import superAdminService from '@/services/superAdminService';
import { ModernDropdown } from '@/components/ModernDropdown';
import {
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  CreditCard,
  User,
  MessageSquare,
  X,
  Send,
  Eye,
  Check,
  Tag
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'FOLLOW_UP', label: 'Follow-up Required' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'CLOSED_LOST', label: 'Closed / Lost' }
];

const STATUS_BADGES = {
  NEW: { label: 'New', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  CONTACTED: { label: 'Contacted', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  FOLLOW_UP: { label: 'Follow-up Required', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  NEGOTIATION: { label: 'Negotiation', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  CONVERTED: { label: 'Converted', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CLOSED_LOST: { label: 'Closed / Lost', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
};

export default function SalesEnquiriesPage() {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    follow_up: 0,
    negotiation: 0,
    converted: 0,
    closed_lost: 0
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Detail Modal / Drawer State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('INTERNAL_NOTE');
  const [newStatus, setNewStatus] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [contactDate, setContactDate] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Razorpay Payment Link Generation
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getSalesEnquiries({
        search,
        status: statusFilter,
        page,
        limit: 25
      });
      const data = res?.data || res || {};
      setEnquiries(data.enquiries || []);
      if (data.stats) setStats(data.stats);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch sales enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const openEnquiryDetail = async (enquiryId) => {
    setDetailLoading(true);
    setSelectedEnquiry(null);
    setFeedback(null);
    try {
      const res = await superAdminService.getSalesEnquiryDetails(enquiryId);
      const enq = res?.data || res;
      setSelectedEnquiry(enq);
      setNewStatus(enq.status || 'NEW');
      setAssignedAdmin(enq.assigned_admin || '');
      setNextAction(enq.next_action || '');
      setFollowUpDate(enq.follow_up_date ? new Date(enq.follow_up_date).toISOString().slice(0, 16) : '');
      setContactDate(enq.contact_date ? new Date(enq.contact_date).toISOString().slice(0, 10) : '');
      setNoteText('');
    } catch (err) {
      console.error('Failed to open enquiry:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateEnquiry = async (e) => {
    e?.preventDefault();
    if (!selectedEnquiry) return;
    setUpdating(true);
    setFeedback(null);
    try {
      const payload = {
        status: newStatus,
        assigned_admin: assignedAdmin,
        next_action: nextAction,
        follow_up_date: followUpDate || null,
        contact_date: contactDate || null,
        note_text: noteText,
        note_type: noteType
      };

      const res = await superAdminService.updateSalesEnquiry(selectedEnquiry.id, payload);
      const updated = res?.data || res;
      setSelectedEnquiry(updated);
      setNoteText('');
      setFeedback({ type: 'success', text: 'Enquiry updated and activity recorded successfully.' });
      fetchEnquiries();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update enquiry' });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateLifetimeOrder = async () => {
    if (!selectedEnquiry) return;
    setPaymentLoading(true);
    setFeedback(null);
    try {
      const res = await superAdminService.createLifetimePaymentLink(selectedEnquiry.id);
      const data = res?.data || res;
      setFeedback({
        type: 'success',
        text: `Razorpay Order generated successfully: ${data.order_id}. You can now provide checkout instructions to the client.`
      });
      // Refresh details
      openEnquiryDetail(selectedEnquiry.id);
      fetchEnquiries();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to create Razorpay order' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>Sales Management</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-blue-600">Lifetime Plan Enquiries</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span>Lifetime Sales Enquiries & Leads</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Command center for customer enquiries, sales follow-ups, and Lifetime Plan (₹59,999) conversions.
            </p>
          </div>

          <button
            onClick={fetchEnquiries}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Top 7 Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total</span>
            <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">New</span>
            <p className="text-xl font-black text-blue-800 mt-1">{stats.new}</p>
          </div>
          <div className="bg-cyan-50/60 p-4 rounded-xl border border-cyan-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">Contacted</span>
            <p className="text-xl font-black text-cyan-800 mt-1">{stats.contacted}</p>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Follow-Up</span>
            <p className="text-xl font-black text-amber-800 mt-1">{stats.follow_up}</p>
          </div>
          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Negotiation</span>
            <p className="text-xl font-black text-purple-800 mt-1">{stats.negotiation}</p>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Converted</span>
            <p className="text-xl font-black text-emerald-800 mt-1">{stats.converted}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Closed / Lost</span>
            <p className="text-xl font-black text-slate-700 mt-1">{stats.closed_lost}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Enquiry #, name, business, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="w-full sm:w-64">
            <ModernDropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              placeholder="Filter by Status"
            />
          </div>
        </div>

        {/* Enquiries Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Loading sales enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No Lifetime Sales Enquiries Found</p>
              <p className="text-xs text-slate-400">
                {search || statusFilter !== 'ALL'
                  ? 'Try clearing search filters to see all enquiries.'
                  : 'Submitted enquiries from the Lifetime pricing card will appear here in real-time.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Enquiry ID</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Business / Company</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-3">Plan</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Assigned Admin</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((enq) => {
                    const badge = STATUS_BADGES[enq.status] || STATUS_BADGES.NEW;
                    return (
                      <tr key={enq.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {enq.enquiry_number}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {enq.contact_name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          <div className="font-semibold">{enq.business_name}</div>
                          {enq.company_id && (
                            <span className="text-[10px] text-slate-400 font-mono">({enq.company_id})</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{enq.mobile}</div>
                          <div className="text-[11px] text-slate-400">{enq.email}</div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {enq.interested_plan}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {formatDate(enq.created_at)}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                          {enq.assigned_admin ? (
                            <span className="font-semibold text-slate-800">{enq.assigned_admin}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEnquiryDetail(enq.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Manage Lead</span>
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

        {/* Slide-over Detail Drawer */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {selectedEnquiry.enquiry_number}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGES[selectedEnquiry.status]?.bg} ${STATUS_BADGES[selectedEnquiry.status]?.text} ${STATUS_BADGES[selectedEnquiry.status]?.border}`}>
                      {STATUS_BADGES[selectedEnquiry.status]?.label || selectedEnquiry.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {selectedEnquiry.business_name}
                  </h2>
                  <p className="text-xs text-slate-500">Contact: {selectedEnquiry.contact_name}</p>
                </div>

                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {feedback && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{feedback.text}</span>
                  </div>
                )}

                {/* Lead Overview Grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Mobile Phone</span>
                    <a href={`tel:${selectedEnquiry.mobile}`} className="font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedEnquiry.mobile}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Email Address</span>
                    <a href={`mailto:${selectedEnquiry.email}`} className="font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{selectedEnquiry.email}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Business Type</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedEnquiry.business_type || 'General Business'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Current Plan</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedEnquiry.current_plan || 'New Prospect'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Preferred Contact Time</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedEnquiry.preferred_time || 'Anytime'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Submission Time</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{formatDate(selectedEnquiry.created_at)}</span>
                  </div>
                </div>

                {/* Requirements / Message Box */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Customer Requirements</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedEnquiry.message}
                  </div>
                </div>

                {/* Razorpay Lifetime Purchase Actions */}
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Lifetime Purchase Checkout Authorization</span>
                      </h4>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Generate a secure ₹59,999 Razorpay Order for this customer to finalize conversion.
                      </p>
                    </div>
                    {selectedEnquiry.payment_status === 'PAID' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        PAID & CONVERTED
                      </span>
                    )}
                  </div>

                  {selectedEnquiry.razorpay_order_id ? (
                    <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Razorpay Order ID:</span>
                        <span className="font-bold text-slate-900">{selectedEnquiry.razorpay_order_id}</span>
                      </div>
                      {selectedEnquiry.razorpay_payment_id && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment ID:</span>
                          <span className="font-bold text-emerald-700">{selectedEnquiry.razorpay_payment_id}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Order Amount:</span>
                        <span className="font-bold text-slate-900">₹59,999.00</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateLifetimeOrder}
                      disabled={paymentLoading}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{paymentLoading ? 'Generating Order...' : 'Create Lifetime Payment Link — ₹59,999'}</span>
                    </button>
                  )}
                </div>

                {/* Sales Follow-up & Status Update Form */}
                <form onSubmit={handleUpdateEnquiry} className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Update Sales Status & Follow-up</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Status</label>
                      <ModernDropdown
                        options={STATUS_OPTIONS.filter((o) => o.value !== 'ALL')}
                        value={newStatus}
                        onChange={(val) => setNewStatus(val)}
                        placeholder="Select Status"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Assigned Sales Admin</label>
                      <input
                        type="text"
                        placeholder="e.g., Alex Johnson"
                        value={assignedAdmin}
                        onChange={(e) => setAssignedAdmin(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Last Contact Date</label>
                      <input
                        type="date"
                        value={contactDate}
                        onChange={(e) => setContactDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Scheduled Follow-up</label>
                      <input
                        type="datetime-local"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Next Action Required</label>
                    <input
                      type="text"
                      placeholder="e.g., Demo call scheduled with client tech lead"
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Add Internal Discussion Note (Hidden from Customer)</label>
                    <textarea
                      rows={3}
                      placeholder="Enter call notes, requirements discussed, objections, or negotiation points..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{updating ? 'Saving Changes...' : 'Save Enquiry Updates & Activity'}</span>
                  </button>
                </form>

                {/* Audit & Notes History */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Activity & Notes History</h4>
                  {selectedEnquiry.notes?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEnquiry.notes.map((n) => (
                        <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{n.author_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{formatDate(n.created_at)}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-medium">{n.note_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}


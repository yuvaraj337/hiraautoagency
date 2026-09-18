'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  Phone,
  Printer,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  XCircle,
  RefreshCw,
  Edit,
  DollarSign
} from 'lucide-react';

interface Booking {
  id: string;
  booking_code: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  bike_id: string;
  bike_name: string;
  bike_category: string;
  bike_image?: string;
  variant_id: string;
  variant_name: string;
  variant_color: string;
  total_price: number;
  advance_amount: number;
  balance_amount: number;
  payment_status: string;
  booking_status: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Booking for Modal Actions
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalMode, setModalMode] = useState<'details' | 'payment' | 'status' | 'print'>('details');

  // Payment Recording State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentGateway, setPaymentGateway] = useState<'CASH' | 'UPI' | 'NEFT'>('CASH');
  const [actionLoading, setActionLoading] = useState(false);

  // Status Change State
  const [newBookingStatus, setNewBookingStatus] = useState('');
  const [sendWhatsAppOnStatus, setSendWhatsAppOnStatus] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/bookings?status=${statusFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleRecordPayment = async () => {
    if (!selectedBooking || paymentAmount <= 0) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBooking.id,
          record_payment_amount: paymentAmount,
          payment_gateway: paymentGateway,
          send_whatsapp: true
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Recorded ₹${paymentAmount.toLocaleString('en-IN')} payment successfully!`);
        setSelectedBooking(null);
        await fetchBookings();
      } else {
        alert(data.error || 'Failed to record payment');
      }
    } catch (e) {
      alert('Error recording payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newBookingStatus) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBooking.id,
          booking_status: newBookingStatus,
          send_whatsapp: sendWhatsAppOnStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(null);
        await fetchBookings();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (e) {
      alert('Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Confirmed</span>;
      case 'ALLOTTED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Vehicle Allotted</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Delivered</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">Pending</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white/70">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Fully Paid</span>;
      case 'Partially Paid':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Advance Paid</span>;
      case 'Pending':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">Payment Due</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white/70">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-yamaha-cyan" />
            Yamaha Bike Bookings & Order Ledger
          </h1>
          <p className="text-sm text-white/50">
            Manage customer bike reservations, track advance payments, record offline cash collections, and schedule vehicle handovers.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by code, customer name, phone, bike..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121722] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-yamaha-cyan"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'CONFIRMED', 'ALLOTTED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-yamaha-cyan text-black font-extrabold shadow-sm'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={fetchBookings}
            title="Refresh"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-[#121722] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10 font-bold">
              <tr>
                <th className="py-3.5 px-4">Booking Code</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Model & Variant</th>
                <th className="py-3.5 px-4">Pricing Breakdown</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/40">
                    <div className="w-6 h-6 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-2" />
                    Loading bike bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/40">
                    No bike bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-white text-xs block">
                        {b.booking_code}
                      </span>
                      <span className="text-[10px] text-white/40 block mt-0.5">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{b.customer_name}</div>
                      <a
                        href={`tel:${b.customer_phone}`}
                        className="text-xs text-yamaha-cyan hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        +91 {b.customer_phone}
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{b.bike_name}</div>
                      <div className="text-xs text-white/50">{b.variant_name} • {b.variant_color}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono">
                      <div className="text-white font-bold">
                        ₹{b.total_price.toLocaleString('en-IN')}
                      </div>
                      <div className="text-emerald-400 font-semibold text-[11px]">
                        Adv: ₹{b.advance_amount.toLocaleString('en-IN')}
                      </div>
                      {b.balance_amount > 0 ? (
                        <div className="text-amber-400/90 text-[11px]">
                          Bal: ₹{b.balance_amount.toLocaleString('en-IN')}
                        </div>
                      ) : (
                        <div className="text-white/40 text-[10px] font-sans">Zero Balance</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getPaymentBadge(b.payment_status)}
                      <span className="text-[10px] text-white/40 block mt-0.5 capitalize">
                        via {b.payment_method}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(b.booking_status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Record Payment Button */}
                        {b.balance_amount > 0 && (
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setModalMode('payment');
                              setPaymentAmount(b.balance_amount);
                            }}
                            title="Collect Cash / Offline Payment"
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Collect
                          </button>
                        )}

                        {/* Status Change */}
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setModalMode('status');
                            setNewBookingStatus(b.booking_status);
                          }}
                          title="Update Status"
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg border border-white/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/91${b.customer_phone}?text=Namaste%20${encodeURIComponent(b.customer_name)},%20greetings%20from%20Hira%20Auto%20Agency%20Yamaha%20Mahagama.%20Regarding%20your%20booking%20${b.booking_code}%20for%20Yamaha%20${encodeURIComponent(b.bike_name)}...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send WhatsApp"
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        {/* Print Booking Slip */}
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setModalMode('print');
                          }}
                          title="Print Booking Voucher"
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg border border-white/10 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {selectedBooking && modalMode === 'payment' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Record Offline Payment
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-[#141A29] p-4 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Customer:</span>
                <span className="font-bold text-white">{selectedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Booking Code:</span>
                <span className="font-mono text-yamaha-cyan font-bold">{selectedBooking.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Total Price:</span>
                <span className="font-mono text-white">₹{selectedBooking.total_price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Current Advance:</span>
                <span className="font-mono text-emerald-400">₹{selectedBooking.advance_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                <span className="text-amber-400">Remaining Due:</span>
                <span className="font-mono text-amber-400 text-sm">₹{selectedBooking.balance_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Payment Collection Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'UPI', 'NEFT'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentGateway(mode)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentGateway === mode
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-[#141A29] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  max={selectedBooking.balance_amount}
                  onChange={(e) => setPaymentAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-lg focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[11px] text-white/40 block mt-1">
                  Remaining after this payment: ₹{Math.max(0, selectedBooking.balance_amount - paymentAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={actionLoading || paymentAmount <= 0}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Confirm Payment Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {selectedBooking && modalMode === 'status' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Edit className="w-5 h-5 text-yamaha-cyan" />
                Update Booking Stage
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Select New Stage
                </label>
                <select
                  value={newBookingStatus}
                  onChange={(e) => setNewBookingStatus(e.target.value)}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan"
                >
                  <option value="PENDING">PENDING (Awaiting Review)</option>
                  <option value="CONFIRMED">CONFIRMED (Booking Accepted)</option>
                  <option value="ALLOTTED">ALLOTTED (Chassis Assigned from Stock)</option>
                  <option value="DELIVERED">DELIVERED (Keys Handed to Customer)</option>
                  <option value="CANCELLED">CANCELLED (Refund / Nullified)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sendWa"
                  checked={sendWhatsAppOnStatus}
                  onChange={(e) => setSendWhatsAppOnStatus(e.target.checked)}
                  className="rounded border-white/20 bg-[#141A29] text-yamaha-cyan focus:ring-yamaha-cyan"
                />
                <label htmlFor="sendWa" className="text-xs text-white/80 select-none cursor-pointer">
                  Send automated WhatsApp status update to customer (+91 {selectedBooking.customer_phone})
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-yamaha-racing hover:bg-blue-600 text-white shadow-lg shadow-yamaha-blue/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT BOOKING VOUCHER (Printable Dialog) */}
      {selectedBooking && modalMode === 'print' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl w-full max-w-2xl p-8 shadow-2xl space-y-6 print:m-0 print:p-4 print:shadow-none animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Brand */}
            <div className="flex items-start justify-between border-b-2 border-black pb-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-blue-900">
                  HIRA AUTO AGENCY
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                  Authorised Yamaha Two-Wheeler Dealership
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  Kechua Chowk, Mahagama Main Road, Godda, Jharkhand 814154
                </p>
                <p className="text-xs text-zinc-600 font-semibold">
                  Phone: +91 62012 38401
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded bg-blue-900 text-white text-xs font-black uppercase tracking-wider">
                  BOOKING RECEIPT
                </span>
                <p className="text-xs font-mono font-bold mt-2 text-zinc-800">
                  No: {selectedBooking.booking_code}
                </p>
                <p className="text-xs text-zinc-500">
                  Date: {new Date(selectedBooking.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {/* Customer & Vehicle Details Grid */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="border border-zinc-200 p-4 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">
                  Customer Particulars
                </span>
                <p className="font-bold text-base text-zinc-900">{selectedBooking.customer_name}</p>
                <p className="text-zinc-600 text-xs">Mobile: +91 {selectedBooking.customer_phone}</p>
                {selectedBooking.customer_email && (
                  <p className="text-zinc-600 text-xs">Email: {selectedBooking.customer_email}</p>
                )}
                <p className="text-zinc-500 text-xs">Place: Godda / Mahagama, Jharkhand</p>
              </div>

              <div className="border border-zinc-200 p-4 rounded-xl space-y-1">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">
                  Vehicle Allotment Details
                </span>
                <p className="font-bold text-base text-blue-950">{selectedBooking.bike_name}</p>
                <p className="text-zinc-700 text-xs font-semibold">Variant: {selectedBooking.variant_name}</p>
                <p className="text-zinc-600 text-xs">Color: {selectedBooking.variant_color}</p>
                <p className="text-zinc-500 text-xs capitalize">Booking Stage: {selectedBooking.booking_status}</p>
              </div>
            </div>

            {/* Financial Ledger Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 text-[11px] uppercase font-bold text-zinc-600 border-b border-zinc-200">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  <tr>
                    <td className="py-2 px-4 font-semibold">
                      Ex-Showroom Price ({selectedBooking.bike_name} - {selectedBooking.variant_name})
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">
                      ₹{selectedBooking.total_price.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-900 font-semibold">
                    <td className="py-2 px-4">
                      Advance Received ({selectedBooking.payment_method})
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-emerald-700">
                      - ₹{selectedBooking.advance_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-zinc-50 font-bold text-zinc-900 border-t-2 border-zinc-300">
                    <td className="py-2.5 px-4">
                      Balance Due at Delivery
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-base text-blue-900">
                      ₹{selectedBooking.balance_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms and Seal */}
            <div className="flex items-end justify-between pt-4 border-t border-zinc-200 text-xs text-zinc-500">
              <div className="max-w-xs space-y-1">
                <p className="font-semibold text-zinc-700">Terms & Conditions:</p>
                <p className="text-[10px]">1. Final price is subject to statutory RTO, Insurance, and Govt. tax variations at delivery time.</p>
                <p className="text-[10px]">2. Vehicle allotment depends on stock arrival from Yamaha India plant.</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-zinc-400 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                  Authorised Signatory / Seal
                </span>
                <p className="text-[9px] text-zinc-500">Hira Auto Agency, Mahagama</p>
              </div>
            </div>

            {/* Print Controls (Hidden during print) */}
            <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-black"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-900 hover:bg-blue-800 text-white shadow-lg transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

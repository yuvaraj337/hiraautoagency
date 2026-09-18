'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Phone,
  Printer,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Eye,
  XCircle
} from 'lucide-react';

interface Payment {
  id: string;
  payment_code: string;
  booking_id?: string;
  booking_code?: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  bike_name?: string;
  variant_name?: string;
  amount: number;
  payment_type: string;
  gateway: string;
  transaction_id: string;
  status: string;
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/payments?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.payment_code?.toLowerCase().includes(q) ||
      p.transaction_id?.toLowerCase().includes(q) ||
      p.customer_name?.toLowerCase().includes(q) ||
      p.customer_phone?.includes(q) ||
      p.booking_code?.toLowerCase().includes(q)
    );
  });

  // Financial Stats
  const totalCollected = payments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const offlineCollected = payments
    .filter((p) => p.status === 'Paid' && (p.gateway === 'CASH' || p.gateway === 'NEFT'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const onlineCollected = payments
    .filter((p) => p.status === 'Paid' && p.gateway !== 'CASH' && p.gateway !== 'NEFT')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-yamaha-cyan" />
            Financial Payments Ledger
          </h1>
          <p className="text-sm text-white/50">
            Immutable audit record of all advance deposits, cash settlements, and digital payments for Hira Auto Agency.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-white/50 block">Total Verified Collections</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">{payments.length} total receipts recorded</span>
          </div>
        </div>

        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yamaha-racing/20 border border-yamaha-cyan/30 flex items-center justify-center text-yamaha-cyan">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-white/50 block">Online / UPI Gateway</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              ₹{onlineCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-yamaha-cyan font-semibold">Instant digital settlement</span>
          </div>
        </div>

        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-white/50 block">Cash & Dealership Direct</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              ₹{offlineCollected.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-amber-400 font-semibold">Counter showroom collections</span>
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search payment code, transaction ID, customer, booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121722] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-yamaha-cyan"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Paid', 'Pending', 'Failed'].map((st) => (
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
            onClick={fetchPayments}
            title="Refresh"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-[#121722] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10 font-bold">
              <tr>
                <th className="py-3.5 px-4">Payment Code</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Booking Reference</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method / TXN ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/40">
                    <div className="w-6 h-6 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-2" />
                    Loading payment ledger...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-white/40">
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white text-xs">
                      {p.payment_code}
                    </td>
                    <td className="py-4 px-4 text-xs text-white/60">
                      {new Date(p.created_at).toLocaleDateString()}{' '}
                      <span className="text-white/40 block text-[10px]">
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{p.customer_name}</div>
                      <span className="text-xs text-white/40">+91 {p.customer_phone}</span>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {p.booking_code ? (
                        <div>
                          <span className="font-mono text-yamaha-cyan font-bold block">{p.booking_code}</span>
                          <span className="text-white/50 text-[11px]">{p.bike_name}</span>
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Direct Deposit</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-white/10 text-white tracking-wider">
                        {p.gateway}
                      </span>
                      <span className="text-[10px] font-mono text-white/40 block mt-0.5 truncate max-w-[140px]">
                        {p.transaction_id}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {p.status === 'Paid' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        title="Print Payment Slip"
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg border border-white/10 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE PAYMENT SLIP MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 print:m-0 print:p-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="border-b-2 border-black pb-3 text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-blue-900">
                HIRA AUTO AGENCY
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Yamaha Dealership • Mohanpur, Godda, Jharkhand
              </p>
              <div className="inline-block mt-2 px-2.5 py-0.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded">
                Official Payment Receipt
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs border border-zinc-200 p-3 rounded-xl">
              <div className="flex justify-between">
                <span className="text-zinc-500">Receipt No:</span>
                <span className="font-mono font-bold text-zinc-900">{selectedPayment.payment_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Time:</span>
                <span className="font-medium text-zinc-800">{new Date(selectedPayment.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer Name:</span>
                <span className="font-bold text-zinc-900">{selectedPayment.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mobile Phone:</span>
                <span className="text-zinc-800 font-mono">+91 {selectedPayment.customer_phone}</span>
              </div>
              {selectedPayment.booking_code && (
                <div className="flex justify-between border-t border-zinc-100 pt-2">
                  <span className="text-zinc-500">Against Booking:</span>
                  <span className="font-mono font-bold text-blue-900">{selectedPayment.booking_code}</span>
                </div>
              )}
              {selectedPayment.bike_name && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vehicle:</span>
                  <span className="font-semibold text-zinc-800">{selectedPayment.bike_name}</span>
                </div>
              )}
            </div>

            {/* Amount Box */}
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                Amount Received
              </span>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-1">
                ₹{selectedPayment.amount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-zinc-600 mt-1 font-semibold">
                Payment Mode: {selectedPayment.gateway} ({selectedPayment.transaction_id})
              </div>
            </div>

            {/* Seal / Footer */}
            <div className="flex items-end justify-between pt-3 border-t border-zinc-200 text-[10px] text-zinc-500">
              <div>
                <p>Status: <span className="font-bold text-emerald-700">VERIFIED / PAID</span></p>
                <p>System Generated Tax Invoice</p>
              </div>
              <div className="text-center">
                <div className="w-24 border-b border-zinc-400 mb-1" />
                <span className="font-bold text-zinc-700">Cashier Signature</span>
              </div>
            </div>

            {/* Print Controls */}
            <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
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
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

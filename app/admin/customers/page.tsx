'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  Calendar,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  FileText
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected customer for 360 profile drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Notes state
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // Load single customer 360 timeline
  const loadProfile = async (id: string) => {
    setSelectedCustomerId(id);
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
        setNoteText(data.customer.notes || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  // Toggle per-customer reminders ON/OFF
  const toggleReminders = async (customerId: string, currentValue: number) => {
    const newValue = currentValue === 1 ? 0 : 1;
    try {
      await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerId, whatsapp_reminders_enabled: newValue })
      });

      // Update local state
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, whatsapp_reminders_enabled: newValue } : c))
      );
      if (profileData && profileData.customer.id === customerId) {
        setProfileData({
          ...profileData,
          customer: { ...profileData.customer, whatsapp_reminders_enabled: newValue }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedCustomerId) return;
    setSavingNote(true);
    try {
      await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCustomerId, notes: noteText })
      });
      loadProfile(selectedCustomerId);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black uppercase text-white font-display">
            Customer Relationship Management
          </h1>
          <p className="text-xs text-gray-400">
            Search, manage profiles, inspect 360° journey timelines and toggle WhatsApp reminders.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="pl-9 pr-4 py-2 rounded-xl glass-card text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yamaha-cyan w-full sm:w-72"
          />
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-black/40 text-gray-400 uppercase text-[10px] font-bold border-b border-white/10">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Showroom Visits</th>
                <th className="p-4">Bike Bookings</th>
                <th className="p-4">Total Paid</th>
                <th className="p-4">WhatsApp Reminders</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((cust) => (
                <tr key={cust.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white text-sm">{cust.name}</p>
                    <span className="text-[10px] text-gray-400">ID: {cust.id}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-mono text-white font-semibold">{cust.phone}</p>
                    <span className="text-[10px] text-gray-400">{cust.email || 'No email registered'}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-900/30 text-blue-300 font-bold">
                      {cust.visit_count || 0} Visits
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-900/30 text-emerald-300 font-bold">
                      {cust.booking_count || 0} Bookings
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white font-display">
                    ₹{(cust.total_spent || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    {/* PER-CUSTOMER REMINDER TOGGLE BUTTON */}
                    <button
                      onClick={() => toggleReminders(cust.id, cust.whatsapp_reminders_enabled)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                        cust.whatsapp_reminders_enabled === 1
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cust.whatsapp_reminders_enabled === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                        }`}
                      />
                      <span>{cust.whatsapp_reminders_enabled === 1 ? 'REMINDERS: ON' : 'REMINDERS: OFF'}</span>
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold text-[10px] uppercase">
                      {cust.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => loadProfile(cust.id)}
                      className="px-3 py-1.5 rounded-lg bg-yamaha-racing hover:bg-blue-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                    >
                      View 360° Profile
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 text-xs">
                    No customers found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° CUSTOMER PROFILE DRAWER / MODAL */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex justify-end">
          <div className="w-full max-w-2xl bg-[#0B0E14] h-full border-l border-white/10 flex flex-col justify-between overflow-y-auto p-6 animate-slideRight">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-yamaha-cyan tracking-widest">
                    Customer 360° Profile
                  </span>
                  <h2 className="text-xl font-black text-white uppercase font-display">
                    {profileData?.customer?.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {profileLoading ? (
                <div className="py-20 flex justify-center text-yamaha-cyan">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Customer Info Card */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold text-white font-mono">{profileData?.customer?.phone}</span>
                      </div>
                      <button
                        onClick={() =>
                          toggleReminders(
                            profileData.customer.id,
                            profileData.customer.whatsapp_reminders_enabled
                          )
                        }
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          profileData?.customer?.whatsapp_reminders_enabled === 1
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {profileData?.customer?.whatsapp_reminders_enabled === 1
                          ? 'WhatsApp Reminders: ON'
                          : 'WhatsApp Reminders: OFF'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>{profileData?.customer?.email || 'No email on record'}</span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Registered: {new Date(profileData?.customer?.created_at).toLocaleDateString('en-IN')}</span>
                      <span>Status: <strong className="text-white">{profileData?.customer?.status}</strong></span>
                    </div>
                  </div>

                  {/* Notes Editor */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/10">
                    <label className="text-[11px] font-bold uppercase text-gray-300 block mb-2">
                      Internal Dealership Notes
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={2}
                      placeholder="Add confidential customer preferences or interaction notes..."
                      className="w-full p-2.5 rounded-xl glass-card text-xs text-white border border-white/10 focus:border-yamaha-cyan focus:outline-none resize-none mb-2"
                    />
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="px-4 py-1.5 rounded-lg bg-yamaha-racing text-white text-[11px] font-bold uppercase disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>

                  {/* CHRONOLOGICAL CUSTOMER JOURNEY TIMELINE */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 mb-4 font-display">
                      Customer Activity Timeline
                    </h3>

                    <div className="space-y-4 relative before:content-[''] before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                      {profileData?.timeline?.map((item: any, idx: number) => (
                        <div key={idx} className="relative flex items-start gap-4 pl-8">
                          <span className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-yamaha-racing border-2 border-[#0B0E14]" />
                          <div className="glass-card p-3.5 rounded-xl border border-white/5 flex-1 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white uppercase text-[11px]">{item.title}</span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(item.timestamp).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-300 text-[11px] leading-relaxed whitespace-pre-line">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 mt-6">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="w-full py-2.5 rounded-xl glass-panel hover:bg-white/10 text-white font-bold text-xs uppercase"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

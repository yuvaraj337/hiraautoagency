'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Bike,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  CalendarCheck,
  RefreshCw,
  Eye,
  Edit,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

interface Visit {
  id: string;
  visit_code: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  bike_id?: string;
  bike_name?: string;
  variant_name?: string;
  visit_date: string;
  visit_time: string;
  status: string;
  notes?: string;
  created_at: string;
}

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [calendarMap, setCalendarMap] = useState<Record<string, Visit[]>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Calendar month state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Edit / Reschedule Modal
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/visits?status=${statusFilter}`;
      if (selectedDate) url += `&date=${selectedDate}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits);
        setCalendarMap(data.calendar || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [statusFilter, selectedDate]);

  const handleOpenEdit = (v: Visit) => {
    setActiveVisit(v);
    setEditStatus(v.status);
    setEditDate(v.visit_date);
    setEditTime(v.visit_time);
    setEditNotes(v.notes || '');
  };

  const handleSaveVisit = async () => {
    if (!activeVisit) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeVisit.id,
          status: editStatus,
          visit_date: editDate,
          visit_time: editTime,
          notes: editNotes,
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveVisit(null);
        await fetchVisits();
      } else {
        alert(data.error || 'Failed to update visit');
      }
    } catch (e) {
      alert('Error updating visit');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Confirmed</span>;
      case 'SCHEDULED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Scheduled</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">Completed</span>;
      case 'RESCHEDULED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Rescheduled</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">Cancelled</span>;
      case 'NO_SHOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">No Show</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white/70">{status}</span>;
    }
  };

  // Filtered list by query
  const filteredVisits = visits.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.visit_code?.toLowerCase().includes(q) ||
      v.customer_name?.toLowerCase().includes(q) ||
      v.customer_phone?.includes(q) ||
      v.bike_name?.toLowerCase().includes(q)
    );
  });

  // Calendar Helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-yamaha-cyan" />
            Showroom Visits & Test Drives
          </h1>
          <p className="text-sm text-white/50">
            Track scheduled test rides, showroom appointments, and customer visits at Mohanpur dealership.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table' ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30' : 'text-white/60 hover:text-white'
            }`}
          >
            Table View ({filteredVisits.length})
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'calendar' ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30' : 'text-white/60 hover:text-white'
            }`}
          >
            Calendar Schedule
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search code, customer, bike, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121722] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-yamaha-cyan transition-colors"
            />
          </div>

          {/* Date Picker Filter */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#121722] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-yamaha-cyan"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-white/40 hover:text-white underline"
            >
              Clear Date
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED', 'NO_SHOW'].map(st => (
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
            onClick={fetchVisits}
            title="Refresh"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white ml-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-[#121722] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Visit Code</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Interested Bike</th>
                  <th className="py-3.5 px-4">Scheduled Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-white/40">
                      <div className="w-6 h-6 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-2" />
                      Loading showroom visits...
                    </td>
                  </tr>
                ) : filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-white/40">
                      No showroom visits found for this criteria.
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white text-xs">
                        {v.visit_code}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{v.customer_name}</div>
                        <a
                          href={`tel:${v.customer_phone}`}
                          className="text-xs text-yamaha-cyan hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          +91 {v.customer_phone}
                        </a>
                      </td>
                      <td className="py-4 px-4">
                        {v.bike_name ? (
                          <div>
                            <span className="font-bold text-white block">{v.bike_name}</span>
                            {v.variant_name && (
                              <span className="text-xs text-white/50">{v.variant_name}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-white/40 italic">General Showroom Visit</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-white font-medium text-xs">
                          <CalendarIcon className="w-3.5 h-3.5 text-yamaha-cyan" />
                          {v.visit_date}
                        </div>
                        <div className="flex items-center gap-1.5 text-white/60 text-xs mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {v.visit_time}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(v.status)}
                      </td>
                      <td className="py-4 px-4 max-w-[200px] truncate text-xs text-white/50">
                        {v.notes || '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/91${v.customer_phone}?text=Hello%20${encodeURIComponent(v.customer_name)},%20greetings%20from%20Hira%20Auto%20Agency%20Yamaha%20Mohanpur.%20Regarding%20your%20showroom%20visit%20${v.visit_code}...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Send WhatsApp"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(v)}
                            title="Update Status / Reschedule"
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg border border-white/10 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
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
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-yamaha-cyan" />
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white/80"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-black text-white/40 uppercase py-2">
                {d}
              </div>
            ))}

            {/* Empty slots for month padding */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] bg-white/[0.01] rounded-xl border border-dashed border-white/5" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayVisits = calendarMap[dateStr] || [];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewMode('table');
                  }}
                  className={`min-h-[110px] p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-yamaha-racing/10 border-yamaha-cyan shadow-sm shadow-yamaha-cyan/20'
                      : dayVisits.length > 0
                      ? 'bg-[#121722] border-white/20 hover:border-yamaha-cyan/60'
                      : 'bg-[#121722]/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-yamaha-cyan font-black' : 'text-white/80'}`}>
                      {dayNum}
                    </span>
                    {dayVisits.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-yamaha-racing text-white">
                        {dayVisits.length}
                      </span>
                    )}
                  </div>

                  {/* Preview of visits in the cell */}
                  <div className="space-y-1 mt-1">
                    {dayVisits.slice(0, 2).map((v) => (
                      <div
                        key={v.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/90 truncate flex items-center justify-between"
                        title={`${v.visit_time} - ${v.customer_name} (${v.bike_name || 'General'})`}
                      >
                        <span className="font-bold">{v.visit_time.split(' ')[0]}</span>
                        <span className="truncate ml-1 opacity-80">{v.customer_name}</span>
                      </div>
                    ))}
                    {dayVisits.length > 2 && (
                      <div className="text-[9px] text-yamaha-cyan font-bold text-center">
                        +{dayVisits.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT / RESCHEDULE MODAL */}
      {activeVisit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-yamaha-cyan" />
                  Manage Showroom Visit
                </h3>
                <span className="text-xs font-mono text-yamaha-cyan font-bold">
                  Code: {activeVisit.visit_code}
                </span>
              </div>
              <button
                onClick={() => setActiveVisit(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Customer & Bike Info Summary */}
            <div className="bg-[#141A29] p-4 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Customer:</span>
                <span className="font-bold text-white">{activeVisit.customer_name} (+91 {activeVisit.customer_phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Interested Bike:</span>
                <span className="font-bold text-yamaha-cyan">{activeVisit.bike_name || 'General Visit'} {activeVisit.variant_name ? `(${activeVisit.variant_name})` : ''}</span>
              </div>
            </div>

            {/* Form Controls */}
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Visit Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="RESCHEDULED">RESCHEDULED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="NO_SHOW">NO_SHOW</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                  >
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Dealership Staff Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Customer requested test ride on R15 V4 Racing Blue; interested in exchange of old Hero Splendor..."
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl p-3 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-yamaha-cyan"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveVisit(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVisit}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-yamaha-racing text-white shadow-lg shadow-yamaha-blue/40 hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Update Visit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

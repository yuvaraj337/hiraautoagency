'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building2,
  CreditCard,
  Calendar,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearStatus, setClearStatus] = useState<string | null>(null);

  const handleClearCrmData = async () => {
    const confirmed = window.confirm(
      "⚠️ ARE YOU SURE?\n\nThis will permanently delete all customer leads, showroom visits, test rides, bike bookings, payments, and WhatsApp logs.\n\nYour Bike Catalog, Pricing, Settings, and Admin Accounts will NOT be deleted.\n\nClick OK to proceed."
    );
    if (!confirmed) return;

    try {
      setClearing(true);
      setClearStatus(null);
      const res = await fetch('/api/admin/clear-crm', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setClearStatus('✅ All CRM data cleared successfully! The dashboard has been reset.');
      } else {
        setClearStatus('❌ Error: ' + (data.error || 'Failed to clear data'));
      }
    } catch (err: any) {
      setClearStatus('❌ Error: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (e) {
      alert('Error updating dealership settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-yamaha-cyan" />
            Dealership Configuration & Rules
          </h1>
          <p className="text-sm text-white/50">
            Configure dealership contact info, online payment rules, showroom scheduling capacities, and WhatsApp integration parameters.
          </p>
        </div>

        {saveSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle className="w-4 h-4" />
            Settings saved successfully!
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-12 text-center text-white/40">
          <div className="w-8 h-8 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-3" />
          Loading dealership settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: DEALERSHIP PROFILE */}
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-xl bg-yamaha-racing/20 text-yamaha-cyan flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase text-white tracking-wide">
                  Dealership Profile & Address
                </h2>
                <p className="text-xs text-white/50">Official dealership identity displayed on all vouchers and headers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Dealership Commercial Name
                </label>
                <input
                  type="text"
                  value={settings['dealership_name'] || 'Hira Auto Agency'}
                  onChange={(e) => handleChange('dealership_name', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Primary Phone Numbers
                </label>
                <input
                  type="text"
                  value={settings['dealership_phone'] || '+91 62012 38401'}
                  onChange={(e) => handleChange('dealership_phone', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Showroom Physical Address
                </label>
                <input
                  type="text"
                  value={settings['dealership_address'] || 'Ekchari Road, Mohanpur, Godda, Jharkhand 814154'}
                  onChange={(e) => handleChange('dealership_address', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings['dealership_email'] || 'Sachinbhagat1655@gmail.com'}
                  onChange={(e) => handleChange('dealership_email', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={settings['operating_hours'] || '09:30 AM - 07:30 PM (All 7 Days)'}
                  onChange={(e) => handleChange('operating_hours', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BOOKINGS & PAYMENT RULES */}
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase text-white tracking-wide">
                  Customer Booking & Payment Parameters
                </h2>
                <p className="text-xs text-white/50">Configure default reservation token amount, online gateway credentials, and payment modes.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Advance Token Amount (₹)
                </label>
                <input
                  type="number"
                  value={settings['booking_advance_amount'] || '5000'}
                  onChange={(e) => handleChange('booking_advance_amount', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-yamaha-cyan text-sm"
                />
                <span className="text-[11px] text-white/40 block mt-1">Default token deposit for online booking</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Payment Gateway Environment
                </label>
                <select
                  value={settings['payment_gateway_mode'] || 'SANDBOX'}
                  onChange={(e) => handleChange('payment_gateway_mode', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                >
                  <option value="SANDBOX">SANDBOX / SIMULATED (Demo UPI & Card)</option>
                  <option value="PRODUCTION">PRODUCTION (Live Razorpay Gateway)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Offline Cash Counter Mode
                </label>
                <select
                  value={settings['offline_cash_enabled'] || 'YES'}
                  onChange={(e) => handleChange('offline_cash_enabled', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                >
                  <option value="YES">ENABLED (Allow Pay-at-Showroom)</option>
                  <option value="NO">DISABLED (Online Deposit Only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: SHOWROOM VISITS & APPOINTMENTS */}
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase text-white tracking-wide">
                  Showroom Scheduling & Test Ride Slots
                </h2>
                <p className="text-xs text-white/50">Prevent overbooking by regulating maximum visitors per hour.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Max Visitors / Test Rides Per Hourly Slot
                </label>
                <input
                  type="number"
                  value={settings['max_visits_per_slot'] || '4'}
                  onChange={(e) => handleChange('max_visits_per_slot', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-yamaha-cyan text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Advance Scheduling Limit (Days)
                </label>
                <input
                  type="number"
                  value={settings['max_advance_days'] || '14'}
                  onChange={(e) => handleChange('max_advance_days', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-yamaha-cyan text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: WHATSAPP NOTIFICATIONS */}
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase text-white tracking-wide">
                  WhatsApp Cloud API Parameters
                </h2>
                <p className="text-xs text-white/50">Configure Meta Cloud API credentials or simulated sandbox logging.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  WhatsApp API Provider
                </label>
                <select
                  value={settings['whatsapp_provider'] || 'SIMULATED'}
                  onChange={(e) => handleChange('whatsapp_provider', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                >
                  <option value="SIMULATED">SIMULATED / CONSOLE OUTBOX (Testing Mode)</option>
                  <option value="META_CLOUD">META CLOUD API (Official WhatsApp Business)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                  Automated Visit Reminders (24h & 2h prior)
                </label>
                <select
                  value={settings['whatsapp_reminders_active'] || 'YES'}
                  onChange={(e) => handleChange('whatsapp_reminders_active', e.target.value)}
                  className="w-full bg-[#121722] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-yamaha-cyan text-sm"
                >
                  <option value="YES">ENABLED (Dispatch automatically)</option>
                  <option value="NO">DISABLED (Pause all reminders)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-yamaha-racing hover:bg-blue-600 text-white shadow-xl shadow-yamaha-blue/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Settings...' : 'Save Dealership Settings'}
            </button>
          </div>

          {/* DANGER ZONE: CLEAR CRM DATA */}
          <div className="mt-12 bg-red-950/20 border border-red-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-red-400 tracking-wide flex items-center gap-2">
                    Danger Zone: Reset / Clear CRM Data
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Permanently wipe all leads, test ride appointments, customer records, bike bookings, and payments.
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    ✓ Preserves Bike Models & Specs &nbsp;|&nbsp; ✓ Preserves Admin Logins &nbsp;|&nbsp; ✓ Preserves Dealership Settings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearCrmData}
                disabled={clearing}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50 shadow-lg shadow-red-900/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {clearing ? 'Clearing Data...' : 'Clear All CRM Data'}
              </button>
            </div>

            {clearStatus && (
              <div className="p-3 rounded-xl bg-[#121722] border border-white/10 text-xs font-mono">
                {clearStatus}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

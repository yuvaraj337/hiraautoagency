'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit,
  Eye,
  Settings,
  User,
  Phone,
  Calendar,
  Save,
  Play
} from 'lucide-react';

interface Reminder {
  id: string;
  visit_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  whatsapp_reminders_enabled: number;
  reminder_type: string;
  scheduled_for: string;
  status: string;
  sent_at?: string;
  visit_date: string;
  visit_time: string;
  bike_name?: string;
}

interface Message {
  id: string;
  customer_id?: string;
  customer_name?: string;
  phone: string;
  template_name: string;
  message_body: string;
  status: string;
  sent_at: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  body: string;
}

export default function AdminWhatsAppPage() {
  const [activeTab, setActiveTab] = useState<'reminders' | 'outbox' | 'templates'>('reminders');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Template Editing State
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateBody, setTemplateBody] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Direct Message Modal
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directPhone, setDirectPhone] = useState('');
  const [directCustomerName, setDirectCustomerName] = useState('');
  const [directTemplate, setDirectTemplate] = useState('tpl_visit_booked');
  const [sendingDirect, setSendingDirect] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/whatsapp');
      const data = await res.json();
      if (data.success) {
        setReminders(data.reminders || []);
        setMessages(data.messages || []);
        setTemplates(data.templates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessReminders = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PROCESS_REMINDERS' })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Processed pending reminders successfully');
        await fetchData();
      } else {
        alert(data.error || 'Failed to process reminders');
      }
    } catch (e) {
      alert('Error triggering reminder processor');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    setSavingTemplate(true);
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_TEMPLATE',
          id: selectedTemplate.id,
          body: templateBody
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Template saved successfully!');
        setSelectedTemplate(null);
        await fetchData();
      } else {
        alert(data.error || 'Failed to save template');
      }
    } catch (e) {
      alert('Error updating template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directPhone) return;
    setSendingDirect(true);
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_DIRECT',
          phone: directPhone,
          templateName: directTemplate,
          variables: {
            customer_name: directCustomerName || 'Valued Customer',
            bike_name: 'Yamaha Motorcycle',
            visit_date: 'Tomorrow',
            visit_time: '11:00 AM',
            dealership_name: 'Hira Auto Agency Yamaha',
            dealership_phone: '8210582308'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('WhatsApp message queued/dispatched successfully!');
        setShowDirectModal(false);
        setDirectPhone('');
        await fetchData();
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (e) {
      alert('Error sending direct message');
    } finally {
      setSendingDirect(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            WhatsApp Notification Dispatcher
          </h1>
          <p className="text-sm text-white/50">
            Automated 24h/2h showroom visit reminders, customer booking updates, and templated notifications for Hira Auto Agency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDirectModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Send Test WhatsApp
          </button>
          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reminders'
              ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Scheduled Reminders Queue ({reminders.filter(r => r.status === 'PENDING').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('outbox')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'outbox'
              ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Outbox History ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Templates Editor ({templates.length})
        </button>
      </div>

      {/* TAB 1: SCHEDULED REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <Clock className="w-4 h-4 text-yamaha-cyan" />
              <span>
                Automated scheduler triggers reminders <strong>24 hours</strong> and <strong>2 hours</strong> before scheduled showroom visits.
              </span>
            </div>
            <button
              onClick={handleProcessReminders}
              disabled={processing}
              className="px-4 py-2 bg-yamaha-racing hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {processing ? 'Processing Due Reminders...' : 'Run Due Reminders Now'}
            </button>
          </div>

          <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-[#121722] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Customer & Phone</th>
                  <th className="py-3.5 px-4">Visit Appointment</th>
                  <th className="py-3.5 px-4">Reminder Type</th>
                  <th className="py-3.5 px-4">Scheduled For</th>
                  <th className="py-3.5 px-4">Customer Opt-In</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-white/40">
                      <div className="w-6 h-6 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-2" />
                      Loading reminder queue...
                    </td>
                  </tr>
                ) : reminders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-white/40">
                      No scheduled reminders in queue.
                    </td>
                  </tr>
                ) : (
                  reminders.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{r.customer_name}</div>
                        <span className="text-xs text-yamaha-cyan font-mono">+91 {r.customer_phone}</span>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="text-white font-medium">{r.visit_date} • {r.visit_time}</div>
                        <span className="text-white/40">{r.bike_name || 'General Showroom Visit'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          r.reminder_type === '24_HOURS'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {r.reminder_type === '24_HOURS' ? '24 Hours Prior' : '2 Hours Prior'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-white/60">
                        {new Date(r.scheduled_for).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        {r.whatsapp_reminders_enabled === 1 ? (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Enabled
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Disabled by Staff
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {r.status === 'SENT' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Sent
                          </span>
                        ) : r.status === 'SKIPPED' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white/50">
                            Skipped
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OUTBOX HISTORY */}
      {activeTab === 'outbox' && (
        <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-[#121722] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10 font-bold">
              <tr>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Template Name</th>
                <th className="py-3.5 px-4">Dispatched Message Content</th>
                <th className="py-3.5 px-4">Sent At</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40">
                    Loading outbox...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/40">
                    No messages sent yet.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{m.customer_name || 'Customer'}</div>
                      <span className="text-xs font-mono text-yamaha-cyan">+91 {m.phone}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-white/80">
                      {m.template_name}
                    </td>
                    <td className="py-4 px-4 text-xs text-white/60 max-w-md font-sans">
                      <div className="bg-[#121722] p-2.5 rounded-xl border border-white/5 whitespace-pre-line text-[11px]">
                        {m.message_body}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-white/50 font-mono">
                      {new Date(m.sent_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-[#0D111A] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-yamaha-cyan block">
                    {tpl.id}
                  </span>
                  <span className="text-xs font-semibold text-white/50">{tpl.name}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setTemplateBody(tpl.body);
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Template
                </button>
              </div>

              <div className="bg-[#121722] border border-white/5 rounded-xl p-3.5 text-xs text-white/80 whitespace-pre-line font-mono">
                {tpl.body}
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/40">
                <span>Category: {tpl.category}</span>
                <span>Language: {tpl.language}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TEMPLATE EDIT MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Settings className="w-5 h-5 text-yamaha-cyan" />
              Edit Template: {selectedTemplate.id}
            </h3>
            <p className="text-xs text-white/50">
              Variables available: {'{{customer_name}}'}, {'{{bike_name}}'}, {'{{variant_name}}'}, {'{{visit_date}}'}, {'{{visit_time}}'}, {'{{booking_code}}'}, {'{{advance_amount}}'}, {'{{balance_amount}}'}, {'{{dealership_name}}'}, {'{{dealership_phone}}'}
            </p>

            <textarea
              rows={8}
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              className="w-full bg-[#141A29] border border-white/10 rounded-xl p-3.5 text-white font-mono text-xs focus:outline-none focus:border-yamaha-cyan"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-yamaha-racing hover:bg-blue-600 text-white shadow-lg shadow-yamaha-blue/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingTemplate ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT TEST WHATSAPP MODAL */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSendDirect} className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Dispatch Direct WhatsApp Message
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Recipient Phone Number (10 digits)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-mono font-bold">+91</span>
                <input
                  type="tel"
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="9876543210"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  className="w-full bg-[#141A29] border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={directCustomerName}
                onChange={(e) => setDirectCustomerName(e.target.value)}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/70 mb-1.5">
                Select WhatsApp Template
              </label>
              <select
                value={directTemplate}
                onChange={(e) => setDirectTemplate(e.target.value)}
                className="w-full bg-[#141A29] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-400 text-sm"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDirectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingDirect}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {sendingDirect ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

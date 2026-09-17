'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  RefreshCw,
  Shield,
  Clock,
  User,
  Activity,
  Code
} from 'lucide-react';

interface Log {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    if (!searchQuery) return matchesAction;
    const q = searchQuery.toLowerCase();
    return (
      matchesAction &&
      (log.admin_name?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.entity_type?.toLowerCase().includes(q) ||
        log.entity_id?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q))
    );
  });

  const getActionColor = (action: string) => {
    if (action.includes('PRICE')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (action.includes('PAYMENT')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (action.includes('STATUS')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (action.includes('LOGIN')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-white/10 text-white/80 border-white/15';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <History className="w-6 h-6 text-yamaha-cyan" />
            Security & Activity Audit Trail
          </h1>
          <p className="text-sm text-white/50">
            Immutable log of all administrative operations, price modifications, customer payment collections, and status transitions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          title="Refresh"
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search audit trail by admin, action, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121722] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-yamaha-cyan"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PRICE', 'PAYMENT', 'STATUS', 'LOGIN', 'WHATSAPP'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActionFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                actionFilter === filter
                  ? 'bg-yamaha-cyan text-black font-extrabold shadow-sm'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0D111A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-[#121722] text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10 font-bold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Target ID</th>
                <th className="py-3.5 px-4">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40">
                    <div className="w-6 h-6 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin mx-auto mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/40">
                    No activity logs recorded for this criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-mono text-white/60 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-yamaha-cyan" />
                        {log.admin_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-white/70">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-yamaha-cyan truncate max-w-[120px]">
                      {log.entity_id || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-white/50 font-mono max-w-xs truncate">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="hover:text-white underline text-left truncate block max-w-xs"
                        >
                          {log.details}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-yamaha-cyan" />
                Audit Log Payload Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-white/40 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Action:</span>
                <span className="font-mono font-bold text-yamaha-cyan">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Staff:</span>
                <span className="text-white font-bold">{selectedLog.admin_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Timestamp:</span>
                <span className="text-white/70 font-mono">{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#121722] border border-white/10 rounded-xl p-4 overflow-x-auto text-xs font-mono text-white/90">
              <pre>{JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

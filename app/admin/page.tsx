'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [range, setRange] = useState('this_month');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?range=${selectedRange}`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(range);
  }, [range]);

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black uppercase text-white font-display">
            Dealership Operations Dashboard
          </h1>
          <p className="text-xs text-gray-400">
            Real-time performance metrics for Hira Auto Agency, Mohanpur.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel">
          {[
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: 'This Week', value: 'this_week' },
            { label: 'This Month', value: 'this_month' },
            { label: 'All Time', value: 'all' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                range === item.value
                  ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => fetchDashboard(range)}
            className="p-1.5 text-gray-400 hover:text-yamaha-cyan"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 10 CORE KPI CARDS (Calculated from Real Database) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-yamaha-cyan" />
          </div>
          <p className="text-2xl font-black text-white font-display">{metrics.totalCustomers || 0}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Registered in System</span>
        </div>

        {/* Showroom Visits */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Showroom Visits</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">{metrics.totalVisits || 0}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="text-yamaha-cyan font-bold">{metrics.newVisits || 0} New</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">{metrics.confirmedVisits || 0} Confirmed</span>
          </div>
        </div>

        {/* Bike Bookings */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Bike Bookings</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">{metrics.totalBookings || 0}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {metrics.confirmedBookings || 0} Confirmed Orders
          </span>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Collected Revenue</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">
            ₹{(metrics.revenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-gray-400 font-semibold">Verified Online/Offline</span>
        </div>

        {/* Pending Balance */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Balance</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-display">
            ₹{(metrics.pendingBalance || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-gray-400 font-semibold">{metrics.pendingPaymentsCount || 0} Open Accounts</span>
        </div>

        {/* Advance Payments */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Advance Deposits</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">
            ₹{(metrics.advanceRevenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-gray-400 font-semibold">Booking Allocations</span>
        </div>

        {/* Full Payments */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Full Payments</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">
            ₹{(metrics.fullRevenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">100% Settlement</span>
        </div>

        {/* Completed Payments */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Transactions</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-display">{metrics.completedPaymentsCount || 0}</p>
          <span className="text-[10px] text-gray-400 font-semibold">Successful Receipts</span>
        </div>

        {/* Cancelled Bookings */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Cancelled</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 font-display">{metrics.cancelledBookings || 0}</p>
          <span className="text-[10px] text-gray-400 font-semibold">Returned Orders</span>
        </div>

        {/* Conversion Rate */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">Conversion</span>
            <TrendingUp className="w-4 h-4 text-yamaha-cyan" />
          </div>
          <p className="text-2xl font-black text-white font-display">{metrics.conversionRate || 0}%</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Visits to Bookings</span>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Bar Time-Series Chart */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-display">
                Weekly Activity & Volume Trend
              </h3>
              <p className="text-xs text-gray-400">Daily Showroom Appointments vs Bike Bookings</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yamaha-racing" />
                <span className="text-gray-300">Bookings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yamaha-cyan" />
                <span className="text-gray-300">Visits</span>
              </div>
            </div>
          </div>

          {/* Bar Visualizer */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-white/10">
            {charts.trendChart?.map((dayItem: any, idx: number) => {
              const maxVal = Math.max(
                4,
                ...charts.trendChart.map((d: any) => Math.max(d.bookings || 0, d.visits || 0))
              );
              const bHeight = ((dayItem.bookings || 0) / maxVal) * 100;
              const vHeight = ((dayItem.visits || 0) / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Booking bar */}
                    <div
                      style={{ height: `${Math.max(8, bHeight)}%` }}
                      className="w-1/2 max-w-[18px] bg-yamaha-racing hover:bg-blue-600 rounded-t-lg transition-all relative group cursor-pointer"
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/90 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {dayItem.bookings} Bookings
                      </span>
                    </div>

                    {/* Visit bar */}
                    <div
                      style={{ height: `${Math.max(8, vHeight)}%` }}
                      className="w-1/2 max-w-[18px] bg-yamaha-cyan/80 hover:bg-yamaha-cyan rounded-t-lg transition-all relative group cursor-pointer"
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/90 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {dayItem.visits} Visits
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{dayItem.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Bikes Breakdown */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white uppercase font-display mb-1">
              Top Customer Demand
            </h3>
            <p className="text-xs text-gray-400 mb-5">Ranked by actual booking volume</p>

            <div className="space-y-3.5">
              {charts.popularBikes?.map((bike: any, bIdx: number) => (
                <div key={bIdx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span className="truncate max-w-[180px]">{bike.name}</span>
                    <span className="text-yamaha-cyan font-mono">{bike.bookings_count} Booked</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yamaha-racing to-yamaha-cyan rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(15, (bike.bookings_count / (metrics.totalBookings || 1)) * 100)
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
            <span>Client Source Catalog:</span>
            <span className="text-white font-bold">23 Active Models</span>
          </div>
        </div>
      </div>

      {/* RECENT OPERATIONAL AUDIT ACTIVITY */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white uppercase font-display">
            Recent Dealership Operations Activity
          </h3>
          <span className="text-xs text-gray-400">Live Audit Trail</span>
        </div>

        <div className="divide-y divide-white/5 text-xs">
          {recentActivity.map((log: any) => (
            <div key={log.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 truncate">
                <span className="w-2 h-2 rounded-full bg-yamaha-cyan shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-400 text-[11px] truncate block">
                    Staff: {log.user_name} • Entity: {log.entity_type} ({log.entity_id})
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">
                {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Package,
  Tag,
  Settings,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Bell
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Customers CRM', href: '/admin/customers', icon: Users },
  { name: 'Showroom Visits', href: '/admin/visits', icon: Calendar },
  { name: 'Bike Bookings', href: '/admin/bookings', icon: ShoppingBag },
  { name: 'Payments Ledger', href: '/admin/payments', icon: CreditCard },
  { name: 'WhatsApp Reminders', href: '/admin/whatsapp', icon: MessageSquare },
  { name: 'Catalog & Prices', href: '/admin/catalog', icon: Package },
  { name: 'Offers & Schemes', href: '/admin/offers', icon: Tag },
  { name: 'Dealership Settings', href: '/admin/settings', icon: Settings },
  { name: 'Activity Audit Log', href: '/admin/logs', icon: History },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render children directly without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const [user, setUser] = useState<any | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          router.push('/admin/login');
        } else {
          setUser(data.user);
        }
      } catch (e) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-yamaha-cyan border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0A0D14] border-r border-white/10 shrink-0 select-none">
        {/* Logo & Dealership Brand */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yamaha-racing flex items-center justify-center shadow-md shadow-yamaha-blue/50 shrink-0">
            <svg viewBox="0 0 100 100" className="w-5 h-5 fill-white">
              <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="6" />
              <path d="M50 16 L50 84 M16 50 L84 50 M26 26 L74 74 M74 26 L26 74" stroke="white" strokeWidth="4" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-white block">
              HIRA AUTO AGENCY
            </span>
            <span className="text-[10px] text-yamaha-cyan font-bold uppercase tracking-widest block">
              Yamaha CRM Operations
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-yamaha-racing text-white shadow-md shadow-yamaha-blue/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-yamaha-card border border-white/10 flex items-center justify-center text-xs font-bold text-yamaha-cyan shrink-0">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{user?.role || 'Staff'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-lg glass-card text-[11px] font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-yamaha-cyan" />
            <span>View Public Site</span>
          </a>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex">
          <div className="w-72 bg-[#0A0D14] h-full p-4 flex flex-col justify-between border-r border-white/10 animate-slideRight">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <span className="text-xs font-black uppercase text-white">Hira Auto Agency CRM</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                        isActive ? 'bg-yamaha-racing text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between bg-[#0A0D14]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-yamaha-cyan tracking-wider block">
                Yamaha Dealership Operations
              </span>
              <h2 className="text-xs font-bold text-gray-300">
                Mahagama Branch, Godda, Jharkhand
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-card text-[11px] font-semibold text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Role: <strong className="text-white">{user?.role || 'Admin'}</strong>
            </span>

            <a
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg glass-panel text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3 text-yamaha-cyan" />
              <span className="hidden sm:inline">Live Website</span>
            </a>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-200 text-xs font-bold flex items-center gap-1.5 border border-red-500/20"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

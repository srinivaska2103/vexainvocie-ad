'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Receipt,
  IndianRupee,
  TrendingUp,
  BellRing,
  Settings,
  Ticket,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useSuperAdminStore } from '@/store/useSuperAdminStore';

export function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAuthenticated, isLoading, initialize, logout } = useSuperAdminStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const isLoginPage = pathname?.startsWith('/admin/login') || pathname?.startsWith('/login');
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (pathname?.startsWith('/admin/login') || pathname?.startsWith('/login')) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Verifying Platform Super Admin Access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Platform Overview', href: '/', altHref: '/admin', icon: LayoutDashboard },
    { name: 'Companies', href: '/admin/companies', altHref: '/companies', icon: Building2 },
    { name: 'Platform Users', href: '/admin/platformusers', altHref: '/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', altHref: '/subscriptions', icon: CreditCard },
    { name: 'Payments & Revenue', href: '/admin/payments', altHref: '/payments', icon: IndianRupee },
    { name: 'Growth Analytics', href: '/admin/analytics', altHref: '/analytics', icon: TrendingUp },
    { name: 'Lifetime Sales Enquiries', href: '/admin/sales-enquiries', altHref: '/sales-enquiries', icon: Sparkles },
    { name: 'Audit & Webhooks', href: '/admin/logs', altHref: '/logs', icon: BellRing },
    { name: 'Ticket Raise & Management', href: '/admin/tickets', altHref: '/tickets', icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Desktop Sidebar (Crisp clean white/slate design) */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200 shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-50 p-1 border border-slate-200 flex items-center justify-center shadow-xs overflow-hidden">
            <Image
              src="/vexa-logo.png?v=3"
              alt="VEXA INVOICE"
              width={40}
              height={40}
              priority
              className="w-9 h-9 object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-slate-900 leading-tight">
              VEXA INVOICE
            </div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Super Admin Panel
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{admin?.name || 'Super Admin'}</p>
              <p className="text-[11px] text-slate-500 truncate">{admin?.email || 'vexatech.connect@gmail.com'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isOverview = item.href === '/';
            const isActive = isOverview
              ? (pathname === '/' || pathname === '/admin' || pathname === '')
              : (
                  pathname === item.href ||
                  pathname === item.altHref ||
                  (item.href !== '/' && pathname.startsWith(item.href)) ||
                  (item.altHref && item.altHref !== '/' && pathname.startsWith(item.altHref))
                );
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-200" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <a
            href="http://localhost:3000/dashboard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Open Company App (:3000)</span>
          </a>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Super Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)}></div>
          <div className="relative w-72 bg-white p-6 flex flex-col z-10 border-r border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Image src="/vexa-logo.png?v=3" alt="VEXA INVOICE" width={32} height={32} className="w-8 h-8 object-contain rounded-lg" />
                <span className="font-black text-lg text-slate-900">VEXA INVOICE</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1.5">
              {navItems.map((item) => {
                const isOverview = item.href === '/';
                const isActive = isOverview
                  ? (pathname === '/' || pathname === '/admin' || pathname === '')
                  : (
                      pathname === item.href ||
                      pathname === item.altHref ||
                      (item.href !== '/' && pathname.startsWith(item.href)) ||
                      (item.altHref && item.altHref !== '/' && pathname.startsWith(item.altHref))
                    );
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                      isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-rose-600 text-sm font-bold pt-4 border-t border-slate-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-500">Platform Control Engine</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="text-xs font-bold text-emerald-600">Active Live Session</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Full SaaS Administrative Access</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;

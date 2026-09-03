'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/leads', label: 'Leads', icon: '🔥' },
  { href: '/dashboard/conversations', label: 'Conversations', icon: '💬' },
  { href: '/dashboard/bookings', label: 'Bookings', icon: '📅' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">🤖 BHOM AI</h1>
          <p className="text-xs text-slate-500 mt-1">HVAC Lead Conversion</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setSidebarOpen(false)}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="text-xs text-slate-400">Powered by <span className="font-semibold text-slate-600">thebhom.in</span></div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h2 className="text-lg font-semibold text-slate-900">{navItems.find(i => i.href === pathname)?.label || 'Dashboard'}</h2>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

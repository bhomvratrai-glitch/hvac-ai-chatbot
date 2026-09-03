'use client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [businessId, setBusinessId] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bhom_business_id');
    if (saved) { setBusinessId(saved); fetchStats(saved); }
  }, []);

  async function fetchStats(bid) {
    try { const resp = await fetch('/api/analytics?business_id=' + bid); setStats(await resp.json()); } catch (e) { console.error(e); }
  }

  function handleConnect(e) {
    e.preventDefault();
    if (businessId) { localStorage.setItem('bhom_business_id', businessId); fetchStats(businessId); }
  }

  if (!businessId || !stats) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to BHOM AI</h2>
        <p className="text-slate-500 mb-6">Enter your Business ID to view your dashboard</p>
        <form onSubmit={handleConnect} className="flex gap-2">
          <input type="text" value={businessId} onChange={e => setBusinessId(e.target.value)} placeholder="Business ID (UUID)" className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Connect</button>
        </form>
      </div>
    );
  }

  const cards = [
    { label: 'Total Leads', value: stats.total_leads, icon: '👥', color: 'blue' },
    { label: 'Hot Leads 🔥', value: stats.hot_leads, icon: '🔥', color: 'red' },
    { label: 'Conversations', value: stats.total_conversations, icon: '💬', color: 'purple' },
    { label: 'Bookings', value: stats.total_bookings, icon: '📅', color: 'green' },
    { label: 'Conversion Rate', value: stats.conversion_rate, icon: '📈', color: 'orange' },
  ];

  const colorMap = { blue:'bg-blue-50 text-blue-700 border-blue-200', red:'bg-red-50 text-red-700 border-red-200', purple:'bg-purple-50 text-purple-700 border-purple-200', green:'bg-green-50 text-green-700 border-green-200', orange:'bg-orange-50 text-orange-700 border-orange-200' };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`p-5 rounded-xl border ${colorMap[card.color]}`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm opacity-70 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">📋 Embed Code</h3>
        <p className="text-sm text-slate-500 mb-4">Add this script tag to your website to enable the AI chat widget</p>
        <div className="bg-slate-900 rounded-lg p-4 text-green-400 text-sm font-mono overflow-x-auto">
          &lt;script src="{typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-business-id="{businessId}"&gt;&lt;/script&gt;
        </div>
      </div>
    </div>
  );
}

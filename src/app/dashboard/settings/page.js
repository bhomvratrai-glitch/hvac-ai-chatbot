'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [businessId, setBusinessId] = useState('');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const bid = localStorage.getItem('bhom_business_id');
    if (bid) { setBusinessId(bid); fetchConfig(bid); }
  }, []);

  async function fetchConfig(bid) {
    const resp = await fetch('/api/widget/config?business_id=' + bid);
    if (resp.ok) setConfig(await resp.json());
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Widget Configuration</h3>
        {config ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
              <input type="text" value={config.name||''} readOnly className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Widget Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={config.widget_color||'#2563eb'} readOnly className="w-10 h-10 rounded cursor-pointer" />
                <span className="text-sm text-slate-500">{config.widget_color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Welcome Message</label>
              <textarea value={config.welcome_message||''} readOnly rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Services</label>
              <div className="flex flex-wrap gap-2">
                {(config.services||[]).map((s,i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Connect your business ID first from the Overview page</p>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">🚀 Installation Guide</h3>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex gap-3"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span><p>Copy the embed code from the Overview page</p></div>
          <div className="flex gap-3"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span><p>Paste it before the closing &lt;/body&gt; tag on your website</p></div>
          <div className="flex gap-3"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span><p>The AI chat widget will appear automatically</p></div>
          <div className="flex gap-3"><span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span><p>Leads, conversations, and bookings flow into this dashboard</p></div>
        </div>
      </div>
    </div>
  );
}

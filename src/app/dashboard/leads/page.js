'use client';
import { useState, useEffect } from 'react';

const scoreColors = { hot:'bg-red-100 text-red-700', warm:'bg-yellow-100 text-yellow-700', cold:'bg-blue-100 text-blue-700' };
const statusColors = { new:'bg-blue-100 text-blue-700', contacted:'bg-yellow-100 text-yellow-700', qualified:'bg-purple-100 text-purple-700', booked:'bg-orange-100 text-orange-700', converted:'bg-green-100 text-green-700', lost:'bg-red-100 text-red-700' };

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const bid = localStorage.getItem('bhom_business_id');
    if (bid) fetchLeads(bid);
  }, [filter]);

  async function fetchLeads(bid) {
    const params = new URLSearchParams({ business_id: bid });
    if (filter !== 'all') params.set('score', filter);
    const resp = await fetch('/api/leads?' + params);
    const data = await resp.json();
    setLeads(data.leads || []);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {['all','hot','warm','cold'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${filter===f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {f==='hot'?'🔥 ':f==='warm'?'🌤️ ':f==='cold'?'❄️ ':''}{f}
          </button>
        ))}
        <span className="text-sm text-slate-500 ml-auto">{leads.length} leads</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Score</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Source</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{lead.name || 'Unknown'}</td>
                <td className="px-4 py-3 text-slate-600">{lead.phone || '-'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreColors[lead.score]||''}`}>{lead.score}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]||''}`}>{lead.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{lead.source}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No leads yet. Your chat widget will capture them automatically!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

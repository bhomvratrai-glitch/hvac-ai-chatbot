'use client';
import { useState, useEffect } from 'react';

const statusColors = { pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700', completed:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700', no_show:'bg-slate-100 text-slate-700' };

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const bid = localStorage.getItem('bhom_business_id');
    if (bid) fetchBookings(bid);
  }, []);

  async function fetchBookings(bid) {
    const resp = await fetch('/api/bookings?business_id=' + bid);
    const data = await resp.json();
    setBookings(data.bookings || []);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">{bookings.length} bookings</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{booking.customer_name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]||''}`}>{booking.status}</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div>📞 {booking.customer_phone||'-'}</div>
              <div>🔧 {booking.service_type||'General'}</div>
              <div>📅 {booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString('en-IN') : 'TBD'}</div>
              <div>⏰ {booking.preferred_time||'TBD'}</div>
              {booking.address && <div>📍 {booking.address}</div>}
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <div className="text-5xl mb-3">📅</div>
            No bookings yet. Bookings from the AI chat widget will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

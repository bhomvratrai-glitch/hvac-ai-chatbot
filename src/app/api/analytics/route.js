import { getServiceClient } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const days = parseInt(searchParams.get('days') || '30');

  if (!businessId) return errorResponse('business_id required', 400);

  const db = getServiceClient();
  const since = new Date(Date.now() - days * 86400000).toISOString();

  // Get counts in parallel
  const [leads, convos, bookings, hotLeads, events] = await Promise.all([
    db.from('leads').select('id', { count: 'exact' }).eq('business_id', businessId).gte('created_at', since),
    db.from('conversations').select('id', { count: 'exact' }).eq('business_id', businessId).gte('created_at', since),
    db.from('bookings').select('id', { count: 'exact' }).eq('business_id', businessId).gte('created_at', since),
    db.from('leads').select('id', { count: 'exact' }).eq('business_id', businessId).eq('score', 'hot').gte('created_at', since),
    db.from('analytics_events').select('event_type').eq('business_id', businessId).gte('created_at', since),
  ]);

  const stats = {
    period_days: days,
    total_leads: leads.count || 0,
    total_conversations: convos.count || 0,
    total_bookings: bookings.count || 0,
    hot_leads: hotLeads.count || 0,
    conversion_rate: leads.count > 0 ? ((bookings.count / leads.count) * 100).toFixed(1) + '%' : '0%',
    events_breakdown: {},
  };

  // Count events by type
  if (events.data) {
    events.data.forEach(e => {
      stats.events_breakdown[e.event_type] = (stats.events_breakdown[e.event_type] || 0) + 1;
    });
  }

  return jsonResponse(stats);
}

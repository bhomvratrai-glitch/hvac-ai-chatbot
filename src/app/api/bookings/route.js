import { getServiceClient } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');

  if (!businessId) return errorResponse('business_id required', 400);

  const db = getServiceClient();
  const { data, error } = await db
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return errorResponse(error.message);
  return jsonResponse({ bookings: data });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getServiceClient();

    const { data, error } = await db.from('bookings').insert({
      business_id: body.business_id,
      lead_id: body.lead_id || null,
      conversation_id: body.conversation_id || null,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      service_type: body.service_type,
      preferred_date: body.preferred_date,
      preferred_time: body.preferred_time,
      address: body.address,
      city: body.city,
      notes: body.notes,
    }).select().single();

    if (error) return errorResponse(error.message);

    // Track analytics
    await db.from('analytics_events').insert({
      business_id: body.business_id,
      event_type: 'booking_created',
      event_data: { service: body.service_type },
    });

    return jsonResponse(data, 201);
  } catch (err) {
    return errorResponse(err.message);
  }
}

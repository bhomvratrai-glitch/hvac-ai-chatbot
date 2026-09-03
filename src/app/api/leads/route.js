import { getServiceClient } from '@/lib/supabase';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('business_id');
  const score = searchParams.get('score');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!businessId) return errorResponse('business_id required', 400);

  const db = getServiceClient();
  let query = db.from('leads').select('*').eq('business_id', businessId).order('created_at', { ascending: false }).limit(limit);

  if (score) query = query.eq('score', score);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return errorResponse(error.message);

  return jsonResponse({ leads: data, total: data?.length || 0 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { business_id, name, phone, email, source, notes } = body;

    if (!business_id) return errorResponse('business_id required', 400);

    const db = getServiceClient();
    const { data, error } = await db.from('leads').insert({
      business_id, name, phone, email,
      source: source || 'manual',
      notes,
    }).select().single();

    if (error) return errorResponse(error.message);
    return jsonResponse(data, 201);
  } catch (err) {
    return errorResponse(err.message);
  }
}

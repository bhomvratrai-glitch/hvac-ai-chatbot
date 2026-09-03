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
    .from('businesses')
    .select('id, name, widget_color, welcome_message, services, business_hours')
    .eq('id', businessId)
    .eq('is_active', true)
    .single();

  if (error || !data) return errorResponse('Business not found', 404);

  return jsonResponse(data);
}

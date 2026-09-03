import { getServiceClient } from '@/lib/supabase';
import { generateAIResponse, cleanResponse } from '@/lib/groq';
import { jsonResponse, errorResponse } from '@/lib/utils';

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { business_id, conversation_id, message, visitor_id, visitor_name, page_url } = body;

    if (!business_id || !message) {
      return errorResponse('business_id and message are required', 400);
    }

    const db = getServiceClient();

    // Get business config
    const { data: business, error: bizErr } = await db
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .eq('is_active', true)
      .single();

    if (bizErr || !business) {
      return errorResponse('Business not found or inactive', 404);
    }

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conv, error: convErr } = await db
        .from('conversations')
        .insert({
          business_id,
          visitor_id: visitor_id || 'anonymous',
          visitor_name: visitor_name || null,
          page_url: page_url || null,
          channel: 'web',
          status: 'active',
        })
        .select('id')
        .single();

      if (convErr) throw convErr;
      convId = conv.id;

      // Track analytics
      await db.from('analytics_events').insert({
        business_id,
        event_type: 'conversation_started',
        event_data: { visitor_id, page_url, channel: 'web' },
      });
    }

    // Save user message
    await db.from('messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
    });

    // Get conversation history (last 20 messages)
    const { data: history } = await db
      .from('messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Generate AI response
    const { reply, intent } = await generateAIResponse(history || [], business);
    const cleanReply = cleanResponse(reply);

    // Save AI response
    await db.from('messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: cleanReply,
      metadata: { intent },
    });

    // Handle lead capture
    if (intent.leadCaptured && intent.leadName && intent.leadPhone) {
      const leadScore = intent.hotLead ? 'hot' : 'warm';

      const { data: lead } = await db.from('leads').insert({
        business_id,
        name: intent.leadName,
        phone: intent.leadPhone,
        source: 'chat_widget',
        score: leadScore,
        status: 'new',
      }).select('id').single();

      // Link lead to conversation
      if (lead) {
        await db.from('conversations').update({
          lead_id: lead.id,
          visitor_name: intent.leadName,
          visitor_phone: intent.leadPhone,
          lead_score: leadScore,
        }).eq('id', convId);
      }

      // Track
      await db.from('analytics_events').insert({
        business_id,
        event_type: 'lead_captured',
        event_data: { lead_score: leadScore, source: 'chat_widget' },
      });
    }

    // Handle booking intent
    if (intent.booking) {
      await db.from('analytics_events').insert({
        business_id,
        event_type: 'booking_intent',
        event_data: { conversation_id: convId },
      });
    }

    // Update conversation
    await db.from('conversations').update({
      lead_score: intent.hotLead ? 'hot' : intent.leadCaptured ? 'warm' : undefined,
      updated_at: new Date().toISOString(),
    }).eq('id', convId);

    return jsonResponse({
      reply: cleanReply,
      conversation_id: convId,
      intent: {
        booking: intent.booking || false,
        hot_lead: intent.hotLead || false,
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return errorResponse('Failed to process message: ' + error.message);
  }
}

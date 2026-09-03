import Groq from 'groq-sdk';

let groqClient = null;

export function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

export async function generateAIResponse(messages, businessConfig) {
  const groq = getGroqClient();

  const systemPrompt = buildSystemPrompt(businessConfig);

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: chatMessages,
    temperature: 0.7,
    max_tokens: 500,
    stream: false,
  });

  const reply = completion.choices[0]?.message?.content || 'Sorry, I could not process that. Please try again.';

  // Detect intent
  const intent = detectIntent(reply, messages);

  return { reply, intent };
}

function buildSystemPrompt(config) {
  const services = Array.isArray(config.services) ? config.services.join(', ') : 'AC Installation, AC Repair, AC Maintenance';
  const hours = config.business_hours || { start: '09:00', end: '18:00' };

  return `${config.ai_prompt || 'You are a helpful HVAC customer support assistant.'}

BUSINESS: ${config.name}
CITY: ${config.city || 'India'}
SERVICES: ${services}
HOURS: ${hours.start} - ${hours.end} IST

RULES:
1. Respond in the SAME language the customer uses (Hindi, English, or Hinglish)
2. Be warm, professional, helpful. Use "ji", "aap" for Hindi
3. ALWAYS try to collect: Name, Phone, Service needed, Preferred date/time
4. When you have Name + Phone + Service, suggest booking an appointment
5. Qualify leads: HOT (ready to buy/urgent), WARM (interested), COLD (just browsing)
6. For pricing questions, say "Our team will share the best quote based on your needs. Can I schedule a free site visit?"
7. Keep responses SHORT (2-3 sentences max)
8. If customer seems ready, say: "Great! Let me book a visit for you. Please share your preferred date and time."
9. For emergencies (AC not working, gas leak), mark as HOT and prioritize
10. End conversations with a clear next step

RESPONSE FORMAT: Always respond naturally. If you detect the customer wants to book, include [BOOKING_INTENT] at the end of your message (hidden from user).
If you have collected name and phone, include [LEAD_CAPTURED:name:phone] at the end.
If the lead is hot, include [HOT_LEAD] at the end.`;
}

function detectIntent(reply, messages) {
  const lower = reply.toLowerCase();
  const intents = {
    booking: lower.includes('[booking_intent]') || lower.includes('book') && lower.includes('visit'),
    leadCaptured: reply.includes('[LEAD_CAPTURED'),
    hotLead: reply.includes('[HOT_LEAD]'),
    greeting: messages.length <= 1,
  };

  // Extract lead info if captured
  const leadMatch = reply.match(/\[LEAD_CAPTURED:([^:]+):([^\]]+)\]/);
  if (leadMatch) {
    intents.leadName = leadMatch[1];
    intents.leadPhone = leadMatch[2];
  }

  return intents;
}

// Clean AI response (remove hidden tags)
export function cleanResponse(text) {
  return text
    .replace(/\[BOOKING_INTENT\]/gi, '')
    .replace(/\[LEAD_CAPTURED:[^\]]+\]/gi, '')
    .replace(/\[HOT_LEAD\]/gi, '')
    .trim();
}

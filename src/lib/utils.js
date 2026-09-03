export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

export function generateVisitorId() {
  return 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function scoreToEmoji(score) {
  return { hot: '🔥', warm: '🌤️', cold: '❄️' }[score] || '❓';
}

export function statusToColor(status) {
  const colors = {
    new: 'blue', contacted: 'yellow', qualified: 'purple',
    booked: 'orange', converted: 'green', lost: 'red',
    pending: 'yellow', confirmed: 'blue', completed: 'green',
    cancelled: 'red', active: 'green', closed: 'gray',
  };
  return colors[status] || 'gray';
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) return `+91 ${clean.slice(0,5)} ${clean.slice(5)}`;
  return phone;
}

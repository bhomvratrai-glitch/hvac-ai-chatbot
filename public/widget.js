/**
 * BHOM AI Chat Widget v1.0
 * Embeddable AI-powered chat for HVAC businesses
 * Usage: <script src="https://YOUR_DOMAIN/widget.js" data-business-id="UUID"></script>
 */
(function() {
  'use strict';

  const SCRIPT = document.currentScript;
  const BUSINESS_ID = SCRIPT?.getAttribute('data-business-id');
  const API_BASE = SCRIPT?.src ? new URL(SCRIPT.src).origin : window.location.origin;
  const POSITION = SCRIPT?.getAttribute('data-position') || 'right';

  if (!BUSINESS_ID) {
    console.error('[BHOM Widget] Missing data-business-id attribute');
    return;
  }

  let config = null;
  let conversationId = null;
  let visitorId = localStorage.getItem('bhom_visitor_' + BUSINESS_ID) || generateId();
  let isOpen = false;
  let isTyping = false;
  let messages = [];
  let unreadCount = 0;

  localStorage.setItem('bhom_visitor_' + BUSINESS_ID, visitorId);

  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    #bhom-widget-container * { box-sizing:border-box; margin:0; padding:0; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; }
    #bhom-chat-bubble { position:fixed; bottom:24px; ${POSITION}:24px; width:64px; height:64px; border-radius:50%; background:var(--bhom-color,#2563eb); color:white; border:none; cursor:pointer; box-shadow:0 4px 24px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; z-index:99998; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); animation:bhom-pulse 2s infinite; }
    #bhom-chat-bubble:hover { transform:scale(1.1); box-shadow:0 6px 32px rgba(0,0,0,0.3); }
    #bhom-chat-bubble.open { animation:none; transform:rotate(0deg); }
    @keyframes bhom-pulse { 0%,100%{box-shadow:0 4px 24px rgba(37,99,235,0.3)} 50%{box-shadow:0 4px 32px rgba(37,99,235,0.6)} }
    #bhom-unread-badge { position:absolute; top:-4px; right:-4px; background:#ef4444; color:white; font-size:12px; font-weight:700; min-width:22px; height:22px; border-radius:11px; display:flex; align-items:center; justify-content:center; padding:0 6px; border:2px solid white; }
    #bhom-chat-window { position:fixed; bottom:100px; ${POSITION}:24px; width:380px; max-width:calc(100vw - 32px); height:560px; max-height:calc(100vh - 140px); background:white; border-radius:20px; box-shadow:0 8px 48px rgba(0,0,0,0.15); z-index:99999; display:flex; flex-direction:column; overflow:hidden; opacity:0; transform:translateY(20px) scale(0.95); pointer-events:none; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
    #bhom-chat-window.open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }
    .bhom-header { background:var(--bhom-color,#2563eb); color:white; padding:18px 20px; display:flex; align-items:center; gap:12px; }
    .bhom-header-avatar { width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .bhom-header-info h3 { font-size:15px; font-weight:600; margin-bottom:2px; }
    .bhom-header-info p { font-size:12px; opacity:0.85; }
    .bhom-online-dot { width:8px; height:8px; background:#22c55e; border-radius:50%; display:inline-block; margin-right:4px; animation:bhom-blink 1.5s infinite; }
    @keyframes bhom-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .bhom-close-btn { margin-left:auto; background:rgba(255,255,255,0.15); border:none; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; transition:background 0.2s; }
    .bhom-close-btn:hover { background:rgba(255,255,255,0.3); }
    .bhom-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; background:#f8fafc; }
    .bhom-messages::-webkit-scrollbar { width:4px; }
    .bhom-messages::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:2px; }
    .bhom-msg { max-width:85%; padding:12px 16px; border-radius:18px; font-size:14px; line-height:1.5; word-wrap:break-word; animation:bhom-fadeIn 0.3s ease; }
    @keyframes bhom-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .bhom-msg.user { align-self:flex-end; background:var(--bhom-color,#2563eb); color:white; border-bottom-right-radius:6px; }
    .bhom-msg.assistant { align-self:flex-start; background:white; color:#1e293b; border-bottom-left-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
    .bhom-msg-time { font-size:11px; opacity:0.5; margin-top:4px; }
    .bhom-typing { align-self:flex-start; background:white; padding:12px 20px; border-radius:18px; border-bottom-left-radius:6px; box-shadow:0 1px 4px rgba(0,0,0,0.06); display:flex; gap:4px; animation:bhom-fadeIn 0.3s ease; }
    .bhom-typing-dot { width:8px; height:8px; background:#94a3b8; border-radius:50%; animation:bhom-typingBounce 1.4s infinite ease-in-out; }
    .bhom-typing-dot:nth-child(2) { animation-delay:0.2s; }
    .bhom-typing-dot:nth-child(3) { animation-delay:0.4s; }
    @keyframes bhom-typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
    .bhom-input-area { padding:12px 16px; border-top:1px solid #e2e8f0; display:flex; gap:8px; align-items:flex-end; background:white; }
    .bhom-input { flex:1; border:1.5px solid #e2e8f0; border-radius:24px; padding:10px 16px; font-size:14px; outline:none; resize:none; max-height:100px; line-height:1.4; font-family:inherit; transition:border-color 0.2s; }
    .bhom-input:focus { border-color:var(--bhom-color,#2563eb); }
    .bhom-input::placeholder { color:#94a3b8; }
    .bhom-send-btn { width:40px; height:40px; border-radius:50%; background:var(--bhom-color,#2563eb); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
    .bhom-send-btn:hover { transform:scale(1.05); }
    .bhom-send-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .bhom-powered { text-align:center; padding:8px; font-size:11px; color:#94a3b8; background:white; }
    .bhom-powered a { color:#64748b; text-decoration:none; font-weight:500; }
    .bhom-powered a:hover { color:var(--bhom-color,#2563eb); }
    .bhom-quick-replies { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
    .bhom-quick-reply { background:white; border:1.5px solid var(--bhom-color,#2563eb); color:var(--bhom-color,#2563eb); padding:6px 14px; border-radius:20px; font-size:13px; cursor:pointer; transition:all 0.2s; font-family:inherit; }
    .bhom-quick-reply:hover { background:var(--bhom-color,#2563eb); color:white; }
    @media(max-width:480px) { #bhom-chat-window{width:100%;height:100%;max-height:100vh;bottom:0;left:0;right:0;border-radius:0;} #bhom-chat-bubble{bottom:16px;${POSITION}:16px;} }
  `;

  async function init() {
    try {
      const resp = await fetch(API_BASE + '/api/widget/config?business_id=' + BUSINESS_ID);
      if (!resp.ok) throw new Error('Config fetch failed');
      config = await resp.json();
    } catch (e) {
      console.error('[BHOM Widget] Failed to load config:', e);
      config = { name:'HVAC Support', widget_color:'#2563eb', welcome_message:'Namaste! How can we help you today?', services:['AC Installation','AC Repair','AC Maintenance'] };
    }
    render();
  }

  function render() {
    const container = document.createElement('div');
    container.id = 'bhom-widget-container';
    container.style.cssText = '--bhom-color:' + (config.widget_color || '#2563eb');
    const style = document.createElement('style');
    style.textContent = STYLES;
    container.appendChild(style);
    const bubble = document.createElement('button');
    bubble.id = 'bhom-chat-bubble';
    bubble.innerHTML = chatIcon();
    bubble.onclick = toggleChat;
    container.appendChild(bubble);
    const win = document.createElement('div');
    win.id = 'bhom-chat-window';
    win.innerHTML = `<div class="bhom-header"><div class="bhom-header-avatar">\uD83E\uDD16</div><div class="bhom-header-info"><h3>${escapeHtml(config.name||'HVAC Support')}</h3><p><span class="bhom-online-dot"></span>Online now | Replies in 60 sec</p></div><button class="bhom-close-btn" onclick="document.getElementById('bhom-chat-bubble').click()">\u2715</button></div><div class="bhom-messages" id="bhom-messages"></div><div class="bhom-input-area"><textarea class="bhom-input" id="bhom-input" placeholder="Type your message..." rows="1"></textarea><button class="bhom-send-btn" id="bhom-send" onclick="window.__bhomSend()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="bhom-powered">Powered by <a href="https://hvac.thebhom.in" target="_blank">BHOM AI</a></div>`;
    container.appendChild(win);
    document.body.appendChild(container);
    const input = document.getElementById('bhom-input');
    input.addEventListener('keydown', function(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();window.__bhomSend();} });
    input.addEventListener('input', function() { this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,100)+'px'; });
    setTimeout(() => { addMessage('assistant', config.welcome_message||'Namaste! How can we help you?'); showQuickReplies(); }, 1500);
  }

  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById('bhom-chat-window');
    const bubble = document.getElementById('bhom-chat-bubble');
    if (isOpen) { win.classList.add('open'); bubble.classList.add('open'); bubble.innerHTML=closeIcon(); unreadCount=0; updateBadge(); setTimeout(()=>document.getElementById('bhom-input')?.focus(),300); trackEvent('widget_opened'); }
    else { win.classList.remove('open'); bubble.classList.remove('open'); bubble.innerHTML=chatIcon(); }
  }

  window.__bhomSend = async function() {
    const input = document.getElementById('bhom-input');
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = ''; input.style.height = 'auto';
    const qr = document.querySelector('.bhom-quick-replies'); if(qr) qr.remove();
    addMessage('user', text); showTyping();
    try {
      const resp = await fetch(API_BASE+'/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ business_id:BUSINESS_ID, conversation_id:conversationId, message:text, visitor_id:visitorId, page_url:window.location.href }) });
      const data = await resp.json(); hideTyping();
      if (data.error) { addMessage('assistant','Sorry, something went wrong. Please try again or call us directly.'); }
      else { conversationId=data.conversation_id; addMessage('assistant',data.reply); if(data.intent?.booking) showBookingForm(); }
    } catch(err) { hideTyping(); addMessage('assistant','Connection issue. Please check your internet and try again.'); }
  };

  function addMessage(role, content) {
    messages.push({role,content,time:new Date()});
    const container = document.getElementById('bhom-messages');
    const now = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    const div = document.createElement('div');
    div.className = 'bhom-msg '+role;
    div.innerHTML = escapeHtml(content).replace(/\n/g,'<br>')+'<div class="bhom-msg-time">'+now+'</div>';
    container.appendChild(div); container.scrollTop=container.scrollHeight;
    if(role==='assistant'&&!isOpen){unreadCount++;updateBadge();}
  }

  function showTyping() { isTyping=true; const c=document.getElementById('bhom-messages'); const d=document.createElement('div'); d.className='bhom-typing'; d.id='bhom-typing'; d.innerHTML='<div class="bhom-typing-dot"></div><div class="bhom-typing-dot"></div><div class="bhom-typing-dot"></div>'; c.appendChild(d); c.scrollTop=c.scrollHeight; document.getElementById('bhom-send').disabled=true; }
  function hideTyping() { isTyping=false; const t=document.getElementById('bhom-typing'); if(t)t.remove(); document.getElementById('bhom-send').disabled=false; }

  function showQuickReplies() {
    const container = document.getElementById('bhom-messages');
    const div = document.createElement('div'); div.className='bhom-quick-replies';
    ['AC Installation chahiye','AC repair karwana hai','Maintenance/AMC quote','Emergency: AC band hai!'].forEach(text => {
      const btn = document.createElement('button'); btn.className='bhom-quick-reply'; btn.textContent=text;
      btn.onclick=()=>{document.getElementById('bhom-input').value=text;window.__bhomSend();};
      div.appendChild(btn);
    });
    container.appendChild(div); container.scrollTop=container.scrollHeight;
  }

  function showBookingForm() {
    const container = document.getElementById('bhom-messages');
    const div = document.createElement('div'); div.className='bhom-msg assistant';
    div.innerHTML = '<div style="font-weight:600;margin-bottom:8px">\uD83D\uDCC5 Book a Free Visit</div><input type="text" placeholder="Your Name" id="bhom-book-name" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;font-size:13px;font-family:inherit"><input type="tel" placeholder="Phone Number" id="bhom-book-phone" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;font-size:13px;font-family:inherit"><input type="date" id="bhom-book-date" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;font-size:13px;font-family:inherit"><button onclick="window.__bhomBook()" style="width:100%;padding:10px;background:var(--bhom-color,#2563eb);color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:14px;font-family:inherit">Confirm Booking \u2705</button>';
    container.appendChild(div); container.scrollTop=container.scrollHeight;
  }

  window.__bhomBook = async function() {
    const name=document.getElementById('bhom-book-name')?.value;
    const phone=document.getElementById('bhom-book-phone')?.value;
    const date=document.getElementById('bhom-book-date')?.value;
    if(!name||!phone){alert('Please enter your name and phone number');return;}
    try { await fetch(API_BASE+'/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({business_id:BUSINESS_ID,conversation_id:conversationId,customer_name:name,customer_phone:phone,preferred_date:date||null,service_type:'Site Visit'})}); addMessage('assistant','\u2705 Booking confirmed! Our team will call you shortly. Thank you, '+name+'!'); } catch(e) { addMessage('assistant','Booking saved! Our team will contact you soon.'); }
  };

  function updateBadge() { let b=document.getElementById('bhom-unread-badge'); if(unreadCount>0){if(!b){b=document.createElement('span');b.id='bhom-unread-badge';document.getElementById('bhom-chat-bubble')?.appendChild(b);}b.textContent=unreadCount;} else if(b){b.remove();} }
  function trackEvent(type) { fetch(API_BASE+'/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({business_id:BUSINESS_ID,event_type:type})}).catch(()=>{}); }
  function chatIcon() { return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  function closeIcon() { return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'; }
  function escapeHtml(text) { const d=document.createElement('div'); d.textContent=text; return d.innerHTML; }
  function generateId() { return 'v_'+Math.random().toString(36).substr(2,9)+Date.now().toString(36); }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

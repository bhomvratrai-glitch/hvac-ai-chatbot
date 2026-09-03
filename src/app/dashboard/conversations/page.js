'use client';
import { useState, useEffect } from 'react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const bid = localStorage.getItem('bhom_business_id');
    if (bid) fetchConversations(bid);
  }, []);

  async function fetchConversations(bid) {
    setConversations([]);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900">Recent Chats</h3></div>
        <div className="overflow-y-auto" style={{maxHeight:'calc(100vh - 280px)'}}>
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <div className="text-4xl mb-3">💬</div>
              Conversations will appear here when visitors chat with your AI widget
            </div>
          ) : (
            conversations.map(conv => (
              <button key={conv.id} onClick={() => setSelected(conv.id)}
                className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${selected===conv.id?'bg-blue-50':''}`}>
                <div className="font-medium text-slate-900 text-sm">{conv.visitor_name||'Anonymous Visitor'}</div>
                <div className="text-xs text-slate-500 mt-1">{conv.summary||'Chat conversation'}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(conv.created_at).toLocaleString('en-IN')}</div>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            <div className="text-center"><div className="text-5xl mb-3">👈</div>Select a conversation to view messages</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.role==='user'?'bg-blue-600 text-white':'bg-slate-100 text-slate-900'}`}>{msg.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

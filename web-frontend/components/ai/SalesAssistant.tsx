'use client';
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { salesAssistantReply } from '@/lib/ai';

export function SalesAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'assistant', text: 'أهلاً بك في أبو بشار 👑 أنا مساعدك الذكي.' }]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const reply = salesAssistantReply({ query: input, products: [] });
    setMsgs((m) => [...m, { role: 'user', text: input }, { role: 'assistant', text: reply }]);
    setInput('');
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 left-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-800 shadow-xl flex items-center justify-center">
        <MessageCircle className="w-6 h-6" />
      </button>
      {open && (
        <div className="fixed bottom-5 left-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[70vh] bg-white dark:bg-ink-700 rounded-2xl shadow-2xl border border-gold/30 flex flex-col">
          <div className="px-4 py-3 bg-gradient-to-r from-ink-800 to-ink-700 text-ink-50 flex items-center justify-between rounded-t-2xl">
            <span className="font-bold">مساعد أبو بشار الذكي</span>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-gold text-ink-800' : 'bg-white dark:bg-ink-700 border border-ink-100 dark:border-ink-600'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-ink-100 dark:border-ink-600 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="اكتب رسالتك..." className="input !py-2 text-sm" />
            <button onClick={send} className="btn-gold !py-2 !px-3">إرسال</button>
          </div>
        </div>
      )}
    </>
  );
}
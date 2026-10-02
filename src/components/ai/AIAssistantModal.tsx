import React, { useState } from 'react';
import { safeJson } from '../../lib/safeFetch';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Cpu
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  confidence?: number;
  suggestions?: string[];
}

export const AIAssistantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_1',
      sender: 'ai',
      text: 'Hello! I am SiteSync Pro Enterprise AI Assistant powered by Gemini 3.6 Flash. How can I assist with BOQ analysis, material consumption predictions, delay risk forecasting, or fleet maintenance today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.99,
      suggestions: [
        'Analyze BOQ rates for Peruvannamuzhi WTP',
        'Predict schedule delays for High-Speed Rail Viaduct',
        'Check equipment maintenance alerts',
        'Search inventory for low-stock steel plates'
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await safeJson(res) || {};

      const aiReplyText = data.data?.reply || data.message || 'Analysis complete.';
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: data.data?.confidence || 0.98,
        suggestions: data.data?.suggestions || [
          'Run detailed cost variance forecast',
          'Inspect vendor quality compliance ratings'
        ]
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Apologies, I encountered a network issue contacting the backend AI service. Please verify server status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[640px] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-4 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm tracking-tight">SiteSync AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Construction Enterprise ERP Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-current/10 pb-1 mb-1">
                  <span className="font-bold text-[10px] flex items-center space-x-1 opacity-80">
                    {m.sender === 'user' ? <span>Engineer</span> : <Bot className="w-3 h-3" />}
                    <span>{m.sender === 'user' ? 'You' : 'SiteSync AI'}</span>
                  </span>
                  <span className="text-[9px] opacity-60 font-mono">{m.timestamp}</span>
                </div>
                
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium block">Suggested queries:</span>
                    <div className="flex flex-wrap gap-1">
                      {m.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-lg text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition font-medium"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs p-2">
              <Cpu className="w-4 h-4 animate-spin text-blue-500" />
              <span>Analyzing ERP data and generating response...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about BOQ rates, delay risks, low stock..."
            className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputPrompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

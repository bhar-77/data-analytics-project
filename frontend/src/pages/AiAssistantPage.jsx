import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, User, HelpCircle, 
  RefreshCw, ShieldCheck, Database, Key 
} from 'lucide-react';
import travelApi from '../services/api';

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **TravelLens AI Travel Analyst**, grounded directly on authentic data from **MySQL (travellens_db)** and our **Random Forest price prediction engine**.\n\nAsk me anything about route price comparisons, cheapest airlines, seasonal variations, or machine learning forecasts!",
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    travelApi.getSuggestedQuestions().then((res) => {
      setSuggestedQuestions(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageToSend) => {
    const text = messageToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await travelApi.chatWithAi(text, messages);
      const assistantMsg = {
        role: 'assistant',
        content: res.data.response,
        model: res.data.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "⚠️ I encountered an error connecting to the intelligence service. Please check your backend connection.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] max-w-5xl mx-auto flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-purple to-electric-cyan p-[1px] shadow-neon-cyan">
            <div className="w-full h-full bg-midnight-900 rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-electric-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white">Google Gemini AI Travel Assistant</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-electric-purple/15 text-electric-purple border border-electric-purple/30 font-bold">
                SQL Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Contextual intelligence backed by 8,200+ MySQL records</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hallucination Guarded</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-electric-blue text-white shadow-neon-blue'
                  : 'bg-midnight-900 border border-electric-cyan/40 text-electric-cyan'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed backdrop-blur-xl shadow-glass ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-electric-blue/20 to-electric-cyan/10 border border-electric-cyan/30 text-white rounded-tr-none'
                  : 'bg-midnight-900/80 border border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-2">
                {msg.content}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-white/5">
                <span>{msg.model || 'TravelLens AI'}</span>
                <span>{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-midnight-900 border border-electric-cyan/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-electric-cyan animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-midnight-900/80 border border-white/10 text-xs text-slate-400 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 text-electric-cyan animate-spin" />
              <span>Analyzing live MySQL database & reasoning...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="py-2 shrink-0">
        <div className="text-[10px] text-slate-400 font-semibold mb-1.5 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-electric-cyan" />
          <span>Suggested Inquiries:</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-[11px] whitespace-nowrap border border-white/10 hover:border-electric-cyan/40 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about travel prices, best airlines, seasonal savings, or ML predictions..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-midnight-900/90 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-electric-cyan shadow-glass transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="absolute right-2.5 p-2 rounded-xl bg-electric-cyan text-midnight-950 hover:bg-electric-blue transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';
import { aiService } from '../../services/ai.service';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '👋 Hi! I can help you find places, plan trips, and suggest best destinations. Where would you like to go?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.initialContext) {
      setInput(location.state.initialContext);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.getChatResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (_error) {
      console.error('AI Chat Error:', _error);
      toast.error('Failed to get a response beacuse ofThis model is currently experiencing high demand . Please try manual way.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white w-full max-w-4xl rounded-[30px] shadow-2xl overflow-hidden flex flex-col h-[85vh] relative border border-white/20">
        {/* Header - Purple Bar like Figma */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">AI Travel Assistant</h1>
              <p className="text-xs text-indigo-100 opacity-80">Online & Ready to help</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-indigo-600 text-white shadow-md'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div
                  className={`p-4 rounded-2xl shadow-sm ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-slate-100'
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-slate">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-500 font-medium">
                    Trip Buddy is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {!isLoading && messages.length === 1 && (
          <div className="px-6 py-2 flex flex-wrap gap-2 bg-slate-50/50">
            {['Suggest a trip to Bali', 'Plan 3 days in Paris', 'Best beaches in Goa'].map(
              suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    // Trigger handleSend manually or via state sync
                  }}
                  className="text-xs bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <form
            onSubmit={handleSend}
            className="relative flex items-center bg-slate-50 rounded-2xl p-1 shadow-inner border border-slate-200 focus-within:border-indigo-300 transition-colors"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything about your next trip..."
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-100 hover:scale-105 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-3">
            Powered by AI. Always verify travel information before booking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, MessageSquare, X, Send, FileText, 
  Bot, Zap, Layout, Play, Trash2, Maximize2, Minimize2, Clock 
} from 'lucide-react';

const BOT = ({ activeTab, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your Production Agent. I can help you analyze briefs, design layouts, or generate creative assets. What's on your mind?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [thoughtStep, setThoughtStep] = useState('');
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { 
      role: 'user', 
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);
    
    // Simulate "Thinking Steps"
    setThoughtStep('Analyzing intent...');
    setTimeout(() => setThoughtStep('Consulting brand guidelines...'), 800);

    // Mock API Call
    setTimeout(() => {
      const botResponse = { 
        role: 'assistant', 
        content: `I've processed your request regarding "${text}". Based on your current focus in the ${activeTab} tab, I recommend optimizing the visual hierarchy for mobile viewers.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsProcessing(false);
      setThoughtStep('');
    }, 2000);
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadMsg = { 
      role: 'assistant', 
      content: `Successfully ingested **${file.name}**. I've extracted the Campaign DNA and identified 3 key visual pillars for your ${activeTab} project.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true 
    };
    setMessages(prev => [...prev, uploadMsg]);
  };

  const clearChat = () => {
    if (window.confirm("Clear conversation history?")) {
      setMessages([{ 
        role: 'assistant', 
        content: "Memory cleared. How can I help you start fresh?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const quickActions = [
    { label: 'Analyze Performance', icon: Zap, action: () => handleSendMessage("Analyze current performance.") },
    { label: 'Auto-Layout', icon: Layout, action: () => onNavigate('flyer') },
    { label: 'Video Gen', icon: Play, action: () => onNavigate('image-to-video') },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
      {/* --- Chat Window --- */}
      {isOpen && (
        <div className={`bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl mb-4 flex flex-col transition-all duration-300 overflow-hidden ${
          isMinimized ? 'h-14 w-64' : 'h-[600px] w-[420px]'
        }`}>
          
          {/* Enhanced Header */}
          <div className="p-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                  <Bot className="w-6 h-6 text-red-500" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">Production Agent</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">AI Assistant Active</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors" title="Clear Chat">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-900 to-slate-900">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-red-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 px-1 text-[10px] text-slate-500 uppercase font-medium">
                      <Clock className="w-3 h-3" />
                      {msg.time}
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex flex-col items-start gap-2">
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none flex gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[11px] text-red-400 animate-pulse ml-1 font-medium italic">{thoughtStep}</span>
                  </div>
                )}
              </div>

              {/* Action Bar & Input */}
              <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                  {quickActions.map((btn) => (
                    <button 
                      key={btn.label}
                      onClick={btn.action}
                      className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600 hover:bg-slate-600 hover:border-red-500/50 transition-all text-[11px] text-slate-200"
                    >
                      <btn.icon className="w-3.5 h-3.5 text-red-400" />
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                  <div className="relative flex items-center gap-2 bg-slate-950 rounded-xl p-1.5 border border-slate-700">
                    <input type="file" ref={fileInputRef} onChange={handlePdfUpload} className="hidden" accept=".pdf" />
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                      placeholder="Ask production agent..."
                      className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 placeholder:text-slate-600"
                    />
                    <button 
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim()}
                      className="p-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all shadow-lg shadow-red-900/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* --- Main Floating Toggle --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-slate-800 rotate-90' : 'bg-red-600'
        }`}
      >
        {!isOpen && (
          <div className="absolute inset-0 rounded-2xl bg-red-500 animate-ping opacity-20 group-hover:opacity-40" />
        )}
        {isOpen ? <X className="w-7 h-7 text-white" /> : <Sparkles className="w-7 h-7 text-white" />}
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default BOT;
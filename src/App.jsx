import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Send, Trash2, Settings as SettingsIcon, LayoutGrid, ChevronDown, Sparkles, Bot, Server } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { MessageBubble } from './components/MessageBubble';
import { OllamaClient } from './utils/OllamaClient';
import { clsx } from 'clsx';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('chat-history')) || []);
  const [config, setConfig] = useState(() => JSON.parse(localStorage.getItem('ollama-config')) || { url: 'http://localhost', port: '11434' });
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('selected-model') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const client = new OllamaClient(`${config.url}:${config.port}`);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chat-history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    localStorage.setItem('ollama-config', JSON.stringify(config));
    fetchModels();
  }, [config]);

  useEffect(() => {
    if (selectedModel) localStorage.setItem('selected-model', selectedModel);
  }, [selectedModel]);

  const fetchModels = async () => {
    try {
      const modelList = await client.listModels();
      setModels(modelList);
      setIsConnected(true);
      if (modelList.length > 0 && !selectedModel) {
        setSelectedModel(modelList[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch models');
      setIsConnected(false);
      setModels([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedModel) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      await client.chat(selectedModel, newMessages, (content, done) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = content;
          return updated;
        });
        if (done) setIsLoading(false);
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = `Error: ${err.message}. Please check your connection and CORS settings.`;
        return updated;
      });
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <header className="glass-panel px-6 py-4 mb-6 flex items-center justify-between sticky top-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">Ollama Web</h1>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              <span className={clsx(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              )}></span>
              <span className="text-[10px] text-secondary font-medium uppercase tracking-widest">
                {isConnected ? `${config.url}:${config.port}` : "Disconnected"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-500" />
              {selectedModel || 'Select Model'}
              <ChevronDown className={clsx("w-4 h-4 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-panel overflow-hidden z-50 py-2">
                {models.length > 0 ? models.map(m => (
                  <button
                    key={m.name}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-500 hover:text-white transition-colors flex flex-col"
                    onClick={() => { setSelectedModel(m.name); setIsDropdownOpen(false); }}
                  >
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-[10px] opacity-70">{(m.size / 1e9).toFixed(2)} GB • {m.details?.format}</span>
                  </button>
                )) : (
                  <div className="px-4 py-3 text-sm text-secondary italic">No models found</div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
            <SettingsIcon className="w-5 h-5" />
          </button>
          
          <button onClick={clearChat} className="p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto mb-6 px-2 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            {isConnected ? (
              <>
                <Bot className="w-16 h-16 text-indigo-500 mb-2 opacity-50" />
                <h2 className="text-2xl font-heading font-bold opacity-80">How can I help you today?</h2>
                <p className="max-w-md text-secondary">Ready to chat with {selectedModel || 'your models'}.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                  <Server className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Server Disconnected</h2>
                <p className="max-w-md text-secondary">Could not reach the Ollama server at {config.url}:{config.port}.</p>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" /> Configure Server
                </button>
              </>
            )}
          </div>
        ) : (
          messages.map((m, i) => <MessageBubble key={i} message={m} />)
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="glass-panel p-4 mb-4">
        <div className="flex gap-4 items-end">
          <textarea
            className="flex-1 bg-transparent border-none outline-none resize-none min-h-[56px] max-h-[200px] py-2 text-primary placeholder:text-secondary"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !selectedModel}
            className="btn-primary p-3 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config}
        onSave={setConfig}
      />
    </div>
  );
}

export default App;

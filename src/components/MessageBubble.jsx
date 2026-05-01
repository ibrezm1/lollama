import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} fade-in`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-500 border border-slate-200 dark:border-slate-700'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        
        <div className="flex flex-col group">
          <div className={`p-4 rounded-2xl relative shadow-sm ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
          }`}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            
            {!isUser && (
              <button 
                onClick={handleCopy}
                className="absolute -right-10 top-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
                title="Copy message"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
              </button>
            )}
          </div>
          <span className={`text-[10px] mt-1 text-slate-400 font-medium ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'You' : 'Assistant'}
          </span>
        </div>
      </div>
    </div>
  );
}

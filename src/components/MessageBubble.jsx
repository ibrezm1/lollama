import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);

  let thinkContent = '';
  let mainContent = message.content;
  let isThinkingClosed = true;

  const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/i;
  const match = mainContent.match(thinkRegex);

  if (match) {
    thinkContent = match[1].trim();
    isThinkingClosed = /<\/think>/i.test(match[0]);
    mainContent = mainContent.replace(match[0], '').trim();
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-start' : 'justify-end'} fade-in`}>
      <div className={`flex ${isUser ? 'w-full max-w-[95%] sm:max-w-[90%]' : 'max-w-[85%] sm:max-w-[75%]'} ${isUser ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-500 border border-slate-200 dark:border-slate-700'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        
        <div className="flex flex-col group min-w-[200px] w-full">
          <div className={`p-4 rounded-2xl relative shadow-sm ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tl-none text-base' 
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tr-none'
          }`}>
            {thinkContent && (
              <div className="mb-3 text-sm">
                <button 
                  onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                  className="flex items-center gap-2 text-indigo-500/80 hover:text-indigo-500 font-medium transition-colors mb-2"
                >
                  <Bot className="w-4 h-4" />
                  {!isThinkingClosed ? 'Thinking...' : 'Thought Process'}
                </button>
                {isThinkingOpen && (
                  <div className="pl-4 border-l-2 border-indigo-500/30 text-slate-500 dark:text-slate-400 italic mb-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                    {thinkContent}
                    {!isThinkingClosed && <span className="animate-pulse ml-1">...</span>}
                  </div>
                )}
              </div>
            )}
            
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
              <ReactMarkdown>{mainContent}</ReactMarkdown>
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
          <span className={`text-[10px] mt-1 text-slate-400 font-medium ${isUser ? 'text-left' : 'text-right'}`}>
            {isUser ? 'You' : 'Assistant'}
          </span>
        </div>
      </div>
    </div>
  );
}

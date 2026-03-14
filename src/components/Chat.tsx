import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/game';
import { cn } from '../utils/cn';

const EMOJIS = ['😄','😂','🔥','💀','🎮','🤔','😈','🙏','👀','😭','💪','🤯','😤','🫡','👑','💨','🎯','⚡','🚀','💣','🤡','😏','🥹','😡','🤞','🫶','✨','🏆','👻','🐸','💅'];

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  myName: string;
  opponentName: string;
  disabled?: boolean;
}

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export const Chat: React.FC<ChatProps> = ({ messages, onSend, myName, opponentName, disabled }) => {
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    setShowEmojis(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-semibold text-white/80">Live Chat</span>
        <span className="ml-auto text-xs text-white/30">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-white/30 text-xs py-6 flex flex-col items-center gap-2">
            <span className="text-2xl">👋</span>
            <span>No messages yet. Say hi!</span>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === myName;
          const isSystem = msg.sender === 'System';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-xs text-white/30 italic bg-white/5 px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-2',
                isMe ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mb-0.5',
                  isMe
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                )}
              >
                {getInitial(msg.sender)}
              </div>

              {/* Bubble */}
              <div className={cn('flex flex-col max-w-[72%]', isMe ? 'items-end' : 'items-start')}>
                {/* Name */}
                <span className={cn('text-[10px] font-semibold mb-1 px-1', isMe ? 'text-purple-300' : 'text-cyan-300')}>
                  {isMe ? 'You' : opponentName}
                </span>
                <div
                  className={cn(
                    'px-3 py-2 text-sm break-words leading-relaxed shadow-lg',
                    isMe
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl rounded-br-sm'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white/90 border border-white/10 rounded-2xl rounded-bl-sm'
                  )}
                >
                  {msg.text}
                </div>
                {/* Timestamp */}
                <span className="text-[9px] text-white/20 mt-0.5 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojis && (
        <div className="border-t border-white/10 p-2 bg-white/5 shrink-0">
          <div className="flex flex-wrap gap-1">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="text-xl hover:scale-125 transition-transform p-0.5 leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 p-2 flex gap-2 shrink-0">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className={cn(
            'w-9 h-9 rounded-xl text-lg transition-all flex items-center justify-center shrink-0',
            showEmojis ? 'bg-purple-500/40 text-purple-300' : 'hover:bg-white/10 text-white/60'
          )}
          title="Emoji picker"
        >
          😄
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={disabled ? 'Chat unavailable' : 'Type a message...'}
          disabled={disabled}
          maxLength={200}
          className="flex-1 bg-white/10 text-white placeholder-white/30 text-sm rounded-xl px-3 py-2 outline-none border border-transparent focus:border-purple-500/60 min-w-0 disabled:opacity-50 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center shrink-0"
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

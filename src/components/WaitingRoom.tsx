import React, { useState } from 'react';

interface WaitingRoomProps {
  roomId: string;
  playerName: string;
  onCancel: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, playerName, onCancel }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="text-6xl mb-6 animate-spin-slow">⏳</div>
        <h2 className="text-3xl font-black text-white mb-2">Waiting for opponent...</h2>
        <p className="text-white/50 mb-8">Hey <span className="text-purple-400 font-bold">{playerName}</span>! Share this link with your friend:</p>

        {/* Room code */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 backdrop-blur-sm">
          <div className="text-white/50 text-xs mb-2 uppercase tracking-wider">Room Code</div>
          <div className="font-mono text-2xl font-bold text-white/90 break-all mb-4">{roomId}</div>
          <button
            onClick={copyCode}
            className="w-full py-3 px-4 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/40 text-white rounded-xl transition-all font-semibold text-sm"
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>

        {/* Share link */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
          <div className="text-white/50 text-xs mb-2">Or share this link:</div>
          <div className="font-mono text-xs text-white/50 break-all mb-3 bg-black/30 p-2 rounded-lg">
            {shareUrl}
          </div>
          <button
            onClick={copyLink}
            className="w-full py-3 px-4 bg-blue-600/40 hover:bg-blue-600/60 border border-blue-500/40 text-white rounded-xl transition-all font-semibold text-sm"
          >
            {copied ? '✅ Copied!' : '🔗 Copy Link'}
          </button>
        </div>

        {/* Animated waiting dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <button
          onClick={onCancel}
          className="text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
};

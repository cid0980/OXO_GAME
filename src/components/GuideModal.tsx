import React, { useState } from 'react';
import { cn } from '../utils/cn';

interface GuideModalProps {
  onClose: () => void;
  mySymbol: 'X' | 'O';
}

const PAGES = [
  {
    id: 'welcome',
    emoji: '🎮',
    title: 'Welcome to Cheat Tac Toe!',
    subtitle: "It's Tic Tac Toe... but chaotic 😈",
    content: (
      <div className="space-y-3">
        <p className="text-white/70 text-sm leading-relaxed text-center">
          Two players. One board. Three secret cheat moves each.<br />
          Each cheat is <strong className="text-white">one-time use only</strong> — use it wisely! 🤫
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { emoji: '🎯', label: 'Normal Rules', desc: 'Get 3 in a row to win' },
            { emoji: '🃏', label: '1 Use Each', desc: '🔄 Undo · 👻 Ghost · 💨 Vanish' },
            { emoji: '🌀', label: 'Vanishing Marks', desc: 'Oldest mark disappears!' },
            { emoji: '🤫', label: 'Secretly Used', desc: 'Opponent never knows' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-xs font-bold text-white/80">{item.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'rules',
    emoji: '📋',
    title: 'How to Play',
    subtitle: 'Classic rules + one big twist!',
    content: (
      <div className="space-y-3">
        <div className="space-y-2">
          {[
            { icon: '1️⃣', text: 'Players take turns placing their mark (X or O) on the board' },
            { icon: '2️⃣', text: 'Get 3 in a row — horizontally, vertically, or diagonally — to WIN' },
            { icon: '3️⃣', text: 'X always goes first. Player 1 (room creator) is always X' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-xl shrink-0">{step.icon}</span>
              <p className="text-sm text-white/70 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
        {/* Mini board illustration */}
        <div className="flex justify-center mt-2">
          <div className="grid grid-cols-3 gap-1">
            {['X','O','X','','X','O','O','','X'].map((v, i) => (
              <div key={i} className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black border',
                v === 'X' ? 'bg-pink-500/20 border-pink-500/40 text-pink-400' :
                v === 'O' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' :
                'bg-white/5 border-white/10 text-white/0'
              )}>{v}</div>
            ))}
          </div>
          <div className="ml-3 flex items-center">
            <span className="text-sm text-yellow-400 font-bold">← X wins diagonally! 🏆</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ouroboros',
    emoji: '🌀',
    title: 'The Vanishing Rule',
    subtitle: 'Only 3 marks per player — oldest disappears!',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/30 rounded-2xl p-4">
          <div className="text-5xl text-center mb-3">🌀</div>
          <h3 className="text-white font-bold text-center mb-3">How It Works</h3>
          <div className="space-y-2">
            {[
              { icon: '3️⃣', text: 'Each player can have a maximum of 3 marks on the board at a time' },
              { icon: '4️⃣', text: 'When you place your 4th mark, your 1st (oldest) mark vanishes automatically!' },
              { icon: '📉', text: 'Your marks shrink as they age — the smallest one is about to disappear' },
              { icon: '❌', text: '"Vanishes next" label appears above the mark that is about to go' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Visual size demo */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/40 text-center mb-3">Mark aging — newest to oldest:</p>
          <div className="flex items-center justify-center gap-4">
            {[
              { label: 'Newest', scale: 'scale-100', opacity: 'opacity-100', color: 'border-pink-500/60 text-pink-400', v: 'X' },
              { label: 'Middle', scale: 'scale-[0.85]', opacity: 'opacity-75', color: 'border-pink-500/40 text-pink-400/70', v: 'X' },
              { label: 'Oldest ⚠️', scale: 'scale-[0.65]', opacity: 'opacity-50', color: 'border-red-500/60 text-pink-400/50', v: 'X' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-lg',
                  item.color, item.scale, item.opacity
                )}>{item.v}</div>
                <span className="text-[9px] text-white/40 text-center leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-xs text-yellow-300/80 text-center">
            💡 <strong>Strategy tip:</strong> Plan your moves knowing your oldest mark will soon vanish — don't rely on it!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'cheat-undo',
    emoji: '🔄',
    title: 'Cheat #1: Undo',
    subtitle: "Secretly erase your opponent's last move",
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-orange-500/15 to-red-500/15 border border-orange-500/30 rounded-2xl p-4">
          <div className="text-5xl text-center mb-3">🔄</div>
          <h3 className="text-white font-bold text-center mb-3">How Undo Works</h3>
          <div className="space-y-2">
            {[
              { icon: '👆', text: "Click the Undo button in your cheat panel" },
              { icon: '💥', text: "Your opponent's most recent mark is secretly removed from the board" },
              { icon: '🎯', text: "It's YOUR turn again — like their move never happened!" },
              { icon: '🤫', text: "They have no idea what just happened 😈" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-xs text-yellow-300/80 text-center">
            💡 <strong>Best used</strong> when your opponent just blocked your winning move!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'cheat-ghost',
    emoji: '👻',
    title: 'Cheat #2: Ghost',
    subtitle: 'Your mark becomes untouchable for 1 turn',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-green-500/15 to-teal-500/15 border border-green-500/30 rounded-2xl p-4">
          <div className="text-5xl text-center mb-3">👻</div>
          <h3 className="text-white font-bold text-center mb-3">How Ghost Works</h3>
          <div className="space-y-2">
            {[
              { icon: '1️⃣', text: "Activate Ghost from your cheat panel — it arms silently" },
              { icon: '2️⃣', text: "Now place your mark on any cell — that cell is GHOST PROTECTED" },
              { icon: '3️⃣', text: "On your opponent's turn, if they click that cell → NOTHING HAPPENS" },
              { icon: '4️⃣', text: "After their turn ends, the ghost expires and the cell acts normally" },
              { icon: '🤫', text: "They'll be confused why their click did nothing 😏" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Visual example */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-[10px] text-white/30 text-center mb-2">What YOU see vs what THEY see:</p>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl border-2 border-green-400/50 bg-green-400/10 flex items-center justify-center font-black text-pink-400 text-lg ring-2 ring-green-400/40 relative mx-auto">
                X
                <span className="absolute -top-2 -right-2 text-xs">👻</span>
              </div>
              <p className="text-[9px] text-green-400 mt-1">You see: protected</p>
            </div>
            <div className="text-white/20 text-lg font-black">vs</div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl border-2 border-pink-500/40 bg-pink-500/10 flex items-center justify-center font-black text-pink-400 text-lg mx-auto">
                X
              </div>
              <p className="text-[9px] text-white/30 mt-1">They see: normal</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-xs text-yellow-300/80 text-center">
            💡 <strong>Best used</strong> on a cell that completes your winning line — force them to play elsewhere!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'cheat-vanish',
    emoji: '💨',
    title: 'Cheat #3: Vanish',
    subtitle: "Poof! One of their marks disappears",
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/30 rounded-2xl p-4">
          <div className="text-5xl text-center mb-3">💨</div>
          <h3 className="text-white font-bold text-center mb-3">How Vanish Works</h3>
          <div className="space-y-2">
            {[
              { icon: '👆', text: "Click the Vanish button in your cheat panel" },
              { icon: '🎲', text: "A RANDOM mark from your opponent is removed from the board" },
              { icon: '😵', text: "They suddenly have one less mark and don't know why!" },
              { icon: '🤫', text: "Their strategy just got completely ruined 💨" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-xs text-yellow-300/80 text-center">
            💡 <strong>Best used</strong> when opponent is close to winning — breaks their line!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'tips',
    emoji: '🏆',
    title: "Pro Tips & Warnings",
    subtitle: "Read this or get wrecked 😤",
    content: (
      <div className="space-y-3">
        <div className="space-y-2">
          {[
            { icon: '🌀', color: 'border-purple-500/30 bg-purple-500/10', text: "Oldest marks vanish automatically when you place your 4th. Don't build strategy around a mark that's about to disappear!" },
            { icon: '⚠️', color: 'border-yellow-500/30 bg-yellow-500/10', text: "Each cheat can only be used ONCE per game — choose your moment carefully!" },
            { icon: '🤫', color: 'border-slate-500/30 bg-slate-500/10', text: "Your opponent CANNOT see when you use a cheat. Stay calm and act natural 😇" },
            { icon: '🔄', color: 'border-orange-500/30 bg-orange-500/10', text: "Undo removes their MOST RECENT mark. Use it right after they make a move!" },
            { icon: '🎲', color: 'border-blue-500/30 bg-blue-500/10', text: "Vanish picks a RANDOM opponent mark — it might not be the one you wanted!" },
            { icon: '👻', color: 'border-green-500/30 bg-green-500/10', text: "Ghost — activate it, THEN place your mark. That cell can't be taken by opponent for 1 full turn!" },
            { icon: '👀', color: 'border-pink-500/30 bg-pink-500/10', text: "Watch opponent's cheat dots — if one goes grey, they just cheated on you!" },
          ].map((tip, i) => (
            <div key={i} className={cn('flex items-start gap-3 rounded-xl p-3 border', tip.color)}>
              <span className="text-base shrink-0">{tip.icon}</span>
              <p className="text-xs text-white/70 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export const GuideModal: React.FC<GuideModalProps> = ({ onClose, mySymbol }) => {
  const [page, setPage] = useState(0);
  const current = PAGES[page];
  const isLast = page === PAGES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-1">
            {/* Page dots */}
            <div className="flex gap-1">
              {PAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === page
                      ? 'w-5 h-2 bg-purple-400'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  )}
                />
              ))}
            </div>
            {/* Skip */}
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Skip guide ✕
            </button>
          </div>

          <div className="text-center mt-3">
            <div className="text-5xl mb-2">{current.emoji}</div>
            <h2 className="text-lg font-black text-white">{current.title}</h2>
            <p className="text-sm text-white/40 mt-1">{current.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 overflow-y-auto flex-1">
          {current.content}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="flex gap-3">
            {page > 0 && (
              <button
                onClick={() => setPage(p => p - 1)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all active:scale-95 text-sm"
              >
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? onClose : () => setPage(p => p + 1)}
              className={cn(
                'py-3 font-black rounded-2xl transition-all active:scale-95 text-sm',
                page === 0 ? 'flex-1' : 'flex-[2]',
                isLast
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg shadow-green-500/20'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20'
              )}
            >
              {isLast ? "🎮 Let's Play!" : 'Next →'}
            </button>
          </div>

          {/* Your symbol reminder */}
          <div className="text-center mt-3">
            <span className="text-xs text-white/30">
              You are playing as{' '}
              <span className={cn('font-black', mySymbol === 'X' ? 'text-pink-400' : 'text-blue-400')}>
                {mySymbol}
              </span>
              {mySymbol === 'X' ? ' — you go first! ⚡' : ' — you go second'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

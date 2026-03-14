import React, { useState } from 'react';
import { CheatType } from '../types/game';
import { cn } from '../utils/cn';

interface CheatInfo {
  type: CheatType;
  icon: string;
  name: string;
  shortDesc: string;
  detailDesc: string;
  color: string;
  dotColor: string;
  usedColor: string;
}

const CHEATS: CheatInfo[] = [
  {
    type: 'undo',
    icon: '🔄',
    name: 'Undo',
    shortDesc: "Erase their last move",
    detailDesc: "Removes your opponent's most recently placed mark from the board. The turn stays with you — they'll never know why it vanished.",
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/40 hover:border-orange-400/70',
    dotColor: 'bg-orange-400 shadow-sm shadow-orange-400/60',
    usedColor: 'from-white/5 to-white/5 border-white/10',
  },
  {
    type: 'ghost',
    icon: '👻',
    name: 'Ghost',
    shortDesc: 'Protect your next mark for 1 turn',
    detailDesc: "Activate Ghost, then place your mark. That cell becomes protected — your opponent's click on it will be silently blocked for their next turn. They won't know why it didn't work 😏",
    color: 'from-green-500/20 to-teal-500/20 border-green-500/40 hover:border-green-400/70',
    dotColor: 'bg-green-400 shadow-sm shadow-green-400/60',
    usedColor: 'from-white/5 to-white/5 border-white/10',
  },
  {
    type: 'vanish',
    icon: '💨',
    name: 'Vanish',
    shortDesc: "Poof — random mark gone",
    detailDesc: "A random mark from your opponent disappears off the board. They'll be totally confused about what just happened 😈",
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 hover:border-blue-400/70',
    dotColor: 'bg-blue-400 shadow-sm shadow-blue-400/60',
    usedColor: 'from-white/5 to-white/5 border-white/10',
  },
];

interface CheatPanelProps {
  usedCheats: CheatType[];        // which cheats THIS player has already used
  onCheat: (type: CheatType) => void;
  gameOver: boolean;
  disabled: boolean;
  ghostArmed?: boolean;           // ghost cheat is armed — waiting for player to place mark
}

export const CheatPanel: React.FC<CheatPanelProps> = ({
  usedCheats,
  onCheat,
  gameOver,
  disabled,
  ghostArmed = false,
}) => {
  const [expandedCheat, setExpandedCheat] = useState<CheatType | null>(null);
  const [confirmCheat, setConfirmCheat] = useState<CheatType | null>(null);
  const [justUsed, setJustUsed] = useState<CheatType | null>(null);

  const cheatsLeft = CHEATS.filter(c => !usedCheats.includes(c.type)).length;

  const handleCheatClick = (type: CheatType) => {
    if (usedCheats.includes(type) || disabled || gameOver) return;
    if (expandedCheat !== type) {
      setExpandedCheat(type);
      setConfirmCheat(null);
      return;
    }
    // Already expanded — move to confirm
    setConfirmCheat(type);
  };

  const handleConfirm = (e: React.MouseEvent, type: CheatType) => {
    e.stopPropagation();
    onCheat(type);
    setJustUsed(type);
    setExpandedCheat(null);
    setConfirmCheat(null);
    setTimeout(() => setJustUsed(null), 2500);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCheat(null);
    setConfirmCheat(null);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">
          🃏 <span>Cheat Moves</span>
          <span className="text-[10px] text-white/30 font-normal">(opponent can't see these)</span>
        </h3>
        {/* Per-cheat dots */}
        <div className="flex items-center gap-1.5">
          {CHEATS.map(c => (
            <div
              key={c.type}
              title={c.name}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-500',
                usedCheats.includes(c.type) ? 'bg-white/15' : c.dotColor,
              )}
            />
          ))}
          <span className="text-xs text-white/40 ml-1 font-mono">{cheatsLeft}/3</span>
        </div>
      </div>

      {/* Ghost Armed Banner */}
      {ghostArmed && (
        <div className="mb-3 flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-xl px-3 py-2 animate-pulse">
          <span className="text-lg">👻</span>
          <div>
            <p className="text-xs font-black text-green-300">Ghost Armed!</p>
            <p className="text-[10px] text-green-300/60">Now place your mark — that cell will be protected</p>
          </div>
        </div>
      )}

      {/* Cheat Cards */}
      <div className="space-y-2">
        {CHEATS.map(cheat => {
          const isUsed = usedCheats.includes(cheat.type);
          const isExpanded = expandedCheat === cheat.type;
          const isConfirming = confirmCheat === cheat.type;
          const isJustUsed = justUsed === cheat.type;
          const canUse = !isUsed && !gameOver && !disabled;
          const isGhostArmed = cheat.type === 'ghost' && ghostArmed;

          return (
            <div key={cheat.type}>
              {/* Main cheat row */}
              <button
                onClick={() => handleCheatClick(cheat.type)}
                disabled={isUsed || gameOver || disabled}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border bg-gradient-to-r',
                  'transition-all duration-200 text-left group',
                  isUsed
                    ? cn(cheat.usedColor, 'cursor-not-allowed opacity-40')
                    : cn(cheat.color, 'cursor-pointer'),
                  isExpanded && !isUsed && 'rounded-b-none',
                  isConfirming && 'ring-2 ring-yellow-400/50 scale-[1.01]',
                  isJustUsed && 'opacity-50',
                  isGhostArmed && 'ring-2 ring-green-400/60 animate-pulse',
                  canUse && !isExpanded && !isGhostArmed && 'hover:scale-[1.01] active:scale-[0.99]',
                )}
              >
                {/* Icon */}
                <span className={cn(
                  'text-2xl shrink-0 transition-all duration-300',
                  isUsed && 'grayscale opacity-40',
                  isJustUsed && 'animate-bounce',
                )}>
                  {isJustUsed ? '✅' : isUsed ? '🔒' : cheat.icon}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-bold',
                      isUsed ? 'text-white/30' : 'text-white',
                    )}>
                      {cheat.name}
                    </span>
                    {isUsed && (
                      <span className="text-[10px] font-bold bg-white/10 text-white/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Used
                      </span>
                    )}
                    {isJustUsed && (
                      <span className="text-xs text-green-400 font-semibold animate-pulse">Activated!</span>
                    )}
                    {isGhostArmed && !isUsed && (
                      <span className="text-xs text-green-400 font-bold animate-pulse">⚡ Armed!</span>
                    )}
                    {isConfirming && !isUsed && !isGhostArmed && (
                      <span className="text-xs text-yellow-400 font-bold animate-pulse">⚠️ Confirm?</span>
                    )}
                  </div>
                  <div className={cn('text-xs truncate', isUsed ? 'text-white/20' : 'text-white/50')}>
                    {isUsed ? 'Already used this game' : cheat.shortDesc}
                  </div>
                </div>

                {/* Expand arrow */}
                {canUse && (
                  <span className={cn(
                    'text-white/30 text-xs transition-transform duration-200 shrink-0',
                    isExpanded ? 'rotate-180' : '',
                  )}>
                    ▼
                  </span>
                )}
              </button>

              {/* Expanded detail panel */}
              {isExpanded && !isUsed && (
                <div className={cn(
                  'border border-t-0 rounded-b-xl p-3 bg-gradient-to-b from-black/20 to-black/30',
                  cheat.type === 'undo' ? 'border-orange-500/30' :
                  cheat.type === 'ghost' ? 'border-green-500/30' : 'border-blue-500/30'
                )}>
                  {/* Description */}
                  <p className="text-xs text-white/70 leading-relaxed mb-3">
                    {cheat.detailDesc}
                  </p>

                  {/* Step by step for Ghost */}
                  {cheat.type === 'ghost' && (
                    <div className="space-y-1.5 mb-3">
                      {[
                        { n: '1', t: 'Click "Use Cheat" below' },
                        { n: '2', t: 'Place your mark on any empty cell' },
                        { n: '3', t: "That cell is now 👻 Ghost-protected for one opponent turn" },
                        { n: '4', t: "If they click it — nothing happens to them, silently blocked!" },
                      ].map(s => (
                        <div key={s.n} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-green-500/30 text-green-300 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">{s.n}</span>
                          <p className="text-[11px] text-white/60">{s.t}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* One-time warning */}
                  <div className="flex items-center gap-1.5 text-[11px] text-yellow-400/80 mb-3 bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-2 py-1.5">
                    <span>⚠️</span>
                    <span className="font-semibold">One-time use only — once it's gone, it's gone!</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white/60 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        if (isConfirming) {
                          handleConfirm(e, cheat.type);
                        } else {
                          e.stopPropagation();
                          setConfirmCheat(cheat.type);
                        }
                      }}
                      className={cn(
                        'flex-[2] py-2 text-xs font-black rounded-lg transition-all active:scale-95',
                        isConfirming
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-orange-500/30 scale-[1.02]'
                          : cheat.type === 'undo'
                          ? 'bg-orange-500/30 hover:bg-orange-500/50 text-orange-200'
                          : cheat.type === 'ghost'
                          ? 'bg-green-500/30 hover:bg-green-500/50 text-green-200'
                          : 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-200'
                      )}
                    >
                      {isConfirming ? '🔥 YES, USE IT!' : '⚡ Use Cheat'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer status */}
      {cheatsLeft === 0 && (
        <div className="text-center text-xs text-white/25 mt-3 italic flex items-center justify-center gap-1">
          <span>🔒</span><span>All cheats used — you're on your own now!</span>
        </div>
      )}

      {cheatsLeft > 0 && !gameOver && !disabled && !ghostArmed && (
        <div className="text-center text-xs text-white/20 mt-3">
          Tap a cheat to expand • each can only be used once
        </div>
      )}
    </div>
  );
};

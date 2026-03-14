import React from 'react';
import { Board as BoardType, PlayerSymbol, GameState } from '../types/game';
import { getWinningLine, MAX_MARKS } from '../utils/gameLogic';
import { cn } from '../utils/cn';

interface BoardProps {
  board: BoardType;
  onCellClick: (index: number) => void;
  currentTurn: PlayerSymbol;
  mySymbol: PlayerSymbol;
  winner: string | null;
  disabled: boolean;
  lastMove: number | null;
  moveHistory: GameState['moveHistory'];
  ghostCell: number | null;
  ghostOwner: PlayerSymbol | null;
  ghostActive: boolean;
}

const XMark = ({ dimmed }: { dimmed?: boolean }) => (
  <svg viewBox="0 0 60 60" className="w-12 h-12 md:w-16 md:h-16" fill="none">
    <line x1="10" y1="10" x2="50" y2="50"
      stroke={dimmed ? '#f472b688' : '#f472b6'}
      strokeWidth="7" strokeLinecap="round" className="animate-draw-x-1" />
    <line x1="50" y1="10" x2="10" y2="50"
      stroke={dimmed ? '#f472b688' : '#f472b6'}
      strokeWidth="7" strokeLinecap="round" className="animate-draw-x-2" />
  </svg>
);

const OMark = ({ dimmed }: { dimmed?: boolean }) => (
  <svg viewBox="0 0 60 60" className="w-12 h-12 md:w-16 md:h-16" fill="none">
    <circle cx="30" cy="30" r="20"
      stroke={dimmed ? '#60a5fa88' : '#60a5fa'}
      strokeWidth="7" strokeLinecap="round" className="animate-draw-o" />
  </svg>
);

/**
 * Returns visual info for a cell based on its age in the move history.
 * ageIndex: 0 = oldest (will vanish next), length-1 = newest
 *
 * Visual scale / opacity:
 *   newest (last):   scale 1.0,  opacity 1.0
 *   middle:          scale 0.85, opacity 0.75
 *   oldest (0):      scale 0.65, opacity 0.50  + warning pulse
 */
function getCellVisual(cellIndex: number, player: PlayerSymbol, moveHistory: GameState['moveHistory']) {
  const history = moveHistory[player];
  const pos = history.indexOf(cellIndex);
  if (pos === -1) return null;

  const count = history.length;
  // How many steps from the end (0 = newest, count-1 = oldest)
  const fromEnd = count - 1 - pos;

  // Only style aging when player has 2+ marks
  if (count === 1) return { scale: 1, opacity: 1, isOldest: false, willVanishSoon: false };

  if (count === 2) {
    // oldest = fromEnd 1, newest = fromEnd 0
    if (fromEnd === 0) return { scale: 1,    opacity: 1,    isOldest: false, willVanishSoon: false };
    else              return { scale: 0.85,  opacity: 0.75, isOldest: false, willVanishSoon: false };
  }

  // count === MAX_MARKS (3): oldest is about to vanish on next placement
  if (fromEnd === 0) return { scale: 1,    opacity: 1,    isOldest: false, willVanishSoon: false };
  if (fromEnd === 1) return { scale: 0.85, opacity: 0.75, isOldest: false, willVanishSoon: false };
  // fromEnd === 2 means pos === 0 = oldest, will vanish on opponent's next move
  return { scale: 0.65, opacity: 0.50, isOldest: true, willVanishSoon: true };
}

export const Board: React.FC<BoardProps> = ({
  board, onCellClick, currentTurn, mySymbol, winner, disabled, lastMove, moveHistory,
  ghostCell, ghostOwner, ghostActive,
}) => {
  const winLine = winner && winner !== 'draw' ? getWinningLine(board) : null;

  // Which cell is the oldest for X and O (will vanish next placement)?
  const oldestX = moveHistory.X.length >= MAX_MARKS ? moveHistory.X[0] : null;
  const oldestO = moveHistory.O.length >= MAX_MARKS ? moveHistory.O[0] : null;

  return (
    <div className="relative">
      {/* Ouroboros hint */}
      {!winner && (
        <div className="flex items-center justify-center gap-2 mb-3 text-[11px] text-white/30 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />
          Max 3 marks each — oldest fades &amp; vanishes
          <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, index) => {
          const isWinCell = winLine?.includes(index);
          const isLastMove = lastMove === index;
          const isEmpty = cell === null;
          const isMyTurn = currentTurn === mySymbol && !disabled && !winner;
          const isClickable = isEmpty && isMyTurn;

          // Cell owner
          const owner = cell as PlayerSymbol | null;
          const visual = owner ? getCellVisual(index, owner, moveHistory) : null;

          // Is this cell the oldest mark (about to vanish)?
          const isAboutToVanish = index === oldestX || index === oldestO;

          // Ghost: this cell is ghost-protected AND I am the ghost owner → show subtle glow to me only
          const isMyGhostCell = ghostActive && ghostCell === index && ghostOwner === mySymbol && !isEmpty;
          // Ghost: this cell is ghost-protected AND I am the opponent → cell just looks normal (no hint)

          return (
            <button
              key={index}
              onClick={() => isClickable && onCellClick(index)}
              style={visual && !isWinCell ? {
                transform: `scale(${visual.scale})`,
                opacity: visual.opacity,
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
              } : undefined}
              className={cn(
                'relative w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center',
                'border-2',
                'bg-white/5 backdrop-blur-sm',
                // Win highlight
                isWinCell
                  ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30 scale-105 transition-all duration-200'
                  : isAboutToVanish && !isWinCell
                    // Oldest mark: pulsing warning border
                    ? 'border-red-500/60 animate-pulse-border transition-all duration-300'
                    : isLastMove && !isWinCell
                      ? 'border-white/30 transition-all duration-200'
                      : 'border-white/10 transition-all duration-200',
                isClickable
                  ? 'hover:bg-white/10 hover:border-white/30 hover:scale-105 cursor-pointer'
                  : 'cursor-default',
                !isEmpty && 'shadow-inner',
              )}
            >
              {/* Vanish warning glow on oldest cell */}
              {isAboutToVanish && !isWinCell && (
                <div className="absolute inset-0 rounded-2xl bg-red-500/10 animate-pulse pointer-events-none" />
              )}

              {/* Ghost protection glow — only visible to the ghost owner */}
              {isMyGhostCell && !isWinCell && (
                <div className="absolute inset-0 rounded-2xl bg-green-400/15 animate-pulse pointer-events-none ring-2 ring-green-400/40" />
              )}

              {cell === 'X' && (
                <div className={cn('transition-all', isWinCell && 'scale-110')}>
                  <XMark dimmed={!!(visual?.willVanishSoon)} />
                </div>
              )}
              {cell === 'O' && (
                <div className={cn('transition-all', isWinCell && 'scale-110')}>
                  <OMark dimmed={!!(visual?.willVanishSoon)} />
                </div>
              )}

              {/* Hover ghost */}
              {isEmpty && isMyTurn && (
                <div className="opacity-0 hover:opacity-30 transition-opacity absolute inset-0 flex items-center justify-center">
                  {mySymbol === 'X' ? <XMark /> : <OMark />}
                </div>
              )}

              {/* Win pulse */}
              {isWinCell && (
                <div className="absolute inset-0 rounded-2xl animate-pulse bg-yellow-400/10" />
              )}

              {/* "Next to go" label on oldest */}
              {isAboutToVanish && !isWinCell && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-400/80 whitespace-nowrap pointer-events-none select-none">
                  vanishes next
                </div>
              )}

              {/* Ghost shield badge — only shown to ghost owner */}
              {isMyGhostCell && !isWinCell && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-green-400/90 whitespace-nowrap pointer-events-none select-none">
                  👻 protected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid lines decoration */}
      <div className="absolute inset-0 pointer-events-none" style={{ top: '2rem' }}>
        <div className="absolute left-[33.33%] top-0 bottom-0 w-px bg-white/10" />
        <div className="absolute left-[66.66%] top-0 bottom-0 w-px bg-white/10" />
        <div className="absolute top-[33.33%] left-0 right-0 h-px bg-white/10" />
        <div className="absolute top-[66.66%] left-0 right-0 h-px bg-white/10" />
      </div>
    </div>
  );
};

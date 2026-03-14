import React, { useState, useCallback, useEffect } from 'react';
import { GameState, ChatMessage, PlayerSymbol, CheatType } from '../types/game';
import { applyMove, applyCheat } from '../utils/gameLogic';
import { Board } from './Board';
import { Chat } from './Chat';
import { CheatPanel } from './CheatPanel';
import { GuideModal } from './GuideModal';
import { cn } from '../utils/cn';

interface GameProps {
  mySymbol: PlayerSymbol;
  myName: string;
  opponentName: string;
  gameState: GameState;
  messages: ChatMessage[];
  onMove: (newState: GameState) => void;
  onCheat: (newState: GameState) => void;
  onChat: (text: string) => void;
  onRematch: () => void;
  onLeave: () => void;
  connectionStatus: string;
  rematchRequested: PlayerSymbol | null;
}

const GUIDE_SEEN_KEY = 'cheatTacToe_guideSeen';

export const Game: React.FC<GameProps> = ({
  mySymbol,
  myName,
  opponentName,
  gameState,
  messages,
  onMove,
  onCheat,
  onChat,
  onRematch,
  onLeave,
  connectionStatus,
  rematchRequested,
}) => {
  const [showCheatToast, setShowCheatToast] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [showGuide] = useState(() => {
    try {
      if (localStorage.getItem(GUIDE_SEEN_KEY)) return false;
      // Mark as seen immediately — even if user force-closes the browser
      // mid-guide, it will never show again on next visit
      localStorage.setItem(GUIDE_SEEN_KEY, '1');
      return true;
    } catch {
      return false;
    }
  });

  const [guideOpen, setGuideOpen] = useState(showGuide);

  const handleCloseGuide = () => {
    setGuideOpen(false);
  };

  const isMyTurn = gameState.currentTurn === mySymbol;
  const isConnected = connectionStatus === 'connected';

  const handleCellClick = useCallback((index: number) => {
    if (!isMyTurn || gameState.winner || !isConnected) return;
    const newState = applyMove(gameState, index, mySymbol);
    if (newState !== gameState) {
      onMove(newState);
    }
  }, [isMyTurn, gameState, mySymbol, isConnected, onMove]);

  const handleCheat = useCallback((type: CheatType) => {
    if (gameState.winner || !isConnected) return;
    const newState = applyCheat(gameState, type, mySymbol);
    if (newState !== gameState) {
      onCheat(newState);
      const cheatMessages: Record<CheatType, string> = {
        undo: '🔄 Undo activated! Their last move is gone 😈',
        ghost: '👻 Ghost Armed! Now place your mark — it\'ll be protected!',
        vanish: '💨 Vanish! One of their marks disappeared 👻',
      };
      setShowCheatToast(cheatMessages[type]);
      setTimeout(() => setShowCheatToast(null), 3500);
    }
  }, [gameState, mySymbol, isConnected, onCheat]);

  // Ghost is "armed" when ghostActive=true, ghostOwner=mySymbol, ghostCell=null
  const ghostArmed = !!(
    gameState.ghostActive &&
    gameState.ghostOwner === mySymbol &&
    gameState.ghostCell === null
  );

  const getStatusText = () => {
    if (!isConnected) return '🔴 Disconnected';
    if (gameState.winner === 'draw') return "🤝 It's a draw!";
    if (gameState.winner === mySymbol) return '🎉 You won!';
    if (gameState.winner) return '😔 You lost!';
    if (ghostArmed) return '👻 Ghost Armed — place your mark to protect it!';
    if (isMyTurn) return '✨ Your turn!';
    return `⏳ ${opponentName}'s turn...`;
  };

  const statusColor = () => {
    if (!isConnected) return 'text-red-400';
    if (gameState.winner === mySymbol) return 'text-yellow-400';
    if (gameState.winner && gameState.winner !== 'draw') return 'text-red-400';
    if (gameState.winner === 'draw') return 'text-blue-400';
    if (ghostArmed) return 'text-green-400 animate-pulse';
    if (isMyTurn) return 'text-green-400';
    return 'text-white/50';
  };

  const opponentSymbol: PlayerSymbol = mySymbol === 'X' ? 'O' : 'X';

  // Track unread messages when chat is closed on mobile
  const [lastSeenCount, setLastSeenCount] = useState(messages.length);
  const unreadCount = chatOpen ? 0 : messages.length - lastSeenCount;
  useEffect(() => {
    if (chatOpen) setLastSeenCount(messages.length);
  }, [chatOpen, messages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-3 md:p-6">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      {/* Guide Modal */}
      {guideOpen && (
        <GuideModal onClose={handleCloseGuide} mySymbol={mySymbol} />
      )}

      {/* Cheat Used Toast */}
      {showCheatToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-purple-700 to-pink-700 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm border border-white/20 flex items-center gap-2">
            <span>{showCheatToast}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onLeave}
            className="text-white/40 hover:text-white/70 text-sm transition-colors flex items-center gap-1 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Leave
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Cheat Tac Toe
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection dot */}
            <div className={cn('text-xs flex items-center gap-1', isConnected ? 'text-green-400' : 'text-red-400')}>
              <div className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
              {isConnected ? 'Live' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* ─── Left: Game area ─── */}
          <div className="flex-1 space-y-4">

            {/* Players bar */}
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
              {/* Me */}
              <div className={cn('flex items-center gap-3 transition-all', isMyTurn && !gameState.winner && 'scale-105')}>
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-black text-xl border-2 transition-all',
                  mySymbol === 'X'
                    ? 'bg-pink-500/20 border-pink-500/60 text-pink-400'
                    : 'bg-blue-500/20 border-blue-500/60 text-blue-400',
                  isMyTurn && !gameState.winner && mySymbol === 'X' && 'shadow-lg shadow-pink-500/40',
                  isMyTurn && !gameState.winner && mySymbol === 'O' && 'shadow-lg shadow-blue-500/40',
                )}>
                  {mySymbol}
                </div>
                <div>
                  <div className="text-white font-bold text-sm flex items-center gap-1">
                    {myName}
                    <span className="text-white/30 font-normal text-xs">(you)</span>
                    {isMyTurn && !gameState.winner && (
                      <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {(['undo', 'ghost', 'vanish'] as const).map(c => (
                      <span key={c} title={c} className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        (gameState.usedCheats?.[mySymbol] ?? []).includes(c)
                          ? 'bg-white/15'
                          : c === 'undo' ? 'bg-orange-400'
                          : c === 'ghost' ? 'bg-green-400'
                          : 'bg-blue-400'
                      )} />
                    ))}
                    <span className={cn('text-[10px] ml-0.5', mySymbol === 'X' ? 'text-pink-400/60' : 'text-blue-400/60')}>
                      {3 - (gameState.usedCheats?.[mySymbol]?.length ?? 0)} left
                    </span>
                  </div>
                </div>
              </div>

              {/* VS divider */}
              <div className="flex flex-col items-center">
                <span className="text-white/20 font-black text-sm">VS</span>
              </div>

              {/* Opponent */}
              <div className={cn('flex items-center gap-3 flex-row-reverse transition-all', !isMyTurn && !gameState.winner && 'scale-105')}>
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-black text-xl border-2 transition-all',
                  opponentSymbol === 'X'
                    ? 'bg-pink-500/20 border-pink-500/60 text-pink-400'
                    : 'bg-blue-500/20 border-blue-500/60 text-blue-400',
                  !isMyTurn && !gameState.winner && opponentSymbol === 'X' && 'shadow-lg shadow-pink-500/40',
                  !isMyTurn && !gameState.winner && opponentSymbol === 'O' && 'shadow-lg shadow-blue-500/40',
                )}>
                  {opponentSymbol}
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm flex items-center justify-end gap-1">
                    {!isMyTurn && !gameState.winner && (
                      <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" />
                    )}
                    {opponentName}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className={cn('text-[10px] mr-0.5', opponentSymbol === 'X' ? 'text-pink-400/60' : 'text-blue-400/60')}>
                      {3 - (gameState.usedCheats?.[opponentSymbol]?.length ?? 0)} left
                    </span>
                    {(['undo', 'ghost', 'vanish'] as const).map(c => (
                      <span key={c} title={c} className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        (gameState.usedCheats?.[opponentSymbol] ?? []).includes(c)
                          ? 'bg-white/15'
                          : c === 'undo' ? 'bg-orange-400'
                          : c === 'ghost' ? 'bg-green-400'
                          : 'bg-blue-400'
                      )} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className={cn('text-center font-bold text-base transition-all py-1', statusColor())}>
              {getStatusText()}
            </div>

            {/* Board */}
            <div className="flex justify-center">
              <Board
                board={gameState.board}
                onCellClick={handleCellClick}
                currentTurn={gameState.currentTurn}
                mySymbol={mySymbol}
                winner={gameState.winner}
                disabled={!isConnected}
                lastMove={gameState.lastMove}
                moveHistory={gameState.moveHistory ?? { X: [], O: [] }}
                ghostCell={gameState.ghostCell ?? null}
                ghostOwner={gameState.ghostOwner ?? null}
                ghostActive={gameState.ghostActive ?? false}
              />
            </div>

            {/* Game Over Actions */}
            {gameState.winner && (
              <div className="flex flex-col items-center gap-3">
                <div className="text-5xl animate-bounce">
                  {gameState.winner === mySymbol ? '🏆' : gameState.winner === 'draw' ? '🤝' : '💀'}
                </div>
                {rematchRequested && rematchRequested !== mySymbol && (
                  <div className="text-yellow-400 text-sm font-semibold animate-pulse">
                    {opponentName} wants a rematch!
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={onRematch}
                    className={cn(
                      'py-3 px-6 font-bold rounded-2xl transition-all hover:scale-105 active:scale-95',
                      rematchRequested === mySymbol
                        ? 'bg-yellow-600/30 border border-yellow-500/40 text-yellow-300 cursor-default'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg'
                    )}
                    disabled={rematchRequested === mySymbol}
                  >
                    {rematchRequested === mySymbol ? '⏳ Waiting...' : '🔄 Rematch'}
                  </button>
                  <button
                    onClick={onLeave}
                    className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    🚪 Leave
                  </button>
                </div>
              </div>
            )}

            {/* Cheat Panel */}
            <CheatPanel
              usedCheats={gameState.usedCheats?.[mySymbol] ?? []}
              onCheat={handleCheat}
              gameOver={!!gameState.winner}
              disabled={!isConnected}
              ghostArmed={ghostArmed}
            />
          </div>

          {/* ─── Right: Chat ─── */}
          <div className="lg:w-80 flex flex-col">
            {/* Mobile chat toggle */}
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors"
              >
                💬 Chat {chatOpen ? '▲' : '▼'}
                {unreadCount > 0 && (
                  <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    +{unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className={cn('lg:block flex-1', chatOpen ? 'block' : 'hidden')}>
              <div className="h-80 lg:h-[600px]">
                <Chat
                  messages={messages}
                  onSend={onChat}
                  myName={myName}
                  opponentName={opponentName}
                  disabled={!isConnected}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

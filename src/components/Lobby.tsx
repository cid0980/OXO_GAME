import React, { useState } from 'react';
import { cn } from '../utils/cn';

interface LobbyProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomId: string, name: string) => void;
  isConnecting: boolean;
  error: string | null;
  initialRoomId?: string;
}

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
  isConnecting,
  error,
  initialRoomId,
}) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>(initialRoomId ? 'join' : 'menu');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateRoom(name.trim());
  };

  const handleJoin = () => {
    if (!name.trim() || !roomId.trim()) return;
    onJoinRoom(roomId.trim(), name.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-bounce-slow">🎮</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-2">
            Cheat Tac Toe
          </h1>
          <p className="text-white/50 text-sm">
            Tic Tac Toe with secret cheat moves 😈
          </p>
        </div>

        {/* Mini board decoration */}
        <div className="flex justify-center gap-2 mb-10 opacity-30">
          {['X', 'O', 'X', null, 'X', 'O', 'O', null, 'X'].map((cell, i) => (
            <div key={i} className={cn(
              'w-8 h-8 rounded-md border border-white/20 flex items-center justify-center text-xs font-bold',
              cell === 'X' && 'text-pink-400',
              cell === 'O' && 'text-blue-400',
            )}>
              {cell}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {mode === 'menu' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
            >
              🏠 Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
            >
              🔗 Join Room
            </button>

            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-white/40 space-y-1">
              <div className="font-semibold text-white/60 mb-2">🃏 Cheat Moves (3 each):</div>
              <div>🔄 <strong>Undo</strong> — Erase opponent's last move</div>
              <div>➕ <strong>Extra Turn</strong> — Play twice in a row</div>
              <div>💨 <strong>Vanish</strong> — Remove a random opponent mark</div>
              <div className="text-white/25 italic mt-2">* Your opponent won't know you cheated 😈</div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <button onClick={() => setMode('menu')} className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1 transition-colors">
              ← Back
            </button>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 outline-none border border-white/20 focus:border-purple-500/60 transition-colors"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || isConnecting}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isConnecting ? '⏳ Connecting...' : '🏠 Create Room'}
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <button onClick={() => setMode('menu')} className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1 transition-colors">
              ← Back
            </button>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus={!initialRoomId}
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 outline-none border border-white/20 focus:border-blue-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Room Code</label>
              <input
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Paste room code..."
                autoFocus={!!initialRoomId}
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 outline-none border border-white/20 focus:border-blue-500/60 transition-colors font-mono text-sm"
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={!name.trim() || !roomId.trim() || isConnecting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isConnecting ? '⏳ Joining...' : '🔗 Join Room'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

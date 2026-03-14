export type CellValue = 'X' | 'O' | null;
export type Board = CellValue[];
export type PlayerSymbol = 'X' | 'O';
export type CheatType = 'undo' | 'ghost' | 'vanish';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface CheatMove {
  type: CheatType;
  usedBy: PlayerSymbol;
}

// Tracks which specific cheats each player has already used
export interface UsedCheats {
  X: CheatType[];
  O: CheatType[];
}

export interface GameState {
  board: Board;
  currentTurn: PlayerSymbol;
  winner: PlayerSymbol | 'draw' | null;
  cheatsRemaining: { X: number; O: number };
  usedCheats: UsedCheats;
  // Ghost cheat: index of the cell currently protected by ghost, and who ghosted it
  ghostCell: number | null;
  ghostOwner: PlayerSymbol | null;
  // Ghost is active (placed but not yet expired)
  ghostActive: boolean;
  frozenPlayer: PlayerSymbol | null;
  lastMove: number | null;
  gameStarted: boolean;
  rematchRequested: PlayerSymbol | null;
  // Ouroboros: ordered history of placed cell indices per player
  moveHistory: { X: number[]; O: number[] };
}

export type PeerMessage =
  | { type: 'GAME_STATE'; payload: GameState }
  | { type: 'CHAT'; payload: ChatMessage }
  | { type: 'PLAYER_READY'; payload: { symbol: PlayerSymbol; name: string } }
  | { type: 'REMATCH_REQUEST'; payload: { from: PlayerSymbol } }
  | { type: 'REMATCH_ACCEPT' };

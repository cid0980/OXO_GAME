import { Board, PlayerSymbol, GameState, CheatType } from '../types/game';

export const MAX_MARKS = 3; // Each player can have at most 3 marks at once

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diags
];

export function checkWinner(board: Board): PlayerSymbol | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as PlayerSymbol;
    }
  }
  // No draw in Ouroboros mode — board never truly fills up
  return null;
}

export function getWinningLine(board: Board): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

export function initialGameState(): GameState {
  return {
    board: Array(9).fill(null),
    currentTurn: 'X',
    winner: null,
    cheatsRemaining: { X: 3, O: 3 },
    usedCheats: { X: [], O: [] },
    ghostCell: null,
    ghostOwner: null,
    ghostActive: false,
    frozenPlayer: null,
    lastMove: null,
    gameStarted: false,
    rematchRequested: null,
    moveHistory: { X: [], O: [] },
  };
}

export function hasUsedCheat(state: GameState, player: PlayerSymbol, cheat: CheatType): boolean {
  return state.usedCheats[player].includes(cheat);
}

/**
 * Returns the "age index" of a cell for a given player:
 * 0 = oldest (about to vanish on next place), 1 = middle, 2 = newest
 * Returns null if the cell doesn't belong to the player.
 * Used by Board to compute visual size.
 */
export function getCellAge(state: GameState, cellIndex: number, player: PlayerSymbol): number | null {
  const history = state.moveHistory[player];
  const pos = history.indexOf(cellIndex);
  if (pos === -1) return null;
  // age 0 = oldest (first in history), age = history.length-1 = newest
  return pos; // 0 is oldest
}

export function applyMove(state: GameState, index: number, player: PlayerSymbol): GameState {
  if (state.winner) return state;
  if (state.currentTurn !== player) return state;

  // If the cell is occupied by a normal mark — block
  if (state.board[index] !== null) return state;

  // Ghost protection: if opponent placed a ghost mark on this cell, block this click silently
  if (
    state.ghostActive &&
    state.ghostCell === index &&
    state.ghostOwner !== player
  ) {
    // Opponent tries to click a ghost-protected cell — silently ignored
    return state;
  }

  const newBoard = [...state.board];
  const newMoveHistory = {
    X: [...state.moveHistory.X],
    O: [...state.moveHistory.O],
  };

  // Ouroboros: if player already has MAX_MARKS, remove the oldest one first
  if (newMoveHistory[player].length >= MAX_MARKS) {
    const oldest = newMoveHistory[player][0]; // oldest is at index 0
    newBoard[oldest] = null;
    newMoveHistory[player] = newMoveHistory[player].slice(1); // remove oldest
  }

  // Place the new mark
  newBoard[index] = player;
  newMoveHistory[player] = [...newMoveHistory[player], index]; // newest at end

  const winner = checkWinner(newBoard);
  const opponent: PlayerSymbol = player === 'X' ? 'O' : 'X';
  const nextTurn = winner ? state.currentTurn : opponent;

  // Ghost logic:
  // Phase 1 — Ghost is "armed" (ghostActive=true, ghostOwner=player, ghostCell=null):
  //   → player just placed their mark → set ghostCell = index (this cell is now protected)
  //   → turn passes to opponent
  // Phase 2 — Ghost is "active with cell" (ghostActive=true, ghostCell=index):
  //   → opponent just took their turn (whether they clicked elsewhere or were blocked)
  //   → ghost protection expires
  let newGhostCell = state.ghostCell;
  let newGhostOwner = state.ghostOwner;
  let newGhostActive = state.ghostActive;

  if (state.ghostActive && state.ghostOwner !== null) {
    if (state.ghostOwner === player && state.ghostCell === null) {
      // Phase 1: ghost was armed, now player placed — lock in the ghostCell
      newGhostCell = index;
      newGhostOwner = player;
      newGhostActive = true;
    } else if (state.ghostOwner !== player && state.ghostCell !== null) {
      // Phase 2: opponent just moved (or was blocked) → protection expires
      newGhostCell = null;
      newGhostOwner = null;
      newGhostActive = false;
    }
  }

  return {
    ...state,
    board: newBoard,
    lastMove: index,
    winner,
    currentTurn: nextTurn,
    ghostCell: newGhostCell,
    ghostOwner: newGhostOwner,
    ghostActive: newGhostActive,
    moveHistory: newMoveHistory,
  };
}

export function applyCheat(state: GameState, cheat: CheatType, player: PlayerSymbol): GameState {
  // Block if this specific cheat was already used by this player
  if (state.usedCheats[player].includes(cheat)) return state;
  if (state.winner) return state;

  const opponent: PlayerSymbol = player === 'X' ? 'O' : 'X';
  const newBoard = [...state.board];
  const newMoveHistory = {
    X: [...state.moveHistory.X],
    O: [...state.moveHistory.O],
  };

  // Mark this cheat as used and decrement remaining count
  const newUsedCheats = {
    ...state.usedCheats,
    [player]: [...state.usedCheats[player], cheat],
  };
  const newCheatsRemaining = {
    ...state.cheatsRemaining,
    [player]: state.cheatsRemaining[player] - 1,
  };

  const newState = {
    ...state,
    usedCheats: newUsedCheats,
    cheatsRemaining: newCheatsRemaining,
    moveHistory: newMoveHistory,
  };

  switch (cheat) {
    case 'undo': {
      // Remove opponent's last placed mark (most recent in their history)
      if (newMoveHistory[opponent].length > 0) {
        const lastOpponentMove = newMoveHistory[opponent][newMoveHistory[opponent].length - 1];
        newBoard[lastOpponentMove] = null;
        newMoveHistory[opponent] = newMoveHistory[opponent].slice(0, -1);
        return {
          ...newState,
          board: newBoard,
          winner: checkWinner(newBoard),
          currentTurn: player,
          lastMove: null,
          moveHistory: newMoveHistory,
        };
      }
      // Refund if no opponent move found
      return state;
    }

    case 'ghost': {
      // Ghost cheat: player activates ghost mode.
      // Their NEXT placed mark will be protected for one opponent turn.
      // We set ghostOwner = player and ghostActive = true but ghostCell = null (not yet placed).
      // When they place their mark in applyMove, we set ghostCell = that index.
      // Actually, simpler: ghost activates and their NEXT MOVE in applyMove will be flagged.
      // We handle it here by setting ghostPending = player.
      // For now: ghost is "armed" — next applyMove by this player sets ghostCell.
      return {
        ...newState,
        ghostCell: null,
        ghostOwner: player,
        ghostActive: true, // armed but not placed yet — ghostCell set on next move
        currentTurn: player, // keep turn with them so they place the ghost mark
      };
    }

    case 'vanish': {
      // Remove a random opponent mark
      const opponentCells = newMoveHistory[opponent];
      if (opponentCells.length === 0) return state; // Refund if nothing to vanish
      const randIdx = opponentCells[Math.floor(Math.random() * opponentCells.length)];
      newBoard[randIdx] = null;
      newMoveHistory[opponent] = newMoveHistory[opponent].filter(i => i !== randIdx);
      return {
        ...newState,
        board: newBoard,
        winner: checkWinner(newBoard),
        lastMove: null,
        moveHistory: newMoveHistory,
      };
    }

    default:
      return newState;
  }
}

/**
 * Called from applyMove when ghostActive is true and ghostOwner === player
 * and ghostCell is still null — meaning the ghost hasn't been placed yet.
 * This function is inlined into applyMove above, but we export a helper
 * for the Board to know which cell is ghost-protected.
 */
export function isGhostProtected(state: GameState, cellIndex: number): boolean {
  return state.ghostActive && state.ghostCell === cellIndex && state.ghostOwner !== null;
}

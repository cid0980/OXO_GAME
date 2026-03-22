import { Board, PlayerSymbol, GameState, CheatType } from '../types/game';

export const MAX_MARKS = 3; 

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],           
];

export function checkWinner(board: Board): PlayerSymbol | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as PlayerSymbol;
    }
  }
  
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


export function getCellAge(state: GameState, cellIndex: number, player: PlayerSymbol): number | null {
  const history = state.moveHistory[player];
  const pos = history.indexOf(cellIndex);
  if (pos === -1) return null;
   age = history.length-1 = newest
  return pos;
}

export function applyMove(state: GameState, index: number, player: PlayerSymbol): GameState {
  if (state.winner) return state;
  if (state.currentTurn !== player) return state;

   
  if (state.board[index] !== null) return state;

    
  if (
    state.ghostActive &&
    state.ghostCell === index &&
    state.ghostOwner !== player
  ) {
     
    return state;
  }

  const newBoard = [...state.board];
  const newMoveHistory = {
    X: [...state.moveHistory.X],
    O: [...state.moveHistory.O],
  };
 
  if (newMoveHistory[player].length >= MAX_MARKS) {
    const oldest = newMoveHistory[player][0]; 
    newBoard[oldest] = null;
    newMoveHistory[player] = newMoveHistory[player].slice(1); // remove oldest
  }

  
  newBoard[index] = player;
  newMoveHistory[player] = [...newMoveHistory[player], index]; 

  const winner = checkWinner(newBoard);
  const opponent: PlayerSymbol = player === 'X' ? 'O' : 'X';
  const nextTurn = winner ? state.currentTurn : opponent;

    (ghostActive=true, ghostOwner=player, ghostCell=null):
   
  
    (ghostActive=true, ghostCell=index):
   
  
  let newGhostCell = state.ghostCell;
  let newGhostOwner = state.ghostOwner;
  let newGhostActive = state.ghostActive;

  if (state.ghostActive && state.ghostOwner !== null) {
    if (state.ghostOwner === player && state.ghostCell === null) {
      
      newGhostCell = index;
      newGhostOwner = player;
      newGhostActive = true;
    } else if (state.ghostOwner !== player && state.ghostCell !== null) {
      
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
  
  if (state.usedCheats[player].includes(cheat)) return state;
  if (state.winner) return state;

  const opponent: PlayerSymbol = player === 'X' ? 'O' : 'X';
  const newBoard = [...state.board];
  const newMoveHistory = {
    X: [...state.moveHistory.X],
    O: [...state.moveHistory.O],
  };

  
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
      
      return state;
    }

    case 'ghost': {
      
      
      return {
        ...newState,
        ghostCell: null,
        ghostOwner: player,
        ghostActive: true, 
        currentTurn: player, 
      };
    }

    case 'vanish': {
   
      const opponentCells = newMoveHistory[opponent];
      if (opponentCells.length === 0) return state; 
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


export function isGhostProtected(state: GameState, cellIndex: number): boolean {
  return state.ghostActive && state.ghostCell === cellIndex && state.ghostOwner !== null;
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePeer } from './hooks/usePeer';
import { Lobby } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
import { Game } from './components/Game';
import { GameState, ChatMessage, PlayerSymbol, PeerMessage } from './types/game';
import { initialGameState } from './utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';

type AppScreen = 'lobby' | 'waiting' | 'game';

function App() {
  const [screen, setScreen] = useState<AppScreen>('lobby');
  const [mySymbol, setMySymbol] = useState<PlayerSymbol>('X');
  const [myName, setMyName] = useState('');
  const [opponentName, setOpponentName] = useState('Opponent');
  const [gameState, setGameState] = useState<GameState>(initialGameState());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  
  const initialRoomId = useRef<string | undefined>(
    new URLSearchParams(window.location.search).get('room') || undefined
  );

  const handleMessage = useCallback((msg: PeerMessage) => {
    switch (msg.type) {
      case 'GAME_STATE':
        setGameState(msg.payload);
        break;
      case 'CHAT':
        setMessages(prev => [...prev, msg.payload]);
        break;
      case 'PLAYER_READY':
        setOpponentName(msg.payload.name);
        setScreen('game');
        break;
      case 'REMATCH_REQUEST':
        setGameState(prev => ({ ...prev, rematchRequested: msg.payload.from }));
        break;
      case 'REMATCH_ACCEPT':
        setGameState(() => {
          const fresh = initialGameState();
          return { ...fresh, gameStarted: true };
        });
        setMessages([]);
        break;
    }
  }, []);

  const handleConnected = useCallback(() => {
    setIsConnecting(false);
    setError(null);
  }, []);

  const handleDisconnected = useCallback(() => {
    setError('Opponent disconnected!');
  }, []);

  const { status, initPeer, connectTo, sendMessage } = usePeer({
    onMessage: handleMessage,
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
  });

  
  useEffect(() => {
    if (status === 'connected' && isHost && screen === 'waiting') {
      
      const readyMsg: PeerMessage = {
        type: 'PLAYER_READY',
        payload: { symbol: 'X', name: myName },
      };
      sendMessage(readyMsg);
     
      const newState: GameState = { ...initialGameState(), gameStarted: true };
      setGameState(newState);
      sendMessage({ type: 'GAME_STATE', payload: newState });
      setScreen('game');
    }
  }, [status, isHost, screen, myName, sendMessage]);

  const handleCreateRoom = useCallback((name: string) => {
    setIsConnecting(true);
    setMyName(name);
    setMySymbol('X');
    setIsHost(true);
    setError(null);
    const peer = initPeer();
    peer.on('open', (id) => {
      setRoomId(id);
      setScreen('waiting');
      setIsConnecting(false);
    });
    peer.on('error', () => {
      setError('Failed to create room. Please try again.');
      setIsConnecting(false);
    });
  }, [initPeer]);

  const handleJoinRoom = useCallback((targetRoomId: string, name: string) => {
    setIsConnecting(true);
    setMyName(name);
    setMySymbol('O');
    setIsHost(false);
    setError(null);
    const peer = initPeer();
    peer.on('open', () => {
      connectTo(targetRoomId);
       
    });
    peer.on('error', () => {
      setError('Failed to connect. Check the room code and try again.');
      setIsConnecting(false);
    });
    
  }, [initPeer, connectTo]);

   player ready signal
  useEffect(() => {
    if (status === 'connected' && !isHost && screen === 'lobby') {
      setIsConnecting(false);
      const readyMsg: PeerMessage = {
        type: 'PLAYER_READY',
        payload: { symbol: 'O', name: myName },
      };
      sendMessage(readyMsg);
      setScreen('game');
    }
  }, [status, isHost, screen, myName, sendMessage]);

  const handleMove = useCallback((newState: GameState) => {
    setGameState(newState);
    sendMessage({ type: 'GAME_STATE', payload: newState });
  }, [sendMessage]);

  const handleCheat = useCallback((newState: GameState) => {
    setGameState(newState);
    sendMessage({ type: 'GAME_STATE', payload: newState });
  }, [sendMessage]);

  const handleChat = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: uuidv4(),
      sender: myName,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    sendMessage({ type: 'CHAT', payload: msg });
  }, [myName, sendMessage]);

  const handleRematch = useCallback(() => {
    const opponentSymbol: PlayerSymbol = mySymbol === 'X' ? 'O' : 'X';
    if (gameState.rematchRequested === opponentSymbol) {
       
      const fresh: GameState = { ...initialGameState(), gameStarted: true };
      setGameState(fresh);
      setMessages([]);
      sendMessage({ type: 'REMATCH_ACCEPT' });
      sendMessage({ type: 'GAME_STATE', payload: fresh });
    } else {
      
      setGameState(prev => ({ ...prev, rematchRequested: mySymbol }));
      sendMessage({ type: 'REMATCH_REQUEST', payload: { from: mySymbol } });
    }
  }, [mySymbol, gameState.rematchRequested, sendMessage]);

  const handleLeave = useCallback(() => {
    window.location.href = window.location.pathname;
  }, []);

  const handleCancel = useCallback(() => {
    window.location.href = window.location.pathname;
  }, []);

  if (screen === 'lobby') {
    return (
      <Lobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isConnecting={isConnecting}
        error={error}
        initialRoomId={initialRoomId.current}
      />
    );
  }

  if (screen === 'waiting' && roomId) {
    return (
      <WaitingRoom
        roomId={roomId}
        playerName={myName}
        onCancel={handleCancel}
      />
    );
  }

  if (screen === 'game') {
    return (
      <Game
        mySymbol={mySymbol}
        myName={myName}
        opponentName={opponentName}
        gameState={gameState}
        messages={messages}
        onMove={handleMove}
        onCheat={handleCheat}
        onChat={handleChat}
        onRematch={handleRematch}
        onLeave={handleLeave}
        connectionStatus={status}
        rematchRequested={gameState.rematchRequested}
      />
    );
  }

  return null;
}

export default App;

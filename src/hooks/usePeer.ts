import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { PeerMessage } from '../types/game';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

interface UsePeerOptions {
  onMessage: (msg: PeerMessage) => void;
  onConnected: () => void;
  onDisconnected: () => void;
}

export function usePeer({ onMessage, onConnected, onDisconnected }: UsePeerOptions) {
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');

  const onMessageRef = useRef(onMessage);
  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);
  onMessageRef.current = onMessage;
  onConnectedRef.current = onConnected;
  onDisconnectedRef.current = onDisconnected;

  const setupConnection = useCallback((conn: DataConnection) => {
    connRef.current = conn;
    conn.on('open', () => {
      setStatus('connected');
      onConnectedRef.current();
    });
    conn.on('data', (data) => {
      onMessageRef.current(data as PeerMessage);
    });
    conn.on('close', () => {
      setStatus('disconnected');
      onDisconnectedRef.current();
      connRef.current = null;
    });
    conn.on('error', () => {
      setStatus('error');
    });
  }, []);

  const initPeer = useCallback((customId?: string) => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setStatus('connecting');

    const peerOptions = {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
    };
    const peer = customId ? new Peer(customId, peerOptions) : new Peer(peerOptions);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setMyId(id);
      setStatus('idle');
    });

    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setStatus('error');
    });

    return peer;
  }, [setupConnection]);

  const connectTo = useCallback((peerId: string) => {
    if (!peerRef.current) return;
    setStatus('connecting');
    const conn = peerRef.current.connect(peerId, { reliable: true });
    setupConnection(conn);
  }, [setupConnection]);

  const sendMessage = useCallback((msg: PeerMessage) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(msg);
    }
  }, []);

  useEffect(() => {
    return () => {
      peerRef.current?.destroy();
    };
  }, []);

  return { myId, status, initPeer, connectTo, sendMessage };
}

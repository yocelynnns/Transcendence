import { useState, useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { AvatarData } from "../components/AvatarProfile";

export type PlayerData = {
  id: string;
  x: number;
  y: number;
  direction: string;
  frame: number;
  charIndex: number;
};

// Singleton socket (module-level)
let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:5001", { autoConnect: true });
  }
  return socket;
}

export function useGameSocket(onPlayersUpdate: (players: PlayerData[]) => void) {
  const socketRef = useRef<Socket | null>(null);

  const [waiting, setWaiting] = useState(false);
  const [opponent, setOpponent] = useState<{ avatarId: string; socketId: string; battleId?: string } | null>(null);

  const [battleReady, setBattleReady] = useState(false);
  const [enemyReady, setEnemyReady] = useState(false);

  const [waitingForEnemy, setWaitingForEnemy] = useState(false);

  // Connect socket when component mounts
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = connectSocket();
    }

    const s = socketRef.current;

    // Listen for player updates
    s.on("playersUpdate", onPlayersUpdate);

    s.on("waitingForOpponent", () => {
      setWaiting(true);
      setOpponent(null);
    }); 

    s.on("opponentFound", (data: { avatarId: string; socketId: string, battleId: string }) => {
        setWaiting(false);
        setOpponent(data);
      });

    s.on("opponentLeft", () => {
      setWaiting(true);
      setOpponent(null);
    });

    // Request current players immediately
    s.emit("requestPlayers");

    return () => {
      s.off("playersUpdate", onPlayersUpdate);
      s.off("waitingForOpponent");
      s.off("opponentFound");
      s.off("opponentLeft");
    };
  }, [onPlayersUpdate]);

  const sendPlayerMove = useCallback(
    (x: number, y: number, direction: string, frame: number, charIndex: number) => {
      socketRef.current?.emit("playerMove", { x, y, direction, frame, charIndex });
    },
    []
  );

  const emitEvent = useCallback(
    <T>(event: string, payload?: T) => {
      socketRef.current?.emit(event, payload);
    },
    []
  );

  const subscribeEvent = useCallback(
    <T>(event: string, handler: (payload: T) => void) => {
      if (!socketRef.current) return () => {}; // if no socket, return empty cleanup
      socketRef.current.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    []
  );

  const joinMatching = useCallback((avatarId: string) => {
    socketRef.current?.emit("joinMatching", avatarId);
  }, []);

  useEffect(() => {
    const cleanupWaiting = subscribeEvent("waitingForEnemy", () => {
      setWaitingForEnemy(true);   // I am waiting
      setEnemyReady(false);
    });

    const cleanupEnemyReady = subscribeEvent("enemyIsReady", () => {
      setEnemyReady(true);        // enemy confirmed
      setWaitingForEnemy(false);  // I am no longer waiting
    });

    const cleanupBattleReady = subscribeEvent("battleReady", () => {
      setBattleReady(true);
      setWaitingForEnemy(false);  // reset just in case
      setEnemyReady(true);        // enemy ready too
    });

    return () => {
      cleanupWaiting();
      cleanupEnemyReady();
      cleanupBattleReady();
    };
  }, [subscribeEvent]);

  const signOut = useCallback(() => {
    const avatarId = localStorage.getItem("avatarId");
    if (avatarId) socketRef.current?.emit("signout", { playerId: avatarId });

    socketRef.current?.disconnect();
    socketRef.current = null;
    socket = null; // allow next login to reconnect
  }, []);

  return { sendPlayerMove, emitEvent, subscribeEvent, signOut, joinMatching, waiting, opponent, battleId: opponent?.battleId || null, battleReady, enemyReady, waitingForEnemy };
}

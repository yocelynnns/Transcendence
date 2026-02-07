import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { PlayerState } from "../types/avatarTypes";
import { Battle, BattlePokemon } from "../types/battleTypes";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (!socket) {
    socket = io("http://localhost:5001", {
      autoConnect: true,
      auth: {
        token,
      },
    });
  }
  return socket;
}

export function useGameSocket(onPlayersUpdate: (players: PlayerState[]) => void) {
  const socketRef = useRef<Socket | null>(null);
  const onPlayersUpdateRef = useRef(onPlayersUpdate);
  const latestPlayerRef = useRef<PlayerState | null>(null);
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  // keep latest callback reference
  useEffect(() => {
    onPlayersUpdateRef.current = onPlayersUpdate;
  }, [onPlayersUpdate]);

  // initialize socket and subscribe to players
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = connectSocket(token);
    }

    const s = socketRef.current;
    if (!s) return;

    const handlePlayersUpdate = (players: PlayerState[]) => {
      onPlayersUpdateRef.current(players);
    };

    s.on("playersUpdate", handlePlayersUpdate);
    s.emit("requestPlayers");

    return () => {
      s.off("playersUpdate", handlePlayersUpdate);
    };
  }, [token]);

  // send player movement
  const sendPlayerMove = useCallback(
    (x: number, y: number, direction: string, frame: number, charIndex: number) => {
      latestPlayerRef.current = { x, y, direction, frame, charIndex };
      socketRef.current?.emit("playerMove", { x, y, direction, frame, charIndex });
    },
    []
  );

  // register player with server
  const registerPlayer = useCallback(
    async () => {
      try {
        socketRef.current?.emit("registerPlayer");

      } catch (err) {
        console.error("REGISTER PLAYER FAILED:", err);
      }
    },
    []
  );

  // handle reconnects automatically
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleReconnect = async () => {
        await registerPlayer();
    };

    s.on("connect", handleReconnect);

    return () => {
      s.off("connect", handleReconnect);
    };
  }, [registerPlayer]);

  // generic emit helper
  const emitEvent = useCallback(<T>(event: string, payload?: T) => {
    socketRef.current?.emit(event, payload);
  }, []);

  // generic subscribe helper
  const subscribeEvent = useCallback(<T>(event: string, handler: (payload: T) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);


  const joinMatching = useCallback(() => {
    socketRef.current?.emit("registerPlayer", {});
    socketRef.current?.emit("joinMatching", {
    });
  }, []);

  const playerReadyMatch = useCallback(
    (currentBattle: Battle, selectedBattlePokemon: BattlePokemon[]) => {
      if (!socketRef.current) return;

      socketRef.current.emit("playerReady", {
        currentBattleId: currentBattle._id,
        selectedPokemon: selectedBattlePokemon,
      });
    },
    []
  );


  // sign out and clean socket
  const signOut = useCallback(() => {
    socketRef.current?.emit("signout");
    socketRef.current?.disconnect();
    socketRef.current = null;
    socket = null;
    sessionStorage.removeItem("token");
  }, []);

  const leaveMatching = useCallback((avatarId: string) => {
    socketRef.current?.emit("leaveMatching", avatarId);
  }, []);


  return {
    registerPlayer,
    sendPlayerMove,
    emitEvent,
    subscribeEvent,
    joinMatching,
    signOut,
    leaveMatching,
    playerReadyMatch,
  };
}

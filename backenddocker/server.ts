import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../db/user";
import { setupGuildHandlers } from "./guildHandlers";
import { setupBattleHandlers } from "./battleHandlers";
import { setupEventHandlers } from "./eventHandler";
import { createCatchEvent } from "../utils/createEvent";
import { setupChatHandlers } from "./chatHandlers";
import { setupFriendHandler } from "./friendHandler";
import { setupPokemonHandlers } from "./pokemonHandler";
import { setupUserHandlers } from "./userHandler";
import { setSocketIo } from "../services/battle.service";
import { setSocketIo as setFriendSocketIo } from "../services/friend.service";
import { setupRaceHandlers } from "./raceHandler";

export interface PlayerData {
  id: string;
  x: number;
  y: number;
  direction: string;
  frame: number;
  charIndex: number;
}

// Global state
// avatarId -> PlayerData
export const players: Record<string, PlayerData> = {};

// event players
export const eventPlayers: Record<string, PlayerData> = {};

// avatarId -> socket.id
export const avatarSockets: Record<string, string> = {};

// Matching pool
export const matchingPool: { socketId: string; avatarId: string; userId: string }[] = [];

// avatarId -> socketId
export const onlineUsers = new Map<string, string>();

// socketId -> avatarId
export const socketToAvatar = new Map<string, string>();

// SessionId -> avatarId
export const avatarToSession = new Map<string, string>();

// avatarId -> socketId
export const avatarToSocket = new Map<string, string>();

// Socket Setup
export function setupSocket(server: any) {
  // const io = new Server(server, {
  //   cors: { origin: "https://localhost",     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], credentials: false }
  // });

  const io = new Server(server);

  // Set socket io instance for battle service
  setSocketIo(io);
  setFriendSocketIo(io);  // THIS for friend service

  // AUTH middleware
  io.use(async (socket, next) => {
    try {
      const { token, sessionId } = socket.handshake.auth;
      if (!token) return next(new Error("Unauthorized"));
      if (!sessionId) return next(new Error("Missing sessionId"));

      const decoded = jwt.verify(token, "process.env.JWT_SECRET" as string) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error("User not found"));

      // Attach all data to socket
      socket.data.userId = user._id;
      socket.data.avatarId = user.avatar;
      socket.data.sessionId = sessionId;

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // ⭐ SET UP RACE NAMESPACE FIRST (before regular connection handler)
  setupRaceHandlers(io);

  // Recurring events
  createCatchEvent(io);
  setInterval(() => createCatchEvent(io), 5 * 60 * 1000);

  // Socket connection (main namespace)
  io.on("connection", async (socket) => {
    const { avatarId, sessionId } = socket.data;
    const avatarIdString = avatarId?.toString();
    console.log("🟢 CONNECTED:", socket.id, "Avatar:", avatarIdString, "Session:", sessionId);

    if (!avatarIdString) return;

    const existingSessionId = avatarToSession.get(avatarIdString);
    const existingAvatarSocket = avatarToSocket.get(avatarIdString);

    if ((existingSessionId != sessionId) && existingAvatarSocket) {
      console.log(`🆕 Avatar ${avatarIdString} logged in on a new tab/device`);

      const oldSocket = io.sockets.sockets.get(existingAvatarSocket);

      if (oldSocket)
        oldSocket.emit("forcedSignOut");        
    }

    // Register current session and socket
    avatarToSession.set(avatarIdString, sessionId);
    avatarToSocket.set(avatarIdString, socket.id);
    socketToAvatar.set(socket.id, avatarIdString);
    onlineUsers.set(avatarIdString, socket.id);

    setupFriendHandler(io, socket, onlineUsers, socketToAvatar);

    setupUserHandlers(io, socket);

    setupPokemonHandlers(io, socket);

    setupGuildHandlers(io, socket);

    setupBattleHandlers(io, socket, matchingPool);

    setupEventHandlers(io, socket);

    setupChatHandlers(io, socket, onlineUsers);
  });
}
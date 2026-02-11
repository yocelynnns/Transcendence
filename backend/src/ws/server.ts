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
import { initializeInviteTracking } from "../services/matchInvite.service";

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

// Socket Setup
export function setupSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Set socket io instance for battle service
  setSocketIo(io);
  setFriendSocketIo(io);  // THIS for friend service

  // Initialize invite tracking from DB
  initializeInviteTracking().catch(console.error);

  // AUTH middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error("User not found"));

      socket.data.userId = user._id;
      socket.data.avatarId = user.avatar;

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // Recurring events
  createCatchEvent(io);
  setInterval(() => createCatchEvent(io), 5 * 60 * 1000);

  // Socket connection
  io.on("connection", async (socket) => {
    console.log("🟢 CONNECTED:", socket.id);

    setupFriendHandler(io, socket, onlineUsers, socketToAvatar);

    setupUserHandlers(io, socket);

    setupPokemonHandlers(io, socket);

    setupGuildHandlers(io, socket);

    setupBattleHandlers(io, socket, matchingPool);

    setupEventHandlers(io, socket);

    setupChatHandlers(io, socket, onlineUsers);
  });
}
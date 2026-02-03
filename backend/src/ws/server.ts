import { Server } from "socket.io";
import Pokemon from "../db/mapPokemon";
import axios from "axios";
import { setupGuildHandlers } from "./guildHandlers";
import { setupBattleHandlers } from "./battleHandlers";
import { setupEventHandlers } from "./eventHandler";
import { cleanupPlayer } from "./playerCleanup";
import AvatarSchema  from "../db/avatar";
import { createCatchEvent } from "../utils/createEvent";
import { setupChatHandlers } from "./chatHandlers";

interface PlayerData {
  id: string;
  x: number;
  y: number;
  direction: string;
  frame: number;
  charIndex: number;
}

const players: Record<string, PlayerData> = {};      // avatarId -> PlayerData
const avatarSockets: Record<string, string> = {};    // avatarId -> socket.id

// ONLINE STATUS TRACKING - avatarId -> socketId
const onlineUsers = new Map<string, string>();

// REVERSE LOOKUP - socketId -> avatarId (for disconnect handling)
const socketToAvatar = new Map<string, string>();

export function setupSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  createCatchEvent(io);
  setInterval(() => createCatchEvent(io), 5 * 60 * 1000);

  const matchingPool: { socketId: string; avatarId: string }[] = [];

  io.on("connection", async (socket) => {
    console.log("🟢 CONNECTED:", socket.id);

    // -------------------------
    // FRIEND STATUS HANDLERS
    // -------------------------
    
    // AVATAR COMES ONLINE
    socket.on("userOnline", (avatarId: string) => {
      onlineUsers.set(avatarId, socket.id);
      socketToAvatar.set(socket.id, avatarId); // Track for disconnect
      io.emit("userStatusChange", { avatarId, online: true });
      console.log(`👤 Avatar ${avatarId} is now online`);
    });
    
    // REQUEST ONLINE STATUS FOR FRIENDS
    socket.on("requestFriendsStatus", (friendAvatarIds: string[]) => {
      const statuses = friendAvatarIds.map(avatarId => ({
        avatarId,
        online: onlineUsers.has(avatarId),
      }));
      socket.emit("friendsStatusUpdate", statuses);
    });

    // BROADCAST AVATAR UPDATE TO ALL FRIENDS
    socket.on("avatarUpdated", (data: { avatarId: string; avatarImage: string; userName?: string }) => {
      socket.broadcast.emit("friendAvatarUpdated", {
        avatarId: data.avatarId,
        avatarImage: data.avatarImage,
        userName: data.userName,
      });
    });

    // NOTIFY USER THAT THEY RECEIVED A FRIEND REQUEST
    socket.on("friendRequestSent", (data: { targetAvatarId: string; requesterInfo: any }) => {
      const targetSocketId = onlineUsers.get(data.targetAvatarId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("friendRequestReceived", data.requesterInfo);
      }
    });

    // NOTIFY USER THAT THEIR REQUEST WAS ACCEPTED
    socket.on("friendRequestAccepted", (data: { targetAvatarId: string; accepterInfo: any }) => {
      const targetSocketId = onlineUsers.get(data.targetAvatarId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("friendRequestAcceptedByOther", {
          ...data.accepterInfo,
          message: "accepted your friend request",
        });
      }
    });

    // NOTIFY SPECIFIC USER THAT THEIR REQUEST WAS AUTO-ACCEPTED
    socket.on("notifyAutoAccept", (data: { targetAvatarId: string; accepterInfo: any }) => {
      const targetSocketId = onlineUsers.get(data.targetAvatarId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("friendRequestAutoAccepted", data.accepterInfo);
      }
    });

    // NOTIFY FRIEND THAT THEY WERE REMOVED
    socket.on("friendRemoved", (data: { targetAvatarId: string }) => {
      const targetSocketId = onlineUsers.get(data.targetAvatarId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("removedByFriend", {
          removerAvatarId: socket.data.avatarId,
        });
      }
    });

    // -------------------------
    // PLAYER REGISTRATION
    // -------------------------
    socket.on("registerPlayer", async (data: { avatarId: string; token: string }) => {
      const { avatarId, token } = data;

      if (socket.data.avatarId === avatarId) {
        return;
      }

      // Disconnect old socket if avatar already connected
      if (avatarSockets[avatarId] && avatarSockets[avatarId] !== socket.id) {
        const oldSocket = io.sockets.sockets.get(avatarSockets[avatarId]);
        if (oldSocket) {
          oldSocket.disconnect(true);
          console.log("⚠️ DISCONNECTED OLD SOCKET FOR AVATAR:", avatarId);
        }
      }

      // Save avatarId in socket and mappings
      socket.data.avatarId = avatarId;
      avatarSockets[avatarId] = socket.id;
      socketToAvatar.set(socket.id, avatarId);
      socket.data.token = token;

      // Mark as online immediately on register
      onlineUsers.set(avatarId, socket.id);
      io.emit("userStatusChange", { avatarId, online: true });

      // Initialize player if not exists
      if (!players[avatarId]) {
        players[avatarId] = {
          id: avatarId,
          x: 0,
          y: 0,
          direction: "down",
          frame: 0,
          charIndex: 0,
        };
      }

      console.log("👤 REGISTERED:", avatarId);

      try {
        const avatar = await AvatarSchema.findById(avatarId).populate("currentBattle");

        if (avatar?.currentBattle) {
          const battleId = avatar.currentBattle._id.toString();
          const roomName = `battle_${battleId}`;
          socket.join(roomName);
          console.log(`🔁 ${avatarId} rejoined room ${roomName}`);
          socket.emit("battleResync", { battle: avatar.currentBattle });
        }
      } catch (err) {
        console.error("Failed to rejoin battle room:", err);
      }

      // Send current players & Pokémon to this socket
      socket.emit("playersUpdate", Object.values(players));
      try {
        const currentPokemons = await Pokemon.find({ caught: false });
        socket.emit("pokemonUpdate", currentPokemons);
      } catch (err) {
        console.error("ERROR FETCHING POKEMON:", err);
      }

      // --- Join Battle Room ---
      socket.on("joinBattleRoom", async ({ battleId }: { battleId: string }) => {
        try {
          if (!battleId) return;
          const roomName = `battle_${battleId}`;
          socket.join(roomName);
          console.log(`Socket ${socket.id} joined room ${roomName}`);
        } catch (err) {
          console.error("Failed to join battle room:", err);
        }
      });

      // Notify others
      socket.broadcast.emit("playersUpdate", Object.values(players));

      // Update DB: mark player online
      try {
        await axios.put(
          `http://localhost:25001/api/avatar/${avatarId}`,
          { online: true, currentSocket: socket.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ Avatar ${avatarId} marked online with socket ${socket.id}`);
      } catch (err) {
        console.error(`Failed to update online status for avatar ${avatarId}:`, err);
      }
    });

    // -------------------------
    // REQUEST PLAYERS
    // -------------------------
    socket.on("requestPlayers", () => {
      socket.emit("playersUpdate", Object.values(players));
    });

    // -------------------------
    // PLAYER MOVEMENT
    // -------------------------
    socket.on("playerMove", (data: Omit<PlayerData, "id">) => {
      const avatarId = socket.data.avatarId;
      if (!avatarId) return;
      players[avatarId] = { id: avatarId, ...data };
      io.emit("playersUpdate", Object.values(players));
    });

    // -------------------------
    // CATCH POKÉMON
    // -------------------------
    socket.on("catchPokemon", async ({ playerId, pokemonId }: { playerId: string; pokemonId: string }) => {
      try {
        await axios.post(
          `http://localhost:25001/api/avatar/${playerId}/pokemon/catch`,
          { mapPokemonId: pokemonId }
        );
        const remainingPokemons = await Pokemon.find({ caught: false });
        io.emit("pokemonUpdate", remainingPokemons);
      } catch (err) {
        console.error("ERROR CATCHING POKÉMON:", err);
      }
    });

    // -------------------------
    // GUILD HANDLERS
    // -------------------------
    setupGuildHandlers(io, socket);

    // -------------------------
    // BATTLE HANDLERS
    // -------------------------
    setupBattleHandlers(io, socket, matchingPool);

    setupEventHandlers(io, socket);

    setupChatHandlers(io, socket, onlineUsers);

    // -------------------------
    // PLAYER SIGNOUT
    // -------------------------
    socket.on("signout", () => {
      const avatarId = socket.data.avatarId || socketToAvatar.get(socket.id);
      
      if (avatarId) {
        onlineUsers.delete(avatarId);
        socketToAvatar.delete(socket.id);
        io.emit("userStatusChange", { avatarId, online: false });
        console.log(`👤 Avatar ${avatarId} signed out`);
      }
      
      cleanupPlayer(io, socket, matchingPool, players, avatarSockets);
      socket.disconnect(true);
    });

    // -------------------------
    // DISCONNECT - ROBUST HANDLER
    // -------------------------
    socket.on("disconnect", async (reason) => {
      console.log(`🔴 DISCONNECT STARTED: ${socket.id}, REASON: ${reason}`);
      
      // Try multiple ways to get avatarId
      let avatarId = socket.data.avatarId;
      
      // Fallback to reverse lookup if not in socket.data
      if (!avatarId) {
        avatarId = socketToAvatar.get(socket.id);
        console.log(`🔍 Found avatarId via reverse lookup: ${avatarId}`);
      }

      const token = socket.data.token;

      console.log(`🔴 DISCONNECT: socket=${socket.id}, avatarId=${avatarId}, reason=${reason}`);

      if (avatarId) {
        // Remove from online tracking
        onlineUsers.delete(avatarId);
        socketToAvatar.delete(socket.id);
        
        // Broadcast offline status
        io.emit("userStatusChange", { avatarId, online: false });
        console.log(`👤 Avatar ${avatarId} marked offline (reason: ${reason})`);

        // Update DB if we have a token
        if (token) {
          try {
            await axios.put(
              `http://localhost:25001/api/avatar/${avatarId}`,
              { online: false, currentSocket: null },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`✅ Avatar ${avatarId} marked offline in DB`);
          } catch (err) {
            console.error(`Failed to mark avatar offline in DB:`, err);
          }
        }
      } else {
        console.log(`⚠️ No avatarId found for socket ${socket.id} on disconnect`);
      }
        
      cleanupPlayer(io, socket, matchingPool, players, avatarSockets);
      console.log(`🔴 DISCONNECT COMPLETED: ${socket.id}`);
    });
  });
}
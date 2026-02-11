import { Server, Socket } from "socket.io";
import { cleanupPlayer } from "./playerCleanup";
import { matchingPool, players, avatarSockets, onlineUsers, socketToAvatar, PlayerData, eventPlayers } from "./server";
import * as PokemonService from "../services/pokemon.service";
import * as AvatarService from "../services/avatar.service";

export const setupUserHandlers = (io: Server, socket: Socket) => {
  // Player registration
  socket.on("registerPlayer", async () => {

    const rawAvatarId = socket.data?.avatarId;
    if (!rawAvatarId) {
      console.log("⚠️ registerPlayer called without avatarId, socket not authenticated yet");
      socket.emit("registerError", { message: "Not authenticated" });
      return;
    }

    const avatarId = socket.data.avatarId?.toString();
    if (!avatarId) return;

    // Disconnect old socket if avatar already connected
    // if (avatarSockets[avatarId] && avatarSockets[avatarId] !== socket.id) {
    //   const oldSocket = io.sockets.sockets.get(avatarSockets[avatarId]);
    //   if (oldSocket) {
    //     oldSocket.emit("signout");
    //     // oldSocket.disconnect(true);
    //     console.log("⚠️ DISCONNECTED OLD SOCKET FOR AVATAR:", avatarId);
    //   }
    // }

    // Save avatarId in socket and mappings
    socket.data.avatarId = avatarId;
    avatarSockets[avatarId] = socket.id;
    socketToAvatar.set(socket.id, avatarId);

    // Mark as online
    onlineUsers.set(avatarId, socket.id);
    io.emit("userStatusChange", { avatarId, online: true });

    // Initialize player if not exists
    if (!players[avatarId]) {
      players[avatarId] = { id: avatarId, x: 0, y: 0, direction: "down", frame: 0, charIndex: 0 };
    }

    console.log("👤 REGISTERED:", avatarId);

    // Rejoin battle room if needed
    try {
      const avatar = await AvatarService.getAvatarById({ avatarId });
      
      if (avatar?.currentBattle) {
        const roomName = `battle_${avatar.currentBattle._id.toString()}`;
        socket.join(roomName);// SEE THIS
        socket.emit("battleResync", { battle: avatar.currentBattle });
        console.log(`🔁 ${avatarId} rejoined room ${roomName}`);
      }
    } catch (err) {
      console.log("Failed to rejoin battle room:", err);
    }

    // Send current players & Pokemon to this socket
    socket.emit("playersUpdate", Object.values(players));
    try {
      const currentPokemons = await PokemonService.fetchAvailablePokemon({ limit: 50 });
      socket.emit("pokemonUpdate", currentPokemons);
    } catch (err) {
      console.log("ERROR FETCHING POKEMON:", err);
    }

    // Notify others
    socket.broadcast.emit("playersUpdate", Object.values(players));

    // Update DB: mark player online
    try {
      await AvatarService.updateAvatar({
        avatarId,
        data: {
          online: true,
          currentSocket: socket.id,
        },
      });
      console.log(`✅ Avatar ${avatarId} marked online with socket ${socket.id}`);
    } catch (err) {
      console.log(`Failed to update online status for avatar ${avatarId}:`, err);
    }
  });

  // leave matching
  socket.on("leaveMatching", (avatarId: string) => {
    const poolIndex = matchingPool.findIndex((p) => p.avatarId === avatarId);
    if (poolIndex !== -1) {
      matchingPool.splice(poolIndex, 1);
      console.log("Player left matching:", avatarId);
    }
  });

  // Request player
  socket.on("requestPlayers", () => {
    socket.emit("playersUpdate", Object.values(players));
  });

  // Request player
  socket.on("requestEventPlayers", () => {
    socket.emit("eventPlayersUpdate", Object.values(eventPlayers));
  });

  // Player movement
  socket.on("playerMove", (data: Omit<PlayerData, "id">) => {
    const rawAvatarId = socket.data?.avatarId;
    if (!rawAvatarId) return;
    const avatarId = rawAvatarId.toString();
    players[avatarId] = { id: avatarId, ...data };
    io.emit("playersUpdate", Object.values(players));
  });

  // Event player movement
  socket.on("eventPlayerMove", (data: Omit<PlayerData, "id">) => {
    const rawAvatarId = socket.data?.avatarId;
    if (!rawAvatarId) return;
    const avatarId = rawAvatarId.toString();
    eventPlayers[avatarId] = { id: avatarId, ...data };
    io.emit("eventPlayersUpdate", Object.values(eventPlayers));
  });

  // Player signout
  socket.on("signout", () => {
    // add disconnected logic
    const rawAvatarId = socket.data?.avatarId || socketToAvatar.get(socket.id);
    const avatarId = rawAvatarId?.toString?.();

    if (avatarId) {
      onlineUsers.delete(avatarId);
      socketToAvatar.delete(socket.id);
      io.emit("userStatusChange", { avatarId, online: false });
      console.log(`👤 Avatar ${avatarId} signed out`);
    }
    cleanupPlayer(io, socket, matchingPool, players, avatarSockets);
    socket.disconnect(true);
  });

  socket.on("forced", () => {
    console.log("I am forced to disconnect");
    socket.disconnect(true); 
  });

  // Player disconnect
  socket.on("disconnect", async (reason) => {
    console.log(`🔴 DISCONNECT STARTED: ${socket.id}, REASON: ${reason}`);

    // FIX: Safely get avatarId with null check
    const rawAvatarId = socket.data?.avatarId || socketToAvatar.get(socket.id);
    const avatarId = rawAvatarId?.toString?.();

    if (avatarId) {
      onlineUsers.delete(avatarId);
      socketToAvatar.delete(socket.id);

      io.emit("userStatusChange", { avatarId, online: false });
      console.log(`👤 Avatar ${avatarId} marked offline (reason: ${reason})`);

      try {
        await AvatarService.updateAvatar({
          avatarId,
          data: {
            online: false,
            currentSocket: null,
            // currentBattle: null,
          },
        });
        console.log(`✅ Avatar ${avatarId} marked offline in DB`);
      } catch (err) {
        console.log(`Failed to mark avatar offline in DB:`, err);
      }
    } else {
      console.log(`⚠️ No avatarId found for socket ${socket.id} on disconnect`);
    }

    cleanupPlayer(io, socket, matchingPool, players, avatarSockets);
    console.log(`🔴 DISCONNECT COMPLETED: ${socket.id}`);
  });
};

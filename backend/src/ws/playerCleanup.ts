import { Server, Socket } from "socket.io";
// import { battleReadyState, battleTurns } from "./battleHandlers";

// Optional: define your players and avatarSockets outside and import if needed
interface PlayerMap {
  [avatarId: string]: any;
}

export function cleanupPlayer(
  io: Server,
  socket: Socket,
  matchingPool: { socketId: string; avatarId: string }[],
  players: PlayerMap,
  avatarSockets: PlayerMap
) {
  const avatarId = socket.data.avatarId;
  // const socketId = socket.id;

  if (!avatarId) return;

  // 1️⃣ Remove from players and avatarSockets
  delete players[avatarId];
  delete avatarSockets[avatarId];

  // 2️⃣ Remove from matching pool
  const poolIndex = matchingPool.findIndex((p) => p.avatarId === avatarId);
  if (poolIndex !== -1) matchingPool.splice(poolIndex, 1);


  // 4️⃣ Leave all rooms (guilds, etc.)
  // for (const room of socket.rooms) {
  //   if (room !== socket.id) {
  //     socket.leave(room);
  //   }
  // }

  // 5️⃣ Notify others about player removal
  io.emit("playersUpdate", Object.values(players));
}

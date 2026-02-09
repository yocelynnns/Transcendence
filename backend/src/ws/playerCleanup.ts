import { Server, Socket } from "socket.io";

interface PlayerMap {
  [avatarId: string]: any;
}

// Clean player from map and matching pool
export function cleanupPlayer(
  io: Server,
  socket: Socket,
  matchingPool: { socketId: string; avatarId: string }[],
  players: PlayerMap,
  avatarSockets: PlayerMap
) {
  const avatarId = socket.data.avatarId?.toString();

  if (!avatarId) return;

  delete players[avatarId];
  delete avatarSockets[avatarId];

  const poolIndex = matchingPool.findIndex((p) => p.avatarId === avatarId);
  if (poolIndex !== -1) matchingPool.splice(poolIndex, 1);

  io.emit("playersUpdate", Object.values(players));
}

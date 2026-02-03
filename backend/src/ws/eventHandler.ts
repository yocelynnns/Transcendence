import { Server, Socket } from "socket.io";
import { CatchEventModel } from "../db/event";


// SOCKET.IO HANDLERS
export function setupEventHandlers(io: Server, socket: Socket) {
  // PLAYER JOIN
  socket.on("joinCatchEvent", async ({ avatarId, playerName }: { avatarId: string; playerName: string }) => {
    if (!avatarId || !playerName) return;

    const eventId = "catch_event";
    const roomName = eventId;

    let eventDoc = await CatchEventModel.findOne({ eventId });

    if (!eventDoc) return;

    if (eventDoc.status == "waiting")
    {
        socket.emit("eventWaiting", {
          createdAt: eventDoc.createdAt
      });
      return ;
    }

    if (eventDoc.status == "finished")
    {
       const winner = [...eventDoc.players].sort((a, b) => b.catchCount - a.catchCount)[0];  

        socket.emit("eventFinished", {
        winnerId: winner.playerName,
        scores: eventDoc.players.map((p) => ({ playerId: p.playerId, playerName:p.playerName, catchCount: p.catchCount })),
      });
    }

    const alreadyJoined = eventDoc.players.some((p) => p.playerId === avatarId);
    if (!alreadyJoined) {
      eventDoc.players.push({ playerId: avatarId, playerName: playerName, catchCount: 0 });
      await eventDoc.save();
    }

    socket.join(roomName);

    socket.emit("updateEventState", {
      eventId: eventDoc.eventId,
      pokemon: eventDoc.pokemon,
      players: eventDoc.players.map((p) => ({ playerId: p.playerId, catchCount: p.catchCount })),
      status: eventDoc.status,
    });
  });

  // ATTEMPT CATCH
  socket.on("attemptCatch", async ({ eventId, pokemonId, avatarId }: { eventId: string; pokemonId: string; avatarId:string }) => {
    const event = await CatchEventModel.findOne({ eventId:"catch_event" });
    if (!event || event.status !== "running") return;

    const player = event.players.find((p) => p.playerId === avatarId);
    if (!player) return;
    const poke: any = event.pokemon.find((p) => p._id.toString() === pokemonId);
    if (!poke || poke.caught) return;

    poke.caught = true;
    player.catchCount++;
    await event.save();

    const roomName = eventId;

    io.to(roomName).emit("updateEventState", {
      eventId: event.eventId,
      pokemon: event.pokemon,
      players: event.players.map((p) => ({ playerId: p.playerId, catchCount: p.catchCount })),
      status: event.status,
    });

    if (event.pokemon.every((p) => p.caught)) {
      event.status = "finished";
      await event.save();

      const winner = [...event.players].sort((a, b) => b.catchCount - a.catchCount)[0];
      io.to(roomName).emit("eventFinished", {
        winnerId: winner.playerName,
        scores: event.players.map((p) => ({ playerId: p.playerId, playerName:p.playerName, catchCount: p.catchCount })),
      });
    }
  });
}

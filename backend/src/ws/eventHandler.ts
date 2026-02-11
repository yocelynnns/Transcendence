import { Server, Socket } from "socket.io";
import * as EventService from "../services/event.service";

export function setupEventHandlers(io: Server, socket: Socket) {
  // Player join the event
  socket.on("joinCatchEvent", async ({ playerName }: { playerName: string }) => {
    const avatarId = socket.data.avatarId?.toString();
    if (!avatarId || !playerName) return;

    const eventId = "catch_event";
    const roomName = eventId;

    try {
      const result = await EventService.joinCatchEvent({ eventId, avatarId, playerName });

      if (result.status === "waiting") {
        socket.emit("eventWaiting", { createdAt: result.createdAt });
        return;
      }

      if (result.status === "finished") {
        socket.emit("eventFinished", {
          winnerId: result.winnerId,
          scores: result.scores,
        });
        return;
      }

      const eventDoc = result.eventDoc;
      if (!eventDoc) return;

      socket.join(roomName);

      socket.emit("updateEventState", {
        eventId: eventDoc.eventId,
        pokemon: eventDoc.pokemon,
        players: eventDoc.players.map((p) => ({
          playerId: p.playerId,
          catchCount: p.catchCount,
        })),
        status: eventDoc.status,
      });
    } catch (err) {
      console.log("Failed to join catch event:", err);

      const message = err instanceof Error ? err.message : "Unknown error occurred";
      socket.emit("joinCatchEventError", { message });
    }
  });

  // Attempt to catch pokemon
  socket.on(
    "attemptCatch",
    async ({ eventId, pokemonId }: { eventId: string; pokemonId: string }) => {
      const avatarId = socket.data.avatarId?.toString();
      if (!avatarId) return;

      try {
        const { event, eventFinished } = await EventService.attemptCatch({
          eventId,
          pokemonId,
          avatarId,
        });

        const roomName = eventId;

        io.to(roomName).emit("updateEventState", {
          eventId: event.eventId,
          pokemon: event.pokemon,
          players: event.players.map((p) => ({
            playerId: p.playerId,
            catchCount: p.catchCount,
          })),
          status: event.status,
        });

        if (eventFinished) {
          io.to(roomName).emit("eventFinished", eventFinished);
        }
      } catch (err) {
        console.log("Error during attemptCatch:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        socket.emit("attemptCatchError", { message });
      }
    }
  );
}

import { CatchEventModel } from "../db/event";

// Player join the event
export interface JoinCatchEventInput {
  eventId: string;
  avatarId: string;
  playerName: string;
}

export async function joinCatchEvent({ eventId, avatarId, playerName }: JoinCatchEventInput) {
  const updatedEvent = await CatchEventModel.findOneAndUpdate(
    { 
      eventId,
      status: "running",
      "players.playerId": { $ne: avatarId }
    },
    {
      $push: {
        players: { playerId: avatarId, playerName, catchCount: 0 }
      }
    },
    { new: true }
  );

  if (updatedEvent) {
    return {
      status: updatedEvent.status,
      eventDoc: updatedEvent,
    };
  }

  const event = await CatchEventModel.findOne({ eventId });
  
  if (!event) {
    throw new Error("Event not found");
  }

  if (event.status === "waiting") {
    return { 
      status: "waiting", 
      createdAt: event.createdAt 
    };
  }

  if (event.status === "finished") {
    const winner = [...event.players].sort((a, b) => b.catchCount - a.catchCount)[0];
    return {
      status: "finished",
      winnerId: winner?.playerName,
      scores: event.players.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        catchCount: p.catchCount,
      })),
    };
  }

  const alreadyJoined = event.players.some(p => p.playerId === avatarId);
  if (alreadyJoined) {
    return {
      status: event.status,
      eventDoc: event,
      message: "Already joined"
    };
  }

  throw new Error("Failed to join event");
}

// Attempt to catch pokemon
export interface AttemptCatchInput {
  eventId: string;
  pokemonId: string;
  avatarId: string;
}

export async function attemptCatch({ eventId, pokemonId, avatarId }: AttemptCatchInput) {
  // Atomically catch the Pokémon, increment player's catch count, and finish event if all caught
  const updatedEvent = await CatchEventModel.findOneAndUpdate(
    {
      eventId,
      status: "running",
      "pokemon._id": pokemonId,
      "pokemon.caught": false
    },
    {
      $set: { "pokemon.$[poke].caught": true },
      $inc: { "players.$[player].catchCount": 1 }
    },
    {
      new: true,
      arrayFilters: [
        { "poke._id": pokemonId, "poke.caught": false },
        { "player.playerId": avatarId }
      ]
    }
  );

  if (!updatedEvent) {
    throw new Error("Event not found, Pokémon already caught, or player not in event");
  }

  let eventFinished: { winnerId: string; scores: any[]; lastCheckedAt: Date } | null = null;

  const finishedEvent = await CatchEventModel.findOneAndUpdate(
    {
      eventId,
      status: "running",
      "pokemon.caught": { $ne: false }
    },
    { $set: { status: "finished" } },
    { new: true }
  );

  if (finishedEvent) {
    const winner = [...finishedEvent.players].sort((a, b) => b.catchCount - a.catchCount)[0];
    eventFinished = {
      winnerId: winner.playerName,
      scores: finishedEvent.players.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        catchCount: p.catchCount,
      })),
      lastCheckedAt: finishedEvent.lastCheckedAt,
    };
  }

  return { event: updatedEvent, eventFinished };
}

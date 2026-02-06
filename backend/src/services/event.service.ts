import { CatchEventModel } from "../db/event";

// Player join the event
export interface JoinCatchEventInput {
  eventId: string;
  avatarId: string;
  playerName: string;
}

export async function joinCatchEvent({ eventId, avatarId, playerName }: JoinCatchEventInput) {
  const eventDoc = await CatchEventModel.findOne({ eventId });
  if (!eventDoc) throw new Error("Event not found");

  if (eventDoc.status === "waiting") {
    return { status: "waiting", createdAt: eventDoc.createdAt };
  }

  if (eventDoc.status === "finished") {
    const winner = [...eventDoc.players].sort((a, b) => b.catchCount - a.catchCount)[0];
    return {
      status: "finished",
      winnerId: winner.playerName,
      scores: eventDoc.players.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        catchCount: p.catchCount,
      })),
    };
  }

  const alreadyJoined = eventDoc.players.some((p) => p.playerId === avatarId);
  if (!alreadyJoined) {
    eventDoc.players.push({ playerId: avatarId, playerName, catchCount: 0 });
    await eventDoc.save();
  }

  return {
    status: eventDoc.status,
    eventDoc,
  };
}

// Attempt to catch pokemon
export interface AttemptCatchInput {
  eventId: string;
  pokemonId: string;
  avatarId: string;
}

export async function attemptCatch({ eventId, pokemonId, avatarId }: AttemptCatchInput) {
  const event = await CatchEventModel.findOne({ eventId });
  if (!event) throw new Error("Event not found");
  if (event.status !== "running") throw new Error("Event is not running");

  const player = event.players.find((p) => p.playerId === avatarId);
  if (!player) throw new Error("Player not in event");

  const poke: any = event.pokemon.find((p) => p._id.toString() === pokemonId);
  if (!poke) throw new Error("Pokemon not found");
  if (poke.caught) throw new Error("Pokemon already caught");

  poke.caught = true;
  player.catchCount++;

  let eventFinished: { winnerId: string; scores: any[] } | null = null;
  if (event.pokemon.every((p) => p.caught)) {
    event.status = "finished";
    const winner = [...event.players].sort((a, b) => b.catchCount - a.catchCount)[0];
    eventFinished = {
      winnerId: winner.playerName,
      scores: event.players.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        catchCount: p.catchCount,
      })),
    };
  }

  await event.save();

  return { event, eventFinished };
}
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

  let eventFinished: { winnerId: string; scores: any[]; lastCheckedAt: Date } | null = null;

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
      lastCheckedAt: event.lastCheckedAt,
    };
  }

  await event.save();

  return { event, eventFinished };
}
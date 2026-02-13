import mongoose from "mongoose";
import Battle, { IBattlePokemon } from "../db/battle";
import { IAvatar } from "../db/avatar";
import MatchInvite from "../db/matchInvite";
import Avatar from "../db/avatar";
import PQueue from "p-queue";

/// to enable commuication about end of battle
let ioInstance: any = null;

export function setSocketIo(io: any) {
  ioInstance = io;
}

/// Helper function to emit battle ended to friends
function emitBattleEnded(battle: any, silentLoser: boolean = false) {
  if (!ioInstance) return;
  
  // Extract player IDs safely
  const player1Id = battle.player1?._id?.toString?.() || battle.player1?.toString?.();
  const player2Id = battle.player2?._id?.toString?.() || battle.player2?.toString?.();
  
  // Determine who won/lost for silent targeting
  const p1Ready = (battle.pokemon1?.length || 0) > 0;
  const p2Ready = (battle.pokemon2?.length || 0) > 0;
  
  battle.endedAt = new Date();  
  // let winnerId: string | null = null;
  let loserId: string | null = null;
  
  if (!p1Ready && !p2Ready) {
    // Draw - no winner/loser
  } else if (p1Ready && !p2Ready) {
    // winnerId = player1Id;
    loserId = player2Id;
  } else if (!p1Ready && p2Ready) {
    // winnerId = player2Id;
    loserId = player1Id;
  }
  
  // Emit to player 1
  if (player1Id) {
    const isLoser = silentLoser && loserId === player1Id;
    ioInstance.emit("battleEnded", { 
      avatarId: player1Id, 
      battleId: battle._id,
      silent: isLoser, // Loser gets silent treatment
      winner: battle.winner,
      isPlayer1: true,
      reason: battle.winnerReason
    });
    
    // Also emit friend status update
    // ioInstance.emit("friendReturnedHome", { avatarId: player1Id });
  }
  
  // Emit to player 2
  if (player2Id) {
    const isLoser = silentLoser && loserId === player2Id;
    ioInstance.emit("battleEnded", { 
      avatarId: player2Id, 
      battleId: battle._id,
      silent: isLoser, // Loser gets silent treatment
      winner: battle.winner,
      isPlayer1: false,
      reason: battle.winnerReason
    });
    
    // Also emit friend status update
    // ioInstance.emit("friendReturnedHome", { avatarId: player2Id });
  }
}

// Get a specific battle
export interface GetBattleInput {
  battleId: string;
}

export async function getBattle({ battleId }: GetBattleInput) {
  if (!mongoose.Types.ObjectId.isValid(battleId)) throw new Error("Invalid battle ID");

  const battle = await Battle.findById(battleId)
    .populate("player1")
    .populate("player2");

  if (!battle) throw new Error("Battle not found");

  return battle;
}

// Create a new battle
export interface CreateBattleInput {
  player1: string;
  player2: string;
}

export async function createBattle({ player1, player2 }: CreateBattleInput) {
  if (!player1 || !player2) throw new Error("player1 and player2 are required");
  if (!mongoose.Types.ObjectId.isValid(player1) || !mongoose.Types.ObjectId.isValid(player2)) {
    throw new Error("Invalid player ID format");
  }

  const battle = new Battle({
    player1: new mongoose.Types.ObjectId(player1),
    player2: new mongoose.Types.ObjectId(player2),
    pokemon1: [],
    pokemon2: [],
  });

  await battle.save();

  const populatedBattle = await Battle.findById(battle._id)
    .populate("player1")
    .populate("player2");

  if (!populatedBattle) throw new Error("Failed to fetch created battle");

  return populatedBattle;
}

// Team select logic
export const BATTLE_TIMEOUT = 40_000; // 40 seconds
export const battleTimers: Record<string, NodeJS.Timeout> = {};

export async function markPlayerReady(
  battleId: string,
  avatarId: string,
  selectedPokemon: IBattlePokemon[]
) {
  const battle = await Battle.findById(battleId);
  if (!battle) throw new Error("Battle not found");
  
  const isPlayer1 = battle.player1.toString() === avatarId;
  const playerField = isPlayer1 ? "pokemon1" : "pokemon2";
  const timeField = isPlayer1 ? "lastPlayer1Turn" : "lastPlayer2Turn";

  const updatedBattle = await Battle.findOneAndUpdate(
    {
      _id: battleId,
      [playerField]: { $in: [null, undefined, []] }
    },
    {
      $set: {
        [playerField]: selectedPokemon,
        [timeField]: new Date()
      }
    },
    { new: true }
  );

  if (!updatedBattle) {
    const existingBattle = await Battle.findById(battleId);
    if (!existingBattle) throw new Error("Battle not found");
    
    return existingBattle;
  }

  return updatedBattle;
}

// Resolve battle due to timeout and return winner info
export async function resolveBattleTimeout(battleId: string) {
  const battle = await Battle.findById(battleId);
  if (!battle) return null;

  const p1Ready = (battle.pokemon1?.length || 0) > 0;
  const p2Ready = (battle.pokemon2?.length || 0) > 0;

  battle.endedAt = new Date();

  if (!p1Ready && !p2Ready) {
    battle.winner = "draw";
    battle.winnerReason = "both did not select in time";
  } else if (p1Ready && !p2Ready) {
    battle.winner = "player1";
    battle.winnerReason = "Battle ended due to inactivity/disconnection";
  } else if (!p1Ready && p2Ready) {
    battle.winner = "player2";
    battle.winnerReason = "Battle ended due to inactivity/disconnection";
  } else {
    return null;
  }

  await battle.save();

  const playerIds = [battle.player1, battle.player2].map(p =>
    typeof p === "object" && p !== null ? p._id : p
  );

  await Avatar.updateMany(
    { _id: { $in: playerIds } },
    {
      $set: { currentBattle: null },
      $push: { battleHistory: battle._id },
    }
  );

  // Emit battle ended event with silentLoser=true so loser doesn't see UI
  emitBattleEnded(battle, true);

  return battle;
}

// Start battle timeout (socket logic will call this)
export function startBattleTimeout(battleId: string, io: any) {
  if (battleTimers[battleId]) return; // already running

  battleTimers[battleId] = setTimeout(async () => {
    try {
      const battle = await resolveBattleTimeout(battleId);
      if (!battle) return;

      const roomName = `battle_${battle._id}`;
      io.to(roomName).emit("TeamUpError", {
        message: "Battle ended due to inactivity/disconnection",
        battleId: battle._id,
      });

      delete battleTimers[battleId];
    } catch (err) {
      console.error("Error in battle timeout:", err);
      delete battleTimers[battleId];
    }
  }, BATTLE_TIMEOUT);
}

// Battle logic
const MOVE_TIMEOUT = 31_000; // 31 seconds per move
const moveTimers: Record<string, NodeJS.Timeout> = {};

// Check move timeout for a battle
export async function checkMoveTimeout(battleId: string): Promise<{ battle?: any; timedOut?: boolean; loser?: string }> {
  const battle = await Battle.findById(battleId)
    .populate("player1")
    .populate("player2");

  if (!battle || battle.endedAt) return { battle };

  const now = Date.now();
  const currentTurn = battle.currentTurn;
  const lastTurnTime =
    currentTurn === "player1"
      ? battle.lastPlayer1Turn?.getTime()
      : battle.lastPlayer2Turn?.getTime();

  if (!lastTurnTime) return { battle };

  if (now - lastTurnTime >= MOVE_TIMEOUT) {
    battle.endedAt = new Date();
    const loser = currentTurn;
    const winner = loser === "player1" ? "player2" : "player1";

    battle.winner = winner;
    battle.winnerReason = `${loser} did not move in time`;
    await battle.save();

    // Update players
    const updatePlayers = async (player: IAvatar) => {
      player.currentBattle = undefined;
      if (!player.battleHistory) player.battleHistory = [];
      player.battleHistory.push(battle._id);
      await player.save();
    };

    await Promise.all([
      updatePlayers(battle.player1 as IAvatar),
      updatePlayers(battle.player2 as IAvatar),
    ]);

    // Emit battle ended event (MOVED BEFORE RETURN)
    emitBattleEnded(battle, false); // During battle phase, show both results

    return { battle, timedOut: true, loser };
  }

  return { battle };
}

// Start/restart move timeout for a battle
export function startMoveTimeout(battleId: string, io: any) {
  if (moveTimers[battleId]) clearTimeout(moveTimers[battleId]);

  moveTimers[battleId] = setTimeout(async () => {
    const result = await checkMoveTimeout(battleId);
    if (result.timedOut) {
      io.to(`battle_${battleId}`).emit("battleError", {
        message: `Battle ended: ${result.loser} did not move in time`,
        battleId,
      });
      delete moveTimers[battleId];
    }
  }, MOVE_TIMEOUT);
}

const battleQueues = new Map<string, PQueue>();

function getBattleQueue(battleId: string) {
  if (!battleQueues.has(battleId)) {
    battleQueues.set(battleId, new PQueue({ concurrency: 1 }));
  }
  return battleQueues.get(battleId)!;
}

// Process a player action
export async function playerAction(
  battleId: string,
  avatarId: string,
  action: any,
  attackerActiveIndex: number,
  defenderActiveIndex: number
) {
  const battle = await Battle.findById(battleId)
    .populate("player1")
    .populate("player2");

  if (!battle || battle.endedAt) throw new Error("Battle not found or already ended");

  const now = new Date();
  const battleDurationMs = now.getTime() - battle.createdAt.getTime();
  const TEN_MINUTES_MS = 10 * 60 * 1000;

  if (battleDurationMs >= TEN_MINUTES_MS && !battle.winner) {
    battle.endedAt = now;
    battle.winner = "draw";
    battle.winnerReason = "Time limit exceeded";

    const updatePlayers = async (player: IAvatar) => {
      player.currentBattle = undefined;
      if (!player.battleHistory) player.battleHistory = [];
      player.battleHistory.push(battle._id);
      await player.save();
    };
    await Promise.all([
      updatePlayers(battle.player1 as IAvatar),
      updatePlayers(battle.player2 as IAvatar),
    ]);

    await battle.save();
    
    // Emit battle ended event
    emitBattleEnded(battle, false);
    
    return battle;
  }

  let isPlayer1: boolean;
  if (battle.player1?._id.toString() === avatarId) isPlayer1 = true;
  else if (battle.player2?._id.toString() === avatarId) isPlayer1 = false;
  else throw new Error("Avatar is not part of this battle");

  const attackerTeam = isPlayer1 ? battle.pokemon1 : battle.pokemon2;
  const defenderTeam = isPlayer1 ? battle.pokemon2 : battle.pokemon1;
  const attackerIndexField = isPlayer1 ? "active1" : "active2";

  battle.lastPlayer1Turn = new Date();
  battle.lastPlayer2Turn = new Date();

  if (action.type === "surrender") {
    battle.endedAt = new Date();
    battle.winner = isPlayer1 ? "player2" : "player1";
    battle.winnerReason = "Surrender";

    const updatePlayers = async (player: IAvatar) => {
      player.currentBattle = undefined;
      if (!player.battleHistory) player.battleHistory = [];
      player.battleHistory.push(battle._id);
      await player.save();
    };

    await Promise.all([
      updatePlayers(battle.player1 as IAvatar),
      updatePlayers(battle.player2 as IAvatar),
    ]);

    await battle.save();
    
    // Emit battle ended event
    emitBattleEnded(battle, false);
    
    return battle;
  }

  if (action.type === "switch") {
    battle[attackerIndexField] = action.payload.newIndex;
    battle.currentTurn = isPlayer1 ? "player2" : "player1";
  }

  if (action.type === "forcedswitch") {
    battle[attackerIndexField] = action.payload.newIndex;
  }

  if (action.type === "attack") {
    const attackerPokemon = attackerTeam[attackerActiveIndex];
    const defenderPokemon = defenderTeam[defenderActiveIndex];
    if (!attackerPokemon || !defenderPokemon) throw new Error("Invalid attacker/defender");

    defenderPokemon.currentHp -= attackerPokemon.attack;
    if (defenderPokemon.currentHp <= 0) {
      defenderPokemon.currentHp = 0;
      defenderPokemon.isDead = true;
    }

    const attackerAlive = attackerTeam.some((p) => !p.isDead);
    const defenderAlive = defenderTeam.some((p) => !p.isDead);

    if (!attackerAlive || !defenderAlive) {
      battle.endedAt = new Date();
      if (!defenderAlive) {
        battle.winner = isPlayer1 ? "player1" : "player2";
        battle.winnerReason = `${defenderPokemon.name} fainted`;
      } else {
        battle.winner = isPlayer1 ? "player2" : "player1";
        battle.winnerReason = `${attackerPokemon.name} fainted`;
      }

      const updatePlayers = async (player: IAvatar) => {
        player.currentBattle = undefined;
        if (!player.battleHistory) player.battleHistory = [];
        player.battleHistory.push(battle._id);
        await player.save();
      };
      await Promise.all([
        updatePlayers(battle.player1 as IAvatar),
        updatePlayers(battle.player2 as IAvatar),
      ]);
      
      // Emit battle ended event
      emitBattleEnded(battle, false);
    } else {
      battle.currentTurn = isPlayer1 ? "player2" : "player1";
    }
  }

  battle.markModified("pokemon1");
  battle.markModified("pokemon2");
  await battle.save();

  return battle;
}

export async function playerActionSafe(
  battleId: string,
  avatarId: string,
  action: any,
  attackerActiveIndex: number,
  defenderActiveIndex: number
) {
  const queue = getBattleQueue(battleId);

  return queue.add(() => playerAction(battleId, avatarId, action, attackerActiveIndex, defenderActiveIndex));
}

// Send match invite
export interface SendMatchInviteInput {
  senderId: string;
  receiverId: string;
}

export async function sendMatchInvite({ senderId, receiverId }: SendMatchInviteInput) {
  const existing = await MatchInvite.findOne({
    senderId,
    receiverId,
    status: "pending",
  });

  if (existing) throw new Error("Invite already pending");

  const invite = await MatchInvite.create({
    senderId,
    receiverId,
    status: "pending",
    expiresAt: new Date(Date.now() + 30_000),
  });

  const senderAvatar = await Avatar.findById(senderId).select("userName avatar");

  return {
    invite,
    senderInfo: {
      name: senderAvatar?.userName || "Unknown",
      avatar: senderAvatar?.avatar || "",
    },
  };
}

export interface RespondToMatchInviteInput {
  inviteId: string;
  receiverId: string;
  accept: boolean;
}
export interface RespondToMatchInviteOutput {
  battle?: any;
  declined?: boolean;
  senderId?: string;
}

 // Respond match invite
export async function respondToMatchInvite({
  inviteId,
  receiverId,
  accept,
}: RespondToMatchInviteInput): Promise<RespondToMatchInviteOutput> {
  const invite = await MatchInvite.findById(inviteId);
  if (!invite || invite.status !== "pending") {
    throw new Error("Invite expired or invalid");
  }

  if (invite.receiverId.toString() !== receiverId) {
    throw new Error("Unauthorized");
  }

  if (!accept) {
    invite.status = "declined";
    await invite.save();
    return { declined: true, senderId: invite.senderId.toString() };
  }

  invite.status = "accepted";
  await invite.save();

  const battle = await Battle.create({
    player1: invite.senderId,
    player2: invite.receiverId,
    pokemon1: [],
    pokemon2: [],
    currentTurn: "player1",
  });

  await Promise.all([
    Avatar.findByIdAndUpdate(invite.senderId, { currentBattle: battle._id }),
    Avatar.findByIdAndUpdate(invite.receiverId, { currentBattle: battle._id }),
  ]);

  return { battle };
}
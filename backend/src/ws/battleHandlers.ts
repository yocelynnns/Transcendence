import { Server, Socket } from "socket.io";
import axios from "axios";
import Battle, { IBattlePokemon } from "../db/battle";
import { IAvatar } from "../db/avatar";

export function setupBattleHandlers(
  io: Server,
  socket: Socket,
  matchingPool: { socketId: string; avatarId: string }[]
) {
  let isMatching = false;

  socket.on("joinMatching", async (data: { avatarId: string; token: string }) => {
    const { avatarId: playerAvatarId, token } = data;
    if (matchingPool.some((p) => p.avatarId === playerAvatarId)) return;

    matchingPool.push({ socketId: socket.id, avatarId: playerAvatarId });

    if (isMatching) return;
    isMatching = true;

    while (matchingPool.length >= 2) {
      const player1 = matchingPool.shift()!;
      const player2 = matchingPool.shift()!;

      try {
        const response = await axios.post("http://localhost:25001/api/battle", {
          player1: player1.avatarId,
          player2: player2.avatarId,
        });
        const battle = response.data;
        const roomName = `battle_${battle._id}`;

        await Promise.all([
          axios.put(
            `http://localhost:25001/api/avatar/${player1.avatarId}`,
            { currentBattle: battle },
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.put(
            `http://localhost:25001/api/avatar/${player2.avatarId}`,
            { currentBattle: battle },
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const socket1 = io.sockets.sockets.get(player1.socketId);
        const socket2 = io.sockets.sockets.get(player2.socketId);

        socket1?.join(roomName);
        socket2?.join(roomName);

        io.to(roomName).emit("opponentFound", { battle });
      } catch (err) {
        matchingPool.unshift(player2, player1);
        io.to(player1.socketId).emit("matchError", { message: "Failed to create battle, retrying..." });
        io.to(player2.socketId).emit("matchError", { message: "Failed to create battle, retrying..." });
        break;
      }
    }

    isMatching = false;
  });

  const BATTLE_TIMEOUT = 400_000; // 40 seconds
  const battleTimers: Record<string, NodeJS.Timeout> = {};

  // Function to start the battle timeout
  async function startBattleTimeout(battleId: string, io: any) {
    if (battleTimers[battleId]) return; // already running

    battleTimers[battleId] = setTimeout(async () => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) return;

        const roomName = `battle_${battle._id}`;
        const p1Ready = (battle.pokemon1?.length || 0) > 0;
        const p2Ready = (battle.pokemon2?.length || 0) > 0;

        battle.endedAt = new Date();

        if (p1Ready && !p2Ready) {
          battle.winner = "player1";
          battle.winnerReason = "enemy disconnected";
        } else if (!p1Ready && p2Ready) {
          battle.winner = "player2";
          battle.winnerReason = "enemy disconnected";
        } else {
          battle.winner = "draw";
          battle.winnerReason = "both disconnected or did not pick in time";
        }

        await battle.save();

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

// Player ready socket
socket.on(
  "playerReady",
  async ({
    currentBattleId,
    playerId,
    selectedPokemon,
  }: {
    currentBattleId: string;
    playerId: string;
    selectedPokemon: IBattlePokemon[];
  }) => {
    try {
      const battle = await Battle.findById(currentBattleId);
      if (!battle) return;

      const isPlayer1 = battle.player1.toString() === playerId;
      if (isPlayer1) battle.pokemon1 = selectedPokemon;
      else battle.pokemon2 = selectedPokemon;

      await battle.save();

      const roomName = `battle_${battle._id}`;

      const player1Ready = (battle.pokemon1?.length || 0) > 0;
      const player2Ready = (battle.pokemon2?.length || 0) > 0;

      if (player1Ready && player2Ready) {
        // Both ready, emit battleReady and clear timeout
        if (battleTimers[currentBattleId]) {
          clearTimeout(battleTimers[currentBattleId]);
          delete battleTimers[currentBattleId];
        }

        if (!battle.currentTurn) battle.currentTurn = "player1";
        battle.lastPlayer1Turn = new Date(); // record last turn time
        await battle.save();

        io.to(roomName).emit("battleReady", { battleId: battle._id });
        return;
      }

      // Start the timeout if only one player is ready
      startBattleTimeout(currentBattleId, io);
    } catch (err) {
      console.error("Error processing playerReady:", err);
    }
  }
);

const MOVE_TIMEOUT = 60_000; // 60 seconds per move
const moveTimers: Record<string, NodeJS.Timeout> = {};

// Check if current player exceeded move timeout
async function checkMoveTimeout(battleId: string, io: any) {
  const battle = await Battle.findById(battleId)
    .populate("player1")
    .populate("player2");
  if (!battle || battle.endedAt) return;

  const now = Date.now();
  const currentTurn = battle.currentTurn; // "player1" | "player2"
  const lastTurnTime =
    currentTurn === "player1"
      ? battle.lastPlayer1Turn?.getTime()
      : battle.lastPlayer2Turn?.getTime();

  if (!lastTurnTime) return;

  if (now - lastTurnTime >= MOVE_TIMEOUT) {
    battle.endedAt = new Date();
    const loser = currentTurn;
    const winner = currentTurn === "player1" ? "player2" : "player1";

    battle.winner = winner;
    battle.winnerReason = `${loser} did not move in time`;
    await battle.save();

    if (moveTimers[battleId]) {
      clearTimeout(moveTimers[battleId]);
      delete moveTimers[battleId];
    }

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

    io.to(`battle_${battle._id}`).emit("battleError", {
      message: `Battle ended: ${loser} did not move in time`,
      battleId: battle._id,
    });
  }
}

// Start/restart move timeout
function startMoveTimeout(battleId: string, io: any) {
  if (moveTimers[battleId]) {
    clearTimeout(moveTimers[battleId]);
  }
  moveTimers[battleId] = setTimeout(() => {
    checkMoveTimeout(battleId, io);
  }, MOVE_TIMEOUT);
}

// Player action socket
socket.on(
  "playerAction",
  async ({
    battleId,
    action,
    isPlayer1,
    attackerActiveIndex,
    defenderActiveIndex,
  }: {
    battleId: string;
    action: any;
    isPlayer1: boolean;
    attackerActiveIndex: number;
    defenderActiveIndex: number;
  }) => {
    try {
      const battle = await Battle.findById(battleId)
        .populate("player1")
        .populate("player2");
      if (!battle || battle.endedAt) return;

      const roomName = `battle_${battle._id}`;
      const attackerTeam = isPlayer1 ? battle.pokemon1 : battle.pokemon2;
      const defenderTeam = isPlayer1 ? battle.pokemon2 : battle.pokemon1;
      const attackerIndexField = isPlayer1 ? "active1" : "active2";

      // Record last turn time
      if (isPlayer1) battle.lastPlayer1Turn = new Date();
      else battle.lastPlayer2Turn = new Date();

      if (action.type === "switch" || action.type === "forcedswitch") {
        battle[attackerIndexField] = action.payload.newIndex;
        battle.currentTurn = isPlayer1 ? "player2" : "player1";
      }

      if (action.type === "attack") {
        const attackerPokemon = attackerTeam[attackerActiveIndex];
        const defenderPokemon = defenderTeam[defenderActiveIndex];
        if (!attackerPokemon || !defenderPokemon) return;

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
        } else {
          battle.currentTurn = isPlayer1 ? "player2" : "player1";
        }
      }

      battle.markModified("pokemon1");
      battle.markModified("pokemon2");
      await battle.save();

      // Restart move timeout
      startMoveTimeout(battle._id.toString(), io);

      const payload = {
        _id: battle._id,
        pokemon1: battle.pokemon1,
        pokemon2: battle.pokemon2,
        active1: battle.active1,
        active2: battle.active2,
        currentTurn: battle.currentTurn,
        lastPlayer1Turn: battle.lastPlayer1Turn,
        lastPlayer2Turn: battle.lastPlayer2Turn,
        endedAt: battle.endedAt,
        winner: battle.winner,
        winnerReason: battle.winnerReason,
      };

      io.to(roomName).emit("updateBattleState", payload);
    } catch (err) {
      console.error("Error processing player action:", err);
    }
  }
);


  socket.on("joinAsSpectator", async (data: { battleId: string }) => {
    const { battleId } = data;
    const roomName = `battle_${battleId}`;

    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room) {
      socket.emit("spectatorError", { message: "Battle not found" });
      return;
    }
    socket.join(roomName);

    console.log(`Spectator joined room ${roomName}`);
  });

}

import mongoose from "mongoose";
import { Server } from "socket.io";
import Pokemon from "../db/pokemon";
import Battle from "../db/battle"; // adjust path if needed
import axios from "axios";
import PlayerPokemon from "../db/playerPokemon"; // make sure this import exists

// DATA
interface PlayerData {
  id: string;
  x: number;
  y: number;
  direction: string;
  frame: number;
  charIndex: number;
}

const players: Record<string, PlayerData> = {};
let waitingPlayer: { socketId: string; avatarId: string } | null = null;

const activeMatches = new Map<
  string,
  { opponentSocketId: string; opponentAvatarId: string; role: string; battleId: string }
>();

const battleReadyState = new Map<
  string, // battleId
  {
    player1Ready: boolean;
    player2Ready: boolean;
    player1Team: any[];
    player2Team: any[];
  }
>();

const battleTurns = new Map<string, "player1" | "player2">();

// SETUP SOCKET
export function setupSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", async (socket) => {
    console.log("NEW CLIENT CONNECTED:", socket.id);

    // SEND CURRENT PLAYERS
    socket.emit("playersUpdate", Object.values(players));

    // SEND CURRENT POKÉMON
    const currentPokemons = await Pokemon.find({ caught: false });
    socket.emit("pokemonUpdate", currentPokemons);

    // PLAYER MOVEMENT
    socket.on("playerMove", (data: any) => {
      players[socket.id] = { id: socket.id, ...data };
      io.emit("playersUpdate", Object.values(players));
    });

    // CATCH POKÉMON
    socket.on("catchPokemon", async (data: { playerId: string; pokemonId: string }) => {
      const { playerId, pokemonId } = data;
      try {
        await axios.post(
          `http://localhost:5001/api/avatar/${playerId}/pokemon/catch`,
          { mapPokemonId: pokemonId }
        );

        const remainingRes = await axios.get("http://localhost:5001/api/pokemon");
        const remainingPokemons = remainingRes.data;

        io.emit("pokemonUpdate", remainingPokemons);
      } catch (err) {
        console.error("ERROR CATCHING POKÉMON VIA API:", err);
      }
    });

    socket.on("joinMatching", async (playerAvatarId: string) => {
      // If player already has a match, re-send it
      if (activeMatches.has(socket.id)) {
        const match = activeMatches.get(socket.id)!;
        socket.emit("opponentFound", {
          avatarId: match.opponentAvatarId,
          socketId: match.opponentSocketId,
        });
        return;
      }

      if (!waitingPlayer) {
        waitingPlayer = { socketId: socket.id, avatarId: playerAvatarId };
        socket.emit("waitingForOpponent");
      } else {
          const opponent = waitingPlayer;
          waitingPlayer = null;

          const battle = new Battle({
            player1: { playerId: new mongoose.Types.ObjectId(opponent.avatarId), team: [] },
            player2: { playerId: new mongoose.Types.ObjectId(playerAvatarId), team: [] },
          });

          await battle.save();

          const battleId = battle._id.toString(); // This is the ID we need

          activeMatches.set(socket.id, {
            opponentSocketId: opponent.socketId,
            opponentAvatarId: opponent.avatarId,
            role: "player2", // this socket is player2
            battleId
          });

          activeMatches.set(opponent.socketId, {
            opponentSocketId: socket.id,
            opponentAvatarId: playerAvatarId,
            role: "player1", // this socket is player1
            battleId
          });

          socket.emit("opponentFound", {
            avatarId: opponent.avatarId,
            socketId: opponent.socketId,
            battleId,
          });

          io.to(opponent.socketId).emit("opponentFound", {
            avatarId: playerAvatarId,
            socketId: socket.id,
            battleId,
          });
        }
    });

    socket.on(
      "playerReady",
      async ({ battleId, selectedPokemon }: { battleId: string; selectedPokemon: string[] }) => {
        if (!battleReadyState.has(battleId)) {
          battleReadyState.set(battleId, {
            player1Ready: false,
            player2Ready: false,
            player1Team: [],
            player2Team: [],
          });
        }

        const state = battleReadyState.get(battleId)!;

        const match = activeMatches.get(socket.id);
        if (!match) return;

        const isPlayer1 = match.role === "player1"; // now using role

        // Fetch full Pokémon data
        const pokemons = await PlayerPokemon.find({ _id: { $in: selectedPokemon } });

        const team = pokemons.map(p => ({
          pokemonId: p._id,
          name: p.name,
          type: p.type,
          attack: p.attack,
          maxHp: p.hp,
          currentHp: p.hp,
          isDead: false,
          is_shiny: p.is_shiny,
        }));

        if (isPlayer1) {
          state.player1Ready = true;
          state.player1Team = team;
        } else {
          state.player2Ready = true;
          state.player2Team = team;
        }

        // Notify waiting / enemy ready (same as before)
        if ((isPlayer1 && !state.player2Ready) || (!isPlayer1 && !state.player1Ready)) {
          socket.emit("waitingForEnemy");
          socket.to(match.opponentSocketId).emit("enemyIsReady");
        }

        // Both ready → fill battle DB & notify
        if (state.player1Ready && state.player2Ready) {
          try {
            const battle = await Battle.findById(match.battleId);
            if (!battle) return;

            battle.player1.team = state.player1Team;
            battle.player2.team = state.player2Team;
            await battle.save();

            battleTurns.set(match.battleId, "player1");

            io.to(match.opponentSocketId).emit("turnUpdate", "player1");
            socket.emit("turnUpdate", "player1");

            io.to(match.opponentSocketId).emit("battleReady", { battleId: match.battleId });
            socket.emit("battleReady", { battleId: match.battleId });

            // clean up
            battleReadyState.delete(battleId);
          } catch (err) {
            console.error("Error filling battle data:", err);
          }
        }
      }
    );

    // SIGN OUT
    socket.on("signout", () => {
      delete players[socket.id];
      io.emit("playersUpdate", Object.values(players));
      socket.disconnect(true);
    });

    socket.on("playerAction", async ({ battleId, action }: { battleId: string; action: any }) => {
      const match = activeMatches.get(socket.id);
      if (!match) return;

      const currentTurn = battleTurns.get(battleId);
      if (!currentTurn) return;

      const isPlayer1 = match.role === "player1";

      // ❌ Not your turn? Ignore.
      if (
        (currentTurn === "player1" && !isPlayer1) ||
        (currentTurn === "player2" && isPlayer1)
      ) return;

      try {
        const battle = await Battle.findById(battleId);
        if (!battle) return;

        const attackerTeam = isPlayer1 ? battle.player1.team : battle.player2.team;
        const defenderTeam = isPlayer1 ? battle.player2.team : battle.player1.team;

        const attackerActiveIndex = isPlayer1 ? battle.player1.activeIndex : battle.player2.activeIndex;
        const defenderActiveIndex = isPlayer1 ? battle.player2.activeIndex : battle.player1.activeIndex;

        // 🟢 SWITCH POKÉMON
        if (action.type === "switch" || action.type === "forcedswitch") {
          // update active index
          if (isPlayer1) {
            battle.player1.activeIndex = action.payload.newIndex;
          } else {
            battle.player2.activeIndex = action.payload.newIndex;
          }
          await battle.save();

          // notify self and opponent
          socket.emit("playerSwitchedPokemon", { newIndex: action.payload.newIndex });
          io.to(match.opponentSocketId).emit("opponentSwitchedPokemon", { newIndex: action.payload.newIndex });
        }

        // 🟢 ATTACK
        if (action.type === "attack") {
          const damage = attackerTeam[attackerActiveIndex].attack;

          const defenderPokemon = defenderTeam[defenderActiveIndex];
          defenderPokemon.currentHp -= damage;
          if (defenderPokemon.currentHp <= 0) {
            defenderPokemon.currentHp = 0;
            defenderPokemon.isDead = true;
          }

          await battle.save();

          // send updated battle state to both players
          socket.emit("updateBattleState", {
            player: attackerTeam,   // near for local player
            enemy: defenderTeam,    // far for local player
          });

          io.to(match.opponentSocketId).emit("updateBattleState", {
            player: defenderTeam,   // near for opponent
            enemy: attackerTeam,    // far for opponent
          });
        }

        // 🔁 Switch turn
        if (action.type != "forcedswitch")
        {
          const nextTurn = currentTurn === "player1" ? "player2" : "player1";
          battleTurns.set(battleId, nextTurn);
          socket.emit("turnUpdate", nextTurn);
          io.to(match.opponentSocketId).emit("turnUpdate", nextTurn);
        }

      } catch (err) {
        console.error("Error processing player action:", err);
      }
    });

    socket.on("getTurn", ({ battleId }) => {
      const turn = battleTurns.get(battleId);
      if (turn) {
        socket.emit("turnUpdate", turn);
      }
    });

    // DISCONNECT
    socket.on("disconnect", (reason) => {
      if (players[socket.id]) {
        delete players[socket.id];
        io.emit("playersUpdate", Object.values(players));
      }

      // Clear waiting queue
      if (waitingPlayer?.socketId === socket.id) {
        waitingPlayer = null;
      }

      // Handle active match
      if (activeMatches.has(socket.id)) {
        const opponent = activeMatches.get(socket.id)!;

        // Tell opponent their match is gone
        io.to(opponent.opponentSocketId).emit("opponentLeft");

        activeMatches.delete(opponent.opponentSocketId);
        activeMatches.delete(socket.id);
      }

      console.log(`PLAYER DISCONNECTED: ${socket.id}, REASON: ${reason}`);
    });
  });
}

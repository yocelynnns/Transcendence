import { Server, Socket } from "socket.io";
import { IBattlePokemon } from "../db/battle";

import * as AvatarService from "../services/avatar.service";
import * as BattleService from "../services/battle.service";

export function setupBattleHandlers(
  io: Server,
  socket: Socket,
  matchingPool: { socketId: string; avatarId: string; userId:string }[]
) {

  // Join matching
  async function tryMatch() {
    while (matchingPool.length >= 2) {
      const player1 = matchingPool.shift()!;
      const player2 = matchingPool.shift()!;

      try {
        const battle = await BattleService.createBattle({
          player1: player1.avatarId,
          player2: player2.avatarId,
        });

        const room = `battle_${battle._id}`;

        await Promise.all([
          AvatarService.updateAvatar({ avatarId: player1.avatarId, data: { currentBattle: battle._id } }),
          AvatarService.updateAvatar({ avatarId: player2.avatarId, data: { currentBattle: battle._id } }),
        ]);

        const s1 = io.sockets.sockets.get(player1.socketId);
        const s2 = io.sockets.sockets.get(player2.socketId);

        s1?.join(room);
        s2?.join(room);

        io.to(room).emit("opponentFound", { battle });
      } catch (err) {
        matchingPool.unshift(player2, player1);

        io.to(player1.socketId).emit("matchError", { message: "Match failed" });
        io.to(player2.socketId).emit("matchError", { message: "Match failed" });
        break;
      }
    }
  }

  socket.on("joinMatching", async () => {
    const userId = socket.data.userId;
    const avatarId = socket.data.avatarId.toString();

    if (!userId || !avatarId) return;

    if (matchingPool.some(p => p.avatarId === avatarId)) return;

    matchingPool.push({
      socketId: socket.id,
      userId,
      avatarId,
    });

    tryMatch();
  });

  // Player ready on team select
  socket.on("playerReady", async ({ currentBattleId, selectedPokemon }: { currentBattleId: string; selectedPokemon: IBattlePokemon[] }) => {
    try {
      const avatarId = socket.data.avatarId.toString();
      if (!avatarId) return;

      const battle = await BattleService.markPlayerReady(currentBattleId, avatarId, selectedPokemon);
      const roomName = `battle_${battle._id}`;

      const player1Ready = (battle.pokemon1?.length || 0) > 0;
      const player2Ready = (battle.pokemon2?.length || 0) > 0;

      if (player1Ready && player2Ready) {
        if (BattleService.battleTimers[currentBattleId]) {
          clearTimeout(BattleService.battleTimers[currentBattleId]);
          delete BattleService.battleTimers[currentBattleId];
        }

        if (!battle.currentTurn) battle.currentTurn = "player1";
        battle.lastPlayer1Turn = new Date();
        await battle.save();

        io.to(roomName).emit("battleReady", { battleId: battle._id });
        return;
      }

      BattleService.startBattleTimeout(currentBattleId, io);
    } catch (err) {
      console.error("Error processing playerReady:", err);
    }
  });

  // Player action on battle
  socket.on("playerAction", async (data: any) => {
    try {
      const avatarId = socket.data.avatarId.toString();
      if (!avatarId) return;

      const battle = await BattleService.playerAction(
        data.battleId,
        avatarId,
        data.action,
        data.attackerActiveIndex,
        data.defenderActiveIndex
      );

      BattleService.startMoveTimeout(data.battleId, io);

      const roomName = `battle_${battle._id}`;
      io.to(roomName).emit("updateBattleState", {
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
      });
    } catch (err) {
      console.error("Error processing player action:", err);
      socket.emit("playerActionError", { message: err instanceof Error ? err.message : "Unknown error" });
    }
  });

  // join as spectator
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

  // Send match invite
  socket.on("sendMatchInvite", async (data: { receiverId: string }) => {
    try {
      const senderId = socket.data.avatarId.toString();
      if (!senderId) {
        socket.emit("matchInviteError", { error: "Unauthorized" });
        return; // explicitly return void
      }

      const receiverId = data.receiverId;

      // Find receiver socket
      let receiverSocketId: string | null = null;
      for (const [sid, s] of io.sockets.sockets) {
        if (s.data.avatarId === receiverId) {
          receiverSocketId = sid;
          break;
        }
      }

      if (!receiverSocketId) {
        socket.emit("matchInviteError", { error: "User is offline" });
        return; // explicitly return void
      }

      // Call service to create invite
      const { invite, senderInfo } = await BattleService.sendMatchInvite({ senderId, receiverId });

      // Notify receiver
      io.to(receiverSocketId).emit("matchInviteReceived", {
        inviteId: invite._id,
        senderId,
        senderName: senderInfo.name,
        senderAvatar: senderInfo.avatar,
      });

      // Notify sender
      socket.emit("matchInviteSent", { inviteId: invite._id });
      return; // explicitly return void
    } catch (err) {
      console.error("Error sending match invite:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      socket.emit("matchInviteError", { error: message });
      return; // explicitly return void
    }
  });

  // Respond match invite
  socket.on(
    "respondToMatchInvite",
    async (data: { inviteId: string; accept: boolean }): Promise<void> => {
      try {
        const receiverId = socket.data.avatarId.toString();
        if (!receiverId) {
          socket.emit("matchInviteError", { error: "Unauthorized" });
          return;
        }

        const { inviteId, accept } = data;

        // Call service
        const result = await BattleService.respondToMatchInvite({
          inviteId,
          receiverId,
          accept,
        });

        if (result.declined) {
          // Notify sender if socket exists
          if (result.senderId) {
            for (const [sid, s] of io.sockets.sockets) {
              if (s.data.avatarId === result.senderId) {
                io.to(sid).emit("matchInviteDeclined", { by: receiverId });
                break;
              }
            }
          }
          return; // exit early
        }

        // ACCEPTED → join battle room
        const battle = result.battle;
        const roomName = `battle_${battle._id}`;

        // Join both sockets
        for (const [_, s] of io.sockets.sockets) {
          if (
            s.data.avatarId?.toString() === battle.player1.toString() ||
            s.data.avatarId?.toString() === battle.player2.toString()
          ) {
            s.join(roomName);
          }
        }

        io.to(roomName).emit("directMatchReady", { battle });
      } catch (err) {
        console.error("Error responding to match invite:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        socket.emit("matchInviteError", { error: message });
      }
    }
  );
}
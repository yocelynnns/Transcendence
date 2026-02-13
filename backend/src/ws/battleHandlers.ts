import { Server, Socket } from "socket.io";
import { IBattlePokemon } from "../db/battle";
import User from "../db/user";
import Friend from "../db/friend";
import { onlineUsers } from "./server";
import Avatar from "../db/avatar";
import PQueue from "p-queue";
import * as AvatarService from "../services/avatar.service";
import * as BattleService from "../services/battle.service";

export function setupBattleHandlers(
  io: Server,
  socket: Socket,
  matchingPool: { socketId: string; avatarId: string; userId:string }[]
) {

  const matchingQueue = new PQueue({ concurrency: 1 });

  async function notifyFriendsBattleStarted(io: Server, avatarId: string, battleId: string) {
    try {
      const userRecord = await User.findOne({ avatar: avatarId }).populate("avatar");
      if (!userRecord) return;
      
      const friendships = await Friend.find({
        $or: [{ userId: userRecord._id }, { friendId: userRecord._id }],
        status: "accepted"
      });
      
      const friendUserIds = friendships.map((f: any) => 
        f.userId.toString() === userRecord._id.toString() ? f.friendId : f.userId
      );
      
      const friendUsers = await User.find({ _id: { $in: friendUserIds } });
      const friendAvatarIds = friendUsers.map((u: any) => u.avatar?.toString()).filter(Boolean);
      
      friendAvatarIds.forEach((friendAvatarId: string) => {
        const friendSocketId = onlineUsers.get(friendAvatarId);
        if (friendSocketId) {
          io.to(friendSocketId).emit("friendBattleStarted", {
            avatarId,
            battleId
          });
        }
      });
    } catch (err) {
      console.log("Error notifying friends battle started:", err);
    }
  }

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
        await notifyFriendsBattleStarted(io, player1.avatarId, battle._id.toString());
        await notifyFriendsBattleStarted(io, player2.avatarId, battle._id.toString());
        BattleService.startBattleTimeout(battle._id.toString(), io);
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
    const avatarId = socket.data.avatarId?.toString();

    if (!userId || !avatarId) return;

    if (matchingPool.some(p => p.avatarId === avatarId)) return;

    matchingPool.push({
      socketId: socket.id,
      userId,
      avatarId,
    });
    matchingQueue.add(() => tryMatch());
  });

  // Player ready on team select
  socket.on("playerReady", async ({ currentBattleId, selectedPokemon }: { currentBattleId: string; selectedPokemon: IBattlePokemon[] }) => {
    try {
      const avatarId = socket.data.avatarId?.toString();
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
        
        // NEW: Emit initial battle state to room (including spectators)
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
        
        BattleService.startMoveTimeout(battle._id.toString(), io);
        return;
      }
    } catch (err) {
      console.log("Error processing playerReady:", err);
    }
  });

  // Player action on battle
  socket.on("playerAction", async (data: any) => {
    try {
      const avatarId = socket.data.avatarId?.toString();
      if (!avatarId) return;

      const battle = await BattleService.playerActionSafe(
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
      console.log("Error processing player action:", err);
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

  socket.on("friendBattleStarted", async (data: { battleId: string; avatarId: string }) => {
    // Re-notify friends that battle has started (in case they missed it)
    await notifyFriendsBattleStarted(io, data.avatarId, data.battleId);
  });

  // Send match invite
  socket.on("sendMatchInvite", async (data: { receiverId: string }) => {
    try {
      const senderId = socket.data.avatarId?.toString(); 
      if (!senderId) {
        socket.emit("matchInviteError", { error: "Unauthorized" });
        return;
      }

      // NEW: Check sender has at least 3 Pokemon
      const senderAvatar = await Avatar.findById(senderId).populate("pokemonInventory");
      if (!senderAvatar || (senderAvatar.pokemonInventory?.length || 0) < 3) {
        socket.emit("matchInviteError", { error: "You need at least 3 Pokemon to battle" });
        return;
      }

      const receiverId = data.receiverId;

      // NEW: Check receiver has at least 3 Pokemon
      const receiverAvatar = await Avatar.findById(receiverId).populate("pokemonInventory");
      if (!receiverAvatar || (receiverAvatar.pokemonInventory?.length || 0) < 3) {
        socket.emit("matchInviteError", { error: "Opponent needs at least 3 Pokemon to battle" });
        return;
      }

      let receiverSocketId: string | null = null;
      for (const [sid, s] of io.sockets.sockets) {
        if (s.data.avatarId === receiverId) {
          receiverSocketId = sid;
          break;
        }
      }

      if (!receiverSocketId) {
        socket.emit("matchInviteError", { error: "User is offline" });
        return;
      }

      const { invite, senderInfo } = await BattleService.sendMatchInvite({ senderId, receiverId });

      io.to(receiverSocketId).emit("matchInviteReceived", {
        inviteId: invite._id,
        senderId,
        senderName: senderInfo.name,
        senderAvatar: senderInfo.avatar,
      });

      socket.emit("matchInviteSent", { inviteId: invite._id });
      return;
    } catch (err) {
      console.log("Error sending match invite:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      socket.emit("matchInviteError", { error: message });
      return;
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

        // NEW: If accepting, check both players still have 3 Pokemon
        if (accept) {
          const receiverAvatar = await Avatar.findById(receiverId).populate("pokemonInventory");
          if (!receiverAvatar || (receiverAvatar.pokemonInventory?.length || 0) < 3) {
            socket.emit("matchInviteError", { error: "You need at least 3 Pokemon to battle" });
            return;
          }
        }

        const result = await BattleService.respondToMatchInvite({
          inviteId,
          receiverId,
          accept,
        });

        if (result.declined) {
          if (result.senderId) {
            for (const [sid, s] of io.sockets.sockets) {
              if (s.data.avatarId === result.senderId) {
                io.to(sid).emit("matchInviteDeclined", { by: receiverId });
                break;
              }
            }
          }
          return;
        }

        const battle = result.battle;
        const roomName = `battle_${battle._id}`;

        for (const [_, s] of io.sockets.sockets) {
          if (
            s.data.avatarId?.toString() === battle.player1.toString() ||
            s.data.avatarId?.toString() === battle.player2.toString()
          ) {
            s.join(roomName);
          }
        }

        console.log(battle);

        io.to(roomName).emit("directMatchReady", { battle });
        
        // Notify friends
        BattleService.startBattleTimeout(battle._id.toString(), io);
        await notifyFriendsBattleStarted(io, battle.player1.toString(), battle._id.toString());
        await notifyFriendsBattleStarted(io, battle.player2.toString(), battle._id.toString());
        
      } catch (err) {
        console.log("Error responding to match invite:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        socket.emit("matchInviteError", { error: message });
      }
    }
  );
}
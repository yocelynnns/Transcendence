import { Server, Socket } from "socket.io";
import Avatar from "../db/avatar";

export const setupFriendHandler = (io: Server, socket: Socket, onlineUsers: Map<string, string>, socketToAvatar: Map<string, string>) => {
  
  // Avatar comes online
  socket.on("userOnline", (avatarId: string) => {
    onlineUsers.set(avatarId, socket.id);
    socketToAvatar.set(socket.id, avatarId);
    io.emit("userStatusChange", { avatarId, online: true });
    console.log(`👤 Avatar ${avatarId} is now online`);
  });

  // Request online status for friends
  socket.on("requestFriendsStatus", async (friendAvatarIds: string[]) => {
    const statuses = friendAvatarIds.map(avatarId => ({
      avatarId,
      online: onlineUsers.has(avatarId),
    }));
    socket.emit("friendsStatusUpdate", statuses);
    
    // NEW: Also send battle status for friends
    const battleStatuses = await Promise.all(
      friendAvatarIds.map(async (avatarId) => {
        const avatar = await Avatar.findById(avatarId).select("currentBattle");
        return {
          avatarId,
          currentBattle: avatar?.currentBattle?.toString() || null,
        };
      })
    );
    socket.emit("friendsBattleStatusUpdate", battleStatuses);
  });

  // Broadcast avatar update to all friend
  socket.on("avatarUpdated", (data: { avatarId: string; avatarImage: string; userName?: string }) => {
    socket.broadcast.emit("friendAvatarUpdated", {
      avatarId: data.avatarId,
      avatarImage: data.avatarImage,
      userName: data.userName,
    });
  });

  // Friend request / accept / auto-accept
  socket.on("friendRequestSent", (data: { targetAvatarId: string; requesterInfo: any }) => {
    const targetSocketId = onlineUsers.get(data.targetAvatarId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("friendRequestReceived", data.requesterInfo);
    }
  });

  socket.on("friendRequestAccepted", (data: { targetAvatarId: string; accepterInfo: any }) => {
    const targetSocketId = onlineUsers.get(data.targetAvatarId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("friendRequestAcceptedByOther", {
        ...data.accepterInfo,
        message: "accepted your friend request",
      });
    }
  });

  socket.on("notifyAutoAccept", (data: { targetAvatarId: string; accepterInfo: any }) => {
    const targetSocketId = onlineUsers.get(data.targetAvatarId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("friendRequestAutoAccepted", data.accepterInfo);
    }
  });

  // Friend removed
  socket.on("friendRemoved", (data: { targetAvatarId: string }) => {
    const targetSocketId = onlineUsers.get(data.targetAvatarId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("removedByFriend", {
        removerAvatarId: socket.data.avatarId.toString(),
      });
    }
    
  });
  // In friendHandler.ts - this looks correct already
  socket.on("playerReturnedHome", ({ avatarId }: { avatarId: string }) => {
    // Broadcast to ALL clients
    io.emit("friendReturnedHome", { avatarId });
    
    // Update DB
    Avatar.findByIdAndUpdate(avatarId, { currentBattle: null }).then(() => {
      console.log(`✅ Avatar ${avatarId} returned home, battle cleared`);
    });
  });
  socket.on("viewingResults", ({ avatarId, battleId }: { avatarId: string; battleId: string }) => {
    // Broadcast to all friends that this player is viewing results
    // This is the same as battleEnded - keeps them in viewing_results state
    io.emit("battleEnded", { avatarId, battleId });
    
    console.log(`👁️ ${avatarId} is viewing results for battle ${battleId}`);
  });
};



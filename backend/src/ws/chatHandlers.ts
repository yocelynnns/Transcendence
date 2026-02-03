import { Server, Socket } from "socket.io";
import Message from "../db/message";
import Avatar from "../db/avatar";

// Track which sockets are in which chat rooms
const chatRooms = new Map<string, Set<string>>();

export function setupChatHandlers(io: Server, socket: Socket, onlineUsers: Map<string, string>) {
  
  // JOIN PRIVATE CHAT ROOM
  socket.on("joinChat", (data: { friendAvatarId: string; myAvatarId: string }) => {
    const { friendAvatarId, myAvatarId } = data;
    
    if (!friendAvatarId || !myAvatarId) {
      console.log("❌ Invalid joinChat data:", data);
      return;
    }
    
    const roomName = [myAvatarId, friendAvatarId].sort().join("_");
    
    if (socket.rooms.has(roomName)) {
      console.log(`⚠️ Socket ${socket.id} already in room ${roomName}`);
      return;
    }
    
    socket.join(roomName);
    
    if (!chatRooms.has(roomName)) {
      chatRooms.set(roomName, new Set());
    }
    chatRooms.get(roomName)?.add(socket.id);

    console.log(`💬 ${myAvatarId} joined chat room ${roomName}`);
  });

  // LEAVE PRIVATE CHAT ROOM
  socket.on("leaveChat", (data: { friendAvatarId: string; myAvatarId: string }) => {
    const { friendAvatarId, myAvatarId } = data;
    
    if (!friendAvatarId || !myAvatarId) return;
    
    const roomName = [myAvatarId, friendAvatarId].sort().join("_");
    
    socket.leave(roomName);
    chatRooms.get(roomName)?.delete(socket.id);
    
    console.log(`💬 ${myAvatarId} left chat room ${roomName}`);
  });

  // SEND PRIVATE MESSAGE
  socket.on("sendPrivateMessage", async (data: { 
    receiverId: string; 
    content: string;
    senderId: string;
  }) => {
    const { receiverId, content, senderId } = data;

    if (!content || content.trim().length === 0) return;
    if (!senderId || !receiverId) {
      socket.emit("messageError", { error: "Missing sender or receiver" });
      return;
    }

    try {
      // Verify sender matches socket's registered avatar
      if (socket.data.avatarId !== senderId) {
        socket.emit("messageError", { error: "Unauthorized sender" });
        return;
      }

      // SAVE AS STRINGS (consistent with database)
      const message = await Message.create({
        senderId: senderId,
        receiverId: receiverId,
        content: content.trim(),
      });

      // Get sender info for the payload
      const senderAvatar = await Avatar.findById(senderId).select("userName avatar");

      const messagePayload = {
        _id: message._id.toString(),
        senderId: senderId,
        receiverId: receiverId,
        content: message.content,
        createdAt: message.createdAt,
        read: false,
        senderName: senderAvatar?.userName || "Unknown",
        senderAvatar: senderAvatar?.avatar || "",
      };

      // Send to chat room
      const roomName = [senderId, receiverId].sort().join("_");
      io.to(roomName).emit("receiveMessage", messagePayload);

      // If receiver is online but NOT in chat room, send notification
      const receiverSocketId = onlineUsers.get(receiverId);
      const roomParticipants = chatRooms.get(roomName) || new Set();
      
      if (receiverSocketId && !roomParticipants.has(receiverSocketId)) {
        io.to(receiverSocketId).emit("newMessageNotification", {
          fromAvatarId: senderId,
          fromName: senderAvatar?.userName || "Unknown",
          preview: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
        });
      }

      console.log(`💬 Message saved & sent: ${senderId} -> ${receiverId}`);
    } catch (err) {
      console.error("Failed to send message:", err);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // TYPING INDICATOR
  socket.on("typing", (data: { 
    receiverId: string; 
    senderId: string; 
    isTyping: boolean 
  }) => {
    const { receiverId, senderId, isTyping } = data;
    
    if (!receiverId || !senderId) return;
    
    const roomName = [senderId, receiverId].sort().join("_");
    
    socket.to(roomName).emit("partnerTyping", {
      avatarId: senderId,
      isTyping,
    });
  });

  // MARK MESSAGES AS READ
  socket.on("markAsRead", async (data: { 
    senderId: string; 
    receiverId: string 
  }) => {
    const { senderId, receiverId } = data;
    
    if (!senderId || !receiverId) return;
    
    try {
      // Use strings directly
      await Message.updateMany(
        { senderId: senderId, receiverId: receiverId, read: false },
        { read: true }
      );
      
      // Notify sender that messages were read
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { byAvatarId: receiverId });
      }
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  });
}
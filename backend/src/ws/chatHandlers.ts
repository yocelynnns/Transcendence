import { Server, Socket } from "socket.io";
import { markMessagesRead, sendMessage } from "../services/chat.service";
import { getAvatarById } from "../services/avatar.service";

const chatRooms = new Map<string, Set<string>>();

export function setupChatHandlers(io: Server, socket: Socket, onlineUsers: Map<string, string>) {
  
  // Join private chat room
  socket.on("joinChat", (data: { friendAvatarId: string}) => {
    const myAvatarId = socket.data.avatarId.toString();

    const { friendAvatarId } = data;
    
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

  // Leave private chat room
  socket.on("leaveChat", (data: { friendAvatarId: string }) => {
    const myAvatarId = socket.data.avatarId.toString();

    const { friendAvatarId } = data;
    
    if (!friendAvatarId || !myAvatarId) return;
    
    const roomName = [myAvatarId, friendAvatarId].sort().join("_");
    
    socket.leave(roomName);
    chatRooms.get(roomName)?.delete(socket.id);
    
    console.log(`💬 ${myAvatarId} left chat room ${roomName}`);
  });

  // Send private message
  socket.on("sendPrivateMessage", async (data: { 
    receiverId: string; 
    content: string;
  }) => {
    const { receiverId, content } = data;

    if (!content || content.trim().length === 0) return;
    const userId = socket.data.userId.toString();
    const senderId = socket.data.avatarId.toString();
    if (!senderId || !receiverId) {
      socket.emit("messageError", { error: "Missing sender or receiver" });
      return;
    }
    try {
      const message = await sendMessage({
        userId: userId,
        friendAvatarId: receiverId,
        content: content.trim(),
      });

      if (!message) return;

      const senderAvatar = await getAvatarById({avatarId: senderId});

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

      const roomName = [senderId, receiverId].sort().join("_");
      io.to(roomName).emit("receiveMessage", messagePayload);

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
      console.log("Failed to send message:", err);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", (data: { 
    receiverId: string; 
    isTyping: boolean 
  }) => {
    const senderId = socket.data.avatarId.toString();

    const { receiverId, isTyping } = data;
    
    if (!receiverId || !senderId) return;
    
    const roomName = [senderId, receiverId].sort().join("_");
    
    socket.to(roomName).emit("partnerTyping", {
      avatarId: senderId,
      isTyping,
    });
  });

  // Mark messages as read
  socket.on("markAsRead", async (data: { 
    senderId: string  // ✅ Changed from receiverId to senderId
  }) => {
    const { senderId } = data;  // ✅ Use senderId
    const receiverId = socket.data.avatarId.toString();  // Current user is the receiver
    
    if (!senderId || !receiverId) return;
    
    try {
      await markMessagesRead({ senderId, receiverId });
      
      // Notify the SENDER that their messages were read by the RECEIVER
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { byAvatarId: receiverId });
      }
    } catch (err) {
      console.log("Failed to mark messages as read:", err);
    }
  });
  }
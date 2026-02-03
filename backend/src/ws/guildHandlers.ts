import { Socket, Server } from "socket.io";
import axios from "axios";

export function setupGuildHandlers(io: Server, socket: Socket) {
  // JOIN GUILD ROOM
  socket.on("joinGuild", (guildId: string) => {
    if (!guildId) return;

    const roomName = `guild_${guildId}`;
    if (!socket.rooms.has(roomName)) {
      socket.join(roomName);
      console.log(`👥 Socket ${socket.id} joined ${roomName}`);
    }
  });

  // SEND GUILD MESSAGE
  socket.on(
    "sendGuildMessage",
    async (payload: { guildId: string; message: any; token: string }) => {
      const { guildId, message, token } = payload;
      if (!guildId || !message || !token) return;

      try {
        const res = await axios.post(
          `http://localhost:25001/api/guildMessage/${guildId}/messages`,
          message,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        io.to(`guild_${guildId}`).emit("guildMessage", res.data);
      } catch (err) {
        console.error("ERROR SENDING GUILD MESSAGE:", err);
      }
    }
  );

  // GUILD UPDATES (UPDATE / DELETE / KICK)
  socket.on(
    "guildUpdate",
    async (payload: {
      guildId: string;
      token?: string;
      action?: "update" | "delete" | "kick";
      targetAvatarId?: string;
    }) => {
      const { guildId, token, action = "update", targetAvatarId } = payload;
      if (!guildId) return;

      try {
        if (action === "delete") {
          io.emit("guildUpdate", { _id: guildId, action: "delete" });
          console.log("📢 Broadcast guild deletion:", guildId);
        } else if (action === "kick") {
          if (!targetAvatarId) return;
          io.emit("guildUpdate", { _id: guildId, action: "kick", targetAvatarId });
          console.log("📢 Broadcast guild kick:", targetAvatarId, "from guild", guildId);
        } else {
          if (!token) return;
          const res = await axios.get(`http://localhost:25001/api/guild/${guildId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          io.emit("guildUpdate", res.data);
          console.log("📢 Broadcast guild update:", guildId);
        }
      } catch (err) {
        console.error("ERROR HANDLING guildUpdate:", err);
      }
    }
  );
}

import { Socket, Server } from "socket.io";
import * as GuildService from "../services/guild.service";
import * as GuildMessageService from "../services/guildMessage.service";

export function setupGuildHandlers(io: Server, socket: Socket) {
  // Join guild socket room
  socket.on("joinGuild", async (guildId: string) => {
    if (!guildId) return;

    try {
      const userId = socket.data.userId;
      if (!userId) throw new Error("Unauthorized");

      const isMember = await GuildService.isMember({
        userId,
        guildId
      });

      if (!isMember) {
        console.log(`❌ User ${userId} tried to join guild ${guildId} without permission`);
        return;
      }

      const roomName = `guild_${guildId}`;
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName);
        console.log(`👥 Socket ${socket.id} joined ${roomName}`);
      }
    } catch (err) {
      console.log("[joinGuild]", err);
    }
  });

  // Send Guild Message
  socket.on("sendGuildMessage", async (payload: { guildId: string; message: { text: string } }) => {
    const { guildId, message } = payload;
    if (!guildId || !message?.text) return;

    try {
      const userId = socket.data.userId;
      if (!userId) throw new Error("Unauthorized");

      const newMessage = await GuildMessageService.sendGuildMessage({
        userId,
        guildId,
        text: message.text,
      });

      io.to(`guild_${guildId}`).emit("guildMessage", newMessage);
    } catch (err) {
      console.log("[sendGuildMessage]", err);
    }
  });

  // Guild updates (update / delete / kick)
  socket.on(
    "guildUpdate",
    async (payload: {
      guildId: string;
      action?: "update" | "delete" | "kick";
      targetAvatarId?: string;
    }) => {
      const { guildId, action = "update", targetAvatarId } = payload;
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
          const guild = await GuildService.getGuildById(guildId);
          io.emit("guildUpdate", guild);
          console.log("📢 Broadcast guild update:", guildId);
        }
      } catch (err) {
        console.log("ERROR HANDLING guildUpdate:", err);
      }
    }
  );
}

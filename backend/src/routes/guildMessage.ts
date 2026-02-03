import { Router } from "express";
import { authMiddleware, AuthRequest } from "./auth";
import {IAvatar} from "../db/avatar"

import Guild from "../db/guild";
import User from "../db/user";
import GuildMessage from "../db/guildMessage";

const router = Router();

// GET GUILD MESSAGES
router.get("/:guildId/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { guildId } = req.params;

    const user = await User.findById(req.userId).populate("avatar");
    if (!user || !user.avatar) {
      return res.status(404).json({ message: "Avatar not found" });
    }

    const avatar = user.avatar;

    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ message: "Guild not found" });
    }

    const isMember = guild.members.some(m =>
      m.avatar.equals(avatar._id)
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this guild" });
    }

    const messages = await GuildMessage.find({ guild: guildId })
      .sort({ createdAt: 1 })
      .limit(50);

    return res.json(messages);
  } catch (err) {
    console.error("[GET /guild/:id/messages]", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// POST GUILD MESSAGE
router.post("/:guildId/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { guildId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const user = await User.findById(req.userId).populate("avatar");
    if (!user || !user.avatar) {
      return res.status(404).json({ message: "Avatar not found" });
    }

  const avatar = user.avatar as IAvatar;

    const guild = await Guild.findById(guildId);
    if (!guild) {
      return res.status(404).json({ message: "Guild not found" });
    }

    const isMember = guild.members.some(m =>
      m.avatar.equals(avatar._id)
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this guild" });
    }

    const message = await GuildMessage.create({
      guild: guild._id,
      sender: avatar._id,
      senderName: avatar.userName,
      text: text.trim(),
    });

    return res.status(201).json(message);
  } catch (err) {
    console.error("[POST /guild/:id/messages]", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;

import { Router } from "express";
import { authMiddleware, AuthRequest } from "./auth";
import * as GuildMessageService from "../services/guildMessage.service";

const router = Router();

// Get Guild Messages
router.get("/:guildId/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const messages = await GuildMessageService.getGuildMessages({
      userId: req.userId!,
      guildId,
    });

    return res.json(messages);
  } catch (err: any) {
    console.log("[GET /guild/:guildId/messages]", err);
    return res.status(400).json({ message: err.message || "Failed to fetch messages" });
  }
});

export default router;

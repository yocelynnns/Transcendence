import { Router } from "express";
import { authMiddleware, AuthRequest } from "./auth";

import * as ChatService from "../services/chat.service"

const router = Router();

// Get chat history with a friend
router.get("/:friendAvatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendAvatarId = Array.isArray(req.params.friendAvatarId)
      ? req.params.friendAvatarId[0]
      : req.params.friendAvatarId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await ChatService.getChatHistory({
      userId: req.userId,
      friendAvatarId,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.log("[GET /chat/:friendAvatarId]", err);

    switch (err.message) {
      case "INVALID_AVATAR_ID":
        return res.status(400).json({ message: "Invalid avatar ID" });
      case "AVATAR_NOT_FOUND":
        return res.status(404).json({ message: "Avatar not found" });
      case "FRIEND_NOT_FOUND":
        return res.status(404).json({ message: "Friend user not found" });
      case "NOT_FRIENDS":
        return res.status(403).json({ message: "Not friends with this user" });
      default:
        return res.status(500).json({ message: "Failed to fetch chat history" });
    }
  }
});


// Send message to a friend
router.post("/:friendAvatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendAvatarId = Array.isArray(req.params.friendAvatarId)
      ? req.params.friendAvatarId[0]
      : req.params.friendAvatarId;

    const { content } = req.body;

    const message = await ChatService.sendMessage({
      userId: req.userId,
      friendAvatarId,
      content,
    });

    return res.status(201).json({ message });
  } catch (err: any) {
    console.log("[POST /chat/:friendAvatarId]", err);

    switch (err.message) {
      case "INVALID_AVATAR_ID":
        return res.status(400).json({ message: "Invalid friend avatar ID" });
      case "AVATAR_NOT_FOUND":
        return res.status(404).json({ message: "Your avatar not found" });
      case "MESSAGE_REQUIRED":
        return res.status(400).json({ message: "Message content required" });
      default:
        return res.status(500).json({ message: "Failed to send message" });
    }
  }
});

// Get unread message count
router.get("/unread/count", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await ChatService.getUnreadMessageCount(req.userId);

    return res.status(200).json(result);
  } catch (err: any) {
    console.log("[GET /chat/unread/count]", err);

    if (err.message === "AVATAR_NOT_FOUND") {
      return res.status(404).json({ message: "Avatar not found" });
    }

    return res.status(500).json({ message: "Failed to fetch unread count" });
  }
});

export default router;
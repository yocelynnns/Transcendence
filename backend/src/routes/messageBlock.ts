import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "./auth";
import * as MessageBlockService from "../services/messageBlock.service";

const router = Router();

// Block messages from a specific friend
router.post(
  "/block-messages/:friendAvatarId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const friendAvatarId = Array.isArray(req.params.friendAvatarId)
        ? req.params.friendAvatarId[0]
        : req.params.friendAvatarId;

      const result = await MessageBlockService.blockMessagesFromFriend(
        req.userId,
        friendAvatarId
      );

      return res.status(201).json(result);
    } catch (err: unknown) {
      console.log("[POST /block-messages/:friendAvatarId]", err);

      const message = err instanceof Error ? err.message : "";

      switch (message) {
        case "AVATAR_NOT_FOUND":
          return res.status(404).json({ message: "Your avatar not found" });
        case "FRIEND_NOT_FOUND":
          return res.status(404).json({ message: "Friend not found" });
        case "CANNOT_BLOCK_SELF":
          return res.status(400).json({ message: "Cannot block yourself" });
        case "ALREADY_BLOCKED":
          return res.status(400).json({ message: "Already blocked" });
        default:
          return res.status(500).json({
            message: "Failed to block messages",
            error: message || "Unknown error",
          });
      }
    }
  }
);

// Unblock messages from a specific friend
router.delete(
  "/block-messages/:friendAvatarId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const friendAvatarId = Array.isArray(req.params.friendAvatarId)
        ? req.params.friendAvatarId[0]
        : req.params.friendAvatarId;

      const result = await MessageBlockService.unblockMessagesFromFriend(
        req.userId,
        friendAvatarId
      );

      return res.status(200).json(result);
    } catch (err: unknown) {
      console.log("[DELETE /block-messages/:friendAvatarId]", err);

      const message = err instanceof Error ? err.message : "";

      switch (message) {
        case "AVATAR_NOT_FOUND":
          return res.status(404).json({ message: "Your avatar not found" });
        case "NOT_BLOCKED":
          return res.status(400).json({ message: "Not blocked" });
        default:
          return res.status(500).json({
            message: "Failed to unblock messages",
            error: message || "Unknown error",
          });
      }
    }
  }
);

// Get list of friends whose messages are blocked
router.get(
  "/blocked-messages",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const blockedFriends =
        await MessageBlockService.getBlockedMessageFriends(req.userId);

      return res.status(200).json({
        count: blockedFriends.length,
        blockedFriends,
      });
    } catch (err: unknown) {
      console.log("[GET /blocked-messages]", err);

      const message = err instanceof Error ? err.message : "";

      if (message === "AVATAR_NOT_FOUND") {
        return res.status(404).json({ message: "Avatar not found" });
      }

      return res.status(500).json({
        message: "Failed to fetch blocked list",
        error: message || "Unknown error",
      });
    }
  }
);

export default router;

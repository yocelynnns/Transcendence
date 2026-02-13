import { Router, Response } from "express"; // Remove unused 'Request'
import { authMiddleware, AuthRequest } from "./auth";
import * as FriendService from "../services/friend.service";

const router = Router();

// Get all friends
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friends = await FriendService.getAllFriendsWithAvatars(req.userId);
    return res.json(friends);
  } catch (err: unknown) {
    console.log("[GET /friends]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(400).json({ message });
  }
});

// Get pending requests
router.get("/requests/pending", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await FriendService.getPendingRequests(req.userId);
    return res.json(requests);
  } catch (err: unknown) {
    console.log("[GET /friends/requests/pending]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(400).json({ message });
  }
});

// Send friend request
router.post("/request", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { friendEmail } = req.body;
    if (!friendEmail) {
      return res.status(400).json({ message: "Friend email is required" });
    }

    const result = await FriendService.sendFriendRequest({
      userId: req.userId,
      friendEmail,
    });

    return res.json(result);
  } catch (err: unknown) {
    console.log("[POST /friends/request]", err);
    const message = err instanceof Error ? err.message : "Failed to send request";
    return res.status(400).json({ message });
  }
});

// Accept friend request - FIX: Ensure requestId is string
router.post("/accept/:requestId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // FIX: Handle array case and ensure string type
    const requestId = Array.isArray(req.params.requestId) 
      ? req.params.requestId[0] 
      : req.params.requestId;

    const result = await FriendService.acceptFriendRequest({
      userId: req.userId,
      requestId,
    });

    return res.json(result);
  } catch (err: unknown) {
    console.log("[POST /friends/accept/:requestId]", err);
    const message = err instanceof Error ? err.message : "Failed to accept request";
    return res.status(400).json({ message });
  }
});

// Reject friend request - FIX: Ensure requestId is string
router.delete("/reject/:requestId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // FIX: Handle array case and ensure string type
    const requestId = Array.isArray(req.params.requestId) 
      ? req.params.requestId[0] 
      : req.params.requestId;

    await FriendService.rejectFriendRequest({
      userId: req.userId,
      requestId,
    });

    return res.status(204).send();
  } catch (err: unknown) {
    console.log("[DELETE /friends/reject/:requestId]", err);
    const message = err instanceof Error ? err.message : "Failed to reject request";
    return res.status(400).json({ message });
  }
});

// Remove friend - FIX: Ensure friendAvatarId is string
router.delete("/:friendAvatarId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // FIX: Handle array case and ensure string type
    const friendAvatarId = Array.isArray(req.params.friendAvatarId) 
      ? req.params.friendAvatarId[0] 
      : req.params.friendAvatarId;

    await FriendService.removeFriend({
      userId: req.userId,
      friendAvatarId,
    });

    return res.status(204).send();
  } catch (err: unknown) {
    console.log("[DELETE /friends/:friendAvatarId]", err);
    const message = err instanceof Error ? err.message : "Failed to remove friend";
    return res.status(400).json({ message });
  }
});

export default router;
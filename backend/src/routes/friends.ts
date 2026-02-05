import { Router } from "express";
import Friend from "../db/friend";
import { authMiddleware, AuthRequest } from "../routes/auth";

import * as FriendService from "../services/friend.service"

const router = Router();

// Send friend request
router.post("/request", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { friendEmail } = req.body;

    const result = await FriendService.sendFriendRequest({
      userId: req.userId,
      friendEmail,
    });

    return res.status(result.autoAccepted ? 200 : 201).json(result);
  } catch (err: any) {
    console.error("[POST /friends/request]", err);

    switch (err.message) {
      case "USER_NOT_FOUND":
        return res.status(404).json({ message: "User not found" });
      case "CANNOT_ADD_SELF":
        return res.status(400).json({ message: "Cannot add yourself as a friend" });
      case "ALREADY_FRIENDS":
        return res.status(400).json({ message: "Already friends" });
      case "REQUEST_ALREADY_SENT":
        return res.status(400).json({ message: "Friend request already sent" });
      case "USER_BLOCKED":
        return res.status(400).json({ message: "User is blocked" });
      default:
        return res.status(500).json({ message: "Failed to send friend request" });
    }
  }
});

// Accept friend request
router.post("/accept/:requestId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requestId = Array.isArray(req.params.requestId)
      ? req.params.requestId[0]
      : req.params.requestId;

    const result = await FriendService.acceptFriendRequest({
      userId: req.userId,
      requestId,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[POST /friends/accept]", err);

    switch (err.message) {
      case "INVALID_REQUEST_ID":
        return res.status(400).json({ message: "Invalid friend request ID" });
      case "FRIEND_REQUEST_NOT_FOUND":
        return res.status(404).json({ message: "Friend request not found" });
      default:
        return res.status(500).json({ message: "Failed to accept friend request" });
    }
  }
});

// Reject friend request
router.delete("/reject/:requestId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendRequest = await Friend.findOneAndDelete({
      _id: req.params.requestId,
      friendId: req.userId,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("[DELETE /friends/reject] error:", err);
    return res.status(500).json({ message: "Failed to reject friend request" });
  }
});

// Remove friend(Now accepts avatarId)
router.delete("/:friendAvatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friendAvatarId = Array.isArray(req.params.friendAvatarId)
      ? req.params.friendAvatarId[0]
      : req.params.friendAvatarId;

    await FriendService.removeFriend({
      userId: req.userId,
      friendAvatarId,
    });

    return res.status(200).json({ 
      message: "Friend removed",
      removedFriendAvatarId: friendAvatarId,
    });
  } catch (err: any) {
    console.error("[DELETE /friends/:friendAvatarId]", err);

    switch (err.message) {
      case "FRIEND_NOT_FOUND":
        return res.status(404).json({ message: "Friend not found" });
      default:
        return res.status(500).json({ message: "Failed to remove friend" });
    }
  }
});

// Get all user friends
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const friends = await FriendService.getAllFriendsWithAvatars(req.userId);

    return res.status(200).json(friends);
  } catch (err: any) {
    console.error("[GET /friends]", err);
    return res.status(500).json({ message: "Failed to get friends" });
  }
});

// Get pending friend request (Received)
router.get("/requests/pending", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const pendingRequests = await FriendService.getPendingRequests(req.userId);

    return res.status(200).json(pendingRequests);
  } catch (err: any) {
    console.error("[GET /friends/requests/pending]", err);
    return res.status(500).json({ message: "Failed to get friend requests" });
  }
});

export default router;
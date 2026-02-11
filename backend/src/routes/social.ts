import { Router } from "express";
import { authMiddleware, AuthRequest } from "./auth";

import * as SocialService from "../services/sosial.service";

const router = Router();

// Block a user
router.post("/block/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const blockedAvatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    await SocialService.blockUser({
      userId: req.userId,
      blockedAvatarId,
    });

    return res.status(201).json({ message: "User blocked" });
  } catch (err: any) {
    if (err.code === 11000 || err.message === "ALREADY_BLOCKED") {
      return res.status(400).json({ message: "Already blocked" });
    }
    if (err.message === "CANNOT_BLOCK_SELF") {
      return res.status(400).json({ message: "Cannot block yourself" });
    }
    if (err.message === "AVATAR_NOT_FOUND") {
      return res.status(404).json({ message: "Avatar not found" });
    }

    console.log("[POST /block/:avatarId] error:", err);
    return res.status(500).json({ message: "Failed to block user" });
  }
});

// Unblock a user
router.delete("/block/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const blockedAvatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    await SocialService.unblockUser({
      userId: req.userId,
      blockedAvatarId,
    });

    return res.status(200).json({ message: "User unblocked" });
  } catch (err: any) {
    if (err.message === "AVATAR_NOT_FOUND") {
      return res.status(404).json({ message: "Avatar not found" });
    }

    console.log("[DELETE /block/:avatarId] error:", err);
    return res.status(500).json({ message: "Failed to unblock user" });
  }
});

// Get blocked user list
router.get("/blocked", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const blockedUsers = await SocialService.getBlockedUsers(req.userId);

    return res.status(200).json(blockedUsers);
  } catch (err: any) {
    if (err.message === "AVATAR_NOT_FOUND") {
      return res.status(404).json({ message: "Avatar not found" });
    }

    console.log("[GET /blocked] error:", err);
    return res.status(500).json({ message: "Failed to fetch blocked users" });
  }
});

// Check if blocked (For chat)
router.get("/block/check/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const otherAvatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    const blockStatus = await SocialService.checkIfBlocked({
      userId: req.userId,
      otherAvatarId,
    });

    return res.status(200).json(blockStatus);
  } catch (err: any) {
    if (err.message === "AVATAR_NOT_FOUND") {
      return res.status(404).json({ message: "Avatar not found" });
    }

    console.log("[GET /block/check/:avatarId] error:", err);
    return res.status(500).json({ message: "Failed to check block status" });
  }
});

// Get public view (view another user's profile)
router.get("/profile/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const targetAvatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    const profileData = await SocialService.getPublicProfile({
      userId: req.userId,
      targetAvatarId,
    });

    return res.status(200).json(profileData);
  } catch (err: any) {
    if (err.message === "AVATAR_NOT_FOUND") {
      return res.status(404).json({ message: "Avatar not found" });
    }
    if (err.message === "PROFILE_BLOCKED") {
      return res.status(403).json({ message: "Cannot view this profile" });
    }
    if (err.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("[GET /profile/:avatarId] error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
});


export default router;
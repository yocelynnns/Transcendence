import { Router } from "express";
import Blocked from "../db/blocked";
import Avatar from "../db/avatar";
import User from "../db/user";
import Friend from "../db/friend";
import { authMiddleware, AuthRequest } from "./auth";

const router = Router();

// BLOCK A USER
router.post("/block/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const blockedAvatarId = Array.isArray(req.params.avatarId) 
      ? req.params.avatarId[0] 
      : req.params.avatarId;

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    const myAvatarId = currentUser.avatar.toString();

    // Can't block yourself
    if (myAvatarId === blockedAvatarId) {
      res.status(400).json({ message: "Cannot block yourself" });
      return;
    }

    // Remove from friends if they were friends
    const friendUser = await User.findOne({ avatar: blockedAvatarId });
    if (friendUser) {
      await Friend.deleteMany({
        $or: [
          { userId: req.userId, friendId: friendUser._id },
          { userId: friendUser._id, friendId: req.userId },
        ],
      });
    }

    // Create block
    await Blocked.create({
      blockerId: myAvatarId,
      blockedId: blockedAvatarId,
    });

    res.status(201).json({ message: "User blocked" });
    return;
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ message: "Already blocked" });
      return;
    }
    console.error("Block error:", err);
    res.status(500).json({ message: "Failed to block user" });
    return;
  }
});

// UNBLOCK A USER
router.delete("/block/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const blockedAvatarId = Array.isArray(req.params.avatarId) 
      ? req.params.avatarId[0] 
      : req.params.avatarId;

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    await Blocked.deleteOne({
      blockerId: currentUser.avatar.toString(),
      blockedId: blockedAvatarId,
    });

    res.status(200).json({ message: "User unblocked" });
    return;
  } catch (err) {
    console.error("Unblock error:", err);
    res.status(500).json({ message: "Failed to unblock user" });
    return;
  }
});

// GET BLOCKED USERS LIST
router.get("/blocked", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    const blocked = await Blocked.find({ blockerId: currentUser.avatar.toString() })
      .populate({
        path: "blockedId",
        model: "Avatar",
        select: "userName avatar characterOption",
      });

    res.status(200).json(blocked);
    return;
  } catch (err) {
    console.error("Get blocked error:", err);
    res.status(500).json({ message: "Failed to fetch blocked users" });
    return;
  }
});

// CHECK IF BLOCKED (for chat)
router.get("/block/check/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const otherAvatarId = Array.isArray(req.params.avatarId) 
      ? req.params.avatarId[0] 
      : req.params.avatarId;

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    const myAvatarId = currentUser.avatar.toString();

    // Check if either has blocked the other
    const blocked = await Blocked.findOne({
      $or: [
        { blockerId: myAvatarId, blockedId: otherAvatarId },
        { blockerId: otherAvatarId, blockedId: myAvatarId },
      ],
    });

    res.status(200).json({ 
      isBlocked: !!blocked,
      blockedBy: blocked ? blocked.blockerId : null 
    });
    return;
  } catch (err) {
    console.error("Check block error:", err);
    res.status(500).json({ message: "Failed to check block status" });
    return;
  }
});

// GET PUBLIC PROFILE (view another user's profile)
router.get("/profile/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const targetAvatarId = Array.isArray(req.params.avatarId) 
      ? req.params.avatarId[0] 
      : req.params.avatarId;

    const currentUser = await User.findById(req.userId);
    if (!currentUser?.avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    const myAvatarId = currentUser.avatar.toString();

    // Check if blocked
    const isBlocked = await Blocked.findOne({
      $or: [
        { blockerId: myAvatarId, blockedId: targetAvatarId },
        { blockerId: targetAvatarId, blockedId: myAvatarId },
      ],
    });

    if (isBlocked) {
      res.status(403).json({ message: "Cannot view this profile" });
      return;
    }

    // Get target avatar with limited fields (public info)
    const profile = await Avatar.findById(targetAvatarId)
      .select("userName avatar characterOption battleWin battleLoss raceWin raceLoss guild pokemonInventory")
      .populate("guild", "name image")
      .lean();

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    // Check friendship status
    const targetUser = await User.findOne({ avatar: targetAvatarId });
    let friendshipStatus = 'none';
    
    if (targetUser) {
      const friendRecord = await Friend.findOne({
        $or: [
          { userId: req.userId, friendId: targetUser._id },
          { userId: targetUser._id, friendId: req.userId },
        ],
        status: "accepted",
      });
      if (friendRecord) friendshipStatus = 'friend';
    }

    res.status(200).json({
      ...profile,
      friendshipStatus,
      isMe: myAvatarId === targetAvatarId,
    });
    return;
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
    return;
  }
});

export default router;
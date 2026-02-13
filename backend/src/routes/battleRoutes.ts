import express, { Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../routes/auth"; // Adjust path as needed
import * as BattleService from "../services/battle.service";
import MatchInvite from "../db/matchInvite";
import User from "../db/user";

const router = express.Router();

// Get a specific battle
router.get("/:battleId", async (req: Request, res: Response) => {
  try {
    const battleId = Array.isArray(req.params.battleId)
      ? req.params.battleId[0]
      : req.params.battleId;

    const battle = await BattleService.getBattle({ battleId });

    return res.json(battle);
  } catch (err: unknown) {
    console.log("[GET /battle/:battleId]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(400).json({ message });
  }
});

// NEW: Get pending battle invites for current user
router.get("/invites/pending", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get user's avatar
    const user = await User.findById(userId).populate('avatar');
    if (!user || !user.avatar) {
      res.json([]); // Return empty array if no avatar
      return;
    }

    const avatarId = user.avatar._id.toString();

    // Find pending invites from MatchInvite collection
    const pendingInvites = await MatchInvite.find({
      receiverId: avatarId,
      status: "pending",
      expiresAt: { $gt: new Date() } // Only non-expired invites
    });

    // Format the response
    const formattedInvites = await Promise.all(
      pendingInvites.map(async (invite) => {
        // Get sender avatar info
        const senderUser = await User.findOne({ avatar: invite.senderId }).populate('avatar');
        const senderAvatar = senderUser?.avatar as any;
        
        return {
          inviteId: invite._id.toString(),
          senderId: invite.senderId.toString(),
          senderName: senderAvatar?.userName || "Unknown",
          senderAvatar: senderAvatar?.avatar || "",
          createdAt: invite.createdAt
        };
      })
    );

    res.json(formattedInvites);
    return;
    
  } catch (err: unknown) {
    console.log("[GET /battle/invites/pending]", err);
    const message = err instanceof Error ? err.message : "Server error";
    res.status(500).json({ message });
    return;
  }
});

export default router;
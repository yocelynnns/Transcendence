import { Router } from "express";
import { authMiddleware, AuthRequest } from "../routes/auth";
import * as AvatarService from "../services/avatar.service";

const router = Router();

// Create avatar & link with user
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userName, avatar, characterOption } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newAvatar = await AvatarService.createAvatar({
      userId: req.userId!,
      userName,
      avatar,
      characterOption,
    });

    return res.status(201).json({ avatar: newAvatar });
  } catch (err: any) {
    console.error("[POST /avatar]", err);
    return res.status(400).json({ message: err.message || "Failed to create avatar" });
  }
});

// Get single avatar information
router.get("/:avatarId", async (req, res) => {
  try {
    const avatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    const avatar = await AvatarService.getAvatarById({ avatarId });

    return res.json(avatar);
  } catch (err: any) {
    console.error("[GET /avatar/:avatarId]", err);
    return res.status(400).json({ message: err.message || "Server error" });
  }
});

// Update single avatar information
router.put("/:avatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const avatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    const updatedAvatar = await AvatarService.updateAvatar({
      avatarId,
      data: req.body,
    });

    return res.json(updatedAvatar);
  } catch (err: any) {
    console.error("[PUT /avatar/:avatarId]", err);
    return res.status(400).json({ message: err.message || "Failed to update avatar" });
  }
});

export default router;

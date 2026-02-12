import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../routes/auth";
import * as AvatarService from "../services/avatar.service";

const router = Router();

// Create avatar & link with user
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userName, avatar, characterOption } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newAvatar = await AvatarService.createAvatar({
      userId: req.userId,
      userName,
      avatar,
      characterOption,
    });

    return res.status(201).json({ avatar: newAvatar });
  } catch (err: unknown) {
    console.log("[POST /avatar]", err);

    const message =
      err instanceof Error ? err.message : "Failed to create avatar";

    return res.status(400).json({ message });
  }
});

// Get single avatar information
router.get("/:avatarId", async (req: Request, res: Response) => {
  try {
    const avatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    const avatar = await AvatarService.getAvatarById({ avatarId });

    return res.json(avatar);
  } catch (err: unknown) {
    console.log("[GET /avatar/:avatarId]", err);

    const message =
      err instanceof Error ? err.message : "Server error";

    return res.status(400).json({ message });
  }
});

// Update single avatar information
router.put("/:avatarId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const avatarId = Array.isArray(req.params.avatarId)
      ? req.params.avatarId[0]
      : req.params.avatarId;

    const updatedAvatar = await AvatarService.updateAvatar({
      avatarId,
      data: req.body,
    });

    return res.json(updatedAvatar);
  } catch (err: unknown) {
    console.log("[PUT /avatar/:avatarId]", err);

    const message =
      err instanceof Error ? err.message : "Failed to update avatar";

    return res.status(400).json({ message });
  }
});

export default router;

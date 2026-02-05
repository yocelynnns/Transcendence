import { Router } from "express";
import { authMiddleware, AuthRequest } from "./auth";

import * as GuildService from "../services/guild.service";

const router = Router();

// Create Guild
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, image } = req.body;
    const newGuild = await GuildService.createGuild({
      userId: req.userId!,
      name,
      description,
      image,
    });
    return res.status(201).json(newGuild);
  } catch (err: any) {
    console.error("[POST /guild]", err);
    return res.status(400).json({ message: err.message || "Failed to create guild" });
  }
});

// Update Guild
router.put("/:guildId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, image } = req.body;

    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.updateGuild({
      userId: req.userId!,
      guildId: guildId,
      name,
      description,
      image,
    });

    return res.json({ message: "Guild updated successfully", guild });
  } catch (err: any) {
    console.error("[PUT /guild/:guildId]", err);
    return res.status(400).json({ message: err.message || "Failed to update guild" });
  }
});

// Join Guild
router.post("/:guildId/join", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.joinGuild({
      userId: req.userId!,
      guildId,
    });

    return res.json({ message: "Joined guild", guild });
  } catch (err: any) {
    console.error("[POST /guild/:guildId/join]", err);
    return res.status(400).json({ message: err.message || "Failed to join guild" });
  }
});

// leave Guild
router.post("/:guildId/leave", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.leaveGuild({
      userId: req.userId!,
      guildId,
    });

    return res.json({ message: "Left guild successfully", guild });
  } catch (err: any) {
    console.error("[POST /guild/:guildId/leave]", err);
    return res.status(400).json({ message: err.message || "Failed to leave guild" });
  }
});

// Kick Member
router.post("/:guildId/kick/:targetAvatarId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guildId = Array.isArray(req.params.guildId) ? req.params.guildId[0] : req.params.guildId;
    const targetAvatarId = Array.isArray(req.params.targetAvatarId)
      ? req.params.targetAvatarId[0]
      : req.params.targetAvatarId;

    const kickedAvatarId = await GuildService.kickMember({
      userId: req.userId!,
      guildId,
      targetAvatarId,
    });

    return res.json({ message: "Member kicked successfully", kickedAvatarId });
  } catch (err: any) {
    console.error("[POST /guild/:guildId/kick/:targetAvatarId]", err);
    return res.status(400).json({ message: err.message || "Failed to kick member" });
  }
});

// Search All Guild
router.get("/", async (_req, res) => {
  try {
    const guilds = await GuildService.getAllGuilds();
    return res.json(guilds);
  } catch (err: any) {
    console.error("[GET /guild]", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to get guilds" });
  }
});

// Get Single Guild
router.get("/:guildId", async (req, res) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.getGuildById(guildId);
    return res.json(guild);
  } catch (err: any) {
    console.error("[GET /guild/:guildId]", err);
    return res.status(400).json({ message: err.message || "Failed to get guild" });
  }
});

// Delete Guild
router.delete("/:guildId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    await GuildService.deleteGuild({
      userId: req.userId!,
      guildId,
    });

    return res.json({ message: "Guild deleted successfully" });
  } catch (err: any) {
    console.error("[DELETE /guild/:guildId]", err);
    return res.status(400).json({ message: err.message || "Failed to delete guild" });
  }
});

// Promote Member -> Co-leader
router.post(
  "/:guildId/promote/:targetAvatarId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const guildId = Array.isArray(req.params.guildId)
        ? req.params.guildId[0]
        : req.params.guildId;

      const targetAvatarId = Array.isArray(req.params.targetAvatarId)
        ? req.params.targetAvatarId[0]
        : req.params.targetAvatarId;

      const guild = await GuildService.promoteToCoLeader({
        userId: req.userId!,
        guildId,
        targetAvatarId,
      });

      return res.json({ message: "Member promoted to co-leader", guild });
    } catch (err: any) {
      console.error("[POST /guild/:guildId/promote/:targetAvatarId]", err);
      return res.status(400).json({ message: err.message || "Failed to promote member" });
    }
  }
);

// Demote Co-leader -> Member
router.post(
  "/:guildId/demote/:targetAvatarId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const guildId = Array.isArray(req.params.guildId)
        ? req.params.guildId[0]
        : req.params.guildId;

      const targetAvatarId = Array.isArray(req.params.targetAvatarId)
        ? req.params.targetAvatarId[0]
        : req.params.targetAvatarId;

      const guild = await GuildService.demoteCoLeader({
        userId: req.userId!,
        guildId,
        targetAvatarId,
      });

      return res.json({ message: "Co-leader demoted to member", guild });
    } catch (err: any) {
      console.error("[POST /guild/:guildId/demote/:targetAvatarId]", err);
      return res.status(400).json({ message: err.message || "Failed to demote co-leader" });
    }
  }
);

export default router;
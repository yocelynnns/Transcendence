import { Router, Response, Request } from "express";
import { authMiddleware, AuthRequest } from "./auth";
import * as GuildService from "../services/guild.service";

const router = Router();

// Create Guild
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image } = req.body;

    const newGuild = await GuildService.createGuild({
      userId: req.userId!,
      name,
      description,
      image,
    });

    return res.status(201).json(newGuild);
  } catch (err: unknown) {
    console.log("[POST /guild]", err);
    const message = err instanceof Error ? err.message : "Failed to create guild";
    return res.status(400).json({ message });
  }
});

// Update Guild
router.put("/:guildId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image } = req.body;

    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.updateGuild({
      userId: req.userId!,
      guildId,
      name,
      description,
      image,
    });

    return res.json({ message: "Guild updated successfully", guild });
  } catch (err: unknown) {
    console.log("[PUT /guild/:guildId]", err);
    const message = err instanceof Error ? err.message : "Failed to update guild";
    return res.status(400).json({ message });
  }
});

// Join Guild
router.post("/:guildId/join", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.joinGuild({
      userId: req.userId!,
      guildId,
    });

    return res.json({ message: "Joined guild", guild });
  } catch (err: unknown) {
    console.log("[POST /guild/:guildId/join]", err);
    const message = err instanceof Error ? err.message : "Failed to join guild";
    return res.status(400).json({ message });
  }
});

// Leave Guild
router.post("/:guildId/leave", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.leaveGuild({
      userId: req.userId!,
      guildId,
    });

    return res.json({ message: "Left guild successfully", guild });
  } catch (err: unknown) {
    console.log("[POST /guild/:guildId/leave]", err);
    const message = err instanceof Error ? err.message : "Failed to leave guild";
    return res.status(400).json({ message });
  }
});

// Kick Member
router.post("/:guildId/kick/:targetAvatarId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const targetAvatarId = Array.isArray(req.params.targetAvatarId)
      ? req.params.targetAvatarId[0]
      : req.params.targetAvatarId;

    const kickedAvatarId = await GuildService.kickMember({
      userId: req.userId!,
      guildId,
      targetAvatarId,
    });

    return res.json({ message: "Member kicked successfully", kickedAvatarId });
  } catch (err: unknown) {
    console.log("[POST /guild/:guildId/kick/:targetAvatarId]", err);
    const message = err instanceof Error ? err.message : "Failed to kick member";
    return res.status(400).json({ message });
  }
});

// Search All Guilds
router.get("/", async (_req: Request, res: Response) => {
  try {
    const guilds = await GuildService.getAllGuilds();
    return res.json(guilds);
  } catch (err: unknown) {
    console.log("[GET /guild]", err);
    const message = err instanceof Error ? err.message : "Failed to get guilds";
    return res.status(500).json({ message });
  }
});

// Get Single Guild
router.get("/:guildId", async (req: Request, res: Response) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    const guild = await GuildService.getGuildById(guildId);
    return res.json(guild);
  } catch (err: unknown) {
    console.log("[GET /guild/:guildId]", err);
    const message = err instanceof Error ? err.message : "Failed to get guild";
    return res.status(400).json({ message });
  }
});

// Delete Guild
router.delete("/:guildId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const guildId = Array.isArray(req.params.guildId)
      ? req.params.guildId[0]
      : req.params.guildId;

    await GuildService.deleteGuild({
      userId: req.userId!,
      guildId,
    });

    return res.json({ message: "Guild deleted successfully" });
  } catch (err: unknown) {
    console.log("[DELETE /guild/:guildId]", err);
    const message = err instanceof Error ? err.message : "Failed to delete guild";
    return res.status(400).json({ message });
  }
});

// Promote Member
router.post("/:guildId/promote/:targetAvatarId", authMiddleware, async (req: AuthRequest, res: Response) => {
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
  } catch (err: unknown) {
    console.log("[POST /guild/:guildId/promote/:targetAvatarId]", err);
    const message = err instanceof Error ? err.message : "Failed to promote member";
    return res.status(400).json({ message });
  }
});

// Demote Co-leader
router.post("/:guildId/demote/:targetAvatarId", authMiddleware, async (req: AuthRequest, res: Response) => {
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
  } catch (err: unknown) {
    console.log("[POST /guild/:guildId/demote/:targetAvatarId]", err);
    const message = err instanceof Error ? err.message : "Failed to demote co-leader";
    return res.status(400).json({ message });
  }
});

export default router;

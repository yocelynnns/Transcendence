import { Router } from "express";
import Guild from "../db/guild";
import User from "../db/user";
import { IAvatar } from "../db/avatar";
import { authMiddleware, AuthRequest } from "./auth";

const router = Router();

// CREATE GUILD
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, image } = req.body;
    const user = await User.findById(req.userId).populate<{ avatar: IAvatar }>("avatar");
    if (!user || !user.avatar)
      return res.status(400).json({ message: "User must have an avatar to create a guild" });

    const avatar = user.avatar;

    const newGuild = await Guild.create({
      name,
      description: description || "",
      image: image || "",
      members: [{ avatar: avatar._id, role: "leader" }],
    });

    avatar.guild = newGuild._id;
    await avatar.save();

    return res.status(201).json(newGuild);
  } catch (err: any) {
    console.error("[POST /guild]", err);
    return res.status(500).json({ message: err.message || "Failed to create guild" });
  }
});

// UPDATE GUILD
router.put("/:guildId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, image } = req.body;

    const user = await User.findById(req.userId).populate<{ avatar: IAvatar }>("avatar");
    if (!user || !user.avatar) {
      return res.status(400).json({ message: "User must have an avatar to update a guild" });
    }

    const avatar = user.avatar;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) {
      return res.status(404).json({ message: "Guild not found" });
    }

    const member = guild.members.find((m) => m.avatar.equals(avatar._id));
    if (!member || member.role !== "leader") {
      return res.status(403).json({ message: "Only the guild leader can update the guild" });
    }

    if (name) guild.name = name;
    if (description) guild.description = description;
    if (image) guild.image = image;

    await guild.save();

    return res.json({ message: "Guild updated successfully", guild });
  } catch (err: unknown) {
    console.error("[PUT /guild/:guildId]", err);
    if (err instanceof Error) return res.status(500).json({ message: err.message });
    return res.status(500).json({ message: "Failed to update guild" });
  }
});

// JOIN GUILD
router.post("/:guildId/join", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).populate<{ avatar: IAvatar }>("avatar");
    if (!user || !user.avatar)
      return res.status(400).json({ message: "User must have an avatar to join a guild" });

    const avatar = user.avatar;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ message: "Guild not found" });

    if (guild.members.some((m) => m.avatar.equals(avatar._id)))
      return res.status(400).json({ message: "Already a member of this guild" });

    guild.members.push({ avatar: avatar._id, role: "member" });
    await guild.save();

    avatar.guild = guild._id;
    await avatar.save();

    return res.json({ message: "Joined guild", guild });
  } catch (err: any) {
    console.error("[POST /guild/:guildId/join]", err);
    return res.status(500).json({ message: err.message || "Failed to join guild" });
  }
});

// LEAVE GUILD
router.post("/:guildId/leave", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).populate<{ avatar: IAvatar }>("avatar");
    if (!user || !user.avatar || !user.avatar.guild) {
      return res.status(400).json({ message: "You are not in any guild" });
    }

    const avatar = user.avatar;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) {
      return res.status(404).json({ message: "Guild not found" });
    }

    if (guild._id.toString() !== avatar.guild?.toString()) {
      return res.status(400).json({ message: "You are not a member of this guild" });
    }

    const member = guild.members.find((m) => m.avatar.equals(avatar._id));
    if (!member) {
      return res.status(400).json({ message: "Member not found in guild" });
    }

    if (member.role === "leader") {
      return res.status(403).json({ message: "Guild leader cannot leave the guild" });
    }

    guild.members = guild.members.filter((m) => !m.avatar.equals(avatar._id));
    await guild.save();

    avatar.guild = undefined;
    await avatar.save();

    return res.json({ message: "Left guild successfully", guild });
  } catch (err: unknown) {
    console.error("[POST /guild/:guildId/leave]", err);

    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }

    return res.status(500).json({ message: "Failed to leave guild" });
  }
});

// KICK MEMBER
router.post(
  "/:guildId/kick/:targetAvatarId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { guildId } = req.params;

      const targetAvatarId = String(req.params.targetAvatarId);

      const user = await User.findById(req.userId).populate<{ avatar: IAvatar }>("avatar");
      if (!user || !user.avatar) {
        return res.status(400).json({ message: "User must have an avatar" });
      }

      const leaderAvatar = user.avatar;

      const guild = await Guild.findById(guildId);
      if (!guild) {
        return res.status(404).json({ message: "Guild not found" });
      }

      const leaderMember = guild.members.find((m) =>
        m.avatar.equals(leaderAvatar._id)
      );

      if (!leaderMember || leaderMember.role !== "leader") {
        return res.status(403).json({ message: "Only leader can kick members" });
      }

      if (leaderAvatar._id.equals(targetAvatarId)) {
        return res.status(400).json({ message: "Leader cannot kick themselves" });
      }

      const targetMember = guild.members.find((m) =>
        m.avatar.equals(targetAvatarId)
      );

      if (!targetMember) {
        return res.status(404).json({ message: "Target is not in this guild" });
      }

      if (targetMember.role === "leader") {
        return res.status(403).json({ message: "Cannot kick another leader" });
      }

      guild.members = guild.members.filter(
        (m) => !m.avatar.equals(targetAvatarId)
      );
      await guild.save();

      const targetAvatar = await (await import("../db/avatar")).default.findById(
        targetAvatarId
      );

      if (targetAvatar) {
        targetAvatar.guild = undefined;
        await targetAvatar.save();
      }

      return res.json({
        message: "Member kicked successfully",
        kickedAvatarId: targetAvatarId,
      });
    } catch (err: unknown) {
      console.error("[POST /guild/:guildId/kick/:targetAvatarId]", err);

      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }

      return res.status(500).json({ message: "Failed to kick member" });
    }
  }
);

// SEARCH ALL GUILD
router.get("/", async (_req, res) => {
  try {
    const guilds = await Guild.find({})
      .select("name description image members")
      .populate({
        path: "members.avatar",
        select: "userName",
      })
      .lean();

    return res.json(guilds);
  } catch (err: any) {
    console.error("[GET /guild]", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to get guilds" });
  }
});

// GET SINGLE GUILD
router.get("/:guildId", async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.guildId).populate({
      path: "members.avatar",
      select: "userName avatar characterOption",
    });

    if (!guild) return res.status(404).json({ message: "Guild not found" });

    return res.json(guild);
  } catch (err: any) {
    console.error("[GET /guild/:guildId]", err);
    return res.status(500).json({ message: err.message || "Failed to get guild" });
  }
});

// DELETE GUILD
router.delete("/:guildId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).populate<{ avatar: IAvatar }>("avatar");
    if (!user || !user.avatar) {
      return res.status(400).json({ message: "User must have an avatar to delete a guild" });
    }

    const avatar = user.avatar;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) {
      return res.status(404).json({ message: "Guild not found" });
    }

    const member = guild.members.find((m) => m.avatar.equals(avatar._id));
    if (!member || member.role !== "leader") {
      return res.status(403).json({ message: "Only the guild leader can delete the guild" });
    }

    await Guild.findByIdAndDelete(guild._id);

    return res.json({ message: "Guild deleted successfully" });
  } catch (err: unknown) {
    console.error("[DELETE /guild/:guildId]", err);
    if (err instanceof Error) return res.status(500).json({ message: err.message });
    return res.status(500).json({ message: "Failed to delete guild" });
  }
});

export default router;

import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import PlayerTeam from "../models/PlayerTeam.js";

const router = express.Router();
const TEAM_SIZE = 3;

// GET /players/:playerId/team
router.get("/:playerId/team", async (req: Request, res: Response) => {
  try {
    const playerIdStr = req.params.playerId; // string | undefined (typing)
    if (!playerIdStr) {
      return res.status(400).json({ error: "playerId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(playerIdStr)) {
      return res.status(400).json({ error: "Invalid playerId" });
    }

    const playerId = new mongoose.Types.ObjectId(playerIdStr);

    const team = await PlayerTeam.find({ playerId })
      .sort({ slot: 1 })
      .populate("pokemonId");

    return res.json(team);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch player team" });
  }
});

// PUT /players/:playerId/team/:slot
// body: { pokemonId: "..." }
router.put("/:playerId/team/:slot", async (req: Request, res: Response) => {
  try {
    const playerIdStr = req.params.playerId;
    const slotStr = req.params.slot;

    if (!playerIdStr) {
      return res.status(400).json({ error: "playerId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(playerIdStr)) {
      return res.status(400).json({ error: "Invalid playerId" });
    }

    const slotNum = Number(slotStr);
    if (!Number.isInteger(slotNum) || slotNum < 1 || slotNum > TEAM_SIZE) {
      return res.status(400).json({ error: `Slot must be 1..${TEAM_SIZE}` });
    }

    const { pokemonId: pokemonIdStr } = req.body as { pokemonId?: string };
    if (!pokemonIdStr) {
      return res.status(400).json({ error: "pokemonId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(pokemonIdStr)) {
      return res.status(400).json({ error: "Invalid pokemonId" });
    }

    const playerId = new mongoose.Types.ObjectId(playerIdStr);
    const pokemonId = new mongoose.Types.ObjectId(pokemonIdStr);

    const updated = await PlayerTeam.findOneAndUpdate(
      { playerId, slot: slotNum },
      { $set: { pokemonId } },
      { upsert: true, new: true }
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update team slot" });
  }
});

export default router;

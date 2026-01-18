import { Router } from "express";
import PlayerPokemonStats from "../models/PlayerPokemonStats.js";

const router = Router();

// POST /stats/use
// body: { playerId, pokemonId, mode: "battle" | "race" }
router.post("/use", async (req, res) => {
  try {
    const { playerId, pokemonId, mode } = req.body;

    const inc: any = { usageTotalNum: 1 };
    if (mode === "battle") inc.usageBattleNum = 1;
    if (mode === "race") inc.raceUsageNum = 1;

    const stats = await PlayerPokemonStats.findOneAndUpdate(
      { playerId, pokemonId },
      { $inc: inc },
      { upsert: true, new: true }
    );

    res.json(stats);
  } catch {
    res.status(500).json({ error: "Failed to update stats" });
  }
});

export default router;

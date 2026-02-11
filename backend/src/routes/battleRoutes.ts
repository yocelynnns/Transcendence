import express from "express";
import * as BattleService from "../services/battle.service";

const router = express.Router();

// Get a specific battle
router.get("/:battleId", async (req, res) => {
  try {
    const battleId = Array.isArray(req.params.battleId)
      ? req.params.battleId[0]
      : req.params.battleId;

    const battle = await BattleService.getBattle({ battleId });

    return res.json(battle);
  } catch (err: any) {
    console.log("[GET /battle/:battleId]", err);
    return res.status(400).json({ message: err.message || "Server error" });
  }
});

export default router;


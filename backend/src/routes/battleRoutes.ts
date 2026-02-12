import express, { Request, Response } from "express";
import * as BattleService from "../services/battle.service";

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

    const message =
      err instanceof Error ? err.message : "Server error";

    return res.status(400).json({ message });
  }
});

export default router;

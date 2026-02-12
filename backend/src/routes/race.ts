import { Router, Request, Response } from "express";
import RaceMatch from "../db/raceMatch";
import Avatar from "../db/avatar";

const router = Router();

// GET /api/race/avatar/:avatarId
router.get(
  "/avatar/:avatarId",
  async (req: Request<{ avatarId: string }>, res: Response) => {
    try {
      const { avatarId } = req.params;

      const avatar = await Avatar.findById(avatarId).select("userName");

      if (!avatar) {
        return res.status(404).json({ error: "Avatar not found" });
      }

      return res.json({
        _id: avatar._id,
        userName: avatar.userName,
      });
    } catch (error: unknown) {
      console.log("Error fetching avatar:", error);
      return res.status(500).json({ error: "Failed to fetch avatar" });
    }
  }
);

// GET /api/race/history/:avatarId
router.get(
  "/history/:avatarId",
  async (req: Request<{ avatarId: string }>, res: Response) => {
    try {
      const { avatarId } = req.params;

      const matches = await RaceMatch.find({
        players: avatarId,
      })
        .populate("players", "userName")
        .populate("winner", "userName")
        .sort({ createdAt: -1 })
        .limit(5);

      const formattedMatches = matches.map((match) => {
        const players = match.players as unknown as Array<{ userName: string }>;
        const winner = match.winner as unknown as { userName: string };

        const player1Name = players[0]?.userName ?? "Unknown";
        const player2Name = players[1]?.userName ?? "Unknown";

        return {
          _id: match._id.toString(),
          player1: player1Name,
          player2: player2Name,
          winner: winner.userName,
          date: match.createdAt.toISOString().split("T")[0],
        };
      });

      return res.json(formattedMatches);
    } catch (error: unknown) {
      console.log("❌ Error fetching race history:", error);
      return res.status(500).json({ error: "Failed to fetch race history" });
    }
  }
);

// GET /api/race/stats/:avatarId
router.get(
  "/stats/:avatarId",
  async (req: Request<{ avatarId: string }>, res: Response) => {
    try {
      const { avatarId } = req.params;

      const avatar = await Avatar.findById(avatarId);

      if (!avatar) {
        return res.status(404).json({ error: "Avatar not found" });
      }

      const totalRaces = avatar.raceWin + avatar.raceLoss;

      return res.json({
        wins: avatar.raceWin,
        losses: avatar.raceLoss,
        totalRaces,
        winRate:
          totalRaces > 0
            ? ((avatar.raceWin / totalRaces) * 100).toFixed(1)
            : 0,
      });
    } catch (error: unknown) {
      console.log("Error fetching race stats:", error);
      return res.status(500).json({ error: "Failed to fetch race stats" });
    }
  }
);

// GET /api/race/leaderboard
router.get(
  "/leaderboard",
  async (_req: Request, res: Response) => {
    try {
      const topPlayers = await Avatar.find({ raceWin: { $gt: 0 } })
        .select("userName raceWin raceLoss")
        .sort({ raceWin: -1 })
        .limit(3);

      const leaderboard = topPlayers.map((player, index) => ({
        rank: index + 1,
        userName: player.userName,
        wins: player.raceWin,
        losses: player.raceLoss,
        totalRaces: player.raceWin + player.raceLoss,
      }));

      return res.json(leaderboard);
    } catch (error: unknown) {
      console.log("Error fetching leaderboard:", error);
      return res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  }
);

export default router;

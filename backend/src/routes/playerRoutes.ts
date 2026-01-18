import express from "express";
import type { Request, Response } from "express";
import Player from "../models/Player.js";

const router = express.Router();

// Get all players
router.get("/", async (_req: Request, res: Response) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch {
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

// Get player by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const player = await Player.findById(req.params.id).populate("pokemons");
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch {
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

// Create a new player
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, password, avatarUrl } = req.body;

    const newPlayer = new Player({
      username,
      password,
      avatarUrl,
    });

    await newPlayer.save();
    res.status(201).json(newPlayer);
  } catch {
    res.status(500).json({ error: "Failed to create player" });
  }
});

export default router;

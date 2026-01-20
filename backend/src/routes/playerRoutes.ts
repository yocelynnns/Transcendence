import express from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import Player from "../models/Player.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const router = express.Router();
const SALT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET || "this-is-the-fallback-key-so-add-JWTSECRET-into-env";


// Get all players
router.get("/", async (_req: Request, res: Response) => {
  try {
    const players = await Player.find().populate("pokemons").select("-password");
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

// Get player by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate("pokemons")
      .select("-password");
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

// Create a new player (registration)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email and password are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newPlayer = new Player({
      username,
      email,
      password: hashedPassword,
    });

    await newPlayer.save();

    // Do not return password
    const { password: _, ...safePlayer } = newPlayer.toObject();
    res.status(201).json(safePlayer);
  } catch (err) {
    res.status(500).json({ error: "Failed to create player" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const player = await Player.findOne({ username });
    if (!player) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, player.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: player._id.toString() },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...safePlayer } = player.toObject();
    res.json({ token, user: safePlayer });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user profile (protected)
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const player = await Player.findById(req.userId)
      .populate("pokemons")
      .select("-password");
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;

import express from "express";
import type { Request, Response } from "express"; // type-only import
import Pokemon from "../models/Pokemon.js";        // <-- add .js for ESM

const router = express.Router();

// Get all Pokémon
router.get("/", async (_req: Request, res: Response) => {
  try {
    const pokemons = await Pokemon.find().populate("owner");
    res.json(pokemons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

// Get Pokémon by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id).populate("owner");
    if (!pokemon) return res.status(404).json({ error: "Pokemon not found" });
    res.json(pokemon);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

// Create a new Pokémon
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, type, level, hp } = req.body;
    const newPokemon = new Pokemon({ name, type, level, hp });
    await newPokemon.save();
    res.status(201).json(newPokemon);
  } catch (err) {
    res.status(500).json({ error: "Failed to create Pokémon" });
  }
});

export default router;

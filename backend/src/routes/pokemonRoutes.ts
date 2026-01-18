import express from "express";
import type { Request, Response } from "express";
import Pokemon from "../models/Pokemon.js";

const router = express.Router();

// Get all Pokémon
router.get("/", async (_req: Request, res: Response) => {
  try {
    const pokemons = await Pokemon.find();
    res.json(pokemons);
  } catch {
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

// Get Pokémon by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const pokemon = await Pokemon.findById(req.params.id);
    if (!pokemon) return res.status(404).json({ error: "Pokemon not found" });
    res.json(pokemon);
  } catch {
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

// Create a new Pokémon (optional)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, type, is_shiny, hp, attack } = req.body;
    const newPokemon = new Pokemon({ name, type, is_shiny, hp, attack });
    await newPokemon.save();
    res.status(201).json(newPokemon);
  } catch {
    res.status(500).json({ error: "Failed to create Pokémon" });
  }
});

export default router;

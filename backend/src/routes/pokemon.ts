import { Router, Request, Response } from "express";
import * as PokemonService from "../services/pokemon.service";

const router = Router();

// Fetch available Pokemon
router.get("/", async (_req: Request, res: Response) => {
  try {
    const pokemons = await PokemonService.fetchAvailablePokemon({ limit: 50 });
    return res.json(pokemons);
  } catch (err: unknown) {
    console.log("[GET /pokemon]", err);

    const message =
      err instanceof Error ? err.message : "Server error";

    return res.status(500).json({ message });
  }
});

// GET single pokemon by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
      
    const pokemon = await PokemonService.fetchPokemonById(id);

    if (!pokemon) {
      return res.status(404).json({ message: "Pokemon not found" });
    }

    return res.json(pokemon);
  } catch (err: unknown) {
    console.log("[GET /pokemon/:id]", err);

    const message =
      err instanceof Error ? err.message : "Server error";

    return res.status(500).json({ message });
  }
});

export default router;

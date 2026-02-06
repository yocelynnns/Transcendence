import { Router} from "express";
import * as PokemonService from "../services/pokemon.service";

const router = Router();

// Fetch available Pokémon
router.get("/", async (_req, res) => {
  try {
    const pokemons = await PokemonService.fetchAvailablePokemon({ limit: 50 });
    return res.json(pokemons);
  } catch (err: any) {
    console.error("[GET /pokemon]", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;

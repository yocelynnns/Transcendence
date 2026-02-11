import { Router} from "express";
import * as PokemonService from "../services/pokemon.service";

const router = Router();

// Fetch available Pokemon
router.get("/", async (_req, res) => {
  try {
    const pokemons = await PokemonService.fetchAvailablePokemon({ limit: 50 });
    return res.json(pokemons);
  } catch (err: any) {
    console.log("[GET /pokemon]", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

/// GET single pokemon by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pokemon = await PokemonService.fetchPokemonById(id);

    if (!pokemon) {
      return res.status(404).json({ message: "Pokemon not found" });
    }

    return res.json(pokemon);

  } catch (err: any) {
    console.log("[GET /pokemon/:id]", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;

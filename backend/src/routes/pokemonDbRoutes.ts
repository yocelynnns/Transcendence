import express from "express";
import PokemonBattle from "../db/pokemonBattle";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const pokemons = await PokemonBattle.find().lean();
    res.json(pokemons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

export default router;

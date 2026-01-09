import express from "express";
import Pokemon from "../models/Pokemon.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pokemons = await Pokemon.find().lean();
    res.json(pokemons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

export default router;

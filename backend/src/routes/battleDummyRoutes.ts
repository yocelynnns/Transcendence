import express from "express";
import Pokemon from "../models/Pokemon.js";
import Battle from "../models/Battle.js"; // <-- import Battle model

const router = express.Router();

// Route to get all Pokémon (you already have this)
router.get("/pokemons", async (req, res) => {
  try {
    const pokemons = await Pokemon.find().lean();
    res.json(pokemons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Pokémon" });
  }
});

// Route to get a dummy battle
router.get("/battleDummy", async (req, res) => {
  try {
    const dummyBattle = {
      player1: {
        playerId: null, // no real player
        team: [
          { pokemonId: null, name: "TOGEPI", type: "Fairy", attack: 5, maxHp: 10, currentHp: 10, isDead: false },
          { pokemonId: null, name: "SHINY TOGEPI", type: "Fairy", attack: 6, maxHp: 12, currentHp: 12, isDead: false },
          { pokemonId: null, name: "SLOWPOKE", type: "Water/Psychic", attack: 7, maxHp: 15, currentHp: 15, isDead: false },
        ],
      },
      player2: {
        playerId: null,
        team: [
          { pokemonId: null, name: "CLEFFA", type: "Fairy", attack: 5, maxHp: 10, currentHp: 10, isDead: false },
          { pokemonId: null, name: "SHINY CLEFFA", type: "Fairy", attack: 6, maxHp: 12, currentHp: 12, isDead: false },
          { pokemonId: null, name: "VULPIX", type: "Fire", attack: 7, maxHp: 14, currentHp: 14, isDead: false },
        ],
      },
    };

    res.json(dummyBattle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dummy battle" });
  }
});

export default router;

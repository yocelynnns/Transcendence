import express from "express";
import Battle from "../db/battle";
// import PlayerPokemon from "../db/playerPokemon";
// import PokemonBattle from "../db/pokemonBattle";
// import Battle from "../db/battle";

const router = express.Router();

router.get("/:battleId", async (req, res) => {
  const { battleId } = req.params;

  try {
    const battle = await Battle.findById(battleId);

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    // Optionally, populate Pokémon names or info if needed
    return res.json(battle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

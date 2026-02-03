import { Router, Request, Response } from "express";
import Pokemon from "../db/mapPokemon";

const router = Router();

// FETCH AVAILABLE POKEMON
router.get("/", async (_req: Request, res: Response) => {
  try {
    const pokemons = await Pokemon.find({ caught: false });
    return res.json(pokemons);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

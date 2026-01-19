import { Router, Request, Response } from "express";
import Pokemon from "../db/pokemon";

const router = Router();

// FETCH AVAILABLE POKEMON
router.get("/", async (_req: Request, res: Response) => {
  try {
    const pokemons = await Pokemon.find({ caught: false });
    return res.json(pokemons); // RETURN POKEMON LIST
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" }); // RETURN ERROR
  }
});

export default router;

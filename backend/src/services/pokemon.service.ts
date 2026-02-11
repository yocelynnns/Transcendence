import mongoose from "mongoose";
import MapPokemon from "../db/mapPokemon";

// Fetch available Pokemon
export interface FetchAvailablePokemonInput {
  limit?: number; 
}

export async function fetchAvailablePokemon({ limit = 50 }: FetchAvailablePokemonInput) {
  const pokemons = await MapPokemon.find({ caught: false })
    .sort({ createdAt: 1 })
    .limit(limit);

  return pokemons;
}

export async function fetchPokemonById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid Pokemon ID");
  }

  const pokemon = await MapPokemon.findById(id);

  return pokemon;
}

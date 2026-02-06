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

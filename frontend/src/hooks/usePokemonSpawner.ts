//IMPORTS
import { useState, useEffect } from "react";
import axios from "axios";

//TYPES
export type SpawnedPokemon = {
  _id: string;
  name?: string;
  type?: string;
  x: number;
  y: number;
  sprite: string;
  caught: boolean;
};

type PokemonApiResponse = SpawnedPokemon[] | { pokemons: SpawnedPokemon[] };

//CONSTANTS
const BACKEND_URL = "http://localhost:5001";

//MAIN HOOK
export function usePokemonSpawner() {
  //STATE
  const [pokemonList, setPokemonList] = useState<SpawnedPokemon[]>([]);

  //FETCH POKEMON EFFECT
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const res = await axios.get<PokemonApiResponse>(`${BACKEND_URL}/api/pokemon`);

        console.log("Raw response from backend /api/pokemon:", res);

        const data = res.data;

        if (Array.isArray(data)) {
          console.log("Received Pokémon array:", data);
          setPokemonList(data);
        }
        else if ("pokemons" in data && Array.isArray(data.pokemons)) {
          console.log("Received wrapped Pokémon object:", data.pokemons);
          setPokemonList(data.pokemons);
        } else {
          console.warn("Unexpected Pokémon response format:", data);
        }
      } catch (err) {
        console.error("Failed to fetch Pokémon:", err);
      }
    };

    fetchPokemon();
  }, []);

  //REMOVE POKEMON
  const removePokemon = (id: string) =>
    setPokemonList((prev) => prev.filter((p) => p._id !== id));

  //RETURN
  return { pokemonList, setPokemonList, removePokemon };
}

//IMPORTS
import { useState, useEffect } from "react";
import axios from "axios";

import { MapPokemon } from "../types/pokemonTypes";


type PokemonApiResponse = MapPokemon[] | { pokemons: MapPokemon[] };

//CONSTANTS
const BACKEND_URL = "http://localhost:25001";

//MAIN HOOK
export function usePokemonSpawner() {
  //STATE
  const [pokemonList, setPokemonList] = useState<MapPokemon[]>([]);

  //FETCH POKEMON EFFECT
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const res = await axios.get<PokemonApiResponse>(`${BACKEND_URL}/api/pokemon`);

        const data = res.data;

        if (Array.isArray(data)) {

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

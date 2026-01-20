import PokemonBattle from "../db/pokemonBattle";
// import type { IPokemon } from "../db/pokemonBattle.js";

export const setupPokemon = async () => {
  const defaultPokemon = [
   // grass
    { name: "Bulbasaur", type: "Grass", is_shiny: false, hp: 8, attack: 6 },
    { name: "Oddish", type: "Grass", is_shiny: false, hp: 10, attack: 5 },
    { name: "Bellsprout", type: "Grass", is_shiny: false, hp: 12, attack: 4 },
    { name: "Shiny Bulbasaur", type: "Grass", is_shiny: true, hp: 10, attack: 7 },
    { name: "Shiny Oddish", type: "Grass", is_shiny: true, hp: 12, attack: 6 },
    { name: "Shiny Bellsprout", type: "Grass", is_shiny: true, hp: 14, attack: 5 },

    // fire
    { name: "Charmander", type: "Fire", is_shiny: false, hp: 8, attack: 6 },
    { name: "Vulpix", type: "Fire", is_shiny: false, hp: 10, attack: 5 },
    { name: "Ponyta", type: "Fire", is_shiny: false, hp: 12, attack: 4 },
    { name: "Shiny Charmander", type: "Fire", is_shiny: true, hp: 10, attack: 7 },
    { name: "Shiny Vulpix", type: "Fire", is_shiny: true, hp: 12, attack: 6 },
    { name: "Shiny Ponyta", type: "Fire", is_shiny: true, hp: 14, attack: 5 },

    // water
    { name: "Squirtle", type: "Water", is_shiny: false, hp: 8, attack: 6 },
    { name: "Psyduck", type: "Water", is_shiny: false, hp: 10, attack: 5 },
    { name: "Slowpoke", type: "Water", is_shiny: false, hp: 12, attack: 4 },
    { name: "Shiny Squirtle", type: "Water", is_shiny: true, hp: 10, attack: 7 },
    { name: "Shiny Psyduck", type: "Water", is_shiny: true, hp: 12, attack: 6 },
    { name: "Shiny Slowpoke", type: "Water", is_shiny: true, hp: 14, attack: 5 },

    // normal
    { name: "Cleffa", type: "Normal", is_shiny: false, hp: 8, attack: 6 },
    { name: "Togepi", type: "Normal", is_shiny: false, hp: 10, attack: 5 },
    { name: "Pikachu", type: "Normal", is_shiny: false, hp: 12, attack: 4 },
    { name: "Shiny Cleffa", type: "Normal", is_shiny: true, hp: 10, attack: 7 },
    { name: "Shiny Togepi", type: "Normal", is_shiny: true, hp: 12, attack: 6 },
    { name: "Shiny Pikachu", type: "Normal", is_shiny: true, hp: 14, attack: 5 },
  ];

  for (const p of defaultPokemon) {
    await PokemonBattle.updateOne({ name: p.name }, { $set: p }, { upsert: true });
  }

  console.log("✅ Pokémon setup complete (duplicates handled)");
};

import Pokemon from "../models/Pokemon.js";

export const setupPokemon = async () => {
  const count = await Pokemon.countDocuments();

  await Pokemon.insertMany([
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
    { name: "Cleffa", type: "Fire", is_shiny: false, hp: 8, attack: 6 },
    { name: "Togepi", type: "Fire", is_shiny: false, hp: 10, attack: 5 },
    { name: "Pikachu", type: "Fire", is_shiny: false, hp: 12, attack: 4 },
    { name: "Shiny Cleffa", type: "Fire", is_shiny: true, hp: 10, attack: 7 },
    { name: "Shiny Togepi", type: "Fire", is_shiny: true, hp: 12, attack: 6 },
    { name: "Shiny Pikachu", type: "Fire", is_shiny: true, hp: 14, attack: 5 },
    
  ]);

  console.log("✅ Pokémon initialized");
};
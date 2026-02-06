export interface PokemonEntry {
  name: string;
  type: "grass" | "water" | "normal" | "fire";
  is_shiny: boolean;
  hp: number;
  attack: number;
}

// All Pokemon
const ALL_POKEMON: PokemonEntry[] = [
  // fire
  { name: "charmander", type: "fire", is_shiny: false, hp: 8, attack: 6 },
  { name: "vulpix", type: "fire", is_shiny: false, hp: 10, attack: 5 },
  { name: "ponyta", type: "fire", is_shiny: false, hp: 12, attack: 4 },
  { name: "shiny charmander", type: "fire", is_shiny: true, hp: 10, attack: 7 },
  { name: "shiny vulpix", type: "fire", is_shiny: true, hp: 12, attack: 6 },
  { name: "shiny ponyta", type: "fire", is_shiny: true, hp: 14, attack: 5 },

  // Grass
  { name: "bulbasaur", type: "grass", is_shiny: false, hp: 8, attack: 6 },
  { name: "oddish", type: "grass", is_shiny: false, hp: 10, attack: 5 },
  { name: "bellsprout", type: "grass", is_shiny: false, hp: 12, attack: 4 },
  { name: "shiny bulbasaur", type: "grass", is_shiny: true, hp: 10, attack: 7 },
  { name: "shiny oddish", type: "grass", is_shiny: true, hp: 12, attack: 6 },
  { name: "shiny bellsprout", type: "grass", is_shiny: true, hp: 14, attack: 5 },

  // Normal
  { name: "cleffa", type: "normal", is_shiny: false, hp: 8, attack: 6 },
  { name: "togepi", type: "normal", is_shiny: false, hp: 10, attack: 5 },
  { name: "pikachu", type: "normal", is_shiny: false, hp: 12, attack: 4 },
  { name: "shiny cleffa", type: "normal", is_shiny: true, hp: 10, attack: 7 },
  { name: "shiny togepi", type: "normal", is_shiny: true, hp: 12, attack: 6 },
  { name: "shiny pikachu", type: "normal", is_shiny: true, hp: 14, attack: 5 },

  // Water
  { name: "squirtle", type: "water", is_shiny: false, hp: 8, attack: 6 },
  { name: "psyduck", type: "water", is_shiny: false, hp: 10, attack: 5 },
  { name: "slowpoke", type: "water", is_shiny: false, hp: 12, attack: 4 },
  { name: "shiny squirtle", type: "water", is_shiny: true, hp: 10, attack: 7 },
  { name: "shiny psyduck", type: "water", is_shiny: true, hp: 12, attack: 6 },
  { name: "shiny slowpoke", type: "water", is_shiny: true, hp: 14, attack: 5 },

];

export default ALL_POKEMON;

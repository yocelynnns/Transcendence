import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Pokemon, { type IMapPokemon } from "../db/mapPokemon";
import ALL_POKEMON from "./pokemonList";

dotenv.config();

// Config
const MONGO_URI = process.env.MONGO_URI || "";
const TILE_SIZE = 84;

// Load map
const mapPath = path.join(__dirname, "../assets/map/map.json");
const rawMap = fs.readFileSync(mapPath, "utf-8");
const mapJson = JSON.parse(rawMap);

const MAP_WIDTH = mapJson.width;
const MAP_HEIGHT = mapJson.height;
const mapData: number[] = mapJson.map;

// Seed pokemon when start
export async function seedPokemons(
  pokemonCount: number,
  existingPositions: { x: number; y: number }[] = []
) {
  await mongoose.connect(MONGO_URI);
  console.log("MONGODB CONNECTED FOR SEEDING");

  // Build list of empty tiles
  const emptyTiles: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (mapData[y * MAP_WIDTH + x] === 0) emptyTiles.push({ x, y });
    }
  }

  // Build set of available positions, removing existing Pokémon
  const available = new Set(
    emptyTiles.map((t) => `${t.x},${t.y}`)
  );
  for (const pos of existingPositions) {
    // Remove tiles already used by existing Pokémon
    const tileX = Math.floor(pos.x / TILE_SIZE);
    const tileY = Math.floor(pos.y / TILE_SIZE);
    available.delete(`${tileX},${tileY}`);
  }

  // Generate Pokémon
  const pokemonsToInsert: Partial<IMapPokemon>[] = [];
  while (pokemonsToInsert.length < pokemonCount && available.size > 0) {
    const tiles = Array.from(available);
    const index = Math.floor(Math.random() * tiles.length);
    const [xStr, yStr] = tiles[index].split(",");
    const x = Number(xStr);
    const y = Number(yStr);

    const poke = ALL_POKEMON[Math.floor(Math.random() * ALL_POKEMON.length)];

    pokemonsToInsert.push({
      name: poke.name,
      type: poke.type,
      is_shiny: poke.is_shiny,
      attack: poke.attack,
      hp: poke.hp,
      x: x * TILE_SIZE,
      y: y * TILE_SIZE,
      caught: false,
    });

    // Remove surrounding tiles to prevent overlap
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        available.delete(`${x + dx},${y + dy}`);
      }
    }
  }

  // Insert into DB
  await Pokemon.insertMany(pokemonsToInsert);
  console.log(`SEEDED ${pokemonsToInsert.length} Pokemon INTO DB`);
}

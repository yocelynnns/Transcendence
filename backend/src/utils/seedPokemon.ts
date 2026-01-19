import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Pokemon, { type IMapPokemon } from "../db/pokemon";
import ALL_POKEMON from "./pokemonList";

dotenv.config();

// CONFIG
const MONGO_URI = process.env.MONGO_URI || "";
const TILE_SIZE = 64;

// LOAD MAP
const mapPath = path.join(__dirname, "../assets/map/map.json");
const rawMap = fs.readFileSync(mapPath, "utf-8");
const mapJson = JSON.parse(rawMap);

const MAP_WIDTH = mapJson.width;
const MAP_HEIGHT = mapJson.height;
const mapData: number[] = mapJson.map;

// SEED FUNCTION
export async function seedPokemons(pokemonCount: number) {
  await mongoose.connect(MONGO_URI);
  console.log("MONGODB CONNECTED FOR SEEDING");

  // FIND EMPTY TILES
  const emptyTiles: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (mapData[y * MAP_WIDTH + x] === 0) emptyTiles.push({ x, y });
    }
  }

  // INSERT POKÉMON
  const available = new Set(emptyTiles.map((t) => `${t.x},${t.y}`));
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

    // REMOVE TILE + SURROUNDING TO AVOID OVERLAP
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        available.delete(`${x + dx},${y + dy}`);
      }
    }
  }

  await Pokemon.insertMany(pokemonsToInsert);
  console.log(`SEEDED ${pokemonsToInsert.length} POKÉMON INTO DB`);
}

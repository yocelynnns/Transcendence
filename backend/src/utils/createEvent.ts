import ALL_POKEMON from "../utils/pokemonList";
import type { PokemonEntry } from "../utils/pokemonList";
import { CatchEventModel } from "../db/event";
import fs from "fs";
import path from "path";

// Config
const TILE_SIZE = 84;
const MAP_PATH = path.join(__dirname, "../assets/map/map.json");
const TOTAL_POKEMON = 30;

// Load map
const rawMap = fs.readFileSync(MAP_PATH, "utf-8");
const mapJson = JSON.parse(rawMap);
const MAP_WIDTH = mapJson.width;
const MAP_HEIGHT = mapJson.height;
const mapData: number[] = mapJson.map;

// Generate Pokemon function
function generatePokemons(count: number) {
  const emptyTiles: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (mapData[y * MAP_WIDTH + x] === 0) emptyTiles.push({ x, y });
    }
  }

  const available = new Set(emptyTiles.map((t) => `${t.x},${t.y}`));
  const pokemons: any[] = [];

  while (pokemons.length < count && available.size > 0) {
    const tiles = Array.from(available);
    const index = Math.floor(Math.random() * tiles.length);
    const [xStr, yStr] = tiles[index].split(",");
    const x = Number(xStr);
    const y = Number(yStr);

    const poke: PokemonEntry = ALL_POKEMON[Math.floor(Math.random() * ALL_POKEMON.length)];
    const difficulty = poke.is_shiny ? 0.55 : 0.4 + Math.random() * 0.1;

    pokemons.push({
      name: poke.name,
      type: poke.type,
      is_shiny: poke.is_shiny,
      hp: poke.hp,
      attack: poke.attack,
      catchDifficulty: difficulty,
      x: x * TILE_SIZE,
      y: y * TILE_SIZE,
      caught: false,
    });

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        available.delete(`${x + dx},${y + dy}`);
      }
    }
  }

  return pokemons;
}

// Create event
export async function createCatchEvent(io: any) {
  const EVENT_ID = "catch_event";

  const existingEvent = await CatchEventModel.findOne({ eventId: EVENT_ID });

  if (existingEvent) {
    if (existingEvent.status === "waiting") {
      existingEvent.status = "running";
      existingEvent.lastCheckedAt = new Date();
      await existingEvent.save();
      console.log("Event Started!!!", existingEvent._id);
      return;
    } 
      else if  (existingEvent.status === "finished") {
      await CatchEventModel.findByIdAndDelete(existingEvent._id);
      console.log("Old finished event deleted:", existingEvent._id);
    } else {
      existingEvent.lastCheckedAt = new Date();
      await existingEvent.save();
      console.log("Event still running, skipping creation");
      return;
    }
  }

  const newEvent = await CatchEventModel.create({
    eventId: EVENT_ID,
    players: [],
    pokemon: generatePokemons(TOTAL_POKEMON),
    status: "waiting",
    lastCheckedAt:  new Date(),
  });

  console.log("New catch event created:", newEvent._id);

  io.emit("catchEventStarted", newEvent);
}

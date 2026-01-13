// src/setup/battleDummy_setup.ts
import Pokemon from "../models/Pokemon.js";
import type { IPokemon } from "../models/Pokemon.js";
import type { IBattlePokemon } from "../models/Battle.js";

export let dummyBattle: {
  player: { name: string; pokemon: IBattlePokemon[] };
  enemy: { name: string; pokemon: IBattlePokemon[] };
} | null = null;

const createBattlePokemon = (
  p: IPokemon,
  hpPercent: number
): IBattlePokemon => {
  const maxHp = p.hp ?? 10;
  const currentHp = Math.max(0, Math.floor(maxHp * hpPercent));

  return {
    pokemonId: p._id,
    name: p.name,
    type: p.type,
    attack: p.attack ?? 5,
    maxHp,
    currentHp,
    isDead: currentHp <= 0,
    is_shiny: p.is_shiny,
  };
};

export const setupDummyBattleData = async () => {
  try {
    const findPokemon = async (name: string): Promise<IPokemon | null> => {
      const p = await Pokemon.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      }).lean();

      if (!p) console.warn(`⚠️ Pokémon "${name}" not found`);
      return p;
    };

    const playerSetup: [string, number][] = [
      ["Togepi", 1],
      ["Shiny Togepi", 0.5],
      ["Shiny Slowpoke", 0.2],
    ];

    const enemySetup: [string, number][] = [
      ["Cleffa", 1],
      ["Shiny Cleffa", 0.5],
      ["Vulpix", 0.2],
    ];

    const playerPokemon: IBattlePokemon[] = [];
    for (const [name, hpPercent] of playerSetup) {
      const p = await findPokemon(name);
      if (p) playerPokemon.push(createBattlePokemon(p, hpPercent));
    }

    const enemyPokemon: IBattlePokemon[] = [];
    for (const [name, hpPercent] of enemySetup) {
      const p = await findPokemon(name);
      if (p) enemyPokemon.push(createBattlePokemon(p, hpPercent));
    }

    dummyBattle = {
      player: { name: "Player", pokemon: playerPokemon },
      enemy: { name: "Enemy", pokemon: enemyPokemon },
    };

    console.log("✅ Dummy battle preloaded with staged HP");
  } catch (err) {
    console.error("❌ Failed to setup dummy battle:", err);
    dummyBattle = {
      player: { name: "Player", pokemon: [] },
      enemy: { name: "Enemy", pokemon: [] },
    };
  }
};

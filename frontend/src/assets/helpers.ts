import { ASSETS } from './index'; // your central assets

// GET FRONT SPRITE (SAFE)
// GET FRONT SPRITE (CHECK IF SHINY)
export function getPokemonFrontSprite(name?: string | null) {
  if (!name) {
    console.log("[getPokemonFrontSprite] missing name:", name);
    return null; // fallback sprite
  }

  const upperName = name.toUpperCase();

  // Check if name contains "SHINY"
  const isShiny = upperName.includes("SHINY");

  if (isShiny) {
    return getPokemonShinySprite(name);
  }

  // Normal front sprite
  return ASSETS.POKEMON?.[upperName]?.FRONT ?? null;
}

// GET BACK SPRITE
export function getPokemonBackSprite(name: string) {
  const upperName = name.toUpperCase();
  return ASSETS.POKEMON?.[upperName]?.BACK ?? null;
}

// GET SHINY SPRITE
export function getPokemonShinySprite(name: string) {
  const cleanName = name.toLowerCase().replace(/^shiny\s+/i, "").replace(/\s+/g, "_");
  const upperName = cleanName.toUpperCase();
  return ASSETS.POKEMON?.[upperName]?.SHINY ?? null;
}

// GET DEFAULT SPRITE
export function getPokemonDefault(name: string) {
  const upperName = name.toUpperCase();
  return ASSETS.POKEMON?.[upperName]?.DEFAULT ?? null;
}


export const getPokemonGifPath = (name: string, type: string, is_shiny: boolean, isPlayer: boolean,) => {
  const cleanName = name.toLowerCase().replace(/^shiny\s+/i, "").replace(/\s+/g, "_");
  const lowerType = type.toLowerCase().replace(/\s+/g, "_");
  const prefix = is_shiny ? "shiny_" : "";
  const position = isPlayer ? "back" : "front";
  return `/assets/pokemon/${lowerType}/${cleanName}/${prefix}${position}_${cleanName}.gif`;
};

export const getPokemonIcon = (name: string, type: string, is_shiny: boolean,) => {
  const cleanName = name.toLowerCase().replace(/^shiny\s+/i, "").replace(/\s+/g, "_");
  const lowerType = type.toLowerCase().replace(/\s+/g, "_");
  const prefix = is_shiny ? "shiny_" : "";
  return `/assets/pokemon/${lowerType}/${cleanName}/${prefix}${cleanName}_icon.png`;
};

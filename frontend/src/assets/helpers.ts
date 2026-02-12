import { ASSETS } from './index';

// Define Pokemon name type from ASSETS
type PokemonName = keyof typeof ASSETS.POKEMON;

// Type guard to check if a string is a valid Pokemon name
function isPokemonName(name: string): name is PokemonName {
  return name in ASSETS.POKEMON;
}

// GET FRONT SPRITE (CHECK IF SHINY)
export function getPokemonFrontSprite(name?: string | null): string | null {
  if (!name) {
    console.log("[getPokemonFrontSprite] missing name:", name);
    return null;
  }

  const upperName = name.toUpperCase();
  
  // Check if name contains "SHINY"
  const isShiny = upperName.includes("SHINY");
  if (isShiny) {
    return getPokemonShinySprite(name);
  }

  // Normal front sprite with type checking
  if (isPokemonName(upperName)) {
    return ASSETS.POKEMON[upperName]?.FRONT ?? null;
  }
  
  console.warn(`[getPokemonFrontSprite] Unknown pokemon: ${name}`);
  return null;
}

// GET BACK SPRITE
export function getPokemonBackSprite(name: string): string | null {
  const upperName = name.toUpperCase();
  
  if (isPokemonName(upperName)) {
    return ASSETS.POKEMON[upperName]?.BACK ?? null;
  }
  
  console.warn(`[getPokemonBackSprite] Unknown pokemon: ${name}`);
  return null;
}

// GET SHINY SPRITE
export function getPokemonShinySprite(name: string): string | null {
  const cleanName = name
    .toLowerCase()
    .replace(/^shiny\s+/i, "")
    .replace(/\s+/g, "_");
  const upperName = cleanName.toUpperCase();
  
  if (isPokemonName(upperName)) {
    return ASSETS.POKEMON[upperName]?.SHINY ?? null;
  }
  
  console.warn(`[getPokemonShinySprite] Unknown pokemon: ${name}`);
  return null;
}

// GET DEFAULT SPRITE
export function getPokemonDefault(name: string): string | null {
  const upperName = name.toUpperCase();
  
  if (isPokemonName(upperName)) {
    return ASSETS.POKEMON[upperName]?.DEFAULT ?? null;
  }
  
  console.warn(`[getPokemonDefault] Unknown pokemon: ${name}`);
  return null;
}

// GET POKEMON GIF PATH
export const getPokemonGifPath = (
  name: string,
  type: string,
  is_shiny: boolean,
  isPlayer: boolean
): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/^shiny\s+/i, "")
    .replace(/\s+/g, "_");
  const lowerType = type.toLowerCase().replace(/\s+/g, "_");
  const prefix = is_shiny ? "shiny_" : "";
  const position = isPlayer ? "back" : "front";
  
  return `/assets/pokemon/${lowerType}/${cleanName}/${prefix}${position}_${cleanName}.gif`;
};

// GET POKEMON ICON
export const getPokemonIcon = (
  name: string,
  type: string,
  is_shiny: boolean
): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/^shiny\s+/i, "")
    .replace(/\s+/g, "_");
  const lowerType = type.toLowerCase().replace(/\s+/g, "_");
  const prefix = is_shiny ? "shiny_" : "";
  
  return `/assets/pokemon/${lowerType}/${cleanName}/${prefix}${cleanName}_icon.png`;
};
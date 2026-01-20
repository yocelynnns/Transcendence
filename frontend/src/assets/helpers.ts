import { ASSETS } from './index'; // your central assets

// GET FRONT SPRITE (SAFE)
export function getPokemonFrontSprite(name?: string | null) {
  if (!name) {
    console.warn("[getPokemonFrontSprite] missing name:", name);
    return null; // or a fallback sprite
  }

  const upperName = name.toUpperCase();
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

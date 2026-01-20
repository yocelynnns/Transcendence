//IMPORTS
import { getPokemonFrontSprite, getPokemonShinySprite } from '../assets/helpers';

//POKEMON TYPE
export type SpawnedPokemon = {
  _id: string;
  name: string;
  is_shiny: boolean;
  x: number;
  y: number;
  caught: boolean;
};

//POKEMON COMPONENT PROPS
type PokemonProps = {
  x: number;
  y: number;
  is_shiny: boolean;
  name: string;
  tileSize: number;
  zIndex?: number;
};

//POKEMON COMPONENT
export default function Pokemon({ x, y, name, is_shiny, tileSize, zIndex = 1 }: PokemonProps) {
  //CONSTANTS
  const POKEMON_SIZE = 40;
  var sprite = getPokemonFrontSprite(name);

  if (is_shiny)
    sprite = getPokemonShinySprite(name);

  //RENDER
  return (
    <img
      src={sprite}
      alt={name}
      style={{
        position: "absolute",
        left: x + (tileSize - POKEMON_SIZE) / 2,
        top: y + (tileSize - POKEMON_SIZE) / 2,
        width: POKEMON_SIZE,
        height: POKEMON_SIZE,
        zIndex,
        pointerEvents: "none",
        imageRendering: "pixelated",
      }}
    />
  );
}

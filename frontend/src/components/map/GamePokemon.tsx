//IMPORTS
import { getPokemonFrontSprite } from '../../assets/helpers';

//POKEMON COMPONENT PROPS
type PokemonProps = {
  x: number;
  y: number;
  name: string;
  tileSize: number;
  zIndex?: number;
};

//POKEMON COMPONENT
export default function Pokemon({ x, y, name, tileSize, zIndex = 1 }: PokemonProps) {
  //CONSTANTS
  const POKEMON_SIZE = 40;
  const sprite = getPokemonFrontSprite(name);

  //RENDER
  return (
    <img
      src={sprite || ""}
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

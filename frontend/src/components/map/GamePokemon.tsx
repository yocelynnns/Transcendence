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
  const POKEMON_SIZE = 60;
  const sprite = getPokemonFrontSprite(name);

  //RENDER
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x + (tileSize - POKEMON_SIZE) / 2,
        top: y + (tileSize - POKEMON_SIZE) / 2,
        width: POKEMON_SIZE,
        height: POKEMON_SIZE,
        zIndex,

        backgroundImage: `url(${sprite})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",

        imageRendering: "pixelated",
      }}
    />
  );
}

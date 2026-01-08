export type Player = {
  id: string;
  x: number;
  y: number;
};

export type Pokemon = {
  id: string;
  x: number;
  y: number;
  caughtBy?: string | null;
};

export type GameState = {
  players: Player[];
  pokemons: Pokemon[];
};

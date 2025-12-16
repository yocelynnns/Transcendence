export type Player = {
  id: string;
  x: number;
  y: number;
};

export type Pokemon = {
  id: string;
  x: number;
  y: number;
  caughtBy: string | null;
};

export const players = new Map<string, Player>();

export const pokemons: Pokemon[] = [
  { id: "pika", x: 4, y: 4, caughtBy: null },
  { id: "bulba", x: 7, y: 2, caughtBy: null },
];

export type Pokemon = {
  _id: string;
  name: string;
  type: string;
  hp: number;
  attack: number;
  is_shiny: boolean;
};

export type Player = {
  _id: string;
  username: string;
  avatarUrl?: string;
  pokemons?: Pokemon[];
};

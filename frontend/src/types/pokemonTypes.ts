//POKEMON TYPE

export type MapPokemon = {
  _id: string;
  name: string;
  x: number;
  y: number;
  caught: boolean;
  type: string;
  is_shiny: boolean;
  hp: number;
  attack: number;
};

// TYPES
export type PlayerPokemon = {
  _id: string;
  name: string;
  type: string;
  is_shiny: boolean;
  hp: number;
  attack: number;

  usageBattleNum?: number;
  raceUsageNum?: number;
  usageTotalNum?: number;
};

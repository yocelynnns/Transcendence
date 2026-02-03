import { AvatarData } from "./avatarTypes";
// import { AvatarData } from "./avatarTypes";

export interface BattlePokemon {
  _id?:string;
  pokemonId: string;
  name: string;
  type: "grass" | "water" | "normal" | "fire";
  attack: number;
  maxHp: number;
  currentHp: number;
  isDead: boolean;
  is_shiny: boolean;
}

export interface Battle {
  _id?:string;
  player1: AvatarData;
  player2: AvatarData;
  pokemon1: BattlePokemon[];
  pokemon2: BattlePokemon[];
  active1: number;
  active2: number;
  currentTurn: "player1" | "player2";
  lastPlayer1Turn?: Date;
  lastPlayer2Turn?: Date;
  createdAt: Date;
  endedAt?: Date;
  winner?: "player1" | "player2" | "draw";
  winnerReason?: string;
}

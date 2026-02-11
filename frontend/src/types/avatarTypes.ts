import {PlayerPokemon} from "./pokemonTypes"
import {Guild} from "./guildTypes"
import { Types } from "mongoose";

export type AvatarData = {
  _id: string;
  userId: string;
  userName: string;
  avatar: string;
  characterOption: number;
  pokemonInventory: PlayerPokemon[];
  guild?: Guild; 

  battleWin: number;
  battleLoss: number;
  raceWin: number;
  raceLoss: number;

  currentBattle?: Types.ObjectId;       // battleId of ongoing match, optional
  battleHistory: Types.ObjectId[];      // past battleIds

  // --- New fields for socket tracking ---
  currentSocket?: string | null; // optional, current active socket id
  online: boolean;               // is the player currently online
};

export type PlayerState = {
  id?: string;
  x: number;
  y: number;
  direction: string;
  frame: number;
  charIndex: number;
  moving?: boolean;
  currentTiles?: number;
};
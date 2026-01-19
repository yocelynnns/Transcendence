import mongoose, { Schema, Document } from "mongoose";

// INTERFACE
export interface IPlayerPokemon extends Document {
  name: string; // POKÉMON NAME
  type: "grass" | "water" | "normal" | "fire"; // POKÉMON TYPE
  is_shiny: boolean;
  hp: number;
  attack: number;

  // usageBattleNum: number;
  // raceUsageNum: number;
  // usageTotalNum: number;
}

// SCHEMA
const PlayerPokemonSchema: Schema = new Schema({
  name: { type: String, required: true }, // NAME
  type: { type: String, enum: ["grass", "water", "normal", "fire"], required: true }, // TYPE
  is_shiny: {type: Boolean, required: true},
  hp: { type: Number, required: true },
  attack: { type: Number, required: true},

  usageBattleNum: { type: Number, default: 0 },
  raceUsageNum: { type: Number, default: 0 },
  usageTotalNum: { type: Number, default: 0 },
});

export default mongoose.model<IPlayerPokemon>("PlayerPokemon", PlayerPokemonSchema); // EXPORT MODEL

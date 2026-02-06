import mongoose, { Schema, Document } from "mongoose";

export interface IMapPokemon extends Document {
  name: string;
  type: "grass" | "water" | "normal" | "fire";
  is_shiny: boolean;
  hp: number;
  attack: number;
  x: number;
  y: number;
  caught: boolean;
}

export const MapPokemonSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["grass", "water", "normal", "fire"], required: true },
  is_shiny: {type: Boolean, required: true},
  hp: { type: Number, required: true },
  attack: { type: Number, required: true},
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  caught: { type: Boolean, default: false },
});

export default mongoose.model<IMapPokemon>("Pokemon", MapPokemonSchema);

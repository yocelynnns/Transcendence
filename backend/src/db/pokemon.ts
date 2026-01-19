import mongoose, { Schema, Document } from "mongoose";

// INTERFACE
export interface IMapPokemon extends Document {
  name: string;
  type: "grass" | "water" | "normal" | "fire"; // POKÉMON TYPE
  is_shiny: boolean;
  hp: number;
  attack: number;
  x: number; // X POSITION
  y: number; // Y POSITION
  caught: boolean; // CAUGHT STATUS
}

// SCHEMA
const MapPokemonSchema: Schema = new Schema({
  name: { type: String, required: true }, // NAME
  type: { type: String, enum: ["grass", "water", "normal", "fire"], required: true }, // TYPE
  is_shiny: {type: Boolean, required: true},
  hp: { type: Number, required: true },
  attack: { type: Number, required: true},
  x: { type: Number, required: true }, // X COORD
  y: { type: Number, required: true }, // Y COORD
  caught: { type: Boolean, default: false }, // DEFAULT NOT CAUGHT
});

export default mongoose.model<IMapPokemon>("Pokemon", MapPokemonSchema); // EXPORT MODEL

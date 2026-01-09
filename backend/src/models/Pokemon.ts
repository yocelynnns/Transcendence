import mongoose, { Schema, Document } from "mongoose";

export interface IPokemon extends Document {
  name: string;
  type: string;
  is_shiny: boolean;
  hp: number;
  attack: number
  // level: number;
  // owner: mongoose.Types.ObjectId | null;
  // caughtAt: Date | null;
}

const PokemonSchema: Schema = new Schema<IPokemon>({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  is_shiny: {type: Boolean, required: true},
  hp: { type: Number, required: true },
  attack: { type: Number, required: true}
  // level: { type: Number, default: 1 },
  // owner: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  // caughtAt: { type: Date, default: null },
});

const Pokemon = mongoose.model<IPokemon>("Pokemon", PokemonSchema);

export default Pokemon;

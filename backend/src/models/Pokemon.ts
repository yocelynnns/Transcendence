import mongoose, { Schema, Document } from "mongoose";

export interface IPokemon extends Document {
  name: string;
  type: string;
  level: number;
  hp: number;
  owner: mongoose.Types.ObjectId | null;
  caughtAt: Date | null;
}

const PokemonSchema: Schema = new Schema<IPokemon>({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., "Fire", "Water"
  level: { type: Number, default: 1 },
  hp: { type: Number, default: 100 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  caughtAt: { type: Date, default: null },
});

const Pokemon = mongoose.model<IPokemon>("Pokemon", PokemonSchema);

export default Pokemon;

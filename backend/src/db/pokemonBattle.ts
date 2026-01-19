// NOT USED ANYMORE
import mongoose, { Schema, Document } from "mongoose";

export interface IPokemonBattle extends Document {
  name: string;
  type: string;
  is_shiny: boolean;
  hp: number;
  attack: number
  // level: number;
  // owner: mongoose.Types.ObjectId | null;
  // caughtAt: Date | null;
}

const PokemonBattleSchema: Schema = new Schema<IPokemonBattle>({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  is_shiny: {type: Boolean, required: true},
  hp: { type: Number, required: true },
  attack: { type: Number, required: true}
  // level: { type: Number, default: 1 },
  // owner: { type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null },
  // caughtAt: { type: Date, default: null },
});

const PokemonBattle = mongoose.model<IPokemonBattle>("Pokemon Battle", PokemonBattleSchema);

export default PokemonBattle;

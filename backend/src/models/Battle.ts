import mongoose, { Schema, Document } from "mongoose";

export interface IBattlePokemon {
  pokemonId: mongoose.Types.ObjectId;
  name: string;
  type: string;
  attack: number;
  maxHp: number;
  currentHp: number;
  isDead: boolean;
  is_shiny?: boolean;
}

interface IBattlePlayer {
  playerId: mongoose.Types.ObjectId;
  team: IBattlePokemon[];
}

export interface IBattle extends Document {
  player1: IBattlePlayer;
  player2: IBattlePlayer;
}

const BattlePokemonSchema = new Schema<IBattlePokemon>({
  pokemonId: { type: Schema.Types.ObjectId, ref: "Pokemon", required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  attack: { type: Number, required: true },
  maxHp: { type: Number, required: true },
  currentHp: { type: Number, required: true },
  isDead: { type: Boolean, default: false },
  is_shiny: { type: Boolean, default: false },
}, { _id: false });

const BattlePlayerSchema = new Schema<IBattlePlayer>({
  playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  team: { type: [BattlePokemonSchema], required: true },
}, { _id: false });

const BattleSchema = new Schema<IBattle>({
  player1: { type: BattlePlayerSchema, required: true },
  player2: { type: BattlePlayerSchema, required: true },
});

const Battle = mongoose.model<IBattle>("Battle", BattleSchema);
export default Battle;

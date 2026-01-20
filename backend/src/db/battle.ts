import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBattlePokemon {
  pokemonId: Types.ObjectId; // points to PlayerPokemon
  name: string;
  type: "grass" | "water" | "normal" | "fire";
  attack: number;
  maxHp: number;
  currentHp: number;
  isDead: boolean;
  is_shiny: boolean;
}

interface IBattlePlayer {
  playerId: Types.ObjectId; // points to Avatar
  team: IBattlePokemon[];
  activeIndex: number;
}

export interface IBattle extends Document {
  player1: IBattlePlayer;
  player2: IBattlePlayer;
  currentTurn: "player1" | "player2";
  createdAt: Date;
}

const BattlePokemonSchema = new Schema<IBattlePokemon>({
  pokemonId: { type: Schema.Types.ObjectId, ref: "PlayerPokemon", required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["grass", "water", "normal", "fire"], required: true },
  attack: { type: Number, required: true },
  maxHp: { type: Number, required: true },
  currentHp: { type: Number, required: true },
  isDead: { type: Boolean, default: false },
  is_shiny: { type: Boolean, default: false },
}, { _id: false });

const BattlePlayerSchema = new Schema<IBattlePlayer>({
  playerId: { type: Schema.Types.ObjectId, ref: "Avatar", required: true },
  team: { type: [BattlePokemonSchema], required: true },
  activeIndex: { type: Number, default: 0 }, // 👈 add default
}, { _id: false });

const BattleSchema = new Schema<IBattle>({
  player1: { type: BattlePlayerSchema, required: true },
  player2: { type: BattlePlayerSchema, required: true },
  currentTurn: {type: String, enum: ["player1", "player2"]},
  createdAt: { type: Date, default: Date.now },
});

const Battle = mongoose.model<IBattle>("Battle", BattleSchema);
export default Battle;

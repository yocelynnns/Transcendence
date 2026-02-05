import mongoose, { Schema, Document, Types } from "mongoose";
import { IAvatar } from "./avatar";
import { IPlayerPokemon } from "./playerPokemon";

export interface IBattlePokemon {
  pokemonId: Types.ObjectId | IPlayerPokemon;
  name: string;
  type: "grass" | "water" | "normal" | "fire";
  attack: number;
  maxHp: number;
  currentHp: number;
  isDead: boolean;
  is_shiny: boolean;
}

export interface IBattle extends Document {
  player1: Types.ObjectId | IAvatar;
  player2: Types.ObjectId | IAvatar;
  
  pokemon1: IBattlePokemon[];
  pokemon2: IBattlePokemon[];

  active1: number;
  active2: number;

  lastPlayer1Turn?: Date;
  lastPlayer2Turn?: Date;

  currentTurn: "player1" | "player2";

  createdAt: Date;
  endedAt?: Date;

  winner?: "player1" | "player2" | "draw";
  winnerReason?: string;
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

const BattleSchema = new Schema<IBattle>({
  player1: { type: Schema.Types.ObjectId, ref: "Avatar", required: true },
  player2: { type: Schema.Types.ObjectId, ref: "Avatar", required: true },

  pokemon1: { type: [BattlePokemonSchema], default: [] },
  pokemon2: { type: [BattlePokemonSchema], default: [] },

  active1: { type: Number, default: 0 },
  active2: { type: Number, default: 0 }, 

  currentTurn: { type: String, enum: ["player1" , "player2"], default: "player1" },

  createdAt: { type: Date, default: Date.now },
  endedAt: { type: Date },

  lastPlayer1Turn: { type: Date },
  lastPlayer2Turn: { type: Date },

  winner: { type: String, enum: ["player1", "player2", "draw"] },
  winnerReason: { type: String },
});

const Battle = mongoose.model<IBattle>("Battle", BattleSchema);
export default Battle;

import mongoose, { Schema, Document,Types } from "mongoose";
import { IGuild } from "./guild";

export interface IAvatar extends Document {
  user: Types.ObjectId;
  
  userName: string;
  avatar: string;
  characterOption: number;
  pokemonInventory: Types.ObjectId[] ;
  guild?:  Types.ObjectId | IGuild;

  battleWin: number;
  battleLoss: number;
  
  raceWin: number;
  raceLoss: number;

  currentBattle?: Types.ObjectId ;
  battleHistory: Types.ObjectId[] ;

  currentSocket?: string;
  online: boolean;
}

const AvatarSchema: Schema = new Schema({
  user: { type: Types.ObjectId, ref: "User", required: true }, 

  userName: { type: String, required: true },
  avatar: { type: String, default: "" },
  characterOption: { type: Number, default: 1 },
  pokemonInventory: [{ type: Schema.Types.ObjectId, ref: "PlayerPokemon" }],
  guild: { type: Schema.Types.ObjectId, ref: "Guild" },
  
  currentBattle: { type: Schema.Types.ObjectId, ref: "Battle" },
  battleHistory: [{ type: Schema.Types.ObjectId, ref: "Battle" }],


  battleWin: { type: Number, default: 0 },
  battleLoss: { type: Number, default: 0 },
  raceWin: { type: Number, default: 0 },
  raceLoss: { type: Number, default: 0 },

  currentSocket: { type: String, default: null },
  online: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IAvatar>("Avatar", AvatarSchema);

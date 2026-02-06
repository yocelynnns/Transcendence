// AVATAR SCHEMA
import mongoose, { Schema, Document,Types } from "mongoose";
import { IGuild } from "./guild"; // Reference to guild schema
// import { IPlayerPokemon } from "./playerPokemon"; // Reference to guild schema

// INTERFACE
export interface IAvatar extends Document {
  user: Types.ObjectId;
  
  userName: string;                    // CHARACTER NAME
  avatar: string;                      // IMAGE URL / BASE64
  characterOption: number;             // SELECTED CHARACTER OPTION
  pokemonInventory: Types.ObjectId[] ;  // ARRAY OF PlayerPokemon IDS #| IPlayerPokemon[]
  guild?:  Types.ObjectId | IGuild; // Reference to guild

  battleWin: number;
  battleLoss: number;
  
  raceWin: number;
  raceLoss: number;

  currentBattle?: Types.ObjectId ; // ongoing match
  battleHistory: Types.ObjectId[] ; // past battles


  // --- New fields ---
  currentSocket?: string; // current active socket id
  online: boolean;        // is the player connected right now
}

// SCHEMA
const AvatarSchema: Schema = new Schema({
  user: { type: Types.ObjectId, ref: "User", required: true }, 

  userName: { type: String, required: true },                 // NAME
  avatar: { type: String, default: "" },                      // AVATAR IMAGE
  characterOption: { type: Number, default: 1 },              // CHARACTER CHOICE
  pokemonInventory: [{ type: Schema.Types.ObjectId, ref: "PlayerPokemon" }], // INVENTORY
  guild: { type: Schema.Types.ObjectId, ref: "Guild" },
  
  currentBattle: { type: Schema.Types.ObjectId, ref: "Battle" }, // optional ongoing match
  battleHistory: [{ type: Schema.Types.ObjectId, ref: "Battle" }], // past battles


  battleWin: { type: Number, default: 0 },
  battleLoss: { type: Number, default: 0 },
  raceWin: { type: Number, default: 0 },
  raceLoss: { type: Number, default: 0 },

    // --- New fields for socket tracking ---
  currentSocket: { type: String, default: null }, // current active socket id
  online: { type: Boolean, default: false },      // is the player connected
}, { timestamps: true }); // optional: add createdAt/updatedAt

export default mongoose.model<IAvatar>("Avatar", AvatarSchema); // EXPORT MODEL

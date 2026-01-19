// AVATAR SCHEMA
import mongoose, { Schema, Document, Types } from "mongoose";

// INTERFACE
export interface IAvatar extends Document {
  avatarId: string;                    // UNIQUE AVATAR ID
  userName: string;                    // CHARACTER NAME
  avatar: string;                      // IMAGE URL / BASE64
  characterOption: number;             // SELECTED CHARACTER OPTION
  pokemonInventory: Types.ObjectId[];  // ARRAY OF PlayerPokemon IDS
  battleWin: number;
  battleLoss: number;
  raceWin: number;
  raceLoss: number;
}

// SCHEMA
const AvatarSchema: Schema = new Schema({
  avatarId: { type: String, unique: true },                   // OPTIONAL, AUTO-GENERATED
  userName: { type: String, required: true },                 // NAME
  avatar: { type: String, default: "" },                      // AVATAR IMAGE
  characterOption: { type: Number, default: 1 },              // CHARACTER CHOICE
  pokemonInventory: [{ type: Schema.Types.ObjectId, ref: "PlayerPokemon" }], // INVENTORY

  battleWin: { type: Number, default: 0 },
  battleLoss: { type: Number, default: 0 },
  raceWin: { type: Number, default: 0 },
  raceLoss: { type: Number, default: 0 },
});

export default mongoose.model<IAvatar>("Avatar", AvatarSchema); // EXPORT MODEL

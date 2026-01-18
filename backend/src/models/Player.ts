import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  username: string;
  password: string;
  avatarUrl?: string;
  // email: string;   //optional

  battleWin: number;
  battleLoss: number;
  raceWin: number;
  raceLoss: number;
  // level: number;   //optional
  // xp: number;      //optional

  pokemons: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // hash later
    avatarUrl: { type: String, default: "" },
    // email: { type: String, required: true, unique: true },

    battleWin: { type: Number, default: 0 },
    battleLoss: { type: Number, default: 0 },
    raceWin: { type: Number, default: 0 },
    raceLoss: { type: Number, default: 0 },
    // level: { type: Number, default: 1 },
    // xp: { type: Number, default: 0 },

    pokemons: [{ type: Schema.Types.ObjectId, ref: "Pokemon", default: [] }],
  },
  { timestamps: true }
);

const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;

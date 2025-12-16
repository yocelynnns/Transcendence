import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  username: string;
  email: string;
  password: string;
  level: number;
  xp: number;
  pokemons: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const PlayerSchema: Schema = new Schema<IPlayer>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  pokemons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pokemon" }],
  createdAt: { type: Date, default: Date.now },
});

const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRaceResult {
  avatar: Types.ObjectId;
  position: number;      // 1 = winner, 2 = loser
  timeMs?: number;       // finish time in milliseconds
  disconnected?: boolean; // true if player disconnected
}

export interface IRaceMatch extends Document {
  players: Types.ObjectId[];      // avatars in the race
  results: IRaceResult[];
  winner: Types.ObjectId;
  map: string;
  ranked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RaceResultSchema = new Schema<IRaceResult>({
  avatar: { type: Schema.Types.ObjectId, ref: "Avatar", required: true },
  position: { type: Number, required: true },
  timeMs: { type: Number },
  disconnected: { type: Boolean, default: false },
}, { _id: false });

const RaceMatchSchema = new Schema<IRaceMatch>({
  players: [{ type: Schema.Types.ObjectId, ref: "Avatar", required: true }],
  results: { type: [RaceResultSchema], required: true },
  winner: { type: Schema.Types.ObjectId, ref: "Avatar", required: true },
  map: { type: String, required: true },
  ranked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IRaceMatch>("RaceMatch", RaceMatchSchema);


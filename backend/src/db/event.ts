import { Schema, Document, model } from "mongoose";
import { IMapPokemon, MapPokemonSchema } from "./mapPokemon";

export interface EventPlayer {
  playerId: string;
  playerName: string;
  catchCount: number;
}

export interface ICatchEvent extends Document {
  eventId: string;
  pokemon: IMapPokemon[];
  players: EventPlayer[];
  status: "waiting" | "running" | "finished";
  createdAt: Date;
  lastCheckedAt: Date;
}

const EventPlayerSchema = new Schema<EventPlayer>({
  playerId: { type: String, required: true },
  playerName: { type: String, required: true },
  catchCount: { type: Number, default: 0 },
});

const CatchEventSchema = new Schema<ICatchEvent>({
  eventId: { type: String, required: true, unique: true },
  players: { type: [EventPlayerSchema], default: [] },
  pokemon: { type: [MapPokemonSchema], default: [] },
  status: { type: String, enum: ["waiting", "running", "finished"], default: "waiting" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastCheckedAt: {
    type: Date,
  }
}, { timestamps: true });

export const CatchEventModel = model<ICatchEvent>("CatchEvent", CatchEventSchema);

import { Schema, Document, model } from "mongoose";
import { IMapPokemon, MapPokemonSchema } from "./mapPokemon"; // make sure MapPokemonSchema is exported

export interface EventPlayer {
  playerId: string;
  playerName: string;
  catchCount: number; // increment when a catch succeeds
}

export interface ICatchEvent extends Document {
  eventId: string;
  pokemon: IMapPokemon[];
  players: EventPlayer[];
  status: "waiting" | "running" | "finished";
  createdAt: Date;
}

// Sub-schema for players
const EventPlayerSchema = new Schema<EventPlayer>({
  playerId: { type: String, required: true },
  playerName: { type: String, required: true },
  catchCount: { type: Number, default: 0 },
});

// Main schema
const CatchEventSchema = new Schema<ICatchEvent>({
  eventId: { type: String, required: true, unique: true },
  players: { type: [EventPlayerSchema], default: [] },
  pokemon: { type: [MapPokemonSchema], default: [] },
  status: { type: String, enum: ["waiting", "running", "finished"], default: "waiting" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Export model
export const CatchEventModel = model<ICatchEvent>("CatchEvent", CatchEventSchema);

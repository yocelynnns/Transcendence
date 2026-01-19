import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerTeam extends Document {
  playerId: mongoose.Types.ObjectId;
  slot: number; // 1..3
  pokemonId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerTeamSchema = new Schema<IPlayerTeam>(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    slot: { type: Number, required: true },
    pokemonId: { type: Schema.Types.ObjectId, ref: "Pokemon", required: true },
  },
  { timestamps: true }
);

// one player can have only one pokemon per slot
PlayerTeamSchema.index({ playerId: 1, slot: 1 }, { unique: true });

const PlayerTeam = mongoose.model<IPlayerTeam>("PlayerTeam", PlayerTeamSchema);

export default PlayerTeam;

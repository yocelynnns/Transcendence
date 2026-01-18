import mongoose, { Schema, Document } from "mongoose";

export interface IPlayerPokemonStats extends Document {
  playerId: mongoose.Types.ObjectId;
  pokemonId: mongoose.Types.ObjectId;
  usageBattleNum: number;
  raceUsageNum: number;
  usageTotalNum: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerPokemonStatsSchema = new Schema<IPlayerPokemonStats>(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true, index: true },
    pokemonId: { type: Schema.Types.ObjectId, ref: "Pokemon", required: true, index: true },

    usageBattleNum: { type: Number, default: 0 },
    raceUsageNum: { type: Number, default: 0 },
    usageTotalNum: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// one stats row per (player,pokemon)
PlayerPokemonStatsSchema.index({ playerId: 1, pokemonId: 1 }, { unique: true });

const PlayerPokemonStats = mongoose.model<IPlayerPokemonStats>("PlayerPokemonStats", PlayerPokemonStatsSchema);
export default PlayerPokemonStats;

// MONGODB CONNECTION
import mongoose from "mongoose";
import dotenv from "dotenv";
import Pokemon from "./pokemon";
import { seedPokemons } from "../utils/seedPokemon";
// import { setupPokemon } from "../db_setup/pokemonsetup";
// import { setupDummyBattleData } from "../db_setup/battledummy";

dotenv.config();

// CONNECT TO MONGODB + SEED DB TO ENSURE 30 POKÉMON
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB connected");

    // await setupPokemon();
    // await setupDummyBattleData();

    const TARGET_COUNT = 30;
    const currentCount = await Pokemon.countDocuments();

    if (currentCount < TARGET_COUNT) {
      const remaining = TARGET_COUNT - currentCount;
      console.log(`Seeding ${remaining} more Pokémon to reach ${TARGET_COUNT}...`);
      await seedPokemons(remaining);
      console.log("Seeding complete");
    } else {
      console.log(`DB already has ${currentCount} Pokémon, skipping seed`);
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

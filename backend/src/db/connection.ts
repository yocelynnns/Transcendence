import mongoose from "mongoose";
import dotenv from "dotenv";
import Pokemon from "./mapPokemon";
import { seedPokemons } from "../utils/seedPokemon";

dotenv.config();

// Connect to mongodb & seed 30 pokemon
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB connected");

    const TARGET_COUNT = 30;
    const currentCount = await Pokemon.countDocuments();

    if (currentCount < TARGET_COUNT) {
      const remaining = TARGET_COUNT - currentCount;
      console.log(`Seeding ${remaining} more Pokemon to reach ${TARGET_COUNT}...`);
      await seedPokemons(remaining);
      console.log("Seeding complete");
    } else {
      console.log(`DB already has ${currentCount} Pokemon, skipping seed`);
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

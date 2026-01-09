import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";          // <-- import mongoose
import type { GameState, Player, Pokemon } from "./types.js";
import { setupPokemon } from "./setup/pokemon_setup.js";
import pokemonDbRoutes from "./routes/pokemonDbRoutes.js";
import battlesRoutes from "./routes/battlesRoutes.js";

dotenv.config();

// ------------------- MongoDB -------------------
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pokemon-game";

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await setupPokemon(); // 👈 THIS IS THE PLACE
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------- App & Socket.IO -------------------
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST"],
    credentials: true,               // optional, if you use cookies
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/pokemonDb", pokemonDbRoutes);
app.use("/battles", battlesRoutes);

// Game state
const gameState: GameState = {
  players: [],
  pokemons: [],
};

// Helper: spawn some Pokémon randomly
function spawnPokemons(count: number) {
  for (let i = 0; i < count; i++) {
    gameState.pokemons.push({
      id: `p-${i}`,
      x: Math.floor(Math.random() * 500),
      y: Math.floor(Math.random() * 500),
      caughtBy: null,
    });
  }
}

spawnPokemons(5);

// ------------------- Socket.IO -------------------
io.on("connection", (socket) => {
  console.log("⚡ Player connected:", socket.id);

  // Add player
  const newPlayer: Player = { id: socket.id, x: 50, y: 50 };
  gameState.players.push(newPlayer);

  // Send initial state to the new player
  socket.emit("gameState", gameState);

  // Broadcast new player to others
  socket.broadcast.emit("playerJoined", newPlayer);

  // Player movement
  socket.on("move", (data: { x: number; y: number }) => {
    const player = gameState.players.find((p) => p.id === socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      io.emit("playerMoved", player);
    }
  });

  // Catch Pokémon
  socket.on("catchPokemon", (pokemonId: string) => {
    const pokemon = gameState.pokemons.find((p) => p.id === pokemonId);
    if (pokemon && !pokemon.caughtBy) {
      pokemon.caughtBy = socket.id;
      io.emit("pokemonCaught", pokemon);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Player disconnected:", socket.id);
    // Remove player
    gameState.players = gameState.players.filter((p) => p.id !== socket.id);
    io.emit("playerLeft", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

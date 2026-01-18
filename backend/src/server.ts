import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import type { GameState, Player } from "./types.js";
import { setupPokemon } from "./setup/pokemon_setup.js";
import { setupDummyBattleData } from "./setup/battleDummy_setup.js";
import { setupPlayers } from "./setup/player_setup.js";
import pokemonDbRoutes from "./routes/pokemonDbRoutes.js";
import battlesRoutes from "./routes/battlesRoutes.js";
import battleDummyRoutes from "./routes/battleDummyRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import playerTeamRoutes from "./routes/playerTeamRoutes.js";
import playerPokemonStatsRoutes from "./routes/playerPokemonStatsRoutes.js";

dotenv.config();

// ------------------- App & Socket.IO -------------------
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ------------------- Middleware -------------------
app.use(cors());
app.use(express.json());

// ------------------- Routes -------------------
app.use("/pokemonDb", pokemonDbRoutes);
app.use("/battles", battlesRoutes);
app.use("/battleDummy", battleDummyRoutes);
app.use("/players", playerRoutes);
app.use("/players", playerTeamRoutes);
app.use("/stats", playerPokemonStatsRoutes);

// ------------------- In-memory Game State (Socket demo) -------------------
const gameState: GameState = {
  players: [],
  pokemons: [],
};

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

  const newPlayer: Player = { id: socket.id, x: 50, y: 50 };
  gameState.players.push(newPlayer);

  socket.emit("gameState", gameState);
  socket.broadcast.emit("playerJoined", newPlayer);

  socket.on("move", (data: { x: number; y: number }) => {
    const player = gameState.players.find((p) => p.id === socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      io.emit("playerMoved", player);
    }
  });

  socket.on("catchPokemon", (pokemonId: string) => {
    const pokemon = gameState.pokemons.find((p) => p.id === pokemonId);
    if (pokemon && !pokemon.caughtBy) {
      pokemon.caughtBy = socket.id;
      io.emit("pokemonCaught", pokemon);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Player disconnected:", socket.id);
    gameState.players = gameState.players.filter((p) => p.id !== socket.id);
    io.emit("playerLeft", socket.id);
  });
});

// ------------------- Mongo + Start server AFTER setup -------------------
const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pokemon-game";

async function startServer() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    await setupPokemon();
    console.log("✅ pokemon setup complete");

    await setupPlayers();
    console.log("✅ player setup complete");

    await setupDummyBattleData();
    console.log("✅ dummy battle setup complete");

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
}

startServer();

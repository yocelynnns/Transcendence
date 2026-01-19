import express, { Express } from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/auth";
import pokemonRoutes from "./routes/pokemon";
import avatarRoutes from "./routes/avatar";
import pokemonDbRoutes from "./routes/pokemonDbRoutes";
import battleRoutes from "./routes/battleRoutes";
import { setupSocket } from "./ws/server";
import { connectDB } from "./db/connection";
// import battleDummyRoutes from "./routes/battleDummyRoutes"
// import { dummyBattle } from "./db_setup/battledummy";

const app: Express = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/pokemon", pokemonRoutes);
app.use("/api/avatar", avatarRoutes);

app.use("/api/pokemonDb", pokemonDbRoutes);
app.use("/api/battle", battleRoutes);

const PORT: number = Number(process.env.PORT) || 5001;

// CREATE HTTP SERVER
const server = http.createServer(app);

// SETUP SOCKET.IO
setupSocket(server);

// CONNECT MONGODB
connectDB().catch(err => console.error("FAILED TO CONNECT DB:", err));

// START SERVER
server.listen(PORT, () => {
  console.log(`HTTP + Socket.io server running on http://localhost:${PORT}`);
});

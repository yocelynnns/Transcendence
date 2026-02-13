import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import mongoSanitize from "express-mongo-sanitize";
import authRoutes from "./routes/auth";
import pokemonRoutes from "./routes/pokemon";
import avatarRoutes from "./routes/avatar";
import battleRoutes from "./routes/battleRoutes";
import guildRoutes from "./routes/guild";
import guildMessageRoutes from "./routes/guildMessage";
import friendRoutes from "./routes/friends";
import chatRoutes from "./routes/chat";
import raceRoutes from "./routes/race";
import messageBlockRoutes from "./routes/messageBlock";
import { setupSocket } from "./ws/server";
import { connectDB } from "./db/connection";

const app: Express = express();

// CORS - Allow both localhost and Docker network
// app.use(
//   cors({
//     origin: [
//       ""
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"]
//   })
// );

// Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Mongo sanitize middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pokemon", pokemonRoutes);
app.use("/api/avatar", avatarRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/guild", guildRoutes);
app.use("/api/guildMessage", guildMessageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/race", raceRoutes);
app.use("/api", messageBlockRoutes);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Port
const PORT: number = Number(process.env.PORT) || 5001;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
setupSocket(server);

// Connect to MongoDB
connectDB().catch((err) => console.log("FAILED TO CONNECT DB:", err));

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ HTTP + Socket.io server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ Access at http://localhost:${PORT}`);
});
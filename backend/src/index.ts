import express, { Express } from "express";
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
import socialRoutes from "./routes/social";
import { setupSocket } from "./ws/server";
import { connectDB } from "./db/connection";

const app: Express = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use((req, _res, next) => {
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
app.use("/api/social", socialRoutes);

const PORT: number = Number(process.env.PORT) || 5001;

// Create http server
const server = http.createServer(app);

// Set up socket
setupSocket(server);

// Connect MongoDB
connectDB().catch(err => console.log("FAILED TO CONNECT DB:", err));

// Start server
server.listen(PORT, () => {
  console.log(`HTTP + Socket.io server running on http://localhost:${PORT}`);
});

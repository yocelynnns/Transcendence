// backend/routes/battleDummyRoutes.ts
import express from "express";
import { dummyBattle } from "../setup/battleDummy_setup.js";

const router = express.Router();

// Serve the preloaded dummy battle data
router.get("/", (req, res) => {
  if (!dummyBattle) {
    return res.status(500).json({ error: "Dummy battle data not ready" });
  }
  res.json(dummyBattle);
});

export default router;

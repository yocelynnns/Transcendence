// NOT USED ANYMORE
// backend/routes/battleDummyRoutes.ts
import express from "express";
import { dummyBattle } from "../db_setup/battledummy";

const router = express.Router();

// Serve the preloaded dummy battle data
router.get("/", (_req, res) => {
  if (!dummyBattle) {
    return res.status(500).json({ error: "Dummy battle data not ready" });
  }
  return res.json(dummyBattle);
});

export default router;

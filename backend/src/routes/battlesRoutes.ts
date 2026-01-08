import express from "express";
import Pokemon from "../models/Pokemon.js";
import Battle from "../models/Battle.js";

const router = express.Router();

router.get("/", (req, res) => {
  // just a placeholder for now
  res.json({
    message: "Hi! This is your battle placeholder",
    enemy: {
      name: "Enemy Cleffa",
      image: "/images/front_cleffa.gif",
    },
    player: {
      name: "Your Cleffa",
      image: "/images/back_cleffa.gif",
    },
  });
});

export default router;

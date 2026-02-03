import express, { Request, Response } from "express";
import { CatchEventModel } from "../db/event";

const router = express.Router();

// ----------------------
// CREATE NEW EVENT
// ----------------------
router.post("/events", async (req: Request, res: Response) => {
  try {
    const { eventId, players, pokemon } = req.body;

    const existing = await CatchEventModel.findOne({ eventId });
    if (existing) return res.status(400).json({ message: "Event already exists" });

    const newEvent = await CatchEventModel.create({
      eventId,
      players,
      pokemon,
      status: "running",
    });

    return res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create event" });
  }
});

// ----------------------
// GET ALL EVENTS
// ----------------------
router.get("/events", async (_req: Request, res: Response) => {
  try {
    const events = await CatchEventModel.find();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// ----------------------
// GET SINGLE EVENT
// ----------------------
router.get("/events/:eventId", async (req: Request, res: Response) => {
  try {
    const event = await CatchEventModel.findOne({ eventId: req.params.eventId });
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json(event);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch event" });
  }
});

// ----------------------
// MARK POKÉMON AS CAUGHT
// ----------------------
router.patch("/events/:eventId/catch", async (req: Request, res: Response) => {
  try {
    const { pokemonId, playerId } = req.body;
    const event = await CatchEventModel.findOne({ eventId: req.params.eventId });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const poke = event.pokemon.find((p) => p._id.toString() === pokemonId || p._id === pokemonId);
    if (!poke) return res.status(404).json({ message: "Pokémon not found" });
    if (poke.caught) return res.status(400).json({ message: "Pokémon already caught" });

    poke.caught = true;

    const player = event.players.find((p) => p.playerId === playerId);
    if (player) player.catchCount++;

    await event.save();
    return res.json({ success: true, event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update catch" });
  }
});

// ----------------------
// FINISH EVENT
// ----------------------
router.patch("/events/:eventId/finish", async (req: Request, res: Response) => {
  try {
    const event = await CatchEventModel.findOne({ eventId: req.params.eventId });
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "finished";
    await event.save();

    // Determine winner
    const winner = [...event.players].sort((a, b) => b.catchCount - a.catchCount)[0];
    return res.json({ success: true, winner, event });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to finish event" });
  }
});

export default router;

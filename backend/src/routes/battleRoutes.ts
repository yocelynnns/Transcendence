import express from "express";
import Battle from "../db/battle";
import mongoose from "mongoose";


const router = express.Router();

router.get("/:battleId", async (req, res) => {
  const { battleId } = req.params;

  try {
    const battle = await Battle.findById(battleId)
      .populate("player1")
      .populate("player2");

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }
    return res.json(battle);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
// POST /api/battle
router.post("/", async (req, res) => {
  const { player1, player2 } = req.body;

  // 1️⃣ Validate input
  if (!player1 || !player2) {
    return res.status(400).json({ error: "player1 and player2 are required" });
  }

  if (
    !mongoose.Types.ObjectId.isValid(player1) ||
    !mongoose.Types.ObjectId.isValid(player2)
  ) {
    return res.status(400).json({ error: "Invalid player ID format" });
  }

  try {
    // 2️⃣ Create battle with empty pokemon arrays
    const battle = new Battle({
      player1: new mongoose.Types.ObjectId(player1),
      player2: new mongoose.Types.ObjectId(player2),
      pokemon1: [],
      pokemon2: [],
    });

    // 3️⃣ Save
    await battle.save();

    // 4️⃣ Populate players before returning
    const populatedBattle = await Battle.findById(battle._id)
      .populate("player1")
      .populate("player2");

    return res.status(201).json(populatedBattle);
  } catch (err) {
    console.error("Error creating battle:", err);
    return res.status(500).json({ error: "Failed to create battle" });
  }
});


// PATCH /api/battle/:battleId
router.patch("/:battleId", async (req, res) => {
  const { battleId } = req.params;
  const {
    pokemon1,
    pokemon2,
    currentTurn,
    endedAt,
    winner,
    winnerReason,
  } = req.body;

  // 1️⃣ Validate battleId
  if (!mongoose.Types.ObjectId.isValid(battleId)) {
    return res.status(400).json({ error: "Invalid battle ID" });
  }

  try {
    // 2️⃣ Build update object dynamically
    const updateData: any = {};

    if (pokemon1 !== undefined) updateData.pokemon1 = pokemon1;
    if (pokemon2 !== undefined) updateData.pokemon2 = pokemon2;
    if (currentTurn !== undefined) updateData.currentTurn = currentTurn;
    if (endedAt !== undefined) updateData.endedAt = endedAt;
    if (winner !== undefined) updateData.winner = winner;
    if (winnerReason !== undefined) updateData.winnerReason = winnerReason;

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // 3️⃣ Update battle
    const battle = await Battle.findByIdAndUpdate(
      battleId,
      { $set: updateData },
      { new: true }
    );

    if (!battle) {
      return res.status(404).json({ error: "Battle not found" });
    }

    return res.json(battle);
  } catch (err) {
    console.error("Error updating battle:", err);
    return res.status(500).json({ error: "Failed to update battle" });
  }
});

export default router;


import { Router } from "express";
import mongoose from "mongoose";
import Avatar from "../db/player";
import User from "../db/user";
import PlayerPokemon from "../db/playerPokemon";
import MapPokemon from "../db/pokemon";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// CREATE AVATAR + LINK TO USER
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userName, avatar, characterOption } = req.body;

    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const avatarId = new mongoose.Types.ObjectId().toHexString();

    const newAvatar = await Avatar.create({
      avatarId,
      userName,
      avatar,
      characterOption,
      pokemonInventory: [],
    });

    await User.findByIdAndUpdate(req.userId, { avatarId });

    return res.status(201).json({ avatarId, avatar: newAvatar }); // RETURN NEW AVATAR
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create avatar" }); // RETURN ERROR
  }
});

// GET AVATAR BY ID
router.get("/:avatarId", async (req, res) => {
  try {
    const avatar = await Avatar.findOne({ avatarId: req.params.avatarId }).populate("pokemonInventory");
    if (!avatar) return res.status(404).json({ message: "Avatar not found" });

    return res.json(avatar); // RETURN AVATAR
  } catch {
    return res.status(500).json({ message: "Server error" }); // RETURN ERROR
  }
});

// UPDATE AVATAR
router.put("/:avatarId", authMiddleware, async (req, res) => {
  try {
    const { userName, avatar, characterOption } = req.body;

    const updated = await Avatar.findOneAndUpdate(
      { avatarId: req.params.avatarId },
      {
        ...(userName !== undefined && { userName }),
        ...(avatar !== undefined && { avatar }),
        ...(characterOption !== undefined && { characterOption }),
      },
      { new: true }
    ).populate("pokemonInventory");

    if (!updated) {
      return res.status(404).json({ message: "Avatar not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("[PUT /avatar] error:", err);
    return res.status(500).json({ message: "Failed to update avatar" });
  }
});


// CATCH POKEMON
router.post("/:avatarId/pokemon/catch", async (req, res) => {
  try {
    const { mapPokemonId } = req.body;

    const avatar = await Avatar.findOne({ avatarId: req.params.avatarId });
    if (!avatar) return res.status(404).json({ message: "Avatar not found" });

    const mapPokemon = await MapPokemon.findById(mapPokemonId);
    if (!mapPokemon) return res.status(404).json({ message: "Map Pokémon not found" });

    // CREATE PLAYER POKEMON
    const playerPokemon = await PlayerPokemon.create({ name: mapPokemon.name, type: mapPokemon.type, is_shiny: mapPokemon.is_shiny, attack: mapPokemon.attack, hp: mapPokemon.hp});

    // ADD TO PLAYER INVENTORY
    avatar.pokemonInventory.push(playerPokemon._id);
    await avatar.save();

    // DELETE MAP POKEMON
    await mapPokemon.deleteOne();

    await avatar.populate("pokemonInventory");

    return res.json({ avatar, playerPokemon });
  } catch (err) {
    console.error("[POST /avatar/:avatarId/pokemon/catch] error:", err);
    return res.status(500).json({ message: "Catch failed" });
  }
});

export default router;

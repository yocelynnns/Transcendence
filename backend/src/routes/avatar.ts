import { Router } from "express";
import Avatar from "../db/avatar";
import User from "../db/user";
import PlayerPokemon from "../db/playerPokemon";
import MapPokemon from "../db/mapPokemon";
import { authMiddleware, AuthRequest } from "../routes/auth";

const router = Router();

// CREATE AVATAR + LINK TO USER
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userName, avatar, characterOption } = req.body;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const newAvatar = await Avatar.create({
      userName,
      avatar,
      characterOption,
      pokemonInventory: [],
    });

    await User.findByIdAndUpdate(req.userId, { avatar: newAvatar._id });

    return res.status(201).json({ avatar: newAvatar });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create avatar" });
  }
});

// GET AVATAR BY ID
router.get("/:avatarId", async (req, res) => {
  try {
    const avatar = await Avatar.findById(req.params.avatarId)
      .populate("pokemonInventory") 
      .populate({
        path: "guild",
        select: "image", 
      });

    if (!avatar) return res.status(404).json({ message: "Avatar not found" });

    return res.json(avatar);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


// UPDATE AVATAR
router.put("/:avatarId", authMiddleware, async (req, res) => {
  try {
    const {
      userName,
      avatar,
      characterOption,
      pokemonInventory,
      guild,
      battleWin,
      battleLoss,
      raceWin,
      raceLoss,
      currentBattle,
      battleHistory,
      online,
      currentSocket,
    } = req.body;

    const updated = await Avatar.findByIdAndUpdate(
      req.params.avatarId,
      {
        ...(userName !== undefined && { userName }),
        ...(avatar !== undefined && { avatar }),
        ...(characterOption !== undefined && { characterOption }),
        ...(pokemonInventory !== undefined && { pokemonInventory }),
        ...(guild !== undefined && { guild }),
        ...(battleWin !== undefined && { battleWin }),
        ...(battleLoss !== undefined && { battleLoss }),
        ...(raceWin !== undefined && { raceWin }),
        ...(raceLoss !== undefined && { raceLoss }),
        ...(currentBattle !== undefined && { currentBattle }),
        ...(battleHistory !== undefined && { battleHistory }),
        ...(online !== undefined && { online }),
        ...(currentSocket !== undefined && { currentSocket }),
      },
      { new: true }
    ).populate("pokemonInventory");

    if (!updated) return res.status(404).json({ message: "Avatar not found" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update avatar" });
  }
});

// CATCH POKEMON
router.post("/:avatarId/pokemon/catch", async (req, res) => {
  try {
    const { mapPokemonId } = req.body;

    const avatar = await Avatar.findById(req.params.avatarId);
    if (!avatar) return res.status(404).json({ message: "Avatar not found" });

    const mapPokemon = await MapPokemon.findById(mapPokemonId);
    if (!mapPokemon) return res.status(404).json({ message: "Map Pokémon not found" });

    const playerPokemon = await PlayerPokemon.create({
      name: mapPokemon.name,
      type: mapPokemon.type,
      is_shiny: mapPokemon.is_shiny,
      attack: mapPokemon.attack,
      hp: mapPokemon.hp
    });

    avatar.pokemonInventory.push(playerPokemon._id);
    await avatar.save();

    await mapPokemon.deleteOne();

    await avatar.populate("pokemonInventory");

    return res.json({ avatar, playerPokemon });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Catch failed" });
  }
});

export default router;

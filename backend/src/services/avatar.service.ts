import mongoose from "mongoose";
import Avatar, { IAvatar } from "../db/avatar";
import User from "../db/user";
import MapPokemon from "../db/mapPokemon";
import PlayerPokemon from "../db/playerPokemon";

// Create avatar & link with user
export interface CreateAvatarInput {
  userId: string;
  userName: string;
  avatar: string;
  characterOption: number;
}

export async function createAvatar({
  userId,
  userName,
  avatar,
  characterOption,
}: CreateAvatarInput) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

  const newAvatar = await Avatar.create({
    userName,
    avatar,
    characterOption,
    pokemonInventory: [],
    user: userId,
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { avatar: newAvatar._id },
    { new: true }
  );

  if (!updatedUser) throw new Error("User not found");

  return newAvatar;
}

// Get single avatar information
export interface GetAvatarInput {
  avatarId: string;
}

export async function getAvatarById({ avatarId }: GetAvatarInput) {
  if (!mongoose.Types.ObjectId.isValid(avatarId)) {
    throw new Error("Invalid avatar ID");
  }

  const avatar = await Avatar.findById(avatarId)
    .populate("pokemonInventory")
    .populate({
      path: "guild",
      select: "image",
    });

  if (!avatar) {
    throw new Error("Avatar not found");
  }

  return avatar;
}

// Update single avatar information
export interface UpdateAvatarInput {
  avatarId: string;
  data: Partial<{
    userName: string;
    avatar: string;
    characterOption: string;
    pokemonInventory: mongoose.Types.ObjectId[];
    guild: mongoose.Types.ObjectId;
    battleWin: number;
    battleLoss: number;
    raceWin: number;
    raceLoss: number;
    currentBattle: mongoose.Types.ObjectId | null;
    battleHistory: any[];
    online: boolean;
    currentSocket: string | null;
  }>;
}

export async function updateAvatar({ avatarId, data }: UpdateAvatarInput) {
  if (!mongoose.Types.ObjectId.isValid(avatarId)) throw new Error("Invalid avatar ID");

  const updated = await Avatar.findByIdAndUpdate(
    avatarId,
    { ...data },
    { new: true }
  ).populate("pokemonInventory");

  if (!updated) throw new Error("Avatar not found");

  return updated;
}

// Catch a pokemon
export interface CatchPokemonInput {
  mapPokemonId: string;
  userId: string;
}

export async function catchPokemon({ mapPokemonId, userId }: CatchPokemonInput) {
  if (!mongoose.Types.ObjectId.isValid(mapPokemonId)) throw new Error("Invalid map Pokemon ID");
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

  const user = await User.findById(userId).populate<{ avatar: IAvatar }>("avatar");
  if (!user || !user.avatar) throw new Error("Avatar not found");
  const avatar = user.avatar;

  const mapPokemon = await MapPokemon.findOneAndDelete({ _id: mapPokemonId });
  if (!mapPokemon) throw new Error("Map Pokemon already caught");

  const playerPokemon = await PlayerPokemon.create({
    name: mapPokemon.name,
    type: mapPokemon.type,
    is_shiny: mapPokemon.is_shiny,
    attack: mapPokemon.attack,
    hp: mapPokemon.hp,
  });

  // Atomically push to avatar inventory
  const updatedAvatar = await Avatar.findByIdAndUpdate(
    avatar._id,
    { $push: { pokemonInventory: playerPokemon._id } },
    { new: true }
  ).populate("pokemonInventory");

  if (!updatedAvatar) throw new Error("Failed to update avatar inventory");

  return { avatar: updatedAvatar, playerPokemon };
}

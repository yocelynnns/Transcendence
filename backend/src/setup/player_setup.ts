import Player from "../models/Player.js";
import Pokemon from "../models/Pokemon.js";
import PlayerTeam from "../models/PlayerTeam.js";
import PlayerPokemonStats from "../models/PlayerPokemonStats.js";

export const setupPlayers = async () => {
  // 1) Create the player
  const player = await Player.findOneAndUpdate(
    { username: "yoce" },
    {
      $setOnInsert: {
        username: "yoce",
        password: "password",
        avatarUrl: "",
        battleWin: 0,
        battleLoss: 0,
        raceWin: 0,
        raceLoss: 0,
        pokemons: [],
      },
    },
    { upsert: true, new: true }
  );

  // 2) Pick the Pokémon that will form the player's team
  const inventoryNames = ["Bulbasaur", "Squirtle", "Charmander", "Pikachu", "Oddish", "Ponyta"];
  const ownedPokemons = await Pokemon.find({ name: { $in: inventoryNames } });

  // 3) Save inventory onto player
  player.pokemons = ownedPokemons.map((p) => p._id);
  await player.save();

  // 4) Seed battle team slots
  const slots = [
    { slot: 1, name: "Bulbasaur" },
    { slot: 2, name: "Squirtle" },
    { slot: 3, name: "Charmander" },
    { slot: 4, name: "Pikachu" },
    { slot: 5, name: "Oddish" },
    { slot: 6, name: "Ponyta" },
  ];

  const idByName = new Map(ownedPokemons.map((p) => [p.name, p._id]));

  for (const s of slots) {
    // Get the Pokémon ID for the current slot
    const pokemonId = idByName.get(s.name);

    // If the Pokémon wasn't found in the DB, skip this slot
    if (!pokemonId) continue;

    // 5) Upsert the player's team slot
    await PlayerTeam.updateOne(
      { playerId: player._id, slot: s.slot },
      { $set: { pokemonId } },
      { upsert: true }
    );

    // 6) Ensure a stats document exists for this player + Pokémon
    await PlayerPokemonStats.updateOne(
      { playerId: player._id, pokemonId },
      { $setOnInsert: { usageBattleNum: 0, raceUsageNum: 0, usageTotalNum: 0 }},
      { upsert: true }
    );
  }

  console.log("✅ Player + team + stats seeded");
};

/*
  MongoDB upsert behavior:

  - updateOne / findOneAndUpdate with upsert: true
    → If document exists: update it
    → If document does NOT exist: insert a new one

  - $setOnInsert
    → Applied ONLY when a new document is inserted
    → Ignored when updating existing documents
*/

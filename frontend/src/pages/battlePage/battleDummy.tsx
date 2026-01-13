import { useEffect, useState } from "react";
// import { Types } from "mongoose";
import StatusPanel from "./statusPanel";
// import { IBattlePokemon } from "../models/Battle"; // adjust path

export default function BattleDummy() {
  // --- Player team ---
  const playerTeam: IBattlePokemon[] = [
    {
      pokemonId: new Types.ObjectId(),
      name: "TOGEPI",
      type: "Fairy",
      attack: 5,
      maxHp: 10,
      currentHp: 10,
      isDead: false,
    },
    {
      pokemonId: new Types.ObjectId(),
      name: "SHINY TOGEPI",
      type: "Fairy",
      attack: 6,
      maxHp: 12,
      currentHp: 9,
      isDead: false,
    },
    {
      pokemonId: new Types.ObjectId(),
      name: "SLOWPOKE",
      type: "Water/Psychic",
      attack: 7,
      maxHp: 15,
      currentHp: 15,
      isDead: false,
    },
  ];

  // --- Enemy team ---
  const enemyTeam: IBattlePokemon[] = [
    {
      pokemonId: new Types.ObjectId(),
      name: "CLEFFA",
      type: "Fairy",
      attack: 5,
      maxHp: 10,
      currentHp: 10,
      isDead: false,
    },
    {
      pokemonId: new Types.ObjectId(),
      name: "SHINY CLEFFA",
      type: "Fairy",
      attack: 6,
      maxHp: 12,
      currentHp: 11,
      isDead: false,
    },
    {
      pokemonId: new Types.ObjectId(),
      name: "VULPIX",
      type: "Fire",
      attack: 7,
      maxHp: 14,
      currentHp: 14,
      isDead: false,
    },
  ];

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {/* Enemy status panels */}
      <div>
        {enemyTeam.map((p, i) => (
          <StatusPanel key={i} pokemon={p} isPlayer={false} />
        ))}
      </div>

      {/* Player status panels */}
      <div>
        {playerTeam.map((p, i) => (
          <StatusPanel key={i} pokemon={p} isPlayer={true} />
        ))}
      </div>
    </div>
  );
}

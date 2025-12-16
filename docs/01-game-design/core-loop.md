# Core Game Loop

This document describes the design discussion and finalized core gameplay loop for the Transcendence Pokémon-style multiplayer game.

---

## 1. Design Questions

These questions guided early team discussions and scope decisions.

1. What happens when a player first logs in?
2. What is the main activity loop? (Explore → Encounter → Battle → Catch)
3. How do battles work? (Turn-based or real-time)
4. How do players interact with each other? (PVP, chat, co-op)
5. How does progression work? (Levels, items, currency)

---

## 2. Discussion Points

The following points were considered during planning:

- Story or narrative: **No**
- Pokémon species count: **~10**
- Battle complexity:
  - Simple stats (HP / ATK / DEF)
  - No complex type advantage system
- Multiplayer focus:
  - PVP battles
  - Optional co-op encounters
  
---

## 3. Decisions & Scope Boundaries

After discussion, the following scope decisions were made:

- No storyline or quest system
- Small, focused map only
- Limited Pokémon count (~10)
- Simple battle mechanics
- Multiplayer focus on PVP

These decisions are intentional to ensure timely completion.

---

## 4. Finalized Core Game Loop

The finalized gameplay loop is as follows:

1. Player logs in and spawns in a small village area.
2. Player explores a 2D top-down map using keyboard controls.
3. Grass tiles trigger random wild Pokémon encounters.
4. Battles are turn-based:
   - Player vs AI (wild Pokémon)
   - Player vs Player (PVP)
5. Player can catch defeated wild Pokémon and add them to their party.
6. Player gains experience points and coins from battles.
7. Coins can be used in a small shop to buy items such as Pokéballs and potions.
8. Players can interact with others via chat and challenge them to PVP battles.

---

## 5. Notes

This document serves as the authoritative reference for core gameplay behavior.  
Any changes to the core loop must be discussed and agreed upon by the team.

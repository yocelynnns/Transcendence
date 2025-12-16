# Core Game Loop

This document proposes an initial gameplay flow to guide team discussion.
The core loop is **not finalized** and will be refined after team agreement.

---

## 1. Design Questions

These questions guided early team discussions and helped define the project scope:

1. What happens when a player first logs in?
2. What is the main gameplay loop? (Explore → Encounter → Battle → Catch)
3. How do battles work? (Turn-based or real-time)
4. How do players interact with each other? (PVP, chat, co-op)
5. How does progression work? (Levels, items, currency)

---

## 2. Design Decisions

Based on discussion, the following decisions were finalized:

- No storyline or quest system
- One small, focused map
- Approximately 10 Pokémon species
- Simple turn-based battle system
  - Stats limited to HP / ATK / DEF
  - No complex type advantage system
- Multiplayer focused primarily on PVP
- Optional co-op encounters only if time allows

These decisions are intentional to control scope and ensure timely completion.

---

## 3. Proposed Core Gameplay Loop (Draft)

The finalized gameplay loop is as follows:

1. The player logs in or registers an account.
2. Upon login, the player spawns in a small village area.
3. The player explores a 2D top-down map using keyboard controls.
4. Grass tiles may trigger random wild Pokémon encounters.
5. Encounters initiate a turn-based battle:
   - Player vs AI (wild Pokémon)
   - Player vs Player (PVP)
6. During battles, players select actions each turn.
7. Defeating Pokémon rewards:
   - Experience points
   - Coins
8. Defeated wild Pokémon can be captured and added to the player’s party (maximum of 4).
9. Coins can be spent in a basic shop to purchase items such as Pokéballs and potions.
10. Players may interact with others via a basic chat system and challenge them to PVP battles.

---

## 4. Progression

- Pokémon gain experience and levels through battles.
- Players strengthen their party and improve battle performance.
- Player progress is persistent across sessions.

---

## 5. Notes

This document serves as the authoritative reference for core gameplay behavior.  
Any changes to the core loop must be discussed and approved by the team.


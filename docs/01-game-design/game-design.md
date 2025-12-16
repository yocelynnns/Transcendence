# Game Design Document (GDD) — Draft

This document captures the **proposed game design direction** for Transcendence.
Values and mechanics marked as **TBD** are intentionally open for discussion.

---

## 🎯 Core Game Loop (Proposed)

The intended player experience follows this loop:

1. **Explore** — Move around a 2D top-down world
2. **Encounter** — Grass tiles may trigger wild Pokémon battles
3. **Battle** — Turn-based combat (wild Pokémon or PVP)
4. **Catch** — Use Pokéballs to capture wild Pokémon
5. **Build** — Manage a party of up to 4 Pokémon
6. **Socialize** — Chat, friends, and optional guilds

This loop is designed to be **simple, repeatable, and multiplayer-friendly**.

---

## 🗺️ World Design (Draft)

**Map Size:** TBD  
(e.g. 50×50 or 100×100 tiles — small, single map)

**Tile Types:**
- Grass — encounter zone
- Path — safe movement
- Water — blocked
- Buildings — entrances (shop / safe area)

**Encounter Zones (Proposed):**
- Grass tiles: ~10% encounter chance (TBD)
- ~10 Pokémon species total (MVP)
- Wild Pokémon level range: 5–15 (TBD)

---

## ⚔️ Battle System (Draft)

**Battle Type:** Turn-based

**Core Stats:**
- HP
- Attack
- Defense

(No complex type advantage system in MVP)

### Turn Flow (Proposed)
1. Player selects a move
2. Opponent selects a move (AI or player)
3. Turn order determined by Speed (TBD) or fixed order
4. Damage calculation
5. Check for fainted Pokémon

**Damage Formula (Initial Proposal):**
```

damage = (attack × move_power) / defense

```
*(Subject to tuning; simplicity preferred)*

### Moves

Moves are predefined actions that determine damage during battle.

Each move has:
- **power** — used as `move_power` in the damage calculation
- Optional secondary attributes (e.g. accuracy or effects), not required for MVP

Moves are shared across Pokémon.
Each Pokémon can have **2–3 predefined moves**.
```
Example:
- Tackle → power: 10
- Bite → power: 12
```

---

## 🐾 Pokémon System (Draft)

**Total Species:**
- MVP: ~10 Pokémon
- Expand only if time allows

**Each Pokémon Has:**
- Type (Fire, Water, Grass, etc.) — cosmetic or light logic
- Base stats (HP / ATK / DEF)
- 2–3 moves
- Front/back sprite

**Party Size:** Max 4 Pokémon  
**PC Storage:** Unlimited (simplified, no box UI complexity)

---

## 👥 Multiplayer Features (Draft)

### PVP Battles
- Challenge nearby or online players
- Turn-based, synchronized via WebSockets
- Battle history recorded

### Social Features
- Global chat
- Friends list
- Guilds / clans (optional, time permitting)

---

## 📈 Progression & Economy (Draft)

**Leveling:**
- Pokémon gain XP from battles
- Simple level scaling

**Catching:**
- Pokéballs have success rate
- Success influenced by Pokémon HP (TBD)

**Currency:**
- Coins earned from battles and map interactions

**Items:**
- Pokéballs
- Potions
- Basic consumables only

---

## 🎨 Art & Assets (Draft)

**Visual Style:** Pixel art

**Sprite Size:** TBD (16×16 or 32×32)

**Asset Priority:**
1. Player sprites (4 directions)
2. Pokémon sprites (~10 species)
3. Tile set (grass, path, water)
4. UI elements (battle, menus)

---

## ⚙️ Technical Constraints (Design-Level)

**Performance Targets:**
- ~60 FPS on modern browsers
- Max visible players: ~20
- WebSocket connections: 50+ concurrent (target)

**Browser Support:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

---

## ❓ Open Design Questions (To Be Decided)

These are **intentionally unresolved**:

1. Type advantages? (Fire > Grass > Water?)
2. Battle depth: purely stat-based or light modifiers?
3. Pokémon abilities? (Likely no for MVP)
4. Evolution system? (Probably out of scope)
5. Exact number of moves per Pokémon?
6. Day/night cycle? (Likely out of scope)

---

## 🚧 Design Philosophy

- Not a full MMO
- Gameplay clarity > feature quantity
- Simple systems first, polish later
- Cut features aggressively if timeline is threatened

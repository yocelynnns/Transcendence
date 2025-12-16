# Features

This document defines feature commitments and development priorities.

---

## MVP (Must Have — Required for Completion)

These features are required to deliver a playable product and validate 14+ module points.

- Authentication (login / register)
- 2D world rendering and player movement
- Wild Pokémon encounters
- Turn-based battle system
- Catching mechanics
- Party management (max 4 Pokémon)
- Coin system (battle & map rewards)
- Basic item shop (Pokéballs, potions)
- Real-time multiplayer sync (WebSockets)
- Basic PVP battles
- Basic friends system
- Dockerized deployment

---

## Nice to Have (If Time Allows)

These features improve usability and engagement but are not required for MVP validation.

- Expanded item shop (upgrades, buffs)
- Online / offline friend status
- Private or guild chat
- Guilds / clans
- Achievements / badges
- Optional co-op raid boss

---

## Out of Scope

These features will not be implemented.

- Trading systems
- Complex or large maps
- Advanced battle mechanics
- Mobile application
- Storylines or quest systems

---

## Dependencies

- Player movement is required before encounters.
- Battle system is required before PVP.
- WebSockets are required before chat and social features.

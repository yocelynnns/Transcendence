# Constraints & Non-Goals

This document outlines the intentional constraints and non-goals for the Transcendence project.  
These decisions are made to control scope, reduce risk, and ensure the project is completed within the given timeline.

---

## 1. Scope Constraints

To keep the project manageable:

- 2D top-down gameplay only
- One small map (village + grass area)
- ~10 Pokémon species
- Simple turn-based battles (HP / ATK / DEF, 2–3 moves)
- Multiplayer focused on PVP
- Optional features added only if time allows

---

## 2. Explicit Non-Goals

The following features are intentionally **out of scope**:

- Large open-world maps
- Storylines, quests, or narrative systems
- Trading or breeding mechanics
- Complex Pokémon type advantage systems
- MMO-scale gameplay or persistence
- Advanced AI behaviors beyond basic wild encounters
- Extensive cosmetic customization systems

---

## 3. Technical Constraints

To reduce technical risk, the following technical boundaries apply:

- One primary frontend framework (React?)
- One backend service acting as the authoritative game server
- One relational database (PostgreSQL?)
- Real-time communication handled exclusively via WebSockets
- No external game engines (e.g. Unity, Unreal)

---

## 4. Change Management

Any request to add features outside this document must:

1. Be discussed by the team
2. Be evaluated for impact on timeline and module points
3. Be approved by the Product Owner and Project Manager

If a feature threatens the delivery of the MVP, it will be deferred or rejected.

---

## 5. Rationale

These constraints ensure:
- The core gameplay loop is completed and playable
- Required Transcendence modules are demonstrable
- The project can be delivered on time
- All team members can clearly explain their contributions during evaluation

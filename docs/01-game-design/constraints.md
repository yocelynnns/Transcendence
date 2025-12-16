# Constraints & Non-Goals

This document outlines the **proposed constraints and non-goals** for the Transcendence project.  
> These constraints are intended to guide early planning and discussion, and will be finalized after feature and architecture decisions are agreed upon by the team.

---

## 1. Proposed Scope Constraints

To keep the project manageable and aligned with the MVP:

- The game is strictly **2D top-down**
- Only **one small map** (village + grass area) is implemented
- Pokémon species count is limited to **approximately 10**
- Battles use a **simple turn-based system**
  - Stats limited to **HP / ATK / DEF**
  - Each Pokémon has **2–3 moves**
- Party size is capped at **4 Pokémon**
- Progression uses a **simple XP and coin system**
- Multiplayer focuses primarily on **PVP battles**
- Optional features are added **only after MVP completion**

---

## 2. Explicit Non-Goals

The following features are intentionally **out of scope**:

- Large or complex open-world maps
- Storylines, quests, or narrative systems
- Trading or breeding mechanics
- Complex Pokémon type advantage systems
- MMO-scale persistence or world simulation
- Advanced AI behaviors beyond basic wild encounters
- Extensive cosmetic customization systems
- Mobile application support

---

## 3. Technical Constraints

To reduce technical complexity and implementation risk:

- One frontend framework (**React?**)
- One backend service acting as the authoritative game server
- One relational database (**PostgreSQL?**)
- Real-time communication handled via **WebSockets**
- No external game engines (e.g. Unity, Unreal)

---

## 4. Change Management

Any feature request outside these constraints must:

1. Be discussed by the team
2. Be evaluated for impact on timeline and module validation
3. Be approved by the Product Owner and Project Manager

If a feature risks delaying MVP delivery, it will be deferred or rejected.

---

## 5. Rationale

These constraints ensure that:

- The core gameplay loop is completed and playable
- Required Transcendence modules are clearly demonstrable
- The project can be delivered within the planned timeline
- All team members can clearly explain their design and implementation decisions during evaluation


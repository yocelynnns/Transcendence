# API Design — Planning (Draft)

This document outlines the **initial API design ideas** for the Transcendence project.

At this stage, the API is **not finalized**.  
The purpose of this document is to support discussion and early planning, not to lock implementation details.

Final API decisions will be made after:
- Core gameplay features are finalized
- Real-time vs REST responsibilities are clearly defined
- Technical architecture decisions are agreed upon by the team

---

## 1. Proposed REST Endpoints

The following endpoints represent **likely requirements** based on the current feature scope.

### Authentication & User
- [ ] POST `/auth/register`  
- [ ] POST `/auth/login`  
- [ ] GET `/profile`  
- [ ] GET `/users/:id`

### Gameplay & Battles
- [ ] POST `/battles/challenge`
- [ ] POST `/battles/:id/move`
- [ ] GET `/battles/:id`
- [ ] GET `/battles/history`

### Pokémon & Progression
- [ ] GET `/pokemon`
- [ ] GET `/party`
- [ ] POST `/party/update`
- [ ] GET `/inventory`

> Route names, request bodies, and authorization rules will be finalized later.

---

## 2. Proposed WebSocket Events

WebSockets will be used for **real-time gameplay and player interaction**.

### World & Player
- [ ] `player:move`  
  *(real-time position updates)*

- [ ] `player:join`  
  *(player enters the world)*

- [ ] `player:leave`  
  *(player disconnects)*

### Chat & Social
- [ ] `player:chat`  
  *(basic in-game messaging)*

- [ ] `friend:status`  
  *(online / offline updates)*

### Battles
- [ ] `battle:invite`  
  *(PVP challenge request)*

- [ ] `battle:start`  
  *(battle initialization)*

- [ ] `battle:turn`  
  *(turn synchronization)*

- [ ] `battle:end`  
  *(battle result and cleanup)*

---

## 3. Proposed Data Models (Conceptual)

These models represent **conceptual structures**, not final database schemas.

### User
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "createdAt": "timestamp"
}
```

### Pokemon

```json
{
  "id": "string",
  "name": "string",
  "stats": {
    "hp": "number",
    "atk": "number",
    "def": "number"
  },
  "moves": ["string"]
}
```

### Battle

```json
{
  "id": "string",
  "players": ["userId"],
  "currentTurn": "userId",
  "state": "active | finished"
}
```

Additional entities (items, inventory, friends) will be added as features are confirmed.

---

## 4. Open Design Questions

The following questions must be resolved before implementation begins:

* Which actions must be real-time?
* Which interactions can safely use REST?
* How is authentication handled for WebSocket connections?
* How much game state should be server-authoritative?
* What data needs to be persisted vs kept in memory?

---

## 5. Notes

This document is intentionally high-level and exploratory.

No API implementation should begin until:

* Features are finalized
* Architecture is agreed upon
* Responsibilities between REST and WebSockets are clearly defined

This file will be updated as decisions are made.


# Database Design — Exploration & Planning (Draft)

This document explores possible database schema approaches for the Transcendence project.

At this stage, **no schema is finalized**.  
The goal is to compare design options and understand trade-offs before implementation.

Final database decisions will be made after:
- Core gameplay features are finalized
- API responsibilities are clearer
- Real-time vs persistent data is defined

---

## Option 1: Normalized Relational Schema (Candidate)

A traditional relational schema with clearly defined tables and relationships.

### Example Tables
**users**
- id
- email
- username
- created_at

**pokemon_species**
- id
- name
- base_stats
- move_set

**user_pokemon**
- id
- user_id
- species_id
- level
- experience

**battles**
- id
- player1_id
- player2_id
- state
- result

### Pros
- Clear relationships
- Easier to query and maintain
- Aligns well with Prisma ORM usage
- Scales better as features grow

### Cons
- More tables to manage
- Slightly higher initial setup cost

---

## Option 2: Simplified / JSON-Centric Schema (Candidate)

A minimal schema using JSON fields to store dynamic game data.

### Example Tables
**users**
- id
- email
- username
- data (JSON: party, inventory, stats)

**battles**
- id
- players (JSON)
- battle_log (JSON)

### Pros
- Faster initial development
- Flexible structure for rapid changes

### Cons
- Harder to query and index
- Less explicit relationships
- Can become difficult to maintain as complexity grows

---

## Discussion Points

The following questions will guide the final schema decision:

- How complex should relationships between entities be?
- Which data is mostly static (e.g. Pokémon species)?
- Which data is dynamic (e.g. battles, inventory)?
- What queries will be frequent during gameplay?
- What data must be persistent vs ephemeral?

---

## Decisions (To Be Determined)

- Schema approach: **TBD**
- Initial core tables: **TBD**
- Seed data requirements: **TBD**

These decisions will be finalized after feature and architecture discussions.

---

## Notes

This document is intentionally exploratory.
The final schema may combine aspects of both approaches.
Once implementation begins, the schema will be treated as locked and changes will be minimized.

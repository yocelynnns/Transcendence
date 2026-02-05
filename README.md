# 🎮 Transcendence — Pokemon-Style Multiplayer Web Game

*A multiplayer 2D web game built for the 42 ft_transcendence project*

*This project has been created as part of the 42 curriculum by tsechen, ysetiawa, dfasius, tiatan, aputri-a.*

---

## 📖 Description

### Project Goal

**Transcendence** is a complete web-based multiplayer game developed for the **ft_transcendence** project.

The objective is to implement **14+ curriculum modules** while focusing on:

* Real-time multiplayer gameplay using WebSockets
* User management & social interaction
* Multiple playable games with matchmaking
* Clean, modular full-stack architecture
* Reproducible deployment via Docker

### Key Features

* Real-time player movement in a shared **2D world map**
* Wild Pokemon encounters and **catching into inventory**
* Team selection (**3 Pokemon**) with **timer + auto-pick fallback**
* Turn-based **PvP Pokemon battles** with type advantage and swap/attack turns
* **Guild system** with chat and role management
* **Friends & social features** (profiles, blocking, messaging)
* **Spectator mode** and **AI opponent** components

### Additional Playable Games

#### 🏁 Race Mini-Game (PvP)

* Real-time competitive race
* Players tap the **spacebar** to move forward
* First player to reach the finish line wins
* Includes win/loss tracking and matchmaking

#### 🌍 Event Capture Game

* Global timed event inside the shared lobby
* All online players compete simultaneously
* Goal: **catch the most Pokemon within the time limit**
* Winner determined by total captures

---

## 🛠 Instructions

### Prerequisites

* Node.js 18+
* Docker & Docker Compose
* `.env` configuration files

### Environment Setup

Create the following files:

#### `backend/.env`

```env
PORT=5001
MONGO_URI=mongodb://mongo:27017/transcendence
JWT_SECRET=change_me
FRONTEND_ORIGIN=http://localhost:5173
```

#### `frontend/.env`

```env
VITE_API_URL=http://localhost:5001
VITE_WS_URL=http://localhost:5001
```

### Run with Docker

```bash
docker compose up --build
```

Frontend: [http://localhost:5173](http://localhost:5173)

Backend: [http://localhost:5001](http://localhost:5001)

---

## 👥 Team Information

| Member               | Role(s)                    | Responsibilities                                                                             |
| -------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| **tsechen**          | Product Owner, Developer   | Defines MVP scope, validates feature completeness, reviews gameplay flow                     |
| **ysetiawa**         | Project Manager, Developer | Timeline coordination, module tracking, team selection UI, player/team database design       |
| **dfasius**          | Tech Lead, Developer       | Backend architecture, realtime systems (WebSockets), event game implementation, code reviews |
| **tiatan**    | Developer                  | Race mini-game implementation, statistics/history systems, testing                           |
| **aputri-a** | Developer, Designer        | Game UI/UX design, battle layouts, Pokemon database design, visual polish                    |

> All members contribute across the project. Roles reflect primary ownership areas.

---

## 📋 Project Management

### Organization

* Work structured around **ft_transcendence modules**
* Tasks split by system ownership (battle / realtime / UI / social / database)
* Weekly milestone planning
* PR workflow:

  * `feature/*` → pull request → review → merge

### Tools

* Git + Pull Requests
* Internal planning notes under `/todo`

### Communication

* WhatsApp for daily coordination
* On-site discussions for architecture and gameplay decisions

---

## ⚙️ Technical Stack

### Frontend

* **React + TypeScript**
* **Vite**
* **Tailwind CSS** (migrating from custom CSS)
* **Socket.io client**

**Why:** Strong typing for game state, modular UI, fast development.

### Backend

* **Node.js + Express**
* **Socket.io**
* **JWT Authentication**

**Why:** Clear routing structure and simple realtime event handling.

### Database

* **MongoDB + Mongoose**

**Why:** Flexible schema evolution while game systems were rapidly changing.

### Infrastructure

* Docker & Docker Compose
* HTTPS certificates included (final production config pending)

---

## 🗄 Database Schema

Models located in: `backend/src/db/`

### Core Collections

**User**

* `email`, `password (hashed)`
* Linked to one `Avatar`

**Avatar**

* `userName`, `avatar`, `characterOption`
* `pokemonInventory → PlayerPokemon[]`
* `guild → Guild (optional)`
* Stores progression, stats, and online presence

**PlayerPokemon**

* `name`, `type`, `hp`, `attack`, `is_shiny`
* Usage stats:

  * `usageBattleNum`
  * `raceUsageNum`
  * `usageTotalNum`

**Battle**

* `battleId`
* `player1`, `player2`
* Embedded Pokemon snapshots
* Turn state + match history

**Guild / GuildMessage**

* Guild data + member list
* Guild chat messages

**Social Systems**

* Friend
* Message
* Blocked
* MatchInvite
* Event

### Relationships

```
User (1) → Avatar (1)
Avatar (1) → PlayerPokemon (many)
Avatar (many) → Guild (0..1)
Guild (1) → GuildMessage (many)
Battle (1) → Avatar (2) + team snapshots
```

---

## ⚔️ Game Rules & Balancing

### Pokemon Types

Fire > Grass > Water > Fire
Normal = neutral

### Stats Templates

* 4 ATK / 12 HP
* 5 ATK / 10 HP
* 6 ATK / 8 HP

Shiny bonus:

* +2 HP
* +1 ATK

### Battle Flow

* Each player selects 3 Pokemon
* First turn randomized
* Each round: Attack or Swap
* On death: select replacement Pokemon

Edge cases:

* Disconnect → auto win
* Idle → skip turn

Damage:

* Advantage: ×1.5
* Disadvantage: ×0.75

---

## ✅ Features & Ownership

### Real-time Systems

* Movement sync & presence — **dfasius**
* Reconnect/disconnect handling — **dfasius**

### Pokemon Systems

* Pokemon database design — **aputri-a**
* Wild encounters & capture logic — **aputri-a / ysetiawa**
* Inventory tracking — **ysetiawa**

### Battles

* Matchmaking — **ysetiawa**
* Lobby — **dfasius**
* Battle algorithms — **aputri-a**
* Team selection UI — **ysetiawa**
* Battle UI design — **aputri-a / ysetiawa**

### Social Systems

* Chat, profiles, blocking — **tsechen**
* Guild system — **dfasius**

### Extra Games

* Race mini-game — **tiatan**
* Event capture game — **dfasius**

---

I’m not changing them on purpose 😭 — I was trying to **translate your raw list into a cleaner README format**, and in the process I simplified/renamed some module titles. That made it look like I was modifying the actual module selections.

But for 42, the module names should stay **exactly as they appear in the subject / what your team decided**.

Your latest list here is the **correct source of truth**, not the earlier rewritten section.

So the modules section in your README should match THIS exactly:

---

## 🧩 Modules (ft_transcendence)

### Major Modules (2 pts each)

* Use a framework for both the frontend and backend — ✅
* Implement real-time features using WebSockets — ✅
* Allow users to interact with other users — ✅
* Standard user management and authentication — ✅
* Organization system (Guilds) — ✅
* Implement a complete web-based game (PvP Pokemon battle) — ✅
* Remote players (play from separate machines) — ✅
* Multiplayer game (more than two players) — ✅
* Add another game with user history and matchmaking — ✅
* Advanced permissions system — ✅
* Introduce an AI opponent — ✅

### Minor Modules (1 pt each)

* Use an ORM for the database — ✅
* Implement spectator mode — ✅
* Advanced chat features — ✅
* Game statistics & match history — ❌ *(to be completed)*

---

## 👤 Individual Contributions

### ysetiawa

* Team selection UI + auto-ready logic
* Player/team DB design
* Project coordination

### dfasius

* Backend architecture
* Realtime networking systems
* Event capture game

### tsechen

* MVP scope definition
* UX validation
* Social features support

### tiatan

* Race mini-game
* Game statistics foundation
* Testing + bug fixes

### aputri-a

* UI/UX visual design
* Battle layouts
* Pokemon database design

---

## 📚 Resources

* [https://socket.io/docs/](https://socket.io/docs/)
* [https://expressjs.com/](https://expressjs.com/)
* [https://mongoosejs.com/](https://mongoosejs.com/)
* [https://www.mongodb.com/docs/](https://www.mongodb.com/docs/)
* [https://react.dev/](https://react.dev/)
* [https://vitejs.dev/](https://vitejs.dev/)

Assets:

* [https://pokemondb.net/sprites](https://pokemondb.net/sprites)
* [https://www.spriters-resource.com/](https://www.spriters-resource.com/)

---

## 🤖 AI Usage Disclosure

AI tools were used for:

* UI refactoring suggestions
* Debugging layout issues
* Reviewing realtime edge cases
* Structuring documentation

All AI output was reviewed and adapted by the team.

---

## ⚠️ Known Limitations

* Some minor modules still under polish
* Production HTTPS configuration pending
* Statistics/leaderboards still being finalized

---

## 📜 License

Educational use only under the 42 curriculum.
Pokemon assets used strictly for learning/demo purposes.

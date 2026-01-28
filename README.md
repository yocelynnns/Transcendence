# 🎮 Transcendence — Pokémon-Style Multiplayer Web Game

*A real-time multiplayer game built for the 42 ft_transcendence project*

> Developed at **42** by
> **tsechen**, **ysetiawa**, **dfasius**, **tiatan**, **aputri-a**

---

## 📖 Overview

**Transcendence** is a **Pokémon-inspired multiplayer web game** featuring real-time player interaction, wild encounters, and turn-based PvP battles.

The project is built to satisfy **14+ ft_transcendence module requirements**, focusing on:

* Real-time gameplay with WebSockets
* Multiplayer interactions across machines
* A complete, playable web-based game
* Clean frontend–backend separation
* Dockerized deployment

---

## 🧠 Core Gameplay

* 2D top-down map with real-time player movement
* Wild Pokémon encounters on the map
* Catching Pokémon into a personal inventory
* Team selection (3 Pokémon per battle)
* Turn-based Pokémon battles (HP / ATK / type advantage)
* PvP battles between online players
* Match history & basic statistics

---

## 🛠️ Final Tech Stack

### Frontend

* **React + TypeScript**
* **Vite**
* Custom CSS (Tailwind planned for final polish)
* Canvas / DOM-based 2D rendering
* Socket.io client for real-time sync

### Backend

* **Node.js + Express**
* **Socket.io** (real-time multiplayer)
* **MongoDB + Mongoose**
* REST API + WebSocket event system
* JWT-based authentication

### Infrastructure

* Docker & Docker Compose
* HTTPS (planned before submission)
* Nginx (planned)
* Environment-based configuration

---

## 🧩 Implemented Features (Current State)

### ✅ Core Systems

* User authentication (login / signup)
* Avatar creation & profile
* Pokémon inventory system
* Pokémon catching from map
* Pokémon data models (HP, ATK, type, shiny)
* Team selection UI with timer & auto-ready
* Turn-based battle engine
* Battle state synchronization
* Battle UI (health bars, sprites, actions)

### ✅ Multiplayer & Real-Time

* Player presence & movement sync
* Real-time PvP matchmaking
* WebSocket lobby & battle rooms
* Disconnect handling (auto-win / skip)
* Guild system (basic structure)
* Guild chat (WebSocket)

### 🧪 In Progress / Final Polish

* Game statistics & leaderboards
* Tournament brackets
* Spectator mode (optional)
* AI opponent (wild Pokémon logic)
* Tailwind migration
* HTTPS & production Docker setup
* Privacy policy page
* Documentation finalization

---

## 👥 Team Roles

| Role | Members | Key Responsibilities |
|------|---------|----------------------|
| **Product Owner** | tsechen | MVP scope, feature prioritization, backlog |
| **Project Manager** | ysetiawa | Timeline, coordination, module tracking |
| **Technical Lead** | dfasius | Architecture, code quality, technical decisions |
| **Developers** | tsechen, ysetiawa, dfasius, aputri-a, tiatan | Development, testing, documentation |
> All team members are developers working across the project.

---

## 📦 ft_transcendence Module Coverage

### **Major Modules (Completed / In Progress)**

| Module                             | Points | Status |
| ---------------------------------- | ------ | ------ |
| Web Framework (Frontend + Backend) | 2      | ✅ Done |
| Real-Time Features (WebSockets)    | 2      | ✅ Done |
| User Interaction (Chat, Profiles)  | 2      | ✅ Done |
| Web-Based Game                     | 2      | ✅ Done |
| Remote Players                     | 2      | ✅ Done |
| Multiplayer (3+ Players)           | 2      | ✅ Done |
| Organization System (Guilds)       | 2      | ✅ Done |
| Standard User Management           | 2      | ✅ Done |

### **Minor / Optional Modules**

| Module                    | Points | Status         |
| ------------------------- | ------ | -------------- |
| Game Statistics & History | 1      | 🚧 In progress |
| Tournament System         | 1      | 🚧 In progress |
| ORM / DB Abstraction      | 1      | ✅ Done         |
| AI Opponent               | 2      | ⏳ Optional     |
| Spectator Mode            | 1      | ⏳ Optional     |

**Target:** **14+ points**
**Current projection:** **18–19 points**

---

## 🗂️ Project Structure

```txt
frontend/
├── src/
│   ├── pages/          # Battle, TeamSelect, Profile, Map
│   ├── components/     # UI components
│   ├── ws/             # Socket hooks
│   ├── utils/          # Helpers
│   └── assets/         # Pokémon sprites, UI assets

backend/
├── src/
│   ├── db/             # Mongoose models
│   ├── routes/         # REST API
│   ├── ws/             # Socket handlers
│   ├── middleware/     # Auth, guards
│   └── server.ts

docs/
├── 01-game-design/
├── 02-architecture/
└── 03-implementation/
```

---

## 🚀 Current Timeline & Deadlines

| Date               | Milestone                           |
| ------------------ | ----------------------------------- |
| **29 Jan 2026**    | Feature freeze & internal review    |
| **3 Feb 2026**     | All systems complete                |
| **10 Feb 2026**    | Full testing & evaluation readiness |
| **12–13 Feb 2026** | **Submission window**               |

> Timeline adjusted due to team availability.

---

## 🧪 How to Run Locally

### Prerequisites

* Node.js 18+
* Docker & Docker Compose

### Development

```bash
docker compose up --build
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5001`

---

## ✅ Definition of Done (Submission)

* [x] Multiplayer game playable across machines
* [x] Real-time interactions via WebSockets
* [x] Auth, profiles, and user data
* [x] Pokémon catching & battles
* [x] Team selection & battle UI
* [ ] HTTPS enabled
* [ ] Stats & leaderboard visible
* [ ] Documentation finalized
* [ ] All members can explain architecture & code

---

## 📝 Notes

* Pokémon assets are used for **educational purposes only**
* Project follows **42 ft_transcendence rules**
* Focus is on **engineering & system design**, not IP ownership

---

*Last updated: **Jan 2026***
*ft_transcendence — 42*

---

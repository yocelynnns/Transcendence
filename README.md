# Transcendence — Pokémon-Style Multiplayer Game  
*A multiplayer 2D web game with real-time battles, wild encounters, and progression*

> This project has been created as part of the 42 curriculum by **tsechen**, **ysetiawa**, **dfasius**, **tiatan**, **aputri-a**.

---

## 📖 Description

**Transcendence** is a **Pokémon-inspired multiplayer web game** where players explore a 2D world, catch creatures, battle other players, and build their teams.

### Core Focus
- **Real-time multiplayer** via WebSockets  
- **Clean, modular architecture**  
- **Meeting 14+ module points** for ft_transcendence  
- **Completion target:** End of January 2026  

---

## 🎯 Project Timeline

**Total Duration:** 7 weeks  
**Dates:** Dec 16, 2025 – Jan 31, 2026

### 🚀 Sprint 1: Foundation & Core (Dec 16–27)
*Goal: Working authentication, basic world, and database*
- Week 1: Project setup, architecture decisions, authentication
- Week 2: Basic world rendering, player movement, database models

### ⚡ Sprint 2: Gameplay Core (Dec 30–Jan 10)
*Goal: Working battle system and encounters*
- Week 3: Battle engine, Pokémon data, turn-based logic
- Week 4: Wild encounters, catching mechanics, basic UI

### 🔗 Sprint 3: Multiplayer & Polish (Jan 13–24)
*Goal: PVP battles, social features, polish*
- Week 5: WebSocket integration, PVP battles, chat system
- Week 6: Polish, testing, deployment preparation

### 🎉 Sprint 4: Final Week (Jan 27–31)
*Goal: Testing, deployment, documentation*
- Final testing and bug fixes
- Production deployment
- Documentation completion

---

## 👥 Team Roles

| Role | Members | Key Responsibilities |
|------|---------|----------------------|
| **Product Owner** | tsechen | MVP scope, feature prioritization, backlog |
| **Project Manager** | ysetiawa | Timeline, coordination, communication |
| **Technical Lead** | dfasius | Architecture, code quality, technical decisions |
| **Developers** | tsechen, ysetiawa, dfasius, aputri-a, tiatan | Development, testing, documentation |

> All team members are developers working across the project.

---

## 📋 Compressed Development Plan

### Weeks 1–2: **Core Foundation** (Dec 16–27)
**Must Complete**
- Project setup  
  - Repository structure  
  - Docker configuration  
  - Development environment  

- Authentication  
  - User registration/login  
  - JWT tokens  
  - Protected routes 

- Database  
  - PostgreSQL + Prisma  
  - User, Pokémon, Battle tables  
  - Basic seed data  

- Basic World  
  - 2D tile map rendering  
  - Player movement (WASD)  
  - Simple collision detection  

- Initial Deployment  
  - Docker Compose working  
  - Basic CI/CD pipeline  

---

### Weeks 3–4: **Gameplay Systems** (Dec 30–Jan 10)
**Must Complete**
- Battle Engine  
  - Turn-based combat  
  - Damage calculation (HP / ATK / DEF)  
  - 2–3 moves per Pokémon  
  - Win/loss conditions  

- Pokémon System  
  - ~10 Pokémon  
  - Stats and types  
  - Party management (4 max)  

- Wild Encounters  
  - Grass tile triggers  
  - Random encounters  
  - Catching mechanics  

- Basic UI  
  - Battle screen  
  - Move selection  
  - HP bars  

- MVP Complete  
  - Playable single-player demo  

---

### Weeks 5–6: **Multiplayer & Features** (Jan 13–24)
**Must Complete**
- WebSocket Integration  
  - Real-time position sync  
  - Player presence  
  - Connection management  

- PVP Battles  
  - Battle invitations  
  - Real-time turn sync  
  - Battle history  

- Social Features  
  - Basic chat  
  - Friend system  
  - Online status  

- Polish  
  - Improved battle UI  
  - Responsive design  
  - Error handling  

- Module validation  
  - Ensure 14+ points covered  

---

### Week 7: **Final Polish** (Jan 27–31)
**Must Complete**
- Testing  
  - Unit tests  
  - Integration tests  
  - Browser compatibility  

- Deployment  
  - Production Docker config  
  - HTTPS  
  - Environment variables  

- Documentation  
  - API docs  
  - Setup guide  
  - README finalization  

- Final Review  
  - Code review complete  
  - Features verified  
  - Module points checked  

---

## 📊 Module Points Planning *(To be finalized)*

**Target:** 14+ points (minimum requirement: 14)

| Category | Module | Points | Status |
|----------|--------|--------|--------|
| **Web** | Framework (Frontend + Backend) | 2 | Planned |
| **Web** | Real-time Features (WebSockets) | 2 | Planned |
| **Web** | User Interaction (Chat, Friends) | 2 | Planned |
| **Gaming** | Web-based Game | 2 | Planned |
| **Gaming** | Multiplayer (3+ Players) | 2 | Planned |
| **Gaming** | Remote Players | 2 | Planned |
| **Gaming** | Game Customization (Battle UI) | 1 | Planned |
| **Gaming** | Gamification (Badges, Rewards) | 1 | Planned |
| **Gaming** | Game Statistics | 1 | Planned |
| **User Management** | Organization System (Guilds) | 2 | Planned |
| **Optional** | AI Opponent (Wild Pokémon) | 2 | Buffer |

**Total:** **19 points**  
*(14 core + 3 minor + 2 optional buffer)*

---

## 🚀 Weekly Deadlines

| Week | Dates | Milestone |
|------|------|-----------|
| 1 | Dec 16–20 | Setup, auth |
| 2 | Dec 23–27 | World & movement |
| 3 | Dec 30–Jan 3 | Battle engine |
| 4 | Jan 6–10 | Encounters & MVP |
| 5 | Jan 13–17 | WebSockets & PVP |
| 6 | Jan 20–24 | Social & polish |
| 7 | Jan 27–31 | Testing & deploy |

---

## 🛠️ Technical Stack *(To be finalized)*

**Under Consideration**
- **Frontend:** React/TypeScript vs Vue vs Svelte
- **Backend:** NestJS vs Express vs Fastify
- **Database:** PostgreSQL
- **Real-time:** Socket.io vs native WebSockets
- **State Management:** Zustand vs Redux vs Context
- **Styling:** Tailwind CSS vs Styled Components
- **Deployment:** Docker + Nginx

> Final decisions will be documented in the **Technical Architecture Document**.

---

## 🎮 Game Features *(To be finalized)*

### Core MVP (Must Have – by Jan 24)
- [ ] 2D tile-based world with player movement
- [ ] Wild creature encounters
- [ ] Turn-based battle system
- [ ] Creature catching mechanics
- [ ] Party management (4 max)
- [ ] Docker deployment with HTTPS

### Multiplayer Features
- [ ] Real-time PVP battles
- [ ] Player position sync
- [ ] Basic chat system
- [ ] Friend system
- [ ] Guild/Clan system

### Progression & Social
- [ ] User profiles & stats
- [ ] Inventory & items
- [ ] Achievement system
- [ ] Leaderboards

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Initial Setup
1. Clone repository: `git clone [repository-url]`
2. Create `.env` from `.env.example`
3. Review project structure and documentation

### Development Workflow
1. **Branch naming:** `feature/description` or `fix/description`
2. **Commit messages:** Use conventional commits
3. **PR process:** At least **1 review** required before merge
4. **Testing:** Write tests for new features

---

## 📚 Documentation Structure

```txt
/docs
├── 01-game-design/    # Game Design Document
│   ├── core-loop.md
│   ├── features.md
│   └── constraints.md
├── 02-architecture/   # Technical decisions
│   ├── stack-choice.md
│   ├── api-design.md  # API documentation
│   └── database.md    # Schema & migrations
└── 03-implementation/
    ├── tasks.md
    ├── timeline.md
    └── assignments.md
```

---

## ✅ Definition of Done

- [ ] 14+ modules demonstrable
- [ ] Playable game loop
- [ ] PVP works across machines
- [ ] Auth & profiles working
- [ ] Docker deployment works
- [ ] No critical gameplay bugs
- [ ] README complete
- [ ] All members can explain the code

---

*Last Updated: Dec 16, 2025*  
*Project Start: Dec 16, 2025*  

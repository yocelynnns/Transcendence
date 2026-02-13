*This project has been created as part of the 42 curriculum by tsechen, ysetiawa, dfasius, tiatan, aputri-a.*

# 🎮 Transcendence — Pokemon-Style Multiplayer Web Game

---

## 📖 Description

**Transcendence** is a complete web-based multiplayer game delivering a Pokemon-inspired experience with real-time gameplay, social features, and competitive mini-games.

### Key Features

|Feature|Description|
|-|-|
|**Real-time 2D World**|Shared lobby with player movement, wild Pokemon encounters, and interactions|
|**Pokemon Battle System**|Turn-based PvP combat with type advantages, team selection, and strategic swapping|
|**Collection \& Inventory**|Catch wild Pokemon, manage your collection, build competitive teams|
|**Guild System**|Create/join organizations with role management and guild chat|
|**Social Platform**|Friends list, blocking, direct messaging, user profiles|
|**Additional Games**|Race mini-game and global Event Capture competitions|
|**AI Opponent**|Battle computer-controlled trainers|
|**Spectator Mode**|Watch live battles between other players|

---

## 🛠 Instructions

### Prerequisites

* Node.js 18+
* Docker \& Docker Compose
* Git

### Environment Configuration

**`backend/.env`**

```env
PORT=5001
MONGO\_URI=mongodb://mongo:27017/transcendence
JWT\_SECRET=change\_me
FRONTEND\_ORIGIN=http://localhost:5173
```

**`frontend/.env`**

```env
VITE\_API\_URL=http://localhost:5001
VITE\_WS\_URL=http://localhost:5001
```

### Makefile Commands

|Command|Purpose|
|-|-|
|`make up`|Build and start all containers|
|`make down`|Stop all containers|
|`make restart`|Restart containers|
|`make logs`|Follow live logs|
|`make rebuild`|Full rebuild with npm install|
|`make prune`|Clean Docker resources (keeps database)|
|`make nuke`|⚠️ Destroy everything including database|
|`make bash-backend` / `make bash-frontend`|Enter container shell|

### Common Workflows

```bash
# Start development
make up

# After pulling new code
make restart

# Dependencies changed or build issues
make rebuild

# Nuclear option (full reset)
make reset \&\& make up
```

Access at: http://localhost:22288

---

## 👥 Team Information

|Member|Role(s)|Responsibilities|
|-|-|-|
|**tsechen**|Product Owner, Developer, Testing \& QA|Product vision, backlog prioritization, stakeholder communication, core feature development, test plans, quality gates|
|**ysetiawa**|Project Manager, Developer|Sprint planning, milestone tracking, risk management, race game schema, browser compatibility, game statistics|
|**dfasius**|Technical Lead, Developer, Testing \& QA|Architecture decisions, code review, battle synchronization, AI engine, guild backend, DevOps infrastructure|
|**tiatan**|Developer, Git Lead|Feature implementation, Git workflow management, CI/CD setup, race mechanics, database schema design|
|**aputri-a**|Developer, UI/UX Design|Interface design, responsive layouts, battle UI, achievement system, cross-browser testing, design system|

---

## 📊 Project Management

* **Methodology**: Agile with weekly sprints
* **Task Tracking**: GitHub Issues for features and bug tracking
* **Communication**: WhatsApp (daily sync), On-site meetings (architecture decisions)
* **Version Control**: GitFlow branching strategy — `feature/\*` branches → Pull Request → Code Review → Merge
* **Meetings**: Weekly milestone planning, daily standups, sprint retrospectives
* **Definition of Done**: Feature implemented, tested, reviewed, documented, and merged

---

## ⚙️ Technical Stack

|Layer|Technology|Rationale|
|-|-|-|
|Frontend|React + TypeScript + Vite|Type safety prevents runtime errors, fast HMR accelerates development, modular component architecture|
|Styling|Tailwind CSS|Rapid development with utility classes, consistent design system, easy responsive design|
|Backend|Node.js + Express|Clear routing structure, extensive middleware ecosystem, team familiarity|
|Real-time|Socket.io|Reliable WebSocket with automatic fallbacks, built-in room management, reconnection handling|
|Database|MongoDB + Mongoose|Flexible schema for evolving game systems, embedded documents for battle snapshots, horizontal scaling|
|Auth|JWT|Stateless authentication scales horizontally, no server-side session storage needed|
|Infrastructure|Docker Compose|Reproducible deployments across team, single-command setup, consistent environments|

### Key Technical Decisions

|Decision|Rationale|
|-|-|
|MongoDB vs PostgreSQL|Flexible schema better suited for evolving game systems; embedded documents ideal for battle state snapshots|
|Socket.io vs native WebSockets|Built-in reconnection, room management, and fallback transports reduce implementation complexity|
|React + Vite vs Next.js|Faster HMR critical for game development iteration; simpler deployment without SSR complexity|
|JWT vs Session Auth|Stateless auth scales horizontally for real-time multiplayer without sticky sessions|
|Docker Compose vs manual setup|Single-command setup essential for 5-person team with different OS environments|

---

## 🗄 Database Schema

### Core Relationships

```
User (1) ──► Avatar (1) ──► PlayerPokemon (many)
                │
                ├──► Guild (0..1) \[members array]
                ├──► Battle (many) \[player1/player2]
                ├──► RaceMatch (many) \[players array]
                ├──► Friend (many) \[userId/friendId]
                ├──► Message (many) \[sender/receiver]
                ├──► MessageBlock (many)
                └──► MatchInvite (many)

Guild (1) ──► GuildMessage (many)
```

### Collections

|Collection|Purpose|Key Fields|
|-|-|-|
|**User**|Authentication|`email`, `password` (bcrypt), `avatar` ref|
|**Avatar**|Player profile|`userName`, `characterOption`, `pokemonInventory\[]`, `guild`, stats, `currentBattle`, `online`, `currentSocket`|
|**PlayerPokemon**|Owned Pokemon|`name`, `type`, `is\_shiny`, `hp`, `attack`, usage counters|
|**MapPokemon**|Wild spawns|`name`, `type`, `is\_shiny`, `hp`, `attack`, `x`, `y`, `caught`|
|**Battle**|PvP matches|`player1/2`, `pokemon1/2\[]` (embedded), `active1/2`, `currentTurn`, `winner`, `winnerReason`, timestamps|
|**RaceMatch**|Race history|`players\[]`, `results\[]`, `winner`, `map`, `ranked`|
|**Guild**|Organizations|`name`, `description`, `image`, `members\[]` with roles|
|**Friend**|Relationships|`userId`, `friendId`, `status` (pending/accepted/blocked)|
|**Message**|Direct chat|`senderId`, `receiverId`, `content`, `read`|
|**MatchInvite**|Battle requests|`senderId`, `receiverId`, `status`, `expiresAt` (TTL)|

### Design Patterns

* **Embedded**: Battle Pokemon (historical snapshots), Event data, Race results, Guild members
* **Referenced**: User→Avatar, Avatar→Guild, Messages, Friends (query flexibility)
* **Indexes**: TTL on `MatchInvite.expiresAt`, compound on Messages for inbox queries
* **Cascading**: Guild deletion clears `guild` field from member Avatars

---

## 🎯 Module Breakdown

**Target**: 14 points minimum | **Achieved**: 28 points

|Category|Points|
|-|-|
|Web Foundation|6|
|Database \& Infrastructure|2|
|User Management|7|
|Gaming \& User Experience|13|
|**Total**|**28**|

### Web Foundation (6 points)

|Module|Points|Implementation|Lead Contributors|
|-|-|-|-|
|Full Stack Framework|2|React + Express|dfasius (architecture), tsechen (integration)|
|Real-time Features|2|Socket.io for world sync, battles, chat|tsechen (implementation), dfasius (WebSocket architecture)|
|User Interaction|2|Friends system, profiles, basic chat|tsechen (friends/messaging), aputri-a (UI flows)|

### Database \& Infrastructure (2 points)

|Module|Points|Implementation|Lead Contributors|
|-|-|-|-|
|ORM|1|Mongoose with schema validation|ysetiawa (game schemas), tiatan (race schema), dfasius (event schema), tsechen (messaging schema)|
|Browser Support|1|Chrome, Firefox, Safari, Edge|aputri-a (cross-browser testing), ysetiawa (compatibility fixes)|

### User Management (7 points)

|Module|Points|Implementation|Lead Contributors|
|-|-|-|-|
|Standard User Management|2|Registration, login, profiles, avatars, online status|tsechen (auth flows, avatar system), aputri-a (profile UI)|
|Advanced Permissions|2|Role system (admin/moderator/user), CRUD, view restrictions|dfasius (role middleware, permission guards)|
|Organization System|2|Guild creation, member management, guild actions|dfasius (guild backend), ysetiawa (member UI), aputri-a (guild design)|
|Game Statistics|1|Match history, win/loss tracking, usage stats|tiatan (statistics tracking), ysetiawa (data aggregation), aputri-a (stats dashboard UI)|

### Gaming \& User Experience (13 points)

|Module|Points|Implementation|Lead Contributors|
|-|-|-|-|
|Web-based Game|2|Pokemon battle system|aputri-a (battle mechanics, UI), dfasius (state synchronization)|
|Remote Players|2|Cross-machine multiplayer with latency handling|dfasius (network optimization), tsechen (connection resilience)|
|Multiplayer 3+|2|Event Capture game (3+ players)|dfasius (game design, multiplayer architecture), ysetiawa (event coordination)|
|Second Game|2|Race mini-game with matchmaking|tiatan (race mechanics, matchmaking), dfasius (position synchronization)|
|AI Opponent|2|Type-aware AI decision making|dfasius (AI engine, strategic logic), aputri-a (integration with battle system)|
|Advanced Chat|1|Blocking, invites, history, typing indicators|tsechen (blocking system, chat history), dfasius (real-time delivery)|
|Gamification|1|Achievements, leaderboards, XP|tiatan (progression system), aputri-a (achievement UI)|
|Spectator Mode|1|Live battle viewing with real-time updates|tsechen (spectator infrastructure), dfasius (state broadcasting)|

---

## 👥 Individual Contributions

|Member|Key Contributions|
|-|-|
|**tsechen**|Product Owner responsibilities, real-time WebSocket implementation, friends/messaging system, spectator mode infrastructure, authentication flows, quality assurance|
|**ysetiawa**|Project management coordination, web game schema design, guild member UI, browser compatibility testing, matching system, game statistics aggregation, milestone tracking|
|**dfasius**|Technical architecture leadership, battle state synchronization, AI opponent engine, guild backend system, role-based permissions, network optimization, code review|
|**tiatan**|Git workflow management and CI/CD setup, race game mechanics, statistics tracking system, racing game database schema design, version control, avatar system|
|**aputri-a**|UI/UX design system, web game battle mechanics and interface, cross-browser testing, achievement system implementation, responsive interface design, pixel-art styling|

---

## ⚔️ Game Mechanics

### Type Chart

```
Fire > Grass > Water > Fire
Normal = neutral
```

### Stat Templates

|Template|ATK|HP|Shiny Bonus|
|-|-|-|-|
|Tank|4|12|+2 HP, +1 ATK|
|Balanced|5|10|+2 HP, +1 ATK|
|Aggressive|6|8|+2 HP, +1 ATK|

### Battle Rules

* Team size: 3 Pokemon
* First turn: Randomized
* Actions: Attack or Swap
* Damage: Advantage ×1.5, Disadvantage ×0.75
* Auto-replacement on faint
* Disconnect: Auto-win for remaining player
* Idle timeout: Turn skip after 31s

---

## 📋 Development Workflow

1. **Planning**: Weekly milestone meetings with task assignment
2. **Tracking**: GitHub Issues for features, bugs, and module progress
3. **Development**: Feature branches with mandatory PR reviews
4. **Integration**: Docker-based testing before merge
5. **Documentation**: Inline code docs + README updates

### Quality Assurance

* Mandatory code reviews (minimum 1 approval)
* Manual game balance testing
* Cross-browser verification (Chrome, Firefox, Safari, Edge)
* WebSocket load testing for concurrent users

---

## 📚 Resources

* [Socket.io Documentation](https://socket.io/docs/)
* [Express.js Guide](https://expressjs.com/)
* [Mongoose Documentation](https://mongoosejs.com/)
* [MongoDB Manual](https://www.mongodb.com/docs/)
* [React Documentation](https://react.dev/)
* [Vite Guide](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Pokemon Sprites Database](https://pokemondb.net/sprites)
* [Spriters Resource](https://www.spriters-resource.com/)

---

## 🤖 AI Usage

AI assisted with:

* UI component refactoring suggestions and patterns
* Responsive layout debugging and Tailwind optimization
* WebSocket edge case review and reconnection logic
* Documentation structure, grammar, and clarity improvements
* TypeScript type definition patterns

All AI-generated output was reviewed, tested, adapted, and validated by the team before integration.

---

## ⚠️ Known Limitations

* Production HTTPS configuration pending final deployment
* Statistics dashboard UI needs additional polish
* Guild search functionality to be enhanced in future iteration
* Mobile responsiveness ongoing improvements for smaller screens

---

## 📜 License \& Attribution

### Code

© 2025 tsechen, ysetiawa, dfasius, tiatan, aputri-a. Educational use only.

### Third-Party Assets

Pokemon sprites, names, and related media are trademarks of Nintendo, Game Freak, and The Pokemon Company. Used under educational fair use for non-commercial demonstration. No ownership claimed. Not affiliated with or endorsed by Nintendo.


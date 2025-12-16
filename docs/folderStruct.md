# Folder Structure — Options & Discussion (Draft)

This document explores possible folder structures for the Transcendence project.

At this stage, **no structure is finalized**.  
The goal is to compare approaches and understand trade-offs before implementation.

The final structure will be chosen after:
- Feature scope is confirmed
- Tech stack decisions are finalized
- Team workflow preferences are discussed

---

## Option A: Monorepo (Candidate)

A single repository containing frontend, backend, and shared code.

```txt
transcendence/
├── apps/
│   ├── frontend/          # Frontend application (React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── backend/           # Backend application (Node.js)
│       ├── src/
│       │   ├── modules/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── types/
│       └── package.json
│
├── packages/              # Shared code
│   ├── shared-types/
│   ├── shared-utils/
│   └── shared-config/
│
├── docker-compose.yml
├── package.json           # Root config (optional)
└── README.md
````

**Pros**

* Easier coordination for a small team
* Shared types and utilities are straightforward
* Single Docker Compose setup

**Cons**

* Requires discipline to avoid tight coupling
* Tooling setup can be slightly more complex

---

## Option B: Separate Repositories (Candidate)

Frontend and backend are developed in separate repositories.

```txt
transcendence-frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── battle/
│   │   ├── world/
│   │   └── social/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── public/
└── package.json
```

```txt
transcendence-backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── battle/
│   │   ├── world/
│   │   ├── pokemon/
│   │   └── social/
│   ├── middleware/
│   ├── utils/
│   ├── types/
│   └── app.ts
├── prisma/
└── package.json
```

**Pros**

* Clear separation of concerns
* Independent deployment and tooling
* Familiar structure for many teams

**Cons**

* Harder to share types and logic
* More overhead managing two repos
* Coordination cost increases

---

## Option C: Feature-Based Structure (Candidate)

Code is organized by feature instead of by frontend/backend.

```txt
transcendence/
├── features/
│   ├── authentication/
│   │   ├── frontend/
│   │   └── backend/
│   ├── world/
│   │   ├── frontend/
│   │   └── backend/
│   ├── battle/
│   │   ├── frontend/
│   │   └── backend/
│   └── social/
│       ├── frontend/
│       └── backend/
│
├── shared/
│   ├── components/
│   ├── utils/
│   └── types/
│
└── docker-compose.yml
```

**Pros**

* Strong feature ownership
* Encourages modular thinking
* Easier to reason about end-to-end features

**Cons**

* More complex structure
* Higher initial setup cost
* Requires strong conventions to stay clean

---

## Discussion Criteria

The following questions will guide the final decision:

* How many people will touch both frontend and backend?
* How important is sharing code and types?
* How complex will the project become?
* What structure minimizes merge conflicts?
* What is easiest to maintain under time constraints?

---

## Notes

This document is exploratory by design.
Once a structure is chosen, it will be documented as the official project layout.


# Roadmap.ai — Personalized Learning Path Recommender

**Author:** [Rohit Arabale](https://github.com/rohit-arabale)

Natural-language goal → personalized roadmap. Roadmap.ai turns "I want to become a frontend developer in 6 months" into a structured path of real courses, projects, and resources with prerequisites, milestones, and time estimates, then adapts as you learn.

---

## Problem

Online platforms have thousands of courses but no clear sequence for a specific goal. Learners have different levels, interests, and time, so one-size-fits-all fails. They need a system that understands their profile, finds skill gaps, and generates a tailored, explainable roadmap that evolves with feedback and progress.

## Solution

A full-stack learning assistant:

- **Goal intake**: plain-English goal on Home
- **Profiling engine**: interests, level (beginner/intermediate/advanced), known skills, completed courses, weekly hours, goal
- **Recommendation engine**: deterministic scoring (interest 45, goal 30, gap 20, level 25, feedback boost 8) over 42 curated real resources, interleaved by type, with reasons per item
- **Path generator**: difficulty-ranked + prerequisite chains + milestones (Foundations / Building Depth / Advanced Work) + `estimatedWeeks = totalHours / weeklyHours`
- **AI assistant**: Gemini **3.1 Flash Lite** proxied via backend, grounded in profile + current path
- **Feedback & assessment loops**: thumbs up/down excludes/boosts items; quiz scores per topic feed back and flag path as stale
- **Progress dashboard**: completion %, milestones, hours left, skill radar (Chart.js), next unlockable steps

---

## System Architecture

```
Browser (React 19, Vite, TS, Tailwind, Router)
  │  X-User-Id (anonymous, localStorage) + X-Request-Id
  │  /api/profile, /api/paths, /api/recommendations, /api/feedback, /api/quiz, /api/chat, /api/catalog
  ▼
Server (Bun 1.4, Express 4, Prisma 6)
  │  Prisma ORM → PostgreSQL 16 (Docker, 5433)
  │  Recommendation + Path services
  │  Gemini 3.1 Flash Lite proxy (key never leaves server)
  └  Security headers, CORS, rate-limit (chat 20/min), Zod validation, sanitization
```

DB tables: `profiles(userId PK, interests Json, skillLevel, knownSkills, completedCourses, goal, weeklyHours, updatedAt)`, `paths(id PK, userId, nodes Json, milestones Json, estimatedWeeks, createdAt)`, `feedback(userId+itemId PK)`, `skill_scores(userId+topic PK)`.

Client storage: only `roadmap-ai-user-id`, `roadmap-ai-pending-goal`, chat history. All learning data is in Postgres.

---

## AI/ML Techniques

- **Scoring, not black-box**: tokenized interest overlap, goal keyword match (stopword-filtered), skill-gap ratio, difficulty distance. Capped at 100, sorted, interleaved to mix courses/projects/resources.
- **Path inference**: `lastNodeBySkill` map builds prerequisites; linear chain fallback ensures DAG.
- **Gemini 3.1 Flash Lite**: system prompt is profile+path JSON (truncated at 8k), grounded answers, markdown, 15s timeout, 4000-char input limit. Proxied server-side; without `GEMINI_API_KEY` chat returns `503` with setup hint.

---

## Key Features & Workflow

1. **Home** → type goal → `localStorage:pending-goal` → `/profile`
2. **Profile** → 4-step wizard → `PUT /api/profile`
3. **Roadmap** → `POST /api/paths/generate` → expand "Why recommended", `PUT /api/feedback/:id`, `PATCH /api/paths/:id/nodes/:nodeId` for status
4. **Quiz** → `GET /api/quiz/questions?topic=&difficulty=` → `POST /api/quiz/scores` → radar updates → `GET /api/paths/staleness` shows regenerate banner
5. **Progress** → `GET /api/paths` + `GET /api/quiz/scores` → radar, milestones, next actions
6. **Chat** → `POST /api/chat` from any page, context-aware

---

## Tech Stack

React 19, TypeScript, Vite, Tailwind 4, React Router 7, Chart.js, Framer Motion | Bun 1.4, Express 4, Prisma 6, PostgreSQL 16, Gemini 3.1 Flash Lite

---

## Run Locally

### Backend

```bash
docker compose up -d db             # Postgres 16 on 5433
cd server
bun install
cp .env.example .env                # set GEMINI_API_KEY https://aistudio.google.com/apikey
bunx prisma db push                 # sync schema
bunx prisma generate
bun --watch src/index.ts            # http://localhost:3001/api/health
```

`server/.env.example`

```
DATABASE_URL="postgresql://roadmapai:roadmapai@localhost:5433/roadmapai"
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
CORS_ORIGIN="http://localhost:5173"
```

### Frontend

```bash
# root
bun install
cp .env.example .env   # VITE_API_URL empty = same-origin via Vite proxy
bun run dev            # http://localhost:5173
```

Prod:

```bash
bun run build && bun run preview
```

If frontend and backend are on different hosts, set `VITE_API_URL=https://api.example.com` before `bun run build`.

---

## API

`X-User-Id` auto-sent via `src/lib/api.ts`, `X-Request-Id` per request. All JSON `{success, data}` or `{success:false, error}`.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `db:up` check |
| GET | `/api/catalog` | 42 resources |
| GET/PUT/DELETE | `/api/profile` | Zod + sanitized `<>` stripped |
| GET | `/api/recommendations` | scored |
| GET | `/api/paths` | latest |
| POST | `/api/paths/generate` | 422 if no recs, transactional |
| PATCH | `/api/paths/:pathId/nodes/:nodeId` | `status` |
| GET | `/api/paths/staleness` | profile/score vs path date |
| GET/PUT | `/api/feedback` `/api/feedback/:itemId` | `up/down/null` |
| GET | `/api/quiz/questions` | `topic+difficulty` sanitized |
| GET/POST | `/api/quiz/scores` | `score<=total` enforced |
| POST | `/api/chat` | `message` 4000, 15s timeout, 20/min |

---

## Project Structure

```
roadmap-ai/
  server/           # Bun + Express + Prisma
    prisma/schema.prisma
    src/app.ts, index.ts, config.ts, db.ts
    src/routes/*, services/*, middleware/*, data/courseCatalog.ts
  src/              # React
    lib/api.ts, learner/ProfileSetup.tsx, services/*, pages/*, chatbot/*, types/*
  docker-compose.yml # db:5433
  vite.config.ts    # proxies /api -> :3001
```

---

## Submission Checklist (HCL Round 2)

- [x] Source code + `README` with setup (this file) — exclude `node_modules`, `dist`, `.env`
- [x] GitHub repo: `https://github.com/rohit-arabale/roadmap-ai` (accessible, history shows iterative hardening)
- [ ] Solution doc PDF/PPT — `docs/` placeholder, export from README sections above
- [ ] Demo video 3–5 min — record Home→Profile→Roadmap→Quiz→Progress→Chat flow
- [ ] Deployed URL or local setup — `docker compose up` + `bun --watch` + `bun run dev` above suffices if not deployed

Judging: Problem 20% / Functionality 25% / AI/ML 20% / Innovation 15% / UX 10% / Performance 10%.

---

## Notes

- No password auth; anonymous `X-User-Id` isolates data per browser. Clear `localStorage:roadmap-ai-user-id` to reset.
- Lint: `bun run lint` passes; `bun --cwd server tsc --noEmit` passes.
- Prisma: `bunx prisma db push` on schema change.

---

## Author

Built and maintained by **Rohit Arabale**.

- GitHub: [@rohit-arabale](https://github.com/rohit-arabale)

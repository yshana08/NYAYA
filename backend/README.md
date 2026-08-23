# Nyaya backend

A small Express API that serves the real front end (`../frontend/*.html`, `css/`, `js/`)
and backs every screen — intake, questions, rights, evidence, smart form filler,
complaints, cases, earnings, support, privacy, and the admin analytics view — with
actual case storage, evidence scanning, and Claude-powered classification/drafting.

The front end already degrades gracefully when the backend is unreachable (each page
script wraps its API calls in `.catch()` and leaves the static demo content in place) —
this server just makes it real: cases are classified, persisted, and trackable end to end.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # optional — add ANTHROPIC_API_KEY to use real classification/drafting
npm start
```

Open **http://localhost:4000** — that serves `frontend/index.html` and the rest of the
static site. (Port 4000 avoids clashing with VS Code's Live Preview extension, which also
defaults to 3000.)

Without an `ANTHROPIC_API_KEY`, classification and complaint drafting fall back to
offline logic (the same six issue categories the app scripts: deactivation, payment,
penalty, incentive, safety, other), so the app is fully functional with zero
configuration. Add a key and both switch to Claude Haiku 4.5 automatically — no code
changes needed.

## Code layout

```
backend/
  server.js            app bootstrap only — middleware, static site, mount /api, listen
  src/
    config.js            env-driven settings
    anthropicClient.js   the one shared Anthropic client (null when no API key)
    issues/
      issueTypes.js        single source of truth for the six dispute types
    classify/            text → issue type (Claude, offline fallback, dispatcher)
    complaint/           case → complaint draft (Claude, offline fallback, dispatcher)
    extraction/          regex-based "OCR" for evidence text and document text
    guidance/            evidence checklist + rights/escalation guidance per issue type
    analytics/           impact numbers across all cases
    store/
      caseStore.js         the in-memory case Map + CRUD helpers
    routes/              one file per route group, mounted by routes/index.js
```

## API

| Method   | Route                              | Purpose |
|---|---|---|
| `GET`    | `/api/health`                      | Is the server up, is Claude configured |
| `GET`    | `/api/analytics`                   | Impact numbers: totals, recovered amount, cases by issue type |
| `POST`   | `/api/cases`                       | `{ text, lang }` → classifies and creates a case |
| `GET`    | `/api/cases`                       | `?ids=a,b` list of case summaries (id, issue, status, readiness) |
| `GET`    | `/api/cases/:id`                   | Full case record |
| `PATCH`  | `/api/cases/:id`                   | `{ status, timelineEntry, answers, platform }` → updates the case |
| `DELETE` | `/api/cases/:id`                   | Deletes a case |
| `GET`    | `/api/cases/:id/export`            | Full case record as a downloadable JSON file |
| `GET`    | `/api/cases/:id/rights`            | `{ nextStep, options, escalationPath }` for the case's issue type |
| `GET`    | `/api/cases/:id/evidence-checklist`| Per-category evidence checklist + readiness score |
| `PATCH`  | `/api/cases/:id/evidence-checklist`| `{ category, label, done }` → toggles one item by hand |
| `POST`   | `/api/cases/:id/evidence`          | `{ filename, simulatedText }` → scans text, auto-ticks the checklist |
| `POST`   | `/api/cases/:id/form-extract`      | `{ simulatedText }` → extracts name/roll number/marks/percentage |
| `POST`   | `/api/cases/:id/complaint`         | `{ platform, complaintType, additional }` → drafts a complaint |
| `POST`   | `/api/cases/:id/handoff`           | Flags the case for a human/legal-aid supporter |

Cases live in memory (a `Map`, see `src/store/caseStore.js`) — restarting the server
clears them. Swap it for a real database when this goes past a demo; every route already
reads/writes through that one module, so nothing else needs to change.

## Notes

- `ANTHROPIC_API_KEY` unset → offline matcher/templates, no external calls, no cost.
- Classification and complaint drafting both use Claude's tool-calling (a forced tool
  call) instead of asking the model to "return JSON", so the response always has the
  shape the front end expects.
- Evidence and form-field extraction are regex-based (amounts, dates, status keywords,
  name/roll/marks) — a stand-in for real OCR, same approach for both features.
- There's no login. The front end tracks "my cases" and "the current case" itself
  (`frontend/js/storage.js`, backed by `localStorage`) and passes case IDs to the API —
  the backend has no concept of a user.

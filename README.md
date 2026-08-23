# Nyaya — AI dispute assistant for gig workers

Nyaya helps Indian gig workers (drivers, delivery riders) turn "what happened" into a
case that holds up — in Hindi, English, or Hinglish, typed or spoken. It figures out
what kind of dispute this is, then builds the evidence, forms, and follow-ups that
platforms usually make a worker fight for alone.

This repo has two parts:

```
nyaya-final/
├── frontend/     static multi-page app — landing page, intake → questions → rights →
│                 evidence → smart form filler → complaint flow, case management,
│                 earnings, support, privacy, and an admin analytics view
├── backend/      Express API — case classification, storage, evidence/form scanning,
│                 rights guidance, complaint drafting
├── install.sh    one-command setup
└── start.sh      one-command run
```

Every page works with the backend offline too — each page script wraps its API calls
in a fallback and leaves the static demo content on screen if `/api/health` doesn't
resolve. Run the backend and it becomes real: every case is actually classified,
persisted, and trackable end to end.

## Quick start

```bash
./install.sh   # npm install + creates backend/.env from the example
./start.sh     # starts the backend, which also serves the frontend
```

Then open **http://localhost:4000** (configurable via `PORT` in `backend/.env`).

Add an `ANTHROPIC_API_KEY` to `backend/.env` to turn on real Claude-powered
classification and complaint drafting. Without one, the backend falls back to offline
logic — the app is fully functional either way.

## Frontend (`frontend/`)

A static multi-page app (no build step) with a shared `css/style.css` and small,
single-purpose scripts under `js/` — one file per shared concern (`api.js` talks to the
backend, `storage.js` talks to `localStorage`, `ui.js` holds small formatting helpers)
and one file per page:

- **Landing page** (`index.html`) — marketing overview and entry points into the app.
- **Dashboard** (`dashboard.html`) — the worker's own active cases, pending earnings,
  case readiness, and next action, pulled from whichever cases this browser created.
- **New Issue → Questions → Rights & Action** (`intake.html`, `questions.html`,
  `rights.html`) — describe the problem (typed or spoken, Web Speech API), a short
  follow-up form, then the AI's recommended next step, options, and escalation path.
- **Evidence** (`evidence.html`) — a per-category checklist scored into a readiness
  score; scanning pasted text (the demo stand-in for OCR) auto-ticks matching items.
- **Smart Form Filler** (`form-filler.html`) — extracts name/roll number/marks/
  percentage from pasted document text and fills a demo form for the worker to confirm.
- **Complaints** (`complaint.html`) — generates a platform-ready complaint draft from
  the case's own facts, with copy/download.
- **My Cases / Case Details** (`cases.html`, `case-details.html`) — every case this
  browser created, and a full view of one: summary, escalation timeline, audit trail.
- **Earnings** (`earnings.html`) — an earnings-at-risk calculator that can save its
  result onto the current case.
- **Support** (`support.html`) — worker organization / legal-aid directories, and a
  human handoff request.
- **Privacy** (`privacy.html`) — view, export, or delete the current case's data.
- **Analytics** (`analytics.html`) — an admin/NGO view of impact numbers across every
  case on the backend.

There's no login: the front end remembers "my cases" and "the current case" itself in
`localStorage` (`frontend/js/storage.js`) and sends case IDs to the API.

## Backend (`backend/`)

An Express server (see `backend/README.md` for the full module map and API table) that
serves the frontend as static files and implements every route the pages call:
case classification, evidence/form-field extraction, evidence checklists, rights
guidance, complaint drafting, case CRUD, human handoff, and analytics.

**Classification & complaint drafting** both call Claude (Haiku 4.5) using forced
tool-calling, so responses are always well-shaped — no "hope the model returns JSON"
parsing. If no `ANTHROPIC_API_KEY` is set, or a call fails for any reason, both fall
back to offline logic covering the same six issue categories, so the app never hard-fails.

**Evidence & form extraction** — regex-based (₹ amounts, dates, status keywords, name/
roll number/marks) — a stand-in for real OCR, matching the note shown in both the
Evidence and Smart Form Filler pages.

**Storage** — an in-memory `Map`, intentionally: this is a demo-grade backend.
Restarting the server clears all cases. Every route reads/writes through the one
`caseStore` module, so swapping in a real database later doesn't touch route logic.

## Trust, privacy & safety

Nyaya provides legal information and workflow assistance — **not legal
representation**. The frontend says this explicitly (see `support.html` and
`privacy.html`), and the backend never invents laws, sections, or guaranteed outcomes,
and never asks for OTPs, PINs, passwords, or bank credentials (enforced in the Claude
system prompts). AI-extracted numbers and legal claims are meant to be flagged for the
worker to verify before anything is submitted.

## Tech stack

- **Frontend:** vanilla HTML/CSS/JS, no framework, no build step
- **Backend:** Node.js, Express
- **AI:** Anthropic Claude (Haiku 4.5) via `@anthropic-ai/sdk`, with offline rule-based
  fallbacks for both classification and complaint drafting
- **Storage:** in-memory (swap for a real database when this goes past a demo)

## Known limitations

- Cases don't survive a server restart (in-memory store).
- Evidence and document "scanning" reads pasted text, not actual images — there's no
  real OCR.
- Analytics/recovery figures are only as good as the demo cases created in the current
  server session; the frontend keeps its own illustrative baseline stats until the
  backend reports real ones.
- No authentication — "my cases" is just what this browser has created, tracked in
  `localStorage`.

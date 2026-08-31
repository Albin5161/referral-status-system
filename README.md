# LinkedIn Concept · Referral Status

A concept prototype for a **Referral Status System** — a way for a job seeker to
request a referral through their network and follow its status transparently,
without repeatedly nudging the referrer.

> **Concept prototype — not affiliated with or endorsed by LinkedIn.**
> No LinkedIn logo, wordmark, or trademark assets are used. The interface is
> closely *inspired by* LinkedIn's real UI with a text-based identity mark only.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v3
- React Router
- `lucide-react` icons
- No backend — all state lives in browser `localStorage` (survives refresh)

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Two roles, one shared dataset

There is no auth. A **role switcher** in the top bar (a demo-only control) flips
between the two perspectives that share the same `localStorage` data:

- **Requester** — Albin Sigi. Composes referral requests, tracks status, can withdraw.
- **Referrer** — Alex Johnson. Posts real status updates.

## Places

| Route | Role | Purpose |
|-------|------|---------|
| `/thread` | Both | Message thread + inline Referral Request card |
| `/compose` | Requester | Create a Referral Request (type choice → confirm → pessimistic create) |
| `/status/:id` | Both | Current status + full history; Withdraw (requester) / Update Status (referrer) |
| `/my-jobs` | Requester | List of all the requester's referral requests |

A **status notification** banner appears for the requester when the referrer
posts an update; tapping it opens the Referral Status view.

## Design decisions worth knowing

- **Current status is never stored.** It is always derived from the latest
  `StatusUpdate` (single source of truth — avoids the two-sources-of-truth bug).
- **`ALLOWED_TRANSITIONS` is the single source of truth** for which status-change
  actions render anywhere in the app. Terminal states offer no actions.
- **State-inferred states are reversible.** `No Update Received` can move back to
  `Considering`, `Referred`, or `Unable to Refer` — a later human action always wins.
- **Creation is pessimistic.** The Referral Request object does not exist until a
  simulated round-trip resolves; it is never shown optimistically.
- **`Withdrawn` is treated as terminal here, but no UI asserts permanence** — that
  product decision is deliberately left open.

These decisions trace to the source PRD (kept alongside the project handoff).

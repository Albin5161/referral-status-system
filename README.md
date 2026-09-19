# LinkedIn Concept · Referral Status

A concept prototype for a **Referral Status System** — a way for a job seeker to
request a referral through their network and follow its status transparently,
without repeatedly nudging the referrer.

> **Concept prototype — not affiliated with or endorsed by LinkedIn.**
> Built for a portfolio demo only. It uses the LinkedIn logo, colours and system
> font, with mobile patterns matched to the LinkedIn iOS app (via Mobbin), so the
> concept can be judged in context. The in-app footer keeps the disclaimer visible.

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
| `/messaging` | Both | Inbox + 1:1 threads with the inline Referral Request card |
| `/jobs` | Requester | Job Tracker: ask a connection at the company for a referral |
| `/compose` | Requester | Create a Referral Request (job + resume required → review → send) |
| `/status/:id` | Both | Current status, what it means, full history; Withdraw (requester) / update (referrer) |
| `/notifications` | Both | Status updates land here for the requester, with an unread badge on the bell |
| `/my-jobs` | Requester | List of all the requester's referral requests |
| `/feedback` | Facilitator | Test responses saved in this browser, with CSV export (not linked in the UI) |

## Statuses

The stored values follow the PRD object model; people see plain labels.

| Stored | Shown as | Who sets it | Meaning |
|--------|----------|-------------|---------|
| Pending | Sent | System, on creation | Waiting on the referrer |
| Considering | Looking into it | Referrer | Seen and being worked on; still open |
| No Update Received | No reply yet | System only | The referrer has been silent; reversible by any later update |
| Referred | Referred | Referrer | Done: the referral was made (final) |
| Unable to Refer | Can’t refer | Referrer | Done: the referrer can’t refer this time (final) |
| Withdrawn | Withdrawn | Requester | The requester no longer needs it |

## Usability testing

First-time visitors get a 4-screen intro, then a dark guide bar under the header
names their next step through the whole journey (ask as Albin → switch to Alex
→ respond → switch back → see the update). When they reach the final status, a
short survey opens: experience rating, whether the feature is useful and why,
and what could be better.

Each browser tab counts as one visit. If a new visit finds a finished journey,
or one idle for 30+ minutes, it starts fresh automatically; if someone stopped
mid-way recently, it asks whether to continue or start fresh. A refresh never
resets progress, and collected feedback is never cleared.

Responses are always saved in the tester's browser (see `/feedback`). To collect
them from remote testers, create a free [Formspree](https://formspree.io) form
and set its URL as an environment variable (locally in `.env.local`, and in
Vercel under Project → Settings → Environment Variables):

```bash
VITE_FEEDBACK_ENDPOINT=https://formspree.io/f/yourFormId
```

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

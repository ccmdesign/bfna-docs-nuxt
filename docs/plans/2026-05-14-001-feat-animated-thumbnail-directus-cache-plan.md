---
title: "feat: Cache animated Vimeo thumbnails in Directus to avoid redundant lookups and creations"
type: feat
status: active
date: 2026-05-14
---

# feat: Cache animated Vimeo thumbnails in Directus to avoid redundant lookups and creations

## Overview

`getAnimatedVimeoThumbnail` is invoked once per documentary during every content build. Today it:

1. Falls back to Vimeo's `animated_thumbsets` API whenever Directus' own `animated_thumbnail` column is empty.
2. POSTs Vimeo to *create* thumbnails when the API returns an empty set — even if a build a week ago already requested them.
3. Discards the resolved URL: the JSON in `content/allvideos/<slug>.json` is updated, but the Directus column is never touched, so the next build repeats the entire dance.

This plan wires the resolved URL back into Directus. After this work, a successful resolution is persisted in the CMS, the next build short-circuits on `item.animated_thumbnail`, and `__createAnimatedThumbnails` is only invoked for genuinely new documentaries that have never had thumbnails generated.

## Problem Frame

The importer treats the Vimeo API + creation flow as throwaway: every cold build redoes the same fetches and risks redundant `POST /animated_thumbsets` calls against Vimeo. Two symptoms motivate the change:

- **Build cost.** Each cold build hits Vimeo's API once per video. When even a single film lacks pre-generated thumbnails, the 50-second creation/wait loop now (post-recent-fix) gates the whole build.
- **CMS drift.** Editors who view the documentary in Directus see an empty `animated_thumbnail` field even though the site renders a thumbnail correctly. The truth lives in JSON, not in the CMS.

The user wants Directus to be the cache of record. The Vimeo API is consulted only when the cache is empty. Thumbnail creation runs only when Vimeo also reports nothing. After any successful resolution that came from outside Directus, the result is persisted back so subsequent builds never repeat the work.

## Requirements Trace

- R1. `getAnimatedVimeoThumbnail` must short-circuit on the documentary's existing `animated_thumbnail` value without touching the Vimeo API.
- R2. When the Directus value is empty, the Vimeo API is queried; an existing `animated_thumbsets` entry is used directly without triggering creation.
- R3. `__createAnimatedThumbnails` runs only when both the Directus column and the Vimeo `animated_thumbsets` response are empty.
- R4. After any resolution that did **not** come from `item.animated_thumbnail`, the resolved URL is written back to `docs_documentaries.animated_thumbnail` so subsequent builds short-circuit at R1.
- R5. The writeback must fail closed: if the Directus PATCH errors (auth, permission, network), the build continues and the in-memory/JSON output is unaffected.

## Scope Boundaries

- **In scope:** `directus/common.js`, `directus/films.js`, `.env`/`.env.example` documentation, and any AGENTS.md note about the new env var.
- **Not in scope:** Featured/series importers (`contentful/*.js`) — they still target Contentful and are not affected by the Directus migration.
- **Not in scope:** Caching the full `video_info` payload back to Directus. Only the resolved animated-thumbnail URL is persisted.
- **Not in scope:** Concurrency control. Two builds running simultaneously could each PATCH the same row; the writes are idempotent so the last-write-wins outcome is acceptable.
- **Not in scope:** Migration/backfill for existing rows. The cache warms naturally on the next build that calls `getAnimatedVimeoThumbnail`.

## Context & Research

### Relevant Code and Patterns

- `directus/common.js` — `createDirectus(process.env.BASE_URL).with(rest())` builds an unauthenticated read-only client. To PATCH a collection row we'll layer the `staticToken` helper from `@directus/sdk` (v20.1.1 is already in `package.json`).
- `directus/common.js` — `getAnimatedVimeoThumbnail(url, attempt = 0)` already implements the lookup-then-create flow with a single-attempt retry guard (added in the previous session). The new writeback is a tail-end side effect of the lookup-success and creation-success branches.
- `directus/common.js` — `__createAnimatedThumbnails(accessToken, videoId)` already exists (added in the previous session). It must keep returning a boolean so the caller can decide whether to persist anything.
- `directus/films.js:184` — `mapDocumentary` is the only call site for `getAnimatedVimeoThumbnail`. It currently passes only `videoUrl`. The documentary `id` is available on `item.id` and is the PATCH target.
- `directus/common.js:10-22` — `getDirectusData` uses `client.request(readItems(...))`. The same `client` instance can be reused for writes by chaining `staticToken` on construction; no separate write client is required.
- `AGENTS.md` — repository expects env vars to be documented in the "Content & Environment Notes" section. `DIRECTUS_TOKEN` should be added there.

### Institutional Learnings

- The previous turn in this session uncovered two bugs in this same code path (unawaited Promise serialising as `{}`, and `__createAnimatedThumbnails` being undefined in `directus/common.js`). Treat that fix as the baseline; this plan strictly extends from the now-correct state.
- The 2026-04-14 plan (`docs/plans/2026-04-14-001-fix-film-year-date-field-plan.md`) established the pattern of routing fixes through the importer rather than the runtime — same precedent applies here.

### External References

- Directus SDK v20 supports request-level write helpers via `updateItem(collection, id, payload)` re-exported from `@directus/sdk`. Pair with `staticToken` for auth: `createDirectus(URL).with(staticToken(TOKEN)).with(rest())`. See <https://docs.directus.io/guides/connect/sdk.html> for the chained-helper pattern.
- Vimeo `animated_thumbsets` payload shape — confirmed in the existing code: `data.data[*].sizes[*].profile_id ∈ {"High","Low"}` with a `.link` URL. No change required to that parsing.

## Key Technical Decisions

- **Persist only when the URL came from outside Directus.** If `item.animated_thumbnail` was the source, we'd be PATCHing the same value back — wasted call and a needless audit-log entry. The writeback fires only after the Vimeo lookup or creation branch resolves a URL.
- **Inject the documentary id rather than the whole item.** `getAnimatedVimeoThumbnail` accepts an optional `documentaryId`. The function stays narrowly typed and easy to call from anywhere; the writeback simply no-ops when no id is provided.
- **Module-level write client, lazy-initialised.** Create the authenticated client once per process when `DIRECTUS_TOKEN` is present. If the token is missing, log a single warning the first time a writeback is requested and skip silently thereafter — the build continues to succeed.
- **Fail closed on PATCH errors.** The writeback is a cache optimisation, never a correctness primitive. Any 4xx/5xx is logged and swallowed; the resolved URL still flows through to the JSON output for this build.
- **Keep the `attempt` retry guard.** The deepening pass on the previous turn established that uncapped recursion through `setTimeout(50_000)` could spin indefinitely. Leave the cap at 1 retry.

## Open Questions

### Resolved During Planning

- **Auth approach:** Add new `DIRECTUS_TOKEN` env var and use `@directus/sdk`'s `staticToken` helper. (User-confirmed.)
- **What to write back:** Only the URL string returned by Vimeo. The Directus column is a plain text field today; no shape change needed.
- **When to write back:** After both the "Vimeo already had thumbnails" branch resolves and after the "creation + 50 s wait + recurse" branch resolves with a URL. Not after `item.animated_thumbnail` short-circuit.

### Deferred to Implementation

- **Exact Directus permission scope** required by `DIRECTUS_TOKEN`. The implementer should confirm in the Directus admin that the role has `update` permission on `docs_documentaries.animated_thumbnail` (and no broader scope than necessary).
- **Whether to also clear the column when Vimeo returns nothing and creation fails.** Default behaviour in this plan is "leave the existing value alone." Revisit only if a build run observes a stale-link issue.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```mermaid
flowchart TD
    A[mapDocumentary] -->|item.animated_thumbnail truthy?| B{Has cached URL?}
    B -- yes --> Z[Use cached value · no API calls · no writeback]
    B -- no --> C[getAnimatedVimeoThumbnail(url, id)]
    C --> D[GET /videos/:id/animated_thumbsets]
    D -->|data.data has entries| E[Pick High/Low link]
    D -->|data.data empty| F{attempt == 0?}
    F -- no --> X[Return null · log give-up]
    F -- yes --> G[__createAnimatedThumbnails POST]
    G -->|ok=false| X
    G -->|ok=true| H[await 50s · recurse with attempt=1]
    H --> D
    E --> I{documentaryId provided?}
    I -- yes --> J[PATCH docs_documentaries/:id animated_thumbnail]
    I -- no --> K[Return URL]
    J -->|success| K
    J -->|error| L[Log warn · return URL anyway]
    L --> K
```

## Implementation Units

- [ ] **Unit 1: Add authenticated Directus write client and `updateDocumentaryAnimatedThumbnail` helper**

**Goal:** Provide a single safe entry point for writing the resolved URL back to the CMS, gated on `DIRECTUS_TOKEN` availability.

**Requirements:** R4, R5

**Dependencies:** None

**Files:**
- Modify: `directus/common.js`

**Approach:**
- Extend the existing `@directus/sdk` import list to include `staticToken` and `updateItem`.
- Lazy-initialise an authenticated client at first writeback request. Cache the client on a module-level variable. If `process.env.DIRECTUS_TOKEN` is empty, log one warning and memoise a no-op state so subsequent calls don't log again.
- Export `updateDocumentaryAnimatedThumbnail(documentaryId, url)`:
  - Return early when `documentaryId` or `url` is falsy.
  - Wrap the SDK call in `try/catch`; log `[animated-thumbnail writeback]` warnings with the documentary id and response/error message on failure.
  - Resolve `undefined` on both success and failure — callers do not branch on the outcome.
- Keep the existing read-only `client` intact; do not promote it to authenticated. Reuse is fine, but the read client is exported via internal use and we want to avoid sending tokens on every read.

**Patterns to follow:**
- Existing module-level `client` construction in `directus/common.js:7`.
- The `fetch`-based error-handling pattern already used in `__createAnimatedThumbnails` (log and swallow).

**Test scenarios:**
- Happy path: With a valid `DIRECTUS_TOKEN`, calling the helper with a real documentary id and URL results in the Directus row showing the new value (verify by re-reading via `getDirectusData` or the Directus admin UI).
- Edge case: `DIRECTUS_TOKEN` env var absent — first call logs a single warning, subsequent calls produce no further logs and the helper still resolves cleanly.
- Edge case: `documentaryId` is undefined or empty string — helper returns immediately, no SDK call is made.
- Error path: Token present but lacks update permission (simulate by passing a deliberately scoped-down token) — helper logs the 403 response and resolves without throwing; the caller's flow is unaffected.
- Error path: `BASE_URL` unreachable (simulate by setting it to a bogus host) — helper logs the network error and resolves; build continues.

**Verification:**
- After running the importer once, the `animated_thumbnail` column in Directus for `the-open-veins-of-potosi` and `the-stars-over-broken-hill` (the two films currently missing values) holds a `https://videoapi-muybridge.vimeocdn.com/...` URL.

- [ ] **Unit 2: Plumb `documentaryId` through `getAnimatedVimeoThumbnail` and trigger writeback on success**

**Goal:** Have the lookup function persist any URL it resolves so the next build short-circuits.

**Requirements:** R2, R3, R4

**Dependencies:** Unit 1

**Files:**
- Modify: `directus/common.js`

**Approach:**
- Change the signature to `getAnimatedVimeoThumbnail(url, documentaryId = null, attempt = 0)`. Default for the existing `attempt` argument stays the same.
- At the two URL-returning branches (existing thumbsets, post-creation recursion success), `await updateDocumentaryAnimatedThumbnail(documentaryId, resolvedUrl)` before returning. The writeback's failure is logged but never blocks the return value.
- When recursing after creation, forward `documentaryId` so the cache write happens after the second attempt resolves.
- Do not call the writeback on the null-return paths (no thumbnails available; creation failed; Vimeo API errored).

**Patterns to follow:**
- The existing single-attempt recursion guard added in the prior session — keep it intact.

**Test scenarios:**
- Happy path: Cold Directus state, Vimeo already has thumbnails → function resolves the URL, helper PATCHes Directus, JSON output contains the URL, next build short-circuits at `item.animated_thumbnail`.
- Happy path: Cold Directus state, Vimeo has no thumbnails → creation POST succeeds, 50 s wait, recursion finds new thumbnails, writeback runs once.
- Edge case: Function is called with `documentaryId = null` (e.g., from a future script that has no id) → behaviour is unchanged, no writeback attempted.
- Error path: Vimeo creation succeeds but recursion still finds an empty set → function returns null, no writeback, attempt cap prevents further looping.
- Error path: Vimeo API returns non-OK on the initial GET → function returns null, no writeback.
- Integration: `mapDocumentary` calls the function for every documentary; after one full build, every row that previously lacked `animated_thumbnail` has been PATCHed exactly once (verify via Directus activity log).

**Verification:**
- A second run of the importer, immediately after the first, makes zero outbound calls to `api.vimeo.com/videos/*/animated_thumbsets` (verify via console log lines or a network proxy if available). All resolutions come from Directus.

- [ ] **Unit 3: Pass `item.id` from `mapDocumentary`**

**Goal:** Supply the documentary id to the new function signature so the writeback knows which row to patch.

**Requirements:** R4

**Dependencies:** Unit 2

**Files:**
- Modify: `directus/films.js`

**Approach:**
- Update the call site at `directus/films.js:184` to pass `item.id` as the second argument.
- Keep the existing `item.animated_thumbnail || (await ...) || ''` shape — the `||` short-circuit on the cached value remains the primary fast path (R1).

**Patterns to follow:**
- Existing `item.id` usage in the same file (`docId = item.id` at `directus/films.js:145`).

**Test scenarios:**
- Happy path: Run the importer end-to-end and confirm the two affected films (`the-open-veins-of-potosi`, `the-stars-over-broken-hill`) end up with both a populated JSON `animatedThumbnail` and a populated Directus `animated_thumbnail` column.
- Edge case: A future documentary with no Directus row id (synthetic test data) — guard in Unit 1's helper handles the falsy id without error.
- Integration: After this unit, no other code path in the importer needs to know about the writeback; the change is invisible to downstream consumers of the generated JSON.

**Verification:**
- `git diff directus/films.js` shows only the single-argument addition; no other behaviour drift.
- `content/allvideos/the-open-veins-of-potosi.json` and `content/allvideos/the-stars-over-broken-hill.json` show real `animatedThumbnail` URL strings (not `{}`) after the next build.

- [ ] **Unit 4: Document `DIRECTUS_TOKEN` env var**

**Goal:** Make the new dependency discoverable so future contributors and CI know what permission the importer expects.

**Requirements:** R4 (operational support)

**Dependencies:** None (can land in parallel with Units 1–3)

**Files:**
- Create: `.env.example`
- Modify: `AGENTS.md` (Content & Environment Notes section)

**Approach:**
- Create `.env.example` listing every variable already in `.env` with placeholder values, including `DIRECTUS_TOKEN=` and a one-line comment noting the required permission (`update` on `docs_documentaries.animated_thumbnail`). Do not include the real secret values from `.env`.
- Add a sentence to AGENTS.md noting that `DIRECTUS_TOKEN` is required by `npm run dev` / `npm run generate` for the animated-thumbnail writeback, and that missing the var causes a non-fatal warning.

**Test scenarios:**
- Test expectation: none — documentation-only change.

**Verification:**
- A new contributor cloning the repo can read `.env.example` and AGENTS.md and produce a working `.env` without needing to ask anyone where `DIRECTUS_TOKEN` comes from.

## System-Wide Impact

- **Interaction graph:** Adds an outbound PATCH to `cms.bfna.org` on every cold build. Frequency = number of documentaries currently missing `animated_thumbnail`, decreasing monotonically as the cache warms.
- **Error propagation:** Writeback errors are confined to a logged warning. They never propagate to the importer's main flow, never fail the build, and never affect the generated JSON.
- **State lifecycle risks:** Vimeo's generated GIF URLs are signed and expire (the `Signature` query parameter is bound to a `Date`). The cached value will eventually 404. This is acceptable for now — if the issue surfaces in production, a follow-up plan should refresh the value when Vimeo returns 410/403 on the public-facing GIF. Flag this as a known limitation in Unit 4's documentation note.
- **API surface parity:** No public API surface changes. `mapDocumentary` output shape is unchanged.
- **Integration coverage:** Two cross-layer scenarios that unit-test-style mocks won't prove: (a) the SDK PATCH actually persists to the Postgres row behind Directus, and (b) the next build's `readItems` reads the value back. Both verified by re-running the importer twice in succession.
- **Unchanged invariants:** `content/allvideos/<slug>.json` still contains `animatedThumbnail` at the same path with the same string shape. The Nuxt frontend reads no new fields and requires no schema change in `content.config.ts`.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `DIRECTUS_TOKEN` accidentally committed to git | Treat it like other secrets: keep in `.env` (already gitignored), document only in `.env.example` with placeholder. |
| Token has insufficient permission and every build logs a 403 | Single-shot warning behaviour in Unit 1 prevents log spam; implementer confirms permission in the Directus admin during Unit 1 verification. |
| Vimeo signed-URL expiry leaves stale Directus values pointing at 404 GIFs | Documented in Unit 4 as a known limitation; revisit if observed. A future plan could re-fetch when the cached URL fails a HEAD check. |
| Build wall-clock regression from the extra PATCH per uncached row | One PATCH per documentary on the first build that touches it, none on subsequent builds. Negligible compared to the existing 50 s creation wait. |
| Race condition between two concurrent builds both writing the same value | Writes are idempotent (same field, same string). Last write wins; the value is identical. No mitigation needed. |

## Documentation / Operational Notes

- `.env.example` and AGENTS.md are the only documentation surfaces touched.
- Operationally: the first build after merging this plan will produce one PATCH per documentary missing `animated_thumbnail`. Expect activity-log noise on that build; subsequent builds will be quiet.

## Sources & References

- Origin: User chat request, 2026-05-14, in this session.
- Related code: `directus/common.js`, `directus/films.js:184`.
- Related plan: `docs/plans/2026-04-14-001-fix-film-year-date-field-plan.md` (importer-routing precedent).
- External docs: <https://docs.directus.io/guides/connect/sdk.html> (chained `staticToken` + `rest` helpers, `updateItem` usage).

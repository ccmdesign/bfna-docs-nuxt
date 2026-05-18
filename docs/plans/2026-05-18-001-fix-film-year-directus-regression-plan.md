---
title: "fix: Film year regression on the Directus content path (BF-52)"
type: fix
status: active
date: 2026-05-18
ticket: BF-52
branch: feature/BF-52-film-year-directus-regression
---

# fix: Film year regression on the Directus content path (BF-52)

## Summary

Production (`www.bfnadocs.org`, deploys from `main`) shows the film **"The Open Veins of Potosí"** with year **2025**; the correct year is **2026**. The wrong year also mis-places the film's horizontal card on the homepage.

The Contentful→Directus migration (`6f3c15e`, already on `main`) carried the editorial data over correctly — Directus `docs_documentaries` has `date = 2026-04-13`, `status = published` — but dropped the year-derivation hardening that the CCM-272 hotfix applied to the **Contentful** importer. The active importer is now the **Directus** path (`contentImporter.js` imports `directus/*`; the `contentful/*` calls are commented out). On that path, the displayed/sortable year is still derived from the Vimeo/YouTube upload date (`publishedAt` = 2025) rather than the editorial `date` field. This is a pure code regression — no data fix is needed.

This plan ports the CCM-272 fix (commits `421bec5`, `75410f7`) from the Contentful path to the Directus path: make the `docs_documentaries` editorial `date` field the primary source of truth for the displayed and sortable year, guard malformed dates so `NaN` never reaches a Zod `z.number()`, and keep the provider `publishedAt` year only as a last-resort fallback.

---

## Problem Frame

### Observed behavior

- `/the-open-veins-of-potosi` renders **2025** (should be **2026**).
- The film's horizontal card on the homepage sorts/places using the wrong year.

### Root cause (evidence-backed)

The Directus film mapping derives the year from two places, and both ignore the editorial `date` field in the way the bug manifests:

1. **`video_info.year` (the primary visible bug).** `directus/films.js` `mapDocumentary` builds the emitted `video_info` by spreading `...extraVideoInfo` (line ~208: `video_info: { ...mapVideoInfo(...), ...extraVideoInfo }`). `extraVideoInfo` comes from `common.extractVideoInfo(item)` in `directus/common.js`. That function resolves `year` from the **subtitle regex `(YEAR, DURATION)` → Vimeo/YouTube provider `publishedAt`**. It never consults `item.date`. For the target film the subtitle (`"Silver, Lithium, and Mining in Bolivia"`) has no `(...)` group, so the regex misses and the code falls through to the Vimeo upload year = **2025**. Three of the four frontend year consumers read `video_info.year`:
   - `components/docsCardMobile.vue` → `video.video_info.year`
   - `components/docsHeroHeadings.vue` → `currentVideo.video_info.year`
   - `components/docsList.vue` (two render sites) → `item.video_info.year`
   - (`components/docsCard.vue` is the only one reading `video.docYear`.)

2. **`else`-branch reassignment bug in `extractVideoInfo`.** `directus/common.js` `extractVideoInfo` still has the exact pre-CCM-272 shape: when the subtitle regex fails it runs `videoInfo = await getVimeoMetaInfo(...)` / `getYoutubeMetaInfo(...)`, which **wholesale reassigns** the `videoInfo` object — wiping any year set earlier and replacing it with the provider's `publishedAt`-derived year. This is the identical root cause CCM-272 fixed in `contentful/main.js` via commit `421bec5` (restructure into `metaInfo` local + strict-priority merge that never reassigns `videoInfo`).

3. **`docYear` lacks a NaN guard.** `directus/films.js` already does `docYear: item.date ? new Date(item.date).getFullYear() : extraVideoInfo.year`. This *does* prefer the editorial date, so `docYear` is currently correct (2026) for this film. But it has **no `Number.isNaN` guard**: a non-empty-but-malformed `item.date` yields `NaN`, and `allvideos.docYear` is declared `z.number()` (required, not optional) in `content.config.ts`. `NaN` into a required `z.number()` is exactly the ingest-crash hazard CCM-272 guarded in commit `75410f7`.

### Why the homepage placement is wrong

`pages/index.vue` sorts the horizontal list by `video.date` string `localeCompare` (lines ~84–86). `directus/films.js` emits `date: item.date || null`, so the *sort key itself is already the editorial date and is correct*. The visible "mis-placement" the ticket describes is the **displayed year on the card not matching its sort position** — the card sorts by the (correct) 2026 editorial date but displays the (wrong) 2025 provider year, so it looks mis-sorted relative to its neighbors. Fixing the displayed year resolves the perceived mis-placement. This unit is a **verification-only** confirmation, not a code change (see Scope Boundaries).

### Schema contract surface

`content.config.ts` `allvideos` collection:
- `docYear: z.number()` — **required**; `NaN` or `undefined` crashes Nuxt Content ingest.
- `video_info.year: z.number().optional()` — optional, but if present must be a number (never `NaN`).

The CCM-272 deepening (recorded in the sibling `docs/plans/2026-04-14-001-...` plan) established that `video_info` is a JSON column and its nested Zod types are decorative at SQLite insert time, but `docYear` is a **top-level** schema key and *is* enforced/filtered. The corrected values must therefore be real numbers or a documented non-NaN fallback. No schema change is required — the schema already expects numbers; the importer must stop emitting `NaN`/wrong-source values.

---

## Requirements Traceability

| Req | Description | Units |
|---|---|---|
| R1 | `/the-open-veins-of-potosi` displays year **2026** | U1, U2 |
| R2 | The film's homepage card sorts/places consistently with 2026 | U3 |
| R3 | No other film's year regresses (films where provider upload year ≠ editorial year, and films with no editorial date) | U1, U2, U4 |
| R4 | Ingest never crashes on missing/malformed `date` — no `NaN` reaches `z.number()` (`docYear`, `video_info.year`) | U1, U2, U4 |
| R5 | Provider `publishedAt`-derived year is retained as the last-resort fallback only | U1, U2 |

---

## Scope Boundaries

### In scope

- `directus/common.js` `extractVideoInfo` — restructure year/duration resolution to strict priority order (editorial date → subtitle regex → provider metadata) without ever reassigning `videoInfo`; thread the editorial date in.
- `directus/films.js` `mapDocumentary` — derive `docYear` from the same resolved year with a `Number.isNaN` guard and documented fallback chain.
- Verification that homepage sort/placement reflects the corrected year.
- Verification that `content.config.ts` schema types match the corrected importer output (expected: no schema change needed; align only if a mismatch is found).

### Out of scope / non-goals

- The Contentful importer (`contentful/*`) — already fixed by CCM-272, and inactive (commented out in `contentImporter.js`). Not touched.
- Any change to Directus CMS data — the data is correct.
- Reworking the homepage sort algorithm itself — only confirming it consumes the corrected year/date.

### Deferred to Follow-Up Work

- **Featured / series year parity.** `directus/series.js` and `directus/featuredFilms.js` set `year` from `documentary_tabs` (`vi.year ?? null`) or omit it; they do not run `extractVideoInfo` and have no editorial-date plumbing. The target film is reachable via the homepage horizontal list (`allvideos`), which this plan fixes. Bringing the featured/series collections to the same editorial-date priority is a parity follow-up, not required to resolve BF-52's acceptance criteria. Flag as a follow-up issue; do not expand this hotfix.
- **`contentImporter.js` un-awaited importer race.** The Directus importer calls (`getFeaturedFilms()`, `getSeries()`, `getDocumentaries()`) are fired without `await`/`Promise.all`, mirroring the Contentful-path race CCM-272 flagged as deferred. Not a cause of the year bug; out of scope here.
- **Local-time `getFullYear()` year-boundary edge case** — same P3 CCM-272 deferred item; out of hotfix scope.

---

## Key Technical Decisions

### D1. Centralize the year fix in `extractVideoInfo`, not just `directus/films.js`

**Decision:** Thread the editorial `date` into `directus/common.js` `extractVideoInfo` and resolve `year` there in strict priority order, rather than only patching `docYear` in `directus/films.js`.

**Rationale:** The primary user-visible bug is `video_info.year` (read by 3 of 4 frontend components), and `video_info.year` is populated by spreading `extraVideoInfo`. Patching only `docYear` would leave the headline/card/list year at 2025. Fixing the resolution inside `extractVideoInfo` gives a single source of truth, fixes `video_info.year` and `docYear` together, and mirrors exactly what CCM-272 commit `421bec5` did in `contentful/main.js` (proven approach). Any current or future code path that spreads `extraVideoInfo` inherits the correct year automatically.

### D2. Strict priority order: editorial date → subtitle regex → provider metadata

**Decision:** Resolved year priority is: (1) `new Date(item.date).getFullYear()` when `date` present and parses to a non-NaN year; (2) subtitle `(YEAR, DURATION)` regex year; (3) provider (`Vimeo`/`YouTube`) `publishedAt`-derived year. Duration priority unchanged: subtitle regex → provider metadata. Thumbnail fetch stays independent and must never be clobbered.

**Rationale:** Mirrors CCM-272 `421bec5` exactly. The editorial date is the authoritative release date; provider upload date is a last resort. Computing provider metadata into a *separate* local (never reassigning `videoInfo`) is what fixed the Contentful regression and must be replicated.

### D3. NaN guard at every numeric emission point

**Decision:** Guard with `Number.isNaN` at both (a) the date→year parse inside `extractVideoInfo`, and (b) the `docYear` assignment in `directus/films.js`. Never emit `NaN` for `docYear` (required `z.number()`) or `video_info.year` (optional `z.number()`).

**Rationale:** CCM-272 `75410f7` proved an unguarded `new Date(bad).getFullYear()` → `NaN` crashes Nuxt Content ingest on the required `docYear: z.number()`. The Directus path currently has no such guard.

### D4. No schema change expected; verify and align only if mismatched

**Decision:** Treat `content.config.ts` as a check, not a change. The corrected importer emits `year`/`docYear` as JS numbers, which already match `z.number()` / `z.number().optional()`. Only modify the schema if verification reveals an actual type mismatch.

**Rationale:** The schema already expects numbers (post-CCM-272 it was migrated from `z.string()`). The bug is wrong/NaN values, not wrong types. Avoid touching a contract surface unnecessarily.

---

## Implementation Units

### U1. Restructure `extractVideoInfo` to resolve year from editorial date first

**Goal:** Make `directus/common.js` `extractVideoInfo` resolve `year` in strict priority order (editorial date → subtitle regex → provider `publishedAt`) without ever reassigning the `videoInfo` object, so the provider fallback can no longer wipe a date-derived year.

**Requirements:** R1, R3, R4, R5

**Dependencies:** none

**Files:**
- `directus/common.js` (modify `extractVideoInfo`)
- Reference (read-only, do not modify): `/Users/claudiomendonca/Documents/GitHub/ccmdesign/ccm-clients/bfna/bfna-wt/CCM-272` commit `421bec5` — `contentful/main.js` `extractVideoInfo` restructure is the exact pattern to port.
- Test: `tests/directus/common.extractVideoInfo.spec.ts` (new; mirror `tests/` mirroring convention from AGENTS.md — `tests/directus/...`).

**Approach:**
- `extractVideoInfo` currently receives `fields` (the Directus `item`). The Directus `item` already carries `item.date` (the editorial date) — no new parameter is needed; read `fields.date` directly inside the function (Contentful's equivalent was `fields.date`, so the field name aligns).
- Restructure to match CCM-272 `421bec5`:
  1. Fetch thumbnail up front into `videoInfo.thumbnail` (unchanged behavior; must not be clobbered).
  2. Compute `dateYear` from `fields.date` — `Number.isNaN` guarded; `null` when absent/malformed.
  3. Compute `subtitleYear` / `subtitleDuration` from the subtitle regex (unchanged regex).
  4. Only when `year` or `duration` is still unknown, fetch provider metadata into a **separate `metaInfo` local** (never reassign `videoInfo`).
  5. Merge in strict priority: `resolvedYear = dateYear ?? subtitleYear ?? metaInfo?.year`; `resolvedDuration = subtitleDuration ?? metaInfo?.duration`. Assign onto `videoInfo` only when non-null.
- Preserve existing behavior for `displayFilters.years` / `displayFilters.durations` consumers in `directus/films.js` (they read `extraVideoInfo.year` / `.duration` — the resolved values must remain present on the returned object).

**Patterns to follow:** CCM-272 `contentful/main.js` `extractVideoInfo` post-`421bec5` (separate `metaInfo` local, strict-priority merge, never reassign `videoInfo`, `Number.isNaN` guard on the date parse). Keep the Directus thumbnail logic (`getVimeoThumbnail`/`getYoutubeThumbnail`) intact.

**Test scenarios:**
- Covers AE: editorial date wins. `item` with `date = "2026-04-13"`, subtitle `"Silver, Lithium, and Mining in Bolivia"` (no `(...)`), Vimeo URL whose provider year would be 2025 → resolved `year === 2026`.
- Subtitle fallback. `item` with no `date`, subtitle `"(2024, 22 Minutes)"` → `year === 2024`, `duration === 22`.
- Provider last-resort. `item` with no `date`, subtitle with no `(...)` group, Vimeo/YouTube metadata mocked to return `{ year: 2025, duration: 30 }` → `year === 2025`, `duration === 30`.
- `videoInfo` never reassigned: thumbnail fetched up front is still present on the return value even when the provider-metadata fallback path runs (regression guard for the `else`-branch reassignment bug).
- Malformed date guard. `item.date = "not-a-date"` → date parse yields NaN → falls through to subtitle/provider; returned `year` is a number or `undefined`, never `NaN`.
- Empty date. `item.date` absent/`null`/`""` → falls through to subtitle/provider; no `NaN`.
- Duration independence. `date` present (sets year) but subtitle has `(2024, 45)` → `year === 2026` (date wins) AND `duration === 45` (subtitle still wins for duration).

**Verification:** Unit tests pass. `extractVideoInfo` returns the editorial-date year when `date` is present and valid; provider year only when both date and subtitle are unavailable; never returns `NaN`; thumbnail preserved across all paths.

---

### U2. Derive `docYear` from the resolved year with a NaN guard in `directus/films.js`

**Goal:** Make `directus/films.js` `mapDocumentary` emit a `docYear` that is consistent with the corrected `video_info.year`, guarded so `NaN` never reaches the required `docYear: z.number()`.

**Requirements:** R1, R3, R4, R5

**Dependencies:** U1

**Files:**
- `directus/films.js` (modify `mapDocumentary` `docYear` assignment, ~line 190; the `video_info` spread at ~line 208 already inherits U1's fix and needs no change)
- Reference (read-only): CCM-272 commit `75410f7` — `contentful/films.js` `docYear` NaN-guard block.
- Test: `tests/directus/films.mapDocumentary.spec.ts` (new).

**Approach:**
- Replace the current `docYear: item.date ? new Date(item.date).getFullYear() : extraVideoInfo.year` ternary with a guarded resolution that mirrors CCM-272 `75410f7`:
  - Start `docYear` from `extraVideoInfo.year` (now correctly the editorial-date year after U1, or the documented fallback).
  - If `item.date` is present, parse it; only override `docYear` when the parsed year is **not** `Number.isNaN`.
- Document the fallback order in a comment: editorial `date` → `extraVideoInfo.year` (which itself is editorial date → subtitle → provider after U1). Net effect: `docYear` and `video_info.year` resolve from the same authoritative source and can never diverge into the 2025/2026 split.
- Confirm no `NaN`/`undefined` can be emitted: if `item.date` malformed → guarded, falls back to `extraVideoInfo.year`; if that is also absent the value must still satisfy required `z.number()` — see Test scenarios for the all-sources-absent case and U4 for the schema reconciliation decision.

**Patterns to follow:** CCM-272 `contentful/films.js` post-`75410f7` (`let docYear = extraVideoInfo.year; if (fields.date) { const parsedYear = new Date(fields.date).getFullYear(); if (!Number.isNaN(parsedYear)) docYear = parsedYear; }`).

**Test scenarios:**
- Covers AE: target film. `mapDocumentary` on an `item` with `date = "2026-04-13"`, no-paren subtitle, Vimeo year 2025 → output `docYear === 2026` AND `video_info.year === 2026` (the two agree).
- No editorial date, subtitle has year. `item.date` absent, subtitle `"(2024, 22 Minutes)"` → `docYear === 2024`.
- No editorial date, no subtitle year, provider has year. → `docYear === <provider year>` (last resort).
- Malformed date guard. `item.date = "garbage"` → `docYear` falls back to `extraVideoInfo.year`; `docYear` is a number, never `NaN`.
- All sources absent. `item.date` absent, subtitle no `(...)`, provider metadata returns no year → assert the emitted `docYear` is either a valid number or that the documented fallback (per U4 reconciliation) keeps ingest from crashing — this scenario drives the U4 decision and must be exercised explicitly.
- `docYear` / `video_info.year` consistency. For a sample with editorial date present, assert `output.docYear === output.video_info.year` (they must never diverge — the core regression signature).

**Verification:** Unit tests pass. For the target film fixture, both `docYear` and `video_info.year` equal 2026. No code path emits `NaN` for `docYear`.

---

### U3. Confirm homepage sort/placement reflects the corrected year

**Goal:** Verify (no code change expected) that the homepage horizontal list sorts/places the film consistently with the corrected 2026 year.

**Requirements:** R2

**Dependencies:** U1, U2

**Files:**
- `pages/index.vue` (read-only verification of the `videos` computed sort, ~lines 71–88)
- `components/docsCard.vue`, `components/docsCardMobile.vue`, `components/docsHeroHeadings.vue`, `components/docsList.vue` (read-only verification of which year field each renders)

**Approach:**
- Confirm `pages/index.vue` sorts by `video.date` (`localeCompare`), and that `directus/films.js` still emits `date: item.date || null` (the editorial date) — meaning the **sort key is already correct** and the perceived mis-placement was the displayed-year/sort-position mismatch, now resolved by U1+U2.
- Confirm the four year-rendering components now all show 2026 for the target film after U1+U2 (`docsCard.vue` via `docYear`; the other three via `video_info.year`).
- If — and only if — verification reveals the sort actually keys off a year field that U1/U2 did not correct (it does not, per investigation), open a follow-up note; do not change the sort algorithm under this hotfix.

**Test scenarios:** `Test expectation: none -- verification-only unit; no behavioral code change. Covered by U1/U2 unit tests plus the manual generate+browser check in Verification & Rollout.`

**Verification:** After a local `npm run generate`, the target film's card on the homepage displays 2026 and its position in the horizontal list is consistent with a 2026-04-13 release date relative to neighbors. No `pages/index.vue` edit was required (or, if one was, it is justified and minimal and recorded as a deviation).

---

### U4. Reconcile `content.config.ts` schema with corrected importer output

**Goal:** Confirm the corrected importer output types match the Zod schema; align only if a real mismatch exists; ensure the all-sources-absent `docYear` case cannot crash required-`z.number()` ingest.

**Requirements:** R3, R4

**Dependencies:** U1, U2

**Files:**
- `content.config.ts` (verify `allvideos.docYear: z.number()` and `allvideos.video_info.year: z.number().optional()`; modify only if mismatch found)

**Approach:**
- Confirm corrected `docYear` and `video_info.year` are emitted as JS numbers (expected — no change needed; schema was already migrated to `z.number()` by CCM-272).
- Resolve the edge decision surfaced by U2's "all sources absent" scenario: `docYear` is **required** (`z.number()`, not optional). If a published documentary could realistically have no editorial date, no subtitle year, and no resolvable provider year, decide and document one of: (a) keep current behavior and rely on real data always supplying at least one source (acceptable if verified across the full content set during the generate check), or (b) make `docYear` `z.number().optional()` to harden ingest against future data gaps. Prefer (a) if the full-set generate check (Verification & Rollout) shows zero missing years; choose (b) only if a gap is observed. Record the decision in the plan's verification notes and AGENTS.md if the schema changes.
- Any schema edit changes Nuxt Content's `configHash` and forces a full cache rebuild — note this in verification (local cache must be cleared per AGENTS.md troubleshooting section).

**Test scenarios:** `Test expectation: none -- schema verification/decision unit. Validated by the full-content-set npm run generate check in Verification & Rollout (zero schema errors across all collections, zero missing/NaN docYear).`

**Verification:** `npm run generate` completes with zero Zod/schema errors across all `content/` collections. Decision (a) or (b) recorded. If schema changed, AGENTS.md troubleshooting note updated and cache-clear documented.

---

## System-Wide Impact

| Surface | Impact | Handled by |
|---|---|---|
| `directus/common.js` `extractVideoInfo` | Year resolution restructured; provider fallback no longer reassigns `videoInfo` | U1 |
| `directus/films.js` `mapDocumentary` | `docYear` + (via spread) `video_info.year` now editorial-date-sourced & NaN-guarded | U2 |
| Frontend year display (`docsCard`, `docsCardMobile`, `docsHeroHeadings`, `docsList`) | All four now show editorial-date year; no component change needed | U3 (verify) |
| Homepage horizontal list ordering (`pages/index.vue`) | Sort key already correct (`date`); displayed year now matches sort position | U3 (verify) |
| Nuxt Content ingest (`content.config.ts` schema) | No NaN/wrong-type values; schema unchanged unless mismatch found | U2, U4 |
| Local dev cache | Importer-only changes don't change `configHash`; schema change (U4 only if needed) would force cache rebuild | U4 (note) |

---

## Verification & Rollout

1. **Unit tests** (U1, U2): `tests/directus/common.extractVideoInfo.spec.ts` and `tests/directus/films.mapDocumentary.spec.ts` pass, covering editorial-date-wins, subtitle fallback, provider last-resort, NaN/empty-date guards, `videoInfo`-not-reassigned regression, and `docYear === video_info.year` consistency. (AGENTS.md notes Vitest is not yet wired into a `test` script — add a `"test": "vitest run"` script if absent so the suite is runnable/CI-able.)
2. **Local generate against live Directus** (`npm run generate`; clear stale cache first per AGENTS.md: `rm -rf content/ .nuxt/ .output/ .data/ .content.cache.json`):
   - `content/allvideos/the-open-veins-of-potosi.json`: `docYear: 2026` (number), `video_info.year: 2026` (number), `date: "2026-04-13..."`, thumbnail present.
   - **Spot-check control films** where provider upload year ≠ editorial year, and films with no editorial date — confirm zero `docYear` vs `video_info.year` mismatches and zero missing/`NaN` years across the full set (this also resolves the U4 decision).
   - Nuxt Content processes all `content/` files with **zero schema errors**.
3. **Browser check** (`npm run preview` or dev): `/the-open-veins-of-potosi` shows **2026** in hero/card/list; the homepage horizontal card sorts/places consistently with a 2026-04-13 release relative to neighbors.
4. **Rollout:** Standard merge into the integration branch per the repo branch model; production rebuilds from `main` via Netlify (fresh checkout, no stale cache — importer-only change does not alter `configHash`).

---

## Acceptance Criteria

- [ ] `/the-open-veins-of-potosi` shows **2026** (hero, card, and list renderers — all four year consumers).
- [ ] The film's homepage card sorts/places by the 2026 editorial date, consistent with its displayed year.
- [ ] No other film's year regresses — verified by full-set spot-check, especially films where provider upload year ≠ editorial year and films with no editorial date.
- [ ] Ingest does not crash on films with missing/malformed `date` — NaN guard verified by unit tests and by a clean full-set `npm run generate` with zero schema errors.

---

## Assumptions

- **`AskUserQuestion` unavailable in this planning context** (subagent), so the D1 centralization decision is recorded as a documented assumption rather than user-confirmed: the fix is centralized in `extractVideoInfo` (feeding both `video_info.year` and `docYear`) rather than only patching `directus/films.js`. This is the lower-risk choice because `video_info.year` is the primary visible bug (3 of 4 frontend components) and it directly mirrors the proven CCM-272 `421bec5` approach. If the implementer/reviewer prefers a films.js-only patch, U1 would need to be re-scoped — but that would leave the headline/card/list year wrong, so this assumption should hold.
- **`item.date` is the Directus editorial date field** carrying `2026-04-13` for the target record (per ticket evidence: `docs_documentaries.date`, `status = published`). `directus/films.js` already reads `item.date` for `docYear` and `date`, confirming the field name.
- **Provider metadata mocking in tests:** `extractVideoInfo` calls live Vimeo/YouTube APIs; unit tests must mock `getVimeoMetaInfo`/`getYoutubeMetaInfo`/thumbnail fetchers. Exact mocking seam is an execution-time detail (deferred to implementation).

## Open Questions / Deferred to Implementation

- **U4 decision (a vs b):** whether to leave `docYear` as required `z.number()` (relying on real data always supplying a year — preferred if the full-set generate check shows zero gaps) or harden it to `z.number().optional()`. Resolve during the Verification & Rollout generate check, not at plan time, because it depends on inspecting the live full content set.
- **Vitest wiring:** AGENTS.md says the project ships `@nuxt/test-utils` but has no `test` script yet. Adding `"test": "vitest run"` and any minimal Vitest config is an execution-time detail; flagged so the implementer wires it rather than skipping the unit tests.
- **Exact mocking seam** for the provider/thumbnail network calls in `directus/common.js` (module mock vs dependency injection) — execution-time choice.

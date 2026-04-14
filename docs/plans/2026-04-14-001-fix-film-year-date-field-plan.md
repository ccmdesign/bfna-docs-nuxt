---
title: "fix: Film year and Latest Releases ordering read Contentful date field"
type: fix
status: active
date: 2026-04-14
linear: CCM-272
branch: hotfix/CCM-272-film-year-date-field
---

# fix: Film year and Latest Releases ordering read Contentful date field

## Overview

Film `year` and homepage "Latest Releases" ordering currently ignore the Contentful `date` field on documentary entries, relying instead on a regex of the `subtitle` string and on Contentful's system `createdAt`/`updatedAt`. When editors update `date` but forget the subtitle, the year drifts; when the CMS creation date diverges from the actual release date, Latest Releases mis-orders or even drops films.

This hotfix makes `fields.date` the source of truth for both the displayed year and the Latest Releases ordering, falling back to the current logic only when `date` is missing. The fix must be applied to **both** importer files (`films.js` and `featuredFilms.js`) and must reconcile with the Nuxt Content Zod schema in `content.config.ts`, which is the likely reason prior PR #8 failed.

Reference entry: `76PevuShR8NxEzSC2RBcfD` has `date` set to 2026 in Contentful but renders as 2025.

## Problem Frame

Two independent bugs in the Contentful importer:

1. **Year display** — `contentful/main.js` `extractVideoInfo` parses year from the subtitle regex `(YEAR, DURATION Minutes)` and assigns it to `videoInfo.year`. All card/list/hero components read `video.video_info.year`. When subtitle text drifts from `fields.date`, the displayed year is wrong.

2. **Latest Releases ordering and gating** — `contentful/films.js` `getDocReleaseTimestamp` uses `doc.created || doc.updated` (both Contentful `sys` timestamps, not the release date). This function both **sorts** Latest Releases and **gates** inclusion (only entries whose release year equals current or previous year are included). Wrong timestamps can drop a film entirely.

The importer is duplicated across `contentful/films.js` (for `allvideos`, `latest`) and `contentful/featuredFilms.js` (for `featuredvideo`, `featuredvideos`). Both share `main.extractVideoInfo`, so fixing year display in `main.js` covers both — but any documentary-shape change (e.g. exposing `date` on the emitted doc) must be applied in both files.

### Why PR #8 Failed — Root-Cause Hypothesis

Prior PR #8 (closed) applied the `main.js` fix and the `films.js` sort fix but year still showed 2025 on Netlify preview. High-confidence root-cause candidates, in order of likelihood:

1. **Zod schema type mismatch dropping the field.** `content.config.ts:103` declares `video_info.year: z.string().optional()`, but both the legacy subtitle path (`parseInt(...)`) and PR #8's date path (`new Date(...).getFullYear()`) write a **number**. Nuxt Content runs Zod validation against the emitted JSON; depending on Zod version behavior, a numeric year against a `z.string()` schema is either dropped, coerced to undefined, or causes the field to be omitted from the query result. This would explain why the fix "worked" in the JSON file on disk but the UI still showed the subtitle-derived year — if somehow the old field was retained from a prior build, or if the schema dropped the new value silently.
2. **Featured importer path was never touched.** PR #8 only edited `films.js` and `main.js`. The homepage hero reads from `featuredvideo`/`featuredvideos`, which are produced by the untouched `featuredFilms.js`. If the example entry appears in a featured collection on the homepage, the hero's year would still come from the unchanged path. However, `featuredFilms.js` also calls `main.extractVideoInfo`, so the `main.js` change alone should have covered display — unless the Zod schema dropped the numeric value in the featured collections the same way.
3. **Netlify build cache.** `npm run generate` on Netlify may not re-run `contentImporter.js` if the step is cached. Lower likelihood, but must be ruled out before blaming code.
4. **Wrong preview URL checked.** Lowest likelihood; listed for completeness.

The plan's verification protocol directly tests hypothesis #1 first (inspect the emitted JSON on disk, then inspect what Nuxt Content returns at query time) before trusting any preview.

## Requirements Trace

- **R1.** `video_info.year` on every emitted documentary JSON MUST equal `fields.date` year when `fields.date` is present, and fall back to the subtitle regex (then video-provider metadata) only when `date` is missing.
- **R2.** Latest Releases ordering on the homepage MUST sort by `fields.date` (descending, newest first), falling back to `sys.createdAt`/`sys.updatedAt` only when `date` is missing.
- **R3.** Latest Releases inclusion gating (current year or previous year) MUST use `fields.date` when available, so no film is dropped or added because of CMS-timestamp drift.
- **R4.** The change MUST be applied to both `contentful/films.js` and `contentful/featuredFilms.js` so all four downstream collections (`allvideos`, `latest`, `featuredvideo`, `featuredvideos`) behave consistently.
- **R5.** The Zod schema for `video_info.year` in `content.config.ts` MUST match the actual type emitted by the importer, so Nuxt Content does not silently drop the field.
- **R6.** Entry `76PevuShR8NxEzSC2RBcfD` MUST display 2026 in `content/allvideos/<slug>.json` **and** `content/featuredvideo/<slug>.json` (if present) **and** in the rendered UI after `npm run generate`.
- **R7.** At least 2–3 other films' displayed years MUST be unchanged after the fix.

## Scope Boundaries

- Not refactoring the duplicated importer architecture. Two files stay two files; both are edited.
- Not touching the YouTube/Vimeo metadata fallback paths in `main.js` (`getYoutubeMetaInfo`, `getVimeoMetaInfo`) beyond making sure they don't clobber a date-derived year.
- Not changing the `subtitle` content structure in Contentful. Duration is still parsed from subtitle.
- Not changing display components (`docsCard.vue`, `docsCardMobile.vue`, `docsList.vue`, `docsHeroHeadings.vue`, `pages/index.vue` sort). They continue reading `video_info.year`.
- Not renaming or removing `docYear` from the emitted shape — it is used by `app.vue:19` (`queryCollection('allvideos').order('docYear', 'ASC')`) and typed in the schema. Earlier claim that `docYear` is dead is incorrect.
- Not changing the Latest Releases year window semantics (current + previous year). Only the source of the year/timestamp changes.

### Deferred to Separate Tasks

- Unifying `films.js` and `featuredFilms.js` around a single shared `handleDocumentaries`: separate refactor PR, not this hotfix.
- Fixing the pre-existing bug in `main.js:217-223` where the YouTube/Vimeo metadata `else` branch reassigns `videoInfo = ...`, clobbering any previously-set `thumbnail`: noted in PR #8, still out of scope.

## Context & Research

### Relevant Code and Patterns

- `contentful/main.js` (lines 201–228) — `extractVideoInfo` builds `videoInfo` with `year`, `duration`, `thumbnail`. Called from both importer files.
- `contentful/films.js` (lines 46–217) — `handleDocumentaries` emits the documentary shape for `allvideos`/`latest`. Already passes `fields.date` into `docYear` (line 188) via `new Date(fields.date).getFullYear()` — this proves the date field is reachable here. Does NOT currently pass the raw `date` onto the emitted object.
- `contentful/films.js` (lines 248–270) — `sortOrderValue`, `getCreatedTimestamp`, `getDocReleaseTimestamp`, and the primary sort. This is where the Latest Releases ordering bug lives.
- `contentful/films.js` (lines 296–318) — Latest Releases filter + sort that uses `getDocReleaseTimestamp` for BOTH the year-window gate and the sort key.
- `contentful/featuredFilms.js` (lines 46–214) — parallel `handleDocumentaries` for `featuredvideo`/`featuredvideos`. Emits a slightly narrower shape (no `order`, no `created`, no `docYear`). Must also receive the `date` field on its emitted object.
- `content.config.ts` (lines 74–122) — `allvideos` collection schema. `docYear: z.number()` at line 82; `video_info.year: z.string().optional()` at line 103. **This type mismatch is the most likely cause of PR #8's failure.**
- `content.config.ts` (lines 29–73) — `latest` collection schema. Same `video_info.year: z.string().optional()` at line 56.
- `content.config.ts` (lines 164–249) — `featuredvideo` and `featuredvideos` schemas. These `video_info` shapes do NOT declare a `year` field at all. Any extra fields on the JSON will be stripped by Zod's default strict behavior depending on how Nuxt Content runs the schema.
- `app.vue:19` — `queryCollection('allvideos').order('docYear', 'ASC').order('order', 'ASC').all()`. Proves `docYear` is live and must remain a number.
- `components/docsCard.vue:184`, `components/docsCardMobile.vue:239`, `components/docsList.vue:87,94`, `components/docsHeroHeadings.vue:10`, `pages/index.vue:89` — all display/sort callsites using `video_info.year`. `pages/index.vue:89` does `b.video_info.year - a.video_info.year` arithmetic (works with number or numeric string via JS coercion).

### Institutional Learnings

- User-level CLAUDE.md: **"Verification before completion — run the verification command and confirm the actual output. 'I updated the file' is not the same as 'I confirmed it works.'"** This plan's local-verification step is non-negotiable precisely because PR #8 violated it.
- PR #8 closing comments do not record a root cause. Any fix that does not first reproduce locally and inspect the emitted JSON is repeating the PR #8 mistake.

### External References

None required — all information needed is in the repo.

## Key Technical Decisions

- **Decision: Make `fields.date` authoritative in `main.js`, not in the two `handleDocumentaries` files.** Rationale: `main.extractVideoInfo` is the single shared code path that both importers already call. Fixing there guarantees both emitted shapes get the same year without duplicating logic. PR #8 made this choice and it was correct.
- **Decision: Emit `video_info.year` as a number, and fix the Zod schema to accept numbers.** Rationale: `pages/index.vue:89` already does numeric arithmetic on `video_info.year`. `docYear` is already `z.number()`. The current `z.string().optional()` schema is inconsistent with the emitted type even before this hotfix — the `parseInt()` in `main.js:215` produces a number today. Either the schema has been silently dropping the field all along (and the UI has been reading from a different source, maybe the raw JSON before validation) or Nuxt Content is permissive enough to pass it through. Either way, aligning the schema to `z.number().optional()` removes the ambiguity and makes the fix durable. This is the most likely fix for PR #8's failure.
- **Decision: Also expose `date: fields.date || null` on the emitted documentary object in BOTH `films.js` and `featuredFilms.js`.** Rationale: `films.js`'s `getDocReleaseTimestamp` needs it on the doc (post-handleDocumentaries) for the Latest Releases filter/sort. `featuredFilms.js` doesn't currently need it at runtime but exposing it symmetrically keeps the two emitted shapes consistent and makes future sort-by-date logic in the featured importer trivial.
- **Decision: Update both `getDocReleaseTimestamp` (post-handle, used for Latest Releases) AND the primary sort tiebreaker (pre-handle, used for `allvideos` order after `fields.order`) to prefer `fields.date` / `doc.date`.** Rationale: the primary sort tiebreaker at `films.js:268` currently uses `sys.createdAt`; updating it aligns secondary-order behavior with the fix. Low-risk and matches what PR #8 did.
- **Decision: Do NOT remove `docYear`.** Rationale: earlier analysis in the task brief called it a dead field, but `app.vue:19` queries it and the schema types it. Removing it breaks the allvideos ordering on the main app load.
- **Decision: Keep the `z.string().optional()` → `z.number().optional()` schema change scoped to the collections whose importers actually emit `video_info.year`.** That is `allvideos` (line 103), `latest` (line 56), and — if we now choose to emit `year` in the featured importers for consistency — we must also add `year: z.number().optional()` to the `featuredvideo` (line 181–190) and `featuredvideos` (line 223–232) `video_info` sub-schemas. Without this, featured collection JSON may get its `video_info.year` stripped at query time even though it's on disk.

## Open Questions

### Resolved During Planning

- **Is `docYear` dead?** No. `app.vue:19` orders `allvideos` by it. Keep it and keep it as `z.number()`.
- **Is year a string or number?** The existing `main.js` code produces a number (`parseInt`). The Zod schema says string. Resolution: change schema to number.
- **Which files does the `date` exposure need to land in?** Both `films.js` and `featuredFilms.js`. The task brief is correct.
- **Does the homepage hero use `featuredvideo` or `allvideos`?** Featured — so the fix must apply to `featuredFilms.js`, not just `films.js`. Even though `main.extractVideoInfo` covers the year, having `date` on the featured doc shape also makes the schema symmetric.

### Deferred to Implementation

- **Exact confirmation of root cause for PR #8.** Implementer should run `npm run generate` locally, inspect `content/allvideos/<slug>.json` for `76PevuShR8NxEzSC2RBcfD`, and confirm whether `video_info.year` is present and numeric before trusting anything else. If absent on disk, the fix didn't land. If present on disk but absent from `queryCollection` results at runtime, the Zod mismatch is confirmed.
- **Whether Netlify build cache is in play.** Only investigate if local verification passes but the preview still shows the wrong year. Diagnosis: inspect Netlify build logs for whether `contentImporter.js` ran on the deploy.
- **Whether any other collection's `video_info` sub-schema needs `year` added.** Determined during implementation by grepping for which collection files the emitted year needs to survive Zod validation.

## Implementation Units

- [ ] **Unit 1: Reproduce the bug locally before changing anything**

**Goal:** Establish ground truth for the current broken state and confirm PR #8's root cause before trusting any preview environment.

**Requirements:** R6 (baseline)

**Dependencies:** Access to `.env` with `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `YOUTUBE_API_KEY`, `VIMEO_CLIENT_SECRET`.

**Files:**
- Inspect only: `content/allvideos/<slug-for-76PevuShR8NxEzSC2RBcfD>.json`
- Inspect only: `content/featuredvideo/<slug>.json` (if entry is in featured)
- Inspect only: `content/featuredvideos/<slug>.json` (if entry is in featured list)
- Inspect only: `content/latest/<slug>.json` (if entry is in latest)

**Approach:**
- Run `npm install` then `npm run generate` in the worktree.
- Locate the slug for `76PevuShR8NxEzSC2RBcfD` by grepping `content/allvideos/*.json` for that `id` or `videoId`.
- Open the four possible JSON files above and record the current `video_info.year` value (expect 2025, the broken state).
- Record the typeof: is it a JSON number or a JSON string? This alone rules in or out the Zod hypothesis — if `main.js:215` produces `parseInt()` (a number) and the JSON shows a number, the schema is tolerating numbers in practice and PR #8's failure was for a different reason.
- Spot-check 2–3 other films' JSON and record their current `video_info.year` values for later comparison.

**Verification:**
- Clear baseline: "Entry X currently emits `video_info.year: <value>` (type: <number|string>) in file Y." written into the worktree as a throwaway note (do not commit).
- If year is missing entirely from the JSON file, the `main.js` extraction path isn't reaching this entry at all — switch to debugging `extractVideoInfo` before any fix.

- [ ] **Unit 2: Fix `video_info.year` to prefer `fields.date` in `main.js`**

**Goal:** Make `extractVideoInfo` read from `fields.date` first, fall back to subtitle regex, and never let the YouTube/Vimeo metadata `else` branch clobber a date-derived year.

**Requirements:** R1, R4 (via shared call path)

**Dependencies:** Unit 1

**Files:**
- Modify: `contentful/main.js`

**Approach:**
- In `extractVideoInfo`, set `videoInfo.year` from `fields.date` (as a number via `new Date(fields.date).getFullYear()`) *before* the subtitle regex block.
- Keep the subtitle regex for `duration`, but only write `videoInfo.year` from the subtitle regex if it's still unset.
- Inspect the `else` branch (lines 217–223) that reassigns `videoInfo = await getYoutubeMetaInfo(...)`. If this branch runs when subtitle exists but regex fails, it wipes the date-derived year. Gate the reassignment so it only fills missing fields (`year`, `duration`, `thumbnail`) without overwriting a date-derived year. Minimal change: after the metadata call, restore `videoInfo.year` if it was set from `fields.date` before.
- Keep `videoInfo.year` as a **number** (matching the existing `parseInt` behavior and `docYear`).

**Patterns to follow:**
- Existing `docYear` construction at `contentful/films.js:188`: `fields.date ? new Date(fields.date).getFullYear() : extraVideoInfo.year`. Mirror the check and coercion style.

**Test scenarios:**
- Happy path — entry has `fields.date = '2026-03-15'`, subtitle `(2025, 22 Minutes)`. After `extractVideoInfo`, `videoInfo.year === 2026` and `videoInfo.duration === 22`.
- Happy path — entry has `fields.date = '2024-01-01'`, no subtitle. `videoInfo.year === 2024`, `videoInfo.duration === undefined` (preserved as today).
- Edge case — entry has no `fields.date`, subtitle `(2023, 15 Minutes)`. `videoInfo.year === 2023` via subtitle fallback.
- Edge case — entry has no `fields.date`, no subtitle, video_url is YouTube. `videoInfo.year` comes from `getYoutubeMetaInfo` as today.
- Edge case — entry has `fields.date = '2026-03-15'`, subtitle does NOT match regex, video_url is YouTube. `videoInfo.year === 2026` (date wins; metadata fallback does not clobber it). This is the regression PR #8 didn't explicitly protect against.
- Happy path — entry has `fields.date = '2026-03-15'`, subtitle `(2026, 22 Minutes)`. Year is 2026 from either path; duration is 22.

*Scenarios are enumerated for the implementer to validate manually via the generated JSON after Unit 5. This repo does not have Vitest wired up, so automated tests are not a hard requirement for this hotfix — but every scenario above MUST be confirmed by inspecting the corresponding entry's emitted JSON.*

**Verification:**
- After Unit 5 runs `npm run generate`, `content/allvideos/<slug>.json` for `76PevuShR8NxEzSC2RBcfD` shows `video_info.year: 2026` as a JSON number.

- [ ] **Unit 3: Expose `date` on emitted documentary object in `films.js`**

**Goal:** Add `date: fields.date || null` to the documentary object emitted by `contentful/films.js` so downstream sort/filter logic can read it.

**Requirements:** R2, R3

**Dependencies:** None (can run in parallel with Unit 2)

**Files:**
- Modify: `contentful/films.js`

**Approach:**
- In `handleDocumentaries`, add `date: fields.date || null` next to `docYear` on the emitted object (around line 188).
- Update `getDocReleaseTimestamp` (line 259) to prefer `doc.date`: `const releaseDateValue = doc?.date || doc?.created || doc?.updated;`.
- Update the primary sort tiebreaker (line 254–257, `getCreatedTimestamp`): rename to `getEntryReleaseTimestamp` and read `entry?.fields?.date || entry?.sys?.createdAt`. This matches PR #8's diff.
- No changes to how `docYear` is computed. It stays as-is and stays typed `z.number()` in the schema.

**Patterns to follow:**
- PR #8's `films.js` diff is exactly this change; carry it forward verbatim.

**Test scenarios:**
- Happy path — Latest Releases on the homepage orders `76PevuShR8NxEzSC2RBcfD` (date 2026) ahead of a film with `sys.createdAt` in 2026 but `fields.date` in 2024.
- Edge case — film with `fields.date` missing still appears in Latest Releases based on `sys.createdAt` (unchanged behavior for date-less entries).
- Edge case — film with `fields.date` in a year outside `[previousYear, currentYear]` is excluded from Latest Releases even if `sys.createdAt` is current.
- Integration — after this unit + Unit 2 + Unit 5, `content/latest/*.json` list order reflects `fields.date` descending, and `76PevuShR8NxEzSC2RBcfD` appears first if its 2026 date is the newest.

**Verification:**
- `content/allvideos/76*.json` has a top-level `date` field matching Contentful's value.
- `content/latest/*.json` list ordered by `date` descending, newest first.

- [ ] **Unit 4: Expose `date` on emitted documentary object in `featuredFilms.js`**

**Goal:** Keep the two importers' emitted documentary shapes symmetric, and ensure any downstream consumer of `featuredvideo`/`featuredvideos` sees the correct year.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `contentful/featuredFilms.js`

**Approach:**
- In `handleDocumentaries` (around line 184–211), add `date: fields.date || null` on the emitted object.
- Do NOT add sort/filter logic here — `featuredFilms.js` does not compute its own release-based ordering. The featured videos are hand-curated via the `featuredFilms` Contentful content type. Exposing `date` is purely for schema symmetry and forward-compatibility.
- Because `main.extractVideoInfo` already covers the year, this unit's impact on the hero display is indirect — the actual year fix comes from Unit 2. This unit exists so both importers stay in sync and the schema update in Unit 6 has something to validate against in featured collections.

**Patterns to follow:**
- Mirror Unit 3's one-line addition.

**Test scenarios:**
- Happy path — `content/featuredvideo/<slug>.json` for an entry present in the featured list contains `date: '<contentful-date>'` as a top-level string.
- Happy path — `content/featuredvideo/<slug>.json` for `76PevuShR8NxEzSC2RBcfD` (if featured) contains `video_info.year: 2026`.
- Edge case — an entry with `fields.date` missing emits `date: null`.

**Verification:**
- Inspect the generated featured JSON files after Unit 5 and confirm both `date` and `video_info.year` are present and correct.

- [ ] **Unit 5: Fix Zod schema type mismatch in `content.config.ts`**

**Goal:** Align `video_info.year` Zod type with the actual value emitted by the importer (a JS number), in every collection whose importer emits it. This is the most likely root cause of PR #8's silent failure.

**Requirements:** R5, R6

**Dependencies:** Units 2, 3, 4 (the schema must match the new emitted shape)

**Files:**
- Modify: `content.config.ts`

**Approach:**
- In the `allvideos` collection's `video_info` schema (around line 103), change `year: z.string().optional()` to `year: z.number().optional()`.
- In the `latest` collection's `video_info` schema (around line 56), change `year: z.string().optional()` to `year: z.number().optional()`.
- In the `featuredvideo` collection's `video_info` schema (lines 181–190), add `year: z.number().optional()` — currently missing entirely. Same for `duration: z.number().optional()` and `thumbnail: z.string().url().optional()` for consistency if they aren't declared.
- In the `featuredvideos` collection's `video_info` schema (lines 223–232), add `year: z.number().optional()` and the same consistency fields.
- Add top-level `date: z.string().nullable().optional()` to `allvideos`, `latest`, `featuredvideo`, and `featuredvideos` collection schemas so the newly-exposed `date` field survives Zod validation. Contentful emits date as an ISO-8601 string.
- **Do not** touch `docYear: z.number()` — it stays.

**Patterns to follow:**
- Existing numeric schema fields: `docYear: z.number()` in `allvideos`, `previewStartsAt: z.number().optional()` used across collections.
- Existing nullable optional pattern: none in this file, but `z.string().nullable().optional()` is standard Zod.

**Test scenarios:**
- Happy path — `queryCollection('allvideos').first()` in a Nuxt page returns an object whose `video_info.year` is a number (2026 for the target entry).
- Happy path — same for `queryCollection('latest')`, `queryCollection('featuredvideo')`, `queryCollection('featuredvideos')`.
- Edge case — a film whose JSON has `video_info.year: null` or missing is still returned by the query (the field is optional).
- Regression — `app.vue` still loads with `queryCollection('allvideos').order('docYear', 'ASC').order('order', 'ASC')` — confirming `docYear` survived the schema.
- Regression — the homepage filter sort at `pages/index.vue:89` still produces numerically-correct ordering (its arithmetic works with both number and numeric string, so this is low-risk).

**Verification:**
- Run `npm run generate`, then run `npm run preview` (or `npm run dev` if preview is not configured).
- In the running app, open the browser devtools, hit a page that uses `allvideos` (e.g. the all-films page), and inspect a Nuxt Content query response for the target entry. `video_info.year` must be present and numeric.
- Open the homepage. Verify "Latest Releases" ordering matches `fields.date` order for at least the top 5 entries.
- Open the card/list/hero location that shows `76PevuShR8NxEzSC2RBcfD` and confirm it displays **2026**.

- [ ] **Unit 6: End-to-end verification against live Contentful**

**Goal:** Confirm the fix works locally (not just on disk, not just in preview) against real Contentful data before opening a PR.

**Requirements:** R6, R7

**Dependencies:** Units 2–5

**Files:**
- Inspect only: `content/allvideos/<slug>.json`, `content/featuredvideo/<slug>.json`, `content/latest/<slug>.json`, `content/featuredvideos/<slug>.json`.
- Inspect only: browser UI for the slug corresponding to `76PevuShR8NxEzSC2RBcfD`.

**Approach:**
- `rm -rf content/ .nuxt/ .output/` to clear any stale cache.
- `npm run generate`.
- Grep `content/allvideos/*.json` for `"id":"76PevuShR8NxEzSC2RBcfD"` to find the slug.
- Verify `video_info.year: 2026` and `date: "2026-..."` in every emitted JSON for that entry across all four collections.
- `npm run preview` and visit the relevant pages (homepage, all-films grid, the film's detail page) — confirm the UI shows **2026** in every location.
- Spot-check 2–3 other entries chosen at random from `content/allvideos/`: their years must be unchanged from what Unit 1 recorded.
- Confirm Latest Releases order on the homepage reflects descending `fields.date`.

**Test scenarios:**
- Happy path — target entry displays 2026 on: (a) all-films grid card, (b) mobile card, (c) any list view, (d) hero (if featured), (e) the film's own detail page.
- Regression — 2–3 control entries still display the same year they showed in Unit 1.
- Integration — Latest Releases on the homepage is ordered by actual release date and includes the target entry if its date is in current/previous year.
- Edge case — any entry with no `fields.date` at all still renders a year (from subtitle or metadata fallback) and does not crash the card component.

**Verification:**
- Written verification record (for the PR description, not committed to the repo): list the slug, the pre-fix year, and the post-fix year for the target entry and 3 control entries.

## System-Wide Impact

- **Interaction graph:** Importers (`contentful/main.js`, `contentful/films.js`, `contentful/featuredFilms.js`) write JSON to `content/`. Nuxt Content validates against `content.config.ts` Zod schemas at query time. Queries flow to `app.vue` (`queryCollection('allvideos')`), page components, and the Pinia `videoStore`. Display components read `video_info.year` downstream.
- **Error propagation:** If Zod validation silently drops `video_info.year`, display components will render `undefined` or the component's fallback. There is no loud error — this is the exact failure mode of PR #8 and why Unit 1's inspection of on-disk JSON + runtime query result is essential.
- **State lifecycle risks:** Netlify build cache may skip re-running `contentImporter.js` if the importer files' timestamps don't change visibly. Mitigation: the local verification protocol in Unit 6 clears `content/`, `.nuxt/`, `.output/` before re-generating.
- **API surface parity:** Both importers must emit a symmetric documentary shape for all four `content/*` collections; the schema must accept the same shape. Unit 5 brings schemas into parity with emitted JSON.
- **Integration coverage:** Unit test coverage for this project is thin (no Vitest in `package.json`). The integration test is the full `npm run generate` + `npm run preview` cycle, executed in Unit 6.
- **Unchanged invariants:**
  - `docYear` remains a number and remains queried by `app.vue:19`.
  - The subtitle regex still extracts duration.
  - YouTube/Vimeo metadata fallback paths still run when neither `date` nor subtitle provide year.
  - Latest Releases still gates on current-year OR previous-year; only the year source changes.
  - Display components continue reading `video_info.year` with no changes.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Zod schema mismatch is NOT the root cause of PR #8's failure and the fix still doesn't work on Netlify | Unit 1's baseline JSON inspection + Unit 6's local `npm run generate` + `npm run preview` verification catches this before opening the PR. If local verification passes but Netlify fails, the bug is environmental (build cache) and a second PR can address it. |
| Changing `z.string()` to `z.number()` on `video_info.year` breaks another collection consumer expecting a string | Grep the full repo for `video_info.year` string operations before landing. `pages/index.vue:89` already does arithmetic on it, and `components/*.vue` use it via `{{ }}` interpolation (which coerces either way). Low risk, confirm before merging. |
| Adding `year` to featured collection schemas where it wasn't declared before causes Zod to reject featured JSON that has other undeclared fields | Zod by default allows extra fields unless `.strict()` is used. Check if any collection uses `.strict()`. If not, adding optional fields is safe. |
| Removing `docYear` accidentally | Plan explicitly forbids it. `app.vue:19` line reference captured. |
| Local `.env` missing required Contentful / Vimeo credentials | Implementer must confirm `.env` contents before Unit 1. Absent credentials means `npm run generate` hits remote API errors and masks the real verification. |
| `featuredFilms.js` silently skips the target entry (it only runs on entries in the curated featured list) | Expected and fine — if the entry isn't featured, the `content/featuredvideo/*.json` check in Unit 6 is skipped. Only `allvideos` and `latest` checks are mandatory. |
| Duplicated importer drift between `films.js` and `featuredFilms.js` after this fix | Accept for now. Filed as a deferred refactor in Scope Boundaries. |

## Documentation / Operational Notes

- PR description must explicitly explain PR #8's failure hypothesis (Zod schema type mismatch) and document the on-disk JSON verification that was NOT performed in PR #8.
- PR description must list the exact `video_info.year` values for `76PevuShR8NxEzSC2RBcfD` and 2–3 control entries before and after the fix, captured during Unit 1 and Unit 6.
- Reviewers should be pointed at `content.config.ts` schema changes since those are the least-obvious part of the fix.
- PR targets `main`, not `dev`. This is a hotfix branch.

## Sources & References

- Linear issue: CCM-272
- Prior PR: [#8 hotfix: prefer Contentful date field over subtitle-parsed year (closed)](https://github.com/ccmdesign/bfna-docs-nuxt/pull/8) — applied fix to `main.js` and `films.js`, year still wrong on Netlify preview, no root cause recorded.
- Contentful entry: `76PevuShR8NxEzSC2RBcfD`
- Key code: `contentful/main.js`, `contentful/films.js`, `contentful/featuredFilms.js`, `content.config.ts`, `app.vue`
- Display callsites: `components/docsCard.vue:184`, `components/docsCardMobile.vue:239`, `components/docsList.vue:87,94`, `components/docsHeroHeadings.vue:10`, `pages/index.vue:89`

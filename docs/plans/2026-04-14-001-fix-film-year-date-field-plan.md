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

Prior PR #8 (closed) applied the `main.js` fix and the `films.js` sort fix but year still showed 2025 on Netlify preview. **The deepening pass reordered these hypotheses based on evidence from the Nuxt Content 3.5.1 source and on-disk inspection of the last local build.** See "Deepening Pass Findings" below for the full evidence chain.

1. **`main.js` else-branch reassignment wipes the date-derived year.** *Confirmed root cause with high confidence via on-disk inspection + PR #8 diff review.* The target entry's subtitle is `"Silver, Lithium, and Mining in Bolivia"` — it does not match the `(YEAR, DURATION)` regex. When the regex fails, `main.js:217-223` runs `videoInfo = await getVimeoMetaInfo(...)`, which **wholesale reassigns the `videoInfo` variable** and returns `{ duration, year: <vimeo-upload-year> }` — the Vimeo upload year for this entry is 2025. PR #8's patch set `videoInfo.year = 2026` from `fields.date` BEFORE the subtitle block, but the `else` branch replaces the entire object, erasing the 2026 value. This is why the year stays at 2025 even with PR #8 applied. The plan previously listed this only as "test scenario — a regression PR #8 didn't explicitly protect against." That scenario IS the primary bug.
2. **Featured importer path.** `featuredFilms.js` shares `main.extractVideoInfo`, so once main.js is fixed correctly, both importers emit the right year. Verified: the target entry is in `content/featuredvideo/the-open-veins-of-potosi.json` AND `content/latest/the-open-veins-of-potosi.json` AND `content/allvideos/the-open-veins-of-potosi.json`, and all three currently show `video_info.year: 2025` from the same shared code path. Fixing main.js fixes all three.
3. **Zod schema type mismatch (PREVIOUSLY TOP HYPOTHESIS — NOW RULED OUT).** Inspection of Nuxt Content 3.5.1 internals (`node_modules/@nuxt/content/dist/module.mjs:1979-2011, 2081-2148` and `runtime/internal/collection.js:1-19`) shows:
   - `video_info` is a `ZodObject` → Nuxt Content classifies it as a `"json"` column type at schema-resolution time.
   - At SQLite insert, `generateCollectionInsert` serializes the whole `video_info` object via `JSON.stringify(data[key])`. The nested `video_info.year` Zod type (`z.string().optional()`) is NEVER consulted.
   - At query time, `refineContentFields` calls `JSON.parse(item[key])` to reconstitute the JSON column. No Zod `.parse()` / `.safeParse()` ever runs. No coercion, no stripping.
   - Conclusion: the `year: z.string().optional()` declaration is purely decorative (used only for TypeScript type generation via `zod-to-ts` and JSON-schema-for-MDC via `zod-to-json-schema`). It cannot strip, coerce, or drop the runtime value. **PR #8's failure has nothing to do with Zod.**
   - Corollary: `.strict()` / `.passthrough()` are NOT used anywhere in `content.config.ts`, and `video_info` is a nested JSON field so strict mode would be irrelevant anyway.
   - Top-level schema keys, however, ARE filtered. `generateCollectionInsert` iterates ONLY `Object.keys(collection.extendedSchema.shape)`. Any top-level field on the emitted JSON that is NOT declared in the schema is silently dropped from the SQLite row. This matters for the new top-level `date` field (see Unit 5 rewrite).
4. **Netlify build cache — RULED OUT for importer step.** `content/` is in `.gitignore` (line 25). `package.json`'s `generate` script is `node contentImporter.js && nuxt generate` — the importer runs fresh on every Netlify build. There is no `netlify.toml` in the repo. Netlify may cache `node_modules` and `.nuxt/` via its default build cache, but `.nuxt/content/` database contents are rebuilt from the `content/*.json` files that Nuxt Content reads on every build. Checksum-based skip (module.mjs:2687-2701) only re-uses a cached parse result if the file bytes haven't changed — but if `contentImporter.js` re-writes the same file with the same contents, the checksum is the same and parsing is skipped. The query result is still identical. Cache is not the bug.
5. **`contentImporter.js` race condition — NEW FINDING, MODERATE SEVERITY.** The script fires `getFeaturedDocs()`, `getSeries()`, `getAllFilms()` in parallel without `await`ing any of them and without wrapping in `Promise.all`. `featuredFilms.js:243` also does `data.items.map(async ({fields}, index) => {...})` which returns an array of promises discarded without await. The `node contentImporter.js && nuxt generate` chain can proceed to `nuxt generate` before all JSON files are written. On a cold Netlify build, `nuxt generate` may run against a partial `content/` directory. This alone won't cause the year-2025 bug, but it's a real risk for "stale data on preview" scenarios and should be flagged as a separate concern for the Netlify verification step in Unit 6.
6. **Wrong preview URL checked.** Lowest likelihood; listed for completeness.

The plan's verification protocol directly tests hypothesis #1 first (reproduce on-disk JSON shows the 2025 value, trace it to the `else` branch, apply the correct fix, re-verify).

### Deepening Pass Findings

Compiled 2026-04-14 after inspection of `node_modules/@nuxt/content@3.5.1` runtime, live PR #8 diff, and `content/*/the-open-veins-of-potosi.json` ground-truth files from the last local build in the sibling `bfna-docs-nuxt` checkout.

**Ground-truth on-disk state (pre-fix, from last local generate):**

| File | `id` | `subtitle` | `docYear` | `video_info.year` | type | `date` top-level |
| --- | --- | --- | --- | --- | --- | --- |
| `allvideos/the-open-veins-of-potosi.json` | `76Pev...fD` | `Silver, Lithium, and Mining in Bolivia` | **2026** | **2025** (WRONG) | `number` | `undefined` |
| `featuredvideo/the-open-veins-of-potosi.json` | `76Pev...fD` | same | `undefined` (not emitted here) | **2025** (WRONG) | `number` | `undefined` |
| `latest/the-open-veins-of-potosi.json` | `76Pev...fD` | same | `2026` | **2025** (WRONG) | `number` | `undefined` |
| `allvideos/white-gold.json` (control) | `sJcx...kZ` | truncated to `(...)` stripped form | `2026` | `2026` (correct) | `number` | `undefined` |
| `allvideos/nickel-land.json` (control) | `2eVH...O9` | `Indonesia's Critical Mineral` | `2025` | `2025` (consistent) | `number` | `undefined` |

Key observations from the evidence:

- **`docYear` (2026) already agrees with the Contentful `fields.date`** on the target entry, because `films.js:188` computes it directly from `fields.date`. This proves `fields.date` IS set to 2026 in Contentful and IS reaching the importer. The bug is isolated to the `video_info.year` code path in `main.js`, not data freshness.
- **The subtitle `"Silver, Lithium, and Mining in Bolivia"` does not contain `(NNNN, NN ...)`** — the regex `/\((\d+)\s*,\s*(\d+)\s*.*\)/` returns `null`, so execution enters the `else` branch at line 217 that calls `getVimeoMetaInfo`. The 2025 value is Vimeo's `upload_date` year for video `1091252124`, not anything derived from Contentful.
- **`control: white-gold.json`** has 2026 everywhere — its original subtitle MUST have been `(2026, NN Minutes)`, which both matched the regex and happened to agree with `fields.date`. This is why only 1 of 37 entries shows a mismatch. **The bug only bites films whose editor didn't include `(YEAR, DURATION)` in subtitle AND whose Vimeo/YouTube upload year differs from the actual release year.** This is a rare combination in the corpus today but guaranteed to recur.
- **Only 1 of 37 `content/allvideos/*.json` files currently shows `docYear` vs `video_info.year` mismatch** — verified via scripted diff. The fix is narrow; there is no silent corruption fleet-wide.
- **`fields.subtitle` is an always-present string** on the target entry. If the editor left the field blank entirely, `extractVideoInfo` would skip the subtitle block, never reassign `videoInfo`, and the year fix from PR #8 would have held. The bug specifically requires subtitle to be non-empty but non-matching.

**Nuxt Content 3.5.1 schema-handling evidence (source-verified):**

- `module.mjs:1979` — `JSON_FIELDS_TYPES = ["ZodObject", "ZodArray", "ZodRecord", "ZodIntersection", "ZodUnion", "ZodAny", "ZodMap"]`. Any top-level field whose underlying Zod type is one of these is classified as a SQLite `"json"` column and stored as stringified JSON.
- `module.mjs:1994-2010` — `defineCollection` builds `collection.fields` by iterating top-level shape keys only. Nested shape (e.g. `video_info.year`) is never walked.
- `module.mjs:2081-2148` — `generateCollectionInsert` iterates top-level schema keys. For json columns it does `JSON.stringify(valueToInsert)`. For missing data keys it falls back to the schema's `defaultValue()` or `"NULL"`. **No Zod `.parse()` call.**
- `runtime/internal/collection.js:1-19` — `refineContentFields` on query does `JSON.parse(item[key])` for json columns. **No Zod `.parse()` call.**
- `content.config.ts` — no `.strict()`, `.passthrough()`, `.catchall()`, or `.strip()` is used anywhere.
- Net effect: `video_info.year` survives exactly as the importer wrote it (a JavaScript `number`), regardless of the schema string/number declaration.

**Top-level key dropping (NEW finding, affects Unit 3/5 interpretation):**

- Because `generateCollectionInsert` iterates ONLY declared top-level schema keys, a top-level `date: fields.date || null` added to the emitted JSON from `films.js`/`featuredFilms.js` will be **silently dropped at SQLite insert** unless `date` is also added to the collection schema.
- However: `films.js`'s `getDocReleaseTimestamp` and the Latest Releases filter/sort all run in Node during the importer phase, reading `doc.date` from the in-memory object BEFORE it's ever ingested by Nuxt Content. So the importer-time sort/filter works regardless of schema. The schema matters only for any runtime `queryCollection(...)` consumer that wants to read `doc.date`.
- Current UI does NOT read `doc.date` directly (all display reads go through `video_info.year`), so Unit 5's schema addition of top-level `date` is an optional forward-compatibility change, not a correctness requirement for this hotfix.

**Netlify deploy-path risks that survive the code fix:**

- `.content.cache.json` / `.data/content/*` / `.nuxt/content/*`: if Netlify's build cache retains any of these from a previous build, and the importer re-writes `content/*.json` with identical bytes (same output as last build), the cache `checksum === checksum` branch hits and the cached query result is reused. That cached result is the OLD `video_info.year: 2025`. Mitigation: the code fix changes the `main.js` extractVideoInfo output for this specific entry, which changes the file bytes, which changes the file checksum, which forces re-parse. No cache miss needed. However, if Netlify caches the entire `.nuxt/content.sqlite3` database and the checksum salt includes `configHash` (which derives from `content.config.ts`), a change to `content.config.ts` (Unit 5) ALSO invalidates all cache entries. **Recommendation:** make at least one trivial change to `content.config.ts` as part of the PR (the plan's proposed schema edit already satisfies this), to guarantee full cache-bust on Netlify.
- `contentImporter.js` race condition (see hypothesis #5 above): a cold Netlify build with a slow Contentful response could start `nuxt generate` before all importer promises settle. Mitigation: wrap the three importer calls in `Promise.all([...])` with `await` at module top — OR, lower-risk for a hotfix, do nothing and accept the existing race. Noted as a deferred follow-up in the rewritten Scope Boundaries below. NOT blocking for CCM-272.

**What the plan correctly identified that survives the deepening pass:**

- PR #8 did NOT touch `featuredFilms.js` at all — still true. The fix flows via `main.extractVideoInfo`, which both importers call, so a correct main.js fix covers the hero as well.
- `docYear` at `app.vue:19` is live and must remain a number — still true. No change to `docYear` handling needed.
- The two-importer architecture is duplicated; a unifying refactor is deferred.
- Local `npm run generate` → on-disk JSON inspection → `npm run preview` → browser verification is the right verification protocol.

**What the plan got wrong and is rewritten below:**

- Primary root cause was Zod schema mismatch. **Wrong.** Primary root cause is the `else`-branch reassignment in `main.js:217-223`.
- Unit 5 (schema edit) was framed as the critical fix. **Reframed.** Unit 5 is now optional hardening / documentation-correctness, not the load-bearing change.
- Unit 2 (main.js fix) was framed as "mirror PR #8." **Reframed.** Unit 2 must go further than PR #8 by restructuring `extractVideoInfo` so the `else` branch cannot overwrite a date-derived year.

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
- **Decision (revised after deepening): Restructure `extractVideoInfo` so the metadata fallback cannot overwrite a date-derived year.** Rationale: PR #8 set `videoInfo.year` before the subtitle block, but the `else` branch at line 217 does `videoInfo = await getVimeoMetaInfo(...)` — a full reassignment that wipes the year. This is the actual root cause of PR #8's failure. The fix must compute metadata into a separate local variable and merge it in after, never reassigning the outer `videoInfo`. See Unit 2.
- **Decision: Emit `video_info.year` as a number, and update the Zod schema to match.** Rationale: `pages/index.vue:89` already does numeric arithmetic on it and `docYear` is already `z.number()`. **Important update from deepening pass:** the schema change is NOT load-bearing for correctness — Nuxt Content 3.5.1 stores `video_info` as a JSON blob and never runs Zod on nested fields. The `z.number()` change is still worth doing because (a) it correctly documents the type for `zod-to-ts` IDE completion, and (b) changing `content.config.ts` cache-busts Nuxt Content's checksum on the next Netlify build. See the reframed Unit 5.
- **Decision: Also expose `date: fields.date || null` on the emitted documentary object in BOTH `films.js` and `featuredFilms.js`.** Rationale: `films.js`'s `getDocReleaseTimestamp` needs it on the doc (post-handleDocumentaries) for the Latest Releases filter/sort. `featuredFilms.js` doesn't currently need it at runtime but exposing it symmetrically keeps the two emitted shapes consistent and makes future sort-by-date logic in the featured importer trivial.
- **Decision: Update both `getDocReleaseTimestamp` (post-handle, used for Latest Releases) AND the primary sort tiebreaker (pre-handle, used for `allvideos` order after `fields.order`) to prefer `fields.date` / `doc.date`.** Rationale: the primary sort tiebreaker at `films.js:268` currently uses `sys.createdAt`; updating it aligns secondary-order behavior with the fix. Low-risk and matches what PR #8 did.
- **Decision: Do NOT remove `docYear`.** Rationale: earlier analysis in the task brief called it a dead field, but `app.vue:19` queries it and the schema types it. Removing it breaks the allvideos ordering on the main app load.
- **Decision: Keep the `z.string().optional()` → `z.number().optional()` schema change scoped to the collections whose importers actually emit `video_info.year`.** That is `allvideos` (line 103), `latest` (line 56), and — if we now choose to emit `year` in the featured importers for consistency — we must also add `year: z.number().optional()` to the `featuredvideo` (line 181–190) and `featuredvideos` (line 223–232) `video_info` sub-schemas. Without this, featured collection JSON may get its `video_info.year` stripped at query time even though it's on disk.

## Open Questions

### Resolved During Planning

- **Is `docYear` dead?** No. `app.vue:19` orders `allvideos` by it. Keep it and keep it as `z.number()`.
- **Is year a string or number?** The existing `main.js` code produces a number (`parseInt`). The Zod schema says string. Resolution: change schema to number for type-correctness, but note that Nuxt Content 3.5.1 does not validate nested JSON fields at runtime so this is cosmetic.
- **Which files does the `date` exposure need to land in?** Both `films.js` and `featuredFilms.js`. The task brief is correct.
- **Does the homepage hero use `featuredvideo` or `allvideos`?** Featured — so the fix must apply to `featuredFilms.js`, not just `films.js`. Verified via disk inspection: target entry IS in `content/featuredvideo/the-open-veins-of-potosi.json`, currently with the wrong year.

### Resolved During Deepening Pass

- **Does `content.config.ts` use `.strict()` mode?** No. No `.strict()`, `.passthrough()`, `.catchall()`, or `.strip()` anywhere. Default Zod object behavior applies. Adding optional fields is safe; unknown fields in nested `video_info` are not stripped because nested schemas never run.
- **How does Nuxt Content 3.5.1 handle schema validation on queried documents?** It does NOT re-validate with Zod on read. `refineContentFields` in `runtime/internal/collection.js` only does `JSON.parse()` on fields whose top-level type is a JSON class (`ZodObject`, `ZodArray`, etc.). There is no `safeParse()` / `parse()` call anywhere in the insert or read paths in `module.mjs` or `runtime/`. The Zod schema is only used for: (a) generating TypeScript types via `zod-to-ts`, (b) generating JSON-schema for MDC editor features via `zod-to-json-schema`, (c) classifying fields into SQLite column types at build time.
- **Are there OTHER code paths that write `video_info.year`?** No. Both importers (`films.js:205` and `featuredFilms.js:201`) produce `video_info: { ...videoInfo, ...extraVideoInfo }` where `extraVideoInfo` comes from the single shared `main.extractVideoInfo`. The `trailer` collection schema declares a `video_info` that does NOT include `year` at all, but no importer writes to `content/trailer/`; inspecting git history and the importer code shows the trailer collection is unused. Fixing `main.extractVideoInfo` covers every path.
- **Does `docYear` ASC ordering in `app.vue:19` interact badly with the fix?** No. After the fix, the target entry's `docYear` stays 2026 (it was already 2026 because `films.js:188` already computed it from `fields.date` — that field was never broken). The fix changes `video_info.year` from 2025 to 2026, but `app.vue`'s query order is by `docYear`, not `video_info.year`. `pages/index.vue:89` re-sorts by `video_info.year` afterward, so the visible ordering in the all-films grid depends only on `video_info.year` matching `docYear`, which will be true post-fix. No unexpected interaction.
- **Edge cases for missing `fields.date`?** Covered in Unit 2 Edge cases 6-9: `null`, `undefined`, empty string, malformed string all fall through to subtitle/metadata paths. Unit 2's refactor explicitly guards `Number.isNaN(dateYear)`.
- **Netlify build cache — could it still serve stale data after a correct code fix?** Low risk, with a belt-and-braces mitigation. `content/` is gitignored, so every Netlify build re-runs `contentImporter.js` from scratch. Netlify's build cache may retain `.nuxt/content.sqlite3` from a prior build, but Nuxt Content's internal checksum (`configHash + collectionHash + content`) invalidates on any change to `content.config.ts` OR the content file bytes. Unit 5's schema edits change `configHash`, forcing a full re-parse. Additionally, Unit 6's `rm -rf .nuxt/ .data/ .content.cache.json` in the local verification proves the code fix works against a cold cache.
- **`contentImporter.js` race condition** (NEW — see Unit 7): the three importer calls are not awaited. Not the cause of CCM-272 but worth documenting.

### Deferred to Implementation

- **Exact confirmation of root cause for PR #8.** Hypothesis-level confirmation is done (deepening pass evidence is strong). Implementer should still run `npm run generate` locally to regenerate from live Contentful, inspect the target JSON, and sanity-check against the expected values in the Deepening Pass Findings table.

## Implementation Units

- [ ] **Unit 1: Reproduce the bug locally and confirm root cause**

**Goal:** Establish ground truth and confirm the deepening-pass root-cause hypothesis (main.js else-branch reassignment) before changing code.

**Note — baseline already captured during deepening:** The deepening pass already inspected `content/*/the-open-veins-of-potosi.json` from the sibling `bfna-docs-nuxt` checkout's last local build. The exact values are in the "Deepening Pass Findings" table above. The implementer can skim that table before running the importer to save time. But running the importer fresh is still required to rule out stale-data confusion.

**Requirements:** R6 (baseline)

**Dependencies:** Access to `.env` with `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `YOUTUBE_API_KEY`, `VIMEO_CLIENT_SECRET`.

**Files:**
- Inspect only: `content/allvideos/the-open-veins-of-potosi.json`
- Inspect only: `content/featuredvideo/the-open-veins-of-potosi.json`
- Inspect only: `content/latest/the-open-veins-of-potosi.json`
- Inspect only: `content/featuredvideos/the-open-veins-of-potosi.json` (may not exist; the target entry is the hero's main video but not in the featured reel)

**Approach:**
- Run `npm install` then `npm run generate` in the CCM-272 worktree.
- The slug for `76PevuShR8NxEzSC2RBcfD` is `the-open-veins-of-potosi` (confirmed during deepening pass).
- Open the JSON files above and verify `video_info.year === 2025` and `docYear === 2026` on the target entry. `subtitle` should be `"Silver, Lithium, and Mining in Bolivia"` (no parens, because `films.js:192` strips them).
- Open `contentful/main.js` lines 211-224 and re-read the `else` branch. Confirm that `videoInfo = await getVimeoMetaInfo(...)` is wholesale reassigning the object. THIS is the bug. You should be able to articulate it in one sentence to a teammate before touching any code.
- Spot-check the two control entries from the deepening pass: `white-gold.json` (`video_info.year: 2026`, correct) and `nickel-land.json` (`video_info.year: 2025`, consistent with `docYear: 2025`). Both should remain unchanged after the fix.
- Grep the emitted allvideos for any OTHER mismatches: `node -e "const fs=require('fs'); for (const f of fs.readdirSync('content/allvideos').filter(x=>x.endsWith('.json'))) { const d=require('./content/allvideos/'+f); if (d.docYear && d.video_info?.year && d.docYear !== d.video_info.year) console.log(f, d.docYear, d.video_info.year); }"`. Expected: only `the-open-veins-of-potosi.json` shows a mismatch. If more show up, the bug is broader and those entries also need post-fix verification.

**Verification:**
- Clear baseline: "Target entry currently emits `video_info.year: 2025` (type: number), `docYear: 2026`, `subtitle: 'Silver, Lithium, and Mining in Bolivia'`. Else-branch reassignment path confirmed."
- Zod hypothesis is already ruled out by deepening pass. Do not spend time on `content.config.ts` Zod types in this unit.
- If year is missing entirely from the JSON file, `extractVideoInfo` has a more fundamental bug that predates this ticket — escalate.

- [ ] **Unit 2: Fix `video_info.year` in `main.js` — `fields.date` authoritative AND else-branch cannot clobber it**

**Goal:** Restructure `extractVideoInfo` so that (a) `fields.date` is the primary source for `videoInfo.year`, (b) the subtitle regex only fills `year` when date is absent, (c) the Vimeo/YouTube metadata fallback NEVER overwrites a year already set from `fields.date`, and (d) the pre-existing `thumbnail` (set at lines 205-209) is preserved regardless of which year path is taken.

**This is the load-bearing fix.** The deepening pass confirmed that the target entry's subtitle does not match the regex, so execution enters the `else` branch at line 217 which reassigns `videoInfo = await getVimeoMetaInfo(...)`. PR #8 set `videoInfo.year = 2026` before this block, and the reassignment erased it. The year was replaced with Vimeo's upload year (2025). This unit MUST restructure that code so the reassignment is impossible.

**Requirements:** R1, R4 (via shared call path), R6 (correctness)

**Dependencies:** Unit 1

**Files:**
- Modify: `contentful/main.js`

**Approach:**
- In `extractVideoInfo`, compute the date-derived year FIRST and store it in a local const:
  ```js
  const dateYear = fields.date ? new Date(fields.date).getFullYear() : null;
  ```
- Keep the existing `videoInfo.thumbnail = ...` pre-block.
- Compute the subtitle regex match into a local, do NOT yet assign to `videoInfo`.
- Compute the metadata fallback (`getYoutubeMetaInfo` / `getVimeoMetaInfo`) into a SEPARATE local variable (`metaInfo`), NOT into `videoInfo`. The fallback must only run if at least one of `year` or `duration` is still unknown.
- At the end, merge in strict priority order:
  1. `videoInfo.year = dateYear ?? subtitleYear ?? metaInfo?.year ?? null`
  2. `videoInfo.duration = subtitleDuration ?? metaInfo?.duration ?? null`
  3. `videoInfo.thumbnail` stays whatever was set at the top of the function (do not touch).
- Under no circumstances should the `videoInfo` variable be reassigned via `videoInfo = await getVimeoMetaInfo(...)`. That assignment is the bug.
- Keep `videoInfo.year` as a **number** (matches existing `parseInt` and `docYear`).
- Preserve the pre-existing behavior where `extractVideoInfo` returns `{}` for entries that have no `video_url`, no `subtitle`, and no `date`. (Currently returns an object with only `thumbnail` in that case; keep that.)

**Edge cases the refactor MUST handle (tested explicitly in Unit 6):**

1. `fields.date` set, subtitle matches regex — year from date, duration from subtitle. (Target scenario #1.)
2. `fields.date` set, subtitle does NOT match regex, video is Vimeo with a different upload year — **year from date (2026), duration from Vimeo metadata**, thumbnail preserved from the top-of-function block. **This is the target entry's exact scenario.**
3. `fields.date` set, subtitle empty — year from date, duration from Vimeo/YouTube metadata, thumbnail preserved.
4. `fields.date` missing, subtitle matches regex — year from subtitle, duration from subtitle. (Legacy path preserved.)
5. `fields.date` missing, subtitle does not match regex, Vimeo — year from Vimeo metadata, duration from Vimeo metadata. (Legacy path preserved.)
6. `fields.date` missing, subtitle missing — year from Vimeo metadata, duration from Vimeo metadata. Current behavior is broken here (the subtitle-gated else branch never runs), so year ends up `undefined`. **This unit MUST fix this case too**, by calling metadata fallback when year/duration are unset regardless of whether subtitle exists.
7. `fields.date` set but malformed (`new Date("invalid")` → `NaN`): `getFullYear()` returns `NaN`. Guard against this: if `Number.isNaN(dateYear)`, treat it as unset and fall through to subtitle/metadata.
8. `fields.date` is an empty string `""`: falsy, skip it (treat as unset).
9. `fields.date` is `null`: falsy, skip it (treat as unset).

**Patterns to follow:**
- Existing `docYear` construction at `contentful/films.js:188`: `fields.date ? new Date(fields.date).getFullYear() : extraVideoInfo.year`. Mirror the null/NaN guard.

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

- [ ] **Unit 5: Optional schema hardening in `content.config.ts` (was: "Fix Zod schema type mismatch")**

**Goal reframed after deepening pass:** The schema is NOT the load-bearing fix. Nuxt Content 3.5.1 stores `video_info` as a raw JSON blob — the nested `z.string().optional()` declaration never runs at ingest or query time (evidence: `module.mjs:1979`, `module.mjs:2081-2148`, `runtime/internal/collection.js:1-19`, all cited in the Deepening Pass Findings section). The year field survives as the JS `number` the importer wrote, regardless of what the schema declares.

This unit has THREE remaining purposes, in order of value:
1. **Cache-busting on Netlify.** Touching `content.config.ts` changes the `configHash` that Nuxt Content mixes into every cache-entry checksum, guaranteeing a full re-parse of every content file on the next Netlify build. This neutralizes the "stale .nuxt/content.sqlite3 from previous build" risk without any runtime code change.
2. **Correctness of generated TypeScript types.** `zod-to-ts` reads the schema to produce `AllvideosCollectionItem` interfaces consumed by `.vue` files. Changing `year: z.string().optional()` → `z.number().optional()` makes autocompletion accurate. No runtime effect, but prevents future type drift for developers relying on IDE.
3. **Top-level `date` accessibility for future consumers.** Top-level schema keys ARE filtered at SQLite insert (`generateCollectionInsert` iterates only `Object.keys(collection.extendedSchema.shape)`). If the plan adds `date: fields.date || null` as a top-level field on the emitted doc in Units 3/4 AND any future Nuxt page wants to `queryCollection('allvideos').first().then(d => d.date)`, the field MUST be declared in the schema OR it will be silently dropped from the SQLite row. This is forward-compatibility only — no current consumer reads `doc.date` at runtime.

**Requirements:** R5 (reframed from "must match emitted type" to "must accept emitted shape so no field is silently dropped"), R6 (via cache-bust).

**Dependencies:** Units 2, 3, 4 (the schema must match the new emitted shape)

**Files:**
- Modify: `content.config.ts`

**Approach:**
- In the `allvideos` collection's `video_info` schema (around line 103), change `year: z.string().optional()` to `year: z.number().optional()`. (Type-correctness; cache-bust side effect.)
- In the `latest` collection's `video_info` schema (around line 56), same change.
- In the `featuredvideo` collection's `video_info` schema (lines 181–190), add `year: z.number().optional()`, `duration: z.number().optional()`, and `thumbnail: z.string().url().optional()` — all three are currently missing. (Type-correctness. Nested, no runtime effect, but ensures IDE/type-gen consistency.)
- In the `featuredvideos` collection's `video_info` schema (lines 223–232), add the same three fields.
- Add top-level `date: z.string().nullable().optional()` to `allvideos`, `latest`, `featuredvideo`, and `featuredvideos` collection schemas. Contentful emits date as an ISO-8601 string. **This is the only schema change with real runtime consequences** — without it, any top-level `date` field added by Units 3/4 is silently dropped at SQLite insert. (Current UI does not read it, but the importer's in-memory sort/filter already read `doc.date` directly before writing, so the dropping does not affect Latest Releases ordering.)
- **Do not** touch `docYear: z.number()` — it stays.

**Failure-mode check the plan previously got wrong:**
- `z.string().optional()` does NOT drop, coerce, or reject a numeric value at query time in Nuxt Content 3.5.1. Don't waste time debugging Zod — verify the `main.js` code path instead. The on-disk file already shows `video_info.year` as a JSON number; the bug is upstream of Zod.

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
- Inspect only: `content/allvideos/the-open-veins-of-potosi.json`, `content/featuredvideo/the-open-veins-of-potosi.json`, `content/latest/the-open-veins-of-potosi.json`, `content/featuredvideos/the-open-veins-of-potosi.json` (if present).
- Inspect only: browser UI for the slug `the-open-veins-of-potosi`.

**Approach:**
- `rm -rf content/ .nuxt/ .output/ .data/ .content.cache.json` to clear any stale cache. (The additional `.data/` and `.content.cache.json` paths are new — the deepening pass confirmed Nuxt Content 3.5.1 writes cache state to both locations. Skipping them risks a stale query result masking a correct file on disk.)
- `npm run generate`.
- Grep `content/allvideos/*.json` for `"id":"76PevuShR8NxEzSC2RBcfD"` to confirm the slug is still `the-open-veins-of-potosi` (unchanged).
- Verify `video_info.year: 2026` (as a JSON **number**, not a string) in every emitted JSON for that entry across all four collections. Also verify `docYear: 2026` in `allvideos` and `latest` (unchanged from baseline).
- Verify `date: "2026-..."` on the top-level doc in `allvideos` and `latest` emitted JSON after Unit 3/4 run. (The featured JSON files will ALSO have top-level `date` after Unit 4, but Nuxt Content's schema will strip it from the SQLite row unless Unit 5's schema addition is applied. Inspect the JSON file on disk, not the query result, to confirm Unit 4 landed.)
- `npm run preview` and visit: (a) homepage, (b) all-films grid, (c) the film's detail page at `/docs/the-open-veins-of-potosi` or equivalent. Confirm the UI shows **2026** in every location.
- Open browser devtools → Network tab → inspect the SSR'd HTML or the `_payload.json` / Nuxt Content query response on the page. Confirm `video_info.year` is present and reads `2026` (number). This catches any residual schema/query-layer issue that file inspection alone would miss.
- Spot-check 2–3 other entries chosen at random from `content/allvideos/`: their years must be unchanged from what Unit 1 recorded.
- Confirm Latest Releases order on the homepage reflects descending `fields.date`. Note: the target entry's `fields.date` is 2026, so it should appear at or near the top of Latest Releases.

**Test scenarios:**
- Happy path — target entry displays 2026 on: (a) all-films grid card, (b) mobile card, (c) any list view, (d) hero (featured — confirmed target IS the featured hero via deepening pass), (e) the film's own detail page.
- Regression — 2–3 control entries still display the same year they showed in Unit 1 (`white-gold: 2026`, `nickel-land: 2025` are known controls from deepening).
- Integration — Latest Releases on the homepage is ordered by actual release date and includes the target entry since its date is 2026 (current year).
- Edge case — any entry with no `fields.date` at all still renders a year (from subtitle or metadata fallback) and does not crash the card component. **Explicit check:** find at least one entry in `content/allvideos/` where `docYear` is undefined OR computed only from metadata fallback, and confirm its card still renders a year gracefully.
- Edge case — `fields.date` is an empty string or null on some entry (unlikely but possible): card still renders, no `NaN` in the DOM.

**Verification:**
- Written verification record (for the PR description, not committed to the repo): list the slug, the pre-fix year, and the post-fix year for the target entry and 3 control entries.
- Explicit call-out in the PR description that the root cause was the `else`-branch reassignment in `main.js:217-223`, NOT a Zod schema mismatch (to prevent the next debugger from repeating the mistaken hypothesis).
- Explicit call-out that the schema change in Unit 5 is a cache-bust + type-correctness change, not the load-bearing fix.

- [ ] **Unit 7 (NEW, informational): Document the contentImporter.js race condition**

**Goal:** Leave a trail for whoever picks up the next round of importer work. Do NOT fix the race in this hotfix; only document it.

**Requirements:** None (out of scope for R1-R7).

**Dependencies:** None.

**Files:**
- Modify (comment-only): `contentImporter.js`
- Or: add to the PR description under "Noticed but not touched"

**Background (from deepening pass):**
- `contentImporter.js` fires `getFeaturedDocs()`, `getSeries()`, `getAllFilms()` in parallel without `await` or `Promise.all`.
- `featuredFilms.js:243` does `data.items.map(async ({fields}, index) => {...})` — returns promises that are discarded.
- `films.js` writes files via `fs.writeFile` with a callback (not `fs.promises.writeFile`), so `writeContent` returns before the file is written to disk.
- Net effect: `node contentImporter.js && nuxt generate` can proceed to `nuxt generate` while importer promises are still in-flight. On a slow Contentful response or cold Netlify build, `nuxt generate` may start against a partial `content/` directory.
- This is probably not the reason CCM-272's specific bug manifests (the target entry HAS been written, just with the wrong `video_info.year`), but it's a latent defect that could cause intermittent "half the films are missing" Netlify deploys.

**Approach (for this hotfix — minimal):**
- Add a comment at the top of `contentImporter.js` flagging the race condition as a known issue and linking to a follow-up ticket.
- Mention in the PR description under "Noticed but not touched."
- **DO NOT wrap in `await Promise.all([...])` in this PR.** That's a separate fix with its own regression risk (it would serialize the three importers and change timing — might surface other latent issues).

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
| Zod schema change does not fix the bug (CONFIRMED after deepening — schema is not the root cause) | Unit 2's `main.js` restructure IS the load-bearing fix. Unit 5's schema change is hardening only. Implementer should not bail out after Unit 5 alone thinks everything is fine. |
| Unit 2's refactor breaks the year/duration/thumbnail contract for an edge case not in the test matrix | Unit 2 spells out 9 explicit edge cases covering every combination of `fields.date` x subtitle-state x video-provider. Verify each against 1-2 representative entries in the generated JSON. |
| `fields.date` on some entry is a malformed string (e.g. `"2026"` with no month/day, or `"soon"`) causing `new Date(...).getFullYear()` to return `NaN` | Unit 2 Edge Case 7: explicit `Number.isNaN(dateYear)` guard that falls through to subtitle/metadata paths. |
| Changing `z.string()` to `z.number()` on `video_info.year` breaks another collection consumer expecting a string | Deepening pass confirmed: nested schemas never run at ingest or read time in Nuxt Content 3.5.1, so there is no runtime consumer affected. Only TypeScript-type consumers could care, and those are .vue files using template interpolation (coerces either way). Very low risk. |
| Adding `year`/`duration`/`thumbnail` to featured collection nested schemas where they weren't declared before | No runtime effect (nested JSON blob), only affects generated TS types. Safe. |
| Adding top-level `date` to collection schemas | Important caveat: once `date` is in the schema, the schema-to-SQL layer will create a TEXT column for it and write the ISO string. If the column already exists in the cached Netlify SQLite DB with a different definition, the `DROP TABLE IF EXISTS` logic in `generateCollectionTableDefinition` (gated by `opts.drop`) may or may not run depending on Nuxt Content's migration path. The `structureVersion` checksum catches this and triggers a rebuild. Low risk, but monitor Netlify build logs on first deploy after this change. |
| Removing `docYear` accidentally | Plan explicitly forbids it. `app.vue:19` line reference captured. |
| Local `.env` missing required Contentful / Vimeo credentials | Implementer must confirm `.env` contents before Unit 1. Absent credentials means `npm run generate` hits remote API errors and masks the real verification. |
| `featuredFilms.js` silently skips the target entry — RULED OUT | Deepening pass confirmed target entry IS in `content/featuredvideo/the-open-veins-of-potosi.json`. It's the current hero. |
| Duplicated importer drift between `films.js` and `featuredFilms.js` after this fix | Accept for now. Filed as a deferred refactor in Scope Boundaries. |
| Netlify reusing a stale Nuxt Content SQLite DB from an earlier build cache | Mitigation: Unit 5's `content.config.ts` edit changes `configHash`, which forces Nuxt Content to rebuild all collection tables regardless of cache. Additional mitigation: Unit 6's local protocol clears `.nuxt/`, `.data/`, and `.content.cache.json` before re-generating. If the Netlify preview still shows 2025 after a green local verification, the next debugging step is to diff Netlify build logs for "cachedFilesCount" vs "parsedFilesCount" in Nuxt Content's log output to confirm the importer truly ran. |
| `contentImporter.js` race condition causing a partial Netlify build | Unrelated to CCM-272's primary bug, but flagged in Unit 7. If a future Netlify build shows MISSING entries (not just wrong years), revisit this. |

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

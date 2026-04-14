---
status: ready
priority: p2
issue_id: "001"
tags: [contentful, schema, correctness, CCM-272]
dependencies: []
---

# Guard docYear against NaN from malformed fields.date in films.js

## Problem Statement

In `contentful/films.js` line 189, the `documentaries.push({...})` shape computes:

```js
docYear: fields.date ? new Date(fields.date).getFullYear() : extraVideoInfo.year,
```

This lacks a `Number.isNaN` guard. If a Contentful entry has a non-empty but malformed `fields.date` string (typo, partial ISO, "unknown", etc.), `new Date(...).getFullYear()` returns `NaN`. The `allvideos` collection schema in `content.config.ts` declares `docYear: z.number()` (non-optional), and **Zod's `z.number()` rejects `NaN` by default**. This would cause Nuxt Content ingest to fail for that single entry.

This is inconsistent with the hardening done in the same PR to `contentful/main.js` `extractVideoInfo`, which explicitly guards `Number.isNaN(parsedYear)`. The two code paths should behave the same way so one doesn't silently undo the other's safety net.

## Findings

- **File:** `contentful/films.js:189`
- **Contract broken:** `allvideos` schema (`content.config.ts:84`) declares `docYear: z.number()` — required, non-NaN.
- **Parallel in the same PR:** `contentful/main.js:211-216` (new `extractVideoInfo`) does this correctly:
  ```js
  const parsedYear = new Date(fields.date).getFullYear();
  if (!Number.isNaN(parsedYear)) {
    dateYear = parsedYear;
  }
  ```
- **Impact:** Single malformed entry crashes `nuxt generate` content ingest, breaking the whole build — not a graceful degradation.
- **Current prevalence:** Unknown. PR body's fleet scan of 35 `content/allvideos/*.json` files shows no mismatches today, but editors can set a bad `date` at any time and this code should be defensive.
- **Not blocking this hotfix** because Contentful's Date field widget normally emits valid ISO strings and no entries are currently malformed, but the inconsistency is a footgun left in by the fix.

## Proposed Solutions

### Option 1: Inline NaN guard with metaInfo fallback

**Approach:** Mirror the `extractVideoInfo` guard shape:

```js
let docYear = extraVideoInfo.year;
if (fields.date) {
  const parsedYear = new Date(fields.date).getFullYear();
  if (!Number.isNaN(parsedYear)) {
    docYear = parsedYear;
  }
}
// then:
docYear,
```

**Pros:**
- Consistent with `extractVideoInfo` hardening.
- No behavior change for well-formed dates.
- Graceful degradation to `extraVideoInfo.year` (already correctly derived in the updated `extractVideoInfo`).

**Cons:**
- Adds 6 lines above the object literal.

**Effort:** 10 minutes
**Risk:** Low

---

### Option 2: Extract a shared `parseYearOrNull(dateString)` helper

**Approach:** Put the guarded parse logic in `contentful/main.js` as an exported helper and reuse it from `extractVideoInfo` and `films.js`.

**Pros:**
- Single source of truth for date-to-year parsing.
- Reusable if more call sites appear.

**Cons:**
- Broader refactor than a hotfix follow-up warrants.

**Effort:** 30 minutes
**Risk:** Low

---

### Option 3: Leave as-is, rely on upstream Contentful validation

**Pros:** Zero diff.
**Cons:** Silent crash vector persists. A single bad editor input takes down the build.

## Recommended Action

**To be filled during triage.** Recommend Option 1 as a one-file follow-up PR. It matches the hardening pattern already used in `extractVideoInfo` and keeps the two code paths in sync.

## Technical Details

**Affected files:**
- `contentful/films.js:189` — the unguarded `new Date(...).getFullYear()`
- Reference: `contentful/main.js:211-216` — the pattern to mirror
- `content.config.ts:84` — the schema contract that fails on NaN

**Related components:**
- Nuxt Content 3.5.1 ingest (applies schema at collection parse time)
- `allvideos` collection (consumed by the all-films grid)

## Resources

- **PR:** https://github.com/ccmdesign/bfna-docs-nuxt/pull/9
- **Issue:** CCM-272
- **Plan:** `docs/plans/2026-04-14-001-fix-film-year-date-field-plan.md`

## Acceptance Criteria

- [ ] `contentful/films.js:189` guards `Number.isNaN` before assigning `docYear`
- [ ] Malformed-date unit test or local verification confirms the entry falls through to `extraVideoInfo.year` instead of producing `NaN`
- [ ] `npm run generate` completes without Zod validation errors when a test entry has a bad date
- [ ] `extractVideoInfo` and `films.js` behave identically for the same bad date input

## Work Log

### 2026-04-14 - Initial Discovery

**By:** ce-review (compound-engineering:ce-review)

**Actions:**
- Reviewed PR #9 diff against `main`
- Verified `extractVideoInfo` restructure correctly guards NaN
- Noticed `films.js:189` does the same parse without the guard
- Cross-checked `content.config.ts` schema — `docYear: z.number()` (non-optional) rejects NaN
- Rated P2: latent footgun, not currently triggered, but defeats the defensive work done in the same PR

**Learnings:**
- When hardening a shared parse, audit all call sites — not just the one that caused the bug.
- Zod's default `z.number()` rejects `NaN`; this is easy to forget.

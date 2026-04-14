---
status: deferred
priority: p3
issue_id: "004"
tags: [contentful, timezone, edge-case, CCM-272, follow-up]
dependencies: []
---

## Resolution (2026-04-14)

**Decision:** Deferred to a follow-up (non-hotfix) PR.

**Rationale:** This is P3 observational and not a regression introduced by
CCM-272. The todo itself recommends not changing this as part of the hotfix —
it needs a broader review of what Contentful editors actually enter
(`YYYY-MM-DDTHH:mm` vs `YYYY-MM-DD`) and whether `getUTCFullYear()` or a regex
extract is preferable, plus a test against a year-boundary entry. Out of scope
for a tight hotfix.

**Next step:** File a follow-up issue to decide between Option 2 (regex-
extract year) and Option 1 (`getUTCFullYear()`), with a test case for a
`2026-01-01T00:00` entry in a non-UTC timezone.

# fields.date parsing uses local-time getFullYear — year-boundary edge case

## Problem Statement

Both `contentful/main.js` (new `extractVideoInfo`, line ~213) and `contentful/films.js` line 189 compute year via:

```js
new Date(fields.date).getFullYear()
```

If `fields.date` is a timezone-naive ISO string like `"2026-01-01T00:00"` (Contentful's Date field serialization), `Date` parses it as **local time** per the JS spec for date-time strings without a timezone suffix. `getFullYear()` then returns the local-year, which can differ from the UTC year at year boundaries depending on the machine running the build.

For the target entry in this PR (`2026-04-13T00:00`), this is safe — mid-April is nowhere near a year boundary. But for a January 1st or December 31st entry, the Netlify build machine's timezone could produce a year that's off by one relative to what the editor intended.

This is a **latent bug unrelated to CCM-272**, not introduced by this PR. Flagging for awareness and an optional follow-up.

## Findings

- **Files:**
  - `contentful/main.js:212` — `new Date(fields.date).getFullYear()` in `extractVideoInfo`
  - `contentful/films.js:189` — `new Date(fields.date).getFullYear()` in `handleDocumentaries`
- **Spec reference:** ECMA-262 Date Time String Format — date-time strings without a timezone designator are interpreted as local time. Date-only strings are interpreted as UTC. So `"2026-01-01"` would be UTC, but `"2026-01-01T00:00"` would be local.
- **Contentful emits** ISO strings from the Date field, typically `YYYY-MM-DDTHH:mm` for date-with-time, which is the local-time form.
- **Impact:** Rare — only affects entries with dates in the first ~12 hours of Jan 1 or last ~12 hours of Dec 31 if the build runs in a non-UTC timezone.
- **Netlify build environment:** UTC by default, which happens to match date-only strings but not date-with-time strings.
- **Not a regression from this PR.** The bug predates CCM-272.

## Proposed Solutions

### Option 1: Normalize with `getUTCFullYear()`

**Approach:**

```js
const parsedYear = new Date(fields.date).getUTCFullYear();
```

**Pros:**
- Deterministic regardless of build-machine timezone.
- Matches how a date-only string would be parsed.
- One-line change in two places.

**Cons:**
- Could produce a year that differs from the editor's intent if the editor entered `2026-01-01T01:00` in UTC+2 expecting "2026-01-01" local (parsed as 2025-12-31T23:00 UTC -> UTC year 2025).

**Effort:** 5 minutes
**Risk:** Low-Medium (depends on editor intent — needs a quick check against current Contentful entries)

---

### Option 2: Regex-extract the year without Date parsing

**Approach:**

```js
const yearMatch = fields.date.match(/^(\d{4})/);
const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : NaN;
```

**Pros:**
- No timezone ambiguity at all.
- Trivial to reason about.

**Cons:**
- Doesn't validate that the rest of the date is well-formed.

**Effort:** 10 minutes
**Risk:** Low

---

### Option 3: Do nothing

**Pros:** Zero diff, zero risk of introducing a different regression.
**Cons:** Latent bug persists at year boundaries.

## Recommended Action

**To be filled during triage.** Recommend Option 3 until someone actually hits the year-boundary case, or Option 2 as a cheap hardening follow-up. Do not change as part of this hotfix — out of scope and needs a broader review of what Contentful editors actually enter.

## Technical Details

**Affected files:**
- `contentful/main.js:212`
- `contentful/films.js:189`

**Related components:**
- Contentful Date field serialization
- Netlify build timezone (typically UTC)

## Resources

- **PR:** https://github.com/ccmdesign/bfna-docs-nuxt/pull/9
- **Spec:** https://tc39.es/ecma262/#sec-date-time-string-format

## Acceptance Criteria

- [ ] Decision recorded: leave as-is, UTC-normalize, or regex-extract
- [ ] If patching, verify against a test entry dated `2026-01-01T00:00` in a non-UTC timezone
- [ ] No regression on existing mid-year entries

## Work Log

### 2026-04-14 - Initial Discovery

**By:** ce-review (compound-engineering:ce-review)

**Actions:**
- Audited the `new Date(fields.date).getFullYear()` pattern
- Identified timezone sensitivity for date-with-time strings
- Confirmed out of CCM-272 scope (not a regression)
- Classified P3 observational

**Learnings:**
- JS `Date` parsing distinguishes date-only (UTC) from date-with-time-without-zone (local).
- `getUTCFullYear()` is the deterministic form when you only want the calendar year.

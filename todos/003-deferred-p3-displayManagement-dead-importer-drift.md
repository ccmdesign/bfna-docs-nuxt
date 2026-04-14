---
status: deferred
priority: p3
issue_id: "003"
tags: [contentful, dead-code, CCM-272, follow-up]
dependencies: []
---

## Resolution (2026-04-14)

**Decision:** Deferred to a follow-up (non-hotfix) PR.

**Rationale:** This is P3 observational, explicitly out of CCM-272 hotfix scope.
`contentful/displayManagement.js` has no importers today, so the drift causes
no runtime impact on this hotfix. Deleting or syncing it is a codebase-hygiene
task that belongs in a dedicated cleanup PR where a fuller audit of "is anyone
planning to revive this?" can happen without bloating the hotfix diff.

**Next step:** File a follow-up issue to delete `contentful/displayManagement.js`
(Option 1) unless the team flags a revival plan.

# Audit or delete unused contentful/displayManagement.js (drifted from CCM-272 fix)

## Problem Statement

`contentful/displayManagement.js` contains its own parallel copies of `handleDocumentaries`, `getSeries`, `getAllFilms`-style logic, and writes to `trailer`, `featuredvideo`, `fourvideos`, `allvideos`, and `latest` content folders. It consumes `main.extractVideoInfo` — so the CCM-272 year/duration fix does flow through it — but its `documentaries.push({...})` shape is **not** updated to emit the top-level `date` field that the new `films.js` / `featuredFilms.js` shapes emit.

Critically, **the file is not imported anywhere in the repo** (confirmed: no `require('./contentful/displayManagement')` or similar). It appears to be dead code from a previous iteration.

Leaving it in the repo creates two risks:
1. If anyone re-wires it, they'll reintroduce the Latest Releases sort-by-createdAt bug because its emitted shape lacks `date` — so `films.js`'s `getDocReleaseTimestamp(doc.date || doc.created || doc.updated)` would fall straight through to `doc.created`.
2. Maintenance drift: it shares structure with `films.js` and `featuredFilms.js` but has to be remembered separately.

## Findings

- **File:** `contentful/displayManagement.js`
- **No callers:** `grep -rn "displayManagement"` returns no matches outside the file itself.
- **Diverged shapes:**
  - `displayManagement.js:181-208` pushes documentaries without `date`
  - `films.js:184-216` (post-PR) pushes documentaries with `date: fields.date || null`
  - `featuredFilms.js:184-212` (post-PR) same
- **Uses `main.extractVideoInfo`** so the year/duration parts of the CCM-272 fix do propagate if this file is ever revived.
- **Out of scope for this hotfix** — caller instructions explicitly said hotfix should be scope-limited.

## Proposed Solutions

### Option 1: Delete the file

**Approach:** `git rm contentful/displayManagement.js` in a follow-up PR after confirming no git history points to recent reactivation.

**Pros:**
- Removes drift risk permanently.
- Reduces codebase surface area.

**Cons:**
- Loses the logic if someone intended to bring it back.

**Effort:** 10 minutes
**Risk:** Low (git history preserves it)

---

### Option 2: Patch the shape to match films.js / featuredFilms.js

**Approach:** Add `date: fields.date || null` to the push shape so if revived, it stays in sync.

**Pros:**
- Keeps the file for future use.
- Small change.

**Cons:**
- Perpetuates maintenance of dead code.

**Effort:** 15 minutes
**Risk:** Low

---

### Option 3: Leave as-is, flag with a top-of-file comment

**Approach:** Add `// DEPRECATED - unused, retained for reference only. Update if revived.` to the top of the file.

**Pros:**
- Zero behavior change, clear signal to future readers.

**Cons:**
- Comments rot.

**Effort:** 2 minutes
**Risk:** None

## Recommended Action

**To be filled during triage.** Suggest Option 1 (delete) unless the team has a known plan to revive this importer. If it's truly dead, deleting is cleaner than perpetual drift patching.

## Technical Details

**Affected files:**
- `contentful/displayManagement.js` (candidate for deletion)

**Related components:**
- `contentful/films.js` (replacement)
- `contentful/featuredFilms.js` (replacement)
- `contentImporter.js` (only imports films/featuredFilms/series)

## Resources

- **PR:** https://github.com/ccmdesign/bfna-docs-nuxt/pull/9
- **Issue:** CCM-272 (surfaced this observationally, not caused by it)

## Acceptance Criteria

- [ ] Confirm no import path reaches `contentful/displayManagement.js`
- [ ] Decision documented: delete, sync, or annotate
- [ ] If deleted, verify `npm run generate` still produces all expected content folders

## Work Log

### 2026-04-14 - Initial Discovery

**By:** ce-review (compound-engineering:ce-review)

**Actions:**
- Traced `extractVideoInfo` consumers across `contentful/`
- Found `displayManagement.js` uses it but has no importers
- Noted its emit shape is now out-of-sync with the CCM-272 fix
- Classified as P3 observational; explicitly out of hotfix scope per caller instructions

**Learnings:**
- Dead-code drift silently invalidates hotfixes if the dead code is ever revived.

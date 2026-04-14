---
status: ready
priority: p2
issue_id: "002"
tags: [schema, nuxt-content, docs, CCM-272]
dependencies: []
---

# Document video_info.year/duration type change for local dev cache

## Problem Statement

`content.config.ts` changes `video_info.year` and `video_info.duration` from `z.string().optional()` to `z.number().optional()` on the `latest` and `allvideos` collections (and adds them as numbers to `featuredvideo` / `featuredvideos`).

This is the correct end-state — the importer now writes numbers — but it creates a one-time contributor footgun: any developer pulling this branch who has an existing `.data/content.db` or `content/` folder from before the change will have string values persisted in the SQLite cache, and the new schema will reject them at query time.

Netlify cold builds are safe (fresh checkout, no pre-existing cache). The PR body even mentions the `configHash` rebuild. But nothing in the repo or PR description tells a local contributor that they need to nuke their cache, and the error they'll hit (`ZodError: Expected number, received string` on `video_info.year`) is not self-explanatory.

## Findings

- **File:** `content.config.ts:60-61, 103-104, 192-196, 239-243`
- **Schema delta:**
  - `video_info.year: z.string().optional()` -> `z.number().optional()` in `latest`, `allvideos`
  - Same for `video_info.duration`
  - Added as `z.number().optional()` to `featuredvideo`, `featuredvideos`
- **Mitigation already in place:** Touching `content.config.ts` triggers a Nuxt Content `configHash` rebuild; PR body confirms this. Good on cold builds.
- **Residual risk:** A local contributor with `.data/content.db`, `.nuxt/`, `.output/`, or `content/` from an earlier branch will hit a confusing validation error on `npm run dev` or `npm run generate` until they clean.
- **Not a functional bug.** Just a developer-experience papercut that should be documented.

## Proposed Solutions

### Option 1: Add a one-line note to README / AGENTS.md / contributing docs

**Approach:** Document that pulling this branch requires:
```sh
rm -rf content/ .nuxt/ .output/ .data/ .content.cache.json
npm run generate
```

**Pros:**
- Zero code risk.
- Matches what the PR body already instructs for verification.

**Cons:**
- Requires the contributor to actually read docs.

**Effort:** 10 minutes
**Risk:** None

---

### Option 2: Add a post-install / prebuild hook that invalidates the cache when the schema hash changes

**Approach:** A small Node script checks `content.config.ts` hash against a cached value and deletes `.data/content.db` if it differs.

**Pros:**
- Foolproof.

**Cons:**
- Out of scope for a hotfix follow-up. Overengineering.

**Effort:** 1-2 hours
**Risk:** Medium (could accidentally nuke cache on every build)

---

### Option 3: Do nothing

**Pros:** Zero diff.
**Cons:** Each contributor rediscovers the problem individually.

## Recommended Action

**To be filled during triage.** Recommend Option 1 (documentation only). Add a short note under an existing "Troubleshooting" or "Local development" heading in `README.md` or `AGENTS.md`.

## Technical Details

**Affected files:**
- `content.config.ts` (the schema change itself — not reverted)
- Documentation surface: `README.md` or `AGENTS.md` (wherever local-dev notes live)

## Resources

- **PR:** https://github.com/ccmdesign/bfna-docs-nuxt/pull/9
- **Issue:** CCM-272
- **Nuxt Content schema validation:** runs at query time against the SQLite-cached JSON

## Acceptance Criteria

- [ ] Contributor-facing docs mention the cache-clear command for anyone pulling CCM-272 or newer
- [ ] The note references the specific error string (`Expected number, received string`) so searchers find it
- [ ] No code changes beyond docs

## Work Log

### 2026-04-14 - Initial Discovery

**By:** ce-review (compound-engineering:ce-review)

**Actions:**
- Reviewed schema type changes in `content.config.ts`
- Confirmed new importer writes numbers (via restructured `extractVideoInfo`)
- Identified stale-cache risk for local contributors on incremental builds
- Classified as P2 developer-experience, not a ship blocker

**Learnings:**
- Schema type migrations in Nuxt Content are cache-invalidating on cold builds (configHash) but not on pre-existing local `.data/` or `content/`.

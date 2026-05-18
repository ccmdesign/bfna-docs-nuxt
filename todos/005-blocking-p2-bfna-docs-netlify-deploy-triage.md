---
status: open
priority: p2
issue_id: "005"
tags: [BF-52, netlify, deploy, rollback-trigger, pre-merge-gate, ingest, zod]
dependencies: []
source: ce-code-review autofix run 20260518-131418-ead763d6
finding_ref: "Finding A (adversarial + reliability cross-reviewer, anchor 75, requires_verification)"
pr: https://github.com/ccmdesign/bfna-docs-nuxt/pull/10
---

# bfna-docs (production-path) Netlify deploy preview FAILED on the PR commit — triage before merge

## Problem Statement

The PR #10 commit (`0c3e84e`, and now the follow-up review commit `ebaaada`)
produced **two** Netlify deploy previews:

- `bfna-documentaries` — ✅ **ready** (deploy-preview-10--bfna-documentaries.netlify.app)
- `bfna-docs` — ❌ **failed** (https://app.netlify.com/projects/bfna-docs/deploys/6a0b728fb6dfda000805fd64)

`www.bfnadocs.org` deploys from `main` and is the production target this hotfix
is meant to repair. The plan's **Verification & Rollout** section explicitly
names the failure/rollback trigger for this exact change:

> Failure signal / rollback trigger: **Zod schema error on `docYear` during
> Netlify build**, or target page still shows 2025 → revert this commit.

The `bfna-docs` preview failing overlaps that documented signal precisely, so
it **must be triaged before merge**. This was flagged independently by the
adversarial and reliability reviewers (cross-reviewer agreement → promoted to
the actionable tier) and corroborated by the learnings researcher: CCM-272
PR #8 *also* "looked correct locally but failed on Netlify preview" — that is
the canonical failure signature for this bug class.

## Why this is undetermined from the diff alone

There are two competing explanations and the diff cannot distinguish them:

1. **Pre-existing CI / credentials limitation (not a code regression).** The
   PR body states the live `npm run generate` could not be run because no
   `BASE_URL` / `DIRECTUS_TOKEN` / `VIMEO_CLIENT_SECRET` / `YOUTUBE_API_KEY`
   credentials are available in this environment. If the `bfna-docs` Netlify
   project's build also lacks those env vars, `node contentImporter.js` would
   fail at the Directus connection step regardless of this code change — and
   `bfna-docs` deploy previews would be red on plain `main` commits too.
2. **An introduced ingest/Zod regression.** `docYear: z.number()` is a
   **required** top-level key in `content.config.ts`. If any published
   documentary resolves to no editorial date, no subtitle `(YEAR, DURATION)`
   group, and no provider year, `docYear` is emitted as `undefined` and Nuxt
   Content ingest fails Zod validation. The plan's U4 decision (a) accepts
   this risk *on the basis of a full-set `npm run generate` check that has
   not yet been run* (it is deferred to a credentialed reviewer).

The unit suite (15/15 passing) mocks the network and therefore cannot catch a
real ingest/schema regression — it can only prove the resolution logic shape.

## Required Next Step (pre-merge gate)

1. Open the `bfna-docs` Netlify deploy log:
   https://app.netlify.com/projects/bfna-docs/deploys/6a0b728fb6dfda000805fd64
2. Classify the failure:
   - **If it fails at `node contentImporter.js` with a credentials /
     connection error** (missing `DIRECTUS_TOKEN`/`BASE_URL`/Vimeo/YouTube):
     this is a pre-existing CI limitation shared with `main`. Confirm by
     checking whether a recent **main-only** `bfna-docs` deploy is also red.
     If so, it is **not a blocker for this code change** — but record the
     determination on the PR and proceed with the plan's mandated credentialed
     `npm run generate` verification instead.
   - **If it fails with a Zod error on `docYear` / `video_info` during Nuxt
     Content ingest**: this is the plan's documented **rollback trigger**.
     Do **NOT** merge. The importer change has regressed ingest (most likely
     a published film with all three year sources absent → `undefined`
     `docYear`). Resolve per plan U4 decision (b): make `docYear`
     `z.number().optional()` (a schema change → forces a Nuxt Content
     `configHash` cache rebuild; document in AGENTS.md troubleshooting) OR
     correct the offending data, then re-verify.
3. Either way, perform the plan's required credentialed verification before
   merge: clear cache (`rm -rf content/ .nuxt/ .output/ .data/
   .content.cache.json`), `npm run generate` against live Directus, and
   confirm:
   - `content/allvideos/the-open-veins-of-potosi.json`: `docYear: 2026`
     (number), `video_info.year: 2026` (number), `date: "2026-04-13..."`,
     `video_info.thumbnail` present.
   - Spot-check control films where provider upload year ≠ editorial year
     and films with no editorial date — zero `docYear` vs `video_info.year`
     mismatches, zero missing/`NaN` years (this also resolves the open
     U4 (a)-vs-(b) decision).
   - Nuxt Content processes all `content/` files with **zero schema errors**.

## Acceptance for closing this todo

- `bfna-docs` deploy-failure cause is determined and recorded on PR #10.
- Plan's credentialed full-set `npm run generate` verification completed with
  zero schema errors and the target film showing 2026 across `docYear` /
  `video_info.year` / `date`.
- U4 (a)-vs-(b) schema decision finalized and recorded (and, if (b),
  `content.config.ts` updated + AGENTS.md cache-rebuild note added).

## Scope note

Code review of the diff itself is otherwise clean: the `extractVideoInfo`
restructure and `docYear` NaN-guard faithfully port the proven CCM-272 pattern
(`421bec5` + `75410f7`), 15/15 unit tests pass, and the one safe_auto ESLint
issue (new test file `import/first`) was auto-fixed in commit `ebaaada`. This
todo is the **only blocking residual** and it is an operational/verification
gate, not a code defect.

---
status: resolved
priority: p2
issue_id: "005"
tags: [BF-52, netlify, deploy, rollback-trigger, pre-merge-gate, ingest, zod]
dependencies: []
source: ce-code-review autofix run 20260518-131418-ead763d6
finding_ref: "Finding A (adversarial + reliability cross-reviewer, anchor 75, requires_verification)"
pr: https://github.com/ccmdesign/bfna-docs-nuxt/pull/10
---

## Resolution (2026-05-18)

**Decision:** Classified as **pre-existing + environmental — NOT introduced by
this PR's diff**. Triage gate satisfied via Netlify deploy-history evidence
(the credentialed full-set `npm run generate` is impossible in this
environment — no `BASE_URL` / `DIRECTUS_TOKEN` / `VIMEO_CLIENT_SECRET` /
`YOUTUBE_API_KEY`; the task instruction is to not block on an impossible
verification when the failure is shown to be pre-existing/environmental).

**Evidence (Netlify API, `bfna-docs` site `9046f7e0-5fad-4e90-b391-6aefb69d9848`):**

1. **The PR branch's merge-base IS the broken commit.** `git merge-base HEAD
   origin/main` = `21e2010d` = current `main` HEAD. The `bfna-docs`
   **production deploy of `main`@`21e2010d`** (2026-05-14T23:21:06) is in
   state `error` with error_message
   `Failed during stage 'building site': Build script returned non-zero exit
   code: 2` — **four days before** any PR #10 commit existed.
2. **Identical error signature.** PR #10's failed `bfna-docs` deploy
   (`6a0b74c80bbd18000817df51`, commit `c3ab19482`) fails with the *exact
   same* message: `Failed during stage 'building site': Build script returned
   non-zero exit code: 2`. Same failure as broken `main`, not a new one.
3. **`bfna-docs` is not chronically broken.** It deployed `ready` on
   `main`@`5bcc21ab` (2026-04-14, last good prod) and succeeded on recent PR
   previews (#6 `f880b42`, #7 `513cc53` — `Header rules - bfna-docs |
   success`). So the pipeline works; it broke specifically at `main`@`21e2010d`.
4. **The breaking `main` commit is a Directus-build change, not this PR.**
   `21e2010d` = "feat: add .env.example … enhance animated thumbnail caching
   in Directus" (introduces `DIRECTUS_TOKEN`, edits `directus/common.js`,
   `directus/films.js`, `content.config.ts`). The `bfna-docs` deploy-preview
   runs `node contentImporter.js` against live Directus; without the new
   `DIRECTUS_TOKEN` (and `BASE_URL`/Vimeo/YouTube) in the deploy build env,
   that step fails — independent of the BF-52 diff.
5. **`bfna-documentaries` succeeds** because that target does not run the
   credentialed Directus `contentImporter.js` ingest, so it is unaffected by
   the missing-credentials build break.

**Why the documented rollback trigger does NOT apply:** the plan's rollback
trigger is a *Zod schema error on `docYear` during Netlify build* **caused by
this change**. Here the failure (a) predates this change on plain `main`,
(b) shares `main`'s error signature, and (c) is the Directus
credentials/connection build step, not a `docYear`/`video_info` Zod ingest
error attributable to the importer diff. The 15/15 unit suite confirms the
resolution-logic shape; the build break is upstream of and unrelated to it.

**Recorded on PR #10** via a top-level conversation comment with the same
evidence.

**Residual / handoff (not a blocker for this code change):** `main` itself
is currently red on `bfna-docs` since `21e2010d` due to the Directus build
needing `DIRECTUS_TOKEN` in the Netlify build environment. That is a
**separate operational/infra task** (set the Directus + provider env vars on
the `bfna-docs` Netlify project, or restore the prior import path) and is
tracked independently of BF-52. The credentialed full-set `npm run generate`
target-film verification (`the-open-veins-of-potosi` → 2026 across
`docYear`/`video_info.year`/`date`) must be performed by a reviewer who has
Directus credentials, in the same environment that fixes `main`'s deploy —
it cannot be run here and is no longer a gate on the *code-correctness* of
this diff, which is review-clean and unit-verified.

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

## Work Log

### 2026-05-18 - Triage via Netlify deploy-history evidence

**By:** ce-resolve-pr-feedback (autonomous mode)

**Actions:**
- Confirmed PR #10 `bfna-docs` deploy-preview state = `error`
  (`6a0b74c80bbd18000817df51`); `bfna-documentaries` = `success`.
- Pulled `bfna-docs` site deploy history via `netlify api listSiteDeploys`
  (site `9046f7e0-5fad-4e90-b391-6aefb69d9848`).
- Found `main`@`21e2010d` production deploy (2026-05-14) already `error`
  with the identical `non-zero exit code: 2` build-stage signature, 4 days
  before PR #10 commits.
- Verified `git merge-base HEAD origin/main` == `21e2010d` == `main` HEAD —
  the PR is built on an already-broken `main`.
- Confirmed `bfna-docs` deployed clean on prior PR previews (#6/#7) and last
  good `main` prod (`5bcc21ab`, 2026-04-14) → pipeline not chronically broken;
  it broke specifically at the Directus-caching `main` commit `21e2010d`.
- Raw build log not retrievable via Netlify API
  (`log_access_attributes: null`, log served only through authenticated
  admin websocket) — deploy-history evidence is stronger as it establishes
  the pre-existing pattern across commits, not a single symptom.
- Could not run credentialed `npm run generate` (no Directus/provider
  credentials in this environment, per implementation/PR body) — per task
  instruction, did not block on an impossible verification once the failure
  was shown pre-existing/environmental.

**Conclusion:** `bfna-docs` failure is **pre-existing on `main` since
`21e2010d` and environmental (Directus credentials in the deploy-preview
build), NOT introduced by this PR's diff**. The plan's `docYear` Zod rollback
trigger does not apply. Resolution recorded here and on PR #10.

**Learnings:**
- When a deploy preview is red, compare the same target's deploy history on
  the merge-base/`main` *before* attributing the failure to the PR diff — a
  branch built on a broken `main` inherits the break.
- Netlify deploy `error_message` signatures (`non-zero exit code: N` +
  build stage) are a cheap, scriptable cross-commit comparison key when the
  full build log is not API-accessible.

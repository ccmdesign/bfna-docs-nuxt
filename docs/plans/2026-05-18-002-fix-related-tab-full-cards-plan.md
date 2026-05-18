---
title: "fix: Related tab renders bare images instead of full film cards (BF-54)"
type: fix
status: active
date: 2026-05-18
ticket: BF-54
branch: feature/BF-54-related-tab-full-cards
---

# fix: Related tab renders bare images instead of full film cards (BF-54)

## Summary

On a film detail page (`pages/[slug].vue`), the **Related** tab renders only bare thumbnail images — three poster-less, title-less, metadata-less image tiles — instead of full film cards matching the homepage grid. Client-confirmed (Samuel George, BFNA).

The root cause is a component-usage opt-out, not a data or CMS-migration problem. The Related slot passes `:thumbnail="true"` to the shared `docs-card` component. That prop switches `docs-card` into its background-image-only render branch and gates out the title/metadata content slot. The homepage renders the *same* component without `:thumbnail`, producing the full card (poster + title + subtitle + series + duration + year). The fix is to make the Related slot render `docs-card` the same way the homepage does: drop the forced `thumbnail` mode.

This reproduces on **both** production (Directus build, `www.bfnadocs.org`) and the April preview (Contentful build) → it is a stable usage bug, **not** a migration regression. It is distinct from BF-52 (film year), though both surface on the same film page; BF-52 is already fixed on `main`.

---

## Problem Frame

### Observed behavior

- Open any film with related documentaries (e.g., a film whose `relatedDocumentaries` resolves ≥1 match), select the **Related** tab.
- The tab shows N bare image tiles (the reported case: 3 images), each with no poster framing, no title, no subtitle, no series chip, no duration/year metadata.
- Clicking a tile still navigates to the related film (existing behavior, must be preserved).

### Root cause (evidence-backed)

`pages/[slug].vue` `#related` slot (lines ~41–53) overrides `docs-grid`'s default slot with explicit `docs-card` markup and forces `:thumbnail="true"`:

```
<template #related>
  <docs-grid>
    <docs-card v-for="item in relatedItems"
      :video="item"
      :thumbnail="true"   <!-- the bug -->
      :key="item.videoId"
      :cardId="item.videoId"
      :hoveredCard="hoveredCardId"
      @setHoveredCard="..." @clearHoveredCard="..." />
  </docs-grid>
</template>
```

In `components/docsCard.vue`:

- The poster image renders only under `v-if="poster"` (line ~147). The full-card image renders under `v-else` as a CSS `background-image` div (`card__video--bg`, line ~151) using `backgroundStyle`.
- The title/subtitle/series/metadata block is wrapped in `<slot name="content" v-if="!thumbnail && !poster">` (line ~169). When `thumbnail` is true, **this entire block is removed from render** — no title, no metadata.
- `backgroundStyle` (line ~70–78) returns a `background-image` URL; with `thumbnail` true it uses `vi?.thumbnail ?? vi?.thumb`. The result is a lone 16:9 image tile with nothing else — exactly the reported "3 bare images."

By contrast, the **homepage** (`pages/index.vue:48`) uses `<docs-grid id="grid" :videos="videos" />` — it does **not** override the slot. `docs-grid`'s *default slot* (`components/docsGrid.vue:3–12`) renders `<docs-card v-for="video in videos" :video :cardId :hoveredCard @setHoveredCard @clearHoveredCard />` **without** `:thumbnail`. So `thumbnail` defaults to `false`, the `v-else` branch still renders a `background-image` tile **and** the content slot renders, producing the full card (image + title + subtitle + series + duration + year). The Related usage only differs by the forced `:thumbnail="true"`.

### Data is sufficient — no data work needed

`relatedItems` (`pages/[slug].vue:108–120`) filters the same `videoList` the homepage consumes:

```
videoList.value.filter((item) => relatedIds.includes(Number(item?.videoId)))
```

Matched items are full `Video` objects (see `stores/video.ts` `Video` interface) carrying `title`, `slug`, `subtitle`, `series`, `videoId`, `video_info` (thumb/thumbnail/duration), and `docYear`. These are the identical objects the homepage renders as full cards. Therefore removing `:thumbnail="true"` is sufficient for a fully-populated card — no additional data plumbing is required. (`docs-card` reads `video.docYear` for the year metadata, line ~184 — the field BF-52 corrected on `main`; that fix is already present and is out of scope here.)

### Why this is not the homepage's `:videos` pattern

The homepage passes a `:videos` array prop into `docs-grid`'s default slot. The Related tab keeps an **explicit slot override** because it needs page-local wiring the default slot does not provide here: it iterates a page-derived computed (`relatedItems`) and threads the page's `hoveredCardId` ref plus `handleSetHoveredCard` / `handleClearHoveredCard` handlers (the same hover-state pattern already used by the `#extras` slot on the same page). The minimal, lowest-risk fix preserves the slot-override structure and only removes the `thumbnail` opt-out so the card variant matches the homepage. Converting Related to the `:videos` prop is a larger refactor with no functional benefit and is explicitly out of scope (see Scope Boundaries).

---

## Scope Boundaries

### In scope

- Make the `#related` slot in `pages/[slug].vue` render full `docs-card`s (poster/image + title + metadata), visually consistent with the homepage grid.
- Preserve existing click-to-navigate behavior and hover-state wiring.
- Visual verification on a deploy preview, then on production.

### Out of scope / non-goals

- Film year correctness (BF-52) — already fixed on `main`, unrelated code path.
- CMS migration concerns — bug reproduces on both Contentful and Directus builds; nothing to migrate.
- Refactoring the Related tab to use `docs-grid`'s `:videos` prop instead of the slot override — no functional benefit, larger blast radius.
- Restyling `docs-card` itself or the grid system.

### Deferred to Follow-Up Work

- **`docsCard.vue` line ~74 bitwise `&` bug.** `backgroundImage: \`url('${props.thumbnail & imageUrl ? imageUrl : props.video.backgroundImage}')\`` uses bitwise `&` where logical `&&` is intended. After this fix, the Related card no longer enters the `thumbnail` branch, so this bug **does not interfere** with the Related fix and must not be fixed opportunistically here (keeps the diff to a single intentional change and the visual review clean). It is still a latent bug affecting the remaining `:thumbnail="true"` usage on the same page — the `#extras` trailer card (`pages/[slug].vue:22–31`). Track separately.

---

## Implementation Units

### U1. Render full film cards in the Related slot

**Goal:** The Related tab shows full film cards (image + title + subtitle + series chip + duration + year) visually consistent with the homepage grid, with click-navigation and hover state preserved.

**Requirements:** All three BF-54 acceptance criteria — full cards visually consistent with homepage; card click navigates to the related film; verifiable on preview then production.

**Dependencies:** None.

**Files:**
- `pages/[slug].vue` — `#related` slot template (lines ~41–53).

**Approach:**
- Remove the `:thumbnail="true"` binding from the `docs-card` in the `#related` slot (equivalently, do not pass `thumbnail`, letting it default to `false` per `components/docsCard.vue` prop default). Do not add `poster` — the homepage grid card is the non-poster, non-thumbnail variant (background-image tile + content slot), and the acceptance criterion is parity with the **homepage grid**, not the featured reel (which uses `poster`).
- Keep all other bindings exactly as-is: `:video="item"`, `:key="item.videoId"`, `:cardId="item.videoId"`, `:hoveredCard="hoveredCardId"`, and both hover event handlers. These match the homepage default-slot `docs-card` bindings (`components/docsGrid.vue:4–11`) one-to-one, so removing only `thumbnail` brings the Related card to full homepage parity.
- Leave the surrounding `<docs-grid>` wrapper unchanged — it provides the same subgrid layout the homepage uses, so spacing/columns will match once the card variant matches.

**Patterns to follow:**
- The homepage default-slot card: `components/docsGrid.vue:3–12` (the reference rendering — `docs-card` with no `thumbnail`).
- The sibling `#extras`/`#study` slots in `pages/[slug].vue` already wrap `docs-grid` and thread the same hover handlers — keep the Related slot structurally consistent with them, only differing by the (now removed) `thumbnail` prop.

**Test scenarios:**
- `Test expectation: none (automated)` — this is a single declarative template prop removal with no behavioral logic, no composable, and no new branching. The repo has no component/DOM test harness (`tests/` contains only Directus mapping unit tests; `package.json` `test` = `vitest run` over those). Adding a Vue component test harness solely for a one-attribute change is disproportionate and out of scope. Correctness is established by the manual verification matrix in U2 below. If a future change adds a component test harness, the regression to capture is: "a `docs-card` rendered without `thumbnail`/`poster` renders the `.card__title` and `.card__meta` nodes."

**Verification:** With the change applied, the rendered Related tab `docs-card`s include the title (`.card__title`), subtitle/series, and the duration/year `.card__meta` block — i.e., the `<slot name="content" v-if="!thumbnail && !poster">` now renders. Confirmed visually in U2.

---

### U2. Visual + behavioral verification (preview, then production)

**Goal:** Confirm the acceptance criteria hold on a real deploy, not just locally.

**Requirements:** BF-54 acceptance criteria 1–3.

**Dependencies:** U1.

**Files:** None (verification only).

**Approach:**
- Local smoke: `npm run dev` (runs `contentImporter.js` then Nuxt), open a film page with ≥1 related documentary, open the **Related** tab. Confirm: each related item renders as a full card with image, title, subtitle/series, and duration + year metadata, matching the homepage grid card spacing and column behavior (the shared `docs-grid` subgrid + `docs-card` `grid-column: span 3` rules should make this automatic).
- Side-by-side parity check: compare a Related card against the same film's homepage grid card — image aspect, title typography, metadata row, hover scale/glow should match (same component, same CSS, no `[thumbnail="true"]` hover rules now applying).
- Behavioral check: click a Related card → navigates to that film's detail page (the existing `moreInfo` / `videoDetailLink` path in `docs-card`, unchanged by U1). Hover state still highlights the correct card (the `cardId` / `hoveredCard` wiring is untouched).
- Responsive check: verify the Related grid at mobile (<321px), tablet (321–768px), and desktop (≥769px) — the `docs-card` media queries (`components/docsCard.vue:248–261`) drive columns; should match homepage at each breakpoint.
- Then verify on a deploy preview, and finally on `www.bfnadocs.org` after merge to `main`.

**Test scenarios:**
- `Test expectation: none -- manual verification unit, no code change.` The checks above ARE the verification; enumerated so the implementer does not have to invent coverage:
  - Related tab on a film with related docs → N full cards, each with image + title + metadata (not bare images).
  - A Related card vs. the same film on the homepage grid → visually equivalent (variant, spacing, hover).
  - Click a Related card → routes to that film's detail page.
  - Resize across the three breakpoints → Related grid columns match the homepage grid.
  - Spot-check a film whose `relatedDocumentaries` is empty but `tags` produce matches (the fallback branch in `relatedItems`) → still renders full cards (same code path, just a different source list).

**Verification:** All five scenarios pass on a deploy preview; then the first three re-confirmed on `www.bfnadocs.org` post-merge. Bug owner / client (Samuel George, BFNA) sign-off as applicable.

---

## System-Wide Impact

- **Single-file logic change.** Only `pages/[slug].vue`'s `#related` slot changes. `components/docsCard.vue` and `components/docsGrid.vue` are unchanged.
- **No data, store, or build-config impact.** `relatedItems` and `videoList` are untouched; the Directus/Contentful importers are untouched.
- **Other `:thumbnail="true"` usages are unaffected.** The `#extras` trailer card on the same page (`pages/[slug].vue:22–31`) still intentionally uses `thumbnail` — out of scope and unchanged. The latent bitwise-`&` bug at `docsCard.vue:74` continues to affect only that thumbnail path and is tracked separately (see Deferred to Follow-Up Work).
- **Risk: very low.** Removing one prop binding reverts the Related card to the same well-exercised render path the homepage uses on every page load. Worst realistic case is a spacing nuance, caught by U2's side-by-side and responsive checks.

---

## Open Questions / Decisions Left to the Implementer

- **Confirm a reliable repro film.** Pick a film whose `relatedDocumentaries` resolves to ≥1 entry in the current content set (production reportedly shows 3). If none is obvious, use the `tags`-fallback branch of `relatedItems` to surface a film with related matches for verification.
- **Preview deploy mechanics.** This worktree's branch is `feature/BF-54-related-tab-full-cards`; the implementer/owner should confirm how the BFNA deploy preview is produced for this branch (Netlify PR preview vs. a dedicated env) before the U2 preview sign-off. Branch targeting itself is already resolved (`main` is correct) and is not an open question.

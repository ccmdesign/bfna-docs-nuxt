# BF-122 — Fix CLS 0.246 mobile / 0.158 desktop

Root cause was already diagnosed in the ticket. This plan records what the code
actually looks like today and the smallest diff that fixes it.

## Cause 1 — hero CSS cascade inversion (0.1262 mobile / 0.1482 desktop)

`.hero-headings--index` positioning lives in `pages/index.vue:296`, inside the page's
scoped `<style>`. Page CSS ships in the route chunk (`/_nuxt/index.*.css`) which Nuxt
does **not** reference from the SSR head — only *component* CSS (docsHeroHeadings,
docsGrid, docsMeta) gets a render-blocking `<link>`. So at first paint only the base
`.hero-headings` rule exists and the hero paints in the wrong grid cell; the route
chunk arrives during hydration and the hero snaps.

**Fix:** move the whole `.hero-headings--index { … }` block verbatim from
`pages/index.vue` into `components/docsHeroHeadings.vue`'s scoped style, placed
immediately **after** the base `.hero-headings` rule. Same specificity (0-2-0), later
source order → wins. The child component root carries both scope ids
(`data-v-ddd0ebf2` own + `data-v-a5d80723` from index.vue), so
`.hero-headings--index[data-v-ddd0ebf2]` still matches.

Note on ordering inside the component: the base rule nests
`@media (max-width:768px){ padding-block-end: var(--space-m) }`, and `--index` sets
an unmediated `padding-bottom: var(--space-l)`. Placed after, `--index` wins at both
breakpoints — which is exactly today's *post-hydration* behaviour, so nothing changes
visually once hydrated.

Not doing: specificity bumps (the rule is absent at first paint, no specificity can
win) or Nuxt `inlineStyles` config (bigger blast radius).

## Cause 2 — icon font swap (0.1082 mobile)

Verified which family actually shifts. The hero contains three `docs-button`s
(`play_arrow`, `play_arrow`, `arrow_forward`). `components/docsButton.vue:55-63`
renders the icon as `::before { content: attr(icon); font-family: var(--font-family-icon) }`
and `--font-family-icon` is **`"Material Icons"`** (`public/css/base/fonts.css:9`),
whose `@font-face` points at exactly the URL named in the ticket
(`fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2`).

So the shifting glyphs are the **legacy Material Icons family**, not
`material-symbols-outlined`. Before the font loads, `content: attr(icon)` lays out the
literal string `play_arrow` in the body font — very wide — which is why `#hero` moves
106px left and grows 121→128px when the font swaps.

**Fix (three small parts):**
1. `public/css/base/fonts.css` — `font-display: block` on the legacy `@font-face` so
   the literal ligature text is never painted during the block period.
2. `public/css/base/fonts.css` — give `.material-icons` / `.material-symbols-outlined`
   a fixed `1em × 1em` box with `overflow: hidden`, so glyph metrics can never move
   neighbours.
3. `components/docsButton.vue` — same fixed `1em` box on the `::before`/`::after`
   pseudo-icons (they are flex items of the `inline-flex` button, so they need the
   box themselves; the `.material-icons` class is not on them).
4. `nuxt.config.ts:58` — append `&display=block` to the Material Symbols stylesheet URL.

## Cause 3 — card video boxes (0.0107 mobile) — SKIP

Already reserved. `.card__video` has `width: 100%; aspect-ratio: 16/9` in all three
places that also carry `card__video--bg` (`docsCard.vue:248`, `docsCardMobile.vue:273`,
`docsRelatedItemsCard.vue:113`). BF-121 left this correct. The residual 0×0 box in the
trace is the same *route-chunk-CSS-arrives-late* class of problem as Cause 1, not a
missing dimension; at 0.0107 it is under the noise floor of the < 0.1 target and not
worth a second structural change this cycle. Documented, not fixed.

## Files touched

- `components/docsHeroHeadings.vue`
- `pages/index.vue`
- `components/docsButton.vue`
- `public/css/base/fonts.css`
- `nuxt.config.ts`

## Verification

- `npx eslint . --ext .ts,.js,.vue` + `npm run build`.
- Netlify deploy preview: cold-cache mobile (375 / Slow 4G / 4x CPU) ×3 and desktop
  (1350 / Fast 4G) ×2, CLS via `PerformanceObserver`, enumerate every `layout-shift`
  entry and confirm the 0.1262 / 0.1482 hero shift is gone entirely.
- Confirm hero paints top-right on first paint of a throttled load.
- FCP/LCP no worse than baseline (mobile FCP ~2.33s, LCP ~6.13s).
- Visual: index + film detail page, light and dark, 1350px and 375px.

## Risks

- Moving grid rules between files is visual-risk → checkpoint commit first.
- The fixed 1em icon box changes the pseudo-element from `line-height: 0` to a real
  box; button vertical alignment must be eyeballed on both pages.
- `overflow: hidden` on icon spans could clip an oversized glyph — check the
  featured-reel chevrons (`font-size: 3rem`) and the topbar search icon.

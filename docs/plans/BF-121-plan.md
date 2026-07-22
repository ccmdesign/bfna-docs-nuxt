# BF-121 — Lazy-load grid card images + srcset

## Problem
`components/docsCard.vue` paints card media as a CSS `background-image`. CSS backgrounds
cannot lazy-load, so all ~40 grid cards download a `width=600` webp on first paint
(~3.5 MB of images, ~45 `/cms/` requests). Rendered card width is ~309 px, so 600 is ~2x
too big, and the featured-reel `<img class="card__poster">` has no `srcset`/`sizes`.

## Approach (shortest working diff)
1. **Grid/thumbnail variant → real `<img>`.** Keep the existing `.card__video--bg`
   wrapper `<div>` (it owns `aspect-ratio: 16/9`, `overflow: hidden`, `border-radius`,
   `position: relative`, the hover scale/glow class, and the click handler). Drop
   `:style="backgroundStyle"` and render an `<img loading="lazy" decoding="async">`
   inside it, `object-fit: cover; width/height: 100%`. The animated-GIF `<Transition>`
   overlay stays a sibling and keeps `z-index: 2`, so stacking is unchanged.
2. **srcset without touching `directus/imageUrl.js`.** The content JSON already stores
   fully-built URLs (`/cms/<id>?width=600&format=webp&quality=80`) and the Directus
   transform endpoint accepts any width. A tiny local helper rewrites the `width=` param
   to build `srcset`; if the URL has no `width=` (untransformed original, SVG, PDF,
   external resource URL) it returns `undefined` and the plain `src` is used. Zero
   changes to the gating logic, zero changes to `getImage.test.mjs`.
   - grid card: `320w, 600w`, `sizes="(max-width: 320px) 100vw, (max-width: 768px) 50vw, 25vw"`
   - poster: `200w, 400w`, `sizes="(max-width: 320px) 100vw, (max-width: 768px) 40vw, 20vw"`
3. **Space reservation.** `aspect-ratio` is already on `.card__video` (16/9) and
   `.card__poster` (1/1.42); add matching intrinsic `width`/`height` attributes on both
   `<img>`s so the box is reserved even before CSS lands.
4. **Above-the-fold stays eager.** New `eager` boolean prop on `docsCard`; `pages/index.vue`
   passes it for the first 4 featured-reel posters. Everything else keeps `loading="lazy"`.

## Files to touch
- `components/docsCard.vue` — media markup, srcset helper, `eager` prop, `.card__video-img` CSS
- `pages/index.vue` — `:eager="index < 4"` on the featured reel
- `docs/plans/BF-121-plan.md` — this file

## Test strategy
- `npx eslint . --ext .ts,.js,.vue` + `npm run build`
- `node --test directus/getImage.test.mjs` (must stay green; no changes expected)
- Browser: desktop 1350 / mobile 375, light + dark — homepage grid, featured reel,
  `[slug]` related items + extras tab (thumbnail variant) + `docsList` thumbnails
- Network: count `/cms/` requests on a cold homepage load (expect ~10–12 vs ~45)

## Risks
- `docsCard` has 5 call sites (grid, featured reel, film-detail poster, extras/trailer
  thumbnail, `docsList` thumbnail) — all four visual variants must be checked.
- `overflow: hidden` on the wrapper must keep clipping the new `<img>` to the radius.
- The hover `border: 1px` on `[thumbnail="true"]:hover .card__video` could nudge the
  inner image; verify the thumbnail hover in `docsList`.

## Out of scope (guardrails)
- `directus/imageUrl.js` transform gating — untouched.
- `components/docsCardMobile.vue` (dead) — untouched.
- The `props.thumbnail & imageUrl` bitwise-AND dead branch — preserved verbatim.
- Animated-GIF hover behaviour — untouched.

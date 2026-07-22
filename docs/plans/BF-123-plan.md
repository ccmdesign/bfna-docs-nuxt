# BF-123 — Payload diet: catalog serialization + route payload prefetching

Branch: `feature/BF-123-payload-diet` off `dev` (`e734510`).

## 1. Baseline (measured 2026-07-22 against https://dev--bfna-documentaries.netlify.app)

Fresh full load each time, viewport set *then* page reloaded. Sizes are `decodedBodySize`
from Resource Timing plus `new Blob([#__NUXT_DATA__.textContent]).size` for the inline payload.

| Metric | Desktop 1350×900 | Mobile 375×812 |
|---|---|---|
| Inline `__NUXT_DATA__` | 184,316 B | 184,316 B |
| `/_payload.json` requests on load | 2 (preload `as=fetch` + `fetch`) | 1–2 |
| `/_payload.json` decoded | 393,414 B (2×196,707) | 196,707 B |
| **Combined hydration data** | **577,730 B** | **381,023 B** |
| Total page decoded (post-scroll) | 2,187,192 B | 1,990,485 B |
| Grid cards rendered | 38 | 38 |

Film detail page (`/american-lithium`, cold load): inline 184,332 B + `/american-lithium/_payload.json`
×2 = 393,414 B → **577,746 B**. The per-route payload is byte-identical in size to the root one because it is
dominated by the same `app.vue` catalog queries.

### 1a. The "~39 route `_payload.json` prefetches (~1.9 MB)" claim is NOT REPRODUCIBLE

Tested three times on fresh loads (fast JS scroll, slow 400 ms-step JS scroll, and again at 375 px),
scrolling the homepage to the true bottom (`scrollY 3683` of `scrollHeight 4583`, 38 grid cards, 38 grid
anchors present in the DOM):

- `performance.getEntriesByType('resource').filter(/_payload\.json/)` → **2 entries, both `/_payload.json`**. Zero per-route payloads.
- `document.querySelectorAll('link[rel=preload][as=fetch]')` → **2**, being `/_payload.json` and `/_nuxt/builds/meta/<buildId>.json`.
- `document.querySelectorAll('link[rel=prefetch]')` → **5**, all `_nuxt/*.js` route chunks (~tens of KB, not payloads).
- `navigator.connection`: `saveData:false`, `effectiveType:'4g'` — so prefetch was not being suppressed by the slow-connection guard.

Conclusion: **rung 3 (prefetch behaviour) has nothing to fix.** Nuxt is prefetching route *JS chunks*, not
route payloads. The ~1.9 MB figure in the brief appears to have counted something else. Recorded as
"not reproducible" rather than repeated. No `prefetchOn`/`:prefetch="false"`/`defaults.nuxtLink` change will be made.

### 1b. The real duplication is worse than the brief estimated

`_payload.json` is requested **twice** per load on desktop — once by the `<link rel="preload" as="fetch">`
Nuxt injects, once by the `fetch()` in Nuxt's payload plugin — on top of a full-size inline
`__NUXT_DATA__`. So the same catalog is serialised up to **three times per page view**.

### 1c. Field-cost breakdown of the live `allvideos` payload (38 records, read from `window.__NUXT__.data.allvideos`)

| Field | Raw JSON bytes | Read by app? |
|---|---|---|
| **`meta`** | **136,182** | **NO — dead weight** |
| `video_info` | 51,055 | partly |
| `keywords` | 21,982 | `[slug].vue` SEO meta only |
| `resources` | 8,376 | yes |
| `description` | 8,084 | yes |
| `animatedThumbnail` | 7,182 | yes |
| `awards` | 6,455 | yes |
| `backgroundImage` / `backgroundImageCard` | 5,814 | yes |
| everything else | ~10,000 | yes |

`meta` decomposes to `body` 132,249 / `path` 1,201 / `updated` 988 / `created` 262. **`meta.body` is a byte-for-byte
duplicate object of the entire source record** (all 27 keys including `video_info.description`), stored by
`@nuxt/content` alongside the schema columns. Nothing in the repo reads `.meta`, `.body`, `.path`, `.created`,
`.updated` or `__hash__` (grep over `pages/ components/ layouts/ stores/ composables/ app.vue` — the only
`.path` hits are `route.path` in `docsTopbar.vue` and `docsSearch.vue`, and `.body` hits are `document.body`).

Within `video_info`: `description` 37,343 (73 %), `thumbnail` 4,726, `poster` 1,778, rest < 500 each.

## 2. Consumer / field inventory (grep evidence — required before any trimming)

Every consumer of `videoStore.videoList` / `featuredVideosList` / `currentVideo`:

| Field | Consumers (file:line) |
|---|---|
| `title` | `docsCard.vue:172,188,216`, `docsHeroHeadings.vue:5`, `[slug].vue:126`, `stores/search.ts:17` |
| `subtitle` | `docsCard.vue:219`, `docsHeroHeadings.vue:6` |
| `by` | `docsHeroHeadings.vue:7`, `stores/search.ts:17` |
| `description` | `docsHeroHeadings.vue:17` (v-html), `[slug].vue:136`, `stores/search.ts:17` |
| `slug` | `app.vue:28,46`, `docsCard.vue:99,120`, `stores/video.ts:111,128` |
| `id` | `index.vue:31`, `[slug].vue:116`, `docsHeroVideo.vue:35` |
| `videoId` | `app.vue:30,48`, `docsCard.vue:61`, `[slug].vue:44,110`, `docsHeroVideo.vue:46` |
| `date` | `index.vue:87-89` (sort) |
| `docYear` | `docsCard.vue:223` |
| `workstream` | `index.vue:85` (filter) |
| `source` | `docsHeroVideo.vue:42,57` |
| `videoUrl` | `docsCard.vue:193`, `docsHeroVideo.vue:49,63` |
| `backgroundImage` / `backgroundImageCard` | `docsCard.vue:89,143`, `docsHeroVideo.vue:73` |
| `animatedThumbnail` | `docsCard.vue:196` |
| `tags` | `docsHeroHeadings.vue:12`, `[slug].vue:112,117` |
| `keywords` | `[slug].vue:140` (SEO meta) |
| `series` | `docsCard.vue:149`, `[slug].vue:84-87`, `docsTabs.vue:26,31` |
| `relatedDocumentaries` | `[slug].vue:108` |
| `resources` | **`docsCard.vue:142` (`props.video.resources.find(...)` — no optional chaining, hard TypeError if absent)**, `[slug].vue:98`, `docsTabs.vue:49` |
| `awards` | **`docsHeroExtra.vue:4` (`currentVideo.awards.length` — no optional chaining, hard TypeError if absent)**, `docsAwards.vue:18` |
| `screenings` | none found (dead in the UI, but only 134 B) |
| `video_info.duration` | `index.vue:77` (filter), `docsCard.vue:222`, `docsHeroHeadings.vue:9` |
| `video_info.year` | `docsHeroHeadings.vue:10` |
| `video_info.teaser_url` | `[slug].vue:79`, `docsTabs.vue:39`, `docsHeroHeadings.vue:53`, `docsHeroVideo.vue:35` |
| `video_info.description` | `[slug].vue:5`, `docsTabs.vue:44` |
| `video_info.thumbnail` / `thumb` | `docsCard.vue:86`, `[slug].vue:129` |
| `video_info.poster` | `docsCard.vue:143` |
| `meta`, `meta.body`, `__hash__`, `path`, `created`, `updated` | **NONE** |
| `stem` | `app.vue:29,47` — but only on the **`featuredvideos`** collection, never on `allvideos` |

### 2a. The brief's premise for rung 2 is wrong

> "Film detail pages (`/[slug]` route) already query their own document and must keep receiving full data."

They do **not**. `pages/[slug].vue:66` is `videoStore.setCurrentVideoFromSlug(route.params.slug)`, and
`stores/video.ts:128` resolves that out of `state.videoList` — i.e. the detail page renders entirely from the
root `allvideos` catalog. It issues no query of its own. Therefore **trimming `description`, `keywords`,
`video_info.description`, `resources`, `awards` or `series` out of the root query would blank or crash the
detail page**, and rung 2 as specified cannot be done without also giving `[slug].vue` its own full-document
query. That is a larger change than the brief assumes.

## 3. Plan (scope ladder, cheapest first)

**Rung 1a — kill the `_payload.json` duplication (config only).**
Set `experimental.payloadExtraction: false` in `nuxt.config.ts`. This stops Nitro emitting `_payload.json`
for prerendered routes and stops the payload plugin preloading/fetching it, removing 197–393 KB of decoded
data per page view. Safe here because all catalog data is loaded once in `app.vue` via `useAsyncData` keys
that survive client-side navigation (`app.vue` never unmounts), and `[slug].vue` has no `useAsyncData` of
its own — so no query re-runs on the client after this change.

**Rung 1b — drop the dead `meta` column from the root queries (`.select(...)`).**
Add an explicit `.select(...)` of the fields the inventory above proves are read. This excludes `meta`
(136 KB raw, of which `meta.body` is a full duplicate record) with **zero** consumer risk. Keep every field
listed in §2 including `description`, `keywords`, `resources`, `awards`, `series`, `video_info` — because the
detail page reads them from this same list (§2a).

Measure after 1a+1b. Target is combined hydration data well under 150 KB.

**Rung 2 — deeper field trimming.** Only if 1a+1b miss the target. Requires first giving `pages/[slug].vue`
its own `queryCollection('allvideos').where('slug','=',…).first()` and setting `currentVideo` from that, so
`description` / `keywords` / `video_info.description` / `resources` / `awards` can leave the list query.
Also needs optional chaining added at `docsCard.vue:142` and `docsHeroExtra.vue:4`.

**Rung 3 — prefetch behaviour. Dropped.** Not reproducible (§1a); there is nothing to change.

## 4. Guardrails

No Pinia store restructure, no `content.config.ts` schema change, no `directus/*` change. Detail pages,
filtering, sorting, search and series must behave identically.

## 5. Verification

Deploy preview, cold, mobile 375 px and desktop 1350 px, reload after every viewport change:
inline + `_payload.json` combined size; post-full-scroll `_payload.json` count/bytes; FCP/LCP/load;
homepage grid card count (38); workstream/duration/sort filters; featured reel; series chips; a detail page's
description, resources, screenings, awards; site search by keyword; light and dark mode.

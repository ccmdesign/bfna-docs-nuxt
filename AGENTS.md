# Repository Guidelines

## Project Structure & Module Organization
Source files live in `pages/` for route-driven views, `components/` for shared UI, and `layouts/` for global chrome. Contentful imports land in JSON under `content/`; never edit them manually. `contentful/` holds the importer scripts triggered by `contentImporter.js`. Store Pinia modules in `stores/`, server endpoints in `server/`, static assets in `public/`, and shared types in `types/`.

## Build, Test, and Development Commands
Run `npm install` to sync dependencies after cloning or pulling. Use `npm run dev` for local work; it triggers `contentImporter.js` before Nuxt starts so fresh entries land in `content/`. Execute `npm run build` for production bundles, `npm run generate` for static output, and `npm run preview` to smoke-test the build locally.

## Coding Style & Naming Conventions
Follow the Nuxt 3 and ESLint defaults provided by `eslint.config.mjs`; prefer TypeScript in Vue SFCs and composables when feasible. Use two-space indentation, Composition API with `<script setup>`, and descriptive prop/event names. Name Vue components in PascalCase (`FeaturedCarousel.vue`) and route files in kebab-case or bracket syntax (`[slug].vue`). When touching legacy components, match the surrounding style to avoid churn. Run `npx eslint . --ext .ts,.js,.vue` before pushing and fix violations in place.

## Testing Guidelines
The project ships with `@nuxt/test-utils`; place new tests under a top-level `tests/` directory, mirroring the feature path (e.g., `tests/pages/search.spec.ts`). Use descriptive test names and target realistic user flows, especially around content filtering and media metadata. When you enable Vitest or similar tooling, add a package script such as `"test": "vitest run"` so CI can invoke it consistently.

## Commit & Pull Request Guidelines
Keep commits concise, imperative, and scoped, mirroring the existing history (`docs footer layout`, `Reducing img size`). Reference issue numbers when applicable. Every PR should summarize the change, describe testing performed, and call out Contentful or environment variable updates. Attach screenshots for visual tweaks and note any required content re-imports so reviewers can reproduce your setup.

## Content & Environment Notes
`contentImporter.js` relies on Contentful and YouTube credentials. Ensure `.env` contains `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, and `YOUTUBE_API_KEY` before running dev or generate commands. When offline you may commit temporary JSON in `content/`, but drop stubs before merging so automated imports remain the source of truth.

### Troubleshooting: stale content cache after schema changes
If you pull a branch that changes `content.config.ts` (e.g. CCM-272 migrated `video_info.year` and `video_info.duration` from `z.string()` to `z.number()`) and see a Zod error like `Expected number, received string` during `npm run dev` or `npm run generate`, your local Nuxt Content SQLite cache is stale. Clean it and re-import:

```sh
rm -rf content/ .nuxt/ .output/ .data/ .content.cache.json
npm run generate
```

Netlify cold builds are unaffected (fresh checkout, no pre-existing cache).

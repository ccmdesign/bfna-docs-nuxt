import { defineConfig } from 'vitest/config';

// Minimal Vitest config for BF-52 unit tests (directus importer logic).
// These specs exercise pure mapping/resolution functions with mocked
// network + module seams — no Nuxt/Vue runtime needed, so the lightweight
// node environment keeps the suite fast and CI-friendly.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    // directus/common.js builds a Directus client at module load
    // (`createDirectus(process.env.BASE_URL)`), which throws "Invalid URL"
    // when BASE_URL is unset. Provide a harmless dummy so the module imports
    // cleanly under test — all network calls are mocked in the specs anyway.
    env: {
      BASE_URL: 'http://localhost',
    },
  },
});

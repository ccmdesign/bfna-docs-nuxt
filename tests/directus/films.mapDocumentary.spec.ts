import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * BF-52 — unit coverage for the docYear NaN-guard + docYear/video_info.year
 * consistency on the active Directus path (directus/films.js mapDocumentary).
 *
 * mapDocumentary depends on directus/common.js for the real network-bound
 * helpers. We mock the whole module so the test is deterministic and fast:
 *  - extractVideoInfo: driven per-test to simulate the resolved year/duration
 *    (already correctness-tested in common.extractVideoInfo.spec.ts).
 *  - getAnimatedVimeoThumbnail: stubbed (real impl hits Vimeo + a 50s sleep).
 *  - getImage / slugify: lightweight deterministic stubs.
 *
 * The core regression signature is docYear !== video_info.year. These tests
 * assert they always agree when an editorial date is present, and that a
 * malformed date never produces NaN for the required `docYear: z.number()`.
 */

vi.mock('../../directus/common.js', () => {
  return {
    extractVideoInfo: vi.fn(),
    getAnimatedVimeoThumbnail: vi.fn(async () => ''),
    getImage: vi.fn(() => 'https://example.com/img.webp'),
    slugify: vi.fn((s: string) =>
      String(s)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, ''),
    ),
  };
});

// vi.mock() must be declared before these imports so Vitest's hoisting
// applies the mock to directus/common.js. Reordering to satisfy import/first
// would defeat the mock, so the rule is disabled for these two lines only.
/* eslint-disable import/first */
import * as common from '../../directus/common.js';
import { mapDocumentary } from '../../directus/films.js';
/* eslint-enable import/first */

const baseItem = (overrides: Record<string, unknown> = {}) => ({
  id: 42,
  title: 'The Open Veins of Potosi',
  subtitle: 'Silver, Lithium, and Mining in Bolivia',
  video_url: 'https://vimeo.com/123456789',
  date: '2026-04-13',
  related_documentaries: [],
  tags: [],
  keywords: [],
  screenings: [],
  resources: [],
  awards: [],
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  (common.getAnimatedVimeoThumbnail as ReturnType<typeof vi.fn>).mockResolvedValue('');
  (common.getImage as ReturnType<typeof vi.fn>).mockReturnValue('https://example.com/img.webp');
});

describe('mapDocumentary (directus) — docYear resolution', () => {
  it('target film: editorial date 2026 wins; docYear === video_info.year === 2026', async () => {
    // extractVideoInfo (post-fix) resolves year from editorial date = 2026,
    // NOT the Vimeo provider year 2025.
    (common.extractVideoInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      year: 2026,
      duration: 30,
      thumbnail: 'https://i.vimeocdn.com/video/thumb.jpg',
    });

    const output = await mapDocumentary(baseItem());

    expect(output.docYear).toBe(2026);
    expect(output.video_info.year).toBe(2026);
    expect(output.docYear).toBe(output.video_info.year);
  });

  it('no editorial date, subtitle year present -> docYear from subtitle', async () => {
    (common.extractVideoInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      year: 2024,
      duration: 22,
    });

    const output = await mapDocumentary(
      baseItem({ date: null, subtitle: 'Title (2024, 22 Minutes)' }),
    );

    expect(output.docYear).toBe(2024);
    expect(output.video_info.year).toBe(2024);
  });

  it('no editorial date, provider year is last resort', async () => {
    (common.extractVideoInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      year: 2025,
      duration: 30,
    });

    const output = await mapDocumentary(baseItem({ date: null }));

    expect(output.docYear).toBe(2025);
    expect(output.video_info.year).toBe(2025);
  });

  it('malformed date guard: docYear falls back to extraVideoInfo.year, never NaN', async () => {
    (common.extractVideoInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      year: 2025,
      duration: 30,
    });

    const output = await mapDocumentary(baseItem({ date: 'garbage' }));

    expect(Number.isNaN(output.docYear)).toBe(false);
    expect(output.docYear).toBe(2025); // fell back to extraVideoInfo.year
  });

  it('all sources absent: docYear is the extraVideoInfo.year value, never NaN', async () => {
    // extractVideoInfo could not resolve a year at all.
    (common.extractVideoInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      thumbnail: 'https://i.vimeocdn.com/video/thumb.jpg',
    });

    const output = await mapDocumentary(
      baseItem({ date: null, subtitle: 'No parens' }),
    );

    // No source supplied a year -> docYear is undefined (NOT NaN).
    // This case drives the U4 schema decision (see plan): real published data
    // always supplies at least one source, so docYear stays required z.number().
    expect(Number.isNaN(output.docYear)).toBe(false);
    expect(output.docYear).toBeUndefined();
  });

  it('docYear / video_info.year consistency for an editorial-dated sample', async () => {
    // Even if the provider would have said 2025, both fields must agree.
    (common.extractVideoInfo as ReturnType<typeof vi.fn>).mockResolvedValue({
      year: 2026,
      duration: 30,
    });

    const output = await mapDocumentary(baseItem({ date: '2026-04-13' }));

    expect(output.docYear).toBe(output.video_info.year);
    expect(output.date).toBe('2026-04-13');
  });
});

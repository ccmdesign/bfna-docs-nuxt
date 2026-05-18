import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractVideoInfo } from '../../directus/common.js';

/**
 * BF-52 — ports the CCM-272 extractVideoInfo regression coverage to the
 * active Directus content path (directus/common.js).
 *
 * extractVideoInfo's provider/thumbnail helpers (getVimeoThumbnail,
 * getVimeoMetaInfo, getYoutubeMetaInfo) are module-internal closures with no
 * export seam, but every one of them resolves its data through the global
 * `fetch`. Mocking `fetch` is therefore the stable seam: it lets us drive the
 * Vimeo oembed endpoint (used by BOTH getVimeoThumbnail and getVimeoMetaInfo)
 * with a controlled `upload_date` whose year (2025) differs from the editorial
 * date year (2026) — the exact shape of the bug.
 */

const VIMEO_URL = 'https://vimeo.com/123456789';

// Vimeo oembed response: getVimeoThumbnail reads `thumbnail_url`;
// getVimeoMetaInfo reads `duration` (seconds) and `upload_date`.
const vimeoOembed = (overrides: Record<string, unknown> = {}) => ({
  thumbnail_url: 'https://i.vimeocdn.com/video/thumb.jpg',
  duration: 1800, // 30 min -> Math.round(1800/60) = 30
  upload_date: '2025-07-01 12:00:00', // provider year = 2025 (the wrong year)
  ...overrides,
});

const mockFetchOk = (payload: unknown) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => payload,
    })),
  );
};

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('extractVideoInfo (directus) — year resolution priority', () => {
  it('editorial date wins over provider upload year (the BF-52 bug)', async () => {
    // Target film shape: subtitle has no "(...)" group, Vimeo upload year 2025,
    // editorial date 2026-04-13. Resolved year MUST be 2026.
    mockFetchOk(vimeoOembed());

    const result = await extractVideoInfo({
      date: '2026-04-13',
      subtitle: 'Silver, Lithium, and Mining in Bolivia',
      video_url: VIMEO_URL,
    });

    expect(result.year).toBe(2026);
  });

  it('falls back to subtitle year when no editorial date', async () => {
    mockFetchOk(vimeoOembed());

    const result = await extractVideoInfo({
      date: null,
      subtitle: 'Some Title (2024, 22 Minutes)',
      video_url: VIMEO_URL,
    });

    expect(result.year).toBe(2024);
    expect(result.duration).toBe(22);
  });

  it('falls back to provider metadata as the last resort', async () => {
    mockFetchOk(vimeoOembed({ upload_date: '2025-01-15 00:00:00', duration: 1800 }));

    const result = await extractVideoInfo({
      date: null,
      subtitle: 'No parenthetical group here',
      video_url: VIMEO_URL,
    });

    expect(result.year).toBe(2025);
    expect(result.duration).toBe(30);
  });

  it('never reassigns videoInfo: thumbnail survives the provider-metadata fallback path', async () => {
    // No date, no subtitle paren group -> provider metadata path runs.
    // Pre-CCM-272 bug: videoInfo got wholesale-reassigned, wiping thumbnail.
    mockFetchOk(vimeoOembed());

    const result = await extractVideoInfo({
      date: null,
      subtitle: 'No parens',
      video_url: VIMEO_URL,
    });

    expect(result.thumbnail).toBe('https://i.vimeocdn.com/video/thumb.jpg');
    expect(result.year).toBe(2025); // provider year still resolved
  });

  it('malformed date guard: NaN never leaks; falls through to subtitle', async () => {
    mockFetchOk(vimeoOembed());

    const result = await extractVideoInfo({
      date: 'not-a-date',
      subtitle: 'Title (2023, 45 Minutes)',
      video_url: VIMEO_URL,
    });

    expect(Number.isNaN(result.year)).toBe(false);
    expect(result.year).toBe(2023);
  });

  it('empty date guard: empty string falls through, no NaN', async () => {
    mockFetchOk(vimeoOembed());

    const result = await extractVideoInfo({
      date: '',
      subtitle: 'No parens at all',
      video_url: VIMEO_URL,
    });

    expect(Number.isNaN(result.year)).toBe(false);
    // No date, no subtitle year -> provider year (2025)
    expect(result.year).toBe(2025);
  });

  it('malformed date with no fallback year yields a number or undefined, never NaN', async () => {
    // Provider returns no usable year (upload_date absent) and no subtitle group.
    mockFetchOk(vimeoOembed({ upload_date: null }));

    const result = await extractVideoInfo({
      date: 'garbage',
      subtitle: 'No parens',
      video_url: VIMEO_URL,
    });

    expect(Number.isNaN(result.year)).toBe(false);
    // year is either a number or absent (undefined) — never NaN
    expect(result.year === undefined || typeof result.year === 'number').toBe(true);
  });

  it('duration independence: editorial date sets year, subtitle still wins duration', async () => {
    mockFetchOk(vimeoOembed());

    const result = await extractVideoInfo({
      date: '2026-04-13',
      subtitle: 'Title (2024, 45 Minutes)',
      video_url: VIMEO_URL,
    });

    expect(result.year).toBe(2026); // editorial date wins
    expect(result.duration).toBe(45); // subtitle still wins for duration
  });

  it('thumbnail is preserved on the editorial-date path too', async () => {
    mockFetchOk(vimeoOembed());

    const result = await extractVideoInfo({
      date: '2026-04-13',
      subtitle: 'No parens',
      video_url: VIMEO_URL,
    });

    expect(result.thumbnail).toBe('https://i.vimeocdn.com/video/thumb.jpg');
    expect(result.year).toBe(2026);
  });
});

import { describe, expect, it } from 'vitest';
import { compareFilms, sortFilms } from '../../utils/filmOrder.js';

/**
 * Grid order (homepage, search list, importer): film year descending, then the
 * Directus `sort` (carried as `order`) ascending, then date and title as
 * fallbacks. 'asc' (Oldest) is the exact mirror.
 */

type Film = { title: string; docYear: number; order: number | null; date: string | null };

const film = (title: string, docYear: number, order: number | null, date: string | null = `${docYear}-06-01`): Film => ({
  title,
  docYear,
  order,
  date,
});

const titles = (films: Film[]) => films.map((f) => f.title);

describe('compareFilms / sortFilms', () => {
  it('orders same-year films by CMS sort, not by date', () => {
    const films = [
      film('Late in year, sort 3', 2025, 3, '2025-12-31'),
      film('Early in year, sort 1', 2025, 1, '2025-01-05'),
      film('Mid year, sort 2', 2025, 2, '2025-06-01'),
    ];
    expect(titles(sortFilms(films))).toEqual([
      'Early in year, sort 1',
      'Mid year, sort 2',
      'Late in year, sort 3',
    ]);
  });

  it('falls back to date (newest first) when sort is null, after the sorted films', () => {
    const films = [
      film('No sort, older', 2021, null, '2021-03-24'),
      film('Sorted', 2021, 7, '2021-01-01'),
      film('No sort, newer', 2021, null, '2021-09-03'),
    ];
    expect(titles(sortFilms(films))).toEqual(['Sorted', 'No sort, newer', 'No sort, older']);
  });

  it('breaks a full tie on title so the order never depends on input order', () => {
    const a = film('Out to Vote', 2021, null, '2021-09-03');
    const b = film('Go-Go City', 2021, null, '2021-09-03');
    expect(titles(sortFilms([a, b]))).toEqual(['Go-Go City', 'Out to Vote']);
    expect(titles(sortFilms([b, a]))).toEqual(['Go-Go City', 'Out to Vote']);
  });

  it('never interleaves years, whatever the sort values say', () => {
    const films = [
      film('2019, sort 1', 2019, 1),
      film('2026, sort 40', 2026, 40),
      film('2018, sort 2', 2018, 2),
      film('2026, no sort', 2026, null),
      film('2019, no sort', 2019, null, '2019-12-31'),
      film('2018, sort 39', 2018, 39),
    ];
    for (const direction of ['desc', 'asc'] as const) {
      const years = sortFilms(films, direction).map((f) => f.docYear);
      const expected = [...years].sort((x, y) => (direction === 'desc' ? y - x : x - y));
      expect(years).toEqual(expected);
    }
  });

  it("makes 'Oldest' (asc) the exact mirror of 'Most Recent' (desc)", () => {
    const films = [
      film('A', 2017, 3),
      film('B', 2019, 1),
      film('C', 2019, 2),
      film('D', 2019, null, '2019-02-01'),
      film('E', 2025, null, '2025-12-31'),
      film('F', 2025, 5),
    ];
    const desc = titles(sortFilms(films, 'desc'));
    expect(desc).toEqual(['F', 'E', 'B', 'C', 'D', 'A']);
    expect(titles(sortFilms(films, 'asc'))).toEqual([...desc].reverse());
  });

  it('uses the date year when docYear is missing, and does not mutate its input', () => {
    const noYear = { title: 'No docYear', order: null, date: '2024-05-01' } as unknown as Film;
    const films = [film('2023', 2023, 1), noYear, film('2025', 2025, 1)];
    const before = [...films];
    expect(titles(sortFilms(films))).toEqual(['2025', 'No docYear', '2023']);
    expect(films).toEqual(before);
    expect(compareFilms(films[0], films[0])).toBe(0);
  });
});

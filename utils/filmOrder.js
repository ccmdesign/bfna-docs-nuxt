// Film order for the homepage grid, the video list search uses and the
// importer. One comparator so the three can never disagree.
//
// Most Recent ('desc'):
//   1. film year (docYear), newest first
//   2. Directus `sort` (the drag-and-drop order in the CMS), ascending;
//      films with no `sort` come after the ones that have it
//   3. date, newest first (films with no `sort`, or equal `sort`)
//   4. title, A→Z, so the order is stable even when everything else ties
//
// Oldest ('asc') is the exact mirror: years ascending and the order within a
// year reversed too. The featured reel keeps its own curated order (BF-124)
// and never goes through here.

const yearOf = (film) => {
  const year = film?.docYear
  if (typeof year === 'number' && Number.isFinite(year)) return year
  const parsed = film?.date ? new Date(film.date).getUTCFullYear() : NaN
  return Number.isFinite(parsed) ? parsed : -Infinity
}

const sortOf = (film) => {
  const value = film?.order
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const compareNewestFirst = (a, b) => {
  const yearA = yearOf(a)
  const yearB = yearOf(b)
  if (yearA !== yearB) return yearB - yearA

  const sortA = sortOf(a)
  const sortB = sortOf(b)
  if (sortA !== null && sortB !== null && sortA !== sortB) return sortA - sortB
  if (sortA !== null && sortB === null) return -1
  if (sortA === null && sortB !== null) return 1

  const dateA = a?.date ?? ''
  const dateB = b?.date ?? ''
  if (dateA !== dateB) return dateB.localeCompare(dateA)

  return (a?.title ?? '').localeCompare(b?.title ?? '')
}

export const compareFilms = (a, b, direction = 'desc') =>
  direction === 'asc' ? compareNewestFirst(b, a) : compareNewestFirst(a, b)

export const sortFilms = (films, direction = 'desc') =>
  [...(films || [])].sort((a, b) => compareFilms(a, b, direction))

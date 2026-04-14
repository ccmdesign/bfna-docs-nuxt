// KNOWN ISSUE (tracked as follow-up to CCM-272, not fixed here):
// These three importer calls are fired without `await` / `Promise.all`, and
// the importer modules themselves also have un-awaited async work inside
// (see `featuredFilms.js` `getFeaturedDocs` and the fs.writeFile callback
// pattern in `films.js` / `featuredFilms.js`). On a cold build this can
// allow `nuxt generate` to start before `content/*.json` files are fully
// written, producing intermittent partial builds. Fix deferred to its own
// PR because wrapping in `Promise.all([...])` with `await` changes timing
// and needs its own regression pass.
const getFeaturedDocs = require('./contentful/featuredFilms');
const getAllFilms = require('./contentful/films');
const getSeries = require('./contentful/series');

getFeaturedDocs()
getSeries()
getAllFilms()
// const getFeaturedDocs = require('./contentful/featuredFilms');
// const getAllFilms = require('./contentful/films');
// const getSeries = require('./contentful/series');

// getFeaturedDocs()
// getSeries()
// getAllFilms()

import { getSeries } from './directus/series.js';
import { getDocumentaries } from './directus/films.js';
import { getFeaturedFilms } from './directus/featuredFilms.js';

// getFeaturedFilms();
// getSeries();
getDocumentaries();
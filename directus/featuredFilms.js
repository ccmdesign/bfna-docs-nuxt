import fs from 'fs';
import { rimraf } from 'rimraf';
import * as common from './common.js';


const objectContructor = async (dir, fs) => {
  try {
    // use this list to add fields from junction tables
    const junctionFields = [
      'films.docs_documentaries_id.*'
    ]

    const items = await common.getDirectusData("docs_featured_films", junctionFields);

    
    await items.data.forEach((item) => {
      item.films.forEach((srcFilm) => {
        const film = {
          slug: common.slugify(srcFilm.docs_documentaries_id.title),
          order: srcFilm.sort,
          id: srcFilm.docs_documentaries_id.id,
          title:srcFilm.docs_documentaries_id.title
        };
        

        fs.writeFile(
          dir + "/" + film.slug + ".json",
          JSON.stringify(film),
          function (err, result) {
            if (err) console.log("error", err);
          }
        );
        console.log("WRITING FEATURED FILM: ", film.slug + ".json");
      });


    });
  } catch (error) {
    console.error('Error in objectContructor:', error);
  }
}

export const getFeaturedFilms = async () => {
  const dir = "./content/featuredvideos";

  try {
    if (fs.existsSync(dir)) {
      await rimraf(dir);
    }

    if (!fs.existsSync("./content")) {
      fs.mkdirSync("./content");
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    await objectContructor(dir, fs);
  } catch (err) {
    console.error('Error in getFeaturedFilms:', err);
  }
}

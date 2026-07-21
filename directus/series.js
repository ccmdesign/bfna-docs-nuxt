import fs from 'fs';
import { rimraf } from 'rimraf';
import * as common from './common.js';

/** Map Directus documentary to Contentful-style structure (matches leadership-in-action.json) */
const mapDocumentary = (d) => {
  if (!d) return null;
  const videoUrl = d.video_url || '';
  const source = videoUrl.includes('youtu') ? 'youtube' : videoUrl.includes('vimeo') ? 'vimeo' : '';
  const backgroundImage = d.background_image
    ? common.getImage(d.background_image, false, null, common.IMAGE_WIDTHS.hero)
    : '';

  return {
    id: String(d.id),
    slug: common.slugify(d.title || ''),
    videoId: String(d.id),
    updated: d.date_updated || null,
    title: d.title || '',
    subtitle: d.subtitle || '',
    by: d.by || '',
    description: d.description || '',
    videoUrl,
    workstream: d.workstream || '',
    tags: Array.isArray(d.tags) ? d.tags : [],
    backgroundImage,
    animatedThumbnail: d.animated_thumbnail || '',
    source,
    screenings: Array.isArray(d.screenings) ? d.screenings : [],
    video_info: mapVideoInfo(d.documentary_tabs),
    resources: mapResources(d.resources || []),
    awards: mapAwards(d.awards || []),
  };
};

const mapResources = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((r) => {
    const fileId = typeof r.file === 'string' ? r.file : r.file?.id;
    return {
      id: r.id,
      title: r.title || '',
      // Type-aware: a PDF study guide comes back untransformed, an image
      // resource still gets resized (it is painted as a card background).
      url: fileId ? common.getImage(r.file ?? fileId, false, null, common.IMAGE_WIDTHS.poster) : r.url || '',
      description: r.description || '',
      size: r.size || '',
      type: r.type || 'file',
      extension: r.extension || '',
    };
  });
};

const mapAwards = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((a) => ({
    id: a.id,
    title: a.title || '',
    institution: a.institution || '',
    year: a.year ?? null,
  }));
};

/** Map Directus video_info to Contentful-style structure */
const mapVideoInfo = (vi) => {
  if (!vi) return {};
  return {
    title: vi.title || '',
    teaser_url: vi.teaser_url || '',
    teaser_source: (vi.teaser_url || '').includes('youtu')
      ? 'youtube'
      : (vi.teaser_url || '').includes('vimeo')
        ? 'vimeo'
        : '',
    description: vi.description || '',
    screenshot_extras: Array.isArray(vi.screenshot_extras) ? vi.screenshot_extras : [],
    thumbnail: common.getImage(vi.thumbnail, false, null, common.IMAGE_WIDTHS.card)
      || common.getImage(vi.teaser_thumbnail, false, null, common.IMAGE_WIDTHS.card) || '',
    year: vi.year ?? null,
    duration: vi.duration ?? null,
    poster: common.getImage(vi.poster, false, null, common.IMAGE_WIDTHS.poster) || '',
  };
};

const objectContructor = async (dir, fs) => {
  try {
    const junctionFields = [
      'films.docs_documentaries_id.*',
      'films.docs_documentaries_id.resources.*',
      'films.docs_documentaries_id.awards.*',
      'films.docs_documentaries_id.documentary_tabs.*',
    ];

    const items = await common.getDirectusData('docs_series', junctionFields);
    
    for (const item of items.data) {
      const documentaries = (item.films || [])
        .map((f) => mapDocumentary(f.docs_documentaries_id))
        .filter(Boolean);

      const output = {
        serieId: String(item.id),
        title: item.title || '',
        slug: common.slugify(item.title || ''),
        description: item.description || '',
        documentaries,
      };

      const filepath = dir + '/' + output.slug + '.json';
      fs.writeFile(filepath, JSON.stringify(output), (err) => {
        if (err) console.error('error', err);
      });
      console.log('WRITING SERIES:', output.slug + '.json');
    }
  } catch (error) {
    console.error('Error in objectContructor:', error);
  }
};

export const getSeries = async () => {
  const dir = "./content/series";

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
    console.error('Error in getSeries:', err);
  }
}

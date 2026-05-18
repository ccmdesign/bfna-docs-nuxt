import fs from 'fs';
import { rimraf } from 'rimraf';
import * as common from './common.js';

let displayFilters = {
  workstreams: [],
  years: [],
  durations: [],
}

const __writeContent = async (item, folder, log = false) => {
  const dir = `./content/${folder}`;

  function checkFolder(dirName) {
    return new Promise((resolve) => {
      fs.access(dirName, fs.constants.F_OK, (err) => {
        if (err) {
          console.log('Folder does not exist yet, waiting...');
          setTimeout(() => resolve(false), 1000); // Check again after 1 second
        } else {
          resolve(true);
        }
      });
    });
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  while (!(await checkFolder(dir))) {
    console.log('waiting for folder to be created');
  }

  fs.writeFile(
    `${dir}/${item.slug}.json`,
    JSON.stringify(item),
    function (err) {
      if (err) console.log("error", err);
    }
  );

  if (log) console.log(`WRITING ${folder}: `, item.slug + ".json");

}

/** Map Directus video_info to Contentful-style structure */
const mapVideoInfo = (vi) => {
  if (!vi) return {};

  const fileId = (f) => (typeof f === 'string' ? f : f?.id) || '';
  const fileExt = (f) =>
    (f && typeof f === 'object'
      ? (f.type?.split('/')[1] ?? f.filename_download?.split('.').pop())
      : '') || '';

  const __getScreenshots = (ssSource) => {
    if (!vi.screenshots) return [];
    return vi.screenshots.map((s) => {
      const sid = typeof s === 'string' ? s : s?.id;
      const screenshot = (ssSource || []).find((ss) => ss.id === sid);
      if (!screenshot) return null;
      return {
        id: screenshot.id,
        url: common.getImage(fileId(screenshot.file)),
      };
    }).filter(Boolean);
  }

  const posterId = fileId(vi.poster);
  const compressedId = fileId(vi.image_compressed);
  const thumbId = fileId(vi.teaser_thumbnail);
  const trailerThumbId = fileId(vi.trailer_thumbnail);

  return {
    title: vi.title || '',
    teaser_url: vi.teaser_url || '',
    teaser_source: (vi.teaser_url || '').includes('youtu')
      ? 'youtube'
      : (vi.teaser_url || '').includes('vimeo')
        ? 'vimeo'
        : '',
    description: vi.description || '',
    screenshots: __getScreenshots(vi.screenshotsSource),
    thumb: thumbId ? common.getImage(thumbId, false, fileExt(vi.teaser_thumbnail)) : '',
    trailer_url: vi.trailer_url || '',
    trailer_thumbnail: trailerThumbId ? common.getImage(trailerThumbId, false, fileExt(vi.trailer_thumbnail)) : '',
    poster: compressedId
      ? common.getImage(compressedId, true)
      : (posterId ? common.getImage(posterId, false, fileExt(vi.poster)) : ''),
    year: vi.year ?? null,
    duration: vi.duration ?? null,
  };
};

/** Map Directus resources (junction) to Contentful-style */
const mapResources = (items, p_resources = []) => {
  if (!Array.isArray(items)) return [];
  const resources = Array.isArray(p_resources) ? p_resources : [];
  return items.map((r) => {
    const junction = r?.docs_resources_id || r;
    const targetFileId = typeof junction?.file === 'string'
      ? junction.file
      : junction?.file?.id;
    const res = targetFileId
      ? resources.find((p) => {
        const pFileId = typeof p?.file === 'string' ? p.file : p?.file?.id;
        return pFileId === targetFileId;
      })
      : null;

    const fileId = typeof res?.file === 'string' ? res.file : res?.file?.id ?? targetFileId;
    const bytes = res?.file?.filesize ?? (typeof junction?.size === 'number' ? junction.size : null);
    const formatSize = (b) => (b != null && !isNaN(b) ? `${(b / (1024 * 1024)).toFixed(1)}MB` : junction?.size ?? '');


    const links = res?.links?.length > 0 ? res.links : junction?.links ?? [];
    const guideCover = res?.guide_cover ? res.guide_cover : junction?.guide_cover ?? '';

    return {
      id: res?.id ?? junction?.id ?? '',
      title: res?.title ?? junction?.title ?? '',
      url: fileId ? common.getImage(fileId) : res?.url ?? junction?.url ?? '',
      guideCover: guideCover ? common.getImage(guideCover.id) : '',
      description: res?.description ?? junction?.description ?? '',
      size: formatSize(bytes),
      type: res?.file.type ?? junction?.type,
      extension: res?.extension ?? junction?.extension ?? '',
      links: links.map((l) => ({
        title: l.title,
        link: l.link,
        cover: common.getImage(l.cover),
      })),
    };
  });
};

/** Map Directus awards (junction) to Contentful-style */
const mapAwards = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((a) => {
    const award = a.docs_awards_id || a;
    return {
      id: award.id,
      title: award.award_title || '',
      institution: award.institution || '',
      year: award.award_year ?? null,
    };
  });
};

/** Map Directus documentary to Contentful-style structure (matches after-michael.json) */
export const mapDocumentary = async (item, seriesDocs = [], screenshots = [], p_resources = [], index = 0) => {
  const videoUrl = item.video_url || '';
  const source = videoUrl.includes('youtu') ? 'youtube' : videoUrl.includes('vimeo') ? 'vimeo' : '';
  const bg = item.background_image
  const bgId = typeof bg === 'string' ? bg : bg?.id
  const bgExt = bg?.type?.split('/')[1] ?? bg?.filename_download?.split('.').pop() ?? ''
  const backgroundImage = bgId ? common.getImage(bgId, false, bgExt) : ''

  const docId = item.id;
  const seriesInDoc = seriesDocs
    .filter((s) => (s.documentaries || []).includes(docId))
    .map((s) => ({
      serieId: String(s.id),
      items: (s.documentaries || []).filter((id) => id !== docId),
    }));

  // The video info now is part of the documentary item, so we need to extract it from the item.
  const rawVideoInfo = {
    description: item.vi_description,
    teaser_url: item.vi_teaser_url,
    teaser_source: item.vi_teaser_source,
    trailer_url: item.vi_trailer_url,
    trailer_thumbnail: item.vi_trailer_thumbnail,
    poster: item.vi_poster,
    screenshots: item.vi_screenshots,
    image_compressed: item.vi_compressed_image,
  }
  const extraVideoInfo = await common.extractVideoInfo(item)

  // Available fields for filtering
  displayFilters.years.push(extraVideoInfo.year);
  displayFilters.durations.push(extraVideoInfo.duration);
  displayFilters.workstreams.push(item.workstream || '');

  // Resolve docYear with the same priority as extraVideoInfo.year so the two
  // can never diverge into the 2025/2026 split BF-52 fixed. Fallback order:
  // editorial `item.date` -> extraVideoInfo.year (which itself is
  // editorial date -> subtitle regex -> provider metadata after the
  // extractVideoInfo restructure). Guard Number.isNaN: a malformed
  // item.date would otherwise yield NaN and crash Nuxt Content ingest on
  // the required `docYear: z.number()`. Mirrors CCM-272 commit 75410f7.
  let docYear = extraVideoInfo.year;
  if (item.date) {
    const parsedYear = new Date(item.date).getFullYear();
    if (!Number.isNaN(parsedYear)) {
      docYear = parsedYear;
    }
  }

  return {
    id: String(item.id),
    order: index ?? item.sort ?? 0,
    created: item.date_created || null,
    docYear,
    videoId: item.id,
    updated: item.date_updated || null,
    title: item.title || '',
    date: item.date || null,
    subtitle: item.subtitle ? item.subtitle.split('(')[0].trim() : '',
    by: item.by || '',
    description: item.description || '',
    videoUrl,
    animatedThumbnail: item.animated_thumbnail || (await common.getAnimatedVimeoThumbnail(videoUrl, item.id)) || '',
    previewStartsAt: item.preview_starts_at ?? null,
    workstream: item.workstream || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    relatedDocumentaries: item.related_documentaries.map((x) => x.related_docs_documentaries_id),
    keywords: Array.isArray(item.keywords) ? item.keywords : [],
    backgroundImage,
    source,
    screenings: Array.isArray(item.screenings) ? item.screenings : [],
    video_info: { ...mapVideoInfo({ ...rawVideoInfo, screenshotsSource: screenshots }), ...extraVideoInfo },
    resources: mapResources(item.resources || [], p_resources),
    awards: mapAwards(item.awards || []),
    series: seriesInDoc,
    slug: common.slugify(item.title || ''),
  };
};

const objectContructor = async (dir, fs) => {
  try {
    const junctionFields = [
      'resources.docs_resources_id.*',
      'awards.docs_awards_id.*',
      'docs_video_info_id.*',
      'documentary_tabs.*',
      'background_image.*',
    ];

    const [docsRes, seriesRes, screenshotsRes, resourcesRes] = await Promise.all([
      common.getDirectusData('docs_documentaries', junctionFields),
      common.getDirectusData('docs_series', ['films.docs_documentaries_id']),
      common.getDirectusData('docs_screenshots'),
      common.getDirectusData('docs_resources', ['files.*'])
    ]);

    const videosSlugs = { slug: 'slugs', slugs: [] };
    const seriesDocs = (seriesRes.data || []).map((s) => ({
      id: s.id,
      documentaries: (s.films || []).map((f) => f.docs_documentaries_id?.id).filter(Boolean),
    }));

    const sorted = [...(docsRes.data || [])].sort((a, b) => {
      const orderA = a.documentary_tabs ?? a.sort ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.documentary_tabs ?? b.sort ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = a.date_created ? new Date(a.date_created).getTime() : 0;
      const dateB = b.date_created ? new Date(b.date_created).getTime() : 0;
      return dateA - dateB;
    });

    for (const [index, item] of sorted.entries()) {
      const output = await mapDocumentary(item, seriesDocs, screenshotsRes.data, resourcesRes.data, index);
      videosSlugs.slugs.push(output.slug);
      const filepath = dir + '/' + output.slug + '.json';
      await fs.promises.writeFile(filepath, JSON.stringify(output));
      console.log('WRITING DOCUMENTARIES:', output.slug + '.json');
    }

    // Write display filters
    displayFilters.workstreams = [...new Set(displayFilters.workstreams.flat())].sort();
    displayFilters.years = [...new Set(displayFilters.years)].sort((a, b) => b - a);
    displayFilters.durations = [...new Set(displayFilters.durations)].sort((a, b) => b - a);
    displayFilters.slug = common.slugify('filters');
    __writeContent(displayFilters, 'filters', true);

    // Write slugs
    __writeContent(videosSlugs, 'videos-slugs');

  } catch (error) {
    console.error('Error in objectContructor:', error);
  }
};

export const getDocumentaries = async () => {
  const dir = './content/allvideos';

  try {
    if (fs.existsSync(dir)) {
      await rimraf(dir);
    }

    if (!fs.existsSync('./content')) {
      fs.mkdirSync('./content');
    }
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    await objectContructor(dir, fs);
  } catch (err) {
    console.error('Error in getDocumentaries:', err);
  }
};

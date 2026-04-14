const fs = require("fs");
const main = require('../contentful/main')

let displayFilters = {
  workstreams: [],
  years: [],
  durations: [],
}


const writeContent = async (item, folder, log=false) => {
  const dir = `./content/${folder}`;
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  while(!(await checkFolder(dir))) {
    console.log('waiting for folder to be created');
  }

  fs.writeFile(
    `${dir}/${item.slug}.json`,
    JSON.stringify(item),
    function (err) {
      if (err) console.log("error", err);
    }
  );

  if(log) console.log(`WRITING ${folder} VIDEOS: `, item.slug + ".json");

}

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

const handleDocumentaries = async (docsItems, series=[]) => {
  let documentaries = []
  for (const doc of docsItems) {
    let fields = doc.fields
    let source = ''
    const extraVideoInfo = await main.extractVideoInfo(fields)

    // Available fields for filtering
    displayFilters.years.push(extraVideoInfo.year);
    displayFilters.durations.push(extraVideoInfo.duration);
    displayFilters.workstreams.push(fields.workstream);

    if (fields.video_url.includes('youtu')) {
      source = 'youtube'
    } else if (fields.video_url.includes('vimeo')) {
      source = 'vimeo'
    }
    let screeningsList = []
    if (fields.screenings) {
      fields.screenings.forEach(element => {
        let screenfields = element.fields
        if (new Date(screenfields.dateEnd) > Date.now()) {
          screeningsList.push({
            id: element.sys.id,
            availability: screenfields.availability,
            dateEnd: screenfields.dateEnd,
            dateStart: screenfields.dateStart,
            estabilishment: screenfields.estabilishment,
            estabilishmentURL: screenfields.estabilishmentURL,
            place: screenfields.place,
            ticketsURL: screenfields.ticketsURL
          })
        }
      })
      screeningsList.sort((a, b) => new Date(a.dateEnd) - new Date(b.dateEnd))
    }
    let videoInfo = {}
    if (fields.video_info) {
      videoInfo.title = fields.video_info.fields.title
      videoInfo.teaser_url = fields.video_info.fields.teaser_url
      let teaserSource = ''
      if (videoInfo.teaser_url && videoInfo.teaser_url.includes('youtu')) {
        teaserSource = 'youtube'
      } else if (videoInfo.teaser_url && videoInfo.teaser_url.includes('vimeo')) {
        teaserSource = 'vimeo'
      }
      videoInfo.teaser_source = teaserSource
      if (fields.video_info.fields.teaser_thumbnail) {
        videoInfo.thumb = fields.video_info.fields.teaser_thumbnail.fields.file.url
      }
      videoInfo.column_1_text = fields.video_info.fields.column_1_text
      videoInfo.column_1_title = fields.video_info.fields.column_1_title
      videoInfo.column_2_text = fields.video_info.fields.column_2_text
      videoInfo.column_2_title = fields.video_info.fields.column_2_title
      if (fields.video_info.fields.screenshot) {
        videoInfo.screenshot = fields.video_info.fields.screenshot.fields.file.url
      }
      videoInfo.screenshot_extras = []
      if (fields.video_info.fields.screenshot_extras) {
        fields.video_info.fields.screenshot_extras.forEach(element => {
          let screenshotfields = element.fields
          videoInfo.screenshot_extras.push({
            id: element.sys.id,
            url: screenshotfields.file.url,
            title: screenshotfields.title
          })
        })
      }

      if(fields.video_info.fields.poster) {
        videoInfo.poster = `${fields.video_info.fields.poster.fields.file.url}?w=800&fm=webp&q=80&fit=fill`
      }

    }
    let resourcesList = []
    if (fields.resources) {
      fields.resources.forEach(element => {
        let resource = {}
        let resourceType
        if (element.sys.contentType && element.sys.contentType.sys.id === 'resource_link') {
          resourceType = 'link'
          resource = {
            id: element.sys.id,
            title: element.fields.title,
            url: element.fields.link,
            description: element.fields.description,
            type: resourceType
          }
        } else {
          let fileFields = element.fields ? element.fields.file.fields.file : null
                    
          if(fileFields !== null) {

            if (fileFields.contentType.includes('pdf')) {
              resourceType = 'pdf'
            } else if (fileFields.contentType.includes('word')) {
              resourceType = 'doc'
            } else if (fileFields.contentType.includes('video')) {
              resourceType = 'video'
            } else if (fileFields.contentType.includes('zip')) {
              resourceType = 'zip'
            } else if (fileFields.contentType.includes('image')) {
              resourceType = 'image'
            } else {
              resourceType = 'file'
            }
            let size = (fileFields.details.size / 1000).toFixed(2)
            if (size >= 1000) {
              size = (size / 1000).toFixed(2) + 'mb'
            } else {
              size += 'kb'
            }
            let ext = fileFields.url.split('.').pop()
            resource = {
              id: element.sys.id,
              title: element.fields.title,
              description: element.fields.description,
              url: fileFields.contentType.includes('image') ? `${fileFields.url}?w=800&fm=webp&q=80&fit=fill` : fileFields.url,
              size: size,
              type: resourceType,
              extension: ext
            }
          }
        }
        resourcesList.push(resource)
      })
    }
    let awardList = []
    if (fields.awards) {
      fields.awards.forEach(aw => {
        awardList.push({
          id: aw.sys.id,
          title: aw.fields.title,
          institution: aw.fields.institution,
          year: aw.fields.year
        })
      })
    }
    documentaries.push({
      id: doc.sys.id,
      order: fields.order,
      date: fields.date || null,
      created: doc.sys.createdAt,
      docYear: fields.date ? new Date(fields.date).getFullYear() : extraVideoInfo.year,
      videoId: doc.sys.id,
      updated: doc.sys.updatedAt,
      title: fields.title,
      subtitle: fields.subtitle ? fields.subtitle.split('(')[0].trim() : '',
      by: fields.by,
      description: fields.description,
      videoUrl: fields.video_url,
      animatedThumbnail: await main.getAnimatedVimeoThumbnail(fields.video_url),
      previewStartsAt: fields.previewStartsAt,
      workstream: fields.workstream,
      tags: fields.tags,
      relatedDocumentaries: fields.relatedDocumentaries ? fields.relatedDocumentaries.map(d => d.sys.id) : [],
      keywords: fields.keywords,
      backgroundImage: `${fields.background_image.fields.file.url}?w=800&fm=webp&q=80&fit=fill`,
      source: source,
      screenings: screeningsList,
      video_info: { ...videoInfo, ...extraVideoInfo },
      resources: resourcesList,
      awards: awardList,
      // Series structure: [{ serieId, items: [other documentary ids in this series except current] }]
      series: series
      .filter(s => s.documentaries.includes(doc.sys.id))
      .map(s => ({
        serieId: s.serieId,
        items: s.documentaries.filter(id => id !== doc.sys.id)
      }))
    })
  }
  return documentaries
}

const getSeries = async () => {
  const data = await main.contentfulClient.getEntries({
    content_type: 'series',
    include: 2,
  })

  return data.items.map(({ fields, sys }) => {

    return {
      serieId: sys.id,
      title: fields.title,
      slug: main.slugify(fields.title),
      description: fields.description ? fields.description.content[0].content[0].value : '',
      documentaries: fields.items.map(item => item.sys.id),
      updated: fields.updatedAt
    }   
  });
}

const getAllFilms = async () => {
  const data = await main.contentfulClient.getEntries({
    content_type: 'documentary',
    include: 2,
  })

  const seriesDocs = await getSeries();  
  const videosSlugs = {slug: 'slugs',slugs: []};

  const sortOrderValue = (entry) => {
    const orderValue = entry?.fields?.order;
    if (typeof orderValue === 'number') return orderValue;
    return Number.MAX_SAFE_INTEGER;
  };

  const getEntryReleaseTimestamp = (entry) => {
    const dateValue = entry?.fields?.date || entry?.sys?.createdAt;
    return dateValue ? new Date(dateValue).getTime() : 0;
  };

  const getDocReleaseTimestamp = (doc) => {
    const releaseDateValue = doc?.date || doc?.created || doc?.updated;
    return releaseDateValue ? new Date(releaseDateValue).getTime() : 0;
  };

  const sortedDocumentaries = [...(data.items || [])].sort((a, b) => {
    const orderA = sortOrderValue(a);
    const orderB = sortOrderValue(b);
    if (orderA !== orderB) return orderA - orderB;
    return getEntryReleaseTimestamp(a) - getEntryReleaseTimestamp(b);
  });

  const allVideosDocs = [...await handleDocumentaries(sortedDocumentaries, seriesDocs)];
  const normalizedVideos = allVideosDocs.map((doc, index) => {
    if (typeof doc.order !== 'number') {
      doc.order = index;
    }
    return doc;
  });

  const orderedVideos = [...normalizedVideos].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    const titleA = a.title ?? '';
    const titleB = b.title ?? '';
    return titleA.localeCompare(titleB);
  });

  orderedVideos.forEach((doc) => {
    doc.slug = main.slugify(doc.title);
    writeContent(doc, 'allvideos', true);
    videosSlugs.slugs.push(doc.slug);
  });

  writeContent(videosSlugs, 'videos-slugs');

  // Filter latest releases from normalizedVideos using creation date
  const nowTimestamp = Date.now();
  const currentYear = new Date(nowTimestamp).getFullYear();
  const previousYear = currentYear - 1;

  const latestReleasesFiltered = normalizedVideos
    .filter(doc => {
      const releaseTimestamp = getDocReleaseTimestamp(doc);
      if (!releaseTimestamp) return false;

      const releaseYear = new Date(releaseTimestamp).getFullYear();
      return (
        (releaseYear === currentYear || releaseYear === previousYear) &&
        releaseTimestamp <= nowTimestamp
      );
    })
    .sort((a, b) => getDocReleaseTimestamp(b) - getDocReleaseTimestamp(a));

  latestReleasesFiltered.forEach((doc, index) => {
    doc.slug = main.slugify(doc.title);
    doc.order = index;
    writeContent(doc, 'latest', true);
  });

  // Write display filters
  displayFilters.workstreams = [...new Set(displayFilters.workstreams.flat())].sort();
  displayFilters.years = [...new Set(displayFilters.years)].sort((a, b) => b - a);
  displayFilters.durations = [...new Set(displayFilters.durations)].sort((a, b) => b - a);
  displayFilters.slug = main.slugify('filters');
  writeContent(displayFilters, 'filters', true);
  
}

module.exports = async function () {
  return await getAllFilms();
}

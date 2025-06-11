require('dotenv').config();
const contentful = require("contentful");

const contentfulClient = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// slugify
const slugify = (term) => {
  return term
    .toString()
    .toLowerCase()
    .replace(/[àÀáÁâÂãäÄÅåª]+/g, "a") // Special Characters #1
    .replace(/[èÈéÉêÊëË]+/g, "e") // Special Characters #2
    .replace(/[ìÌíÍîÎïÏ]+/g, "i") // Special Characters #3
    .replace(/[òÒóÓôÔõÕöÖº]+/g, "o") // Special Characters #4
    .replace(/[ùÙúÚûÛüÜ]+/g, "u") // Special Characters #5
    .replace(/[ýÝÿŸ]+/g, "y") // Special Characters #6
    .replace(/[ñÑ]+/g, "n") // Special Characters #7
    .replace(/[çÇ]+/g, "c") // Special Characters #8
    .replace(/[ß]+/g, "ss") // Special Characters #9
    .replace(/[Ææ]+/g, "ae") // Special Characters #10
    .replace(/[Øøœ]+/g, "oe") // Special Characters #11
    .replace(/[%]+/g, "pct") // Special Characters #12
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

const getVimeoMetaInfo = async (url) => {
  if (!url) {
    console.error("No URL provided for Vimeo metadata retrieval.");
    return null;
  }

  const videoIdMatch = (() => {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  })();

  if (!videoIdMatch) {
    console.error("Could not extract Vimeo video ID from URL:", url);
    return null;
  }

  const metaUrl =`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoIdMatch}`
  
  try {
    const response = await fetch(metaUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const durationInMinutes = Math.round(data.duration / 60);
    const year = data.upload_date ? new Date(data.upload_date).getFullYear() : null;

    return { duration: durationInMinutes, year };

  } catch (error) {
    console.error("Error fetching Vimeo metadata:", error);
    
    return {};
  }

}

// Extract YouTube video ID
const __videoIdMatch = ((url) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : null;
});

const getYoutubeThumbnail = async (url) => {
  const videoId = await __videoIdMatch(url);
  let thumbsValue = '';

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("No YouTube API key found in environment variables.");
    return null;
  }

  const API_URL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  const response = await fetch(API_URL).catch((err) =>
    console.log(`Error trying to get thumbnails for videos "${lsId}": ${err}`)
  );

  const json = await response.json();

  for (let item of json.items) {
    const thumbs = item.snippet.thumbnails;

    if (thumbs.maxres) {
      thumbsValue = thumbs.maxres.url;
    } else if (thumbs.standard) {
      thumbsValue = thumbs.standard.url;
    } else if (thumbs.high) {
      thumbsValue = thumbs.high.url;
    } else if (thumbs.medium) {
      thumbsValue = thumbs.medium.url;
    } else if (thumbs.default) {
      thumbsValue = thumbs.default.url;
    } else {
      thumbsValue = "";
    }
  }

  return thumbsValue;
};

const getVimeoThumbnail = async (url) => {
  if (!url) {
    console.error("No URL provided for Vimeo thumbnail retrieval.");
    return null;
  }

  const videoIdMatch = (() => {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  })();

  if (!videoIdMatch) {
    console.error("Could not extract Vimeo video ID from URL:", url);
    return null;
  }

  const metaUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoIdMatch}`;

  try {
    const response = await fetch(metaUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error("Error fetching Vimeo thumbnail:", error);
    return null;
  }
};

const getYoutubeMetaInfo = async (url) => {

  if (!url) {
    console.error("No URL provided for YouTube metadata retrieval.");
    return null;
  }

  const videoId = await __videoIdMatch(url)
  if (!videoId) {
    console.error("Could not extract YouTube video ID from URL:", url);
    return null;
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("No YouTube API key found in environment variables.");
    return null;
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.items || !data.items.length) {
      return {};
    }
    const video = data.items[0];

    // Parse ISO 8601 duration (e.g., PT1H2M10S)
    const parseDuration = (isoDuration) => {
      const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(match[1] || 0, 10);
      const minutes = parseInt(match[2] || 0, 10);
      const seconds = parseInt(match[3] || 0, 10);
      return hours * 60 + minutes + Math.round(seconds / 60);
    };
    const duration = parseDuration(video.contentDetails.duration);
    const year = video.snippet.publishedAt
      ? new Date(video.snippet.publishedAt).getFullYear()
      : null;

    return { duration, year };
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    return {};
  }
};

const extractVideoInfo = async (fields) => {

  // first we try to get the video info from subtitle field, ex.: (2024, 22 Minutes)
  let videoInfo = {};
  if (fields.video_url.includes('youtu')) {
    videoInfo.thumbnail = await getYoutubeThumbnail(fields.video_url)
  } else if (fields.video_url.includes('vimeo')) {
    videoInfo.thumbnail  = await getVimeoThumbnail(fields.video_url)
  }

  if (fields.subtitle) {
    // Extract all digit groups separated by comma (e.g., "2024, 22")
    const digitMatch = fields.subtitle.match(/\((\d+)\s*,\s*(\d+)\s*.*\)/);
    if (digitMatch) {
      videoInfo.year = parseInt(digitMatch[1], 10);
      videoInfo.duration = parseInt(digitMatch[2], 10);
    } else {
      if (fields.video_url.includes('youtu')) {
        videoInfo = await getYoutubeMetaInfo(fields.video_url)
      } else if (fields.video_url.includes('vimeo')) {
        videoInfo  = await getVimeoMetaInfo(fields.video_url)
      }
    }
  }

  return videoInfo;

}


module.exports = {
  contentfulClient,
  extractVideoInfo,
  slugify,
}
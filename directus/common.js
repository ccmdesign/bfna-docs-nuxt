import dotenv from 'dotenv';
import { createDirectus, rest, readItems } from '@directus/sdk';

dotenv.config();

const CONTENT_STATUS = process.env.DEV ? JSON.parse(process.env.DEV) : ["published"]
const client = createDirectus(process.env.BASE_URL).with(rest());

// get content from directus
export const getDirectusData = async (collectionName, junctionFields=undefined) => {
  const content = await client.request(readItems(collectionName, {
    fields: junctionFields ? [`*.*`, ...junctionFields] : ['*.*'],
    limit: -1,
    filter: {
      "status": {
        "_in" : CONTENT_STATUS
      }
    }
  }));

  return { data: content };
}

// getImageUrl - skips transform for webp (Directus re-encoding can degrade quality)
export const getImage = (imageId, compressed = false, extension = null) => {
  if (!imageId) return ''
  const base = `${process.env.BASE_URL}/assets/${imageId}`
  if (compressed) return base
  const ext = (extension || '').toLowerCase()
  const isWebp = ext === 'webp' || (typeof imageId === 'string' && /\.webp$/i.test(imageId))
  if (isWebp) return base
  return `${base}?width=800&format=webp&quality=80`
}

// slugify
export const slugify = (term) => {
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

export const formatDate = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString(
    'en-gb',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );
}

export const formatTime = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleTimeString(
    'en',
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

export const getAnimatedVimeoThumbnail = async (url) => {

  // Helper to extract Vimeo ID from URL: TODO: this should be generic
  const extractVimeoId = (url) => {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  };

  const videoId = extractVimeoId(url);

  if (!videoId) {
    console.error("No video ID provided for animated thumbnail retrieval.");
    return null;
  }

  const apiUrl = `https://api.vimeo.com/videos/${videoId}/animated_thumbsets`;
  const accessToken = process.env.VIMEO_CLIENT_SECRET;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data.data) && data.data.length > 1) {
      const highProfile = data.data[1].sizes.find(item => item.profile_id === "High" || item.profile_id === "Low");
      return highProfile ? highProfile.link : null;
    } else if(Array.isArray(data.data) && data.data.length > 0) {
      const highProfile = data.data[0].sizes.find(item => item.profile_id === "High" || item.profile_id === "Low");
      return highProfile ? highProfile.link : null;
    } else if(Array.isArray(data.data) && data.data.length === 0) {
      console.log(`Thumbnail creation process initiated for the url: ${ url }`);
      await __createAnimatedThumbnails(accessToken, videoId);
      // Wait a bit for Vimeo to process (optional: increase if needed)
      await new Promise(res => setTimeout(res, 50000));
      return await getAnimatedVimeoThumbnail(url);
    }
  } catch (error) {
    console.error("Error fetching animated Vimeo thumbnail:", error);
    return null;
  }
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

export const extractVideoInfo = async (fields) => {

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
  

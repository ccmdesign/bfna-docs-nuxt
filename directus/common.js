import dotenv from 'dotenv';
import { createDirectus, rest, readItems, staticToken, updateItem } from '@directus/sdk';

dotenv.config();

const CONTENT_STATUS = process.env.DEV ? JSON.parse(process.env.DEV) : ["published"]
const client = createDirectus(process.env.BASE_URL).with(rest());

// Lazy-initialised write client. Built on first use; warns once when token is absent.
let __writeClient = undefined; // undefined = uninitialised, null = warned-and-disabled
const __getWriteClient = () => {
  if (__writeClient !== undefined) return __writeClient;
  const token = process.env.DIRECTUS_TOKEN;
  if (!token) {
    console.warn('[animated-thumbnail writeback] DIRECTUS_TOKEN not set; skipping CMS cache writes for this run.');
    __writeClient = null;
    return __writeClient;
  }
  __writeClient = createDirectus(process.env.BASE_URL).with(staticToken(token)).with(rest());
  return __writeClient;
};

// Persist a resolved animated-thumbnail URL back to docs_documentaries.
// Fails closed: any error is logged and swallowed so the importer continues.
export const updateDocumentaryAnimatedThumbnail = async (documentaryId, url) => {
  if (!documentaryId || !url) return;
  const wc = __getWriteClient();
  if (!wc) return;
  try {
    await wc.request(updateItem('docs_documentaries', documentaryId, { animated_thumbnail: url }));
  } catch (error) {
    const msg = error?.errors?.[0]?.message ?? error?.message ?? String(error);
    console.warn(`[animated-thumbnail writeback] failed for ${documentaryId}: ${msg}`);
  }
};

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

// Asset host for image URLs. On Netlify (production, branch deploys, deploy
// previews) images are emitted as same-origin `/cms/<id>` so they serve from
// Netlify's edge cache via the proxy rewrite in netlify.toml — the origin is
// hit only on a cache miss (BF-107). Off Netlify (local `npm run dev`) there is
// no proxy, so fall back to the Directus origin directly. `ASSET_BASE_URL` is an
// explicit override/escape hatch if the default ever needs to change.
const ASSET_BASE = process.env.ASSET_BASE_URL
  || (process.env.NETLIFY ? '/cms' : `${process.env.BASE_URL}/assets`)

// getImageUrl - skips transform for webp (Directus re-encoding can degrade quality)
export const getImage = (imageId, compressed = false, extension = null) => {
  if (!imageId) return ''
  const base = `${ASSET_BASE}/${imageId}`
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

// Ask Vimeo to generate animated thumbnails for a video that doesn't have any yet.
// Returns true on success, false on failure. Errors are logged, not thrown.
const __createAnimatedThumbnails = async (accessToken, videoId, duration = 6, quantity = 4) => {
  try {
    const response = await fetch(`https://api.vimeo.com/videos/${videoId}/animated_thumbsets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
      body: JSON.stringify({ duration, quantity, start_time: 15 }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Error creating animated thumbnails for video ${videoId}: ${response.status} ${body}`);
      return false;
    }
    console.log(`Animated thumbnail creation initiated for video ${videoId}`);
    return true;
  } catch (error) {
    console.error(`Error creating animated thumbnails for video ${videoId}:`, error.message);
    return false;
  }
};

export const getAnimatedVimeoThumbnail = async (url, documentaryId = null, attempt = 0) => {

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

  const accessToken = process.env.VIMEO_CLIENT_SECRET;
  if (!accessToken) {
    console.error("VIMEO_CLIENT_SECRET not set; cannot fetch animated thumbnails.");
    return null;
  }

  const apiUrl = `https://api.vimeo.com/videos/${videoId}/animated_thumbsets`;

  // Resolve a URL via the Vimeo API, then persist it back to Directus.
  const resolveAndCache = async (resolvedUrl) => {
    if (!resolvedUrl) return null;
    await updateDocumentaryAnimatedThumbnail(documentaryId, resolvedUrl);
    return resolvedUrl;
  };

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const pickLink = (entry) => {
      const sz = (entry?.sizes || []).find(item => item.profile_id === "High" || item.profile_id === "Low");
      return sz ? sz.link : null;
    };
    if (Array.isArray(data.data) && data.data.length > 1) {
      return await resolveAndCache(pickLink(data.data[1]));
    }
    if (Array.isArray(data.data) && data.data.length > 0) {
      return await resolveAndCache(pickLink(data.data[0]));
    }
    if (Array.isArray(data.data) && data.data.length === 0) {
      if (attempt > 0) {
        console.warn(`Vimeo did not return animated thumbnails for ${url} after creation; giving up.`);
        return null;
      }
      console.log(`Thumbnail creation process initiated for the url: ${url}`);
      const ok = await __createAnimatedThumbnails(accessToken, videoId);
      if (!ok) return null;
      await new Promise(res => setTimeout(res, 50000));
      return await getAnimatedVimeoThumbnail(url, documentaryId, attempt + 1);
    }
    return null;
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
  // Priority for year: fields.date -> subtitle regex -> video-provider metadata.
  // Priority for duration: subtitle regex -> video-provider metadata.
  // Thumbnail is fetched independently and must never be clobbered by the
  // metadata fallback. This mirrors the CCM-272 fix (commit 421bec5) ported
  // from contentful/main.js: previously the else-branch reassigned
  // `videoInfo = await getVimeoMetaInfo(...)`, wholesale wiping any
  // date-derived year and the thumbnail. BF-52 ports that fix to the active
  // Directus path.
  const videoInfo = {};

  // 1. Thumbnail (independent of year/duration logic).
  if (fields.video_url && fields.video_url.includes('youtu')) {
    videoInfo.thumbnail = await getYoutubeThumbnail(fields.video_url);
  } else if (fields.video_url && fields.video_url.includes('vimeo')) {
    videoInfo.thumbnail = await getVimeoThumbnail(fields.video_url);
  }

  // 2. Date-derived year (primary source). Guard against null/empty/malformed dates.
  let dateYear = null;
  if (fields.date) {
    const parsedYear = new Date(fields.date).getFullYear();
    if (!Number.isNaN(parsedYear)) {
      dateYear = parsedYear;
    }
  }

  // 3. Subtitle regex (secondary source for year, primary for duration).
  let subtitleYear = null;
  let subtitleDuration = null;
  if (fields.subtitle) {
    // Extract all digit groups separated by comma (e.g., "2024, 22")
    const digitMatch = fields.subtitle.match(/\((\d+)\s*,\s*(\d+)\s*.*\)/);
    if (digitMatch) {
      subtitleYear = parseInt(digitMatch[1], 10);
      subtitleDuration = parseInt(digitMatch[2], 10);
    }
  }

  // 4. Video-provider metadata fallback — computed into a SEPARATE local so
  //    it can never reassign `videoInfo` and wipe the thumbnail or the
  //    date-derived year (the bug that CCM-272 fixed on the Contentful path).
  //    Only call the provider if we still need year or duration.
  const needYear = dateYear == null && subtitleYear == null;
  const needDuration = subtitleDuration == null;
  let metaInfo = null;
  if (fields.video_url && (needYear || needDuration)) {
    if (fields.video_url.includes('youtu')) {
      metaInfo = await getYoutubeMetaInfo(fields.video_url);
    } else if (fields.video_url.includes('vimeo')) {
      metaInfo = await getVimeoMetaInfo(fields.video_url);
    }
  }

  // 5. Merge in strict priority order. Never reassign `videoInfo`.
  const resolvedYear = dateYear ?? subtitleYear ?? (metaInfo ? metaInfo.year : null);
  if (resolvedYear != null) {
    videoInfo.year = resolvedYear;
  }

  const resolvedDuration = subtitleDuration ?? (metaInfo ? metaInfo.duration : null);
  if (resolvedDuration != null) {
    videoInfo.duration = resolvedDuration;
  }

  return videoInfo;
}
  

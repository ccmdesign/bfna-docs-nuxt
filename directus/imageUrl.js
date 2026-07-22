// Directus asset-URL construction. Deliberately dependency-free so it can be
// unit-tested without the Directus SDK or a live CMS (see getImage.test.mjs).

// Render widths, tuned to what the templates actually paint (card posters draw
// at ~28-170 CSS px, grid/backdrop art up to ~600, hero up to ~1200). Kept to a
// small set on purpose: every distinct width is a separate Directus transform
// and a separate cache entry, so a per-breakpoint ladder would thrash the cache
// for no visible gain.
export const IMAGE_WIDTHS = {
  poster: 400,
  card: 600,
  hero: 1200,
}
const DEFAULT_IMAGE_WIDTH = IMAGE_WIDTHS.card

// Asset host for image URLs [BF-107]. On Netlify (production, branch deploys,
// deploy previews) assets are emitted as same-origin `/cms/<id>` so they serve
// from Netlify's edge cache via the proxy rewrite in public/_redirects — the
// Directus origin is hit only on a cache miss. Off Netlify (local `npm run
// dev`) there is no proxy, so fall back to the origin directly.
// `ASSET_BASE_URL` is an explicit override/escape hatch. Resolved lazily so
// tests can set env per-case and importing this module never throws.
const assetBase = () => process.env.ASSET_BASE_URL
  || (process.env.NETLIFY ? '/cms' : `${process.env.BASE_URL}/assets`)

// Assets we know Directus cannot resize, so we never ask. Logged once each so a
// build surfaces bad content instead of silently shipping a broken <img>.
const __warned = new Set()
const __warnOnce = (key, message) => {
  if (__warned.has(key)) return
  __warned.add(key)
  console.warn(message)
}

/**
 * Build a Directus asset URL, requesting a transform only when it can succeed.
 *
 * `file` accepts either a bare file id or a resolved Directus file object.
 * Always prefer passing the object: the transform decision needs `type`,
 * `width` and `height`, and with only an id we have to guess.
 *
 * The transform is skipped when:
 *  - `compressed` is set — the caller explicitly wants the original;
 *  - the file is not an `image/*` — Directus cannot rasterise a PDF, so
 *    `?format=webp` on a study guide is ignored and the full original is
 *    served (a 24 MB PDF behind an image-shaped URL);
 *  - the file is an SVG — vector art gains nothing from a raster resize;
 *  - Directus has no recorded `width`/`height` — a width transform on those
 *    fails with ILLEGAL_ASSET_TRANSFORMATION (HTTP 400) and the browser paints
 *    a broken image. Serving the original is worse than a resize but far
 *    better than nothing, so we fall back and warn.
 *
 * Note: webp is no longer bypassed wholesale. The previous rule ("skip webp,
 * Directus re-encoding degrades quality") meant a 6450x9137 webp was shipped
 * untouched into a 28x39 px card. Downscaling dominates any re-encode loss at
 * that ratio, so webp is resized like everything else — still emitted as webp.
 */
export const getImage = (file, compressed = false, extension = null, width = DEFAULT_IMAGE_WIDTH) => {
  const meta = file && typeof file === 'object' ? file : null
  const id = meta ? meta.id : file
  if (!id) return ''

  const base = `${assetBase()}/${id}`
  if (compressed) return base

  const type = (meta?.type || '').toLowerCase()
  const name = meta?.filename_download || id

  // Non-image: never decorate with image transform params.
  if (type && !type.startsWith('image/')) {
    __warnOnce(`type:${id}`, `[getImage] ${name} is "${type}", not an image; serving it untransformed. Image transform params on a non-image are ignored by Directus and ship the full original.`)
    return base
  }
  if (type === 'image/svg+xml') return base

  // Dimensions unknown -> Directus would reject the resize with HTTP 400.
  if (meta && (meta.width == null || meta.height == null)) {
    const mb = meta.filesize ? ` (${(meta.filesize / 1024 / 1024).toFixed(1)} MB)` : ''
    __warnOnce(`dims:${id}`, `[getImage] ${name}${mb} has no width/height recorded in Directus; resize would return ILLEGAL_ASSET_TRANSFORMATION, so the full original is being served. Re-upload the file so Directus records its dimensions.`)
    return base
  }

  // With only an id we cannot tell a PDF or a dimensionless file from a healthy
  // image. Preserve the old extension-based webp guess so an id-only caller
  // never regresses into a 400.
  if (!meta) {
    const ext = (extension || '').toLowerCase()
    const looksWebp = ext === 'webp' || (typeof id === 'string' && /\.webp$/i.test(id))
    if (looksWebp) return base
  }

  // Never upscale past the source.
  const target = meta?.width ? Math.min(width, meta.width) : width
  return `${base}?width=${target}&format=webp&quality=80`
}

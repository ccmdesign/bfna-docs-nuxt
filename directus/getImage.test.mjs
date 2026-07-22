// Self-check for getImage's transform gating. Run: node directus/getImage.test.mjs
// No framework on purpose — this exists so the four "never do this" rules stay
// enforced, since each one shipped a real bug to production.
process.env.BASE_URL = 'https://cms.example.org';

const { getImage, IMAGE_WIDTHS } = await import('./imageUrl.js');

let failures = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) { failures++; console.error(`FAIL ${name}\n  expected: ${expected}\n  actual:   ${actual}`); }
  else console.log(`ok   ${name}`);
};

const B = 'https://cms.example.org/assets';
const img = (over = {}) => ({ id: 'abc', type: 'image/jpeg', width: 2000, height: 3000, ...over });

// 1. A PDF must never carry image transform params. Directus ignores them and
//    serves the whole original (the 24 MB motown-south study guide).
check('pdf gets no transform',
  getImage({ id: 'pdf1', type: 'application/pdf', width: null, height: null }),
  `${B}/pdf1`);

// 2. No recorded dimensions -> a resize returns ILLEGAL_ASSET_TRANSFORMATION
//    (HTTP 400) and the browser paints a broken image. Serve the original.
check('null dimensions falls back to original',
  getImage(img({ id: 'nodim', width: null, height: null })),
  `${B}/nodim`);

// 3. webp is resized like anything else. The old bypass shipped a 6450px webp
//    into a 28px card.
check('webp is resized, still webp',
  getImage(img({ id: 'w', type: 'image/webp', width: 6450, height: 9137 }), false, null, IMAGE_WIDTHS.poster),
  `${B}/w?width=${IMAGE_WIDTHS.poster}&format=webp&quality=80`);

// 4. Never upscale past the source.
check('does not upscale',
  getImage(img({ id: 'small', width: 120, height: 160 }), false, null, IMAGE_WIDTHS.hero),
  `${B}/small?width=120&format=webp&quality=80`);

// 5. Explicit "give me the original" still wins.
check('compressed returns original',
  getImage(img({ id: 'c' }), true),
  `${B}/c`);

// 6. Bare-id callers keep the old webp behaviour so they cannot regress into a 400.
check('id-only webp keeps legacy bypass',
  getImage('legacy', false, 'webp'),
  `${B}/legacy`);

// 7. Ordinary image resizes at the requested width.
check('image resizes',
  getImage(img({ id: 'ok' }), false, null, IMAGE_WIDTHS.card),
  `${B}/ok?width=${IMAGE_WIDTHS.card}&format=webp&quality=80`);

// 8. An image-typed *resource* must keep its resize: docsRelatedItemsCard
//    paints resource.url as a card background when the file is not a PDF.
//    Forcing every resource URL untransformed would have shipped originals here.
check('image resource keeps its resize',
  getImage(img({ id: 'res', type: 'image/png', width: 3000, height: 4000 }), false, null, IMAGE_WIDTHS.poster),
  `${B}/res?width=${IMAGE_WIDTHS.poster}&format=webp&quality=80`);

// 9. Empty input stays empty (callers rely on '' being falsy).
check('empty id -> empty string', getImage(null), '');
check('svg untouched', getImage(img({ id: 's', type: 'image/svg+xml' })), `${B}/s`);

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);

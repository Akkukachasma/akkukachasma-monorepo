/** Words per minute for body text (typical adult reading speed). */
const WORDS_PER_MINUTE = 200;
/** Extra time per non-inline image (hosted URL), in seconds. */
const SECONDS_PER_EXTERNAL_IMAGE = 12;
/** Cap extra minutes added for images so lists do not explode. */
const MAX_EXTRA_IMAGE_MINUTES = 5;

/**
 * Estimates reading time from HTML article body.
 * Strips data-URL / base64 image payloads so embedded images do not inflate word count.
 */
export function estimateArticleReadingTimeMinutes(html: string): number {
  if (!html || typeof html !== 'string') {
    return 1;
  }

  const imgTagPattern = /<img\b[^>]*>/gi;
  const imgTags = html.match(imgTagPattern) ?? [];
  let externalImageCount = 0;
  for (const tag of imgTags) {
    const srcMatch = tag.match(/\bsrc\s*=\s*["']([^"']*)["']/i);
    const src = srcMatch?.[1]?.trim() ?? '';
    if (src && !src.toLowerCase().startsWith('data:')) {
      externalImageCount += 1;
    }
  }

  let plain = html;
  // Remove base64 data URLs (often huge; must not count as "words")
  plain = plain.replace(
    /data:image\/[a-z0-9+.=-]+;base64,[a-z0-9+/=\s]+/gi,
    ' ',
  );
  // Drop img tags so alt text alone does not dominate
  plain = plain.replace(imgTagPattern, ' ');
  plain = plain.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ' ',
  );
  plain = plain.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ' ',
  );
  plain = plain.replace(/<[^>]+>/g, ' ');
  plain = plain
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');

  const words = plain
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  let minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const extraImageMinutes = Math.min(
    MAX_EXTRA_IMAGE_MINUTES,
    (externalImageCount * SECONDS_PER_EXTERNAL_IMAGE) / 60,
  );
  minutes = Math.max(1, Math.round(minutes + extraImageMinutes));
  return minutes;
}

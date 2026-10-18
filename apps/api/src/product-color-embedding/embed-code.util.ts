export type EmbedProvider =
  | 'youtube'
  | 'vimeo'
  | 'instagram'
  | 'facebook'
  | 'unknown';

export type ParsedEmbed = {
  provider: EmbedProvider;
  /** HTTPS URL safe for iframe src */
  iframeSrc: string;
  /** Original embed snippet/code as provided by admin */
  storedCode: string;
};

export const MAX_EMBED_CODE_LENGTH = 20_000;

const ALLOWED_HOST_SUFFIXES = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'player.vimeo.com',
  'instagram.com',
  'www.instagram.com',
  'facebook.com',
  'www.facebook.com',
  'fb.watch',
];

function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(
    (suffix) => h === suffix || h.endsWith(`.${suffix}`),
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function detectProvider(hostname: string): EmbedProvider {
  const h = hostname.toLowerCase();
  if (h.includes('youtube.com') || h === 'youtu.be') return 'youtube';
  if (h.includes('vimeo.com')) return 'vimeo';
  if (h.includes('instagram.com')) return 'instagram';
  if (h.includes('facebook.com') || h === 'fb.watch') return 'facebook';
  return 'unknown';
}

function parseYouTube(u: URL): string | null {
  if (u.hostname === 'youtu.be') {
    const id = u.pathname.replace(/^\//, '').split('/')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (u.hostname.includes('youtube.com')) {
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    const short = u.pathname.match(/\/shorts\/([^/?]+)/);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;
  }
  return null;
}

function parseVimeo(u: URL): string | null {
  if (!u.hostname.includes('vimeo.com')) return null;
  const id = u.pathname.replace(/^\//, '').split('/').filter(Boolean)[0];
  return id && /^\d+$/.test(id)
    ? `https://player.vimeo.com/video/${id}`
    : null;
}

function parseInstagram(u: URL): string | null {
  if (!u.hostname.includes('instagram.com')) return null;
  const path = u.pathname.replace(/\/$/, '');
  if (path.includes('/embed')) return u.toString();
  const reel = path.match(/\/reel\/([^/]+)/);
  if (reel?.[1]) return `https://www.instagram.com/reel/${reel[1]}/embed`;
  const post = path.match(/\/p\/([^/]+)/);
  if (post?.[1]) return `https://www.instagram.com/p/${post[1]}/embed`;
  return null;
}

function parseFacebook(u: URL): string | null {
  if (!u.hostname.includes('facebook.com') && u.hostname !== 'fb.watch') {
    return null;
  }
  if (u.pathname.includes('/plugins/video.php')) return u.toString();
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.toString())}&show_text=false`;
}

function normalizeHttpsUrl(url: string): ParsedEmbed | null {
  let normalized = decodeHtmlEntities(url.trim());
  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`;
  }
  if (normalized.startsWith('http://')) {
    normalized = normalized.replace(/^http:\/\//i, 'https://');
  }

  let u: URL;
  try {
    u = new URL(normalized);
  } catch {
    return null;
  }

  if (u.protocol !== 'https:') return null;
  if (!isAllowedHost(u.hostname)) return null;

  const yt = parseYouTube(u);
  if (yt) {
    return {
      provider: 'youtube',
      iframeSrc: yt,
      storedCode: url.trim(),
    };
  }
  const vimeo = parseVimeo(u);
  if (vimeo) {
    return {
      provider: 'vimeo',
      iframeSrc: vimeo,
      storedCode: url.trim(),
    };
  }
  const ig = parseInstagram(u);
  if (ig) {
    return {
      provider: 'instagram',
      iframeSrc: ig,
      storedCode: url.trim(),
    };
  }
  const fb = parseFacebook(u);
  if (fb) {
    return {
      provider: 'facebook',
      iframeSrc: fb,
      storedCode: url.trim(),
    };
  }

  if (u.pathname.includes('/embed') || u.pathname.includes('/plugins/')) {
    return {
      provider: detectProvider(u.hostname),
      iframeSrc: u.toString(),
      storedCode: url.trim(),
    };
  }

  return null;
}

function extractIframeSrc(html: string): string | null {
  const tagMatch = html.match(/<iframe[\s\S]*?>/i);
  if (!tagMatch) return null;
  const tag = tagMatch[0];
  const srcMatch =
    tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i) ||
    tag.match(/\ssrc\s*=\s*([^\s>]+)/i);
  if (!srcMatch?.[1]) return null;
  const src = decodeHtmlEntities(srcMatch[1].trim());
  if (/^javascript:/i.test(src) || /^data:/i.test(src)) return null;
  return src;
}

function stripScriptTags(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();
}

function isInstagramBlockquote(html: string): boolean {
  return (
    /data-instgrm-permalink/i.test(html) ||
    /<blockquote[\s\S]*?instagram-media/i.test(html)
  );
}

function extractInstagramPermalink(html: string): string | null {
  const fromPermalink = html.match(
    /data-instgrm-permalink\s*=\s*["']([^"']+)["']/i,
  )?.[1];
  if (fromPermalink) {
    return decodeHtmlEntities(fromPermalink.trim());
  }

  const fromCite = html.match(
    /\bcite\s*=\s*["'](https:\/\/(?:www\.)?instagram\.com\/[^"']+)["']/i,
  )?.[1];
  if (fromCite) {
    return decodeHtmlEntities(fromCite.trim());
  }

  const fromHref = html.match(
    /href\s*=\s*["'](https:\/\/(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[^"']+)["']/i,
  )?.[1];
  if (fromHref) {
    return decodeHtmlEntities(fromHref.trim());
  }

  return null;
}

function normalizeIframeSrc(src: string): ParsedEmbed | null {
  const fromUrl = normalizeHttpsUrl(src);
  if (fromUrl) {
    return { ...fromUrl, storedCode: fromUrl.storedCode };
  }

  let decoded = decodeHtmlEntities(src.trim());
  if (decoded.startsWith('//')) decoded = `https:${decoded}`;

  try {
    const u = new URL(decoded);
    if (u.protocol !== 'https:' || !isAllowedHost(u.hostname)) return null;
    return {
      provider: detectProvider(u.hostname),
      iframeSrc: u.toString(),
      storedCode: src.trim(),
    };
  } catch {
    return null;
  }
}

function containsUnsafeMarkup(code: string): boolean {
  return (
    /<script\b/i.test(code) ||
    /javascript:/i.test(code) ||
    /\son[a-z]+\s*=/i.test(code)
  );
}

/**
 * Parses admin-provided embed code (iframe HTML, Instagram blockquote, or legacy HTTPS URL).
 * Returns a whitelisted iframe src for storefront rendering.
 */
export function parseEmbedCode(raw: string): ParsedEmbed | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_EMBED_CODE_LENGTH) return null;

  const isInstagram = isInstagramBlockquote(trimmed);
  const isIframe = /<iframe/i.test(trimmed);
  const sanitized =
    isInstagram || isIframe ? stripScriptTags(trimmed) : trimmed;

  if (containsUnsafeMarkup(sanitized)) return null;

  const storedCode = isInstagram || isIframe ? sanitized : trimmed;

  if (isIframe) {
    const src = extractIframeSrc(sanitized);
    if (!src) return null;
    const normalized = normalizeIframeSrc(src);
    if (!normalized) return null;
    return { ...normalized, storedCode };
  }

  if (isInstagram || /<blockquote/i.test(sanitized)) {
    const permalink = extractInstagramPermalink(sanitized);
    if (!permalink) return null;
    const normalized = normalizeHttpsUrl(permalink);
    if (!normalized) return null;
    return { ...normalized, storedCode };
  }

  if (/^https?:\/\//i.test(sanitized)) {
    return normalizeHttpsUrl(sanitized);
  }

  return null;
}

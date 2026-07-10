const RASTER_DATA_URL_RE = /^data:image\/(?:png|jpe?g|gif|webp|bmp);base64,[a-z0-9+/]+={0,2}$/i;

export const IMAGE_ASPECT_RATIOS = Object.freeze({
  landscape: 16 / 9,
  square: 1,
  portrait: 9 / 16,
});

export function normalizeImageAspectRatio(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return Object.hasOwn(IMAGE_ASPECT_RATIOS, normalized) ? normalized : 'landscape';
}

function stripWrappingQuotes(value = '') {
  const text = String(value || '').trim();
  if (text.length >= 2 && ['"', "'", '`'].includes(text[0]) && text.at(-1) === text[0]) {
    return text.slice(1, -1).trim();
  }
  return text;
}

/**
 * Return a browser-safe source for a generated raster image, or null.
 * Deliberately excludes file:, blob:, svg data URLs, and arbitrary schemes.
 */
export function resolveImageSource(value = '') {
  const source = stripWrappingQuotes(value);
  if (!source) return null;
  if (RASTER_DATA_URL_RE.test(source)) return source;
  try {
    const url = new URL(source);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * Extract full-line MEDIA tags without treating local paths as browser URLs.
 */
export function extractMediaTags(text = '') {
  const media = [];
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const remaining = [];
  for (const line of lines) {
    const match = /^\s*["'`]?MEDIA:\s*(.+?)\s*["'`]?\s*$/i.exec(line);
    if (!match) {
      remaining.push(line);
      continue;
    }
    const source = stripWrappingQuotes(match[1]);
    if (source) media.push({ source, raw: line });
  }
  return {
    media,
    text: remaining.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
  };
}

/**
 * Remove repeated generated-image references once an image is rendered separately.
 */
export function stripGeneratedImageEchoes(text = '', imageSources = []) {
  let cleaned = String(text || '');
  for (const rawSource of imageSources) {
    const source = String(rawSource || '').trim();
    if (!source) continue;
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned
      .replace(new RegExp(`!\\[[^\\]]*\\]\\(${escaped}\\)`, 'gi'), '')
      .replace(new RegExp(`^\\s*MEDIA:\\s*${escaped}\\s*$`, 'gim'), '')
      .replace(new RegExp(`^\\s*${escaped}\\s*$`, 'gim'), '');
  }
  return cleaned.replace(/\n{3,}/g, '\n\n').trim();
}

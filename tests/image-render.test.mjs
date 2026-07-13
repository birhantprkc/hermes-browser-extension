import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { renderMarkdown } from '../extension/lib/common.mjs';
import { extractMediaTags, resolveImageSource, stripGeneratedImageEchoes } from '../extension/lib/image-render.mjs';

const TRANSPARENT_PNG_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';

test('image rendering helpers exist as a dedicated safe module', () => {
  assert.ok(existsSync(new URL('../extension/lib/image-render.mjs', import.meta.url)));
});

test('image helpers accept only safe remote or raster data image sources', () => {
  assert.equal(resolveImageSource(TRANSPARENT_PNG_DATA_URL), TRANSPARENT_PNG_DATA_URL);
  assert.equal(resolveImageSource('https://example.com/image.webp'), 'https://example.com/image.webp');
  assert.equal(resolveImageSource('http://example.com/image.webp'), null);
  assert.equal(resolveImageSource('file:///C:/Users/Jaybo/image.png'), null);
  assert.equal(resolveImageSource('data:image/svg+xml;base64,PHN2Zy8+'), null);
  assert.equal(resolveImageSource('javascript:alert(1)'), null);
});

test('image helpers extract standalone MEDIA tags and remove only image echoes', () => {
  const source = 'https://example.com/generated.png';
  const extracted = extractMediaTags(`Image complete\nMEDIA:${source}\nKeep this caption.`);
  assert.deepEqual(extracted.media, [{ source, raw: `MEDIA:${source}` }]);
  assert.equal(extracted.text, 'Image complete\nKeep this caption.');
  assert.equal(stripGeneratedImageEchoes(`![Image](${source})\nMEDIA:${source}\nCaption`, [source]), 'Caption');
});

test('image echo stripping handles persisted multi-megabyte data URLs without constructing an oversized regular expression', () => {
  const source = `data:image/png;base64,${'A'.repeat(3_200_000)}`;
  const message = `Generated successfully.\n\n![image](${source})`;

  assert.doesNotThrow(() => stripGeneratedImageEchoes(message, [source]));
  assert.equal(stripGeneratedImageEchoes(message, [source]), 'Generated successfully.');
});

test('renderMarkdown renders an API-delivered generated image data URL inline', () => {
  const html = renderMarkdown(`![Generated image](${TRANSPARENT_PNG_DATA_URL})`);

  assert.match(html, /<figure class="generated-image"/);
  assert.match(html, /data-slot="aui_generated-image"/);
  assert.match(html, /<img[^>]+src="data:image\/png;base64,/);
  assert.match(html, /alt="Generated image"/);
});

test('renderMarkdown renders a standalone remote MEDIA tag as a generated image', () => {
  const html = renderMarkdown('MEDIA:https://example.com/generated-image.webp');

  assert.match(html, /<figure class="generated-image"/);
  assert.match(html, /src="https:\/\/example\.com\/generated-image\.webp"/);
});

test('renderMarkdown hides an unresolved local MEDIA path instead of emitting a broken image or file path', () => {
  const html = renderMarkdown('MEDIA:C:\\Users\\Jaybo\\.hermes\\cache\\images\\generated.png');

  assert.match(html, /generated-image-unavailable/);
  assert.doesNotMatch(html, /C:\\Users\\Jaybo/);
  assert.doesNotMatch(html, /<img/);
});

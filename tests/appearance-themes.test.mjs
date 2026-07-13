import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  APPEARANCE_THEMES,
  DEFAULT_APPEARANCE_THEME,
  DEFAULT_COLOR_MODE,
  normalizeAppearanceTheme,
  normalizeColorMode,
  resolveColorMode,
} from '../extension/lib/appearance-themes.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function cssBlock(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`))?.[1] || '';
}

function cssValue(block, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return block.match(new RegExp(`${escapedProperty}\\s*:\\s*([^;]+);`))?.[1]?.trim() || '';
}

test('canonical Hermes appearance themes stay ordered with Nous first', () => {
  assert.deepEqual(APPEARANCE_THEMES.map((theme) => theme.value), [
    'nous',
    'midnight',
    'ember',
    'mono',
    'cyberpunk',
    'slate',
    'senter-space',
    'aurora',
    'solstice',
  ]);
  assert.equal(APPEARANCE_THEMES[0].name, 'Nous');
  assert.deepEqual(APPEARANCE_THEMES.slice(-3).map((theme) => theme.name), [
    'Senter Space',
    'Aphrodite',
    'Solstice',
  ]);
  assert.equal(DEFAULT_APPEARANCE_THEME, 'nous');
  assert.equal(DEFAULT_COLOR_MODE, 'dark');
});

test('Aphrodite replaces Aurora visually while preserving the stable aurora preference id', () => {
  const aphrodite = APPEARANCE_THEMES.find((theme) => theme.value === 'aurora');
  const sidepanelCss = read('extension/sidepanel-themes.css');
  const fulltabCss = read('extension/fulltab-themes.css');
  const appHtml = read('extension/app.html');

  assert.equal(aphrodite?.name, 'Aphrodite');
  assert.match(aphrodite?.description || '', /pink|rose|orchid/i);
  assert.match(cssBlock(fulltabCss, 'html[data-hermes-theme="aurora"][data-hermes-mode="light"]'), /--hermes-accent:\s*#[0-9a-f]{6}/i);
  assert.match(cssBlock(fulltabCss, 'html[data-hermes-theme="aurora"][data-hermes-mode="dark"]'), /--hermes-accent:\s*#[0-9a-f]{6}/i);
  assert.equal(
    cssValue(cssBlock(sidepanelCss, 'html[data-hermes-theme="aurora"][data-hermes-mode="light"]'), '--hermes-blue'),
    cssValue(cssBlock(fulltabCss, 'html[data-hermes-theme="aurora"][data-hermes-mode="light"]'), '--hermes-blue'),
  );
  assert.doesNotMatch(appHtml, /<span>\s*Model\s*<\/span>/i);
});

test('appearance normalization never falls through to system implicitly', () => {
  assert.equal(normalizeAppearanceTheme('unknown'), 'nous');
  assert.equal(normalizeColorMode('unknown'), 'dark');
  assert.equal(resolveColorMode('system', false), 'light');
  assert.equal(resolveColorMode('system', true), 'dark');
});

test('sidepanel implements every canonical palette and shares the Hermes Web Nous Light treatment', () => {
  const sidepanelThemeCssPath = path.join(root, 'extension', 'sidepanel-themes.css');
  const sidepanelThemeCss = fs.existsSync(sidepanelThemeCssPath) ? fs.readFileSync(sidepanelThemeCssPath, 'utf8') : '';
  const sidepanelCss = `${read('extension/sidepanel.css')}\n${sidepanelThemeCss}`;
  const fulltabCss = read('extension/fulltab-themes.css');
  const sidepanelHtml = read('extension/sidepanel.html');
  const sharedTokens = ['--hermes-blue', '--hermes-blue-deep', '--hermes-paper', '--hermes-ink', '--hermes-accent'];

  assert.match(sidepanelHtml, /<link rel="stylesheet" href="sidepanel-themes\.css" \/>/);
  assert.ok(fs.existsSync(sidepanelThemeCssPath), 'sidepanel must load a dedicated canonical theme layer');

  for (const theme of APPEARANCE_THEMES) {
    for (const mode of ['light', 'dark']) {
      const selector = `html[data-hermes-theme="${theme.value}"][data-hermes-mode="${mode}"]`;
      assert.ok(cssBlock(sidepanelCss, selector), `sidepanel must define ${theme.value} ${mode}`);
    }
  }

  for (const theme of ['senter-space', 'aurora', 'solstice']) {
    for (const mode of ['light', 'dark']) {
      const selector = `html[data-hermes-theme="${theme}"][data-hermes-mode="${mode}"]`;
      const sidepanelBlock = cssBlock(sidepanelCss, selector);
      const fulltabBlock = cssBlock(fulltabCss, selector);
      for (const token of sharedTokens) {
        assert.equal(cssValue(sidepanelBlock, token), cssValue(fulltabBlock, token), `${theme} ${mode} must match Hermes Web ${token}`);
      }
    }
  }

  const nousLightSelector = 'html[data-hermes-theme="nous"][data-hermes-mode="light"]';
  const sidepanelNousLight = cssBlock(sidepanelCss, nousLightSelector);
  const fulltabNousLight = cssBlock(fulltabCss, nousLightSelector);
  for (const token of sharedTokens) {
    assert.equal(cssValue(sidepanelNousLight, token), cssValue(fulltabNousLight, token), `Nous Light must match Hermes Web ${token}`);
  }
  assert.equal(cssValue(sidepanelNousLight, '--hermes-fg'), cssValue(fulltabNousLight, '--hermes-shell-fg'));
  assert.equal(cssValue(sidepanelNousLight, '--hermes-fg-rgb'), cssValue(fulltabNousLight, '--hermes-shell-fg-rgb'));
});

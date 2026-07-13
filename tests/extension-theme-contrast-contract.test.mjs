import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const sidepanelHtml = readFileSync(path.join(root, 'extension', 'sidepanel.html'), 'utf8');
const sidepanelCss = readFileSync(path.join(root, 'extension', 'sidepanel.css'), 'utf8');
const themeCss = readFileSync(path.join(root, 'extension', 'sidepanel-themes.css'), 'utf8');
const logoPath = path.join(root, 'extension', 'assets', 'img', 'hermes-agent-logo.svg');

test('extension uses the supplied Hermes Agent logo as a theme-colored vector mask', () => {
  assert.equal(existsSync(logoPath), true, 'the supplied Hermes Agent SVG should ship with the extension');
  assert.match(sidepanelHtml, /class="brand-mini-mark"/, 'brand header should render the themed vector mark');
  assert.match(sidepanelCss, /mask:\s*url\("assets\/img\/hermes-agent-logo\.svg"\)/, 'brand mark should use the supplied vector asset');
  assert.match(sidepanelCss, /background:\s*var\(--hermes-brand-mark/, 'brand mark should resolve through a theme color token');
});

test('Senter, Aurora, and Solstice light modes keep panel text dark while action surfaces stay light', () => {
  for (const [theme, label] of [['senter-space', 'Senter'], ['aurora', 'Aurora'], ['solstice', 'Solstice']]) {
    const selector = `html[data-hermes-theme="${theme}"][data-hermes-mode="light"]`;
    const start = themeCss.indexOf(selector);
    assert.notEqual(start, -1, `${label} light palette should exist`);
    const block = themeCss.slice(start, themeCss.indexOf('}', start));
    assert.match(block, /--hermes-fg:\s*#[0-9a-f]{6}/i, `${label} light mode needs an ink foreground token`);
    assert.match(block, /--hermes-primary-fg:\s*#[0-9a-f]{6}/i, `${label} light mode needs readable action text`);
    assert.match(block, /--hermes-user-fg:\s*#[0-9a-f]{6}/i, `${label} light mode needs readable user-message text`);
  }
});

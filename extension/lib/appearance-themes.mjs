export const APPEARANCE_THEMES = Object.freeze([
  {
    value: 'nous',
    name: 'Nous',
    description: 'Ink blue with soft-white Desktop accents',
    preview: { bg: '#0505e8', panel: '#0505e8', text: '#f8faff', muted: '#dbe6ff', accent: '#f8faff' },
  },
  {
    value: 'midnight',
    name: 'Midnight',
    description: 'Deep blue-violet with cool accents',
    preview: { bg: '#07061a', panel: '#0d0b25', text: '#d9d2ff', muted: '#8e88bd', accent: '#1d1850' },
  },
  {
    value: 'ember',
    name: 'Ember',
    description: 'Warm crimson and bronze forge',
    preview: { bg: '#1a0600', panel: '#250800', text: '#ffd0a4', muted: '#c98f65', accent: '#4b1603' },
  },
  {
    value: 'mono',
    name: 'Mono',
    description: 'Clean grayscale minimal focus',
    preview: { bg: '#0d0d0d', panel: '#111111', text: '#eeeeee', muted: '#9b9b9b', accent: '#1f1f1f' },
  },
  {
    value: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon green terminal',
    preview: { bg: '#001004', panel: '#001b08', text: '#12ff68', muted: '#00a947', accent: '#002d10' },
  },
  {
    value: 'slate',
    name: 'Slate',
    description: 'Cool slate blue developer focus',
    preview: { bg: '#081015', panel: '#0e171e', text: '#d0dbe2', muted: '#94a3ad', accent: '#172c3d' },
  },
  {
    value: 'senter-space',
    name: 'Senter Space',
    description: 'Deep space, sea glass, and warm starlight',
    preview: { bg: '#091716', panel: '#112722', text: '#e9d1a5', muted: '#87c6b7', accent: '#c79a55' },
  },
  {
    value: 'aurora',
    name: 'Aphrodite',
    description: 'Hot pink, orchid, and rose with a polished dark-plum counterpart.',
    preview: { bg: '#3b0928', panel: '#5f123d', text: '#fff0f7', muted: '#d89ab7', accent: '#ff4fa3' },
  },
  {
    value: 'solstice',
    name: 'Solstice',
    description: 'Quiet graphite with sun-warmed brass',
    preview: { bg: '#181715', panel: '#25211b', text: '#f1dfbc', muted: '#c4a77c', accent: '#e5b96c' },
  },
]);

export const DEFAULT_APPEARANCE_THEME = 'nous';
export const DEFAULT_COLOR_MODE = 'dark';
export const COLOR_MODES = Object.freeze(['light', 'dark', 'system']);

export function normalizeAppearanceTheme(value = DEFAULT_APPEARANCE_THEME) {
  const raw = String(value || DEFAULT_APPEARANCE_THEME).trim().toLowerCase();
  return APPEARANCE_THEMES.some((theme) => theme.value === raw) ? raw : DEFAULT_APPEARANCE_THEME;
}

export function normalizeColorMode(value = DEFAULT_COLOR_MODE) {
  const raw = String(value || DEFAULT_COLOR_MODE).trim().toLowerCase();
  return COLOR_MODES.includes(raw) ? raw : DEFAULT_COLOR_MODE;
}

export function resolveColorMode(value = DEFAULT_COLOR_MODE, prefersDark = true) {
  const mode = normalizeColorMode(value);
  return mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
}

export const WEB_COMMANDS = Object.freeze([
  { name: 'new', description: 'Start a new Hermes Web chat', action: 'new-session' },
  { name: 'model', description: 'Choose the model for this session', action: 'model-picker' },
  { name: 'context', description: 'Inspect the session context window', action: 'context-window' },
  { name: 'activity', description: 'Show the active run and tool activity', action: 'activity' },
  { name: 'files', description: 'Attach files to the next message', action: 'attach-files' },
  { name: 'settings', description: 'Open Hermes Web settings', action: 'settings' },
]);

function commandToken(value = '') {
  const match = /(?:^|\s)\/([a-z0-9_-]*)$/i.exec(String(value || ''));
  return match ? String(match[1] || '').toLowerCase() : null;
}

export function webComposerSuggestionMode(value = '', { force = false } = {}) {
  if (force) return 'commands';
  return /(?:^|\s)[/@][a-z0-9_-]*$/i.test(String(value || '')) ? 'typed' : 'none';
}

export function webCommandSuggestions(value = '') {
  const token = commandToken(value);
  if (token == null) return [];
  return WEB_COMMANDS.filter((command) => !token
    || `${command.name} ${command.description}`.toLowerCase().includes(token));
}

export function parseWebCommand(value = '') {
  const match = /^\/([a-z0-9_-]+)\s*$/i.exec(String(value || '').trim());
  if (!match) return null;
  const name = String(match[1] || '').toLowerCase();
  const command = WEB_COMMANDS.find((item) => item.name === name);
  return command ? { name: command.name, command: command.name } : null;
}

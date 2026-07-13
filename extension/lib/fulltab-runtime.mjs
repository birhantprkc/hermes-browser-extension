import { normalizeBrowserRuntimeEvent, reduceAssistantStreamText } from './runtime-events.mjs';

export function parseSseBlock(block = '') {
  const event = { type: 'message', data: '' };
  for (const line of String(block).split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) event.type = line.slice(6).trim();
    if (line.startsWith('data:')) event.data += `${line.slice(5).trim()}\n`;
  }
  event.data = event.data.trim();
  try { event.json = event.data ? JSON.parse(event.data) : {}; } catch { event.json = {}; }
  return event;
}

export async function readHermesSse(response, { onAssistant, onTool, onRuntime, onRun, signal } = {}) {
  if (!response?.body) throw new Error('Hermes stream did not return a response body.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let stream = { text: '', finalized: false };

  const processBlock = (block) => {
    const event = parseSseBlock(block);
    const data = event.json || {};
    if (event.type === 'run.started') onRun?.(data.run_id || data.runId || '');
    if (['assistant.delta', 'assistant.completed', 'run.completed'].includes(event.type)) {
      stream = reduceAssistantStreamText(stream, { type: event.type, data });
      onAssistant?.(stream.text, { finalized: stream.finalized, event: event.type, data });
    }
    if (event.type.startsWith('tool.') || event.type === 'hermes.tool.progress') {
      onTool?.(normalizeBrowserRuntimeEvent({ type: event.type, data }));
    }
    if (event.type === 'run.completed') onRuntime?.(data);
    if (event.type === 'error') throw new Error(data.message || event.data || 'Hermes stream error');
  };

  while (true) {
    if (signal?.aborted) {
      await reader.cancel().catch(() => {});
      throw new DOMException('Hermes turn stopped', 'AbortError');
    }
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || '';
    for (const block of blocks) if (block.trim()) processBlock(block);
  }
  buffer += decoder.decode();
  if (buffer.trim()) processBlock(buffer);
  return stream.text;
}

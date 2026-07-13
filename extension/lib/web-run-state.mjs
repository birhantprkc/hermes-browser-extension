function contentText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => typeof part === 'string' ? part : part?.text || '').join('');
  if (content && typeof content === 'object') return String(content.text || content.content || '');
  return '';
}

export function isRenderableAssistantMessage(message = {}) {
  const text = contentText(message.content).trim();
  return Boolean(text || /MEDIA:\S+/i.test(text));
}

/**
 * Keep the visual image-generation run in the transcript while Hermes performs
 * follow-up work (for example vision validation) before the final media lands.
 */
export function shouldPreserveImageGenerationRun(liveRun = {}, nextActivity = {}) {
  const nextName = String(nextActivity?.rawName || nextActivity?.toolName || '').trim();
  return Boolean(liveRun?.image && !/image_generate/i.test(nextName));
}

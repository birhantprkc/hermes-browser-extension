import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MODEL_REASONING_EFFORTS,
  modelRuntimeCapabilities,
  modelRuntimeOptionsPayload,
  normalizeModelRuntimeOptions,
} from '../extension/lib/model-runtime-options.mjs';

test('Hermes Web exposes all five reasoning effort levels and preserves the selected value', () => {
  assert.deepEqual(
    MODEL_REASONING_EFFORTS.map((option) => option.label),
    ['Minimal', 'Low', 'Medium', 'High', 'Max'],
  );
  assert.equal(normalizeModelRuntimeOptions({ reasoningEffort: 'high' }).reasoningEffort, 'high');
  assert.equal(normalizeModelRuntimeOptions({ reasoningEffort: 'max' }).reasoningEffort, 'xhigh');
  assert.deepEqual(modelRuntimeOptionsPayload({ reasoningEffort: 'max', thinkingEnabled: true, fastMode: true }), {
    reasoning: { enabled: true, effort: 'xhigh' },
    fast: true,
    service_tier: 'priority',
  });
});

test('model runtime controls respect explicitly unavailable capabilities without hiding unknown-provider controls', () => {
  assert.deepEqual(modelRuntimeCapabilities({ reasoning: false, fast: false }), {
    reasoning: false,
    thinking: false,
    fast: false,
  });
  assert.deepEqual(modelRuntimeCapabilities({}), {
    reasoning: true,
    thinking: true,
    fast: true,
  });
});

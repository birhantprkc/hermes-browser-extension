import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDashboardWsUrl,
  classifyGatewayFrame,
  createGatewayClient,
  WS_METHODS,
} from '../extension/lib/gateway-ws.mjs';

class FakeWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this._listeners = {};
    FakeWebSocket.last = this;
  }

  addEventListener(type, fn) {
    (this._listeners[type] ||= []).push(fn);
  }

  send(data) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3;
    this._emit('close', { code: 1000 });
  }

  _emit(type, event) {
    for (const fn of this._listeners[type] || []) fn(event);
  }

  _open() {
    this.readyState = 1;
    this._emit('open', {});
  }

  _message(obj) {
    this._emit('message', { data: typeof obj === 'string' ? obj : JSON.stringify(obj) });
  }
}

test('buildDashboardWsUrl upgrades scheme, keeps path prefix, encodes ticket', () => {
  assert.equal(
    buildDashboardWsUrl('https://kurokami.example.ts.net', 'abc/123'),
    'wss://kurokami.example.ts.net/api/ws?ticket=abc%2F123',
  );
  assert.equal(
    buildDashboardWsUrl('http://127.0.0.1:8642/hermes/', 't1'),
    'ws://127.0.0.1:8642/hermes/api/ws?ticket=t1',
  );
});

test('WS_METHODS exposes Desktop/TUI session steering instead of slash-command injection', () => {
  assert.equal(WS_METHODS.sessionSteer, 'session.steer');
  assert.equal(WS_METHODS.promptSubmit, 'prompt.submit');
});

test('classifyGatewayFrame distinguishes responses, errors, events, and noise', () => {
  assert.deepEqual(classifyGatewayFrame('{"id":1,"result":{"ok":true}}'), {
    kind: 'response',
    id: 1,
    result: { ok: true },
  });
  assert.equal(classifyGatewayFrame('{"id":2,"error":{"message":"nope"}}').kind, 'error');
  assert.deepEqual(
    classifyGatewayFrame({ method: 'event', params: { type: 'message.delta', session_id: 's1', payload: { text: 'hi' } } }),
    { kind: 'event', type: 'message.delta', sessionId: 's1', payload: { text: 'hi' } },
  );
  assert.equal(classifyGatewayFrame('not json').kind, 'ignore');
  assert.equal(classifyGatewayFrame({ method: 'event', params: {} }).kind, 'ignore');
});

test('gateway client connects, resolves a matching RPC response, and dispatches events', async () => {
  const client = createGatewayClient({ WebSocketImpl: FakeWebSocket });
  const connecting = client.connect('wss://host/api/ws?ticket=t');
  let connected = false;
  connecting.then(() => { connected = true; });
  FakeWebSocket.last._open();
  await Promise.resolve();
  assert.equal(connected, false, 'socket open alone must not prove Hermes gateway identity');
  FakeWebSocket.last._message({ method: 'event', params: { type: 'gateway.ready', payload: { protocol: 1 } } });
  assert.deepEqual(await connecting, { protocol: 1 });
  assert.deepEqual(client.readyPayload, { protocol: 1 });

  const deltas = [];
  client.on('message.delta', (event) => deltas.push(event.payload.text));

  const pending = client.request('prompt.submit', { session_id: 's1', text: 'hello' });
  const sent = JSON.parse(FakeWebSocket.last.sent.at(-1));
  assert.equal(sent.jsonrpc, '2.0');
  assert.equal(sent.method, 'prompt.submit');
  assert.deepEqual(sent.params, { session_id: 's1', text: 'hello' });

  FakeWebSocket.last._message({ method: 'event', params: { type: 'message.delta', session_id: 's1', payload: { text: 'hel' } } });
  FakeWebSocket.last._message({ id: sent.id, result: { status: 'streaming' } });

  assert.deepEqual(await pending, { status: 'streaming' });
  assert.deepEqual(deltas, ['hel']);
});

test('gateway client rejects a socket that never sends gateway.ready', async () => {
  const client = createGatewayClient({ WebSocketImpl: FakeWebSocket, readyTimeoutMs: 10 });
  const connecting = client.connect('wss://host/api/ws?ticket=t');
  FakeWebSocket.last._open();
  await assert.rejects(connecting, /gateway\.ready.*timed out/i);
  assert.equal(client.readyState, -1);
});

test('gateway client ignores a late close from a timed-out socket during reconnect', async () => {
  const sockets = [];
  class DelayedCloseSocket extends FakeWebSocket {
    constructor(url) {
      super(url);
      sockets.push(this);
    }

    close() {
      this.readyState = 3;
    }

    flushClose() {
      this._emit('close', { code: 1006, reason: '' });
    }
  }

  const client = createGatewayClient({ WebSocketImpl: DelayedCloseSocket, readyTimeoutMs: 10 });
  await assert.rejects(client.connect('wss://host/api/ws?ticket=old'), /gateway\.ready.*timed out/i);

  const reconnecting = client.connect('wss://host/api/ws?ticket=new');
  sockets[0].flushClose();
  sockets[1]._open();
  sockets[1]._message({ method: 'event', params: { type: 'gateway.ready', payload: { skin: 'hermes' } } });
  await assert.doesNotReject(reconnecting);
  assert.equal(client.readyState, 1);
});

test('gateway client rejects pending requests when the socket closes', async () => {
  const client = createGatewayClient({ WebSocketImpl: FakeWebSocket });
  const connecting = client.connect('wss://host/api/ws?ticket=t');
  FakeWebSocket.last._open();
  FakeWebSocket.last._message({ method: 'event', params: { type: 'gateway.ready', payload: {} } });
  await connecting;

  const pending = client.request('session.list', {});
  FakeWebSocket.last.close();
  await assert.rejects(pending, /closed/i);
});

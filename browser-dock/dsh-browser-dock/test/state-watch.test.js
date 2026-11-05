import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const waitFor = async (predicate, message) => {
  const deadline = Date.now() + 2_000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.fail(message);
};

const responseDouble = () => {
  const response = new EventEmitter();
  response.writableEnded = false;
  response.destroyed = false;
  response.headers = new Map();
  response.chunks = [];
  response.setHeader = (name, value) => response.headers.set(name, value);
  response.write = (value) => {
    response.chunks.push(Buffer.isBuffer(value) ? value : String(value));
    return true;
  };
  response.end = (value) => {
    if (value !== undefined) response.chunks.push(Buffer.isBuffer(value) ? value : String(value));
    response.writableEnded = true;
    response.emit('close');
  };
  return response;
};

const postJson = async (handler, value) => {
  const request = new EventEmitter();
  request.method = 'POST';
  request.destroy = () => {};
  const response = responseDouble();
  const pending = handler(request, response);
  request.emit('data', Buffer.from(JSON.stringify(value)));
  request.emit('end');
  await pending;
  return response;
};

test('state watcher publishes atomic state replacements to the SSE client', async (t) => {
  const dshHome = await mkdtemp(join(tmpdir(), 'browser-dock-watch-'));
  const runtimeDir = join(dshHome, 'browser-dock');
  await mkdir(runtimeDir, { recursive: true });
  await writeFile(join(runtimeDir, 'state.json'), JSON.stringify({ active: false, revision: 0 }));
  const previousHome = process.env.DSH_HOME;
  process.env.DSH_HOME = dshHome;
  t.after(async () => {
    if (previousHome === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = previousHome;
    await rm(dshHome, { recursive: true, force: true });
  });

  const runtime = await import(new URL(`../src/index.js?watch-test=${Date.now()}`, import.meta.url));
  const routes = new Map();
  const cleanups = [];
  const effect = (factory) => {
    const cleanup = factory();
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  };
  const ctx = {
    effect,
    inject(_dependencies, callback) {
      callback({ effect, webServer: { register(route) { routes.set(route.path, route); return () => routes.delete(route.path); } } });
    },
  };
  runtime.apply(ctx);
  t.after(() => cleanups.reverse().forEach((cleanup) => cleanup()));

  const request = new EventEmitter();
  request.method = 'GET';
  const response = responseDouble();

  await routes.get('/browser-dock/events').handler(request, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers.get('Content-Type'), 'text/event-stream; charset=utf-8');

  const temporary = join(runtimeDir, 'state.json.tmp');
  await writeFile(temporary, JSON.stringify({ active: true, revision: 1 }));
  await rename(temporary, join(runtimeDir, 'state.json'));
  await waitFor(() => response.chunks.some((chunk) => chunk.includes('event: state')), 'state replacement did not reach SSE client');
  request.emit('close');

  const stateResponse = responseDouble();
  await routes.get('/browser-dock/state').handler({ method: 'GET' }, stateResponse);
  const state = JSON.parse(stateResponse.chunks.join(''));
  assert.match(state.token, /^[a-f0-9]{64}$/);
  const tokenFile = join(runtimeDir, 'control-token');
  if (process.platform !== 'win32') assert.equal((await stat(tokenFile)).mode & 0o777, 0o600);
  assert.equal(await readFile(tokenFile, 'utf8'), state.token);

  const frameBytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  await writeFile(join(runtimeDir, 'frame-1.jpg'), frameBytes);
  const frameRequest = { method: 'GET', url: '/browser-dock/frame?revision=1' };
  const frameResponse = responseDouble();
  const frameClosed = new Promise((resolve) => frameResponse.once('close', resolve));
  await routes.get('/browser-dock/frame').handler(frameRequest, frameResponse);
  await frameClosed;
  assert.equal(frameResponse.statusCode, 200);
  assert.equal(frameResponse.headers.get('Content-Length'), frameBytes.length);
  assert.deepEqual(Buffer.concat(frameResponse.chunks.map((chunk) => Buffer.from(chunk))), frameBytes);

  const commandFile = join(runtimeDir, 'command.json');
  const denied = await postJson(routes.get('/browser-dock/control').handler, { action: 'bind', sessionId: 'session-1' });
  assert.equal(denied.statusCode, 403);
  await assert.rejects(stat(commandFile), { code: 'ENOENT' });

  const accepted = await postJson(routes.get('/browser-dock/control').handler, { token: state.token, action: 'bind', sessionId: 'session-1' });
  assert.equal(accepted.statusCode, 202);
  const command = JSON.parse(await readFile(commandFile, 'utf8'));
  assert.equal(command.action, 'bind');
  assert.equal(command.sessionId, 'session-1');
  assert.equal('token' in command, false);

  cleanups.reverse().forEach((cleanup) => cleanup());
  cleanups.length = 0;
  await assert.rejects(stat(tokenFile), { code: 'ENOENT' });
});

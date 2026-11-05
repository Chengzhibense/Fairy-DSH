import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'lib', 'client.js'), 'utf8');
const canonicalClientDiagnostics = fs.readFileSync(path.resolve(root, '..', '..', 'fairy-contracts', 'client-diagnostics.cjs'), 'utf8');

function embeddedClientDiagnostics(value) {
  const begin = '// DSH_FAIRY_CLIENT_DIAGNOSTICS_BEGIN\n';
  const end = '// DSH_FAIRY_CLIENT_DIAGNOSTICS_END';
  const start = value.indexOf(begin);
  const finish = value.indexOf(end, start + begin.length);
  assert.ok(start >= 0 && finish > start, 'embedded client diagnostics boundaries should exist');
  return value.slice(start + begin.length, finish);
}

function loadDefinition() {
  let definition;
  const attributes = new Set();
  const document = {
    documentElement: {
      hasAttribute: (name) => attributes.has(name),
      setAttribute: (name) => attributes.add(name),
      removeAttribute: (name) => attributes.delete(name),
    },
  };
  vm.runInNewContext(source, {
    window: { __ModuleLoader__: { load(value) { definition = value; } } },
    document,
    console,
    setTimeout,
    clearTimeout,
  });
  return definition;
}

test('embeds the canonical client diagnostics byte for byte', () => {
  assert.equal(embeddedClientDiagnostics(source), canonicalClientDiagnostics);
});

test('owns only the official fresh-session startup flow', () => {
  assert.match(source, /ctx\.uiWorkspace\.clearMain\(\)/);
  assert.match(source, /uiWorkspace\.startSession\(\)/);
  assert.match(source, /workspace\.phase !== 'ready'/);
  assert.match(source, /session\.phase !== 'ready'/);
  assert.match(source, /sessions\.list\.getSnapshot\(\)/);
  assert.match(source, /workspaces\.list\.subscribe\(startWhenReady\)/);
  assert.match(source, /sessions\.list\.subscribe\(startWhenReady\)/);
  assert.match(source, /function createWorkspaceStarter\(uiWorkspace, workspaces, sessions\)/);
  assert.match(source, /starter\.startOrSubscribe\(\)/);
  assert.match(source, /return \(\) => starter\.dispose\(\)/);
  assert.match(source, /inject: \['sessions', 'workspaces', 'uiWorkspace'\]/);
  assert.doesNotMatch(source, /fairy-visual|fairy-voice|localStorage|sessionStorage|querySelector/);
  assert.doesNotMatch(source, /sessions\.clear\(\)/);
  assert.match(source, /STARTUP_RESET_ATTR/);
  assert.match(source, /root\.hasAttribute\(STARTUP_RESET_ATTR\)/);
  assert.match(source, /root\.setAttribute\(STARTUP_RESET_ATTR, 'true'\)/);
  assert.match(source, /root\.removeAttribute\(STARTUP_RESET_ATTR\)/);
  assert.match(source, /DSH_FAIRY_LOG/);
  assert.match(source, /session\.clear-restored/);
  assert.match(source, /session\.start-fresh/);
});

test('releases a restored conversation and starts exactly one fresh session', () => {
  const definition = loadDefinition();
  const plugin = definition.factory();
  const cleanups = [];
  let clears = 0;
  let starts = 0;
  let subscribedSessions = 0;
  let subscribedWorkspaces = 0;
  const ctx = {
    sessions: {
      list: {
        getSnapshot: () => ({
          phase: 'ready',
          byId: { s1: { id: 's1', blank: false, retainedBy: { mainView: 1 } } },
        }),
        subscribe() { subscribedSessions += 1; return () => {}; },
      },
    },
    workspaces: {
      list: {
        getSnapshot: () => ({ phase: 'ready' }),
        subscribe() { subscribedWorkspaces += 1; return () => {}; },
      },
    },
    uiWorkspace: {
      mainReference: { sessionId: 's1' },
      clearMain() { clears += 1; },
      startSession() { starts += 1; },
    },
    effect(factory) { cleanups.push(factory()); },
  };
  plugin.apply(ctx);
  plugin.apply(ctx);
  // resetStartupSelection clears once, and the starter releases a restored
  // non-blank session once more before opening the fresh blank.
  assert.ok(clears >= 1);
  assert.equal(starts, 1);
  assert.equal(subscribedSessions, 0);
  assert.equal(subscribedWorkspaces, 0);
  cleanups.forEach((cleanup) => cleanup());
});

test('keeps a blank restored session as the fresh-document state', () => {
  const definition = loadDefinition();
  const plugin = definition.factory();
  let starts = 0;
  const ctx = {
    sessions: {
      list: {
        getSnapshot: () => ({
          phase: 'ready',
          byId: { s1: { id: 's1', blank: true, retainedBy: { mainView: 1 } } },
        }),
        subscribe() { return () => {}; },
      },
    },
    workspaces: {
      list: { getSnapshot: () => ({ phase: 'ready' }), subscribe() { return () => {}; } },
    },
    uiWorkspace: {
      mainReference: { sessionId: 's1' },
      clearMain() {},
      startSession() { starts += 1; },
    },
    effect(factory) { factory(); },
  };
  plugin.apply(ctx);
  assert.equal(starts, 0);
});

test('degrades cleanly when a desktop bridge omits clearMain and startSession', () => {
  const definition = loadDefinition();
  const plugin = definition.factory();
  const ctx = {
    sessions: {
      list: {
        getSnapshot: () => ({
          phase: 'ready',
          byId: { s1: { id: 's1', blank: false, retainedBy: { mainView: 1 } } },
        }),
        subscribe() { return () => {}; },
      },
    },
    workspaces: {
      list: { getSnapshot: () => ({ phase: 'ready' }), subscribe() { return () => {}; } },
    },
    uiWorkspace: { mainReference: { sessionId: 's1' } },
    effect(factory) { factory(); },
  };
  assert.doesNotThrow(() => plugin.apply(ctx));
});

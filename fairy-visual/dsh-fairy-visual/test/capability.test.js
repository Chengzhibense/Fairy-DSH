import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// A file: URL's .pathname is POSIX-shaped ('/C:/...'), which `join` then turns
// into 'C:\C:\...' on Windows. Convert to a real platform path instead.
const sourceRoot = fileURLToPath(new URL('../src/client/', import.meta.url));
const adapterSource = readFileSync(new URL('../src/client/dom-adapter.js', import.meta.url), 'utf8');
const require = createRequire(import.meta.url);
const clientDomContracts = require('../../../fairy-contracts/client-dom.cjs');

function node(entries = {}) {
  return {
    querySelector(selector) { return entries[selector] ?? null; },
    querySelectorAll() { return []; },
  };
}

function loadAdapter(documentRef, warnings = []) {
  const module = { exports: {} };
  vm.runInNewContext(adapterSource, {
    module,
    exports: module.exports,
    document: documentRef,
    console: { warn: (message) => warnings.push(message) },
    require: (id) => {
      assert.equal(id, '../../../../fairy-contracts/client-dom.cjs');
      return clientDomContracts;
    },
  }, { filename: 'dom-adapter.js' });
  return module.exports;
}

function mountedDocument({ phase = 'active' } = {}) {
  const input = node();
  const card = node({ '[data-input-scroll]': input });
  const seat = node({ '[data-composer-card="true"]': card });
  const activePhase = phase === 'active' ? node() : null;
  const heroPhase = phase === 'hero' ? node() : null;
  const conversation = node({
    '[data-composer-seat]': seat,
    '[data-phase="active"]': activePhase,
    '[data-phase="hero"]': heroPhase,
    '[data-phase]': activePhase || heroPhase,
    '[data-conversation-scroll]': phase === 'active' ? node() : null,
  });
  return node({
    'body > #root > [data-slot="root"]': node(),
    '[data-slot="shell.overlay"]': node(),
    '[data-slot="conversation"]': conversation,
    '[data-slot="sidebar"]': node(),
    '[data-slot="conversation.session.header"]': phase === 'active' ? node() : null,
  });
}

test('declares one capability level for every diagnosed capability', () => {
  const adapter = loadAdapter(mountedDocument());
  const classified = new Set(Object.values(adapter.CAPABILITY_LEVEL).flat());
  assert.deepEqual([...classified].sort(), Object.keys(adapter.CAPABILITY_DEFINITIONS).sort());
  assert.deepEqual(Array.from(adapter.CAPABILITY_LEVEL.CRITICAL), ['rootSlot', 'shellOverlay', 'conversation']);
  assert.ok(adapter.CAPABILITY_LEVEL.CORE.includes('phaseSurface'));
});

test('reports no required capability missing in an active official surface', () => {
  const warnings = [];
  const adapter = loadAdapter(mountedDocument(), warnings);
  const missing = adapter.reportMissingCapabilities(undefined, { report: (message) => warnings.push(message) });
  const status = adapter.getCapabilityStatus();

  assert.equal(missing.some(({ required }) => required), false);
  assert.deepEqual(Array.from(status.missing), []);
  assert.ok(status.timestamp > 0);
  assert.ok(status.degraded.includes('sessionTree'));
  assert.match(warnings.join('\n'), /degraded official capability \[ENHANCEMENT\]: sessionTree/);
});

test('does not flag active-only capabilities during a valid Hero phase', () => {
  const adapter = loadAdapter(mountedDocument({ phase: 'hero' }));
  const snapshot = adapter.capabilitySnapshot();
  const missing = adapter.reportMissingCapabilities();

  assert.equal(snapshot.sessionHeader.applicable, false);
  assert.equal(snapshot.sessionHeader.available, true);
  assert.equal(snapshot.conversationScroll.applicable, false);
  assert.equal(snapshot.conversationScroll.available, true);
  assert.equal(snapshot.undoControl.applicable, false);
  assert.equal(snapshot.redoControl.applicable, false);
  assert.equal(snapshot.modelSelection.applicable, false);
  assert.equal(missing.some(({ name }) => ['sessionHeader', 'conversationScroll', 'undoControl', 'redoControl', 'modelSelection'].includes(name)), false);
});

test('records and reports missing required capabilities after an explicit diagnostic pass', () => {
  const warnings = [];
  const emptyDocument = node();
  const adapter = loadAdapter(emptyDocument, warnings);
  adapter.resetCapabilityStatus();

  const missing = adapter.reportMissingCapabilities(undefined, {
    allowBeforeMount: true,
    includeOptional: true,
    report: (message) => warnings.push(message),
  });
  const status = adapter.getCapabilityStatus();

  assert.equal(adapter.rootSlot(), null);
  assert.ok(missing.some(({ name }) => name === 'rootSlot'));
  assert.ok(status.missing.includes('rootSlot'));
  assert.ok(status.degraded.includes('toBottom'));
  assert.match(warnings.join('\n'), /missing required official capability \[CRITICAL\]: rootSlot/);
});

test('keeps official data-slot and data-phase queries inside dom-adapter', () => {
  const directOfficialQuery = /querySelector(?:All)?\([^\n]*(?:data-slot|data-phase|data-composer|data-conversation-scroll|data-input-scroll|data-chat-flow)/;
  const files = readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'dom-adapter.js')
    .map((entry) => join(sourceRoot, entry.name));

  const offenders = files.filter((file) => directOfficialQuery.test(readFileSync(file, 'utf8')));
  assert.deepEqual(offenders, []);
});

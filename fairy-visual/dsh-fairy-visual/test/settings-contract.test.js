import assert from 'node:assert/strict';
import test from 'node:test';
import { FairyVisualSettings } from '../src/index.js';
import { createSettingsProjection, createSettingsScope } from '../src/client/settings-bridge.js';

function schemaFields() {
  const json = FairyVisualSettings.toJSON();
  const object = json.refs[String(json.uid)];
  return Object.fromEntries(Object.entries(object.dict).map(([name, ref]) => [name, json.refs[String(ref)]]));
}

function fakeContext(namespace, initial = {}) {
  let view = {
    writable: true,
    namespaces: [{ ns: namespace, revision: 1, value: initial }],
  };
  const writes = [];
  const listeners = new Map();
  const ctx = {
    remote: {
      settings: {
        async describe() {
          return { ok: true, value: view };
        },
        async mutate(ns, ops, revision) {
          writes.push({ ns, ops, revision });
          const row = view.namespaces.find((entry) => entry.ns === ns);
          let value = row.value;
          for (const op of ops) {
            const next = structuredClone(value);
            let target = next;
            for (const key of op.path.slice(0, -1)) target = target[key] ??= {};
            target[op.path.at(-1)] = op.value;
            value = next;
          }
          const nextRow = { ...row, revision: row.revision + 1, value };
          view = { ...view, namespaces: view.namespaces.map((entry) => entry.ns === ns ? nextRow : entry) };
          return { ok: true, value: nextRow };
        },
      },
      $on(name, listener) {
        listeners.set(name, listener);
        return () => listeners.delete(name);
      },
    },
    on(name, listener) {
      listeners.set(name, listener);
      return () => listeners.delete(name);
    },
  };
  return { ctx, writes, listeners };
}

test('Visual Config exposes every user preference as a volatile field', () => {
  const fields = schemaFields();
  assert.deepEqual(Object.keys(fields), [
    'version',
    'enabled',
    'theme',
    'mascotVisible',
    'mascotScale',
    'mascotAnimationSpeed',
    'powerMode',
    'composerDockHeight',
    'identity',
  ]);
  assert.equal(fields.version.meta.volatile, undefined);
  for (const field of ['enabled', 'theme', 'mascotVisible', 'mascotScale', 'mascotAnimationSpeed', 'powerMode', 'composerDockHeight']) {
    assert.equal(fields[field].meta.volatile, true, `${field} must be volatile`);
  }
  assert.equal(fields.enabled.meta.default, true);
  assert.equal(fields.theme.meta.default, 'dark');
  assert.equal(fields.composerDockHeight.meta.default, 132);
});

test('remote settings scope preserves snapshot, subscription, write, and disposer shape', async () => {
  const namespace = 'fairy-visual';
  const { ctx, writes, listeners } = fakeContext(namespace, { enabled: false, theme: 'dark', identity: { mode: 'ling' } });
  const settings = createSettingsScope(ctx, { namespace, defaults: { enabled: false, theme: 'dark' } });
  const identity = createSettingsProjection(settings, {
    path: ['identity'],
    defaults: { mode: 'ling', customName: '', secondAssistant: '', household: [] },
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(settings.getSnapshot().value.enabled, false);
  assert.equal(identity.getSnapshot().value.mode, 'ling');

  let updates = 0;
  const dispose = settings.subscribe(() => { updates += 1; });
  await settings.set('theme', 'light');
  assert.equal(writes[0].ns, namespace);
  assert.deepEqual(writes[0].ops, [{ op: 'set', path: ['theme'], value: 'light' }]);
  assert.equal(writes[0].revision, 1);
  assert.equal(updates, 1);
  assert.equal(settings.getSnapshot().value.theme, 'light');

  await identity.set('mode', 'zhe');
  assert.deepEqual(writes[1].ops, [{ op: 'set', path: ['identity', 'mode'], value: 'zhe' }]);
  assert.equal(identity.getSnapshot().value.mode, 'zhe');
  assert.ok(listeners.has('settings/document-updated'));
  const beforeDispose = updates;
  dispose();
  await settings.set('theme', 'dark');
  assert.equal(updates, beforeDispose);
  settings.dispose();
  identity.dispose();
  assert.equal(listeners.size, 0);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { FAIRY_VISUAL_SETTINGS_NAMESPACE } from 'dsh-fairy-contracts';
import { FairyVisualSettings } from '../src/index.js';

const namespace = FAIRY_VISUAL_SETTINGS_NAMESPACE;

function schemaJson() {
  return FairyVisualSettings.toJSON();
}

function schemaFields() {
  const json = schemaJson();
  const object = json.refs[String(json.uid)];
  return Object.fromEntries(Object.entries(object.dict).map(([name, ref]) => {
    const node = json.refs[String(ref)];
    return [name, node];
  }));
}

// dsh-settings >= 0.1.2 no longer exports a namespace factory: register() takes
// the raw namespace string and validates it against /^[a-z][a-z0-9-]*$/ itself.
// Guard the shape the host now depends on instead of the removed wrapper.
const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/;

test('settings namespace is a register-compatible plain string', () => {
  assert.equal(namespace, 'fairy-visual');
  assert.equal(typeof namespace, 'string');
  assert.match(namespace, NAMESPACE_PATTERN);
  assert.doesNotMatch('FairyVisual', NAMESPACE_PATTERN);
  assert.doesNotMatch('fairy_visual', NAMESPACE_PATTERN);
});

test('Visual settings schema keeps the registered fields, defaults, and bounds', () => {
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
  ]);
  assert.equal(fields.version.meta.default, 2);
  assert.equal(fields.enabled.meta.default, false);
  assert.equal(fields.theme.meta.default, 'dark');
  assert.equal(fields.mascotVisible.meta.default, true);
  assert.deepEqual(
    { step: fields.mascotScale.meta.step, min: fields.mascotScale.meta.min, max: fields.mascotScale.meta.max, default: fields.mascotScale.meta.default },
    { step: 0.01, min: 0.55, max: 1, default: 1 },
  );
  assert.equal(fields.mascotAnimationSpeed.meta.default, 1);
  assert.equal(fields.powerMode.meta.default, 'normal');
  assert.deepEqual(
    { step: fields.composerDockHeight.meta.step, min: fields.composerDockHeight.meta.min, max: fields.composerDockHeight.meta.max, default: fields.composerDockHeight.meta.default },
    { step: 1, min: 132, max: 420, default: 132 },
  );
});

test('client settings bridge preserves snapshot, subscription, write, and disposer shape', async () => {
  let value = { enabled: false, theme: 'dark' };
  const listeners = new Set();
  const bridge = {
    bind({ namespace: boundNamespace }) {
      assert.equal(boundNamespace, namespace);
      return {
        getSnapshot: () => ({ value }),
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        set(field, next) {
          value = { ...value, [field]: next };
          listeners.forEach((listener) => listener());
          return Promise.resolve();
        },
      };
    },
  };
  const settings = bridge.bind({ namespace });
  assert.equal(typeof settings.getSnapshot, 'function');
  assert.equal(typeof settings.subscribe, 'function');
  assert.equal(typeof settings.set, 'function');
  assert.deepEqual(settings.getSnapshot().value, { enabled: false, theme: 'dark' });

  let updates = 0;
  const dispose = settings.subscribe(() => { updates += 1; });
  assert.equal(typeof dispose, 'function');
  await settings.set('theme', 'light');
  assert.equal(updates, 1);
  assert.equal(settings.getSnapshot().value.theme, 'light');
  dispose();
  await settings.set('theme', 'dark');
  assert.equal(updates, 1);
});

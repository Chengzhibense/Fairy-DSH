import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { migrateVisualSettings, normalizeSetting } = require('../src/client/settings-normalizer.cjs');

test('migrates a fresh or incomplete profile to the canonical v2 defaults', () => {
  assert.deepEqual(migrateVisualSettings({}), {
    version: 2,
    enabled: true,
    theme: 'dark',
    mascotVisible: true,
    mascotScale: 1,
    mascotAnimationSpeed: 1,
    powerMode: 'normal',
    composerDockHeight: 132,
  });
});

test('accepts legacy aliases and maps illegal values to legal boundaries/stops', () => {
  const migrated = migrateVisualSettings({ eyeSize: 2, animationSpeed: 1.4, theme: 'neon', powerMode: 'eco', composerDockHeight: 999 });
  assert.equal(migrated.mascotScale, 1);
  assert.equal(migrated.mascotAnimationSpeed, 1.5);
  assert.equal(migrated.theme, 'dark');
  assert.equal(migrated.powerMode, 'normal');
  assert.equal(migrated.composerDockHeight, 420);
  assert.equal(migrateVisualSettings({ animationSpeed: 0.1 }).mascotAnimationSpeed, 0.7);
  assert.equal(migrateVisualSettings({ animationSpeed: 1.2 }).mascotAnimationSpeed, 1);
  assert.equal(migrateVisualSettings({ animationSpeed: '' }).mascotAnimationSpeed, 1);
  assert.equal(migrateVisualSettings({ mascotScale: '' }).mascotScale, 1);
});

test('normalizes individual writes against the existing canonical profile', () => {
  const current = migrateVisualSettings({ mascotAnimationSpeed: 1, composerDockHeight: 200 });
  assert.equal(normalizeSetting('mascotAnimationSpeed', 0.82, current), 0.7);
  assert.equal(normalizeSetting('composerDockHeight', 200.6, current), 201);
  assert.equal(normalizeSetting('theme', 'light', current), 'light');
});

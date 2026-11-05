'use strict';

const SETTINGS_VERSION = 2;
const SPEED_STOPS = Object.freeze([0.7, 1, 1.5]);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const nearest = (value, values) => values.reduce((best, item) => Math.abs(item - value) < Math.abs(best - value) ? item : best, values[0]);
const toFiniteNumber = (value) => {
  if (value === '' || value == null || (typeof value === 'string' && value.trim() === '')) return NaN;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

function migrateVisualSettings(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const legacyScale = source.mascotScale ?? source.eyeSize ?? source.mascotSize;
  const rawSpeed = source.mascotAnimationSpeed ?? source.animationSpeed;
  const numericSpeed = toFiniteNumber(rawSpeed);
  const numericScale = toFiniteNumber(legacyScale);
  const numericComposerHeight = toFiniteNumber(source.composerDockHeight);
  return {
    version: SETTINGS_VERSION,
    enabled: typeof source.enabled === 'boolean' ? source.enabled : true,
    theme: source.theme === 'light' ? 'light' : 'dark',
    mascotVisible: typeof source.mascotVisible === 'boolean' ? source.mascotVisible : true,
    mascotScale: Number.isFinite(numericScale) ? clamp(numericScale, 0.55, 1) : 1,
    mascotAnimationSpeed: Number.isFinite(numericSpeed) ? nearest(numericSpeed, SPEED_STOPS) : 1,
    powerMode: source.powerMode === 'low-power' ? 'low-power' : 'normal',
    composerDockHeight: Number.isFinite(numericComposerHeight) ? Math.round(clamp(numericComposerHeight, 132, 420)) : 132,
  };
}

function normalizeSetting(field, value, current = {}) {
  return migrateVisualSettings({ ...current, [field]: value })[field];
}

module.exports = { SETTINGS_VERSION, SPEED_STOPS, migrateVisualSettings, normalizeSetting };

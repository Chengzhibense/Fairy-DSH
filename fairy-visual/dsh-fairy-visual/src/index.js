import z from '@deepseek-ai/schemastery';
import {
  FAIRY_IDENTITY_SETTINGS_NAMESPACE,
  FAIRY_VISUAL_SETTINGS_NAMESPACE,
  FAIRY_VISUAL_SETTINGS_VERSION,
} from 'dsh-fairy-contracts';
import { createFairyDiagnostics } from 'dsh-fairy-contracts/diagnostics';

// dsh-settings >= 0.1.2 removed the namespace-factory wrapper: the host now
// registers a namespace by passing its string name straight to
// `settings.register()`, which validates it against /^[a-z][a-z0-9-]*$/. The
// contract constants are already plain strings ('fairy-visual',
// 'fairy-identity'), so no wrapper is needed.
const diagnostics = createFairyDiagnostics('dsh-fairy-visual');

export const FairyVisualSettings = z.object({
  version: z.number().step(1).default(FAIRY_VISUAL_SETTINGS_VERSION),
  enabled: z.boolean().default(false),
  theme: z.union(['dark', 'light']).default('dark'),
  mascotVisible: z.boolean().default(true),
  mascotScale: z.number().step(0.01).min(0.55).max(1).default(1),
  mascotAnimationSpeed: z.union([z.const(0.7), z.const(1), z.const(1.5)]).default(1),
  powerMode: z.union(['normal', 'low-power']).default('normal'),
  composerDockHeight: z.number().step(1).min(132).max(420).default(132),
});

export const FairyIdentitySettings = z.object({
  mode: z.union(['ling', 'zhe', 'custom']).default('ling'),
  customName: z.string().default(''),
  secondAssistant: z.string().default(''),
  household: z.array(z.string()).default([]),
});

export const name = 'dsh-fairy-visual';

export function apply(ctx) {
  return diagnostics.guard('apply', () => {
    ctx.inject(['settings'], (settingsCtx) => {
      settingsCtx.settings.register(FAIRY_VISUAL_SETTINGS_NAMESPACE, FairyVisualSettings);
      settingsCtx.settings.register(FAIRY_IDENTITY_SETTINGS_NAMESPACE, FairyIdentitySettings);
    });
  }, { surface: 'host' });
}

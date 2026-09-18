# Fork notice

This repository is a fork of [Chengzhibense/Fairy-DSH](https://github.com/Chengzhibense/Fairy-DSH),
maintained at [junyuyuan/Fairy-DSH](https://github.com/junyuyuan/Fairy-DSH).

Original work: Copyright 2026 Chengzhibense, licensed under the Apache License,
Version 2.0 (see `LICENSE` and `NOTICE`). This fork keeps that license and does
not relicense any upstream or third-party content.

## Purpose of the fork

The upstream suite targets DSH `0.1.1-rc.2`. This fork retargets **only the
visual side** (`dsh-fairy-visual`) to a current DSH runtime and fixes defects
reported against it. The persona/runtime side (`fairy-voice`, the
`.agent-presets/fairy/runtime/*` runtime, and world knowledge corpora) is
deliberately out of scope: upstream never published those runtime files, so they
cannot be carried forward from this repository.

## Changes from upstream

Base commit: `d639887` ("Fix GitHub Actions pnpm cache paths").

| Area | Change |
| --- | --- |
| `src/index.js` | Dropped the removed `settingsNamespace()` import from `@deepseek-ai/dsh-settings`; the host now registers plain namespace strings, which the package validates itself. Without this the host entry threw `SyntaxError: does not provide an export named 'settingsNamespace'` and the plugin could not load. |
| `src/client/index.js` | Content-fade mask now targets the `[data-chat-flow]` transcript surface instead of `[data-conversation-scroll]`, which also contains the composer seat. Masking the composer punched the input text out through the radial gradient (reported as "input text invisible in dark theme"). The scroll container is kept as a fallback. |
| `src/client/style.js` | Restores interaction, stacking and on-screen placement for the question, approval and plan-review popups, which render inside `conversation.composer` and therefore inherited the dock's `pointer-events:none` and `z-index:1`, and were pushed off-screen by the dock's off-viewport bottom edge. |
| `package.json` | Dependencies retargeted to `@deepseek-ai/dsh-settings@^0.1.5-rc.2` and `@deepseek-ai/schemastery@^3.18.2`; `tsdown` pinned to `0.22.14`. Added a `build` alias script. |
| `scripts/sync-build.mjs` | Replaces the POSIX `cp`/`mv` artifact chain in the `bundle` script, which fails on Windows (`'cp' is not recognized`). |
| `test/contract.test.js` | Read helper normalizes CRLF to LF so newline-sensitive source assertions hold on Windows. Assertions updated for the two source changes above. |
| `test/capability.test.js` | Uses `fileURLToPath` instead of a `file:` URL's `.pathname`, which produced `C:\C:\...` paths on Windows. |
| `test/settings-contract.test.js` | Guards the register-compatible namespace string instead of the removed factory. |

## Upstream issues addressed

- Upstream issue #1 — host `settingsNamespace` import failure and the unavailable
  model selector caused by it.
- Upstream issue #2 — item 4, "input text invisible in dark theme" (upstream
  reported it as not located; the mask surface above is the cause), and item 3,
  the clipped, click-through question/approval popups.
- Upstream issue #3 — Windows test failures from missing build scripts, an
  undeclared dependency, and a `D:\D:\...` path concatenation.

## Verification

`npm test` passes 131/131 on Windows with Node 24. The test suite is
`node --test` based and needs no browser.

## Trademarks

Fairy, DSH, DeepSeek, Zenless Zone Zero, and related names and marks are not
licensed by this fork. See `TRADEMARKS.md`. No game text, official assets, or
private corpora are distributed here.

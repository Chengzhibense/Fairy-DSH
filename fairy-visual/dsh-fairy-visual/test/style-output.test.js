import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { injectStyles } from '../src/client/style.js';

test('emits the approved scoped CSS byte sequence', () => {
  const originalDocument = globalThis.document;
  const nodes = new Map();
  globalThis.document = {
    getElementById: (id) => nodes.get(id) || null,
    createElement: () => ({ id: '', textContent: '', setAttribute() {} }),
    head: { appendChild: (node) => nodes.set(node.id, node) },
    documentElement: null,
  };

  try {
    injectStyles();
    const [style] = nodes.values();
    assert.equal(Buffer.byteLength(style.textContent), 135456);
    assert.equal(createHash('sha256').update(style.textContent).digest('hex'), '61ff87873bdaadd5b53496bf733b926c5e500723595c474a767047fcd5b43da6');
    injectStyles();
    assert.equal(nodes.size, 1);
  } finally {
    globalThis.document = originalDocument;
  }
});

test('restores interaction and on-screen placement for the composer-slot popups', () => {
  const originalDocument = globalThis.document;
  const nodes = new Map();
  globalThis.document = {
    getElementById: (id) => nodes.get(id) || null,
    createElement: () => ({ id: '', textContent: '', setAttribute() {} }),
    head: { appendChild: (node) => nodes.set(node.id, node) },
    documentElement: null,
  };

  try {
    injectStyles();
    const [style] = nodes.values();
    const { textContent } = style;
    // The question, approval and plan-review surfaces render inside the
    // conversation.composer slot, so each must be covered by the fix.
    for (const marker of ['[data-question-key]', '[data-approval-key]', '[data-plan-review-key]']) {
      assert.ok(textContent.includes(marker), `popup fix must cover ${marker}`);
    }
    // Interaction: the dock is pointer-events:none and z-index:1, so the popups
    // need their own stacking and hit-testing to stay usable.
    assert.match(textContent, /\[data-question-key\][^{]*\{[^}]*pointer-events:auto!important/);
    assert.match(textContent, /\[data-question-key\][^{]*\{[^}]*z-index:60!important/);
    assert.match(textContent, /\[data-question-key\][^{]*\{[^}]*position:fixed!important/);
    // Placement: keep the card inside the viewport instead of letting the dock's
    // off-screen bottom edge push it out.
    assert.match(textContent, /\[data-question-key\][^{]*\{[^}]*max-height:min\(70vh,calc\(100dvh - 180px\)\)!important/);
    // Contrast: the official "recommended" badge pairs --dsw-alias-button-info-fill
    // over --dsw-specific-sidebar-nav-item-active-accent. The HDD theme redefines that
    // sidebar accent to a blue of nearly identical luminance to the stock info fill,
    // collapsing the ratio to ~1.01 and hiding the label. The popup scope must rebind
    // the accent and force a white label.
    assert.match(textContent, /\[data-question-key\][^{]*\{[^}]*--dsw-specific-sidebar-nav-item-active-accent:#14304d!important/);
    assert.match(textContent, /\[class\*="_badge"\]\{background:var\(--dsw-specific-sidebar-nav-item-active-accent\)!important;color:#fff!important\}/);
  } finally {
    globalThis.document = originalDocument;
  }
});

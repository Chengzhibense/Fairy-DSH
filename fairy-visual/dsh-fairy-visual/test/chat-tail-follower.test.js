import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/client/chat-tail-follower.js', import.meta.url), 'utf8');

class FakeNode {
  constructor({ following = false, scrollHeight = 800, clientHeight = 500 } = {}) {
    this.following = following;
    this.scrollHeight = scrollHeight;
    this.clientHeight = clientHeight;
    this.scrollTop = 120;
    this.isConnected = true;
  }

  closest(selector) {
    if (selector === '[data-chat-following-tail]') return this.following ? this : null;
    if (selector === '[data-conversation-scroll]') return this.scroll;
    return null;
  }
}

function loadFollower() {
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports }, { filename: 'chat-tail-follower.js' });
  return module.exports;
}

test('lands a following transcript on its floor as streamed content grows', () => {
  const flow = new FakeNode({ following: true });
  const scroll = new FakeNode();
  flow.scroll = scroll;
  const { createChatTailFollower } = loadFollower();
  const follower = createChatTailFollower({
    getFlowNodes: () => [flow],
    requestFrame: () => 1,
    cancelFrame() {},
    isDisposed: () => false,
  });

  follower.flush();

  assert.equal(scroll.scrollTop, 300);
});

test('never overrides a reader who left the official follow-tail state', () => {
  const flow = new FakeNode({ following: false });
  const scroll = new FakeNode();
  flow.scroll = scroll;
  const { createChatTailFollower } = loadFollower();
  const follower = createChatTailFollower({
    getFlowNodes: () => [flow],
    requestFrame: () => 1,
    cancelFrame() {},
    isDisposed: () => false,
  });

  follower.flush();

  assert.equal(scroll.scrollTop, 120);
});

test('can bridge a transient official follow-state loss after an interaction card', () => {
  const flow = new FakeNode({ following: false });
  const scroll = new FakeNode({ scrollHeight: 900, clientHeight: 500 });
  flow.scroll = scroll;
  const { createChatTailFollower } = loadFollower();
  const follower = createChatTailFollower({
    getFlowNodes: () => [flow],
    shouldFollow: () => true,
    requestFrame: () => 1,
    cancelFrame() {},
    isDisposed: () => false,
  });

  follower.flush();

  assert.equal(scroll.scrollTop, 400);
});

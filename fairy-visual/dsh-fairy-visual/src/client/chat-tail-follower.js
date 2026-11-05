const FOLLOWING_ATTR = 'data-chat-following-tail';
const SCROLL_SELECTOR = '[data-conversation-scroll]';

function createChatTailFollower({
  getFlowNodes,
  shouldFollow,
  requestFrame,
  cancelFrame,
  isDisposed,
}) {
  let frame = 0;
  let resizeObserver = null;
  let resizeNodes = new Set();

  const bindResizeNodes = () => {
    if (typeof ResizeObserver !== 'function') return;
    const next = new Set((getFlowNodes?.() || []).filter(Boolean));
    if (next.size === resizeNodes.size && [...next].every((node) => resizeNodes.has(node))) return;
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(schedule);
    next.forEach((node) => resizeObserver.observe(node));
    resizeNodes = next;
  };

  const sync = () => {
    frame = 0;
    bindResizeNodes();
    (getFlowNodes?.() || []).forEach((flow) => {
      if (!flow?.isConnected) return;
      if (!flow.closest?.(`[${FOLLOWING_ATTR}]`) && !shouldFollow?.()) return;
      const scroll = flow.closest?.(SCROLL_SELECTOR);
      if (!scroll?.isConnected) return;
      const bottom = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      if (Math.abs(scroll.scrollTop - bottom) > 1) scroll.scrollTop = bottom;
    });
  };

  function schedule() {
    if (!frame && !isDisposed?.()) frame = requestFrame(sync);
  }

  const flush = () => {
    if (frame) cancelFrame(frame);
    frame = 0;
    sync();
  };

  const clear = () => {
    if (frame) cancelFrame(frame);
    frame = 0;
    resizeObserver?.disconnect();
    resizeObserver = null;
    resizeNodes.clear();
  };

  return { schedule, flush, clear };
}

module.exports = { createChatTailFollower };

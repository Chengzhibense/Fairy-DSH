const COMPOSER_ATTR = 'data-dsh-fairy-composer-dock';
const {
  OFFICIAL_ATTRIBUTES,
  conversationScrolls,
  chatFlows,
  inputScroll,
  sessionAgentPresetLabel,
  sessionHeaderActions,
} = require('./dom-adapter.js');
const { attachmentSlot, attachmentRail, attachmentRailHeight, attachmentDockHeight } = require('./composer-attachments.js');
const { createLifecycleScope, claimSingleton } = require('./lifecycle.js');
const { createManagedMutationObserver, getDomObserverManager } = require('./dom-observer-manager.js');
const { placeNativeControlMarkers } = require('./composer-native-controls.js');
const {
  createMaterialLayer,
  syncMaterialLayer: syncMaterialLayerModule,
  clearHoleContactGeometry,
} = require('./composer-material-layer.js');
const {
  captureWorkspaceTemplate: captureWorkspaceTemplateModule,
  ensureWorkspaceProjection: ensureWorkspaceProjectionModule,
  syncWorkspaceProjectionMode: syncWorkspaceProjectionModeModule,
} = require('./composer-workspace-projection.js');
const { createInsetSynchronizer } = require('./composer-inset-synchronizer.js');
const { createChatContentAnchor } = require('./chat-content-anchor.js');
const { createChatTailFollower } = require('./chat-tail-follower.js');
const { createToBottomPositioner } = require('./to-bottom-positioner.js');
const { createComposerSessionResolver } = require('./composer-session-rebinding.js');
const { createResizeController, HEIGHT_MIN, HEIGHT_MAX, CONTENT_MIN } = require('./composer-resize-controller.js');
const { setControllerSetting, settingError } = require('./settings-write.js');
const { createMascotScaleBase } = require('./mascot-scale-control.js');
const { createMascotAnimationSpeedBase } = require('./mascot-animation-speed-control.js');
const MARKER_ATTRS = [
  COMPOSER_ATTR,
  'data-dsh-fairy-composer-row',
  'data-dsh-fairy-composer-tools',
  'data-dsh-fairy-composer-trailing',
  'data-dsh-fairy-composer-accessory',
  'data-dsh-fairy-composer-attachments',
  'data-dsh-fairy-composer-attachments-active',
  'data-dsh-fairy-composer-bar-root',
  'data-dsh-fairy-composer-bar-host',
  'data-dsh-fairy-composer-stack',
  'data-dsh-fairy-composer-workspace',
  'data-dsh-fairy-composer-chrome',
  'data-dsh-fairy-composer-send-control',
  'data-dsh-fairy-composer-context-control',
  'data-dsh-fairy-composer-output-control',
  'data-dsh-fairy-composer-voice-control',
  'data-dsh-fairy-composer-model-control',
  'data-dsh-fairy-composer-native-model-control',
  'data-dsh-fairy-composer-reasoning-control',
  'data-dsh-fairy-composer-command-control',
  'data-dsh-fairy-composer-access-control',
  'data-dsh-fairy-composer-workspace-control',
  'data-dsh-fairy-composer-mode-control',
  'data-dsh-fairy-model-menu-open',
  'data-dsh-fairy-composer-question',
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function clearMarker(node, name) {
  if (node?.isConnected) node.removeAttribute(name);
}

function clearMarkerTree(root, name) {
  clearMarker(root, name);
  root?.querySelectorAll?.(`[${name}]`).forEach((node) => clearMarker(node, name));
}

// Lifecycle: composer dock
// Owner: document
// Contract: lifecycle-ownership.json#owners[subsystem=composer dock]
// Remount: claimSingleton(composer-dock); restoreSeat clears node-local bindings.
function mountComposerDock(controller) {
  const lifecycle = claimSingleton(document, 'composer-dock', createLifecycleScope('composer-dock'));
  const domObserverManager = getDomObserverManager(document);
  let disposed = false;
  let frame = 0;
  let structureFrame = 0;
  let observer = null;
  let headerObserver = null;
  let resizeObserver = null;
  let conversation = null;
  let surface = null;
  let observedHeaderActions = null;
  let seat = null;
  let card = null;
  let questionPanel = null;
  let questionResizeObserver = null;
  let pendingQuestionExit = false;
  let resumeTail = false;
  let resumeTailScrollNodes = new Set();
  let clearControls = () => {};
  let mascotScaleBase = null;
  let mascotAnimationSpeedBase = null;
  let previousSeatStyle = null;
  let height = HEIGHT_MIN;
  let workspaceTemplate = null;
  let workspaceProjection = null;
  let materialLayer = null;
  let pendingPersistedHeight = null;
  const layoutFrameKey = {};
  const structureFrameKey = {};
  const sessionResolver = createComposerSessionResolver(document);

  const snapshot = () => controller.getSnapshot?.() || { settings: {} };
  const enabled = () => Boolean(snapshot().settings?.enabled);
  const readHeight = () => clamp(Number(snapshot().settings?.composerDockHeight) || HEIGHT_MIN, HEIGHT_MIN, HEIGHT_MAX);
  const effectiveHeight = () => pendingPersistedHeight ?? readHeight();
  const maximumDockHeight = () => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    return Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, viewportHeight - CONTENT_MIN));
  };
  const renderedHeight = () => {
    if (questionPanel?.isConnected) {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const naturalHeight = Math.max(questionPanel.getBoundingClientRect().height, questionPanel.scrollHeight);
      return clamp(Math.ceil(naturalHeight), HEIGHT_MIN, Math.max(HEIGHT_MIN, viewportHeight));
    }
    return attachmentDockHeight(
      height,
      attachmentRailHeight(attachmentSlot(card)),
      HEIGHT_MIN,
      maximumDockHeight(),
    );
  };

  const schedule = () => {
    if (!frame && !disposed) frame = domObserverManager.scheduleFrame(layoutFrameKey, sync);
  };
  const scheduleStructure = () => {
    if (!structureFrame && !disposed) structureFrame = domObserverManager.scheduleFrame(structureFrameKey, bind);
  };
  const clearResumeTail = () => {
    resumeTail = false;
    pendingQuestionExit = false;
    resumeTailScrollNodes.forEach((node) => {
      node.removeEventListener('wheel', onResumeTailWheel);
      node.removeEventListener('touchstart', clearResumeTail);
    });
    resumeTailScrollNodes.clear();
    document.removeEventListener('keydown', onResumeTailKeydown, true);
  };
  const resumeTailFollow = () => {
    clearResumeTail();
    resumeTail = true;
    resumeTailScrollNodes = new Set(conversationScrolls(conversation).filter(Boolean));
    resumeTailScrollNodes.forEach((node) => {
      node.addEventListener('wheel', onResumeTailWheel, { passive: true });
      node.addEventListener('touchstart', clearResumeTail, { passive: true });
    });
    document.addEventListener('keydown', onResumeTailKeydown, true);
    schedule();
  };
  function onResumeTailWheel(event) {
    if (event.deltaY < 0) clearResumeTail();
  }
  function onResumeTailKeydown(event) {
    if (!['ArrowUp', 'PageUp', 'Home'].includes(event.key)) return;
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
    if (target?.closest?.('[data-conversation-scroll]')) clearResumeTail();
  }
  const bindHeaderObserver = () => {
    const nextHeaderActions = sessionHeaderActions(conversation);
    if (nextHeaderActions === observedHeaderActions) return;
    headerObserver?.disconnect();
    observedHeaderActions = nextHeaderActions;
    if (headerObserver && observedHeaderActions) {
      headerObserver.observe(observedHeaderActions, { characterData: true, subtree: true });
    }
  };

  // Lifecycle: short-content anchoring, scroll insets and to-bottom position
  // Owner: current composer conversation and seat
  // Contract: lifecycle-ownership.json#owners[subsystem=short-content anchoring, scroll insets and to-bottom position]
  const insetSynchronizer = createInsetSynchronizer({
    getScrollNodes: () => conversationScrolls(conversation),
    getHeight: renderedHeight,
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
    isDisposed: () => disposed,
  });
  const clearScrollInsets = () => insetSynchronizer.clear();
  const scheduleScrollInsets = () => insetSynchronizer.schedule();
  const flushScrollInsets = () => insetSynchronizer.flush();
  const contentAnchor = createChatContentAnchor({
    getFlowNodes: () => chatFlows(conversation),
    getComposerNode: () => seat,
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
    isDisposed: () => disposed,
  });
  const tailFollower = createChatTailFollower({
    getFlowNodes: () => chatFlows(conversation),
    shouldFollow: () => resumeTail,
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
    isDisposed: () => disposed,
  });
  const toBottomPositioner = createToBottomPositioner({
    getScrollNodes: () => conversationScrolls(conversation),
    getComposerNode: () => seat,
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
    isDisposed: () => disposed,
  });

  const removeMaterialLayer = () => {
    materialLayer?.remove();
    clearHoleContactGeometry(card);
    materialLayer = null;
  };

  const ensureMaterialLayer = () => {
    if (!card) return null;
    if (materialLayer?.isConnected && materialLayer.parentElement === card) return materialLayer;
    removeMaterialLayer();
    materialLayer = createMaterialLayer(card);
    return materialLayer;
  };

  const syncMaterialLayer = () => {
    const layer = ensureMaterialLayer();
    syncMaterialLayerModule(layer, inputScroll(card), [attachmentRail(attachmentSlot(card))]);
  };

  const restoreSeat = ({ clearWorkspaceTemplate = false } = {}) => {
    contentAnchor.clear();
    clearResumeTail();
    tailFollower.clear();
    toBottomPositioner.clear();
    // The scroll inset belongs to the previous conversation binding, not to
    // the current seat reference. A mode/phase transition can clear `seat`
    // first; cleanup must still remove every Fairy-owned inline inset before
    // normal mode regains layout ownership.
    clearScrollInsets();
    // Disabling HDD or replacing the official seat must release the observer
    // before dropping the surface reference. Otherwise a detached surface can
    // keep the dock lifecycle alive and continue scheduling layout work.
    resizeObserver?.disconnect();
    resizeObserver = null;
    conversation = null;
    surface = null;
    questionResizeObserver?.disconnect();
    questionResizeObserver = null;
    if (clearWorkspaceTemplate) workspaceTemplate = null;
    if (!seat) return;
    workspaceProjection?.remove();
    workspaceProjection = null;
    removeMaterialLayer();
    removeMascotScaleBase();
    removeMascotAnimationSpeedBase();
    removeLegacyVoiceDensityMarker();
    seat.querySelector('[data-dsh-fairy-composer-stack="true"]')?.removeAttribute('data-dsh-fairy-model-menu-open');
    // Clear the complete owned marker tree. A replacement can leave a marker
    // on a descendant that is no longer reachable through the current owner
    // disposer, so clearing only the seat itself is insufficient.
    MARKER_ATTRS.forEach((name) => clearMarkerTree(seat, name));
    clearControls();
    if (previousSeatStyle) {
      Object.entries(previousSeatStyle).forEach(([name, { value, priority }]) => {
        if (value) seat.style.setProperty(name, value, priority);
        else seat.style.removeProperty(name);
      });
    } else {
      ['left', 'width', 'height', 'bottom', 'top', 'position', 'z-index', '--dsh-fairy-composer-height'].forEach((name) => seat.style.removeProperty(name));
    }
    previousSeatStyle = null;
    removeHandle();
    seat = null;
    card = null;
    questionPanel = null;
  };

  const resizeController = createResizeController({
    isEnabled: enabled,
    getSeat: () => seat,
    getHeight: () => height,
    getRenderedHeight: renderedHeight,
    setHeight: (next) => { height = next; },
    schedule,
    scheduleInsets: scheduleScrollInsets,
    flushInsets: flushScrollInsets,
    persistHeight: (next) => {
      pendingPersistedHeight = next;
      const result = setControllerSetting(controller, 'composerDockHeight', next);
      result.then(() => {
        // A successful setter can resolve before its store notification. Keep
        // the committed geometry authoritative until the snapshot catches up.
        if (readHeight() === next) pendingPersistedHeight = null;
        schedule();
      }).catch((error) => {
        settingError('composerDockHeight', error);
        pendingPersistedHeight = null;
        schedule();
      });
      return result;
    },
  });
  const removeHandle = () => resizeController.unmount();
  const createHandle = () => resizeController.mount();
  const updateHandle = () => resizeController.updateHandle();
  const removeLegacyMascotScaleControl = () => {
    seat?.querySelectorAll?.('[data-dsh-fairy-mascot-scale-control="true"]').forEach((node) => {
      if (!node.closest?.('[data-dsh-fairy-mascot-scale-base="true"]')) node.remove();
    });
  };
  const removeMascotScaleBase = () => {
    mascotScaleBase?.dispose?.();
    mascotScaleBase = null;
    seat?.querySelectorAll?.('[data-dsh-fairy-mascot-scale-base="true"]').forEach((node) => node.remove());
  };
  const removeMascotAnimationSpeedBase = () => {
    mascotAnimationSpeedBase?.dispose?.();
    mascotAnimationSpeedBase = null;
    seat?.querySelectorAll?.('[data-dsh-fairy-mascot-animation-speed-base="true"]').forEach((node) => node.remove());
  };
  const ensureMascotAnimationSpeedBase = () => {
    if (!card) return;
    if (mascotAnimationSpeedBase?.node?.isConnected && mascotAnimationSpeedBase.host === card) return;
    removeMascotAnimationSpeedBase();
    mascotAnimationSpeedBase = createMascotAnimationSpeedBase(card, document, {
      initialRate: Number(snapshot().settings?.mascotAnimationSpeed) || 1,
      onChange: (rate) => {
        const result = setControllerSetting(controller, 'mascotAnimationSpeed', rate);
        result.catch((error) => settingError('mascotAnimationSpeed', error));
        return result;
      },
    });
  };
  const ensureMascotScaleBase = () => {
    if (!card) return;
    if (mascotScaleBase?.node?.isConnected && mascotScaleBase.host === card) return;
    removeMascotScaleBase();
    mascotScaleBase = createMascotScaleBase(card, controller);
  };
  const removeLegacyVoiceDensityMarker = (node = card) => {
    node?.removeAttribute?.('data-dsh-fairy-composer-voice-density');
  };
  // The native reasoning menu lives inside the composer stack, while the
  // resize handle is a sibling with a higher local z-index. Reflect the menu's
  // open state on the stack so CSS can raise the complete interactive context
  // without relying on relationship selectors or changing closed-state geometry.
  const syncReasoningMenuLayer = () => {
    const stack = seat?.querySelector('[data-dsh-fairy-composer-stack="true"]');
    if (!stack) return;
    const open = Boolean(stack.querySelector('[data-dsh-fairy-composer-reasoning-control="true"] [role="menu"], [data-dsh-fairy-composer-reasoning-control="true"] [aria-expanded="true"]'));
    if (open) {
      stack.setAttribute('data-dsh-fairy-model-menu-open', 'true');
      seat.setAttribute('data-dsh-fairy-model-menu-open', 'true');
    } else {
      stack.removeAttribute('data-dsh-fairy-model-menu-open');
      seat.removeAttribute('data-dsh-fairy-model-menu-open');
    }
  };

  const captureWorkspaceTemplate = (workspaceRow) => {
    const nextTemplate = captureWorkspaceTemplateModule(workspaceRow);
    if (nextTemplate) workspaceTemplate = nextTemplate;
  };

  const ensureWorkspaceProjection = (stack, workspaceRow) => {
    workspaceProjection = ensureWorkspaceProjectionModule(stack, workspaceRow, workspaceTemplate, workspaceProjection);
    syncWorkspaceProjectionModeModule(workspaceProjection, sessionAgentPresetLabel(conversation));
  };

  function sync() {
    frame = 0;
    if (!enabled()) {
      // The official workspace row can be absent for the first HDD remount
      // frame. Keep its last verified template through a user mode round trip
      // so ensureWorkspaceProjection() can preserve the persistent folder and
      // model-mode row until the official control is available again.
      restoreSeat();
      return;
    }
    const resolvedSession = sessionResolver.resolve();
    const currentConversation = resolvedSession.conversation;
    const currentSeat = resolvedSession.seat;
    const currentCard = resolvedSession.card;
    if (!currentConversation || !currentSeat || !currentCard) {
      // Preserve the last committed surface through the runtime's intentional
      // phase gap, but dispose it immediately if the official node was
      // actually detached. This avoids a visual blink without retaining an
      // orphaned owner after a real replacement.
      if (seat && (!seat.isConnected || !card?.isConnected)) restoreSeat();
      contentAnchor.clear();
      return;
    }
    if (currentConversation !== conversation || currentSeat !== seat) {
      restoreSeat();
      conversation = currentConversation;
      seat = currentSeat;
      card = currentCard;
      removeLegacyVoiceDensityMarker();
      previousSeatStyle = {};
      ['left', 'width', 'height', 'bottom', 'top', 'position', 'z-index', '--dsh-fairy-composer-height'].forEach((name) => {
        previousSeatStyle[name] = {
          value: seat.style.getPropertyValue(name),
          priority: seat.style.getPropertyPriority(name),
        };
      });
      seat.setAttribute(COMPOSER_ATTR, 'true');
      clearControls = placeNativeControlMarkers(card);
      createHandle();
    } else if (currentCard !== card) {
      clearControls();
      workspaceProjection?.remove();
      workspaceProjection = null;
      removeMaterialLayer();
      removeMascotScaleBase();
      removeMascotAnimationSpeedBase();
      removeLegacyVoiceDensityMarker(card);
      card = currentCard;
      removeLegacyVoiceDensityMarker();
      clearControls = placeNativeControlMarkers(card);
    }
    const previousQuestionPanel = questionPanel;
    const nextQuestionPanel = seat?.querySelector('[data-question-key]') || null;
    if (nextQuestionPanel !== questionPanel) {
      questionResizeObserver?.disconnect();
      questionResizeObserver = null;
      questionPanel = nextQuestionPanel;
      if (questionPanel) seat.setAttribute('data-dsh-fairy-composer-question', 'true');
      else seat.removeAttribute('data-dsh-fairy-composer-question');
      if (questionPanel && typeof ResizeObserver === 'function') {
        questionResizeObserver = new ResizeObserver(schedule);
        questionResizeObserver.observe(questionPanel);
      }
      if (previousQuestionPanel && !questionPanel) pendingQuestionExit = true;
    }
    const lifecycle = snapshot().lifecycle;
    if (pendingQuestionExit && lifecycle === 'running') {
      pendingQuestionExit = false;
      resumeTailFollow();
    } else if (pendingQuestionExit && lifecycle === 'completed') {
      pendingQuestionExit = false;
    }
    removeLegacyMascotScaleControl();
    ensureMascotScaleBase();
    ensureMascotAnimationSpeedBase();
    const workspaceRow = seat?.querySelector('[data-dsh-fairy-composer-workspace="true"]:not([data-dsh-fairy-composer-workspace-projection="true"])');
    if (workspaceRow) captureWorkspaceTemplate(workspaceRow);
    const stack = seat?.querySelector('[data-dsh-fairy-composer-stack="true"]');
    ensureWorkspaceProjection(stack, workspaceRow);
    syncReasoningMenuLayer();
    const currentSurface = resolvedSession.surface;
    if (currentSurface !== surface) {
      resizeObserver?.disconnect();
      surface = currentSurface;
      if (surface && typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(surface);
      }
    }
    const rect = surface?.getBoundingClientRect();
    if (!rect || rect.width < 1 || rect.height < 1) return;
    // The resize controller owns the live drag state. The persisted setting is
    // intentionally written only on pointerup; reading it while dragging would
    // overwrite every pointer move on the next RAF.
    if (!resizeController.dragging) height = readHeight();
    if (!resizeController.dragging && pendingPersistedHeight !== null) height = pendingPersistedHeight;
    seat.style.setProperty('left', `${Math.round(rect.left)}px`);
    seat.style.setProperty('width', `${Math.round(rect.width)}px`);
    const displayHeight = renderedHeight();
    seat.style.setProperty('height', `${Math.round(displayHeight)}px`);
    seat.style.setProperty('--dsh-fairy-composer-height', `${Math.round(displayHeight)}px`);
    syncMaterialLayer();
    insetSynchronizer.flush();
    contentAnchor.flush();
    tailFollower.flush();
    if (resumeTail && lifecycle === 'completed') clearResumeTail();
    toBottomPositioner.flush();
    updateHandle();
  }

  function bind() {
    structureFrame = 0;
    if (!enabled()) return;
    const nextSession = sessionResolver.resolve();
    const nextConversation = nextSession.conversation;
    const nextSurface = nextSession.surface;
    if (nextConversation !== conversation || nextSurface !== surface) {
      resizeObserver?.disconnect();
      conversation = nextConversation;
      surface = nextSurface;
      if (conversation && typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(schedule);
        if (surface) resizeObserver.observe(surface);
      }
    }
    bindHeaderObserver();
    if (seat && card) {
      clearControls();
      clearControls = placeNativeControlMarkers(card);
      removeLegacyMascotScaleControl();
    }
    const workspaceRow = seat?.querySelector('[data-dsh-fairy-composer-workspace="true"]:not([data-dsh-fairy-composer-workspace-projection="true"])');
    if (workspaceRow) captureWorkspaceTemplate(workspaceRow);
    ensureWorkspaceProjection(seat?.querySelector('[data-dsh-fairy-composer-stack="true"]'), workspaceRow);
    syncReasoningMenuLayer();
    contentAnchor.schedule();
    tailFollower.schedule();
    toBottomPositioner.schedule();
    schedule();
  }

  const mutationObserver = createManagedMutationObserver((records) => {
    const headerPresetChanged = (record) => {
      const actions = sessionHeaderActions(conversation);
      const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
      return Boolean(actions && target && (target === actions || actions.contains?.(target)));
    };
    const composerStructureChanged = (record) => {
      if (record.type === 'characterData') return headerPresetChanged(record);
      if (record.type === 'childList') {
        const target = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
        if (target?.closest?.(`[${OFFICIAL_ATTRIBUTES.composerSeat}]`)) return true;
        // A session switch can replace the complete conversation subtree. In
        // that case the mutation target is outside the old composer seat, so
        // inspect the inserted or removed subtree before retaining references.
        return [...record.addedNodes, ...record.removedNodes].some((node) => node.nodeType === 1
          && (node.matches?.(`[${OFFICIAL_ATTRIBUTES.composerSeat}]`) || node.querySelector?.(`[${OFFICIAL_ATTRIBUTES.composerSeat}]`)));
      }
      return record.attributeName === OFFICIAL_ATTRIBUTES.phase || record.attributeName === OFFICIAL_ATTRIBUTES.composerSeat || record.attributeName === OFFICIAL_ATTRIBUTES.slot || record.attributeName === 'aria-expanded';
    };
    if (records.some((record) => headerPresetChanged(record) || composerStructureChanged(record))) scheduleStructure();
    if (records.some((record) => record.attributeName === 'aria-expanded' || record.type === 'childList')) syncReasoningMenuLayer();
  });
  observer = mutationObserver;
  mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: [OFFICIAL_ATTRIBUTES.phase, OFFICIAL_ATTRIBUTES.composerSeat, OFFICIAL_ATTRIBUTES.slot, 'aria-expanded'] });
  headerObserver = createManagedMutationObserver(scheduleStructure);
  lifecycle.add(() => mutationObserver.disconnect(), 'composer-dock:structure-observer');
  window.addEventListener('resize', schedule, { passive: true });
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  lifecycle.add(() => window.removeEventListener('resize', schedule), 'composer-dock:window-resize');
  lifecycle.add(() => window.visualViewport?.removeEventListener('resize', schedule), 'composer-dock:viewport-resize');
  const off = controller.subscribe?.(() => {
    height = effectiveHeight();
    if (pendingPersistedHeight !== null && readHeight() === pendingPersistedHeight) pendingPersistedHeight = null;
    schedule();
  });
  bind();

  const cleanup = () => {
    disposed = true;
    domObserverManager.cancelFrame(layoutFrameKey);
    domObserverManager.cancelFrame(structureFrameKey);
    observer?.disconnect();
    headerObserver?.disconnect();
    observedHeaderActions = null;
    resizeObserver?.disconnect();
    off?.();
    window.removeEventListener('resize', schedule);
    window.visualViewport?.removeEventListener('resize', schedule);
    tailFollower.clear();
    toBottomPositioner.clear();
    restoreSeat({ clearWorkspaceTemplate: true });
  };
  lifecycle.add(cleanup, 'composer-dock:dispose');
  return () => lifecycle.dispose();
}

module.exports = { mountComposerDock };

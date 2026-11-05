const React = require('react');
const { jsx, jsxs } = require('react/jsx-runtime');
const { MODE_ATTR, HERO_PLACEHOLDERS } = require('./constants.js');
const { createManagedMutationObserver } = require('./dom-observer-manager.js');
const { mutationTouchesSurface, mutationTouchesHeroSurface } = require('./surface-utils.js');
const { OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES, sidebar, conversation, phase, composerSeat, composerCard, composerTextarea, composerPlaceholder, rightSidebarToggle } = require('./dom-adapter.js');

let heroMaskInstanceSeed = 0;

function placeholderSnapshot(node) {
  return {
    placeholder: node?.getAttribute('placeholder') ?? null,
    dataPlaceholder: node?.getAttribute('data-placeholder') ?? null,
    ariaLabel: node?.getAttribute('aria-label') ?? null,
  };
}

function currentPlaceholder(node) {
  return node?.getAttribute('placeholder') ?? node?.getAttribute('data-placeholder') ?? null;
}

function applyPlaceholder(node, text) {
  if (!node) return;
  if (node.tagName === 'TEXTAREA') {
    node.setAttribute('placeholder', text);
    return;
  }
  node.setAttribute('data-placeholder', text);
  node.setAttribute('aria-label', text);
}

function restorePlaceholder(node, snapshot) {
  if (!node || !snapshot) return;
  for (const [name, value] of [
    ['placeholder', snapshot.placeholder],
    ['data-placeholder', snapshot.dataPlaceholder],
    ['aria-label', snapshot.ariaLabel],
  ]) {
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  }
}

function install(_lifecycle = null, { Toggle, useController }) {
    // Lifecycle: hero projection, active placeholder and hero toggle
    // Owner: React slot host
    // Contract: lifecycle-ownership.json#owners[subsystem=hero projection, active placeholder and hero toggle]
    function HeroToggleHost({ controller }) {
      const hostRef = React.useRef(null);
      const [positioned, setPositioned] = React.useState(false);
      const { sessionId } = useController(controller);

      React.useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        let frame = 0;
        let hero = null;
        let resizeObserver = null;
        let structureObserver = null;
        let conversationObserver = null;
        let observedConversation = null;

        const sync = () => {
          // A conversation header owns the single active-session toggle. The
          // fixed hero toggle is only a fallback while the new-session hero
          // surface is the visible conversation phase.
          frame = 0;
          bindConversation();
          const conversationSurface = conversation(document);
          const nextHero = phase(conversationSurface, 'active')
            ? null
            : phase(conversationSurface, 'hero');
          if (nextHero !== hero) {
            resizeObserver?.disconnect();
            hero = nextHero;
            if (typeof ResizeObserver === 'function' && hero) {
              resizeObserver = new ResizeObserver(schedule);
              resizeObserver.observe(hero);
            }
          }
          if (!hero) {
            setPositioned(false);
            host.style.removeProperty('left');
            host.style.removeProperty('top');
            return;
          }
          const rect = hero.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) {
            setPositioned(false);
            return;
          }
          const rightControl = rightSidebarToggle(document);
          const rightControlRect = rightControl?.getBoundingClientRect?.();
          let left = rect.right - host.offsetWidth - 28;
          if (rightControlRect && rightControlRect.width > 0
            && rightControlRect.left < rect.right - 28
            && rightControlRect.bottom > rect.top + 4
            && rightControlRect.top < rect.top + 44) {
            left = Math.min(left, rightControlRect.left - host.offsetWidth - 8);
          }
          host.style.left = Math.round(Math.max(rect.left + 8, left)) + 'px';
          // Match the active conversation header: 44px header minus the
          // 28px toggle gives the same 8px top inset used by its flex layout.
          host.style.top = Math.round(rect.top + 8) + 'px';
          setPositioned(true);
        };
        const schedule = () => {
          if (!frame) frame = requestAnimationFrame(sync);
        };

        const bindConversation = () => {
          const conversationNode = conversation(document);
          if (conversationNode === observedConversation) return;
          conversationObserver?.disconnect();
          conversationObserver = null;
          observedConversation = conversationNode;
          if (typeof MutationObserver === 'function' && conversationNode) {
            conversationObserver = createManagedMutationObserver((records) => {
              const phaseSelector = `${OFFICIAL_SELECTORS.phaseHero}, ${OFFICIAL_SELECTORS.phaseActive}`;
              if (mutationTouchesSurface(records, phaseSelector, [OFFICIAL_ATTRIBUTES.phase])) schedule();
            });
            conversationObserver.observe(conversationNode, { childList: true, subtree: true, attributes: true, attributeFilter: [OFFICIAL_ATTRIBUTES.phase] });
          }
        };

        if (typeof MutationObserver === 'function' && document.body) {
          // The official runtime can replace the whole conversation surface.
          // Keep this observer at the stable body boundary and rebind the
          // narrower phase observer before calculating the next position.
          structureObserver = createManagedMutationObserver((records) => {
            if (mutationTouchesHeroSurface(records, OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES)) schedule();
          });
          structureObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: [OFFICIAL_ATTRIBUTES.phase, 'placeholder', 'data-placeholder'] });
        }
        window.addEventListener('resize', schedule, { passive: true });
        bindConversation();
        sync();
        return () => {
          if (frame) cancelAnimationFrame(frame);
          resizeObserver?.disconnect();
          structureObserver?.disconnect();
          conversationObserver?.disconnect();
          observedConversation = null;
          window.removeEventListener('resize', schedule);
          host.style.removeProperty('left');
          host.style.removeProperty('top');
        };
      // Session selection is the authoritative ownership boundary. DOM phase
      // observers handle in-session transitions; changing sessions rebuilds
      // those bindings before paint so a replaced conversation cannot strand
      // the Hero fallback in the previous session's hidden state.
      }, [sessionId]);

      return jsx('div', { ref: hostRef, className: 'dsh-fairy-hero-toggle-host', 'data-positioned': String(positioned), hidden: !positioned, children: jsx(Toggle, { controller }) });
    }

    function HeroHost({ controller }) {
      const state = useController(controller);
      const stateRef = React.useRef(state);
      stateRef.current = state;
      const hostRef = React.useRef(null);
      const placeholderRef = React.useRef({ key: null, text: null });
      const heroMaskIdRef = React.useRef(null);
      if (!heroMaskIdRef.current) heroMaskIdRef.current = `dsh-fairy-hero-mask-${++heroMaskInstanceSeed}`;
      const heroMaskId = heroMaskIdRef.current;
      React.useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        let frame = 0;
        let nativeHeadline = null;
        let textarea = null;
        let originalPlaceholder = null;
        let appliedPlaceholder = null;
        let placeholderNode = null;
        let originalPlaceholderText = null;
        let resizeObserver = null;
        let structureObserver = null;
        let modeObserver = null;
        let sidebarLayoutObserver = null;
        let observedHeadline = null;
        let observedHero = null;
        let observedComposer = null;
        let observedSidebar = null;
        let observedSidebarFrame = null;

        const restoreTextarea = () => {
          if (!textarea) return;
          const current = currentPlaceholder(textarea);
          if (appliedPlaceholder !== null && current !== appliedPlaceholder) originalPlaceholder = placeholderSnapshot(textarea);
          restorePlaceholder(textarea, originalPlaceholder);
          textarea = null;
          originalPlaceholder = null;
          appliedPlaceholder = null;
        };
        const clearHero = (resetHostGeometry = false) => {
          nativeHeadline?.classList.remove('dsh-fairy-hero-native-headline', 'dsh-fairy-hero-native-headline-hidden');
          nativeHeadline = null;
          restoreTextarea();
          if (placeholderNode?.isConnected) placeholderNode.textContent = originalPlaceholderText;
          placeholderNode = null;
          originalPlaceholderText = null;
          host.setAttribute('data-active', 'false');
          if (resetHostGeometry) {
            host.style.removeProperty('left');
            host.style.removeProperty('top');
          }
          host.style.removeProperty('clip-path');
          host.style.removeProperty('-webkit-clip-path');
          resizeObserver?.disconnect();
          sidebarLayoutObserver?.disconnect();
          observedHeadline = null;
          observedHero = null;
          observedComposer = null;
          observedSidebar = null;
          observedSidebarFrame = null;
        };
        const findLeafText = (root, text) => Array.from(root.querySelectorAll('span,div')).find((node) => node.childElementCount === 0 && (node.textContent || '').trim() === text) || null;
        const syncHero = () => {
          frame = 0;
          const hero = phase(conversation(document), 'hero');
          if (!hero) return clearHero();
          const title = findLeafText(hero, '探索未至之境');
          const nextHeadline = title?.parentElement || null;
          const card = composerCard(hero);
          const nextTextarea = composerTextarea(card);
          if (!nextHeadline || !nextTextarea) return clearHero();
          const hddEnabled = document.documentElement.hasAttribute('data-dsh-fairy-visual');
          const placeholderKey = stateRef.current.sessionId || 'hero';
          if (placeholderRef.current.key !== placeholderKey || !placeholderRef.current.text) {
            placeholderRef.current = {
              key: placeholderKey,
              text: HERO_PLACEHOLDERS[Math.floor(Math.random() * HERO_PLACEHOLDERS.length)],
            };
          }
          const replacementPlaceholder = placeholderRef.current.text;

          if (nativeHeadline !== nextHeadline) {
            nativeHeadline?.classList.remove('dsh-fairy-hero-native-headline', 'dsh-fairy-hero-native-headline-hidden');
            nativeHeadline = nextHeadline;
            nativeHeadline.classList.add('dsh-fairy-hero-native-headline');
          }
          nativeHeadline.classList.toggle('dsh-fairy-hero-native-headline-hidden', hddEnabled);
          if (hddEnabled) {
            if (textarea !== nextTextarea) {
              restoreTextarea();
              textarea = nextTextarea;
              originalPlaceholder = placeholderSnapshot(textarea);
            }
            if (currentPlaceholder(textarea) !== replacementPlaceholder) applyPlaceholder(textarea, replacementPlaceholder);
            appliedPlaceholder = replacementPlaceholder;
          } else {
            restoreTextarea();
          }
          const nextPlaceholderNode = composerPlaceholder(hero);
          if (hddEnabled && nextPlaceholderNode) {
            if (placeholderNode !== nextPlaceholderNode) {
              if (placeholderNode?.isConnected) placeholderNode.textContent = originalPlaceholderText;
              placeholderNode = nextPlaceholderNode;
              originalPlaceholderText = nextPlaceholderNode.textContent;
            }
            if (nextPlaceholderNode.textContent !== replacementPlaceholder) nextPlaceholderNode.textContent = replacementPlaceholder;
          } else if (placeholderNode) {
            if (placeholderNode.isConnected) placeholderNode.textContent = originalPlaceholderText;
            placeholderNode = null;
            originalPlaceholderText = null;
          }

          const heroRect = hero.getBoundingClientRect();
          const center = heroRect.left + heroRect.width * .5;
          host.style.left = Math.round(center) + 'px';
          host.setAttribute('data-active', String(hddEnabled));
          if (hddEnabled) {
            // The composer intentionally has a transparent input opening, so
            // stacking alone cannot hide the title behind it. Keep the
            // clipping boundary tied to the live composer and sidebar edges.
            const hostRect = host.getBoundingClientRect();
            const composerRect = card.getBoundingClientRect();
            const bottomInset = hostRect.bottom - composerRect.top;
            const sidebarPaint = document.querySelector('[data-dsh-fairy-sidebar-layer="true"]')
              || sidebar(document)?.firstElementChild
              || sidebar(document);
            const sidebarRect = sidebarPaint?.getBoundingClientRect();
            // The Hero lives in the root-level shell overlay (z-index 20), so
            // the sidebar's own stacking context cannot cover its overflow.
            // The official sidebar can live on either side of the workspace.
            // Clip only the edge facing that sidebar.
            let leftInset = 0;
            let rightInset = 0;
            if (sidebarRect) {
              const sidebarOnLeft = sidebarRect.right <= heroRect.left + heroRect.width * .5;
              if (sidebarOnLeft) leftInset = Math.max(0, sidebarRect.right - hostRect.left);
              else rightInset = Math.max(0, hostRect.right - sidebarRect.left);
            }
            host.style.clipPath = `inset(0 ${rightInset}px ${bottomInset}px ${leftInset}px)`;
            host.style.webkitClipPath = `inset(0 ${rightInset}px ${bottomInset}px ${leftInset}px)`;
          } else {
            host.style.removeProperty('clip-path');
            host.style.removeProperty('-webkit-clip-path');
          }

          const nextSidebar = document.querySelector('[data-dsh-fairy-sidebar-layer="true"]')
            || sidebar(document)?.firstElementChild
            || sidebar(document);
          const sidebarChanged = observedSidebar !== nextSidebar;
          if (resizeObserver && (observedHeadline !== nativeHeadline || observedHero !== hero || observedComposer !== card || sidebarChanged)) {
            resizeObserver.disconnect();
            observedHeadline = nativeHeadline;
            observedHero = hero;
            observedComposer = card;
            observedSidebar = nextSidebar;
            resizeObserver.observe(nativeHeadline);
            resizeObserver.observe(hero);
            resizeObserver.observe(card);
            if (nextSidebar) resizeObserver.observe(nextSidebar);
          }
          const nextSidebarFrame = nextSidebar?.parentElement || null;
          if (sidebarLayoutObserver && (sidebarChanged || observedSidebarFrame !== nextSidebarFrame)) {
            sidebarLayoutObserver.disconnect();
            observedSidebarFrame = nextSidebarFrame;
            if (nextSidebar) sidebarLayoutObserver.observe(nextSidebar, {
              attributes: true,
              attributeFilter: ['style', 'aria-expanded'],
            });
            if (nextSidebarFrame) sidebarLayoutObserver.observe(nextSidebarFrame, {
              attributes: true,
              attributeFilter: ['style', 'data-sidebar-collapsed'],
            });
          }
        };
        const scheduleHeroSync = () => {
          if (!frame) frame = requestAnimationFrame(syncHero);
        };
        if (typeof ResizeObserver === 'function') resizeObserver = new ResizeObserver(scheduleHeroSync);
        if (typeof MutationObserver === 'function') sidebarLayoutObserver = createManagedMutationObserver(scheduleHeroSync);

        if (typeof MutationObserver === 'function' && document.body) {
          structureObserver = createManagedMutationObserver((records) => {
            if (mutationTouchesSurface(records, `${OFFICIAL_SELECTORS.conversation}, ${OFFICIAL_SELECTORS.phaseHero}, ${OFFICIAL_SELECTORS.composerSeat}`, [OFFICIAL_ATTRIBUTES.phase, 'placeholder', 'data-placeholder', 'data-composer-placeholder'])) scheduleHeroSync();
          });
          structureObserver.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [OFFICIAL_ATTRIBUTES.phase, 'placeholder', 'data-placeholder', 'data-composer-placeholder'] });
          modeObserver = createManagedMutationObserver(scheduleHeroSync);
          modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: [MODE_ATTR] });
        }
        window.addEventListener('resize', scheduleHeroSync, { passive: true });
        syncHero();
        return () => {
          if (frame) cancelAnimationFrame(frame);
          structureObserver?.disconnect();
          modeObserver?.disconnect();
          sidebarLayoutObserver?.disconnect();
          window.removeEventListener('resize', scheduleHeroSync);
          clearHero(true);
        };
      }, []);

      return jsxs('div', {
        ref: hostRef,
        className: 'dsh-fairy-hero-host',
        children: [
          jsxs('span', {
            className: 'dsh-fairy-hero-main',
            children: [
              jsxs('svg', {
                className: 'dsh-fairy-hero-projection-svg',
                width: '100%',
                height: '220',
                'aria-hidden': 'true',
                children: [
                  jsxs('defs', {
                    children: [
                      // A mask inherits its target layer's SVG transform. Each
                      // occluder is therefore pre-positioned in the target's
                      // unflipped coordinates: 2 * targetBaseline - layerBaseline.
                      jsx('mask', { id: `${heroMaskId}-2`, maskType: 'luminance', maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', x: '0', y: '0', width: '100%', height: '220', children: jsxs('g', { children: [jsx('rect', { x: '0', y: '0', width: '100%', height: '220', fill: 'white' }), jsx('text', { className: 'dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-1-for-2', x: '50%', y: '114', fill: 'black', children: 'HOLLOW DEEP DIVE SYSTEM' })] }) }),
                      jsx('mask', { id: `${heroMaskId}-3`, maskType: 'luminance', maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', x: '0', y: '0', width: '100%', height: '220', children: jsxs('g', { children: [jsx('rect', { x: '0', y: '0', width: '100%', height: '220', fill: 'white' }), jsx('text', { className: 'dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-1-for-3', x: '50%', y: '174', fill: 'black', children: 'HOLLOW DEEP DIVE SYSTEM' }), jsx('text', { className: 'dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-2-for-3', x: '50%', y: '150', fill: 'black', children: 'HOLLOW DEEP DIVE SYSTEM' })] }) }),
                      jsx('mask', { id: `${heroMaskId}-4`, maskType: 'luminance', maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', x: '0', y: '0', width: '100%', height: '220', children: jsxs('g', { children: [jsx('rect', { x: '0', y: '0', width: '100%', height: '220', fill: 'white' }), jsx('text', { className: 'dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-1-for-4', x: '50%', y: '246', fill: 'black', children: 'HOLLOW DEEP DIVE SYSTEM' }), jsx('text', { className: 'dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-2-for-4', x: '50%', y: '222', fill: 'black', children: 'HOLLOW DEEP DIVE SYSTEM' }), jsx('text', { className: 'dsh-fairy-hero-mask-text dsh-fairy-hero-mask-text-3-for-4', x: '50%', y: '192', fill: 'black', children: 'HOLLOW DEEP DIVE SYSTEM' })] }) }),
                    ],
                  }),
                  jsx('text', { className: 'dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-1', x: '50%', y: '66', transform: 'matrix(1 0 0 -1 0 132)', children: 'HOLLOW DEEP DIVE SYSTEM' }),
                  jsx('text', { className: 'dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-2', x: '50%', y: '90', transform: 'matrix(1 0 0 -1 0 180)', mask: `url(#${heroMaskId}-2)`, children: 'HOLLOW DEEP DIVE SYSTEM' }),
                  jsx('text', { className: 'dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-3', x: '50%', y: '120', transform: 'matrix(1 0 0 -1 0 240)', mask: `url(#${heroMaskId}-3)`, children: 'HOLLOW DEEP DIVE SYSTEM' }),
                  jsx('text', { className: 'dsh-fairy-hero-projection-text dsh-fairy-hero-projection-text-4', x: '50%', y: '156', transform: 'matrix(1 0 0 -1 0 312)', mask: `url(#${heroMaskId}-4)`, children: 'HOLLOW DEEP DIVE SYSTEM' }),
                ],
              }),
              'HOLLOW DEEP DIVE SYSTEM',
            ],
          }),
          jsx('span', { className: 'dsh-fairy-hero-sub', children: Array.from('空洞深潜系统').map((character, index) => jsx('span', { className: 'dsh-fairy-hero-sub-char', children: character }, index)) }),
        ],
      });
    }

    function ActiveComposerPlaceholder({ controller }) {
      const state = useController(controller);
      const placeholderRef = React.useRef({ key: null, text: null });

      React.useLayoutEffect(() => {
        let frame = 0;
        let textarea = null;
        let originalPlaceholder = null;
        let appliedPlaceholder = null;
        let structureObserver = null;
        let modeObserver = null;
        const placeholderKey = state.sessionId || 'active';
        if (placeholderRef.current.key !== placeholderKey || !placeholderRef.current.text) {
          placeholderRef.current = {
            key: placeholderKey,
            text: HERO_PLACEHOLDERS[Math.floor(Math.random() * HERO_PLACEHOLDERS.length)],
          };
        }

        const restoreTextarea = () => {
          if (!textarea) return;
          const current = currentPlaceholder(textarea);
          if (appliedPlaceholder !== null && current !== appliedPlaceholder) originalPlaceholder = placeholderSnapshot(textarea);
          restorePlaceholder(textarea, originalPlaceholder);
          textarea = null;
          originalPlaceholder = null;
          appliedPlaceholder = null;
        };
        const syncPlaceholder = () => {
          frame = 0;
          const hddEnabled = document.documentElement.hasAttribute('data-dsh-fairy-visual');
          const conversationSurface = conversation(document);
          const activeSurface = phase(conversationSurface, 'active');
          // HeroHost owns the Hero textarea. This component is deliberately
          // inactive until the official active-session surface exists.
          const nextTextarea = activeSurface
            ? composerTextarea(composerCard(composerSeat(conversationSurface)))
            : null;
          if (!hddEnabled || !nextTextarea) return restoreTextarea();
          if (textarea !== nextTextarea) {
            restoreTextarea();
            textarea = nextTextarea;
            originalPlaceholder = placeholderSnapshot(textarea);
          }
          const replacement = placeholderRef.current.text;
          const current = currentPlaceholder(textarea);
          if (appliedPlaceholder !== null && current !== appliedPlaceholder) originalPlaceholder = placeholderSnapshot(textarea);
          if (current !== replacement) applyPlaceholder(textarea, replacement);
          appliedPlaceholder = replacement;
        };
        const schedulePlaceholderSync = () => {
          if (!frame) frame = requestAnimationFrame(syncPlaceholder);
        };

        if (typeof MutationObserver === 'function' && document.body) {
          structureObserver = createManagedMutationObserver((records) => {
            if (mutationTouchesSurface(records, `${OFFICIAL_SELECTORS.conversation}, ${OFFICIAL_SELECTORS.phaseActive}, ${OFFICIAL_SELECTORS.composerSeat}`, [OFFICIAL_ATTRIBUTES.phase, OFFICIAL_ATTRIBUTES.composerSeat, 'placeholder', 'data-placeholder'])) schedulePlaceholderSync();
          });
          structureObserver.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [OFFICIAL_ATTRIBUTES.phase, OFFICIAL_ATTRIBUTES.composerSeat, 'placeholder', 'data-placeholder', 'data-composer-placeholder'] });
          modeObserver = createManagedMutationObserver(schedulePlaceholderSync);
          modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: [MODE_ATTR] });
        }
        syncPlaceholder();
        return () => {
          if (frame) cancelAnimationFrame(frame);
          structureObserver?.disconnect();
          modeObserver?.disconnect();
          restoreTextarea();
        };
      }, [state.sessionId, state.settings.enabled]);

      return null;
    }
  return { HeroToggleHost, HeroHost, ActiveComposerPlaceholder };
}

module.exports = { install };

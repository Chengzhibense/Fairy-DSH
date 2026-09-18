import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Normalize CRLF to LF so newline-sensitive source assertions hold on Windows.
// The upstream checkout carries CRLF line endings there, while the patterns
// below were authored against LF, which made several tests fail only on Windows.
const read = async (path) => (await readFile(new URL(path, import.meta.url), 'utf8')).replace(/\r\n/g, '\n');
const [clientEntrySource, constantsSource, utilsSource, styleSource, composerDockSource, composerMarkerSource, composerMaterialSource, composerNativeSource, composerWorkspaceSource, composerResizeSource, composerInsetSource, composerSessionSource, composerAnchorSource, toBottomSource, adapterSource, lifecycleSource, controllerLifecycleSource, modeThemeSource, stageLifecycleSource, scrollbarSource, semanticMarkerSource, geometrySource, mascotSource, brandGeometrySource, powerModeSource, surfaceUtilsSource, visualTransitionsSource, serverSource, contractTypes] = await Promise.all([
  read('../src/client/index.js'),
  read('../src/client/constants.js'),
  read('../src/client/utils.js'),
  read('../src/client/style.js'),
  read('../src/client/composer-dock.js'),
  read('../src/client/composer-marker-projection.js'),
  read('../src/client/composer-material-layer.js'),
  read('../src/client/composer-native-controls.js'),
  read('../src/client/composer-workspace-projection.js'),
  read('../src/client/composer-resize-controller.js'),
  read('../src/client/composer-inset-synchronizer.js'),
  read('../src/client/composer-session-rebinding.js'),
  read('../src/client/chat-content-anchor.js'),
  read('../src/client/to-bottom-positioner.js'),
  read('../src/client/dom-adapter.js'),
  read('../src/client/lifecycle.js'),
  read('../src/client/controller-lifecycle.js'),
  read('../src/client/mode-theme.js'),
  read('../src/client/stage-lifecycle.js'),
  read('../src/client/scrollbar.js'),
  read('../src/client/semantic-markers.js'),
  read('../src/client/geometry-lifecycle.js'),
  read('../src/client/mascot-lifecycle.js'),
  read('../src/client/brand-sidebar-geometry.js'),
  read('../src/client/power-mode.js'),
  read('../src/client/surface-utils.js'),
  read('../src/client/visual-transitions.js'),
  read('../src/index.js'),
  read('../../../fairy-contracts/types.d.ts'),
]);
const selectionGuardSource = await read('../src/client/selection-guard.js');
const mascotScaleSource = await read('../src/client/mascot-scale-control.js');
const speedControlSource = await read('../src/client/mascot-animation-speed-control.js');
const settingsWriteSource = await read('../src/client/settings-write.js');
const observerManagerSource = await read('../src/client/dom-observer-manager.js');
const semanticManagerSource = await read('../src/client/semantic-markers-manager.js');
const sidebarManagerSource = await read('../src/client/sidebar-geometry-manager.js');
const scrollbarsManagerSource = await read('../src/client/scrollbars-manager.js');
const heroProjectionSource = await read('../src/client/hero-projection-manager.js');
const mascotRuntimeSource = await read('../src/client/mascot-runtime.js');
const mascotAssetsSource = await read('../src/client/mascot-assets.js');
const mascotStyleSource = await read('../src/client/mascot-style.js');
const mascotEffectsSvgSource = await read('../src/client/mascot-effects-svg.js');
const mascotEyeSvgSource = await read('../src/client/mascot-eye-svg.js');
const mascotGeometrySource = await read('../src/client/mascot-geometry.js');
const mascotStaticSource = [mascotAssetsSource, mascotStyleSource, mascotEffectsSvgSource, mascotEyeSvgSource, mascotGeometrySource].join('\n');
const clientSource = [clientEntrySource, semanticManagerSource, sidebarManagerSource, scrollbarsManagerSource, heroProjectionSource, mascotRuntimeSource, mascotStaticSource].join('\n');
const source = [clientSource, constantsSource, utilsSource, styleSource, composerDockSource, composerMarkerSource, composerMaterialSource, composerNativeSource, composerWorkspaceSource, composerResizeSource, composerInsetSource, composerSessionSource, composerAnchorSource, toBottomSource, adapterSource, lifecycleSource, controllerLifecycleSource, modeThemeSource, stageLifecycleSource, scrollbarSource, semanticMarkerSource, geometrySource, mascotSource, brandGeometrySource, powerModeSource, surfaceUtilsSource, visualTransitionsSource, selectionGuardSource, mascotScaleSource, settingsWriteSource, observerManagerSource].join('\n');
const bundle = await read('../lib/client.js');
const manifest = JSON.parse(await read('../package.json'));

test('keeps the client entrypoint and extracted managers within their module budgets', () => {
  assert.ok(clientEntrySource.split('\n').length < 1000);
  assert.ok(mascotRuntimeSource.split('\n').length < 750);
  assert.ok(mascotStyleSource.split('\n').length < 350);
  assert.ok(mascotEffectsSvgSource.split('\n').length < 120);
  assert.ok(mascotEyeSvgSource.split('\n').length < 180);
  assert.ok(mascotGeometrySource.split('\n').length < 100);
  assert.match(mascotRuntimeSource, /require\('\.\/mascot-assets\.js'\)/);
  assert.doesNotMatch(mascotRuntimeSource, /const CSS = `|<svg class="dsh-fairy-eye"/);
  assert.match(mascotAssetsSource, /require\('\.\/mascot-style\.js'\)/);
  assert.match(mascotAssetsSource, /require\('\.\/mascot-effects-svg\.js'\)/);
  assert.match(mascotAssetsSource, /require\('\.\/mascot-eye-svg\.js'\)/);
  assert.match(mascotAssetsSource, /require\('\.\/mascot-geometry\.js'\)/);
  [semanticManagerSource, sidebarManagerSource, scrollbarsManagerSource, heroProjectionSource].forEach((managerSource) => {
    assert.ok(managerSource.split('\n').length < 500);
    assert.match(managerSource, /function install\(/);
  });
  assert.match(clientEntrySource, /semanticMarkersManager\.install\(\)/);
  assert.match(clientEntrySource, /sidebarGeometryManager\.install\(\)/);
  assert.match(clientEntrySource, /scrollbarsManager\.install\(\)/);
  assert.match(clientEntrySource, /heroProjectionManager\.install\(/);
  assert.match(semanticManagerSource, /reportMissingCapabilities\s*}\s*=\s*require\('\.\/dom-adapter\.js'\)/);
  assert.match(heroProjectionSource, /sidebar, conversation, phase/);
});

test('ships an official client module with explicit lifecycle ownership', () => {
  assert.match(clientSource, /ctx\.slots\.inject\('shell\.overlay'/);
  assert.match(clientSource, /ctx\.slots\.inject\('conversation\.session\.header\.utilities'/);
  assert.match(clientSource, /ctx\.settingsScope\.bind\(\{ namespace: SETTINGS_NAMESPACE \}\)/);
  assert.match(clientSource, /this\.sessions\.binding/);
  assert.match(clientSource, /module\.exports = \{ apply, inject: \['slots', 'sessions', 'settingsScope'\]/);
  assert.doesNotMatch(source, /__dshFairyLoaded|__dshFairyState|__dshFairySessionRuntime|localStorage|sessionStorage/);
  assert.match(bundle, /window\.__ModuleLoader__\.load\(/);
  assert.match(bundle, /id: 'dsh-fairy-visual'/);
});

test('keeps identity settings on a cached bridge subscription', () => {
  assert.match(clientSource, /const readIdentity = \(\) => identitySettings\.getSnapshot\(\)\?\.value \|\| \{\};/);
  assert.match(clientSource, /identitySettings\.subscribe\(refresh\)/);
  assert.doesNotMatch(clientSource, /useSyncExternalStore\(identitySettings\.subscribe/);
});

test('keeps module ownership boundaries and official slot declarations', () => {
  assert.deepEqual(manifest.dsh.client.inject, [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-slots',
    '@deepseek-ai/dsh-client-ui-layout',
    '@deepseek-ai/dsh-client-ui-sidebar',
    '@deepseek-ai/dsh-client-ui-conversation',
    '@deepseek-ai/dsh-client-ui-settings',
    '@deepseek-ai/dsh-client-ui-primitives',
  ]);
  assert.match(clientSource, /settings\.section/);
  assert.doesNotMatch(clientSource, /sessions\.clear\(\)|workspaces\.startSession\(\)|STARTUP_RESET_ATTR/);
  assert.doesNotMatch(source, /fairy-voice|127\.0\.0\.1:9880|agent\/pre-step/);
  // dsh-settings >= 0.1.2 dropped the settingsNamespace() factory. The host must
  // register the plain namespace string, which the package validates itself.
  assert.match(serverSource, /settings\.register\(FAIRY_VISUAL_SETTINGS_NAMESPACE, FairyVisualSettings\)/);
  assert.match(serverSource, /settings\.register\(FAIRY_IDENTITY_SETTINGS_NAMESPACE, FairyIdentitySettings\)/);
  assert.doesNotMatch(serverSource, /settingsNamespace\s*\(/);
  assert.match(contractTypes, /interface FairyVisualSettings/);
});

test('uses semantic markers instead of generated DSH classes or relationship selectors', () => {
  assert.match(semanticManagerSource, /function install\(lifecycle = claimSemanticMarkers\(document\)\)/);
  assert.match(semanticMarkerSource, /const SEMANTIC_MARKERS = Object\.freeze\(\[[\s\S]*?'data-dsh-fairy-sidebar-open-control',[\s\S]*?\n\]\);/);
  assert.match(clientSource, /markSemanticNode\(desired, node, name\)/);
  assert.match(adapterSource, /OFFICIAL_SELECTORS\.openSidebar,\s*OFFICIAL_SELECTORS\.collapseSidebar,\s*OFFICIAL_SELECTORS\.sidebarBrandMark,/);
  assert.match(clientSource, /data-dsh-fairy-active-folder/);
  assert.match(clientSource, /data-dsh-fairy-selected-session/);
  assert.match(clientSource, /data-dsh-fairy-composer-seat/);
  assert.match(styleSource, /data-dsh-fairy-active-folder="true"\].*color:inherit!important/);
  assert.match(adapterSource, /ARIA_LABELS/);
  assert.match(adapterSource, /query\(scope, `\[\$\{FAIRY_VOICE_CONTROL_ATTRIBUTE\}\]`\) \|\| query\(scope, VOICE_CONTROL_FALLBACK_SELECTOR\)/);
  assert.match(adapterSource, /ariaLabelSelector\('openSidebar'/);
  assert.match(adapterSource, /ariaLabelSelector\('collapseSidebar'/);
  assert.match(adapterSource, /\[data-slot="sidebar\.brand\.mark"\]/);
  assert.match(clientSource, /const brandCandidate = sidebarBrandButton\(side\)/);
  assert.doesNotMatch(clientSource, /newSessionControls\.find\(\(button\) => button\.firstElementChild\?\.tagName === 'svg'\)/);
  assert.doesNotMatch(source, /hHd-Xa_newSession|YDXeBa_folderActive|YDXeBa_selected|:has\(/);
  assert.doesNotMatch(source, /qDHVXG_list|pXSMma_|wSkVaW_composerHero/);
});

test('keeps merged model/reasoning controls on one explicit owner', () => {
  assert.match(adapterSource, /function modelAndReasoningShareNode\(scope\)/);
  assert.match(adapterSource, /model && reasoning && model === reasoning/);
  assert.match(composerMarkerSource, /const mergedModelReasoning = modelAndReasoningShareNode\(card\)/);
  assert.match(composerMarkerSource, /modelTarget && trailing && !mergedModelReasoning/);
  assert.doesNotMatch(composerMarkerSource, /:has\(/);
});

test('coalesces marker updates and ignores unrelated class churn', () => {
  assert.match(semanticMarkerSource, /function mutationTouchesSemanticSurface\(records, selector\)/);
  assert.match(clientSource, /if \(mutationTouchesSemanticSurface\(records, SEMANTIC_SURFACE_SELECTOR\)\) schedule\(\)/);
  assert.match(clientSource, /attributeFilter: \['aria-expanded', 'aria-label', 'aria-selected', OFFICIAL_ATTRIBUTES\.phase, OFFICIAL_ATTRIBUTES\.slot\]/);
  assert.match(clientSource, /'data-dsh-fairy-sidebar-layer',\s*'data-dsh-fairy-history-surface'/);
  assert.doesNotMatch(clientSource, /attributeFilter: \[[^\]]*'class'/);
  assert.match(clientSource, /lifecycle\.scheduleFrame\('sidebar-board-sync', sync(?:, [^)]+)?\)/);
  assert.match(clientSource, /lifecycle\.scheduleFrame\('stage-geometry-sync', syncStageGeometry(?:, [^)]+)?\)/);
  assert.match(clientSource, /lifecycle\.scheduleFrame\('content-fade-sync', applyContentFade(?:, [^)]+)?\)/);
  assert.match(clientSource, /const bindOwners = \(\) =>/);
  assert.match(clientSource, /observedLayer/);
  assert.match(clientSource, /resizeObserver\?\.disconnect\(\)/);
  assert.match(clientSource, /layoutObserver = createManagedMutationObserver\(schedule\)/);
  assert.match(surfaceUtilsSource, /function mutationTouchesSurface\(records, selector, attributes = \[\]\)/);
  assert.doesNotMatch(clientSource, /structureObserver = new MutationObserver/);
  assert.match(clientSource, /attributeFilter: \['style', 'data-dragging', 'data-sidebar-collapsed'\]/);
});

test('routes visual DOM subscriptions through one shared observer manager', () => {
  assert.doesNotMatch(clientSource, /new MutationObserver/);
  assert.doesNotMatch(composerDockSource, /new MutationObserver/);
  assert.match(observerManagerSource, /const managers = new WeakMap\(\)/);
  assert.match(observerManagerSource, /const subscriptionsByTarget = new WeakMap\(\)/);
  assert.equal((observerManagerSource.match(/new MutationObserver/g) || []).length, 1);
  assert.match(observerManagerSource, /attributeFilter: \[\.\.\.filters\]/);
  assert.match(observerManagerSource, /const frameCallbacks = new Map\(\)/);
});

test('bounds observer-driven resource queues and marker writes', () => {
  assert.match(lifecycleSource, /const removeCleanup = \(cleanup\) =>/);
  assert.match(lifecycleSource, /const scheduleFrame = \(key, callback(?:, label = null)?\) =>/);
  assert.match(lifecycleSource, /removeCleanup\(cleanup\)/);
  assert.match(clientSource, /const desired = createSemanticMarkerMap\(\)/);
  assert.match(clientSource, /const previousNodes = owned\.get\(name\)/);
  assert.match(clientSource, /domObserverManager\.scheduleFrame\(semanticFrameKey, sync\)/);
  assert.match(clientSource, /const measurements = \[\]/);
  assert.match(clientSource, /measurements\.forEach\(\(\{ binding, visible/);
  assert.match(clientSource, /lifecycle\.scheduleFrame\('scrollbar-sync', sync(?:, [^)]+)?\)/);
});

test('does not allocate or notify visual consumers for unchanged session projections', () => {
  assert.match(utilsSource, /deriveSessionComfort\(snapshot\)\) return 'comforting'/);
  assert.match(utilsSource, /snapshot\?\.running === true \? 'thinking' : 'normal'/);
  assert.doesNotMatch(clientSource, /\[\.\.\.order\]\.reverse\(\)\.map/);
  assert.match(clientSource, /if \(this\.state\.activity === activity && this\.state\.lifecycle === lifecycle && this\.state\.sessionId === sessionId\) return/);
});

test('keeps the hero toggle visibility under React state ownership', () => {
  const start = heroProjectionSource.indexOf('function HeroToggleHost');
  const end = heroProjectionSource.indexOf('function HeroHost', start);
  const host = heroProjectionSource.slice(start, end);
  assert.match(host, /React\.useState\(false\)/);
  assert.match(host, /const \{ sessionId \} = useController\(controller\)/);
  assert.match(host, /React\.useLayoutEffect\(\(\) =>/);
  assert.match(host, /frame = 0;\s*bindConversation\(\);\s*const conversationSurface = conversation\(document\);/);
  assert.match(host, /phase\(conversationSurface, 'active'\)\s*\? null/);
  assert.match(host, /host\.style\.top = Math\.round\(rect\.top \+ 8\)/);
  assert.match(host, /const bindConversation = \(\) =>/);
  assert.match(host, /if \(conversationNode === observedConversation\) return/);
  assert.match(host, /conversationObserver\.observe\(conversationNode/);
  assert.match(host, /const phaseSelector = `\$\{OFFICIAL_SELECTORS\.phaseHero\}, \$\{OFFICIAL_SELECTORS\.phaseActive\}`/);
  assert.match(host, /structureObserver\.observe\(document\.body/);
  assert.match(host, /mutationTouchesHeroSurface\(records, OFFICIAL_SELECTORS, OFFICIAL_ATTRIBUTES\)/);
  assert.match(host, /conversationObserver\?\.disconnect\(\)/);
  assert.match(host, /setPositioned\(false\)/);
  assert.match(host, /hidden: !positioned/);
  assert.match(host, /'data-positioned': String\(positioned\)/);
  assert.match(host, /\}, \[sessionId\]\)/);
  assert.doesNotMatch(host, /host\.hidden\s*=/);
});

test('keeps Hero and active-session placeholder ownership mutually exclusive', () => {
  const heroHost = heroProjectionSource.slice(heroProjectionSource.indexOf('function HeroHost'), heroProjectionSource.indexOf('function ActiveComposerPlaceholder'));
  const activePlaceholder = heroProjectionSource.slice(heroProjectionSource.indexOf('function ActiveComposerPlaceholder'));
  assert.match(heroHost, /let appliedPlaceholder = null/);
  assert.match(heroHost, /if \(appliedPlaceholder !== null && current !== appliedPlaceholder\) originalPlaceholder = current/);
  assert.match(heroHost, /appliedPlaceholder = replacementPlaceholder/);
  assert.match(activePlaceholder, /const activeSurface = phase\(conversationSurface, 'active'\)/);
  assert.match(activePlaceholder, /const nextTextarea = activeSurface/);
  assert.match(activePlaceholder, /HeroHost owns the Hero textarea/);
});

test('limits root-level Hero observation to surface changes instead of chat streaming', () => {
  assert.match(surfaceUtilsSource, /function mutationTouchesHeroSurface\(records, officialSelectors, officialAttributes\)/);
  assert.match(surfaceUtilsSource, /officialSelectors\.phaseHero\}, \$\{officialSelectors\.phaseActive\}/);
  assert.match(surfaceUtilsSource, /target\?\.matches\?\.\(officialSelectors\.phaseHero\) \|\| target\?\.closest\?\.\(officialSelectors\.phaseHero\)/);
  assert.match(surfaceUtilsSource, /node\.matches\?\.\(selector\) \|\| node\.querySelector\?\.\(selector\)/);
});

test('keeps HDD paint isolated below the official application root', () => {
  assert.match(clientSource, /className = 'dsh-hdd-background-host'/);
  assert.match(clientSource, /document\.body\.insertBefore\(host, document\.body\.firstElementChild\)/);
  assert.match(styleSource, /\.dsh-hdd-background-host\{position:fixed;inset:0;z-index:0/);
  assert.match(styleSource, /html\[data-dsh-fairy-visual\] body>#root\{position:relative!important;z-index:1!important\}/);
  assert.match(styleSource, /data-dsh-fairy-background-surface="true"/);
  assert.match(styleSource, /data-dsh-fairy-sidebar-layer="true"/);
  assert.match(styleSource, /data-dsh-fairy-sidebar-layer="true"\]\{[^}]*width:100%!important/);
  assert.match(styleSource, /data-dsh-fairy-theme="light"[^}]*--dsh-sidebar-ridge-shade:#d7dde1/);
  assert.doesNotMatch(styleSource, /\.dsh-hdd-fx:before\{[^}]*mask-image/);
  assert.doesNotMatch(bundle, /__dshFairyMascot|dsh-hdd-mode-patch|patchOfficialRuntime/);
});

test('keeps history transparent while giving the composer a stable painted substrate', () => {
  assert.match(surfaceUtilsSource, /function roundedRectPath\(left, top, right, bottom, radius\)/);
  assert.match(clientSource, /function SidebarBoardCutout\(\{ enabled \}\)/);
  assert.match(clientSource, /if \(!enabled \|\| !layer\) return clear\(\);/);
  assert.match(clientSource, /const hasHole = holeRect && holeRect\.width >= 1 && holeRect\.height >= 1/);
  assert.match(clientSource, /inner \? ` \$\{inner\}` : ''/);
  assert.match(clientSource, /path\(evenodd,/);
  assert.match(clientSource, /--dsh-sidebar-board-clip/);
  assert.match(styleSource, /data-dsh-fairy-history-surface="true"\]\{position:relative/);
  assert.match(styleSource, /background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important/);
  assert.match(styleSource, /data-dsh-fairy-history-surface="true"\]\:\:after\{display:block!important;content:''!important;[^}]*background:transparent!important;background-color:transparent!important;background-image:none!important;[^}]*box-shadow:inset/);
  assert.match(styleSource, /data-dsh-fairy-sidebar-layer="true"\]\:\:before\{opacity:0!important\}/);
  assert.match(styleSource, /data-dsh-fairy-sidebar-geometry="ready"\]\:\:before\{opacity:1!important\}/);
  assert.match(clientSource, /node\.removeAttribute\('data-dsh-fairy-sidebar-geometry'\)/);
  assert.match(clientSource, /layer\.setAttribute\('data-dsh-fairy-sidebar-geometry', 'ready'\)/);
  assert.match(styleSource, /data-dsh-fairy-theme\] \[data-dsh-fairy-composer-dock="true"\] \[data-input-scroll\]\{background-color:var\(--dsh-input-substrate\)!important;background-image:var\(--dsh-input-substrate-image\)!important/);
  assert.match(styleSource, /data-input-scroll\][^}]*textarea[^}]*background:transparent!important;background-color:transparent!important;background-image:none!important/);
  assert.match(styleSource, /data-input-scroll\]\{[^}]*box-shadow:inset 0 12px 19px -18px/);
  assert.doesNotMatch(styleSource, /data-input-scroll[^}]*rgba\(255,255,255,\.34\)/);
  assert.doesNotMatch(styleSource, /data-dsh-fairy-composer-material="true"\}\{[^}]*filter:drop-shadow/);
});

test('owns every HDD scrollbar as a floating, non-layout overlay', () => {
  assert.match(adapterSource, /const HDD_SCROLL_TARGETS = Object\.freeze\(\[/);
  assert.match(adapterSource, /data-conversation-scroll/);
  assert.match(adapterSource, /data-input-scroll/);
  assert.match(clientSource, /function HddOverlayScrollbars\(\{ enabled \}\)/);
  assert.match(clientSource, /createPointerDrag/);
  assert.match(clientSource, /binding\.pointerDrag = createPointerDrag/);
  assert.match(clientSource, /binding\.pointerDrag\?\.dispose\(\)/);
  assert.match(clientSource, /const bindingLifecycle = createLifecycleScope\(`scrollbar:\$\{key\}`\)/);
  assert.match(clientSource, /bindingLifecycle\.on\(target, 'scroll', onScroll/);
  assert.match(clientSource, /binding\.lifecycle\.timeout\(settle, 850(?:, [^)]+)?\)/);
  assert.doesNotMatch(clientSource, /bindingLifecycle\.timeout/);
  assert.doesNotMatch(clientSource, /binding\.drag/);
  assert.match(clientSource, /target\.scrollTop = Math\.max\(0, Math\.min\(drag\.maxScroll/);
  assert.match(clientSource, /const TRACK_WIDTH = 12/);
  assert.match(clientSource, /const EDGE_INSET = 1/);
  assert.match(clientSource, /rect\.right - EDGE_INSET - TRACK_WIDTH/);
  assert.match(clientSource, /setTimeout\(\(\) => \{/);
  assert.match(clientSource, /binding\.idleDeadline = Date\.now\(\) \+ 850/);
  assert.match(clientSource, /if \(binding\.idleTimer\) return/);
  assert.match(clientSource, /data-idle/);
  assert.match(styleSource, /data-idle="true"\]\{opacity:0;pointer-events:none/);
  assert.match(clientSource, /jsx\(HddOverlayScrollbars, \{ enabled: state\.settings\.enabled \}\)/);
  assert.match(clientSource, /const cleanup = \(\) => \{\s*structureObserver\?\.disconnect\(\);\s*resizeObserver\?\.disconnect\(\);\s*window\.removeEventListener\('resize', schedule\)/s);
  assert.match(styleSource, /\.dsh-hdd-scrollbar-layer\{position:fixed;inset:0/);
  assert.match(styleSource, /\.dsh-history-overlay-scrollbar-thumb\{position:absolute/);
  assert.match(styleSource, /scrollbar-width:none!important/);
  assert.doesNotMatch(styleSource, /html:not\(\[data-dsh-fairy-visual\]\).*scrollbar/);
});

test('keeps normal-mode isolation and HDD-only composer/background overrides', () => {
  assert.match(styleSource, /html\[data-dsh-fairy-visual\] \[data-composer-card="true"\]/);
  assert.match(styleSource, /html\[data-dsh-fairy-visual\] \[data-dsh-fairy-composer-seat="true"\]\{background:transparent!important/);
  assert.match(styleSource, /html\[data-dsh-fairy-visual\] \[data-dsh-fairy-sidebar-layer="true"\].*border-right:0!important/);
  assert.match(styleSource, /el\.setAttribute\('data-plugin', 'dsh-fairy-visual'\)/);
  assert.doesNotMatch(styleSource, /html:not\(\[data-dsh-fairy-visual\]\).*data-composer-card/);
  assert.match(utilsSource, /root\.removeAttribute\('data-dsh-fairy-visual'\)/);
});

test('anchors the native to-bottom control to the fixed Fairy composer', () => {
  assert.match(composerDockSource, /createToBottomPositioner/);
  assert.match(toBottomSource, /toBottomControl/);
  assert.match(adapterSource, /ariaLabelSelector\('toBottom'/);
  assert.match(toBottomSource, /\.toBottomSlot/);
  assert.match(toBottomSource, /getBoundingClientRect/);
  assert.match(toBottomSource, /scrollRect\.bottom - composerRect\.top/);
  assert.doesNotMatch(toBottomSource, /button\.style\.setProperty/);
  assert.match(toBottomSource, /ROOT_BOTTOM_PROPERTY/);
  assert.match(toBottomSource, /root\.style\.setProperty\(ROOT_BOTTOM_PROPERTY/);
  assert.match(toBottomSource, /addEventListener\('scroll', schedule/);
  assert.match(styleSource, /data-dsh-fairy-to-bottom-slot="true"\]\{bottom:var\(--dsh-fairy-to-bottom-offset,12px\)!important\}/);
  assert.match(toBottomSource, /data-dsh-fairy-to-bottom-control/);
  assert.match(styleSource, /data-dsh-fairy-to-bottom-control="true"\]\:not\(\[hidden\]\)/);
  assert.doesNotMatch(styleSource, /button\[aria-label="回到底部"\]/);
  assert.match(styleSource, /data-dsh-fairy-sidebar-open-control="true"/);
  assert.match(styleSource, /html\[data-dsh-fairy-visual\] \[data-slot="sidebar\.brand\.mark"\]\{display:none!important\}/);
  assert.match(styleSource, /data-dsh-fairy-sidebar-open-control="true"\] \[data-slot="sidebar\.brand\.mark"\]\{display:none!important\}/);
  assert.doesNotMatch(styleSource, /button\[aria-label="打开侧边栏"\]/);
  assert.doesNotMatch(styleSource, /button\[aria-label="新建会话"\]/);
});

test('keeps both themes explicit and preserves the original Fairy visual primitives', () => {
  assert.match(utilsSource, /value\.theme === 'light' \? 'light' : 'dark'/);
  assert.match(utilsSource, /root\.setAttribute\(THEME_ATTR, theme\)/);
  assert.match(styleSource, /data-dsh-fairy-theme="dark"/);
  assert.match(styleSource, /data-dsh-fairy-theme="light"/);
  assert.match(styleSource, /\.dsh-fairy-stage>\[data-dsh-fairy-mascot-root=\"true\"\]\{top:-20px\}/);
  assert.match(styleSource, /dsh-hdd-glow-a/);
  assert.match(clientSource, /dsh-fairy-halo/);
  assert.match(clientSource, /dsh-fairy-pulse-layer/);
  assert.match(clientSource, /\.dsh-fairy-main \{[\s\S]*?z-index: 1;[\s\S]*?opacity: 1;/);
  assert.match(clientSource, /synchronizeActiveClipPhase/);
  assert.match(clientSource, /renderMotionFrame\(\)/);
  assert.match(clientSource, /createMascotMotionClock/);
  assert.match(clientSource, /motionClock\.phase\(\)/);
  assert.match(clientSource, /\[thinkingClipShape, comfortingClipShape\]\.forEach/);
  assert.match(clientSource, /clip\.style\.transform = state === "thinking"/);
  assert.doesNotMatch(clientSource, /shape\.style\.animation = isThinking/);
  assert.doesNotMatch(clientSource, /motionClock\.timeline\(1440 \/ animationRate\)/);
  assert.match(clientSource, /motionClock\.setRate\(rate\)/);
  assert.match(clientSource, /playStateTransition/);
  assert.match(clientSource, /scheduleGlitch/);
});

test('keeps animation speed selection and mascot rate synchronized across control rebinds', () => {
  assert.match(speedControlSource, /SPEED_STOPS = Object\.freeze/);
  assert.match(speedControlSource, /position: 0, rate: 0\.7/);
  assert.match(speedControlSource, /position: 0\.5, rate: 1/);
  assert.match(speedControlSource, /position: 1, rate: 1\.5/);
  assert.match(speedControlSource, /let selectedPosition = 0\.5/);
  assert.match(speedControlSource, /setPosition\(selectedPosition, true\)/);
  assert.match(speedControlSource, /selectedPosition = stop\.position/);
  assert.match(speedControlSource, /positionForRate\(rate\)/);
  assert.match(speedControlSource, /options\.onChange\?\.\(stop\.rate\)/);
  assert.match(composerDockSource, /mascotAnimationSpeed/);
  assert.match(speedControlSource, /\['0\.7', '1', '1\.5'\]/);
  assert.match(styleSource, /animation-speed-tick="0\.5"\].*animation-speed-tick="2"\].*display:none/);
  assert.match(styleSource, /animation-speed-tick="0\.7"\].*left:6px/);
  assert.match(styleSource, /animation-speed-tick="1\.5"\].*left:calc\(100% - 6px\)/);
});

test('keeps the mascot body under one scoped style and state owner', () => {
  assert.doesNotMatch(styleSource, /dsh-fairy-projection/);
  assert.doesNotMatch(styleSource, /@keyframes dsh-(?:lashes|lash-pulse|thinking|outer|three|two|one)/);
  assert.doesNotMatch(styleSource, /\[data-dsh-fairy-mascot-root="true"\] \{ position: fixed; inset: 0/);
  assert.match(clientSource, /const STYLE_ID = "dsh-fairy-mascot-style"/);
  assert.match(clientSource, /data-dsh-fairy-theme="light"\] \[data-dsh-fairy-mascot-root="true"\] \.dsh-fairy-halo path/);
  assert.match(clientSource, /@keyframes dsh-fairy-lashes \{ to \{ transform: rotate\(360deg\); \} \}/);
  assert.match(clientSource, /@keyframes dsh-fairy-pulse-outer \{[\s\S]*?from \{ transform: scale\(\.985\); \}\s*to \{ transform: scale\(\.91\); \}/);
  assert.match(clientSource, /@keyframes dsh-fairy-pulse-three \{\s*from \{ transform: scale\(1\); \}\s*to \{ transform: scale\(\.90\); \}/);
  assert.match(clientSource, /@keyframes dsh-fairy-pulse-two \{\s*from \{ transform: scale\(1\); \}\s*to \{ transform: scale\(\.87\); \}/);
  assert.match(clientSource, /@keyframes dsh-fairy-pulse-inner \{\s*from \{ transform: scale\(1\); \}\s*to \{ transform: scale\(\.85\); \}/);
  assert.match(clientSource, /dsh-fairy-pulse-inner calc\(\.72s \/ var\(--dsh-fairy-steady-rate, 1\)\)[^;]*calc\(-\.18s \/ var\(--dsh-fairy-steady-rate, 1\)\)/);
  assert.doesNotMatch(clientSource, /\.currentTime\s*=|\.startTime\s*=/);
  assert.match(clientSource, /requestAnimationFrame\(tick\)/);
  assert.match(clientSource, /leadMs \/ 1440/);
  assert.match(clientSource, /if \(changed && !root\.hasAttribute\("data-transition-glitch"\) && !visualSuspended\)[\s\S]*stopGlitch\(\);[\s\S]*scheduleGlitch\(mountedOwner, mountGeneration\)/);
  assert.match(clientSource, /@keyframes dsh-fairy-thinking-clip \{\s*from \{ transform: translateY\(14\.5px\) scaleY\(\.55\); \}\s*to \{ transform: translateY\(15\.5px\); \}/);
  assert.match(clientSource, /dsh-fairy-comforting-eye-clip/);
  assert.match(clientSource, /dsh-fairy-corners" clip-path="url\(#dsh-fairy-disc-clip\)" fill="#2b3388"/);
  assert.match(mascotEyeSvgSource, /outerDiscRadius/);
  assert.match(mascotEyeSvgSource, /outerHaloRadius/);
  assert.match(mascotEyeSvgSource, /outerHaloPeak/);
  assert.match(clientSource, /dsh-fairy-outer-halo-color: #172531/);
  assert.match(clientSource, /fill="url\(#dsh-fairy-outer-halo-gradient\)"/);
  assert.match(mascotEyeSvgSource, /dsh-fairy-outer-halo/);
  const outerHaloNode = clientSource.indexOf('<circle class="dsh-fairy-outer-halo"');
  const signalNode = clientSource.indexOf('<g class="dsh-fairy-signal"');
  assert.ok(outerHaloNode >= 0 && signalNode > outerHaloNode, 'outer halo must remain outside the glitch signal');
  assert.match(mascotEyeSvgSource, /pupilRadius/);
  assert.match(mascotEyeSvgSource, /highlightHaloPeak/);
  assert.match(clientSource, /<stop offset="\.72" stop-color="#f5f8fd" stop-opacity="\.19"\/>/);
  assert.match(clientSource, /<stop offset="\.77" stop-color="#f5f8fd" stop-opacity="\.12"\/>/);
  assert.match(clientSource, /<stop offset="\.83" stop-color="#f5f8fd" stop-opacity="\.055"\/>/);
  assert.match(clientSource, /<stop offset="\.89" stop-color="#f5f8fd" stop-opacity="\.02"\/>/);
  assert.match(clientSource, /<stop offset="\.96" stop-color="#f5f8fd" stop-opacity="\.004"\/>/);
  assert.match(mascotEyeSvgSource, /highlightCenter/);
  assert.match(mascotEyeSvgSource, /highlightRadius/);
  assert.match(clientSource, /dsh-fairy-image\[data-flicker="true"\]/);
  assert.match(clientSource, /data-low-power\] \.dsh-fairy-eye\s*\{[\s\S]*animation: none !important/);
  assert.doesNotMatch(clientSource, /if \(motionFrame \|\| visualSuspended \|\| !root \|\| root\.hasAttribute\("data-low-power"\)\)/);
  assert.doesNotMatch(clientSource, /if \(root\.hasAttribute\("data-low-power"\)\) \{[\s\S]*return;/);
  assert.doesNotMatch(clientSource, /@keyframes dsh-fairy-eye-flicker\s*\{/);
  assert.doesNotMatch(clientSource, /dsh-fairy-flicker-bright/);
  assert.match(clientSource, /dsh-fairy-eye-flicker-overlay/);
  assert.match(clientSource, /dsh-fairy-eye-flicker-overlay[\s\S]*will-change: opacity/);
  assert.match(mascotEyeSvgSource, /dsh-fairy-eye-flicker/);
  assert.match(clientSource, /function scheduleEyeFlicker\(owner, generation\)/);
  assert.match(clientSource, /mode === "threads" \? FAULT_TIMING\.threads\.pulses/);
  assert.match(clientSource, /timing\.gapMin, timing\.gapMax/);
  assert.match(clientSource, /FAULT_TIMING\.threads\.fadeMin, FAULT_TIMING\.threads\.fadeMax/);
  assert.match(clientSource, /root\.getAttribute\("data-state"\) !== "normal"/);
  assert.match(clientSource, /root\.hasAttribute\("data-low-power"\)/);
  assert.match(clientSource, /function stopEyeFlicker\(\)/);
  assert.match(clientSource, /--dsh-fairy-flicker-duration/);
  assert.match(clientSource, /randomBetween\(1750, 3600\) \/ animationRate/);
  assert.doesNotMatch(clientSource, /randomBetween\(1\.035, 1\.065\)/);
  assert.match(clientSource, /randomBetween\(\.026, \.048\)/);
  assert.match(clientSource, /<circle cx="80" cy="80" r="51\.75"\/>/);
  assert.match(clientSource, /<rect x="37" y="37" width="86" height="86"/);
  assert.match(mascotEyeSvgSource, /scleraHaloRadius/);
  assert.equal((mascotEyeSvgSource.match(/<stop offset="\.85" stop-color="#ffffff"/g) || []).length, 0);
  assert.match(clientSource, /<stop offset="\.82" stop-color="#ffffff" stop-opacity="0"\/>/);
  assert.match(clientSource, /<stop offset="\.875" stop-color="#ffffff" stop-opacity="\.28"\/>/);
  assert.match(clientSource, /<stop offset="\.91" stop-color="#ffffff" stop-opacity="\.11"\/>/);
  assert.match(clientSource, /<stop offset="\.96" stop-color="#ffffff" stop-opacity="\.035"\/>/);
  assert.match(mascotEyeSvgSource, /dsh-fairy-sclera-halo/);
  assert.match(mascotEyeSvgSource, /scleraContactStrokeWidth/);
  assert.match(mascotEyeSvgSource, /scleraRadius/);
  assert.match(clientSource, /<pattern id="dsh-fairy-lines" width="4" height="4" patternUnits="userSpaceOnUse">[\s\S]*?<rect width="4" height="1" fill="#c9f8ff" opacity="\.055"\/>/);
  assert.match(clientSource, /@keyframes dsh-fairy-comforting-clip \{\s*from \{ transform: translateY\(-4px\); \}\s*to \{ transform: translateY\(4px\); \}/);
  assert.match(clientSource, /mascot\?\.mount\?\.\(stageNode, owner(?:, state\.settings\.mascotAnimationSpeed)?\)/);
  assert.match(clientSource, /applyVisualState\(requestedState, true, owner, generation\)/);
  assert.match(clientSource, /hostObserver\.observe\(stage, \{ childList: true \}\)/);
  assert.doesNotMatch(clientSource, /dsh-fairy-statechange|bindStateListener|stateChangeListener/);
});

test('keeps Hero subtitle rails fixed instead of viewport-scaled', () => {
  assert.match(styleSource, /dsh-fairy-hero-sub::before,.dsh-fairy-hero-sub::after\{content:'';position:absolute;top:50%;width:240px;height:1px/);
  assert.doesNotMatch(styleSource, /dsh-fairy-hero-sub::before,.dsh-fairy-hero-sub::after\{width:clamp\(/);
});

test('adds an HDD-only session metrics popover sourced from the official stats dock', () => {
  assert.match(adapterSource, /conversationComposerDock: '\[data-slot=\"conversation\.composer\.dock\"\]'/);
  assert.match(adapterSource, /function conversationComposerDock\(scope\)/);
  assert.match(clientSource, /function SessionMetricsControl\(\)/);
  assert.match(clientSource, /conversationComposerDock\(\)\?\.textContent/);
  assert.equal(clientSource.includes('const statItems = stats.split(/\\s*\\|\\s*/)'), true);
  assert.match(clientSource, /dsh-fairy-session-metrics-item/);
  assert.match(clientSource, /observer\.observe\(source, \{ childList: true, subtree: true, characterData: true \}\)/);
  assert.match(clientSource, /'aria-controls': panelId/);
  assert.match(clientSource, /event\.key === 'Escape'/);
  assert.match(clientSource, /ctx\.slots\.register\(\{ name: 'conversation\.session\.header\.utilities', id: 'dsh-fairy-session-metrics', order: 80 \}/);
  assert.match(styleSource, /\.dsh-fairy-session-metrics\{position:relative;display:inline-flex;align-items:center;order:3;margin-left:16px/);
  assert.match(styleSource, /\.dsh-fairy-session-metrics-panel\{position:absolute[^}]*width:min\(280px/);
  assert.match(styleSource, /\.dsh-fairy-session-metrics-item\{display:block/);
});

test('keeps the Hero Chinese subline slightly smaller without changing its spacing', () => {
  assert.match(styleSource, /\.dsh-fairy-hero-sub\{[^}]*font-size:15px/);
  assert.match(styleSource, /\.dsh-fairy-hero-sub\{[^}]*gap:44px/);
});

test('keeps the Hollow hero title independent from mascot visibility', () => {
  const heroHost = heroProjectionSource.slice(heroProjectionSource.indexOf('function HeroHost'), heroProjectionSource.indexOf('function ActiveComposerPlaceholder'));
  assert.doesNotMatch(heroHost, /eyeBottom|data-fairy-eye-visible|dsh-fairy-stage/);
  assert.doesNotMatch(heroHost, /host\.style\.top/);
  assert.match(styleSource, /\.dsh-fairy-hero-host\{position:fixed;z-index:0!important;top:clamp\(96px,calc\(90px \+ min\(36vh,450px\)\),calc\(100dvh - 220px\)\);display:flex/);
  assert.match(styleSource, /top:clamp\(96px,calc\(90px \+ min\(36vh,450px\)\),calc\(100dvh - 220px\)\)/);
  assert.doesNotMatch(styleSource, /dsh-fairy-hero-host[^}]*transition:top/);
  assert.match(styleSource, /white-space:nowrap;opacity:0;visibility:hidden;transition:none!important\}/);
  assert.match(heroHost, /const composerRect = card\.getBoundingClientRect\(\)/);
  assert.match(heroHost, /const bottomInset = hostRect\.bottom - composerRect\.top/);
  assert.doesNotMatch(heroHost, /Math\.min\(hostRect\.height, bottom\)/);
  assert.match(heroHost, /data-dsh-fairy-sidebar-layer/);
  assert.match(heroHost, /const sidebarRect = sidebarPaint\?\.getBoundingClientRect\(\)/);
  assert.match(heroHost, /const sidebarOnLeft = sidebarRect\.right <= heroRect\.left \+ heroRect\.width \* \.5/);
  assert.match(heroHost, /host\.style\.clipPath = `inset\(0 \$\{rightInset\}px/);
  assert.match(heroHost, /host\.style\.webkitClipPath = `inset\(0 \$\{rightInset\}px/);
  assert.match(heroHost, /resizeObserver\.observe\(card\)/);
  assert.match(heroHost, /'data-sidebar-collapsed'/);
  assert.match(heroHost, /sidebarLayoutObserver\.observe\(nextSidebar/);
  assert.doesNotMatch(styleSource, /dsh-fairy-hero-composer/);
  assert.doesNotMatch(heroHost, /maskImage|webkitMaskImage|mask-image|webkit-mask-image/);
  assert.doesNotMatch(styleSource, /dsh-fairy-hero-main:(?:before|after)/);
  assert.match(heroHost, /dsh-fairy-hero-projection-text-1/);
  assert.match(heroHost, /dsh-fairy-hero-projection-text-2/);
  assert.match(heroHost, /dsh-fairy-hero-projection-text-3/);
  assert.match(heroHost, /dsh-fairy-hero-projection-text-4/);
  assert.match(heroHost, /HOLLOW DEEP DIVE SYSTEM/);
  assert.doesNotMatch(heroHost, /Hollow Deep Dive System/);
  assert.doesNotMatch(heroHost, /className: 'dsh-fairy-hero-projection dsh-fairy-hero-projection-[1-4]'/);
  assert.match(heroHost, /dsh-fairy-hero-projection-svg/);
  assert.match(heroHost, /const heroMaskIdRef = React\.useRef\(null\)/);
  assert.match(heroHost, /heroMaskIdRef\.current = `dsh-fairy-hero-mask-\$\{\+\+heroMaskInstanceSeed\}`/);
  assert.match(heroHost, /id: `\$\{heroMaskId\}-2`/);
  assert.match(heroHost, /id: `\$\{heroMaskId\}-3`/);
  assert.match(heroHost, /id: `\$\{heroMaskId\}-4`/);
  assert.match(heroHost, /mask: `url\(#\$\{heroMaskId\}-2\)`/);
  assert.match(heroHost, /mask: `url\(#\$\{heroMaskId\}-3\)`/);
  assert.match(heroHost, /mask: `url\(#\$\{heroMaskId\}-4\)`/);
  assert.match(heroHost, /maskType: 'luminance'/);
  assert.equal((heroHost.match(/transform: 'matrix\(1 0 0 -1 0 132\)'/g) || []).length, 1);
  assert.equal((heroHost.match(/transform: 'matrix\(1 0 0 -1 0 180\)'/g) || []).length, 1);
  assert.equal((heroHost.match(/transform: 'matrix\(1 0 0 -1 0 240\)'/g) || []).length, 1);
  assert.equal((heroHost.match(/transform: 'matrix\(1 0 0 -1 0 312\)'/g) || []).length, 1);
  assert.match(heroHost, /dsh-fairy-hero-mask-text-1-for-2', x: '50%', y: '114'/);
  assert.match(heroHost, /dsh-fairy-hero-mask-text-1-for-3', x: '50%', y: '174'/);
  assert.match(heroHost, /dsh-fairy-hero-mask-text-2-for-3', x: '50%', y: '150'/);
  assert.match(heroHost, /dsh-fairy-hero-mask-text-1-for-4', x: '50%', y: '246'/);
  assert.match(heroHost, /dsh-fairy-hero-mask-text-2-for-4', x: '50%', y: '222'/);
  assert.match(heroHost, /dsh-fairy-hero-mask-text-3-for-4', x: '50%', y: '192'/);
  assert.doesNotMatch(heroHost, /dsh-fairy-hero-mask-text[^}]+transform:/);
  assert.match(styleSource, /dsh-fairy-hero-projection-text-1[^}]*transform:matrix\(1,0,0,-1,0,76\)/);
  assert.match(styleSource, /dsh-fairy-hero-projection-text-4[^}]*transform:matrix\(1,0,0,-1,0,172\)/);
  assert.match(styleSource, /dsh-fairy-hero-mask-text-1-for-2\{y:62px\}/);
  assert.match(styleSource, /dsh-fairy-hero-mask-text-3-for-4\{y:106px\}/);
  assert.doesNotMatch(styleSource, /transform:scaleY\(-1\)/);
  assert.match(styleSource, /dsh-fairy-hero-projection-svg\{position:absolute;left:0;top:0;width:100%;height:220px/);
  assert.match(styleSource, /dsh-fairy-hero-projection-svg\{top:-2px;transform:translateX\(2px\)\}/);
  assert.match(styleSource, /dsh-fairy-hero-sub\{transform:translateY\(-8px\)\}/);
  assert.doesNotMatch(styleSource, /dsh-fairy-hero-sub-char\{transform:/);
  assert.match(styleSource, /@media\(max-width:520px\)\{\.dsh-fairy-hero-projection-svg\{top:1px\}\.dsh-fairy-hero-sub\{transform:translateX\(2px\)\}/);
  assert.match(styleSource, /dsh-fairy-hero-projection-text-1\{fill:#c9dce9;opacity:\.20\}/);
  assert.match(styleSource, /dsh-fairy-hero-projection-text-2\{fill:#a7c2d4;opacity:\.14\}/);
  assert.match(styleSource, /dsh-fairy-hero-projection-text-3\{fill:#7f9fb8;opacity:\.085\}/);
  assert.match(styleSource, /dsh-fairy-hero-projection-text-4\{fill:#5d82a0;opacity:\.045\}/);
  assert.match(styleSource, /dsh-fairy-hero-mask-text\{fill:#000!important;opacity:1!important\}/);
  assert.doesNotMatch(styleSource, /dsh-fairy-hero-projection-[1-4]\{top:/);
  assert.doesNotMatch(styleSource, /el\.textContent \+= ``/);
  assert.match(styleSource, /dsh-fairy-hero-main\{position:relative;z-index:0;isolation:isolate;color:#f4f7fb;font-family:"Avenir Next","Arial Narrow","DIN Condensed","Microsoft YaHei",sans-serif;font-size:52px;font-weight:750/);
  assert.doesNotMatch(styleSource, /dsh-fairy-hero-main\{font-size:52px!important\}/);
  assert.match(styleSource, /dsh-fairy-hero-host\{position:fixed;[^}]*gap:2px/);
  assert.match(styleSource, /dsh-fairy-hero-host\{top:clamp\(86px,[^}]*gap:2px/);
  assert.match(styleSource, /dsh-fairy-hero-sub\{position:relative;display:flex/);
  assert.match(styleSource, /dsh-fairy-hero-sub::before,.dsh-fairy-hero-sub::after\{content:'';position:absolute;top:50%;width:240px;height:1px;background:currentColor/);
  assert.match(styleSource, /dsh-fairy-hero-sub::before\{right:calc\(100% \+ 12px\)\}/);
  assert.match(styleSource, /dsh-fairy-hero-sub::after\{left:calc\(100% \+ 12px\)\}/);
});

test('lowers persistent HDD layers beneath the native settings modal', () => {
  assert.match(clientSource, /data-dsh-fairy-overlay-layer/);
  assert.match(adapterSource, /\[data-slot="sidebar\.settings"\] \[role="dialog"\]/);
  assert.match(clientSource, /toggleAttribute\('data-dsh-fairy-modal-open', modalOpen\)/);
  assert.match(clientSource, /removeAttribute\('data-dsh-fairy-modal-open'\)/);
  assert.match(styleSource, /data-dsh-fairy-modal-open.*data-dsh-fairy-overlay-layer/);
  assert.match(styleSource, /data-dsh-fairy-modal-open.*data-dsh-fairy-composer-dock/);
  assert.match(styleSource, /data-dsh-fairy-modal-open.*data-dsh-fairy-sidebar-layer.*::after\{z-index:0/);
});

test('keeps native card ownership and flat selected-session presentation', () => {
  assert.match(styleSource, /data-dsh-fairy-native-new-session="true"/);
  assert.match(styleSource, /data-dsh-fairy-native-new-session="true"\]\:active\{filter:brightness\(\.84\)!important;transform:translateY\(1px\)!important\}/);
  assert.match(styleSource, /DeepSeek 余额/);
  assert.match(styleSource, /background-clip:padding-box,padding-box,padding-box,padding-box,border-box/);
  assert.match(styleSource, /data-dsh-fairy-selected-session="true"\]\{background-color:var\(--dsh-selected-fill\)!important;background-image:none!important;border:0!important;box-shadow:none!important\}/);
  assert.doesNotMatch(styleSource, /--dsh-selected-gradient|--dsh-selected-grain-/);
  assert.match(styleSource, /width:calc\(100% - 4px\)!important;min-width:0!important;height:62px!important;min-height:62px!important;margin:10px 2px 6px!important;.*top:4px!important/);
  assert.match(styleSource, /grid-template-columns:max-content max-content max-content max-content/);
  assert.match(styleSource, /justify-content:space-between!important/);
  assert.match(styleSource, /div:nth-child\(1\),html[^}]*div:nth-child\(2\)\{display:contents!important\}/);
  assert.match(styleSource, /grid-template-columns:max-content max-content!important/);
  assert.match(styleSource, /clip-path:none!important;-webkit-mask-image:none!important;mask-image:none!important;border-radius:8px!important/);
  assert.doesNotMatch(styleSource, /data:image\/svg\+xml/);
  assert.match(styleSource, /DeepSeek 余额.*>div:nth-child\(3\)\{display:grid!important;grid-template-columns:max-content max-content!important;column-gap:0!important;justify-content:space-between!important;grid-column:1 \/ span 2!important;grid-row:2!important;width:100%!important;max-width:100%!important/);
  assert.match(clientSource, /const dailyRow = balance\.children\[1\]/);
  assert.match(clientSource, /const rectUnion = \(nodes\) =>/);
  assert.match(clientSource, /dailyRect\.left \+ \(dailyRect\.width - POWER_TOGGLE_WIDTH\) \/ 2/);
  assert.match(clientSource, /amountRect\.top \+ \(amountRect\.height - POWER_TOGGLE_HEIGHT\) \/ 2/);
  assert.match(constantsSource, /POWER_TOGGLE_WIDTH = 82/);
  assert.match(constantsSource, /POWER_TOGGLE_HEIGHT = 22/);
  assert.match(clientSource, /on \? '省电模式' : '普通模式'/);
  assert.match(styleSource, /dsh-fairy-power-toggle\{[^}]*width:82px;height:22px/);
  assert.match(styleSource, /font-size:11px!important;line-height:14px!important;letter-spacing:\.12em!important/);
});

test('shares the new-session material with the voice volume hardware', () => {
  assert.match(styleSource, /data-dsh-fairy-composer-voice-control="true"\]\{--dsh-card-fill:#30353a/);
  assert.match(styleSource, /data-dsh-fairy-composer-voice-control="true"\]\{[^}]*--dsh-card-border:linear-gradient\(135deg,#555f68/);
  assert.match(styleSource, /data-dsh-fairy-composer-voice-control="true"\]\{[^}]*box-shadow:-4px -4px 9px rgba\(255,255,255,\.06\),5px 6px 13px rgba\(0,0,0,\.13\)/);
  assert.match(styleSource, /data-dsh-fairy-composer-voice-control="true"\]\{background-image:radial-gradient\(circle at 1px 1px,var\(--dsh-card-grain-light\)/);
  assert.match(styleSource, /data-dsh-fairy-theme="light"[^}]*data-dsh-fairy-composer-voice-control="true"\]\{--dsh-card-fill:#f4f5f6/);
  assert.match(styleSource, /data-dsh-fairy-composer-voice-control="true"\] \[data-dsh-fairy-volume-input="true"\]\{[^}]*opacity:0!important/);
  assert.match(styleSource, /data-dsh-fairy-wave-bar="true"\]\{width:2px!important;min-width:0!important;max-width:2px!important;flex:1 1 2px!important/);
  assert.match(styleSource, /data-dsh-fairy-mascot-scale-control="true"\]\{top:31px!important;box-shadow:-4px -4px 9px/);
  assert.match(styleSource, /data-dsh-fairy-theme="light"[^}]*data-dsh-fairy-mascot-scale-control="true"\]\{box-shadow:-4px -4px 9px rgba\(255,255,255,\.46\)/);
});

test('keeps the Composer command control aligned with the input edge inset', () => {
  assert.match(styleSource, /data-dsh-fairy-composer-command-control="true"\]\{left:var\(--dsh-fairy-composer-wing\)!important\}/);
  assert.doesNotMatch(styleSource, /data-dsh-fairy-composer-command-control="true"\]\{left:calc\(var\(--dsh-fairy-composer-wing\) \+ 3px\)!important\}/);
});

test('mirrors the official session preset into a read-only HDD Composer and hides only its HDD header duplicate', () => {
  assert.match(adapterSource, /function sessionAgentPresetLabel\(scope\)/);
  assert.match(composerDockSource, /syncWorkspaceProjectionModeModule\(workspaceProjection, sessionAgentPresetLabel\(conversation\)\)/);
  assert.match(composerDockSource, /characterData: true/);
  assert.match(composerWorkspaceSource, /data-dsh-fairy-composer-mode-pending/);
  assert.match(styleSource, /data-dsh-fairy-mode=\"hdd\"\] \[data-dsh-fairy-header-session-agent-preset=\"true\"\]\{display:none!important\}/);
  assert.match(clientSource, /data-dsh-fairy-header-session-agent-preset/);
});

test('keeps the Hero workspace controls interactive and Active projection disabled', () => {
  assert.match(bundle, /data-dsh-fairy-composer-workspace-projection/);
  assert.match(bundle, /button\.disabled = true/);
  assert.match(styleSource, /data-dsh-fairy-composer-workspace="true"\]\{pointer-events:auto!important/);
  assert.match(styleSource, /data-dsh-fairy-composer-workspace-projection="true"\]\{opacity:\.46!important/);
  assert.match(composerMarkerSource, /const modeButton = workspaceRow\s*\? \[\.\.\.workspaceRow\.querySelectorAll\('button'\)\]/);
});

test('owns composer resize dragging outside transient phase content', () => {
  assert.match(composerResizeSource, /createPointerDrag/);
  assert.match(composerResizeSource, /pointerDrag\.start\(event, payload\)/);
  assert.match(composerResizeSource, /getLockNodes: \(\) => \[getSeat\(\)\]/);
  assert.match(composerResizeSource, /const finishDragging = \(event, persist\)/);
  assert.match(composerResizeSource, /pointerDrag\.finish\(event, persist/);
  assert.match(composerResizeSource, /pointerDrag\?\.dispose\(\)/);
  assert.doesNotMatch(composerResizeSource, /window\.addEventListener\('pointermove'/);
  assert.match(composerDockSource, /if \(!resizeController\.dragging\) height = readHeight\(\)/);
  assert.match(composerDockSource, /const resizeController = createResizeController/);
  assert.match(composerResizeSource, /keeps the transition lock through the release frame/);
  assert.match(composerResizeSource, /reason === 'blur' \|\| reason === 'pointercancel'/);
  assert.match(composerResizeSource, /pointerDrag\?\.dispose/);
  assert.match(composerResizeSource, /pointer-drag/);
  assert.match(composerDockSource, /pendingPersistedHeight/);
  assert.match(composerInsetSource, /--dsh-fairy-composer-inset/);
  assert.match(composerInsetSource, /setProperty\('padding-bottom', 'calc\(' \+ basePadding/);
  assert.doesNotMatch(composerInsetSource, /style\.setProperty\('--dsh-composer-height'/);
  const restoreSeatStart = composerDockSource.indexOf('  const restoreSeat =');
  const resizeControllerStart = composerDockSource.indexOf('\n  const resizeController =', restoreSeatStart);
  assert.ok(restoreSeatStart >= 0 && resizeControllerStart > restoreSeatStart, 'composer restore path should be present');
  const restoreSeatSource = composerDockSource.slice(restoreSeatStart, resizeControllerStart);
  assert.ok(
    restoreSeatSource.indexOf('clearScrollInsets();') < restoreSeatSource.indexOf('if (!seat) return;'),
    'scroll insets must clear even when the official seat is already absent',
  );
});

test('uses one composer height contract and restores official inline priorities', () => {
  assert.match(composerDockSource, /createResizeController, HEIGHT_MIN, HEIGHT_MAX/);
  assert.doesNotMatch(composerDockSource, /const HEIGHT_MIN = 132/);
  assert.match(composerDockSource, /priority: seat\.style\.getPropertyPriority\(name\)/);
  assert.match(composerDockSource, /seat\.style\.setProperty\(name, value, priority\)/);
  assert.match(composerDockSource, /resizeObserver\?\.disconnect\(\);\s*resizeObserver = null;\s*conversation = null;\s*surface = null/);
});

test('diagnoses visual setting failures through one asynchronous boundary', () => {
  assert.match(settingsWriteSource, /Promise\.resolve\(controller\.set\(field, value\)\)/);
  assert.match(settingsWriteSource, /settings\.persist/);
  assert.match(settingsWriteSource, /DSH_FAIRY_LOG/);
  assert.match(clientSource, /const save = saveControllerSetting/);
  assert.match(composerDockSource, /settingError\('composerDockHeight', error\)/);
  assert.match(mascotScaleSource, /settingError\('mascotScale', error\)/);
  assert.doesNotMatch(clientSource, /controller\.set\(field, value\)\.catch\(\(\) => \{\}\)/);
});

test('locks native selection only for explicit drag handles', () => {
  assert.match(selectionGuardSource, /data-dsh-fairy-selection-lock/);
  assert.match(selectionGuardSource, /selectstart/);
  assert.match(clientSource, /OFFICIAL_SELECTORS\.sidebarResizeHandle/);
  assert.match(clientSource, /dsh-history-overlay-scrollbar-thumb/);
  assert.match(styleSource, /data-dsh-fairy-selection-lock="true"/);
});

test('keeps composer responsibilities split around the official seat', () => {
  assert.match(composerDockSource, /placeNativeControlMarkers/);
  assert.match(composerDockSource, /createMaterialLayer/);
  assert.match(composerDockSource, /createInsetSynchronizer/);
  assert.match(composerDockSource, /createComposerSessionResolver/);
  assert.match(composerDockSource, /createResizeController/);
  assert.match(composerMarkerSource, /function markControls/);
  assert.match(composerMaterialSource, /function syncMaterialLayer/);
  assert.match(composerNativeSource, /function placeNativeControlMarkers/);
  assert.match(composerWorkspaceSource, /function ensureWorkspaceProjection/);
  assert.match(composerWorkspaceSource, /existingProjection\?\.remove\(\)/);
  assert.match(composerWorkspaceSource, /existingProjection\.parentElement === stack/);
  assert.match(composerResizeSource, /function createResizeController/);
  assert.match(composerInsetSource, /function createInsetSynchronizer/);
  assert.match(composerSessionSource, /function createComposerSessionResolver/);
  assert.match(composerDockSource, /createChatContentAnchor/);
  assert.match(composerDockSource, /getFlowNodes: \(\) => chatFlows\(conversation\)/);
  assert.match(composerDockSource, /contentAnchor\.(flush|schedule|clear)/);
  assert.match(composerAnchorSource, /dsh-fairy-chat-content-anchored/);
  assert.match(composerAnchorSource, /const ANCHOR_MIN_HEIGHT/);
  assert.match(composerAnchorSource, /new ResizeObserver\(schedule\)/);
  assert.match(composerAnchorSource, /parentBottomPadding/);
  assert.match(composerAnchorSource, /availableHeight/);
  assert.doesNotMatch(composerAnchorSource, /scroll.*addEventListener|clip-path|occlusion-bottom/);
  assert.doesNotMatch(styleSource, /dsh-fairy-chat-content-occluded|dsh-fairy-chat-occlusion-bottom/);
  assert.match(styleSource, /dsh-fairy-chat-content-anchored/);
  assert.match(styleSource, /--dsh-input-substrate-image/);
  assert.match(styleSource, /background-attachment:fixed!important/);
  assert.match(composerWorkspaceSource, /button\.disabled = true/);
  assert.doesNotMatch(composerWorkspaceSource, /addEventListener/);
  assert.match(composerDockSource, /domObserverManager\.scheduleFrame\(layoutFrameKey, sync\)/);
  assert.match(composerDockSource, /domObserverManager\.scheduleFrame\(structureFrameKey, bind\)/);
  assert.doesNotMatch(composerDockSource, /function markControls/);
  assert.match(composerDockSource, /clearMarkerTree/);
  assert.match(composerDockSource, /workspaceProjection\?\.remove\(\)/);
  const syncStart = composerDockSource.indexOf('  function sync() {');
  const bindStart = composerDockSource.indexOf('\n  function bind()', syncStart);
  assert.ok(syncStart >= 0 && bindStart > syncStart, 'composer dock sync body should be present');
  const syncSource = composerDockSource.slice(syncStart, bindStart);
  assert.match(syncSource, /if \(!enabled\(\)\) \{[\s\S]*?restoreSeat\(\);[\s\S]*?return;/);
  assert.doesNotMatch(syncSource, /restoreSeat\(\{ clearWorkspaceTemplate: true \}\)/);
  assert.match(composerDockSource, /workspaceTemplate = null/);
  assert.match(composerMarkerSource, /data-dsh-fairy-composer-attachments/);
  assert.match(composerDockSource, /attachmentRailHeight\(attachmentSlot\(card\)\)/);
  assert.match(composerDockSource, /getRenderedHeight: renderedHeight/);
  assert.match(composerMaterialSource, /function unionRect/);
  assert.match(styleSource, /data-dsh-fairy-composer-attachments="true"/);
});

test('keeps the seat workspace template across card replacement for disabled projections', () => {
  const cardReplacement = composerDockSource.match(/} else if \(currentCard !== card\) \{([\s\S]*?)\n    \}/)?.[1] ?? '';
  assert.match(cardReplacement, /workspaceProjection\?\.remove\(\)/);
  assert.doesNotMatch(cardReplacement, /workspaceTemplate = null/);
  assert.match(composerDockSource, /if \(currentConversation !== conversation \|\| currentSeat !== seat\) \{[\s\S]*?restoreSeat\(\);/);
  assert.match(composerDockSource, /const workspaceRow = seat\?\.querySelector\('\[data-dsh-fairy-composer-workspace="true"\]:not\(\[data-dsh-fairy-composer-workspace-projection="true"\]\)'\);/);
  assert.match(composerWorkspaceSource, /if \(!stack \|\| !workspaceTemplate\) \{/);
  assert.match(composerWorkspaceSource, /button\.disabled = true/);
});

test('preserves the workspace template across an HDD mode round trip', () => {
  assert.match(composerDockSource, /const restoreSeat = \(\{ clearWorkspaceTemplate = false \} = \{\}\) =>/);
  const syncStart = composerDockSource.indexOf('  function sync() {');
  const bindStart = composerDockSource.indexOf('\n  function bind()', syncStart);
  assert.ok(syncStart >= 0 && bindStart > syncStart, 'composer dock sync body should be present');
  const syncSource = composerDockSource.slice(syncStart, bindStart);
  assert.match(syncSource, /if \(!enabled\(\)\) \{[\s\S]*?restoreSeat\(\);[\s\S]*?return;/);
  assert.doesNotMatch(syncSource, /restoreSeat\(\{ clearWorkspaceTemplate: true \}\)/);
  assert.match(composerDockSource, /if \(currentConversation !== conversation \|\| currentSeat !== seat\) \{\s*restoreSeat\(\);/);
  assert.match(composerDockSource, /if \(clearWorkspaceTemplate\) workspaceTemplate = null/);
  assert.match(composerDockSource, /restoreSeat\(\{ clearWorkspaceTemplate: true \}\);\n  \};/);
});

test('rebinds the composer dock when the official conversation surface is replaced', () => {
  assert.match(composerDockSource, /if \(currentConversation !== conversation \|\| currentSeat !== seat\) \{/);
  assert.match(composerDockSource, /inspect the inserted or removed subtree before retaining references/);
  assert.match(composerDockSource, /node\.matches\?\.\(`\[\$\{OFFICIAL_ATTRIBUTES\.composerSeat\}\]`\) \|\| node\.querySelector\?\.\(`\[\$\{OFFICIAL_ATTRIBUTES\.composerSeat\}\]`\)/);
});

test('starts session transition with a captured base and defers heavy glitch layers', () => {
  assert.match(visualTransitionsSource, /const base = this\.cloneFrame\(region\.frame\)/);
  assert.match(visualTransitionsSource, /const addSlices = \(\) => \{/);
  assert.match(visualTransitionsSource, /requestAnimationFrame\(addSlices\)/);
  assert.match(visualTransitionsSource, /this\.sliceFrame !== null\) cancelAnimationFrame/);
  assert.match(visualTransitionsSource, /Clone the already captured base/);
});

test('owns mode and theme transition cleanup', () => {
  assert.match(visualTransitionsSource, /class ModeTransition/);
  assert.match(visualTransitionsSource, /class SessionTransition/);
  assert.match(visualTransitionsSource, /createSessionTransition: \(\) => new SessionTransition\(\)/);
  assert.match(visualTransitionsSource, /cleanup = \(\) =>/);
  assert.match(visualTransitionsSource, /setTimeout\(this\.cleanup, duration \+ 50\)/);
  const sessionTransitionSource = visualTransitionsSource.slice(visualTransitionsSource.indexOf('class SessionTransition'), visualTransitionsSource.indexOf('class ThemeTransition'));
  assert.match(visualTransitionsSource, /FAIRY_CONTAINER_STYLE = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;'/);
  assert.match(sessionTransitionSource, /data-dsh-session-transition-region/);
  assert.match(sessionTransitionSource, /const regionSurface = anyPhase\?\.\(surface\) \|\| surface/);
  assert.match(sessionTransitionSource, /composerCard\?\.\(composerSeat\?\.\(surface\)\)/);
  assert.match(clientSource, /createVisualTransitions\(\{ rootSlot, modeAttr: MODE_ATTR, conversation, anyPhase, composerSeat, composerCard \}\)/);
  assert.match(sessionTransitionSource, /clipPath: `inset\(\$\{top\}px \$\{right\}px \$\{bottom\}px \$\{left\}px\)`/);
  assert.doesNotMatch(sessionTransitionSource, /data-dsh-transition-layer', 'bar'/);
  assert.match(visualTransitionsSource, /class ThemeTransition/);
  assert.match(visualTransitionsSource, /const THEME_TRANSITION_DURATION_MS = 480/);
  assert.match(visualTransitionsSource, /duration: THEME_TRANSITION_DURATION_MS/);
  assert.match(styleSource, /view-transition-group\(dsh-fairy-theme\)\{animation-duration:480ms\}/);
  assert.match(styleSource, /dsh-fairy-theme-out 400ms/);
  assert.match(styleSource, /dsh-fairy-theme-in 480ms/);
  assert.match(visualTransitionsSource, /this\.current\?\.skipTransition\?\.\(\)/);
  assert.match(visualTransitionsSource, /this\.animation\?\.cancel\?\.\(\)/);
  assert.match(visualTransitionsSource, /function settleVisualTransition\(promise, label\)/);
  assert.doesNotMatch(clientSource, /\.finished\.catch\(\(\) => \{\}\)/);
  assert.match(clientSource, /this\.sessionTransition = visualTransitions\.createSessionTransition\(\)/);
  assert.match(clientSource, /this\.hasBoundSession && id !== this\.boundSessionId && this\.state\.settings\.enabled/);
  assert.match(controllerLifecycleSource, /ownModeTheme\(scope, controller\.modeTransition, controller\.themeTransition, controller\.sessionTransition\)/);
  assert.match(modeThemeSource, /modeTransition\?\.dispose/);
  assert.match(modeThemeSource, /themeTransition\?\.dispose/);
});

test('uses one owner scope for every Fairy Visual lifecycle responsibility', () => {
  assert.match(lifecycleSource, /const singletonOwners = new WeakMap/);
  assert.match(lifecycleSource, /function claimSingleton/);
  assert.match(clientSource, /claimSingleton\(document, 'stage-host'/);
  assert.match(semanticMarkerSource, /claimSemanticMarkers/);
  assert.match(scrollbarSource, /claimScrollbarLifecycle/);
  assert.match(stageLifecycleSource, /claimStageGeometryLifecycle/);
  assert.match(stageLifecycleSource, /claimContentFadeLifecycle/);
  assert.match(geometrySource, /claimGeometryLifecycle/);
  assert.match(mascotSource, /claimMascotLifecycle/);
  assert.match(brandGeometrySource, /claimBrandSidebarGeometry/);
  assert.match(powerModeSource, /claimPowerModeGeometry/);
  assert.match(composerDockSource, /claimSingleton\(document, 'composer-dock'/);
  assert.match(lifecycleSource, /const interval = \(callback, delay(?:, label = null)?\) =>/);
  assert.match(lifecycleSource, /const abortController = \(label = null\) =>/);
  assert.match(selectionGuardSource, /visibilitychange/);
  assert.match(selectionGuardSource, /pagehide/);
  assert.match(source, /onDocumentVisibilityChange/);
  assert.doesNotMatch(clientSource, /mascot-document-lifecycle/);
  assert.match(clientSource, /const beginsThreadBurst = signal\.getAttribute\("data-glitch"\) !== "threads"/);
  assert.match(clientSource, /createMascotEventScheduler/);
  assert.match(clientSource, /migrateVisualSettings/);
  assert.match(clientSource, /eventScheduler\.activeCount/);
  assert.match(mascotStyleSource, /data-low-power\] \.dsh-fairy-layer-one,[\s\S]*will-change: auto/);
  assert.match(mascotEyeSvgSource, /data-fault-source="true"/);
  assert.match(clientSource, /threads: Object\.freeze\(\{ pulses: 4, gapMin: 30, gapMax: 42, fadeMin: 34, fadeMax: 76 \}\)/);
  assert.match(clientSource, /blocks: Object\.freeze\(\{ gapMin: 56, gapMax: 104, fadeMin: 48, fadeMax: 96 \}\)/);
  assert.doesNotMatch(clientSource, /function blockSliceScale/);
});

test('cleans visual document state, observers, timers, and the mascot node', () => {
  assert.match(clientSource, /observer\?\.disconnect\(\)/);
  assert.match(clientSource, /resizeObserver\?\.disconnect\(\)/);
  assert.match(clientSource, /structureObserver\?\.disconnect\(\)/);
  assert.match(clientSource, /document\.documentElement\.removeAttribute\('data-dsh-fairy-visual'\)/);
  assert.match(clientSource, /mascotRuntime\?\.dispose\?\.\(\)/);
  assert.match(clientSource, /style\.setAttribute\("data-plugin", "dsh-fairy-visual"\)/);
  assert.match(clientSource, /document\.getElementById\(STYLE_ID\)\?\.remove\(\)/);
  assert.match(clientSource, /removeFairyContainer\(\)/);
  assert.match(clientSource, /window\.removeEventListener\('resize', scheduleContentFade\)/);
  assert.doesNotMatch(clientSource, /window\.removeEventListener\('resize', scheduleContentFade\);\s*window\.removeEventListener\('resize', scheduleContentFade\)/);
});

test('anchors the original content mask to the transcript surface, never the composer viewport', () => {
  // Masking [data-conversation-scroll] also masked the composer it contains,
  // which punched the input text out through the radial gradient. Prefer the
  // chat-flow transcript node and keep the scroll container as a fallback.
  assert.match(clientSource, /const nextSurface = chatFlows\(document\)\[0\] \|\| conversationScroll\(conversation\(document\)\)/);
  assert.match(clientSource, /const hasActiveChatFlow = chatFlows\(document\)\.some/);
  assert.match(clientSource, /const eyeBoundary = eye\.querySelector\('\.dsh-fairy-outer-disc'\) \|\| eye/);
  assert.match(clientSource, /const eyeRect = eyeBoundary\.getBoundingClientRect\(\)/);
  assert.match(clientSource, /const surfaceRect = surface\.getBoundingClientRect\(\)/);
  assert.match(clientSource, /observedEye !== eyeBoundary/);
  assert.match(clientSource, /resizeObserver\.observe\(eyeBoundary\)/);
  assert.match(clientSource, /resizeObserver\.observe\(surface\)/);
  assert.match(clientSource, /Math\.max\(56, Math\.min\(76, eyeRect\.width \* \.24\)\)/);
  assert.match(clientSource, /Math\.max\(46, Math\.min\(64, eyeRect\.height \* \.20\)\)/);
  assert.match(clientSource, /Math\.round\(eyeRect\.width \* \.5 \+ fadeFeatherX\)/);
  assert.match(clientSource, /Math\.round\(eyeRect\.height \* \.5 \+ fadeFeatherY\)/);
  assert.match(clientSource, /eyeRect\.width \* \.5 \/ fadeRadiusX/);
  assert.match(clientSource, /eyeRect\.height \* \.5 \/ fadeRadiusY/);
  assert.match(clientSource, /surface\.style\.setProperty\('--dsh-fade-x', Math\.round\(eyeX - surfaceRect\.left\)/);
  assert.match(clientSource, /surface\.style\.setProperty\('--dsh-fade-y', Math\.round\(eyeY - surfaceRect\.top\)/);
  assert.match(clientSource, /surface\.style\.setProperty\('--dsh-fade-core', asFadePercent\(eyeBoundaryRatio\)\)/);
  assert.match(clientSource, /surface\.classList\.add\('dsh-fairy-content-mask'\)/);
  assert.match(clientSource, /surface\.classList\.add\('dsh-fairy-content-fade'\)/);
  assert.match(styleSource, /@property --dsh-fairy-mask/);
  assert.match(styleSource, /\.dsh-fairy-content-mask\{--dsh-fairy-mask:0/);
  assert.match(styleSource, /var\(--dsh-fade-rx,165px\) var\(--dsh-fade-ry,155px\)/);
  assert.match(styleSource, /var\(--dsh-fairy-mask\) \* \.995/);
  assert.match(styleSource, /var\(--dsh-fairy-mask\) \* \.88/);
  assert.match(styleSource, /var\(--dsh-fairy-mask\) \* \.62/);
  assert.match(styleSource, /var\(--dsh-fairy-mask\) \* \.28/);
  assert.match(styleSource, /var\(--dsh-fade-core,75%\)/);
  assert.doesNotMatch(styleSource, /backdrop-filter|dsh-fairy-content-veil/);
  assert.doesNotMatch(clientSource, /data-dsh-fairy-content-veil/);
  assert.doesNotMatch(source, /chatFlowScroll|addEventListener\('scroll', scheduleContentFade/);
  assert.doesNotMatch(clientSource, /data-dsh-fairy-chat-surface/);
});

test('keeps the sidebar hardware above the composer edge in every session', () => {
  assert.match(styleSource, /data-dsh-fairy-composer-dock="true"\]\{position:fixed!important;bottom:0!important;box-sizing:border-box!important;z-index:1!important/);
  assert.match(styleSource, /data-dsh-fairy-sidebar-layer="true"\]\{position:relative!important;z-index:2!important/);
});

test('keeps the composer edge inside the card stacking context below nested control popovers', () => {
  assert.match(styleSource, /data-dsh-fairy-composer-dock="true"\]\:\:before\{display:none!important/);
  assert.match(styleSource, /data-dsh-fairy-composer-dock="true"\] \[data-composer-card="true"\]\:\:before\{content:'';position:absolute;z-index:3;/);
  assert.match(styleSource, /\.dsh-fairy-composer-resizer\{[^}]*z-index:20/);
  assert.match(styleSource, /data-dsh-fairy-composer-reasoning-control="true"\]\{z-index:30!important\}/);
  assert.match(styleSource, /data-dsh-fairy-composer-stack="true"\]\[data-dsh-fairy-model-menu-open="true"\]\{z-index:21!important\}/);
  assert.match(composerDockSource, /data-dsh-fairy-model-menu-open/);
});

test('keeps the settings schema backward-compatible and mode-scoped', () => {
  assert.match(serverSource, /version: z\.number\(\)\.step\(1\)\.default\(FAIRY_VISUAL_SETTINGS_VERSION\)/);
  assert.match(serverSource, /composerDockHeight: z\.number\(\)\.step\(1\)\.min\(132\)\.max\(420\)\.default\(132\)/);
  assert.match(serverSource, /theme: z\.union\(\['dark', 'light'\]\)\.default\('dark'\)/);
  assert.match(serverSource, /powerMode: z\.union\(\['normal', 'low-power'\]\)\.default\('normal'\)/);
  assert.match(serverSource, /mascotScale: z\.number\(\)\.step\(0\.01\)\.min\(0\.55\)\.max\(1\)\.default\(1\)/);
  assert.match(serverSource, /mascotAnimationSpeed: z\.union\(\[z\.const\(0\.7\), z\.const\(1\), z\.const\(1\.5\)\]\)\.default\(1\)/);
  assert.match(constantsSource, /mascotScale: 1/);
  assert.match(constantsSource, /mascotAnimationSpeed: 1/);
  assert.match(clientSource, /syncDocumentMode\(settings\.getSnapshot\(\)\)/);
});

test('keeps Fairy scale control removed from the voice hardware', () => {
  assert.doesNotMatch(clientSource, /createMascotScaleControl/);
  assert.match(clientSource, /scheduleMascotScale\(state\.settings\.mascotScale\)/);
  assert.match(clientSource, /mascot\?\.mount\?\.\(stageNode, owner, state\.settings\.mascotAnimationSpeed\)/);
  assert.match(mascotRuntimeSource, /function mount\(stageNode, owner, persistedRate\)/);
  assert.match(mascotRuntimeSource, /setAnimationRate\(persistedRate === undefined \? animationRate : persistedRate\)/);
  assert.match(clientSource, /MASCOT_GEOMETRY_EVENT/);
  assert.match(clientSource, /window\.addEventListener\(MASCOT_GEOMETRY_EVENT, scheduleContentFade/);
  assert.match(clientSource, /window\.removeEventListener\(MASCOT_GEOMETRY_EVENT, scheduleContentFade/);
  assert.match(mascotScaleSource, /MASCOT_GEOMETRY_EVENT = 'dsh-fairy-mascot-geometry'/);
  assert.match(mascotScaleSource, /notifyMascotGeometry\(documentRef, scale\)/);
  assert.match(mascotEffectsSvgSource, /class="dsh-fairy-halo dsh-fairy-halo-layer" viewBox="-180 -70 520 320"/);
  assert.match(clientSource, /const leftLength = 158 \+ leftWave \* 56/);
  assert.match(clientSource, /const rightLength = 158 \+ rightWave \* 56/);
  assert.match(clientSource, /const brightness = 0\.50 \+ \(\(leftWave \+ rightWave\) \* \.5\) \* 0\.50/);
  assert.match(clientSource, /stroke="currentColor" stroke-width="\.62"/);
  assert.match(mascotEffectsSvgSource, /id="dsh-fairy-halo-layer-fade"[^>]*color-interpolation="linearRGB"[^>]*r="124"/);
  assert.match(clientSource, /<stop offset="\.45" stop-color="white" stop-opacity="\.08"\/>/);
  assert.match(clientSource, /<stop offset="\.60" stop-color="white" stop-opacity="\.44"\/>/);
  assert.match(clientSource, /<stop offset="\.71" stop-color="white" stop-opacity="\.19"\/>/);
  assert.match(clientSource, /<stop offset="\.90" stop-color="white" stop-opacity="\.052"\/>/);
  assert.match(clientSource, /<stop offset="\.95" stop-color="white" stop-opacity="\.019"\/>/);
  assert.match(clientSource, /<stop offset="\.99" stop-color="white" stop-opacity="\.001"\/>/);
  assert.match(mascotEffectsSvgSource, /mask="url\(#dsh-fairy-halo-layer-mask\)" opacity="\.99"/);
  assert.match(mascotEffectsSvgSource, /maskContentUnits="userSpaceOnUse" x="-260" y="-120" width="680" height="440"/);
  assert.match(clientSource, /HALO_SVG \+ PULSE_SVG \+ SVG/);
  assert.doesNotMatch(clientSource, /<g class="dsh-fairy-halo">/);
  assert.doesNotMatch(clientSource, /dsh-fairy-halo-layer-mask[\s\S]*?<circle[^>]+r="66" fill="#000"/);
});

test('mounts the Fairy scale control inside its stable outer capsule', () => {
  assert.match(mascotScaleSource, /const BASE_ATTR = 'data-dsh-fairy-mascot-scale-base'/);
  assert.match(mascotScaleSource, /function createMascotScaleBase\(host, controller, documentRef = document\)/);
  const baseSource = mascotScaleSource.slice(mascotScaleSource.indexOf('function createMascotScaleBase'), mascotScaleSource.indexOf('function createMascotScaleControl'));
  assert.match(baseSource, /setAttribute\(BASE_ATTR, 'true'\)/);
  assert.match(baseSource, /createMascotScaleControl\(shell, controller, documentRef\)/);
  assert.match(baseSource, /!existing\.querySelector\(`\[\$\{CONTROL_ATTR\}="true"\]`\)/);
  assert.doesNotMatch(baseSource, /setAttribute\('aria-hidden', 'true'\)/);
  assert.match(mascotScaleSource, /input\.style\.setProperty\('--dsh-fairy-scale', progress\)/);
  assert.match(composerDockSource, /createMascotScaleBase\(card, controller\)/);
  assert.match(composerDockSource, /if \(!node\.closest\?\.\('\[data-dsh-fairy-mascot-scale-base="true"\]'\)\) node\.remove\(\)/);
  assert.match(styleSource, /data-dsh-fairy-mascot-scale-base="true"\]\{position:absolute!important;z-index:11!important;right:0!important;top:33px!important/);
  assert.match(styleSource, /data-dsh-fairy-mascot-scale-base="true"\]\{[^}]*width:152px!important[^}]*height:28px!important/);
  assert.match(styleSource, /data-dsh-fairy-mascot-scale-base="true"\] \[data-dsh-fairy-mascot-scale-control="true"\]\{[^}]*inset:5px!important/);
  assert.match(styleSource, /linear-gradient\(to right,var\(--dsh-fairy-scale-fill,#08090b\) 0 var\(--dsh-fairy-scale,100%\),var\(--dsh-fairy-scale-rest,#7d8790\)/);
  assert.match(styleSource, /background-image:linear-gradient\(to right,transparent 0 var\(--dsh-fairy-scale,100%\),#cfd2d5 var\(--dsh-fairy-scale,100%\) 100%\),radial-gradient\(ellipse 38% 170% at 15% 18%/);
  assert.match(styleSource, /linear-gradient\(to right,var\(--dsh-fairy-scale-gradient-start\) 0%,var\(--dsh-fairy-scale-gradient-blue\) 34%,var\(--dsh-fairy-scale-gradient-purple\) 67%,var\(--dsh-fairy-scale-gradient-end\) 100%\)/);
  assert.match(styleSource, /data-dsh-fairy-theme="light"[^}]*--dsh-fairy-scale-gradient-start:#d6f5ff[^}]*--dsh-fairy-scale-gradient-blue:#7897d8[^}]*--dsh-fairy-scale-gradient-purple:#b29be8[^}]*--dsh-fairy-scale-gradient-end:#f7bbdc/);
  assert.match(styleSource, /data-dsh-fairy-theme="dark"[^}]*--dsh-fairy-scale-gradient-start:#8bb9c8[^}]*--dsh-fairy-scale-gradient-blue:#36519a[^}]*--dsh-fairy-scale-gradient-purple:#624d9f[^}]*--dsh-fairy-scale-gradient-end:#b26b99/);
  assert.match(styleSource, /--dsh-fairy-scale-inset-shadow:inset 0 0 6px rgba\(52,63,73,\.48\)[^}]*box-shadow:var\(--dsh-fairy-scale-inset-shadow\)!important/);
  assert.match(styleSource, /data-dsh-fairy-theme="dark"[^}]*--dsh-fairy-scale-inset-shadow:inset 0 0 6px rgba\(0,0,0,\.68\)/);
  assert.match(styleSource, /data-dsh-fairy-mascot-scale-control="true"\]::before,[\s\S]*?::after\{display:none!important;content:none!important/);
  assert.match(styleSource, /data-dsh-fairy-mascot-scale-base="true"\] \[data-dsh-fairy-mascot-scale-input="true"\]\{[^}]*opacity:0!important/);
  assert.match(styleSource, /@media\(max-width:900px\)[\s\S]*data-dsh-fairy-mascot-scale-base="true"\]\{right:-2px!important;width:108px!important/);
  assert.match(styleSource, /@media\(max-width:620px\)[\s\S]*data-dsh-fairy-mascot-scale-base="true"\]\{display:none!important/);
});

test('keeps the voice volume tooltip in the Fairy control material language', () => {
  assert.match(styleSource, /data-dsh-fairy-composer-voice-control="true"\] \[role="tooltip"\]\{transform:translateY\(11px\)!important;font-size:11px!important;font-weight:650!important/);
  assert.match(styleSource, /\[role="tooltip"\]\{[^}]*border:1px solid #c1c8ce!important;border-radius:999px!important;background:#f4f5f6!important;color:#293139!important/);
  assert.match(styleSource, /data-dsh-fairy-theme="dark"[^}]*data-dsh-fairy-composer-voice-control="true"\] \[role="tooltip"\]\{border-color:#555f68!important;background:#30353a!important;color:#f1f6fa!important/);
});

test('keeps the model, effort, and chevron spacing uniform', () => {
  assert.match(styleSource, /re-model-trigger\{gap:8px!important\}/);
  assert.match(styleSource, /re-model-chevron\{margin-left:0!important;margin-right:0!important\}/);
});

test('keeps model, context, and send controls on one right-side rhythm', () => {
  assert.match(styleSource, /data-dsh-fairy-composer-reasoning-control="true"\]\{right:calc\(var\(--dsh-fairy-input-side\) \+ \(var\(--dsh-fairy-input-control-size\) \* 2\) \+ var\(--dsh-fairy-input-control-gap\) \+ var\(--dsh-fairy-reasoning-gap\)\)!important\}/);
  assert.match(styleSource, /--dsh-fairy-input-control-gap:4px;--dsh-fairy-reasoning-gap:4px/);
  assert.match(styleSource, /data-composer-card="true"\]\{--dsh-fairy-reasoning-gap:3px!important\}/);
});

test('keeps the composer on one three-state responsive contract', () => {
  assert.match(styleSource, /--dsh-fairy-composer-wing:176px/);
  assert.match(styleSource, /--dsh-fairy-composer-voice-width:152px/);
  assert.match(styleSource, /@media\(max-width:900px\)[\s\S]*--dsh-fairy-composer-wing:132px[\s\S]*--dsh-fairy-composer-voice-width:108px/);
  assert.match(styleSource, /@media\(max-width:620px\)[\s\S]*--dsh-fairy-composer-wing:0px[\s\S]*data-dsh-fairy-composer-voice-control="true"\]\{display:none!important\}/);
  assert.match(styleSource, /grid-template-columns:minmax\(var\(--dsh-fairy-composer-wing\),max-content\) minmax\(0,1fr\) minmax\(var\(--dsh-fairy-composer-wing\),max-content\)/);
  assert.doesNotMatch(composerDockSource, /syncVoiceDensity/);
  assert.match(composerDockSource, /removeLegacyVoiceDensityMarker/);
  assert.doesNotMatch(styleSource, /@container \(max-width:(1100|820)px\)/);
});

test('anchors voice hardware to the fixed right control wing', () => {
  assert.doesNotMatch(composerDockSource, /syncComposerGeometry|composer-geometry/);
  assert.match(styleSource, /data-dsh-fairy-composer-voice-control="true"\]\{position:absolute!important;z-index:11!important;right:12px!important;top:-1px!important;bottom:auto!important;/);
  assert.doesNotMatch(styleSource, /data-dsh-fairy-theme\]\s*\[data-dsh-fairy-composer-dock="true"\]\s*\[data-dsh-fairy-composer-voice-control="true"\]\{top:1px!important/);
  assert.match(styleSource, /right:var\(--dsh-fairy-composer-voice-right\)!important/);
  assert.match(styleSource, /--dsh-fairy-composer-voice-right:12px!important/);
  assert.match(styleSource, /@media\(max-width:900px\)[\s\S]*--dsh-fairy-composer-voice-right:10px!important/);
  assert.match(styleSource, /@media\(max-width:620px\)[\s\S]*--dsh-fairy-composer-voice-right:8px!important/);
});

test('namespaces SVG fragment references in transition clones for Safari', () => {
  assert.match(visualTransitionsSource, /namespaceCloneReferences/);
  assert.match(visualTransitionsSource, /querySelectorAll\('\*'\)/);
  assert.match(visualTransitionsSource, /data-dsh-fairy-mascot-root/);
  assert.ok(visualTransitionsSource.includes(String.raw`url\(#([^)]+)\)`));
  assert.match(visualTransitionsSource, /clearClonedFairyFaultState/);
  assert.match(composerMaterialSource, /materialLayerSeed/);
  assert.match(composerWorkspaceSource, /stripProjectionIdentity/);
  assert.match(composerWorkspaceSource, /removeAttribute\('id'\)/);
  assert.match(composerMaterialSource, /data-dsh-fairy-composer-material-instance/);
  assert.doesNotMatch(styleSource, /fill:url\(#dsh-fairy-composer-polymer-pattern\)!important/);
  assert.match(visualTransitionsSource, /data-dsh-transition-frame/);
  assert.match(visualTransitionsSource, /dsh-fairy-transition-/);
  assert.match(visualTransitionsSource, /stateClipId/);
  assert.match(visualTransitionsSource, /-webkit-clip-path/);
});

test('centralizes official DOM coupling in the capability adapter', () => {
  assert.match(adapterSource, /const OFFICIAL_SELECTORS = Object\.freeze/);
  assert.match(adapterSource, /const CAPABILITY_DEFINITIONS = Object\.freeze/);
  assert.match(adapterSource, /function reportMissingCapabilities/);
  assert.match(adapterSource, /required: false/);
  assert.doesNotMatch(clientSource, /\[data-slot="conversation"\]/);
  assert.doesNotMatch(clientSource, /\[data-composer-card="true"\]/);
  assert.doesNotMatch(composerDockSource, /button\[aria-label=/);
  assert.match(surfaceUtilsSource, /OFFICIAL_SELECTORS\.composerTextarea/);
  assert.match(composerAnchorSource, /OFFICIAL_SELECTORS\.conversationScroll/);
  assert.doesNotMatch(surfaceUtilsSource, /\[data-conversation-scroll\]|\[data-input-scroll\]/);
  assert.doesNotMatch(composerAnchorSource, /\[data-conversation-scroll\]/);
});

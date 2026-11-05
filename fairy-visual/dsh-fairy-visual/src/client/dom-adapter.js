// DSH official DOM capability adapter.
// This module only reads and identifies official runtime surfaces. It does not
// mutate the DOM, duplicate runtime behavior, or own any visual styling.

const { FAIRY_VOICE_CONTROL_ATTRIBUTE } = require('../../../../fairy-contracts/client-dom.cjs');

const diagnostics = {
  warn(operation, context = {}, error) {
    console.warn(`DSH_FAIRY_LOG ${JSON.stringify({ schema: 1, timestamp: new Date().toISOString(), level: 'warn', module: 'dsh-fairy-visual', operation, event: error ? 'failure' : 'event', context, ...(error ? { error: { name: String(error.name || 'Error'), message: String(error.message || error).slice(0, 320) } } : {}) })}`);
  },
};

const OFFICIAL_SLOT_VALUES = Object.freeze({
  composerAttachments: 'conversation.input.attachments',
});

const VOICE_CONTROL_FALLBACK_SELECTOR = '[aria-label="Fairy 朗读控制"],input[aria-label="朗读音量"]';

// Verified against the installed DSH 0.1.1-rc.2 zh/en dictionaries.  The
// adapter intentionally queries the exact union of shipped labels instead of
// choosing one from browser or document language: a live Host locale update
// can briefly lag document.lang, while an exact union remains safe and works
// immediately on both sides of the update.
const ARIA_LABELS = Object.freeze({
  sessionTree: Object.freeze({ zh: Object.freeze(['会话']), en: Object.freeze(['Sessions']) }),
  newSession: Object.freeze({ zh: Object.freeze(['新建会话']), en: Object.freeze(['New session', 'New Session']) }),
  openSidebar: Object.freeze({ zh: Object.freeze(['打开侧边栏']), en: Object.freeze(['Open sidebar']) }),
  collapseSidebar: Object.freeze({ zh: Object.freeze(['收起侧边栏']), en: Object.freeze(['Collapse sidebar']) }),
  rightSidebarToggle: Object.freeze({
    zh: Object.freeze(['打开右侧边栏', '收起右侧边栏']),
    en: Object.freeze(['Open right sidebar', 'Collapse right sidebar']),
  }),
  send: Object.freeze({ zh: Object.freeze(['发送消息', '停止生成', '停止']), en: Object.freeze(['Send message', 'Stop generating', 'Stop']) }),
  sendOnly: Object.freeze({ zh: Object.freeze(['发送消息']), en: Object.freeze(['Send message']) }),
  context: Object.freeze({ zh: Object.freeze(['上下文']), en: Object.freeze(['Context']) }),
  command: Object.freeze({ zh: Object.freeze(['命令']), en: Object.freeze(['Commands', 'Command']) }),
  access: Object.freeze({ zh: Object.freeze(['访问模式']), en: Object.freeze(['Access mode']) }),
  model: Object.freeze({ zh: Object.freeze(['选择模型']), en: Object.freeze(['Select model']) }),
  reasoning: Object.freeze({ zh: Object.freeze(['模型 ']), en: Object.freeze(['Model ']) }),
  workspace: Object.freeze({ zh: Object.freeze(['选择工作区']), en: Object.freeze(['Choose workspace']) }),
  // Balance and edit controls are local/third-party additions, but keeping
  // their labels here prevents their language behavior from diverging from the
  // official-control adapter policy.
  balance: Object.freeze({ zh: Object.freeze(['DeepSeek 余额']), en: Object.freeze(['DeepSeek balance']) }),
  undo: Object.freeze({ zh: Object.freeze(['撤销当前版本效果']), en: Object.freeze(['Undo current version effect']) }),
  redo: Object.freeze({ zh: Object.freeze(['重施加下一版本效果']), en: Object.freeze(['Redo next version effect']) }),
  toBottom: Object.freeze({ zh: Object.freeze(['回到底部']), en: Object.freeze(['Back to bottom']) }),
});

function labelsFor(key) {
  const labels = ARIA_LABELS[key];
  return labels ? [...new Set(Object.values(labels).flat())] : [];
}

const ARIA_FUZZY_KEYWORDS = Object.freeze({
  // The role="tree" constraint makes the singular English fallback safe while
  // preserving compatibility with a future "Session List" accessible name.
  sessionTree: Object.freeze(['会话', 'sessions', 'session']),
});

function ariaLabelSelector(key, { base = '*', match = 'exact', suffix = '' } = {}) {
  const attribute = match === 'prefix' ? 'aria-label^' : 'aria-label';
  return labelsFor(key).map((label) => `${base}[${attribute}="${label}"]${suffix}`).join(',');
}

function joinSelectors(...selectors) {
  return selectors.filter(Boolean).join(',');
}

function appendSelectorSuffix(selector, suffix) {
  return selector.split(',').map((part) => `${part}${suffix}`).join(',');
}

function localeOf(value) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized.startsWith('zh')) return 'zh';
  if (normalized.startsWith('en')) return 'en';
  return null;
}

function detectCurrentLanguage(doc = document, navigatorRef = typeof navigator === 'undefined' ? undefined : navigator) {
  const treeLabel = query(doc, '[role="tree"]')?.getAttribute?.('aria-label');
  for (const [locale, labels] of Object.entries(ARIA_LABELS.sessionTree)) {
    if (labels.includes(treeLabel)) return locale;
  }
  return localeOf(doc?.documentElement?.lang) || localeOf(navigatorRef?.language) || 'zh';
}

function onLanguageChange(callback, doc = document, navigatorRef = typeof navigator === 'undefined' ? undefined : navigator) {
  const root = doc?.documentElement;
  if (!root || typeof MutationObserver === 'undefined') return () => {};
  let current = detectCurrentLanguage(doc, navigatorRef);
  const observer = new MutationObserver(() => {
    const next = detectCurrentLanguage(doc, navigatorRef);
    if (next === current) return;
    current = next;
    callback(next);
  });
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });
  return () => observer.disconnect();
}

const OFFICIAL_SELECTORS = Object.freeze({
  rootSlot: 'body > #root > [data-slot="root"]',
  rootSurface: '[data-slot="root"]',
  sidebar: '[data-slot="sidebar"]',
  sidebarResizeHandle: '[data-side="sidebar"]',
  // 0.2.x mounts the conversation surface as the current phase root instead
  // of a separate `conversation` slot. The phase element owns the composer,
  // scroll containers, and the session header.
  conversation: '[data-phase="hero"], [data-phase="active"]',
  shellOverlay: '[data-slot="shell.overlay"]',
  settingsDialog: '[data-slot="sidebar.settings"] [role="dialog"]',
  phaseHero: '[data-phase="hero"]',
  phaseActive: '[data-phase="active"]',
  phaseAny: '[data-phase]',
  composerSeat: '[data-composer-seat]',
  composerCard: '[data-composer-card="true"]',
  composerTextarea: '[data-composer-input="true"], textarea',
  composerPlaceholder: '[data-composer-placeholder="true"]',
  composerAttachmentsSlot: `[data-slot="${OFFICIAL_SLOT_VALUES.composerAttachments}"]`,
  conversationScroll: '[data-conversation-scroll]',
  inputScroll: '[data-input-scroll]',
  conversationComposerDock: '[data-slot="conversation.composer.dock"]',
  chatFlow: '[data-chat-flow]',
  sessionTree: ariaLabelSelector('sessionTree', { base: '[role="tree"]' }),
  sessionItem: '[role="treeitem"]',
  expandedSessionItem: '[role="treeitem"][aria-expanded="true"]',
  selectedSessionItem: '[role="treeitem"][aria-selected="true"]',
  sidebarBrandMark: '[data-slot="sidebar.brand.mark"]',
  openSidebar: ariaLabelSelector('openSidebar', { base: 'body > #root > [data-slot="root"] button' }),
  collapseSidebar: ariaLabelSelector('collapseSidebar', { base: 'body > #root > [data-slot="root"] button' }),
  rightSidebarToggle: ariaLabelSelector('rightSidebarToggle', { base: 'button' }),
  newSession: ariaLabelSelector('newSession', { base: 'button' }),
  sessionHeader: '[data-slot="conversation.session.header"]',
  sessionHeaderActions: '[data-slot="conversation.session.header.actions"]',
  sessionHeaderUtilities: '[data-slot="conversation.session.header.utilities"]',
  send: ariaLabelSelector('send', { base: 'button' }),
  sendOnly: ariaLabelSelector('sendOnly', { base: 'button' }),
  context: ariaLabelSelector('context', { base: 'button', match: 'prefix' }),
  voice: `[${FAIRY_VOICE_CONTROL_ATTRIBUTE}],${VOICE_CONTROL_FALLBACK_SELECTOR}`,
  command: ariaLabelSelector('command', { base: 'button' }),
  access: ariaLabelSelector('access', { base: 'button', match: 'prefix' }),
  model: joinSelectors(ariaLabelSelector('model', { base: 'select', match: 'prefix' }), ariaLabelSelector('model', { base: 'button', match: 'prefix' })),
  reasoning: ariaLabelSelector('reasoning', { base: 'button', match: 'prefix', suffix: '[aria-haspopup="menu"]' }),
  workspace: ariaLabelSelector('workspace', { base: 'button' }),
  balance: ariaLabelSelector('balance', { base: '[data-slot="sidebar.footer.action"] *', match: 'prefix' }),
  undo: ariaLabelSelector('undo', { base: 'button' }),
  redo: ariaLabelSelector('redo', { base: 'button' }),
  toBottom: ariaLabelSelector('toBottom', { base: 'button' }),
  headerElement: ':scope > header',
});

const OFFICIAL_ATTRIBUTES = Object.freeze({
  slot: 'data-slot',
  phase: 'data-phase',
  composerSeat: 'data-composer-seat',
  composerCard: 'data-composer-card',
  conversationScroll: 'data-conversation-scroll',
  inputScroll: 'data-input-scroll',
  chatFlow: 'data-chat-flow',
});

const SEMANTIC_SURFACE_SELECTOR = [
  OFFICIAL_SELECTORS.rootSurface,
  OFFICIAL_SELECTORS.sidebar,
  OFFICIAL_SELECTORS.conversation,
  OFFICIAL_SELECTORS.shellOverlay,
  '[data-slot="sidebar.settings"]',
  '[data-phase]',
  '[role="dialog"]',
  '[role="tree"]',
  '[role="treeitem"]',
  OFFICIAL_SELECTORS.composerSeat,
  OFFICIAL_SELECTORS.composerCard,
  // The collapsed rail button is replaced after the sidebar transition. Keep
  // both the control and its official brand slot on the semantic surface so
  // the replacement receives Fairy ownership instead of exposing the native
  // product mark.
  OFFICIAL_SELECTORS.openSidebar,
  OFFICIAL_SELECTORS.collapseSidebar,
  OFFICIAL_SELECTORS.sidebarBrandMark,
  OFFICIAL_SELECTORS.newSession,
].join(', ');

// These contracts are deliberately query-only. Official conversation and
// composer nodes are replaceable, so callers resolve them on demand rather
// than retaining a cache across a phase, slot, or session change.
const OFFICIAL_NODE_CONTRACTS = Object.freeze(Object.fromEntries(
  Object.entries(OFFICIAL_SELECTORS).map(([name, selector]) => [name, Object.freeze({ selector })]),
));

const HDD_SCROLL_TARGETS = Object.freeze([
  { key: 'history', selector: `${OFFICIAL_SELECTORS.sidebar} ${OFFICIAL_SELECTORS.sessionTree}` },
  { key: 'conversation', selector: `${OFFICIAL_SELECTORS.conversation} ${OFFICIAL_SELECTORS.conversationScroll}` },
  { key: 'input', selector: `${OFFICIAL_SELECTORS.conversation} ${OFFICIAL_SELECTORS.inputScroll}` },
]);
const HDD_SCROLL_TARGET_SELECTOR = HDD_SCROLL_TARGETS.map(({ selector }) => selector).join(',');

const CAPABILITY_LEVEL = Object.freeze({
  // The Visual plugin cannot mount or preserve its top-level presentation
  // boundary without these official surfaces.
  CRITICAL: Object.freeze(['rootSlot', 'shellOverlay', 'conversation']),
  // These surfaces own the persistent Visual composition. They are expected
  // once a conversation surface is mounted; their absence disables a major
  // Visual feature, but must not crash or take over the official UI.
  CORE: Object.freeze([
    'sidebar',
    'composerSeat',
    'composerCard',
    'sessionHeader',
    'phaseSurface',
    'conversationScroll',
    'inputScroll',
  ]),
  // Missing enhancements retain an operational Visual surface and are
  // deliberately reported as degraded rather than fatal.
  ENHANCEMENT: Object.freeze([
    'sessionTree',
    'sidebarBrandMark',
    'balanceAction',
    'undoControl',
    'redoControl',
    'composerAttachmentsSlot',
    'modelSelection',
  ]),
  // Fairy only adjusts this native control when it is present.
  OPTIONAL: Object.freeze(['toBottom']),
});

const CAPABILITY_LEVEL_BY_NAME = Object.freeze(Object.fromEntries(
  Object.entries(CAPABILITY_LEVEL).flatMap(([level, names]) => names.map((name) => [name, level])),
));

// `phaseHero` and `phaseActive` are intentionally represented by one
// `phaseSurface` capability: the official runtime renders one phase at a time,
// so reporting either individual phase as absent would produce a false alarm
// during every legitimate phase transition.
const CAPABILITY_DEFINITIONS = Object.freeze({
  rootSlot: { selector: OFFICIAL_SELECTORS.rootSlot, level: CAPABILITY_LEVEL_BY_NAME.rootSlot, required: true, resolve: rootSlot },
  shellOverlay: { selector: OFFICIAL_SELECTORS.shellOverlay, level: CAPABILITY_LEVEL_BY_NAME.shellOverlay, required: true, resolve: shellOverlay },
  conversation: { selector: OFFICIAL_SELECTORS.conversation, level: CAPABILITY_LEVEL_BY_NAME.conversation, required: true, resolve: conversation },
  sidebar: { selector: OFFICIAL_SELECTORS.sidebar, level: CAPABILITY_LEVEL_BY_NAME.sidebar, required: true, resolve: sidebar },
  composerSeat: { selector: OFFICIAL_SELECTORS.composerSeat, level: CAPABILITY_LEVEL_BY_NAME.composerSeat, required: true, resolve: (doc) => composerSeat(conversation(doc)) },
  composerCard: { selector: OFFICIAL_SELECTORS.composerCard, level: CAPABILITY_LEVEL_BY_NAME.composerCard, required: true, resolve: (doc) => composerCard(composerSeat(conversation(doc))) },
  sessionHeader: { selector: OFFICIAL_SELECTORS.sessionHeader, level: CAPABILITY_LEVEL_BY_NAME.sessionHeader, required: true, applicable: (doc) => Boolean(phase(conversation(doc), 'active')), resolve: sessionHeader },
  phaseSurface: { selector: `${OFFICIAL_SELECTORS.phaseHero},${OFFICIAL_SELECTORS.phaseActive}`, level: CAPABILITY_LEVEL_BY_NAME.phaseSurface, required: true, resolve: (doc) => anyPhase(conversation(doc)) },
  conversationScroll: { selector: OFFICIAL_SELECTORS.conversationScroll, level: CAPABILITY_LEVEL_BY_NAME.conversationScroll, required: true, applicable: (doc) => Boolean(phase(conversation(doc), 'active')), resolve: (doc) => conversationScroll(conversation(doc)) },
  inputScroll: { selector: OFFICIAL_SELECTORS.inputScroll, level: CAPABILITY_LEVEL_BY_NAME.inputScroll, required: true, resolve: (doc) => inputScroll(composerCard(composerSeat(conversation(doc)))) },
  sessionTree: { selector: OFFICIAL_SELECTORS.sessionTree, level: CAPABILITY_LEVEL_BY_NAME.sessionTree, required: false, resolve: sessionTree },
  sidebarBrandMark: { selector: OFFICIAL_SELECTORS.sidebarBrandMark, level: CAPABILITY_LEVEL_BY_NAME.sidebarBrandMark, required: false, resolve: (doc) => officialNode('sidebarBrandMark', doc) },
  balanceAction: { selector: OFFICIAL_SELECTORS.balance, level: CAPABILITY_LEVEL_BY_NAME.balanceAction, required: false, resolve: balanceAction },
  undoControl: { selector: OFFICIAL_SELECTORS.undo, level: CAPABILITY_LEVEL_BY_NAME.undoControl, required: false, applicable: (doc) => Boolean(phase(conversation(doc), 'active')), resolve: undoControl },
  redoControl: { selector: OFFICIAL_SELECTORS.redo, level: CAPABILITY_LEVEL_BY_NAME.redoControl, required: false, applicable: (doc) => Boolean(phase(conversation(doc), 'active')), resolve: redoControl },
  toBottom: { selector: OFFICIAL_SELECTORS.toBottom, level: CAPABILITY_LEVEL_BY_NAME.toBottom, required: false, resolve: toBottomControl },
  composerAttachmentsSlot: { selector: OFFICIAL_SELECTORS.composerAttachmentsSlot, level: CAPABILITY_LEVEL_BY_NAME.composerAttachmentsSlot, required: false, resolve: (doc) => composerAttachmentsSlot(composerCard(composerSeat(conversation(doc)))) },
  modelSelection: { selector: OFFICIAL_SELECTORS.model, level: CAPABILITY_LEVEL_BY_NAME.modelSelection, required: false, applicable: (doc) => Boolean(phase(conversation(doc), 'active')), resolve: (doc) => modelControl(composerCard(composerSeat(conversation(doc)))) },
});

const capabilityStatus = {
  missing: new Set(),
  degraded: new Set(),
  timestamp: null,
};
const reportedMissing = new Set();


function query(scope, selector) {
  if (!selector) return null;
  return scope?.querySelector?.(selector) || null;
}

function queryAll(scope, selector) {
  if (!selector) return [];
  return scope?.querySelectorAll ? [...scope.querySelectorAll(selector)] : [];
}

function officialNode(name, scope = document) {
  return query(scope, OFFICIAL_NODE_CONTRACTS[name]?.selector);
}

function hasOfficialNode(name, scope = document) {
  return Boolean(officialNode(name, scope));
}

function officialNodes(name, scope = document) {
  return queryAll(scope, OFFICIAL_NODE_CONTRACTS[name]?.selector);
}

function rootSlot(doc = document) { return officialNode('rootSlot', doc); }
function sidebar(doc = document) { return officialNode('sidebar', doc); }
function conversation(doc = document) { return officialNode('conversation', doc); }
function shellOverlay(doc = document) { return officialNode('shellOverlay', doc); }
function settingsDialog(doc = document) { return officialNode('settingsDialog', doc); }
function sidebarResizeHandle(scope = document) { return officialNode('sidebarResizeHandle', scope); }
function sidebarOpenControl(doc = document) { return officialNode('openSidebar', doc); }
function sidebarCollapseControl(doc = document) { return officialNode('collapseSidebar', doc); }
function rightSidebarToggle(doc = document) { return officialNode('rightSidebarToggle', doc); }
const reportedFuzzyMatches = new Set();

function findByAriaLabelFuzzy(scope, { role, labels }) {
  const candidates = queryAll(scope, `[role="${role}"]`);
  const keywords = labels.map((label) => label.toLocaleLowerCase());
  return candidates.find((node) => {
    const label = node.getAttribute?.('aria-label')?.toLocaleLowerCase();
    return label && keywords.some((keyword) => label.includes(keyword));
  }) || null;
}

function sessionTree(scope = document, { silent = false } = {}) {
  const exact = officialNode('sessionTree', scope);
  if (exact) return exact;
  // A role=tree fallback is read-only and therefore cannot accidentally invoke
  // a control. Keep fuzzy matching deliberately limited to this one structural
  // capability; interactive controls use only verified exact labels.
  const fuzzy = findByAriaLabelFuzzy(scope, { role: 'tree', labels: ARIA_FUZZY_KEYWORDS.sessionTree });
  if (fuzzy && !silent && !reportedFuzzyMatches.has('sessionTree')) {
    reportedFuzzyMatches.add('sessionTree');
    diagnostics.warn('capability.fuzzy-fallback', { capability: 'sessionTree' });
  }
  return fuzzy;
}
function sessionItems(scope) { return officialNodes('sessionItem', scope); }
function expandedSessionItems(scope) { return officialNodes('expandedSessionItem', scope); }
function selectedSessionItems(scope) { return officialNodes('selectedSessionItem', scope); }
function newSessionButtons(scope) { return officialNodes('newSession', scope); }
// rc.2 exposes the official brand through a public slot. Keep the legacy
// direct-SVG fallback for older runtimes, but prefer the explicit capability
// whenever it exists so the real new-session control is never hidden.
function sidebarBrandButton(scope = document) {
  const mark = officialNode('sidebarBrandMark', scope);
  const explicit = mark?.closest?.(OFFICIAL_NODE_CONTRACTS.newSession.selector);
  if (explicit) return explicit;
  return newSessionButtons(scope).find((button) => button.firstElementChild?.tagName === 'svg') || null;
}
function phase(scope = document, name) {
  if (!scope) return null;
  const selector = name === 'hero'
    ? OFFICIAL_SELECTORS.phaseHero
    : name === 'active'
      ? OFFICIAL_SELECTORS.phaseActive
      : `${OFFICIAL_SELECTORS.phaseHero}, ${OFFICIAL_SELECTORS.phaseActive}`;
  return scope.matches?.(selector) ? scope : officialNode(name === 'hero' ? 'phaseHero' : name === 'active' ? 'phaseActive' : 'phaseAny', scope);
}
function anyPhase(scope = document) {
  if (scope?.matches?.(OFFICIAL_SELECTORS.phaseAny)) return scope;
  return officialNode('phaseAny', scope);
}
function sessionHeader(scope) { return officialNode('sessionHeader', scope); }
function sessionHeaderActions(scope) { return officialNode('sessionHeaderActions', scope); }
function sessionHeaderUtilities(scope) { return officialNode('sessionHeaderUtilities', scope); }
// The official agent-preset plugin registers its session label first in the
// documented header-actions slot (order: -10). It is read-only: the session
// already owns this preset. Resolve it structurally so consumers do not depend
// on its private CSS module names or localized title text.
function sessionAgentPresetLabel(scope) {
  const actions = sessionHeaderActions(scope);
  return [...(actions?.children || [])].find((node) => (
    node?.getAttribute?.('title')
    && !node.querySelector?.('button, input, select, textarea, a')
    && Boolean(node.textContent?.trim())
  )) || null;
}
function headerElement(scope) { return officialNode('headerElement', scope); }
function composerSeat(scope = document) { return officialNode('composerSeat', scope); }
function composerCard(scope) { return officialNode('composerCard', scope); }
function composerTextarea(scope) { return officialNode('composerTextarea', scope); }
function composerPlaceholder(scope) { return officialNode('composerPlaceholder', scope); }
function composerAttachmentsSlot(scope) {
  const selector = OFFICIAL_NODE_CONTRACTS.composerAttachmentsSlot.selector;
  return [...(scope?.children || [])].find((node) => (
    node?.matches?.(selector)
    || node?.getAttribute?.(OFFICIAL_ATTRIBUTES.slot) === OFFICIAL_SLOT_VALUES.composerAttachments
  )) || null;
}
function conversationScroll(scope) { return officialNode('conversationScroll', scope); }
function conversationScrolls(scope) { return officialNodes('conversationScroll', scope); }
function inputScroll(scope) { return officialNode('inputScroll', scope); }
function conversationComposerDock(scope) { return officialNode('conversationComposerDock', scope); }
function chatFlows(doc = document) { return officialNodes('chatFlow', doc); }
function sendButton(scope) { return officialNode('send', scope); }
function sendOnlyButton(scope) { return officialNode('sendOnly', scope); }
function contextControl(scope) { return officialNode('context', scope); }
function voiceControl(scope) {
  return query(scope, `[${FAIRY_VOICE_CONTROL_ATTRIBUTE}]`) || query(scope, VOICE_CONTROL_FALLBACK_SELECTOR);
}
function commandControl(scope) { return officialNode('command', scope); }
function accessControl(scope) { return officialNode('access', scope); }
function modelControl(scope) { return officialNode('model', scope); }
function reasoningControl(scope) { return officialNode('reasoning', scope); }
function modelAndReasoningShareNode(scope) {
  const model = modelControl(scope);
  const reasoning = reasoningControl(scope);
  return Boolean(model && reasoning && model === reasoning);
}
function workspaceControl(scope) { return officialNode('workspace', scope); }
function balanceAction(doc = document) { return officialNode('balance', doc); }
function undoControl(scope) { return officialNode('undo', scope); }
function redoControl(scope) { return officialNode('redo', scope); }
function toBottomControl(scope) { return officialNode('toBottom', scope); }

function hddScrollTargets(scope = document) {
  return HDD_SCROLL_TARGETS
    .map(({ key, selector }) => ({ key, target: query(scope, selector) }))
    .filter(({ target }) => target?.isConnected);
}

function capabilityNode(name, doc = document) {
  return CAPABILITY_DEFINITIONS[name]?.resolve?.(doc) || null;
}

function hasCapability(name, doc = document) {
  return Boolean(capabilityNode(name, doc));
}

function capabilitySnapshot(doc = document) {
  const snapshot = {};
  Object.entries(CAPABILITY_DEFINITIONS).forEach(([name, definition]) => {
    const applicable = definition.applicable?.(doc) ?? true;
    const node = applicable ? capabilityNode(name, doc) : null;
    snapshot[name] = {
      available: !applicable || Boolean(node),
      applicable,
      required: definition.required,
      level: definition.level,
      selector: definition.selector,
    };
  });
  return snapshot;
}

function syncCapabilityStatus(snapshot, { includeOptional = false } = {}) {
  capabilityStatus.missing.clear();
  capabilityStatus.degraded.clear();
  Object.entries(snapshot).forEach(([name, capability]) => {
    if (capability.available) return;
    if (capability.required) capabilityStatus.missing.add(name);
    else if (includeOptional || capability.level === 'ENHANCEMENT') capabilityStatus.degraded.add(name);
  });
  capabilityStatus.timestamp = Date.now();
}

function getCapabilityStatus() {
  return {
    missing: [...capabilityStatus.missing].sort(),
    degraded: [...capabilityStatus.degraded].sort(),
    timestamp: capabilityStatus.timestamp,
  };
}

function resetCapabilityStatus() {
  capabilityStatus.missing.clear();
  capabilityStatus.degraded.clear();
  capabilityStatus.timestamp = null;
  reportedMissing.clear();
  reportedFuzzyMatches.clear();
}

function missingCapabilities(doc = document, { includeOptional = false } = {}) {
  const snapshot = capabilitySnapshot(doc);
  return Object.entries(snapshot)
    .filter(([, capability]) => !capability.available && (capability.required || includeOptional || capability.level === 'ENHANCEMENT'))
    .map(([name, capability]) => ({ name, ...capability }));
}

function reportMissingCapabilities(doc = document, {
  report = (message) => diagnostics.warn('capability.missing', { message }),
  includeOptional = false,
  allowBeforeMount = false,
} = {}) {
  // Before the official application mounts, every surface is correctly absent.
  // Do not turn that ordinary startup gap into a persistent compatibility
  // failure. Tests and isolated diagnostics may explicitly opt in.
  if (!allowBeforeMount && (!rootSlot(doc) || !conversation(doc))) return [];
  const snapshot = capabilitySnapshot(doc);
  syncCapabilityStatus(snapshot, { includeOptional });
  const missing = Object.entries(snapshot)
    .filter(([, capability]) => !capability.available && (capability.required || includeOptional || capability.level === 'ENHANCEMENT'))
    .map(([name, capability]) => ({ name, ...capability }));
  missing.forEach(({ name, selector, required, level }) => {
    if (reportedMissing.has(name)) return;
    reportedMissing.add(name);
    const severity = required ? 'missing required' : 'degraded';
    report(`[dsh-fairy-visual] ${severity} official capability [${level}]: ${name} (${selector})`);
  });
  return missing;
}

// This diagnostic surface is intentionally development-only. Production UI
// behavior remains unchanged; the normal lifecycle still reports once through
// reportMissingCapabilities after the official application mounts.
if (typeof window !== 'undefined' && globalThis.process?.env?.NODE_ENV === 'development') {
  window.__fairyVisualCapability = Object.freeze({
    getStatus: getCapabilityStatus,
    reset: resetCapabilityStatus,
  });
}


module.exports = {
  OFFICIAL_SELECTORS,
  OFFICIAL_SLOT_VALUES,
  FAIRY_VOICE_CONTROL_ATTRIBUTE,
  VOICE_CONTROL_FALLBACK_SELECTOR,
  ARIA_LABELS,
  ARIA_FUZZY_KEYWORDS,
  labelsFor,
  ariaLabelSelector,
  appendSelectorSuffix,
  detectCurrentLanguage,
  onLanguageChange,
  OFFICIAL_ATTRIBUTES,
  SEMANTIC_SURFACE_SELECTOR,
  OFFICIAL_NODE_CONTRACTS,
  HDD_SCROLL_TARGETS,
  HDD_SCROLL_TARGET_SELECTOR,
  CAPABILITY_LEVEL,
  CAPABILITY_LEVEL_BY_NAME,
  CAPABILITY_DEFINITIONS,
  getCapabilityStatus,
  resetCapabilityStatus,
  officialNode,
  hasOfficialNode,
  officialNodes,
  capabilityNode,
  hasCapability,
  rootSlot,
  sidebar,
  conversation,
  shellOverlay,
  settingsDialog,
  sidebarResizeHandle,
  sidebarOpenControl,
  sidebarCollapseControl,
  rightSidebarToggle,
  sessionTree,
  sessionItems,
  expandedSessionItems,
  selectedSessionItems,
  newSessionButtons,
  sidebarBrandButton,
  phase,
  anyPhase,
  sessionHeader,
  sessionHeaderActions,
  sessionHeaderUtilities,
  sessionAgentPresetLabel,
  headerElement,
  composerSeat,
  composerCard,
  composerTextarea,
  composerPlaceholder,
  composerAttachmentsSlot,
  conversationScroll,
  conversationScrolls,
  inputScroll,
  conversationComposerDock,
  chatFlows,
  sendButton,
  sendOnlyButton,
  contextControl,
  voiceControl,
  commandControl,
  accessControl,
  modelControl,
  reasoningControl,
  modelAndReasoningShareNode,
  workspaceControl,
  balanceAction,
  undoControl,
  redoControl,
  toBottomControl,
  hddScrollTargets,
  capabilitySnapshot,
  missingCapabilities,
  reportMissingCapabilities,
};

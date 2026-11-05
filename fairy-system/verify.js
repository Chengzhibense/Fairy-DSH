#!/usr/bin/env node
'use strict';

// Cross-module contract verifier. It intentionally validates registration and
// ownership boundaries without loading DSH or mutating any runtime state.

const crypto = require('crypto');
const fs = require('fs');
const { createRequire } = require('node:module');
const http = require('http');
const os = require('os');
const path = require('path');

const dshRoot = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
const EXPECTED_RUNTIME_SHA256 = '13a5fe0ee8cddda2306d302eb0dbfdd601e96d14baeb512867b4b6d1d72f6679';
const paths = {
  balance: path.join(dshRoot, 'balance-meter', 'dsh-balance-meter'),
  browserDock: path.join(dshRoot, 'browser-dock', 'dsh-browser-dock'),
  visualPlugin: path.join(dshRoot, 'fairy-visual', 'dsh-fairy-visual'),
  startupPlugin: path.join(dshRoot, 'fairy-startup', 'dsh-fairy-startup'),
  contracts: path.join(dshRoot, 'fairy-contracts'),
  canonicalLauncher: path.join(dshRoot, 'launchers', 'dsh-web-launcher.sh'),
  launcherCompatibilityEntry: path.join(os.homedir(), '.local', 'bin', 'dsh-web-launcher.sh'),
  desktopLauncherSource: path.join(dshRoot, 'dsh-web-launcher.m'),
  desktopLauncherAppleScript: path.join(dshRoot, 'dsh-web-launcher.applescript'),
  desktopLauncherBinary: path.join(os.homedir(), 'Applications', 'DSH Web.app', 'Contents', 'MacOS', 'DSHWeb'),
  installedVoiceLaunchAgent: path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.origen.fairy-voice-api.plist'),
  officialDshPackage: path.join(os.homedir(), '.local', 'lib', 'node_modules', '@deepseek-ai', 'dsh', 'package.json'),
  runtime: path.join(os.homedir(), '.local', 'lib', 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai', 'dsh-client-runtime', 'lib', 'client.js'),
  language: path.join(dshRoot, '.agent-presets', 'fairy'),
  audio: path.join(dshRoot, 'fairy-voice'),
  profile: path.join(dshRoot, 'profiles', 'web'),
};

const publishedPackages = [
  paths.browserDock,
  paths.balance,
  paths.startupPlugin,
  paths.visualPlugin,
  path.join(paths.audio, 'dsh-fairy-voice'),
];

function fail(message) {
  throw new Error(`Fairy system verification failed: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(file) {
  assert(fs.existsSync(file), `missing ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function readBuffer(file) {
  assert(fs.existsSync(file), `missing ${file}`);
  return fs.readFileSync(file);
}

function verifyRuntimeBoundaries() {
  const canonicalLauncher = read(paths.canonicalLauncher);
  const compatibilityEntry = read(paths.launcherCompatibilityEntry);
  const desktopSource = read(paths.desktopLauncherSource);
  const desktopAppleScript = read(paths.desktopLauncherAppleScript);
  const canonicalPath = paths.canonicalLauncher;
  assert((fs.statSync(paths.canonicalLauncher).mode & 0o111) !== 0, 'canonical Web launcher is not executable');
  assert(canonicalLauncher.includes('run_preflight()') && canonicalLauncher.includes('is_healthy()'), 'canonical Web launcher logic is incomplete');
  assert(compatibilityEntry.includes(canonicalPath) && compatibilityEntry.includes('exec "$CANONICAL_LAUNCHER" "$@"'), 'external Web launcher must be a thin canonical forwarder');
  assert(!/run_preflight\(\)|is_healthy\(\)|dsh-fairy-visual/.test(compatibilityEntry), 'external Web launcher contains maintainable runtime logic');
  assert(desktopSource.includes(canonicalPath) && desktopAppleScript.includes(canonicalPath), 'desktop launcher source does not target the canonical Web launcher');
  assert(readBuffer(paths.desktopLauncherBinary).includes(Buffer.from(canonicalPath)), 'deployed DSH Web app does not target the canonical Web launcher');

  const canonicalVoiceLaunchAgent = read(path.join(paths.audio, 'com.origen.fairy-voice-api.plist'));
  assert(read(paths.installedVoiceLaunchAgent) === canonicalVoiceLaunchAgent, 'installed Voice LaunchAgent drifted from its canonical .dsh source');

  const officialPackage = JSON.parse(read(paths.officialDshPackage));
  assert(officialPackage.name === '@deepseek-ai/dsh' && officialPackage.version === '0.1.1-rc.2', 'official DSH dependency version drifted');
}

function verifyPublishedArtifacts() {
  for (const packageDir of publishedPackages) {
    const manifest = JSON.parse(read(path.join(packageDir, 'package.json')));
    const targets = [
      ['main', manifest.main],
      ['exports["."]', manifest.exports?.['.']],
      ['exports["./client"]', manifest.exports?.['./client']],
    ];
    for (const [label, target] of targets) {
      assert(typeof target === 'string' && target.length > 0, `${manifest.name} does not declare ${label}`);
      const output = path.resolve(packageDir, target);
      assert(fs.existsSync(output) && fs.statSync(output).isFile(), `${manifest.name} ${label} build output is missing: ${output}`);
    }
  }
}

function verifyGeneratedArtifactFreshness() {
  const sourceRoots = new Map([
    [paths.browserDock, path.join(paths.browserDock, 'src')],
    [paths.balance, null],
    [paths.startupPlugin, null],
    [paths.visualPlugin, path.join(paths.visualPlugin, 'src')],
    [path.join(paths.audio, 'dsh-fairy-voice'), null],
  ]);
  const forbiddenClient = new Map([
    [paths.browserDock, [/child_process/, /playwright-profile/, /Google Chrome\.app/]],
    [paths.balance, [/DEEPSEEK_API_KEY/, /Authorization/]],
    [paths.startupPlugin, [/fairy-visual/, /fairy-voice/, /localStorage/, /sessionStorage/]],
  ]);
  const visit = (directory, files) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file, files);
      else if (entry.isFile()) files.push(file);
    }
  };
  for (const packageDir of publishedPackages) {
    const manifestPath = path.join(packageDir, 'package.json');
    const manifest = JSON.parse(read(manifestPath));
    const outputs = [...new Set([
      path.resolve(packageDir, manifest.main),
      path.resolve(packageDir, manifest.exports['.']),
      path.resolve(packageDir, manifest.exports['./client']),
    ])];
    const outputMtime = Math.min(...outputs.map((file) => fs.statSync(file).mtimeMs));
    assert(fs.statSync(manifestPath).mtimeMs <= outputMtime + 1,
      `${manifest.name} manifest is newer than its generated outputs`);
    const sourceRoot = sourceRoots.get(packageDir);
    if (sourceRoot) {
      const sourceFiles = [];
      visit(sourceRoot, sourceFiles);
      const newestSource = Math.max(...sourceFiles.map((file) => fs.statSync(file).mtimeMs));
      assert(newestSource <= outputMtime + 1,
        `${manifest.name} source is newer than its generated outputs`);
    }
    const client = fs.readFileSync(path.resolve(packageDir, manifest.exports['./client']), 'utf8');
    for (const pattern of forbiddenClient.get(packageDir) || []) {
      assert(!pattern.test(client), `${manifest.name} client bundle contains a forbidden legacy path or runtime injection`);
    }
  }
}

function verifyProfileConsistency(profilePackage) {
  const resolveFromProfile = createRequire(path.join(paths.profile, 'package.json')).resolve;
  for (const packageDir of publishedPackages) {
    const manifest = JSON.parse(read(path.join(packageDir, 'package.json')));
    const expectedDependency = `link:${path.relative(paths.profile, packageDir).split(path.sep).join('/')}`;
    assert(profilePackage.dependencies?.[manifest.name] === expectedDependency,
      `profile dependency for ${manifest.name} does not point to its published source`);
    const link = path.join(paths.profile, 'node_modules', manifest.name);
    assert(fs.existsSync(link) && fs.lstatSync(link).isSymbolicLink(), `profile dependency is not a symlink: ${link}`);
    let linkedPath;
    let expectedPath;
    try {
      linkedPath = fs.realpathSync(link);
      expectedPath = fs.realpathSync(packageDir);
    } catch (error) {
      fail(`profile dependency cannot be resolved: ${link} (${error.code || error.message})`);
    }
    assert(linkedPath === expectedPath,
      `profile dependency target drifted: ${link}`);

    const entries = [
      [manifest.name, path.resolve(packageDir, manifest.main), 'host entry'],
      [`${manifest.name}/client`, path.resolve(packageDir, manifest.exports['./client']), 'client entry'],
      [`${manifest.name}/package.json`, path.join(packageDir, 'package.json'), 'package manifest'],
    ];
    for (const [specifier, expectedFile, label] of entries) {
      let resolved;
      try {
        resolved = resolveFromProfile(specifier);
      } catch (error) {
        fail(`${manifest.name} ${label} cannot be resolved from profile ${paths.profile}: ${specifier} (${error.code || error.message})`);
      }
      assert(fs.realpathSync(resolved) === fs.realpathSync(expectedFile),
        `${manifest.name} ${label} resolves to ${resolved}; expected ${expectedFile}`);
    }
  }
}

function countOccurrences(source, pattern) {
  return source.split(pattern).length - 1;
}

function auditLifecycleOwnership() {
  const ownership = JSON.parse(read(path.join(dshRoot, 'fairy-system', 'lifecycle-ownership.json')));
  const clientDirectory = path.join(paths.visualPlugin, 'src', 'client');
  const documented = new Set();
  for (const entry of fs.readdirSync(clientDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const source = read(path.join(clientDirectory, entry.name));
    for (const match of source.matchAll(/^\s*\/\/ Lifecycle: (.+)$/gm)) documented.add(match[1].trim());
  }
  const expected = ownership.owners.map((owner) => owner.subsystem);
  const missing = expected.filter((subsystem) => !documented.has(subsystem));
  const extra = [...documented].filter((subsystem) => !expected.includes(subsystem));
  assert(!missing.length, `lifecycle ownership comments missing: ${missing.join(', ')}`);
  assert(!extra.length, `lifecycle ownership comments are undocumented: ${extra.join(', ')}`);
  return expected.length;
}

function verifyStaticContracts() {
  verifyRuntimeBoundaries();
  verifyPublishedArtifacts();
  verifyGeneratedArtifactFreshness();
  const lifecycleOwnerCount = auditLifecycleOwnership();
  const balancePackage = JSON.parse(read(path.join(paths.balance, 'package.json')));
  const browserDockPackage = JSON.parse(read(path.join(paths.browserDock, 'package.json')));
  const browserDockHost = read(path.join(paths.browserDock, 'lib', 'index.js'));
  const browserDockClient = read(path.join(paths.browserDock, 'lib', 'client.js'));
  const browserDockProxy = read(path.join(paths.browserDock, 'proxy.cjs'));
  const balanceServer = read(path.join(paths.balance, 'lib', 'index.js'));
  const balanceClient = read(path.join(paths.balance, 'lib', 'client.js'));
  const preset = read(path.join(paths.language, 'preset.yml'));
  const languageConfig = read(path.join(paths.language, 'agent.cordis.yml'));
  const languageRuntime = read(path.join(paths.language, 'runtime', 'index.js'));
  const visualPluginClient = read(path.join(paths.visualPlugin, 'lib', 'client.js'));
  const visualClientEntrySource = read(path.join(paths.visualPlugin, 'src', 'client', 'index.js'));
  const visualSemanticManagerSource = read(path.join(paths.visualPlugin, 'src', 'client', 'semantic-markers-manager.js'));
  const visualSidebarManagerSource = read(path.join(paths.visualPlugin, 'src', 'client', 'sidebar-geometry-manager.js'));
  const visualScrollbarsManagerSource = read(path.join(paths.visualPlugin, 'src', 'client', 'scrollbars-manager.js'));
  const visualHeroManagerSource = read(path.join(paths.visualPlugin, 'src', 'client', 'hero-projection-manager.js'));
  const visualMascotRuntimeSource = read(path.join(paths.visualPlugin, 'src', 'client', 'mascot-runtime.js'));
  const visualStyleSource = read(path.join(paths.visualPlugin, 'src', 'client', 'style.js'));
  const visualPluginSource = [
    visualClientEntrySource,
    visualSemanticManagerSource,
    visualSidebarManagerSource,
    visualScrollbarsManagerSource,
    visualHeroManagerSource,
    visualMascotRuntimeSource,
    read(path.join(paths.visualPlugin, 'src', 'client', 'dom-adapter.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'lifecycle.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'controller-lifecycle.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'mode-theme.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'stage-lifecycle.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'content-fade.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'scrollbar.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'semantic-markers.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'geometry-lifecycle.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'mascot-lifecycle.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'brand-sidebar-geometry.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'power-mode.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'settings-write.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'surface-utils.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'utils.js')),
    read(path.join(paths.visualPlugin, 'src', 'client', 'visual-transitions.js')),
    visualStyleSource,
  ].join('\n');
  const visualPluginContract = `${visualPluginSource}\n${visualPluginClient}`;
  const visualPluginHost = read(path.join(paths.visualPlugin, 'lib', 'index.js'));
  const visualComposerDockSource = read(path.join(paths.visualPlugin, 'src', 'client', 'composer-dock.js'));
  const visualContracts = read(path.join(paths.contracts, 'index.js'));
  const startupClient = read(path.join(paths.startupPlugin, 'lib', 'client.js'));
  const audioPackage = JSON.parse(read(path.join(paths.audio, 'dsh-fairy-voice', 'package.json')));
  const audioServer = read(path.join(paths.audio, 'dsh-fairy-voice', 'lib', 'index.js'));
  const audioClient = read(path.join(paths.audio, 'dsh-fairy-voice', 'lib', 'client.js'));
  const audioLaunchAgent = read(path.join(paths.audio, 'com.origen.fairy-voice-api.plist'));
  const audioStop = read(path.join(paths.audio, 'stop_fairy_voice.sh'));
  const profilePackage = JSON.parse(read(path.join(paths.profile, 'package.json')));
  const profilePatch = read(path.join(paths.profile, 'cordis.patch.yml'));
  verifyProfileConsistency(profilePackage);

  assert(browserDockPackage.name === 'dsh-browser-dock', 'browser dock package identity drifted');
  assert(profilePackage.dependencies?.['dsh-browser-dock'] === 'link:../../browser-dock/dsh-browser-dock', 'web profile must link the browser dock source');
  assert(/id:\s*browser-dock[\s\S]*?name:\s*['"]dsh-browser-dock['"][\s\S]*?inject:\s*\[clientModules\]/.test(profilePatch), 'browser dock client module is not registered');
  assert(/ctx\.slots\.inject\(["']shell\.overlay["']/.test(browserDockClient) && /reason:\s*["']session-switch["']/.test(browserDockClient), 'browser dock slot or session cleanup contract is incomplete');
  assert(browserDockHost.includes("path: '/browser-dock/state'") && browserDockHost.includes("path: '/browser-dock/frame'") && browserDockHost.includes("path: '/browser-dock/control'"), 'browser dock server bridge is incomplete');
  assert(browserDockProxy.includes("internalCall('browser_take_screenshot'") && browserDockProxy.includes("internalCall('browser_tabs'") && browserDockProxy.includes('takeoverConsumed'), 'browser dock proxy capture or one-shot takeover contract is incomplete');
  assert(!/child_process|playwright-profile|Google Chrome\.app/.test(browserDockClient), 'browser dock client crossed its server-only process boundary');

  assert(balancePackage.name === 'dsh-balance-meter', 'balance meter package identity drifted');
  assert(profilePackage.dependencies?.['dsh-balance-meter'] === 'link:../../balance-meter/dsh-balance-meter', 'web profile must link the maintainable balance meter source');
  assert(/id:\s*balance-meter[\s\S]*?name:\s*['"]dsh-balance-meter['"]/.test(profilePatch), 'balance meter is not registered in the web profile');
  assert(balanceClient.includes("sidebar.footer.action") && !/DEEPSEEK_API_KEY|Authorization/.test(balanceClient), 'balance client crossed its server-only credential boundary');
  assert(balanceClient.includes("const dailyLabel = hddMode ? '今日电量' : '今日token'") && balanceClient.includes("const dailySummaryLabel = hddMode ? '今日电量' : '今日 token'"), 'balance meter normal/HDD label boundary drifted');
  assert(balanceClient.includes("attributeFilter: ['data-dsh-fairy-mode']"), 'balance meter does not follow the published visual mode snapshot');
  assert(balanceClient.includes("const BALANCE_UNAVAILABLE_TEXT = 'unavailable'") && !/dsh-hdd-mode/.test(balanceClient), 'balance failure or normal-mode isolation contract drifted');
  assert(balanceServer.includes("mode: 0o600") && balanceServer.includes("disposeBalanceRequests"), 'balance persistence or request cleanup contract is incomplete');

  assert(/name:\s*Fairy\b/.test(preset), 'the native Fairy language preset is absent');
  assert(languageConfig.includes("runtime/index.js"), 'language config must use the canonical runtime entrypoint');
  assert(languageRuntime.includes('exampleLimit') && /compile\([\s\S]*?config\.exampleLimit/.test(languageRuntime), 'language example limit is not wired through');
  assert(languageRuntime.includes("import { homedir } from 'node:os'") && languageRuntime.includes("import { createCompiler } from './compiler.js'"), 'language runtime must use the DSH home path and native compiler boundary');
  assert(!/child_process|execFile|python3/.test(languageRuntime), 'language turn path must not spawn a helper process');
  assert(!/fairy-voice|127\.0\.0\.1:9880|dsh-hdd-mode/.test(languageRuntime), 'language runtime must not own audio or visual state');

  assert(visualPluginContract.includes("ctx.sessions") && visualPluginContract.includes("ctx.settingsScope"), 'upgrade-safe visual plugin must use official client contracts');
  assert(!/hHd-Xa_newSession|YDXeBa_folderActive|YDXeBa_selected|:has\(/.test(visualPluginContract), 'visual client must not depend on generated sidebar classes or :has selectors');
  assert(visualClientEntrySource.split('\n').length < 1000, 'visual client entrypoint must remain below 1,000 lines');
  for (const [name, source] of [
    ['semantic markers', visualSemanticManagerSource],
    ['sidebar geometry', visualSidebarManagerSource],
    ['scrollbars', visualScrollbarsManagerSource],
    ['hero projection', visualHeroManagerSource],
  ]) {
    assert(source.split('\n').length < 500, `visual ${name} manager must remain below 500 lines`);
    assert(/function install\(/.test(source), `visual ${name} manager must expose install(lifecycle)`);
  }
  assert(
    visualClientEntrySource.includes('semanticMarkersManager.install()')
      && visualClientEntrySource.includes('sidebarGeometryManager.install()')
      && visualClientEntrySource.includes('scrollbarsManager.install()')
      && visualClientEntrySource.includes('heroProjectionManager.install('),
    'visual client manager installation contract is incomplete',
  );
  assert(visualSemanticManagerSource.includes('function install(lifecycle = claimSemanticMarkers(document))') && visualPluginContract.includes('data-dsh-fairy-header-row') && visualPluginContract.includes('data-dsh-fairy-active-folder'), 'visual semantic marker projection is incomplete');
  assert(visualPluginContract.includes("mark(ownedBrand, 'data-dsh-fairy-brand-anchor')") && visualPluginContract.includes("filter((button) => button !== ownedBrand)"), 'visual brand/native-new-session ownership is not mutually exclusive');
  assert(visualPluginContract.includes("ariaLabelSelector('openSidebar'") && visualPluginContract.includes("ariaLabelSelector('collapseSidebar'") && visualPluginContract.includes("mark(openSidebarControl, 'data-dsh-fairy-sidebar-open-control')") && visualPluginContract.includes('sidebarCollapseControl(document)'), 'visual marker lifecycle does not observe locale-safe sidebar collapse/reopen controls');
  assert(visualPluginContract.includes('const ownedBrand = !sidebarCollapsed ? brandCandidate : null'), 'visual brand ownership must be semantic rather than geometry-gated');
  const markerSource = visualSemanticManagerSource;
  assert(!/getBoundingClientRect|offsetWidth|offsetHeight|clientWidth|clientHeight/.test(markerSource), 'visual semantic marker producer must not depend on one-shot geometry');
  assert(visualPluginContract.includes('cloneElements.forEach((node) =>') && visualPluginContract.includes("node.getAttribute?.('data-dsh-fairy-brand-anchor') !== 'true'") && visualPluginContract.includes("node.removeAttribute('data-dsh-fairy-native-new-session')"), 'mode-transition clones do not sanitize stale native-button markers through the shared element list');
  assert(visualPluginContract.includes('[data-dsh-fairy-brand-anchor="true"]{background:transparent!important') && !visualPluginSource.includes('button[aria-label="新建会话"]'), 'Fairy brand background race guard is not locale-safe');
  // Visual paint details belong to the Visual package contract tests. The
  // system verifier protects only cross-module ownership and upgrade boundaries.
  assert(visualPluginContract.includes("sidebar.footer.action") && visualPluginContract.includes("settings.section"), 'upgrade-safe visual plugin slots are missing');
  assert(visualPluginHost.includes("settingsNamespace('fairy-visual')") || visualPluginHost.includes('settingsNamespace(settingsNamespaceName)'), 'visual settings namespace is not registered');
  // Reject only legacy process-wide globals. Visual still uses a local DOM
  // guard (`control.__dshFairySpeedDrag`), and its development-only
  // diagnostics are intentionally exposed as `window.__fairyVisual*`; neither
  // is the old cross-module `window/globalThis.__dshFairy*` state channel.
  const legacyVisualGlobal = /\b(?:window|globalThis)\.__dshFairy[A-Za-z0-9_$]*/;
  assert(!/localStorage|sessionStorage|startSession\(/.test(visualPluginContract) && !legacyVisualGlobal.test(visualPluginContract), 'visual plugin must not use browser storage, legacy globals, or session actions');
  // The Visual package may reference the shared voice-control attribute name;
  // only actual language hooks or Voice service endpoints indicate ownership.
  assert(!/agent\/pre-step|createUserMessage|127\.0\.0\.1:9880|fairy-voice\/(?:tts|status|prepare|brain)/.test(visualPluginClient + visualPluginHost), 'visual plugin must not own language or audio behavior');
  assert(visualContracts.includes("FAIRY_VISUAL_SETTINGS_NAMESPACE = 'fairy-visual'"), 'shared visual settings contract is missing');
  assert(visualContracts.includes('FAIRY_VISUAL_SETTINGS_VERSION = 2'), 'visual settings contract version drifted');
  assert(visualPluginHost.includes("theme: z.union(['dark', 'light']).default('dark')"), 'visual host schema is missing theme ownership');
  assert(visualPluginSource.includes('function claimSingleton') && countOccurrences(visualPluginSource, "claimSingleton(document, 'stage-host'") === 1, 'visual stage host may be mounted more than once');
  assert(countOccurrences(visualComposerDockSource, "claimSingleton(document, 'composer-dock'") === 1, 'visual composer dock may be mounted more than once');
  assert(visualPluginSource.includes('removeAttribute(MODE_ATTR)'), 'normal mode must remove the visual mode attribute');
  assert(visualPluginSource.includes('inspect,') && visualPluginSource.includes('inspectController'), 'lifecycle inspection API is missing');
  const contentFadeStart = visualClientEntrySource.indexOf("const lifecycle = claimContentFadeLifecycle(stageNode)");
  const contentFadeEnd = visualClientEntrySource.indexOf("}, [enabled, state.sessionId]);", contentFadeStart);
  assert(contentFadeStart >= 0 && contentFadeEnd > contentFadeStart, 'visual content-fade owner is missing');
  const contentFadeSource = visualClientEntrySource.slice(contentFadeStart, contentFadeEnd);
  assert(contentFadeSource.includes('const nextSurface = conversationScroll(conversation(document))'), 'content fade must be owned by the stationary conversation viewport');
  assert(contentFadeSource.includes("surface.classList.add('dsh-fairy-content-mask')") && contentFadeSource.includes("surface.classList.add('dsh-fairy-content-fade')"), 'content fade must retain the original alpha-mask mechanism');
  assert(!/addEventListener\(['"]scroll|\.on\([^,]+,\s*['"]scroll|chatFlowScroll/.test(contentFadeSource), 'content fade must never chase scrolling content');
  assert(!/backdrop-filter|dsh-fairy-content-veil/.test(visualPluginSource), 'content fade must never use a blur or painted veil');
  assert(/\.dsh-fairy-content-mask\{--dsh-fairy-mask:0;[^}]*-webkit-mask-image:radial-gradient/.test(visualStyleSource), 'content fade must remain a pure radial alpha mask');
  assert(lifecycleOwnerCount === 13, 'lifecycle ownership contract count drifted');

  assert(startupClient.includes('sessions.clear()') && startupClient.includes('workspaces.startSession()'), 'fresh-session startup policy is absent');
  assert(!/fairy-visual|fairy-voice|localStorage|sessionStorage/.test(startupClient), 'startup plugin crossed a language, visual, voice, or storage boundary');
  assert(startupClient.includes('STARTUP_RESET_ATTR') && startupClient.includes('root.hasAttribute(STARTUP_RESET_ATTR)') && startupClient.includes("root.setAttribute(STARTUP_RESET_ATTR, 'true')"), 'startup duplicate-mount guard is absent');
  assert(countOccurrences(startupClient, 'sessions.clear()') === 1 && countOccurrences(startupClient, 'workspaces.startSession()') === 1, 'startup actions must have one owner');
  assert(profilePackage.dependencies?.['dsh-fairy-startup'] === 'link:../../fairy-startup/dsh-fairy-startup', 'web profile must link the startup package');
  assert(/id:\s*fairy-startup[\s\S]*?name:\s*['"]dsh-fairy-startup['"][\s\S]*?inject:\s*\[clientModules\]/.test(profilePatch), 'startup client module is not registered in the web profile');

  assert(audioPackage.name === 'dsh-fairy-voice', 'audio package identity drifted');
  assert(audioPackage.dependencies?.['mdast-util-from-markdown'] === '2.0.3'
    && audioPackage.dependencies?.['mdast-util-gfm'] === '3.1.0'
    && audioPackage.dependencies?.['micromark-extension-gfm'] === '3.0.0', 'audio Markdown dependencies must remain exactly pinned');
  assert(profilePackage.dependencies?.['dsh-fairy-voice'] === 'link:../../fairy-voice/dsh-fairy-voice', 'web profile must link the local audio package');
  assert(/id:\s*fairy-voice[\s\S]*?name:\s*['"]dsh-fairy-voice['"][\s\S]*?inject:\s*\[clientModules\]/.test(profilePatch), 'audio client module is not registered in the web profile');
  assert(audioServer.includes('127.0.0.1:9880') && audioServer.includes('/fairy-voice/tts'), 'audio server contract is incomplete');
  assert(audioServer.includes('process.env.DSH_HOME') && audioServer.includes("join(DSH_HOME, 'fairy-voice'"), 'audio reference path must be rooted at the current DSH home');
  assert(audioClient.includes('conversation.chat.assistant-actions') && audioClient.includes('conversation.input.left'), 'audio client slots are not registered');
  assert(!/dsh-hdd-mode|agent\/pre-step|\.agent-presets/.test(audioServer + audioClient), 'audio module must not own language or visual state');
  assert(fs.existsSync(path.join(paths.audio, 'runtime', 'reference', 'fairy_ref.wav')), 'audio reference file is missing');
  assert(audioLaunchAgent.includes('com.origen.fairy-voice-api') && audioLaunchAgent.includes('<key>KeepAlive</key>') && audioLaunchAgent.includes('127.0.0.1'), 'audio LaunchAgent contract is incomplete');
  assert(audioStop.includes('/control?command=exit') && !audioStop.includes("-X POST"), 'audio shutdown helper must use the service\'s registered control endpoint');

  const playwrightPackage = path.join(paths.profile, 'node_modules', '@playwright', 'mcp', 'package.json');
  const playwrightProxy = path.join(paths.browserDock, 'proxy.cjs');
  const context7Command = path.join(paths.profile, 'node_modules', '.bin', 'context7-mcp');
  assert(profilePackage.dependencies?.['@playwright/mcp'] === '0.0.79', 'Playwright MCP version must remain pinned');
  assert(profilePackage.dependencies?.['@upstash/context7-mcp'] === '4.0.2', 'Context7 MCP version must remain pinned');
  assert(profilePackage.dependencies?.hono === '4.13.2', 'Context7 peer dependency must remain pinned');
  assert(profilePackage.dependencies?.['dsh-message-edit'] === '0.2.3', 'message-edit patch dependency must remain exactly pinned');
  assert(!/\bnpx\b|@latest/.test(profilePatch), 'MCP servers must not use npm wrappers or floating latest versions');
  assert(profilePatch.includes('proxy.cjs') && profilePatch.includes('browser-dock'), 'Playwright MCP must run through the reviewed browser dock proxy');
  assert(profilePatch.includes("'--browser'") && profilePatch.includes("'--headless'") && profilePatch.includes('playwright-profile'), 'Playwright MCP must run headless with the dedicated persistent profile');
  assert(profilePatch.includes(`command: '${context7Command}'`), 'Context7 MCP must use the profile-local executable directly');
  assert(fs.existsSync(playwrightPackage), 'Playwright MCP package is missing');
  assert(fs.existsSync(playwrightProxy) && (fs.statSync(playwrightProxy).mode & 0o111) !== 0, 'browser dock proxy is missing or not executable');
  assert(fs.existsSync(context7Command), 'Context7 MCP executable is missing');
}

function verifyCleanRuntime() {
  const runtime = read(paths.runtime);
  const hash = crypto.createHash('sha256').update(runtime).digest('hex');
  assert(!runtime.includes('__dshFairyMascot') && !runtime.includes('dsh-hdd'), 'legacy compiled-runtime visual injection is still installed');
  assert(hash === EXPECTED_RUNTIME_SHA256, `official runtime hash drifted (${hash})`);
  return hash;
}

function verifyLiveAudio() {
  return new Promise((resolve, reject) => {
    const request = http.get('http://127.0.0.1:9880/docs', { timeout: 3000 }, (response) => {
      response.resume();
      if (response.statusCode >= 200 && response.statusCode < 300) resolve();
      else reject(new Error(`audio service returned HTTP ${response.statusCode}`));
    });
    request.on('timeout', () => request.destroy(new Error('audio service timed out')));
    request.on('error', reject);
  });
}

async function main() {
  verifyStaticContracts();
  const runtimeHash = verifyCleanRuntime();
  if (process.argv.includes('--live')) await verifyLiveAudio();
  process.stdout.write(`Fairy system verified (${process.argv.includes('--live') ? 'static + live audio' : 'static'}; official runtime sha256 ${runtimeHash})\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});

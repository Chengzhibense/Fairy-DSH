import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const proxy = await readFile(new URL('../proxy.cjs', import.meta.url), 'utf8');
const host = await readFile(new URL('../src/index.js', import.meta.url), 'utf8');
const client = await readFile(new URL('../src/client/index.js', import.meta.url), 'utf8');
const bundledClient = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8');
const canonicalClientDiagnostics = await readFile(new URL('../../../fairy-contracts/client-diagnostics.cjs', import.meta.url), 'utf8');

test('bundles the canonical client diagnostics dependency', async () => {
  const require = createRequire(import.meta.url);
  const linkedClientDiagnostics = await readFile(require.resolve('dsh-fairy-contracts/client-diagnostics'), 'utf8');
  assert.equal(linkedClientDiagnostics, canonicalClientDiagnostics);
  assert.match(client, /require\('dsh-fairy-contracts\/client-diagnostics'\)/);
  assert.match(bundledClient, /#region \.\.\/\.\.\/fairy-contracts\/client-diagnostics\.cjs/);
  assert.doesNotMatch(bundledClient, /require\(["']dsh-fairy-contracts\/client-diagnostics["']\)/);
});

test('proxies the pinned Playwright server and captures browser mutations', () => {
  assert.match(proxy, /function resolvePlaywrightLaunch\(\)/);
  assert.match(proxy, /'@playwright', 'mcp'/);
  assert.match(proxy, /DSH_FAIRY_PROFILE_ROOT/);
  for (const action of ['browser_navigate', 'browser_click', 'browser_type', 'browser_fill_form', 'browser_tabs']) {
    assert.match(proxy, new RegExp(`'${action}'`));
  }
  assert.match(proxy, /internalCall\('browser_tabs'/);
  assert.match(proxy, /internalCall\('browser_take_screenshot'/);
  assert.match(proxy, /process\.stdout\.write\(`\$\{line\}\\n`\)/);
  assert.match(proxy, /function isPresentablePage\(url, title\)/);
  assert.match(proxy, /publish\(inactiveState\(\{ loading: true, status: 'starting', frameRevision \}\)\)/);
  assert.doesNotMatch(proxy, /publish\(\{ url: page\.url/);
  assert.match(proxy, /message\.id\.startsWith\(internalIdPrefix\)/);
  assert.match(proxy, /internalCalls\.clear\(\)/);
  assert.match(proxy, /clientCalls\.clear\(\)/);
  assert.match(proxy, /proxy-child-exited/);
  assert.match(proxy, /handleCommand\(command\)\.catch/);
  assert.match(proxy, /child\.stdin\.writable/);
});

test('keeps frames private and controls same-origin', () => {
  assert.match(host, /path: '\/browser-dock\/state'/);
  assert.match(host, /path: '\/browser-dock\/frame'/);
  assert.match(host, /frame-\$\{revision\}\.jpg/);
  assert.match(host, /invalid frame revision/);
  assert.match(host, /createReadStream\(file\)/);
  assert.match(host, /stream\.pipe\(res\)/);
  assert.doesNotMatch(host, /res\.end\(readFileSync\(file\)\)/);
  assert.match(host, /path: '\/browser-dock\/control'/);
  assert.match(host, /randomBytes\(32\)\.toString\('hex'\)/);
  assert.match(host, /CONTROL_TOKEN_FILE/);
  assert.match(host, /command\.token !== controlToken/);
  assert.match(host, /json\(res, 403, \{ error: 'forbidden' \}\)/);
  assert.match(host, /\{ token: _token, \.\.\.controlCommand \}/);
  assert.match(client, /JSON\.stringify\(\{ token, action, \.\.\.value \}\)/);
  assert.match(host, /Cache-Control', 'no-store'/);
  assert.match(host, /mode: 0o600/);
  assert.match(host, /if \(existsSync\(STATE_FILE\)\) writeCommand/);
  assert.match(proxy, /fs\.unlinkSync\(commandFile\)/);
  assert.doesNotMatch(client, /localStorage|sessionStorage|https?:\/\//);
});

test('pushes state-file changes and falls back to an 800ms poll', () => {
  assert.match(host, /watch\(RUNTIME_DIR/);
  assert.match(host, /String\(filename \|\| ''\) === 'state\.json'/);
  assert.match(host, /event: state\\ndata: changed/);
  assert.match(host, /path: '\/browser-dock\/events'/);
  assert.match(host, /Content-Type', 'text\/event-stream; charset=utf-8'/);
  assert.match(host, /fallbackPollMs: 800/);
  assert.match(client, /const FALLBACK_POLL_MS = 800/);
  assert.match(client, /new EventSource\('\/browser-dock\/events'\)/);
  assert.match(client, /events\.addEventListener\('state'/);
  assert.match(client, /events\.onerror = enableFallback/);
  assert.match(client, /window\.setTimeout\(load, FALLBACK_POLL_MS\)/);
  assert.doesNotMatch(client, /POLL_ACTIVE_MS|POLL_IDLE_MS/);
  assert.ok(800 >= 350 * 2, 'fallback interval should be at least twice the former active poll interval');
});

test('delivers proxy controls by filesystem event with a low-frequency reconciliation fallback', () => {
  assert.match(proxy, /fs\.watch\(runtimeDir/);
  assert.match(proxy, /String\(filename \|\| ''\) === commandFileName/);
  assert.match(proxy, /const commandRescanMs = 5_000/);
  assert.match(proxy, /setInterval\(checkCommands, commandRescanMs\)/);
  assert.equal(proxy.includes("const commandTimer = setInterval(() => {\n  try { pollCommands();"), false);
});

test('owns dock controls, session cleanup, and one-shot takeover', () => {
  for (const marker of ['最小化', '固定浏览器 Dock', '关闭浏览器 Dock 和浏览器', '在外部浏览器接管一次']) {
    assert.match(client, new RegExp(marker));
  }
  assert.match(client, /reason: 'session-switch'/);
  assert.match(host, /reason: 'plugin-unload'/);
  assert.match(proxy, /state\.takeoverConsumed/);
  assert.match(proxy, /command\.revision !== state\.revision/);
  assert.match(proxy, /--user-data-dir=\$\{userDataDir\}/);
  assert.match(proxy, /removeRuntimeFiles\(\)/);
  assert.match(proxy, /removeFrameFiles\(4\)/);
  assert.match(proxy, /filter\(\(tab\) => isPresentablePage\(tab\.url, tab\.title\)\)/);
  assert.match(proxy, /clientInput\.on\('close', \(\) => shutdown\('SIGTERM'\)\)/);
  assert.match(proxy, /setTimeout\(\(\) => process\.exit\(0\), 250\)/);
});

test('renders title and controls over the page without a URL header row', () => {
  assert.match(client, /dsh-browser-dock__chrome\{position:absolute/);
  assert.match(client, /inset:3px 3px auto 3px/);
  assert.match(client, /className: 'dsh-browser-dock__title'/);
  assert.match(client, /padding:0 3px 0 9px/);
  assert.doesNotMatch(client, /dsh-browser-dock__bar/);
  assert.doesNotMatch(client, /dsh-browser-dock__url/);
  assert.doesNotMatch(client, /dsh-browser-dock__status/);
  assert.doesNotMatch(client, /浏览器正在工作/);
  assert.doesNotMatch(client, /无法更新页面画面|state\.error/);
  assert.match(client, /!state\.frameRevision \|\| !title/);
  assert.doesNotMatch(client, /state\.url/);
  assert.doesNotMatch(client, /tab\.url/);
  assert.match(client, /object-fit:cover/);
  assert.doesNotMatch(client, /dsh-browser-dock__identity\{[^}]*backdrop-filter/);
  assert.doesNotMatch(client, /dsh-browser-dock__actions\{[^}]*backdrop-filter/);
  assert.match(client, /dsh-browser-dock::before\{[^}]*height:32px[^}]*linear-gradient/);
  assert.match(client, /dsh-browser-dock::before\{[^}]*backdrop-filter:blur\(2px\)/);
  assert.match(client, /dsh-browser-dock::before\{[^}]*mask-image:linear-gradient/);
  assert.match(client, /dsh-browser-dock::before\{[^}]*pointer-events:none/);
  assert.match(client, /data-frame-ready/);
  assert.match(client, /loadedRevision !== state\.frameRevision/);
  assert.match(client, /setPresentedFrameRevision\(loadedRevision\)/);
  assert.match(client, /background:#fff;color:#17202b/);
  assert.doesNotMatch(client, /dsw-alias-label-(?:primary|secondary)/);
});

test('mounts only in the official shell overlay and cleans style ownership', () => {
  assert.match(client, /ctx\.slots\.inject\('shell\.overlay'/);
  assert.match(client, /id: 'dsh-browser-dock'/);
  assert.match(client, /style\.setAttribute\('data-plugin', 'dsh-browser-dock'\)/);
  assert.match(client, /document\.getElementById\(STYLE_ID\)\?\.remove\(\)/);
  assert.match(client, /controller\?\.abort\(\)/);
});

test('resizes from the bottom-left with a screenshot-locked aspect ratio and top-right anchor', () => {
  assert.match(client, /function createBottomLeftResize\(event, setSize, aspectRatio\)/);
  assert.match(client, /startBox\.width \+ startX - moveEvent\.clientX/);
  assert.match(client, /\(startBox\.height \+ moveEvent\.clientY - startY\) \* ratio/);
  assert.match(client, /height: width \/ ratio/);
  assert.match(client, /image\.naturalWidth \/ image\.naturalHeight/);
  assert.match(client, /onLoad: fitFrameRatio/);
  assert.match(client, /cursor:sw-resize/);
  assert.match(client, /从左下角调整浏览器 Dock 大小/);
  assert.match(client, /pointercancel/);
  assert.match(client, /resizeCleanupRef\.current\?\.\(\)/);
  assert.doesNotMatch(client, /resize:both/);
});

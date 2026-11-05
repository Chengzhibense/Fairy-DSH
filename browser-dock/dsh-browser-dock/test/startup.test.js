import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const proxyPath = join(packageDir, 'proxy.cjs');

async function readJson(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch { return null; }
}

async function waitFor(check, message, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(message);
}

test('publishes the dock only after the first presentable frame is complete', async (t) => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-browser-dock-startup-'));
  const playwright = join(dshHome, 'fake-playwright.cjs');
  const stateFile = join(dshHome, 'browser-dock', 'state.json');
  await writeFile(playwright, `
const readline = require('node:readline');
let navigated = false;
const blankUrl = 'about:blank';
const searchUrl = 'https://www.bing.com/search?q=%E7%BB%9D%E5%8C%BA%E9%9B%B6';
function send(id, content) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result: { content } }) + '\\n'); }
readline.createInterface({ input: process.stdin, crlfDelay: Infinity }).on('line', (line) => {
  const message = JSON.parse(line);
  const name = message.params?.name;
  if (name === 'browser_navigate') {
    setTimeout(() => { navigated = true; send(message.id, [{ type: 'text', text: '- Page URL: ' + searchUrl + '\\n- Page Title: 绝区零 - 搜索' }]); }, 160);
  } else if (name === 'browser_snapshot') {
    send(message.id, [{ type: 'text', text: '- Page URL: ' + blankUrl + '\\n- Page Title: about:blank' }]);
  } else if (name === 'browser_tabs') {
    const url = navigated ? searchUrl : blankUrl;
    const title = navigated ? '绝区零 - 搜索' : 'about:blank';
    send(message.id, [{ type: 'text', text: '- 0: (current) [' + title + '](' + url + ')' }]);
  } else if (name === 'browser_take_screenshot') {
    const url = navigated ? searchUrl : blankUrl;
    const title = navigated ? '绝区零 - 搜索' : 'about:blank';
    send(message.id, [
      { type: 'text', text: '- Page URL: ' + url + '\\n- Page Title: ' + title },
      { type: 'image', data: '/9j/2Q==', mimeType: 'image/jpeg' },
    ]);
  } else if (name === 'browser_close') {
    send(message.id, [{ type: 'text', text: 'closed' }]);
  }
});
`);

  const child = spawn(process.execPath, [proxyPath], {
    env: { ...process.env, DSH_HOME: dshHome, DSH_BROWSER_DOCK_PLAYWRIGHT: playwright },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  t.after(async () => {
    if (child.exitCode == null) {
      child.kill('SIGTERM');
      await new Promise((resolve) => child.once('exit', resolve));
    }
    await rm(dshHome, { recursive: true, force: true });
  });

  await waitFor(async () => (await readJson(stateFile))?.status === 'idle', 'proxy did not initialize');
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'browser_snapshot', arguments: {} } })}\n`);
  const waiting = await waitFor(async () => {
    const value = await readJson(stateFile);
    return value?.status === 'waiting' ? value : null;
  }, 'blank page did not settle as hidden');
  assert.equal(waiting.active, false);
  await assert.rejects(stat(join(dshHome, 'browser-dock', `frame-${waiting.frameRevision}.jpg`)), { code: 'ENOENT' });

  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'browser_navigate', arguments: { url: 'https://www.bing.com/' } } })}\n`);
  const starting = await waitFor(async () => {
    const value = await readJson(stateFile);
    return value?.status === 'starting' ? value : null;
  }, 'navigation did not enter hidden startup');
  assert.equal(starting.active, false);

  const ready = await waitFor(async () => {
    const value = await readJson(stateFile);
    return value?.status === 'ready' ? value : null;
  }, 'first stable frame was not published');
  assert.equal(ready.active, true);
  assert.equal(ready.loading, false);
  assert.equal(ready.title, '绝区零');
  assert.equal(ready.tabs[0].title, '绝区零');
  assert.ok(ready.frameRevision > 0);
  assert.ok((await stat(join(dshHome, 'browser-dock', `frame-${ready.frameRevision}.jpg`))).size > 0);

  const commandFile = join(dshHome, 'browser-dock', 'command.json');
  const temporaryCommand = `${commandFile}.test.tmp`;
  await writeFile(temporaryCommand, JSON.stringify({ action: 'close', reason: 'event-driven-test' }));
  await rename(temporaryCommand, commandFile);
  const closed = await waitFor(async () => {
    const value = await readJson(stateFile);
    return value?.status === 'event-driven-test' ? value : null;
  }, 'filesystem event did not deliver the control command before the 5s fallback');
  assert.equal(closed.active, false);
});

test('launches the Playwright package entry through node on every platform', async (t) => {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-browser-dock-package-'));
  const packageDir = join(dshHome, 'profiles', 'web', 'node_modules', '@playwright', 'mcp');
  await mkdir(packageDir, { recursive: true });
  await writeFile(join(packageDir, 'package.json'), JSON.stringify({
    name: '@playwright/mcp',
    bin: { 'playwright-mcp': 'cli.js' },
  }));
  await writeFile(join(packageDir, 'cli.js'), 'process.stdin.resume();\n');

  const child = spawn(process.execPath, [proxyPath], {
    env: { ...process.env, DSH_HOME: dshHome, DSH_BROWSER_DOCK_PLAYWRIGHT: '' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  t.after(async () => {
    if (child.exitCode == null) {
      child.kill('SIGTERM');
      await new Promise((resolve) => child.once('exit', resolve));
    }
    await rm(dshHome, { recursive: true, force: true });
  });

  const stateFile = join(dshHome, 'browser-dock', 'state.json');
  await waitFor(async () => (await readJson(stateFile))?.status === 'idle', 'proxy did not initialize from the package entry');
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(child.exitCode, null, 'proxy exited after resolving the Playwright package entry');
});

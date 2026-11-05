import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { createFairyVoiceHandlers, markdownToSpeechText, normalizeSpeechText, splitSpeechSentences, writePrivateJson } from '../lib/index.js';

function requestWithJson(value) {
  const request = new EventEmitter();
  request[Symbol.asyncIterator] = async function* () {
    yield Buffer.from(JSON.stringify(value));
  };
  return request;
}

function responseDouble() {
  const response = new EventEmitter();
  response.statusCode = 200;
  response.headersSent = false;
  response.writableEnded = false;
  response.destroyed = false;
  response.setHeader = () => {};
  response.write = () => { response.headersSent = true; return true; };
  response.end = () => { response.writableEnded = true; };
  response.destroy = () => { response.destroyed = true; };
  return response;
}

function jsonResponse(value, ok = true) {
  return {
    ok,
    async json() { return value; },
  };
}

test('markdown speech extraction removes code and image content', () => {
  assert.equal(markdownToSpeechText('结论 **已完成**。\n\n```js\nignore()\n```'), '结论 已完成。');
});

test('private JSON writes are atomic, unique, and permission-restricted', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'fairy-private-json-'));
  try {
    const file = join(directory, 'config.json');
    await Promise.all([
      writePrivateJson(file, { version: 1, value: 'first' }),
      writePrivateJson(file, { version: 1, value: 'second' }),
    ]);
    const value = JSON.parse(await readFile(file, 'utf8'));
    assert.equal(value.version, 1);
    assert.ok(['first', 'second'].includes(value.value));
    // Windows has no POSIX mode bits; libuv reports 0o666 regardless of the
    // requested mode. Keep the assertion on platforms that enforce it.
    if (process.platform !== 'win32') assert.equal((await stat(file)).mode & 0o777, 0o600);
    assert.deepEqual((await readdir(directory)).filter((name) => name.endsWith('.tmp')), []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('markdown speech extraction preserves prose-block pauses', () => {
  assert.equal(markdownToSpeechText('第一项没有标点\n\n第二项也没有标点'), '第一项没有标点；第二项也没有标点；');
  assert.equal(markdownToSpeechText('- 状态已同步\n- 等待下一步'), '状态已同步；等待下一步；');
  assert.equal(markdownToSpeechText('已经结束。\n\n下一段'), '已经结束。下一段；');
});

test('speech normalization expands symbols and units conservatively', () => {
  assert.equal(normalizeSpeechText('Ⅲ——25°C，成功率 50%，日期 2024/08/17。'), '三，二十五摄氏度，成功率 百分之五十，日期 2024年08月17日。');
  assert.equal(normalizeSpeechText('x ≤ 3，A/B……'), 'x 小于等于 3，A/B……');
});

test('speech normalization handles advanced numeric and technical forms', () => {
  assert.equal(normalizeSpeechText('2026-08-17 14:30:05，1/2，3:1，10-20，¥1,234.50，3m²。'), '2026年08月17日 十四点三十分五秒，二分之一，三比一，十到二十，一千二百三十四点五零元，三平方米。');
  assert.equal(normalizeSpeechText('CPU API https://example.com a@b.com，α+β≈∞。'), '中央处理器 接口 链接 邮箱地址，阿尔法加贝塔约等于无穷大。');
});

test('speech normalization makes standalone decimal points explicit', () => {
  assert.equal(normalizeSpeechText('圆周率约为 3.1415926。记住 3.14 即可。'), '圆周率约为 三点一四一五九二六。记住 三点一四 即可。');
  assert.equal(normalizeSpeechText('误差 -.5，温度 -3.1415°C。'), '误差 负零点五，温度 负三点一四一五摄氏度。');
  assert.equal(normalizeSpeechText('版本 v3.1415。文件 build.2026 不改写。'), '版本 v3.1415。文件 build.2026 不改写。');
});

test('speech normalization strengthens Chinese and English colon pauses', () => {
  assert.equal(normalizeSpeechText('注意：这是英文 Note: Fairy::正在处理。'), '注意；这是英文 Note；Fairy；正在处理。');
  assert.equal(normalizeSpeechText('时间 14:30，比例 3:1，网址 https://fairy.example/a:b。'), '时间 十四点三十分，比例 三比一，网址 链接');
  assert.equal(normalizeSpeechText(normalizeSpeechText('注意：Note: Fairy。')), '注意；Note；Fairy。');
});

test('speech sentence splitting preserves numeric and ellipsis structure', () => {
  assert.deepEqual(splitSpeechSentences('数值 3.14，下一句。'), ['数值 三点一四，下一句。']);
  assert.deepEqual(splitSpeechSentences('……我在。主人已到位。'), ['……我在。', '主人已到位。']);
  assert.deepEqual(splitSpeechSentences('第一句；第二句！第三句？'), ['第一句；', '第二句!', '第三句?']);
  assert.deepEqual(splitSpeechSentences('？！……！！！'), ['?……!']);
});

test('long replies are split into playable batches', () => {
  const text = Array.from({ length: 24 }, (_, index) => `第${index + 1}句，Fairy正在处理这条信息。`).join('');
  const sentences = splitSpeechSentences(text);
  assert.equal(sentences.length, 24);
  assert.ok(sentences.every((sentence) => sentence.length <= 40));
});

test('empty replies do not schedule speech', () => {
  assert.deepEqual(splitSpeechSentences('   '), []);
});

test('status treats a non-2xx Fairy response as unavailable', async () => {
  const handlers = createFairyVoiceHandlers({ fetchImpl: async () => ({ ok: false, status: 500 }) });
  const response = responseDouble();
  await handlers.status({}, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.writableEnded, true);
});

test('closed downstream responses are never written to', async () => {
  const handlers = createFairyVoiceHandlers({ fetchImpl: async () => ({ ok: false, status: 500 }) });
  const response = responseDouble();
  response.destroyed = true;
  response.setHeader = () => { throw new Error('write to closed response'); };
  await handlers.status({}, response);
  assert.equal(response.writableEnded, false);
});

test('tts closes a partially written PCM response instead of appending JSON', async () => {
  const handlers = createFairyVoiceHandlers({
    fetchImpl: async () => ({
      ok: true,
      headers: { get: () => 'audio/raw' },
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from([0, 0]);
          throw new Error('upstream disconnected');
        },
      },
    }),
  });
  const response = responseDouble();
  await handlers.tts(requestWithJson({ text: '测试' }), response);
  assert.equal(response.destroyed, true);
  assert.equal(response.writableEnded, false);
});

test('client disconnect aborts the still-open upstream PCM request', async () => {
  let upstreamSignal;
  const handlers = createFairyVoiceHandlers({
    fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
      upstreamSignal = options.signal;
      options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  });
  const request = requestWithJson({ text: '测试' });
  const response = responseDouble();
  const task = handlers.tts(request, response);
  await new Promise((resolve) => setImmediate(resolve));
  request.emit('aborted');
  await task;
  assert.equal(upstreamSignal.aborted, true);
});

test('plugin disposal aborts every active synthesis request', async () => {
  let upstreamSignal;
  const handlers = createFairyVoiceHandlers({
    fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
      upstreamSignal = options.signal;
      options.signal.addEventListener('abort', () => reject(new Error('disposed')), { once: true });
    }),
  });
  const task = handlers.tts(requestWithJson({ text: '测试' }), responseDouble());
  await new Promise((resolve) => setImmediate(resolve));
  handlers.dispose();
  await task;
  assert.equal(upstreamSignal.aborted, true);
  assert.equal(upstreamSignal.reason, 'disposed');
});

test('newest synthesis request supersedes the prior shared-pipeline request', async () => {
  let firstSignal;
  let calls = 0;
  const handlers = createFairyVoiceHandlers({
    fetchImpl: (_url, options) => {
      calls += 1;
      if (calls === 1) {
        firstSignal = options.signal;
        return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('superseded')), { once: true }));
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'audio/raw' },
        body: { async *[Symbol.asyncIterator]() { yield Buffer.from([0, 0]); } },
      });
    },
  });
  const first = handlers.tts(requestWithJson({ text: '第一条' }), responseDouble());
  await new Promise((resolve) => setImmediate(resolve));
  const secondResponse = responseDouble();
  await handlers.tts(requestWithJson({ text: '第二条' }), secondResponse);
  await first;
  assert.equal(firstSignal.aborted, true);
  assert.equal(secondResponse.writableEnded, true);
});

test('local synthesis uses a restrained fragment pause for continuous speech', async () => {
  let request;
  const handlers = createFairyVoiceHandlers({
    fetchImpl: (_url, options) => {
      request = JSON.parse(options.body);
      return Promise.resolve({ ok: true, headers: { get: () => 'audio/raw' }, body: { async *[Symbol.asyncIterator]() { yield Buffer.from([0, 0]); } } });
    },
  });
  await handlers.tts(requestWithJson({ text: '连续播放检查。' }), responseDouble());
  assert.equal(request.fragment_interval, 0.14);
  assert.equal(request.streaming_mode, 1);
});

test('voice brain uses only the fixed non-thinking Flash model for long final-answer briefs', async () => {
  let request;
  const handlers = createFairyVoiceHandlers({
    readConfig: async () => ({ apiKey: 'sk-test-voice-brain-key-123456' }),
    fetchImpl: async (_url, options) => {
      request = { url: _url, options, body: JSON.parse(options.body) };
      return jsonResponse({ choices: [{ message: { content: '结论已经确认，接下来按建议执行即可。' } }] });
    },
  });
  const response = responseDouble();
  const longAnswer = '最终回答：' + '这是一段需要压缩的结论。'.repeat(40);
  await handlers.voiceBrief(requestWithJson({ markdown: longAnswer }), response);
  assert.equal(response.writableEnded, true);
  assert.equal(request.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(request.body.model, 'deepseek-v4-flash');
  assert.equal(request.body.max_tokens, 400);
  assert.deepEqual(request.body.thinking, { type: 'disabled' });
  assert.equal(request.body.messages.at(-1).content.includes('默认控制在 80 到 180'), true);
  assert.equal(request.body.messages.some((message) => message.content.includes('搜索过程')), false);
  assert.equal(request.body.messages.at(-1).content.includes('这是一段需要压缩的结论'), true);
  assert.equal(request.body.messages.at(-1).content.includes('```'), false);
});

test('voice brain locally enforces the concise brief limit', async () => {
  const handlers = createFairyVoiceHandlers({
    readConfig: async () => ({ apiKey: 'sk-test-voice-brain-key-123456' }),
    fetchImpl: async () => jsonResponse({ choices: [{ message: { content: '这是过长的朗读内容。'.repeat(80) } }] }),
  });
  const response = responseDouble();
  let payload = '';
  response.end = (value) => { payload = String(value || ''); response.writableEnded = true; };
  await handlers.voiceBrief(requestWithJson({ markdown: '原始最终回答。'.repeat(50) }), response);
  const brief = JSON.parse(payload).brief;
  assert.ok(Array.from(brief).length <= 260);
});

test('voice brain does not call cloud when no key is configured', async () => {
  let calls = 0;
  const handlers = createFairyVoiceHandlers({ readConfig: async () => ({ apiKey: '' }), fetchImpl: async () => { calls += 1; return jsonResponse({}); } });
  const response = responseDouble();
  await handlers.voiceBrief(requestWithJson({ markdown: '一段足够长的最终回答。'.repeat(40) }), response);
  assert.equal(calls, 0);
  assert.equal(response.statusCode, 422);
});

test('voice brain status never exposes the API key', async () => {
  const handlers = createFairyVoiceHandlers({ readConfig: async () => ({ apiKey: 'sk-secret-voice-brain-key-123456' }) });
  const response = responseDouble();
  let payload = '';
  response.end = (value) => { payload = String(value || ''); response.writableEnded = true; };
  await handlers.voiceBrainStatus({}, response);
  assert.equal(payload.includes('sk-secret'), false);
  assert.deepEqual(JSON.parse(payload), { configured: true, model: 'deepseek-v4-flash' });
});

test('server handlers use explicit speech and transport boundaries', async () => {
  const [source, localTtsProxy, voiceBriefFallback] = await Promise.all([
    readFile(new URL('../lib/index.js', import.meta.url), 'utf8'),
    readFile(new URL('../lib/server/local-tts-proxy.js', import.meta.url), 'utf8'),
    readFile(new URL('../lib/server/voice-brief-fallback.js', import.meta.url), 'utf8'),
  ]);
  assert.match(source, /function createSentencePreparation\(/);
  assert.match(source, /from '\.\/server\/local-tts-proxy\.js'/);
  assert.match(source, /from '\.\/server\/voice-brief-fallback\.js'/);
  assert.match(localTtsProxy, /export function createPcmStreamHandler\(/);
  assert.match(localTtsProxy, /export function createLocalTtsTransport\(/);
  assert.match(voiceBriefFallback, /export function createVoiceBrainServerBoundary\(/);
  assert.match(source, /const sentencePreparation = createSentencePreparation\(\)/);
  assert.match(source, /const pcmStreamHandler = createPcmStreamHandler\(\)/);
  assert.match(source, /const localTtsTransport = createLocalTtsTransport\(/);
  assert.match(source, /const voiceBrainBoundary = createVoiceBrainServerBoundary\(/);
  assert.match(source, /http:\/\/127\.0\.0\.1:9880\/tts/);
  const loader = source.match(/function readReferencePrompt\(\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(loader, 'reference prompt loader should be available');
  const warnings = [];
  const sandbox = {
    REFERENCE_PROMPT_PATH: '/synthetic/fairy_ref.txt',
    REFERENCE_PROMPT_FALLBACK: 'fallback prompt',
    diagnostics: { warn(...args) { warnings.push(args); } },
    readFileSync() { throw Object.assign(new Error('synthetic missing reference'), { code: 'ENOENT' }); },
  };
  vm.runInNewContext(`${loader}; globalThis.readReferencePrompt = readReferencePrompt;`, sandbox);
  assert.equal(sandbox.readReferencePrompt(), 'fallback prompt');
  assert.equal(warnings.length, 1);
  sandbox.readFileSync = () => '  file prompt\n';
  assert.equal(sandbox.readReferencePrompt(), 'file prompt');
  assert.equal(warnings.length, 1);
});

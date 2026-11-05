# Fairy DSH

Fairy 的 DSH 插件套件（开源发布候选目录）。本目录与任何生产环境
完全独立，不包含个人会话、日志、密钥、缓存、
`node_modules` 或完整游戏语料。

## 目录

- `fairy-contracts/`：跨插件契约与诊断边界
- `browser-dock/`、`balance-meter/`、`fairy-startup/`、`fairy-voice/`、`fairy-visual/`：Fairy 插件
- `fairy-system/`：离线检查与验收工具
- `profiles/web/`：独立 Web profile 模板

## 独立测试

需要 DSH CLI `0.2.1-alpha.5`、Node.js 22 和 pnpm。0.2.x 把插件偏好放进
profile entry 的 volatile `Config`，客户端通过 `remote.settings` 读写；
旧的 `settingsNamespace`/`settingsScope` 已移除，本版本不再依赖它们。
测试时必须使用独立 `DSH_HOME`，不要指向生产目录：

```sh
DSH_HOME="$PWD/.dsh-test-home" ./scripts/test-isolated.sh
```

Windows 使用等价入口：

```powershell
pwsh -File .\scripts\test-isolated.ps1
```

Browser Dock 在 Windows 默认使用系统 Edge，其他平台默认使用 Google Chrome。
可设置 `DSH_FAIRY_BROWSER=chrome`、`msedge` 或 `chromium` 覆盖；选择
`chromium` 时需先运行 `npx @playwright/mcp install-browser chrome-for-testing`。

本版本暂不加载 `dsh-message-edit` 与 `dsh-reasoning-effort`：它们仍引用
0.1 的 client runtime 入口，在 0.2.x 上会在 boot 阶段导入失败。等上游
适配后再作为可选 overlay 加回，不影响 Fairy Visual、Voice、Startup、
Balance Meter 与 Browser Dock。

完整世界观资料、TTS 模型和用户数据应通过本地路径或私有配置注入，
不会随此仓库分发。

## 第三方依赖

第三方包只通过 manifest/lockfile 引用，不复制其源码。许可证和来源在
`THIRD_PARTY_NOTICES.md` 中维护。

## 许可边界

除文件另有说明外，本仓库中 Fairy-DSH 的原创代码、脚本、测试、配置和
文档按 Apache License 2.0 发布，详见 `LICENSE` 与 `NOTICE`。第三方插件、
依赖及其生成物不在本许可范围内，继续适用各自许可证。

《绝区零》剧情文本、角色资料、官方素材，私有 WORLD CORE、个人语料、会话
数据和运行时密钥均不随仓库发布；本项目不授予相关版权、商标或官方关联权利。
发布前请按 `RELEASE-CHECKLIST.md` 复核分发内容。

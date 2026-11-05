# Third-party notices

本仓库不复制第三方源码。以下依赖由包管理器或 DSH 宿主安装；它们不在
Fairy-DSH 的 Apache-2.0 原创代码许可范围内，发布时必须继续保留各自的
许可证、版权和 NOTICE 要求。

| 包 | 固定版本 / 来源 | 许可证 | 版权 / 来源 |
| --- | --- | --- | --- |
| `@playwright/mcp` | `0.0.79` · [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | Apache-2.0 | Microsoft；随包附带声明 |
| `@upstash/context7-mcp` | `4.0.2` · [upstash/context7](https://github.com/upstash/context7) | MIT | Upstash；随包附带声明 |
| `@deepseek-ai/schemastery` | `3.18.5` · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · `vendor/schemastery` | MIT | DeepSeek Harness contributors；随包附带声明 |
| `hono` | `4.13.2` · [honojs/hono](https://github.com/honojs/hono) | MIT | Hono contributors；随包附带声明 |

`dsh-message-edit` 和 `dsh-reasoning-effort` 仍以 MIT 发布，但它们当前的
客户端 bundle 依赖 0.1 的 `@deepseek-ai/dsh-client-runtime/client` 模块表，
在 DSH 0.2.x 上无法导入，因此本版本不再把它们作为默认 profile 依赖。

## 宿主提供的 DSH 包

`@deepseek-ai/dsh-base`、`@deepseek-ai/dsh-web-app` 等由 DSH CLI/profile
宿主提供，不随本仓库 vendoring，也不由本项目重新授权。使用者应按照 DSH
发行包中的许可证和版权文件处理。

## 本仓库内的本地包

`fairy-contracts`、`dsh-browser-dock`、`dsh-balance-meter`、
`dsh-fairy-startup`、`dsh-fairy-visual`、`dsh-fairy-voice` 是本仓库的原创
代码（除其自身依赖外），按根目录 `LICENSE` 和 `NOTICE` 处理。

发布新版本时，应从最终 lockfile 重新核对版本、来源和许可证，并把新增的
第三方依赖补入本表；不能因为依赖被锁定就把它们当作本项目原创内容。

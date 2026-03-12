# Alpha Radar OpenClaw Skill

这是整理后的维护版说明。`SKILL.md` 是唯一的 SKILL 权威定义，README 不再复制整段 SKILL 元数据，避免版本和能力描述漂移。

## 当前状态

- 权威 SKILL 定义：`SKILL.md`
- 渲染入口：`scripts/render-report.js`
- 公共 API 数据抓取：`scripts/fetch-binance-public.js`
- 主渲染器：`src/render.js`
- 数据校验：`src/schema.js`

## 已修复的重点问题

- 修复 `Square` 模式结论被硬编码覆盖的问题
- 修复 `Square` + `help` 模式下署名被丢失的问题
- 修复 `report` 模式不遵守模块开关的问题
- 修复 `renderRequiredList` 输出 `- 1. xxx` 的双重序号问题
- 修复 `scopeLabel()` 对 `bsc` / `solana` 单链标签显示错误的问题
- 修复 `parseNaturalCommand()` 把链名误识别为代币名的问题
- 增加中文数字 `前三 / 前五 / 前十` 解析
- 增加 `--validate-only / --dry-run`
- 增加 `--format json`
- 将 `futuresSentiment` 正式纳入 schema 与渲染层
- 增加 `Square` 文本字数统计
- 更新 sample 输出与 smoke 脚本结构

## 快速开始

安装依赖：

```bash
npm install
```

生成完整版示例：

```bash
npm run report
```

生成广场版示例：

```bash
npm run square
```

验证输入而不渲染：

```bash
npm run validate
```

跑一遍 smoke：

```bash
npm run smoke
```

## 目录

- `SKILL.md`：技能定义
- `src/render.js`：TG / Report / Square 渲染
- `src/schema.js`：数据 schema
- `scripts/render-report.js`：CLI、参数解析、自然语言命令解析
- `scripts/fetch-binance-public.js`：Binance 公共 API 数据抓取
- `scripts/smoke.js`：生成示例输出
- `docs/DATA_SCHEMA.zh-CN.md`：最新数据结构文档
- `examples/sample-data.json`：示例输入

## 说明

当前 `lang` 仅保留 `zh`。之前 schema 暴露了 `en`，但渲染文案并没有真正多语言实现，属于误导性配置，这里已经收口。

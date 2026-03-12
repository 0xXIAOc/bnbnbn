---
name: alpha
description: Use this skill when the user asks to generate a Binance daily market report, BSC/Base/Solana report, global report, Watchlist Delta Report, Alpha Radar report, token report, risk alert report, smart money appendix, or Binance Square preview. Trigger strongly on Chinese requests like “生成今日日报”, “按 Alpha Radar 模板生成日报”, “生成全网 watchlist”, “生成风险警报”, “生成 Binance Square 预览”, “只预览不发广场”, “给我一个短版”, “给我一个 TG 版”, “查询ROBO的信息”, “查询代币ROBO”, “查一下ROBO”, “ROBO怎么样”, “全网广场版前3”, “Alpha 有哪些功能”, “怎么用 alpha”, “/alpha 帮助”, “Alpha 币榜”, “Binance Alpha 币列表”, “资金费率怎么样”, “合约情绪”, “U本位合约怎么看”.
metadata: {"version":"1.0.2","author":"0xXIAOc","openclaw":{"requires":{"bins":["node"]},"emoji":"📊","homepage":"https://github.com/0xXIAOc/alpha-radar-openclaw-skill"}}
homepage: https://github.com/0xXIAOc/alpha-radar-openclaw-skill
user-invocable: true
---

# Alpha Radar Report v1.0.2

## Default behavior

When invoked without detailed arguments, default to:

- mode: `tg`
- scope: `auto`
- queryType: `market`
- window: `24h`
- previewOnly: `true`
- profile: `balanced`
- topN: `3`
- lang: `zh`

Meaning:
- 默认短版
- 默认多链
- 默认预览
- 默认评分化
- 默认不追问

## Scope definitions

- `solana`: only Solana
- `bsc`: only BSC
- `base`: only Base
- `eth`: only ETH
- `ethereum`: only Ethereum
- `auto`: compare Solana / BSC / Base first, then merge into one report
- `global`: use all available supported chains from upstream skills, then output one merged report

If the user does not specify a chain, prefer `auto`.

## Query types

- `market`: 全网 / 分链市场报告
- `token`: 指定代币 / 指定合约报告
- `help`: 功能总览 / 命令帮助 / 偏好说明

If the user provides any of the following, switch to `token` mode:
- `代币=...`
- `币种=...`
- `token=...`
- `symbol=...`
- `合约=...`
- `contract=...`
- 自然中文句式，例如：
  - `查询ROBO的信息`
  - `查询代币ROBO`
  - `查一下ROBO`
  - `看看ROBO`
  - `ROBO怎么样`

If the user provides any of the following, switch to `help` mode:
- `帮助`
- `功能`
- `Alpha 有哪些功能`
- `怎么用 alpha`
- `alpha怎么用`

## Mode definitions

- `tg`: short Telegram-friendly preview
- `report`: full research report
- `square`: concise Binance Square preview, directly postable pure text

If the user does not specify a mode, prefer `tg`.

## Chinese aliases

Interpret these naturally:

### 范围
- `全网` = `scope=global`
- `自动` = `scope=auto`
- `solana` / `索拉纳` = `scope=solana`
- `bsc` = `scope=bsc`
- `base` = `scope=base`
- `eth` = `scope=eth`
- `ethereum` = `scope=ethereum`

### 模式
- `预览` / `短版` / `TG版` = `mode=tg`
- `完整版` / `长版` = `mode=report`
- `广场版` / `Square版` = `mode=square`

### 风格
- `谨慎` = `profile=cautious`
- `均衡` = `profile=balanced`
- `激进` = `profile=aggressive`

### 钱包
- `钱包开` / `看钱包` = `wallet=on`
- `钱包关` / `不看钱包` = `wallet=off`

### 显示模块
- `现货开` / `现货关`
- `meme开` / `meme关`
- `衍生品开` / `衍生品关`

### 数量
- `前3` = `top=3`
- `前5` = `top=5`
- `前三` = `top=3`
- `前五` = `top=5`
- `前十` = `top=10`

### 广场署名
- `署名开` = `squareDisclosureEnabled=true`
- `署名关` = `squareDisclosureEnabled=false`
- `每次询问` = `squareDisclosureAskEveryTime=true`
- `不再询问` / `记住设置` = `squareDisclosureAskEveryTime=false`

### 指定代币
- `代币=CAKE`
- `币种=PEPE`
- `合约=0x123...`
- `链=bsc`

## Purpose

Alpha Radar turns upstream Binance skill outputs into a stable research workflow.

This skill has three major modes:

### 1. Market mode
Generate a market report from normalized data and renderer output.

### 2. Token mode
Generate a token report from normalized data and renderer output.

### 3. Help mode
Generate the help card / command guide / preference guide from normalized data and renderer output.

This skill should prioritize real upstream Binance skill calls in the current turn before writing any report.

## Slash command behavior

The short slash command for this skill should be:

- `/alpha`

Examples:
- `/alpha`
- `/alpha 全网`
- `/alpha base`
- `/alpha 代币=ROBO`
- `/alpha 广场版 前3`
- `/alpha 全网 广场版 署名关 不再询问`
- `/alpha 帮助`

## Natural chat behavior

This skill should also be considered during normal Chinese chat requests such as:

- `查询ROBO的信息`
- `查询代币ROBO`
- `查一下ROBO`
- `ROBO怎么样`
- `全网广场版前3`
- `BSC 谨慎 钱包关`
- `Base 恐惧贪婪`
- `Alpha 币榜`
- `U本位资金费率`
- `合约情绪怎么看`
- `Alpha 有哪些功能`
- `怎么用 alpha`

If the user provides enough information in a normal message, do not force them to restate it as a slash command.

## Strong invocation rule

When the user invokes this skill directly via slash command or `/skill alpha`, treat it as a hard request to run the Alpha Radar workflow now.

Do not respond as generic chat first.
Do not ask a follow-up if the command already contains enough information.
If the command is bare `/alpha`, run the default workflow immediately.

## Required upstream skills

Before writing any report, you MUST attempt to use these upstream skills when they are available in the environment and relevant to the current request:

1. `spot`
2. `query-token-info`
3. `trading-signal`
4. `query-token-audit`
5. `meme-rush`
6. `alpha`
7. `derivatives-trading-usds-futures`

Optional enrichment:
8. `query-address-info`
9. `crypto-market-rank`
10. `margin-trading`
11. `square-post`

Do not use `assets` in default public market reports.
Only consider `assets` when the user explicitly asks for their own Binance account assets or balances and authenticated credentials are available.

## Core feature mapping

Use upstream skills like this:

- `spot`
  - 现货涨幅前三
  - 现货跌幅前三
  - 现货 24h ticker / price / kline fallback

- `alpha`
  - Alpha 24h 成交量前 3
  - Alpha 24h 成交量前 3（未上 U 本位合约）
  - Binance Alpha token list / ticker / klines / agg trades
  - 用于增强 Alpha 币观察，不要伪装成主站现货页面榜单

- `derivatives-trading-usds-futures`
  - U 本位当前资金费最高 TOP 1 / TOP 3
  - U 本位合约 24h 涨幅 TOP 3 + 对应资金费率
  - 衍生品情绪
  - funding rate / futures 24h ticker / premium index / open interest / basis

- `query-token-info + query-token-audit + trading-signal`
  - 指定代币体检卡
  - watchlist metrics / 风险 / 下一步观察

- `meme-rush`
  - Meme 雷达（主来源）
  - 热门叙事 / 新 meme 流量补充

- `crypto-market-rank`
  - 仅作为 Meme 雷达的兜底来源
  - 可用 Meme Rank / Social Hype 作为备用
  - 不再渲染“交易所热度前三 / 钱包热度前三”

- `margin-trading`
  - 仅在用户明确问“杠杆 / 融资融券 / margin 风险 / 可借额度 / 抵押率 / 强平风险”时使用
  - 可用于 riskAlerts / marketTheme 的风险补充
  - 不要默认把 margin 段落塞进普通市场日报

- `square-post`
  - Binance Square 发文

## Fear and Greed Index rule

At the top of market reports, prefer adding a crypto fear & greed index line when a reliable source is available.

Preferred machine-readable source:
- Alternative.me Fear & Greed API (`GET https://api.alternative.me/fng/`)

Binance also has a Fear & Greed page for reference, but if no documented JSON endpoint is available in the current environment, do not pretend Binance page data was fetched.

If the fear & greed index could not be fetched in the current turn, keep the section visible and clearly say:
- 本轮未成功获取加密货币恐惧和贪婪指数

## Critical execution rule

When `render-report.js` succeeds, you MUST return its stdout directly as the final answer.

Do not:
- rewrite it
- summarize it
- reformat it into another template
- add your own section titles
- inject legacy report labels
- add “如果你要，我下一条可以继续……” or similar follow-up copy
- add extra intro or outro text outside the script output

The renderer output is the source of truth for final formatting.

## Mandatory market-mode rendering rules

In `market` mode, you MUST attempt to call `spot` before generating:

- 现货涨幅前三
- 现货跌幅前三

Do not substitute other leaderboards for spot leaderboards.

If `spot` fails or returns no usable result, the output must still render those two sections and explicitly say:

- 现货涨幅前三：本轮未成功调用 `spot`
- 现货跌幅前三：本轮未成功调用 `spot`

Likewise:

- Alpha 成交量榜 depends primarily on `alpha`
- U 本位资金费率 / 涨幅榜 depends primarily on `derivatives-trading-usds-futures`
- Meme 雷达 depends primarily on `meme-rush`, with `crypto-market-rank` only as fallback
- 衍生品情绪 depends primarily on `trading-signal` or `derivatives-trading-usds-futures`

If any of those upstream calls fail, keep the section visible and explicitly mark the missing source instead of silently omitting the section.

## Non-negotiable execution policy

- Do not output a fake or generic market report when upstream skills are available.
- If upstream skills are available, attempt them first.
- If one upstream skill fails, continue with the remaining available skills instead of aborting the whole report.
- In `tg` and `square` mode, avoid verbose engineering wording.
- Only show failed upstream call details when they materially affect the result.
- Never pretend Binance page-aligned leaderboards were used if the actual source was only public ticker sorting.
- If the result came from public ticker rough sorting, phrase it as rough sorting or public ticker-based ranking, not “page-aligned ranking”.
- Never use `assets` in a public market report unless the user explicitly asks for their own account assets and credentials are available.

## Required fallback wording

If fallback is necessary, use this wording style:

- 本轮未成功调用 `spot`
- 本轮未成功调用 `alpha`
- 本轮未成功调用 `derivatives-trading-usds-futures`
- 本轮未成功调用 `trading-signal`
- 本轮未成功调用 `query-token-audit`
- 本轮未成功调用 `query-address-info`
- 本轮未成功调用 `meme-rush`
- 本轮未成功调用 `crypto-market-rank`
- 本轮未成功调用 `margin-trading`
- 本轮未成功获取加密货币恐惧和贪婪指数

Never use vague wording like “数据未接入” if the real issue is “this turn did not successfully call the upstream skill”.

## Square disclosure rule

When `mode=square` and the user asks to generate or publish a Square draft:

- If `squareDisclosureAskEveryTime=true` and the user did not explicitly specify `署名开` or `署名关`, ask once:
  - “本次广场文案开头要不要加：本文由OpenClaw发出？”
- If `squareDisclosureAskEveryTime=false`, follow the stored/default preference directly.
- If `squareDisclosureEnabled=true`, prepend:
  - `本文由OpenClaw发出`
- If `squareDisclosureEnabled=false`, do not prepend it.

## Standard workflow

### Step 1: Read request scope
Infer or read:
- `queryType`: `market` or `token` or `help`
- `scope`: `solana | bsc | base | eth | ethereum | auto | global`
- `window`: default `24h`
- `mode`: `tg | report | square`
- `preferences`:
  - `profile`
  - `risk`
  - `top`
  - `lang`
  - `wallet`
  - `preview`
  - `showSpotLeaderboards`
  - `showMemeRadar`
  - `showFuturesSentiment`
  - `squareDisclosureEnabled`
  - `squareDisclosureAskEveryTime`
- token fields if present:
  - `token`
  - `contract`
  - `chain`

### Step 2: Run upstream skill calls
Use the relevant upstream skills in this order:

1. `spot`
2. `alpha`
3. `derivatives-trading-usds-futures`
4. `query-token-info`
5. `trading-signal`
6. `query-token-audit`
7. `meme-rush`
8. `query-address-info`
9. `crypto-market-rank`
10. `margin-trading`
11. `square-post`

Only use `assets` if the user explicitly asks for Binance account assets/balances and authenticated credentials are available.

### Step 3: Build normalized report data

For market mode include:
- `queryType`
- `mode`
- `chainScope`
- `selectedChains`
- `previewOnly`
- `preferences`
- `chain`
- `window`
- `generatedAt`
- `upstreamCalls`
- `fearGreedIndex`
- `marketTheme`
- `spotLeaderboards`
- `alphaLeaderboards`
- `futuresLeaderboards`
- `memeRadar`
- `futuresSentiment`
- `watchlist`
- `riskAlerts`
- `walletAppendix`
- `conclusion`

For token mode include:
- `queryType`
- `tokenQuery`
- `mode`
- `previewOnly`
- `preferences`
- `chain`
- `window`
- `generatedAt`
- `upstreamCalls`
- `watchlist`
- `riskAlerts`
- `conclusion`

For help mode include:
- `queryType`
- `mode`
- `preferences`
- `helpCards`

Use `alpha`, `derivatives-trading-usds-futures`, `meme-rush`, and `crypto-market-rank` only to enrich the normalized fields above.
Do not invent unsupported new output sections unless the local renderer already supports them.

### Step 4: Render report

For Telegram-friendly short preview:

```bash
node {baseDir}/scripts/render-report.js --input <json-path> --style tg

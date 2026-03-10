# 数据字段说明

## 顶层字段

- `chain`: 链名称，例如 `Solana`、`BSC`
- `window`: 时间窗口，例如 `24h`
- `generatedAt`: 生成时间
- `marketTheme`: 今日市场主线对象
- `watchlist`: 值得看名单数组
- `riskAlerts`: 风险警报数组
- `walletAppendix`: 聪明钱附录对象
- `conclusion`: 结论数组

## marketTheme

- `summary`: 主线摘要
- `signals`: 支撑该摘要的要点列表
- `stance`: 最终倾向，例如 `观察确认`

## watchlist item

- `symbol` / `name`
- `verdict`
- `reason`
- `metrics.price`
- `metrics.volume24h`
- `metrics.liquidity`
- `metrics.holders`
- `metrics.top10Pct`
- `metrics.smartMoney`
- `metrics.riskLevel`
- `risk`
- `next`

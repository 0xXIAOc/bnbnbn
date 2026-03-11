'use strict';

const { z } = require('zod');

const ScopeSchema = z
  .enum(['auto', 'global', 'solana', 'bsc', 'base', 'eth', 'ethereum', 'custom'])
  .default('auto');

const ModeSchema = z.enum(['tg', 'report', 'square']).default('tg');

const QueryTypeSchema = z.enum(['market', 'token']).default('market');

const ConfidenceSchema = z.enum(['high', 'medium', 'low']).default('medium');

const ActionSchema = z.enum(['看', '观察', '回避']).default('观察');

const PreferencesSchema = z
  .object({
    profile: z.enum(['cautious', 'balanced', 'aggressive']).default('balanced'),
    risk: z.enum(['low', 'balanced', 'high']).default('balanced'),
    topN: z.number().int().min(1).max(10).default(3),
    lang: z.enum(['zh', 'en']).default('zh'),
    wallet: z.boolean().default(true),
    preview: z.boolean().default(true),
    squareDisclosureEnabled: z.boolean().default(false),
    squareDisclosureAskEveryTime: z.boolean().default(true)
  })
  .default({
    profile: 'balanced',
    risk: 'balanced',
    topN: 3,
    lang: 'zh',
    wallet: true,
    preview: true,
    squareDisclosureEnabled: false,
    squareDisclosureAskEveryTime: true
  });

const TokenQuerySchema = z
  .object({
    symbol: z.string().optional(),
    token: z.string().optional(),
    contractAddress: z.string().optional(),
    chain: z.string().optional()
  })
  .default({});

const UpstreamCallSchema = z.object({
  skill: z.string(),
  status: z.enum(['ok', 'failed', 'skipped', 'partial']).default('ok'),
  message: z.string().optional()
});

const MetricsSchema = z
  .object({
    price: z.union([z.string(), z.number()]).optional(),
    priceChange24h: z.union([z.string(), z.number()]).optional(),
    volume24h: z.union([z.string(), z.number()]).optional(),
    liquidity: z.union([z.string(), z.number()]).optional(),
    holders: z.union([z.string(), z.number()]).optional(),
    top10Pct: z.union([z.string(), z.number()]).optional(),
    smartMoney: z.string().optional(),
    riskLevel: z.string().optional(),
    marketCap: z.union([z.string(), z.number()]).optional(),
    searchCount24h: z.union([z.string(), z.number()]).optional()
  })
  .default({});

const WatchlistItemSchema = z.object({
  symbol: z.string().optional(),
  name: z.string().optional(),
  chain: z.string().optional(),
  contractAddress: z.string().optional(),
  verdict: z.string().optional(),
  action: ActionSchema.optional(),
  score: z.number().min(0).max(100).optional(),
  confidence: ConfidenceSchema.optional(),
  reason: z.string().optional(),
  metrics: MetricsSchema.optional(),
  risk: z.string().optional(),
  next: z.string().optional(),
  sourceFlags: z.array(z.string()).optional(),
  delta: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const RiskAlertSchema = z.object({
  symbol: z.string().optional(),
  name: z.string().optional(),
  chain: z.string().optional(),
  severity: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z.enum(['contract', 'trading', 'signal', 'other']).default('trading'),
  reason: z.string().optional(),
  flags: z.array(z.string()).optional()
});

const LeaderboardItemSchema = z.object({
  symbol: z.string().optional(),
  name: z.string().optional(),
  chain: z.string().optional(),
  metricLabel: z.string().optional(),
  metricValue: z.union([z.string(), z.number()]).optional(),
  note: z.string().optional()
});

const LeaderboardsSchema = z
  .object({
    gainersTop3: z.array(LeaderboardItemSchema).default([]),
    losersTop3: z.array(LeaderboardItemSchema).default([]),
    exchangeHotTop3: z.array(LeaderboardItemSchema).default([]),
    walletHotTop3: z.array(LeaderboardItemSchema).default([])
  })
  .default({
    gainersTop3: [],
    losersTop3: [],
    exchangeHotTop3: [],
    walletHotTop3: []
  });

const ReportDataSchema = z.object({
  title: z.string().optional(),
  queryType: QueryTypeSchema.default('market'),
  tokenQuery: TokenQuerySchema,
  mode: ModeSchema.default('tg'),
  chainScope: ScopeSchema.default('auto'),
  selectedChains: z.array(z.string()).default([]),
  previewOnly: z.boolean().default(true),
  preferences: PreferencesSchema,
  chain: z.string().default('Auto'),
  window: z.string().default('24h'),
  generatedAt: z.string().optional(),
  upstreamCalls: z.array(UpstreamCallSchema).default([]),
  marketTheme: z
    .object({
      summary: z.string().optional(),
      signals: z.array(z.string()).optional(),
      stance: z.string().optional()
    })
    .default({}),
  leaderboards: LeaderboardsSchema,
  watchlist: z.array(WatchlistItemSchema).default([]),
  riskAlerts: z.array(RiskAlertSchema).default([]),
  walletAppendix: z
    .object({
      summary: z.string().optional(),
      notes: z.array(z.string()).optional()
    })
    .default({}),
  conclusion: z.array(z.string()).default([])
});

function validateReportData(input) {
  const result = ReportDataSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid report data: ${issues}`);
  }

  return result.data;
}

module.exports = {
  ScopeSchema,
  ModeSchema,
  QueryTypeSchema,
  ConfidenceSchema,
  ActionSchema,
  PreferencesSchema,
  TokenQuerySchema,
  LeaderboardsSchema,
  ReportDataSchema,
  validateReportData
};

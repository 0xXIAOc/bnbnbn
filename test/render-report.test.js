'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const sample = require('../examples/sample-data.json');
const { validateReportData } = require('../src/schema');
const { renderTg, renderReport, renderSquare } = require('../src/render');
const { parseNaturalCommand, normalizeData } = require('../scripts/render-report');

test('validateReportData accepts the v4 market payload shape', () => {
  const result = validateReportData(sample);
  assert.ok(result.queryType === 'market' || result.queryType === undefined);
});

test('parseNaturalCommand understands Chinese aliases', () => {
  const result = parseNaturalCommand('全网 广场版 前3 谨慎 钱包关');
  assert.equal(result.scope, 'global');
  assert.equal(result.style, 'square');
  assert.equal(result.top, '3');
  assert.equal(result.profile, 'cautious');
  assert.equal(result.wallet, 'false');
});

test('normalizeData can switch to token mode from natural command', () => {
  const result = normalizeData(sample, {
    command: '代币=CAKE 链=bsc 广场版'
  });

  assert.equal(result.queryType, 'token');
  assert.equal(result.mode, 'square');
  assert.equal(result.chainScope, 'bsc');
  assert.equal(result.tokenQuery.symbol, 'CAKE');
});

test('renderTg still works for market mode', () => {
  const output = renderTg(
    validateReportData({
      ...sample,
      queryType: 'market'
    })
  );

  assert.match(output, /Alpha Radar \|/);
  assert.match(output, /Top：/);
});

test('render token square works', () => {
  const tokenData = validateReportData({
    queryType: 'token',
    tokenQuery: {
      symbol: 'CAKE',
      chain: 'BSC'
    },
    mode: 'square',
    chain: 'BSC',
    window: '24h',
    generatedAt: '2026-03-11T07:00:00Z',
    upstreamCalls: [
      { skill: 'query-token-info', status: 'ok' },
      { skill: 'trading-signal', status: 'ok' },
      { skill: 'query-token-audit', status: 'ok' }
    ],
    watchlist: [
      {
        symbol: 'CAKE',
        chain: 'BSC',
        action: '看',
        score: 79,
        confidence: 'high',
        reason: '更符合流动性、成交与结构共振。',
        metrics: {
          price: '3.11',
          volume24h: '18.4M',
          liquidity: '12.7M',
          top10Pct: '41.2%',
          riskLevel: 'LOW'
        },
        risk: '短线弹性不如纯情绪票。',
        next: '继续观察 active buy 是否延续。'
      }
    ],
    riskAlerts: [],
    conclusion: ['代币当前更适合研究型跟踪，而不是情绪化追高。']
  });

  const output = renderSquare(tokenData);
  assert.match(output, /Alpha Radar｜CAKE/);
  assert.match(output, /看点：/);
  assert.match(output, /风险：/);
});

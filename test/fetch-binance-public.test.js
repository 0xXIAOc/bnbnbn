'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ensureTop3,
  buildUpstreamCalls,
  summarizeResultStatus,
  pickSpotLeaderboards,
  stripQuoteAsset
} = require('../scripts/fetch-binance-public');

test('ensureTop3 只返回前三项', () => {
  assert.deepEqual(ensureTop3([1, 2, 3, 4]), [1, 2, 3]);
  assert.deepEqual(ensureTop3(null), []);
});

test('buildUpstreamCalls 能区分 partial 和 failed', () => {
  const partial = buildUpstreamCalls(
    false,
    { gainersTop3: [{ symbol: 'A' }], losersTop3: [] },
    false,
    [{ symbol: 'BTCUSDT', stance: '获取失败: timeout' }, { symbol: 'ETHUSDT', stance: '多头偏强' }]
  );
  assert.equal(partial[0].status, 'partial');
  assert.equal(partial[1].status, 'partial');

  const failed = buildUpstreamCalls(false, { gainersTop3: [], losersTop3: [] }, false, []);
  assert.equal(failed[0].status, 'failed');
  assert.equal(failed[1].status, 'failed');
});

test('summarizeResultStatus 工作正常', () => {
  assert.equal(summarizeResultStatus(true, true), 'ok');
  assert.equal(summarizeResultStatus(false, true), 'partial');
  assert.equal(summarizeResultStatus(false, false), 'failed');
});

test('pickSpotLeaderboards 生成现货涨跌榜', () => {
  const data = [
    { symbol: 'AAAUSDT', priceChangePercent: '10.2', quoteVolume: '2000000' },
    { symbol: 'BBBUSDT', priceChangePercent: '-11.8', quoteVolume: '2100000' },
    { symbol: 'CCCUSDT', priceChangePercent: '3.2', quoteVolume: '2200000' }
  ];
  const result = pickSpotLeaderboards(data, 2, 1000000);
  assert.equal(result.gainersTop3[0].symbol, 'AAA');
  assert.equal(result.losersTop3[0].symbol, 'BBB');
  assert.equal(stripQuoteAsset('BTCUSDT'), 'BTC');
});

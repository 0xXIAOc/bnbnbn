'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const sample = require('../examples/sample-data.json');
const { validateReportData } = require('../src/schema');
const { renderReport, renderSquare } = require('../src/render');

test('validateReportData accepts the sample payload', () => {
  const result = validateReportData(sample);
  assert.equal(result.chain, 'Solana');
  assert.equal(result.watchlist.length, 2);
});

test('renderReport includes the five required sections', () => {
  const output = renderReport(validateReportData(sample));
  assert.match(output, /# 今日多维体检日报/);
  assert.match(output, /## 一、今日市场主线/);
  assert.match(output, /## 二、今日值得看名单/);
  assert.match(output, /## 三、今日风险警报/);
  assert.match(output, /## 四、今日观察钱包 \/ 聪明钱附录/);
  assert.match(output, /## 五、今日结论/);
});

test('renderSquare produces a concise square draft', () => {
  const output = renderSquare(validateReportData(sample));
  assert.match(output, /Watchlist Delta/);
  assert.match(output, /值得看：/);
  assert.match(output, /风险警报：/);
});

test('empty arrays still render fallback text', () => {
  const data = validateReportData({
    chain: 'BSC',
    window: '7d',
    marketTheme: {},
    watchlist: [],
    riskAlerts: [],
    walletAppendix: {},
    conclusion: []
  });

  const output = renderReport(data);
  assert.match(output, /暂无符合条件的标的/);
  assert.match(output, /今日未发现需要单独高亮的风险样本/);
  assert.match(output, /暂无附录数据/);
});

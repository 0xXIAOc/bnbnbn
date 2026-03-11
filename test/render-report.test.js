'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const sample = require('../examples/sample-data.json');
const { validateReportData } = require('../src/schema');
const { renderTg, renderReport, renderSquare } = require('../src/render');

test('validateReportData accepts the v3 sample payload', () => {
  const result = validateReportData(sample);
  assert.equal(result.mode, 'tg');
  assert.equal(result.chainScope, 'auto');
  assert.equal(result.preferences.topN, 3);
  assert.equal(result.watchlist.length, 3);
});

test('renderTg produces a short telegram-friendly output', () => {
  const output = renderTg(validateReportData(sample));
  assert.match(output, /Alpha Radar \| Auto/);
  assert.match(output, /模式：TG 简版预览/);
  assert.match(output, /Top：/);
  assert.match(output, /风险：/);
});

test('renderReport includes the five required sections', () => {
  const output = renderReport(validateReportData(sample));
  assert.match(output, /## 0、上游调用/);
  assert.match(output, /## 一、今日市场主线/);
  assert.match(output, /## 二、今日值得看名单/);
  assert.match(output, /## 三、今日风险警报/);
  assert.match(output, /## 四、今日观察钱包 \/ 聪明钱附录/);
  assert.match(output, /## 五、今日结论/);
});

test('renderSquare produces a directly postable square-style draft', () => {
  const output = renderSquare(validateReportData(sample));
  assert.match(output, /Alpha Radar｜Auto/);
  assert.match(output, /值得看：/);
  assert.match(output, /风险：/);
  assert.match(output, /DYOR/);
});

test('wallet=off hides wallet appendix details in report mode', () => {
  const data = validateReportData({
    ...sample,
    mode: 'report',
    preferences: {
      ...sample.preferences,
      wallet: false
    }
  });

  const output = renderReport(data);
  assert.match(output, /本轮按偏好设置关闭钱包附录/);
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeData, parseNaturalCommand } = require('../scripts/render-report');
const sample = require('../examples/sample-data.json');

test('help mode still parses', () => {
  const result = parseNaturalCommand('Alpha 有哪些功能');
  assert.equal(result.queryType, 'help');
});

test('normalizeData keeps base scope', () => {
  const result = normalizeData(sample, { command: 'base 广场版 前3' });
  assert.equal(result.chainScope, 'base');
  assert.equal(result.mode, 'square');
});

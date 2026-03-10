#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    style: 'report'
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--input') {
      args.input = argv[++i];
    } else if (token === '--style') {
      args.style = argv[++i];
    } else if (token === '--output') {
      args.output = argv[++i];
    } else if (token === '--title') {
      args.title = argv[++i];
    } else if (token === '--chain') {
      args.chain = argv[++i];
    } else if (token === '--window') {
      args.window = argv[++i];
    } else if (token === '--help' || token === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }

  return args;
}

function usage() {
  return [
    'Usage:',
    '  node scripts/render-report.js --input <json-file> --style report',
    '  node scripts/render-report.js --input <json-file> --style square',
    '  cat data.json | node scripts/render-report.js --style report',
    '  node scripts/render-report.js --input <json-file> --style report --output out.md',
    '',
    'Options:',
    '  --input <path>     JSON input file. Omit to read from stdin.',
    '  --style <style>    report | square',
    '  --output <path>    Write output to file.',
    '  --title <title>    Override report title.',
    '  --chain <chain>    Override chain value.',
    '  --window <window>  Override window value.'
  ].join('\n');
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureObject(value) {
  return isPlainObject(value) ? value : {};
}

function stringValue(value, fallback = '数据未提供') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(chunks.join('')));
    process.stdin.on('error', reject);
  });
}

async function readJsonInput(inputPath) {
  let rawText = '';

  if (inputPath && inputPath !== '-') {
    const resolved = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Input file not found: ${resolved}`);
    }
    rawText = fs.readFileSync(resolved, 'utf8');
  } else {
    rawText = await readStdin();
    if (!rawText || !rawText.trim()) {
      throw new Error('No input provided. Use --input <file> or pipe JSON via stdin.');
    }
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error(`Failed to parse JSON input: ${error.message}`);
  }
}

function normalizeData(raw, args = {}) {
  const source = ensureObject(raw);

  return {
    title: args.title || source.title || '',
    chain: args.chain || source.chain || 'Unknown',
    window: args.window || source.window || '',
    generatedAt: source.generatedAt || '',
    marketTheme: ensureObject(source.marketTheme),
    watchlist: ensureArray(source.watchlist),
    riskAlerts: ensureArray(source.riskAlerts),
    walletAppendix: ensureObject(source.walletAppendix),
    conclusion: ensureArray(source.conclusion)
  };
}

function formatMetrics(metricsRaw) {
  const metrics = ensureObject(metricsRaw);

  const pairs = [
    ['价格', metrics.price],
    ['24h成交量', metrics.volume24h],
    ['流动性', metrics.liquidity],
    ['Holders', metrics.holders],
    ['Top10占比', metrics.top10Pct],
    ['Smart Money', metrics.smartMoney],
    ['风险等级', metrics.riskLevel]
  ];

  const parts = pairs
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => `${label}：${value}`);

  return parts.length > 0 ? parts.join('；') : '关键数据未提供';
}

function renderMarketTheme(data) {
  const lines = [];
  lines.push('## 一、今日市场主线');
  lines.push(stringValue(data.marketTheme.summary, '数据不足，暂不下结论。'));

  const signals = ensureArray(data.marketTheme.signals);
  if (signals.length > 0) {
    for (const signal of signals) {
      lines.push(`- ${signal}`);
    }
  }

  if (data.marketTheme.stance) {
    lines.push(`结论倾向：${data.marketTheme.stance}`);
  }

  lines.push('');
  return lines;
}

function renderWatchlist(data) {
  const lines = [];
  lines.push('## 二、今日值得看名单');

  const watchlist = ensureArray(data.watchlist);
  if (watchlist.length === 0) {
    lines.push('暂无符合条件的标的。');
    lines.push('');
    return lines;
  }

  for (const itemRaw of watchlist) {
    const item = ensureObject(itemRaw);
    const symbol = item.symbol || item.name || '未知代币';

    lines.push(`### ${symbol}`);
    lines.push(`结论：${stringValue(item.verdict, '继续观察')}`);
    lines.push(`入选理由：${stringValue(item.reason, '数据不足，暂不下结论。')}`);
    lines.push(`关键数据：${formatMetrics(item.metrics)}`);
    lines.push(`当前风险点：${stringValue(item.risk, '未见单独高亮风险。')}`);
    lines.push(`下一步观察点：${stringValue(item.next, '继续观察资金、热度与风控是否共振。')}`);
    lines.push('');
  }

  return lines;
}

function renderRiskAlerts(data) {
  const lines = [];
  lines.push('## 三、今日风险警报');

  const alerts = ensureArray(data.riskAlerts);
  if (alerts.length === 0) {
    lines.push('今日未发现需要单独高亮的风险样本。');
    lines.push('');
    return lines;
  }

  for (const alertRaw of alerts) {
    const alert = ensureObject(alertRaw);
    lines.push(`- **${stringValue(alert.symbol || alert.name, '未知代币')}**：${stringValue(alert.reason, '存在风险')}`);

    const flags = ensureArray(alert.flags);
    if (flags.length > 0) {
      lines.push(`  风险项：${flags.join('；')}`);
    }
  }

  lines.push('');
  return lines;
}

function renderWalletAppendix(data) {
  const lines = [];
  lines.push('## 四、今日观察钱包 / 聪明钱附录');

  lines.push(stringValue(data.walletAppendix.summary, '暂无附录数据。'));

  const notes = ensureArray(data.walletAppendix.notes);
  if (notes.length > 0) {
    for (const note of notes) {
      lines.push(`- ${note}`);
    }
  }

  lines.push('');
  return lines;
}

function renderConclusion(data) {
  const lines = [];
  lines.push('## 五、今日结论');

  const conclusion = ensureArray(data.conclusion);
  if (conclusion.length === 0) {
    lines.push('- 数据不足，暂不下结论。');
  } else {
    for (const item of conclusion) {
      lines.push(`- ${item}`);
    }
  }

  lines.push('- DYOR。以上仅为研究整理，不构成任何建议。');
  lines.push('');
  return lines;
}

function renderReport(data) {
  const title = data.title || `今日多维体检日报 | ${stringValue(data.chain, 'Unknown')} | ${stringValue(data.window, '')}`;

  const lines = [];
  lines.push(`# ${title}`);

  if (data.generatedAt) {
    lines.push(`生成时间：${data.generatedAt}`);
  }

  lines.push('');
  lines.push(...renderMarketTheme(data));
  lines.push(...renderWatchlist(data));
  lines.push(...renderRiskAlerts(data));
  lines.push(...renderWalletAppendix(data));
  lines.push(...renderConclusion(data));

  return lines.join('\n').trim() + '\n';
}

function renderSquare(data) {
  const lines = [];

  lines.push(`【${stringValue(data.chain, '市场')} Watchlist Delta | ${stringValue(data.window, '')}】`);
  lines.push(stringValue(data.marketTheme.summary, '今日主线暂不明确。'));
  lines.push('');

  lines.push('值得看：');
  const watchlist = ensureArray(data.watchlist);
  if (watchlist.length === 0) {
    lines.push('- 今日暂无明确入选标的');
  } else {
    for (const itemRaw of watchlist.slice(0, 3)) {
      const item = ensureObject(itemRaw);
      const symbol = item.symbol || item.name || '未知代币';
      const liquidity = item.metrics && item.metrics.liquidity ? `流动性 ${item.metrics.liquidity}` : '流动性未提供';
      const top10 = item.metrics && item.metrics.top10Pct ? `Top10 ${item.metrics.top10Pct}` : 'Top10 未提供';
      lines.push(
        `- ${symbol}：${stringValue(item.verdict, '继续观察')}，${stringValue(item.reason, '数据不足，暂不下结论。')}；${liquidity}；${top10}`
      );
    }
  }

  lines.push('');
  lines.push('风险警报：');

  const alerts = ensureArray(data.riskAlerts);
  if (alerts.length === 0) {
    lines.push('- 暂无单独高亮风险样本');
  } else {
    for (const alertRaw of alerts.slice(0, 2)) {
      const alert = ensureObject(alertRaw);
      lines.push(`- ${stringValue(alert.symbol || alert.name, '未知代币')}：${stringValue(alert.reason, '存在风险')}`);
    }
  }

  lines.push('');
  lines.push('结论：今天更值得关注热度、资金与风控同时过线的名字，而不是单看涨幅。');
  lines.push('DYOR。以上仅为数据整理与研究辅助，不构成任何建议。');

  return lines.join('\n').trim() + '\n';
}

function writeOutputIfNeeded(outputPath, content) {
  if (!outputPath) {
    return;
  }

  const resolved = path.resolve(process.cwd(), outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content, 'utf8');
}

async function main() {
  try {
    const args = parseArgs(process.argv);

    if (args.help) {
      process.stdout.write(usage() + '\n');
      process.exit(0);
      return;
    }

    if (!['report', 'square'].includes(args.style)) {
      throw new Error(`Invalid style: ${args.style}. Expected "report" or "square".`);
    }

    const input = await readJsonInput(args.input);
    const data = normalizeData(input, args);
    const output = args.style === 'square' ? renderSquare(data) : renderReport(data);

    writeOutputIfNeeded(args.output, output);
    process.stdout.write(output);
  } catch (error) {
    process.stderr.write(`[alpha-radar-render] ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  normalizeData,
  renderReport,
  renderSquare
};

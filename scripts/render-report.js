#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { validateReportData } = require('../src/schema');
const { renderTg, renderReport, renderSquare } = require('../src/render');

function parseArgs(argv) {
  const args = {
    style: 'tg'
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--input') {
      args.input = argv[++i];
    } else if (token === '--style' || token === '--mode') {
      args.style = argv[++i];
    } else if (token === '--output') {
      args.output = argv[++i];
    } else if (token === '--title') {
      args.title = argv[++i];
    } else if (token === '--scope' || token === '--chain-scope') {
      args.scope = argv[++i];
    } else if (token === '--chain') {
      args.chain = argv[++i];
    } else if (token === '--window') {
      args.window = argv[++i];
    } else if (token === '--preview') {
      args.preview = argv[++i];
    } else if (token === '--profile') {
      args.profile = argv[++i];
    } else if (token === '--risk') {
      args.risk = argv[++i];
    } else if (token === '--top') {
      args.top = argv[++i];
    } else if (token === '--lang') {
      args.lang = argv[++i];
    } else if (token === '--wallet') {
      args.wallet = argv[++i];
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
    '  node scripts/render-report.js --input <json-file> --style tg',
    '  node scripts/render-report.js --input <json-file> --style report',
    '  node scripts/render-report.js --input <json-file> --style square',
    '  cat data.json | node scripts/render-report.js --style tg',
    '',
    'Options:',
    '  --input <path>          JSON input file. Omit to read from stdin.',
    '  --style <style>         tg | report | square',
    '  --output <path>         Write output to file.',
    '  --title <title>         Override report title.',
    '  --scope <scope>         auto | global | solana | bsc | base | eth',
    '  --chain <chain>         Override human-readable chain label.',
    '  --window <window>       Override time window, e.g. 24h.',
    '  --preview <bool>        true | false',
    '  --profile <value>       cautious | balanced | aggressive',
    '  --risk <value>          low | balanced | high',
    '  --top <n>               shortlist size',
    '  --lang <value>          zh | en',
    '  --wallet <bool>         true | false'
  ].join('\n');
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

async function readRawInput(inputPath) {
  if (inputPath && inputPath !== '-') {
    const resolved = path.resolve(process.cwd(), inputPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Input file not found: ${resolved}`);
    }
    return fs.readFileSync(resolved, 'utf8');
  }

  const raw = await readStdin();
  if (!raw.trim()) {
    throw new Error('No input provided. Use --input <file> or pipe JSON via stdin.');
  }
  return raw;
}

function normalizeScope(value) {
  if (!value) return undefined;
  const normalized = String(value).trim().toLowerCase();

  if (normalized === 'sol') return 'solana';
  if (normalized === 'ethereum') return 'ethereum';
  if (normalized === 'eth') return 'eth';

  if (['auto', 'global', 'solana', 'bsc', 'base', 'eth', 'ethereum', 'custom'].includes(normalized)) {
    return normalized;
  }

  return 'custom';
}

function normalizeStyle(value) {
  if (!value) return 'tg';
  const normalized = String(value).trim().toLowerCase();

  if (normalized === 'telegram') return 'tg';
  if (normalized === 'full') return 'report';
  if (['tg', 'report', 'square'].includes(normalized)) return normalized;

  throw new Error(`Invalid style: ${value}. Expected "tg", "report", or "square".`);
}

function normalizeBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
}

function normalizeTop(value, fallback = 3) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(Math.round(parsed), 10));
}

function normalizeData(raw, args = {}) {
  const validated = validateReportData(raw);

  const merged = {
    ...validated,
    mode: normalizeStyle(args.style || validated.mode || 'tg'),
    chainScope:
      normalizeScope(args.scope) ||
      validated.chainScope ||
      (validated.chain && validated.chain !== 'Auto' ? normalizeScope(validated.chain) : 'auto') ||
      'auto',
    title: args.title || validated.title || '',
    chain: args.chain || validated.chain || 'Auto',
    window: args.window || validated.window || '24h',
    previewOnly: normalizeBoolean(args.preview, validated.previewOnly !== false),
    preferences: {
      ...(validated.preferences || {}),
      ...(args.profile ? { profile: String(args.profile).trim().toLowerCase() } : {}),
      ...(args.risk ? { risk: String(args.risk).trim().toLowerCase() } : {}),
      ...(args.lang ? { lang: String(args.lang).trim().toLowerCase() } : {}),
      ...(args.top !== undefined ? { topN: normalizeTop(args.top, validated.preferences?.topN || 3) } : {}),
      ...(args.wallet !== undefined ? { wallet: normalizeBoolean(args.wallet, validated.preferences?.wallet !== false) } : {}),
      ...(args.preview !== undefined ? { preview: normalizeBoolean(args.preview, validated.preferences?.preview !== false) } : {})
    }
  };

  return validateReportData(merged);
}

function writeOutputIfNeeded(outputPath, content) {
  if (!outputPath) return;

  const resolved = path.resolve(process.cwd(), outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content, 'utf8');
}

async function main() {
  try {
    const args = parseArgs(process.argv);

    if (args.help) {
      process.stdout.write(`${usage()}\n`);
      return;
    }

    const rawText = await readRawInput(args.input);
    const rawJson = JSON.parse(rawText);
    const data = normalizeData(rawJson, args);

    let output;
    if (data.mode === 'report') {
      output = renderReport(data);
    } else if (data.mode === 'square') {
      output = renderSquare(data);
    } else {
      output = renderTg(data);
    }

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
  normalizeScope,
  normalizeStyle,
  usage
};

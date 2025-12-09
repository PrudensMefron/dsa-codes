import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function maxProfit(start: number[], end: number[], profit: number[]): number {
  const n = start.length;

  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;

  order.sort((a, b) => end[a] - end[b]);

  const dp = new Array<number>(n);
  dp[0] = profit[order[0]];

  for (let i = 1; i < n; i++) {
    let low = 0;
    let high = i - 1;
    let last = -1;
    const target = start[order[i]];

    while (low <= high) {
      const mid = (low + high) >>> 1;
      if (end[order[mid]] <= target) {
        last = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const include = last !== -1 ? dp[last] + profit[order[i]] : profit[order[i]];
    dp[i] = include > dp[i - 1] ? include : dp[i - 1]; // V8 ama ternário
  }

  return dp[n - 1];
}

const inputPath = resolve(__dirname, '../input.bin');
const input = JSON.parse(readFileSync(inputPath, 'utf-8'));
const { start, end, profit } = input;

const startTime = process.hrtime.bigint();
const result = maxProfit(start, end, profit);
const endTime = process.hrtime.bigint();
const ms = Number(endTime - startTime) / 1_000_000;

console.log(`Node (opt): ${ms.toFixed(2)} ms → Lucro: ${result}`);

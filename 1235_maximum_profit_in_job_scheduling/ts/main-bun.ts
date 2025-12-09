import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function maxProfit(start: Int32Array, end: Int32Array, profit: Int32Array): number {
  const n = start.length;

  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;

  order.sort(sortByEnd);
  function sortByEnd(a: number, b: number) {
    return end[a] - end[b];
  }

  const dp = new Float64Array(n);
  dp[0] = profit[order[0]];

  let i = 1;
  while (i < n) {
    let low = 0;
    let high = i - 1;
    let last = -1;
    const target = start[order[i]];

    while (low <= high) {
      const mid = low + ((high - low) >> 1);
      if (end[order[mid]] <= target) {
        last = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const include = last !== -1 ? dp[last] + profit[order[i]] : profit[order[i]];
    dp[i] = include > dp[i - 1] ? include : dp[i - 1];
    i++;
  }

  return dp[n - 1];
}

const inputPath = resolve(__dirname, '../input.bin');
const raw = readFileSync(inputPath, 'utf-8');
const { start, end, profit } = JSON.parse(raw);

const startArr = Int32Array.from(start);
const endArr = Int32Array.from(end);
const profitArr = Int32Array.from(profit);

const startTime = process.hrtime.bigint('big');
const result = maxProfit(startArr, endArr, profitArr);
const endTime = process.hrtime.bigint();
const ms = Number(endTime - startTime) / 1_000_000;

console.log(`Bun (opt): ${ms.toFixed(2)} ms → Lucro: ${result}`);

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// === SIMULA __dirname EM ESM ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Job {
  start: number;
  end: number;
  profit: number;
}

export function maxProfit(startTime: number[], endTime: number[], profit: number[]): number {
  const n = startTime.length;
  const jobs: Job[] = [];

  // 1. Criar jobs
  for (let i = 0; i < n; i++) {
    jobs.push({ start: startTime[i], end: endTime[i], profit: profit[i] });
  }

  // 2. Ordenar por endTime
  jobs.sort((a, b) => a.end - b.end);

  // 3. DP array
  const dp = new Array(n).fill(0);

  // 4. Busca binária para último job compatível
  function findLastNonConflict(idx: number): number {
    let low = 0;
    let high = idx - 1;
    let result = -1;

    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2);
      if (jobs[mid].end <= jobs[idx].start) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result;
  }

  // 5. Preencher DP
  dp[0] = jobs[0].profit;
  for (let i = 1; i < n; i++) {
    const last = findLastNonConflict(i);
    const include = (last !== -1 ? dp[last] : 0) + jobs[i].profit;
    const exclude = dp[i - 1];
    dp[i] = Math.max(include, exclude);
  }

  return dp[n - 1];
}

// ==================== BENCHMARK ====================

function benchmark(name: string, fn: () => number) {
  const start = process.hrtime.bigint();
  const result = fn();
  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1_000_000;
  console.log(`${name}: ${ms.toFixed(2)} ms → Lucro: ${result}`);
}

// === LER input.bin DO DIRETÓRIO ACIMA ===
const inputPath = resolve(__dirname, '../input.bin');
let input;
try {
  input = JSON.parse(readFileSync(inputPath, 'utf-8'));
} catch (err) {
  console.error('ERRO: input.bin não encontrado em ../input.bin');
  console.error('Caminho tentado:', inputPath);
  process.exit(1);
}

const { start: startTime, end: endTime, profit } = input;

console.log(`\nIniciando benchmark com ${startTime.length} jobs...\n`);

benchmark("TypeScript", () => maxProfit(startTime, endTime, profit));

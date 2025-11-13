#!/bin/bash

echo "INICIANDO BENCHMARK JOB SCHEDULING (N = 1_000_000)"
echo "====================================================" > results.txt

N=1000000
echo "Gerando entrada fixa (seed 42)..."

node -e "
  const fs = require('fs');
  const path = require('path');
  const N = $N;
  const start = [], end = [], profit = [];
  let seed = 42;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) {
    const s = Math.floor(rand() * 1000000);
    const d = Math.floor(rand() * 100) + 1;
    start.push(s);
    end.push(s + d);
    profit.push(Math.floor(rand() * 1000) + 1);
  }
  const filePath = path.resolve(__dirname || '.', 'input.bin');
  fs.writeFileSync(filePath, Buffer.from(JSON.stringify({start, end, profit})));
  console.log('Entrada gerada: ' + filePath);
"

declare -A times
declare -A profits

run_lang() {
  local lang=$1
  local dir=$2
  local cmd=$3
  echo -n "Rodando $lang... "
  
  local output=$(cd "$dir" && eval "$cmd" 2>&1)
  local time_line=$(echo "$output" | grep -oE '[0-9]*\.?[0-9]+ ms' | head -1)
  local profit_line=$(echo "$output" | grep -oE 'Lucro: [0-9]+' | grep -oE '[0-9]+')

  local time_ms=$(echo "$time_line" | sed 's/ ms//')
  local profit=${profit_line:-0}

  if [[ -z "$time_ms" || "$time_ms" == "0" ]]; then
    time_ms="ERROR"
    echo "FALHOU"
  else
    times[$lang]=$(printf "%.0f" "$time_ms")
    profits[$lang]=$profit
    echo "$time_ms ms"
  fi

  echo "$lang: $time_ms ms → Lucro: $profit" >> results.txt
}

# EXECUTA
run_lang "TypeScript"     "ts"   "node --max-old-space-size=8192 main.ts"
run_lang "TypeScript Opt" "ts"   "node --max-old-space-size=8192 main-optimized.ts"
run_lang "Go"             "go"   "./main"
run_lang "C"              "c"    "./main"
run_lang "Rust"           "rust" "./main"

# GRÁFICO
echo
echo "===================================================="
echo "               GRÁFICO DE PERFORMANCE"
echo "===================================================="

max_time=0
for t in "${times[@]}"; do
  if [[ "$t" != "ERROR" ]] && [ "$t" -gt "$max_time" ]; then
    max_time=$t
  fi
done

BAR_WIDTH=50

print_bar() {
  local lang=$1
  local time=$2
  local profit=$3

  if [[ "$time" == "ERROR" ]]; then
    printf "%-16s | %s\n" "$lang" "ERROR"
    return
  fi

  local bar_length=$(awk "BEGIN {printf \"%d\", ($time * $BAR_WIDTH) / $max_time + 0.5}")
  (( bar_length < 1 && time > 0 )) && bar_length=1

  local bar=""
  for ((i=0; i<bar_length; i++)); do bar+="█"; done
  for ((i=bar_length; i<BAR_WIDTH; i++)); do bar+=" "; done

  local color=""
  [[ $lang == "Rust" ]] && color="\033[0;32m"
  [[ $lang == "C" ]] && color="\033[0;34m"
  [[ $lang == "TypeScript Opt" ]] && color="\033[1;35m"
  [[ $lang == "TypeScript" ]] && color="\033[0;31m"
  [[ $lang == "Go" ]] && color="\033[1;33m"
  local NC="\033[0m"

  printf "${color}%-16s |%s %6d ms${NC} (Lucro: %d)\n" "$lang" "$bar" "$time" "$profit"
}

for lang in "TypeScript" "TypeScript Opt" "Go" "C" "Rust"; do
  print_bar "$lang" "${times[$lang]}" "${profits[$lang]}"
done

# CAMPEÃO
fastest=""
fastest_time=999999
for lang in "${!times[@]}"; do
  if [[ "${times[$lang]}" != "ERROR" ]] && [ "${times[$lang]}" -lt "$fastest_time" ]; then
    fastest_time=${times[$lang]}
    fastest=$lang
  fi
done

echo
echo -e "\033[1;32mCAMPEÃO: $fastest com $fastest_time ms\033[0m"
echo "====================================================" | tee -a results.txt
echo "Resultados salvos em results.txt"

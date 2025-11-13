use rand::Rng;
use std::time::Instant; // ESSENCIAL!

#[derive(Clone, Copy)]
struct Job {
    start: i32,
    end: i32,
    profit: i32,
}

fn max_profit(start: &[i32], end: &[i32], profit: &[i32]) -> i32 {
    let n = start.len();
    let mut jobs: Vec<Job> = (0..n)
        .map(|i| Job {
            start: start[i],
            end: end[i],
            profit: profit[i],
        })
        .collect();

    // Ordenar por end
    jobs.sort_by_key(|j| j.end);

    let mut dp = vec![0; n];
    dp[0] = jobs[0].profit;

    for i in 1..n {
        let mut low = 0;
        let mut high = i as i32 - 1;
        let mut last = -1;
        let target = jobs[i].start;

        while low <= high {
            let mid = low + (high - low) / 2;
            if jobs[mid as usize].end <= target {
                last = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        let include = jobs[i].profit + if last != -1 { dp[last as usize] } else { 0 };
        dp[i] = include.max(dp[i - 1]);
    }

    dp[n - 1]
}

fn main() {
    const N: usize = 1_000_000;

    let mut start = vec![0; N];
    let mut end = vec![0; N];
    let mut profit = vec![0; N];

    // CORRETO: rng() ao invés de thread_rng()
    let mut rng = rand::thread_rng();

    for i in 0..N {
        let s: i32 = rng.gen_range(0..1_000_000);
        let d: i32 = rng.gen_range(1..101);
        start[i] = s;
        end[i] = s + d;
        profit[i] = rng.gen_range(1..1001);
    }

    let now = Instant::now();
    let result = max_profit(&start, &end, &profit);
    let elapsed = now.elapsed();

    println!(
        "Rust: {:.2} ms → Lucro: {}",
        elapsed.as_secs_f64() * 1000.0,
        result
    );
}

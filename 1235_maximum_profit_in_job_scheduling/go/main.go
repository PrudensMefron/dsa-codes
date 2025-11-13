package main

import (
	"fmt"
	"math/rand"
	"sort"
	"time"
)

type Job struct {
	start, end, profit int
}

func maxProfit(start, end, profit []int) int {
	n := len(start)
	jobs := make([]Job, n)
	for i := 0; i < n; i++ {
		jobs[i] = Job{start[i], end[i], profit[i]}
	}

	sort.Slice(jobs, func(i, j int) bool {
		return jobs[i].end < jobs[j].end
	})

	dp := make([]int, n)
	dp[0] = jobs[0].profit

	for i := 1; i < n; i++ {
		left, right := 0, i-1
		include := jobs[i].profit
		for left <= right {
			mid := left + (right-left)>>1
			if jobs[mid].end <= jobs[i].start {
				include = max(include, dp[mid]+jobs[i].profit)
				left = mid + 1
			} else {
			right = mid - 1
			}
		}
		dp[i] = max(include, dp[i-1])
	}
	return dp[n-1]
}

func main() {
	const N = 1_000_000
	start := make([]int, N)
	end := make([]int, N)
	profit := make([]int, N)

	for i := 0; i < N; i++ {
		s := rand.Intn(1_000_000)
		d := rand.Intn(100) + 1
		start[i] = s
		end[i] = s + d
		profit[i] = rand.Intn(1000) + 1
	}

	startTime := time.Now()
	result := maxProfit(start, end, profit)
	elapsed := time.Since(startTime)

	fmt.Printf("Go: %.2f ms → Lucro: %d\n", float64(elapsed.Microseconds())/1000, result)
}

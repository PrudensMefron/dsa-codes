#include <stdio.h>
#include <stdlib.h>
#include <time.h>

typedef struct {
    int start, end, profit;
    int idx;
} Job;

int cmp(const void* a, const void* b) {
    return ((Job*)a)->end - ((Job*)b)->end;
}

int max(int a, int b) { return a > b ? a : b; }

int maxProfit(int* start, int* end, int* profit, int n) {
    Job* jobs = malloc(n * sizeof(Job));
    for (int i = 0; i < n; i++) {
        jobs[i] = (Job){start[i], end[i], profit[i], i};
    }

    qsort(jobs, n, sizeof(Job), cmp);

    int* dp = malloc(n * sizeof(int));
    dp[0] = jobs[0].profit;

    for (int i = 1; i < n; i++) {
        int low = 0, high = i - 1, last = -1;
        int target = jobs[i].start;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (jobs[mid].end <= target) {
                last = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        int include = jobs[i].profit + (last != -1 ? dp[last] : 0);
        dp[i] = max(include, dp[i - 1]);
    }

    int result = dp[n - 1];
    free(jobs);
    free(dp);
    return result;
}

int main() {
    const int N = 1000000;
    int* start = malloc(N * sizeof(int));
    int* end = malloc(N * sizeof(int));
    int* profit = malloc(N * sizeof(int));

    srand(42); // seed fixo
    for (int i = 0; i < N; i++) {
        int s = rand() % 1000000;
        int d = rand() % 100 + 1;
        start[i] = s;
        end[i] = s + d;
        profit[i] = rand() % 1000 + 1;
    }

    clock_t t = clock();
    int result = maxProfit(start, end, profit, N);
    double ms = (double)(clock() - t) * 1000 / CLOCKS_PER_SEC;

    printf("C: %.2f ms → Lucro: %d\n", ms, result);

    free(start); free(end); free(profit);
    return 0;
}

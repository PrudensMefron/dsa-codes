const nums: number[] = [1, 3, 5, 6];
const target: number = 5;

function searchInsert(nums: number[], target: number): number {
  let start: number = 0;
  let end: number = nums.length -1;
  
  while (start <= end) {
    const mid = start + ((end - start) >> 1);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      start = mid +1;
    } else {
      end = mid -1;
    }
  }
  return start;
}

console.log(searchInsert(nums, target));

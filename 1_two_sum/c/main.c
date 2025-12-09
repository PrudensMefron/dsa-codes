#include <stdio.h>
#include <stdlib.h>

#define DEFAULT_CAPACITY 16

typedef struct Node {
  int key;
  int value;
  struct Node* next;
} Node;

typedef struct {
  Node** buckets;
  int size;
} HashMap;

HashMap* hm_create() {
  HashMap* hm = malloc(sizeof(HashMap));
  hm->size = DEFAULT_CAPACITY;
  hm->buckets = calloc(hm->size, sizeof(Node*));
  return hm;
}

int hm_hash(HashMap* hm, int key) {
  return (key % hm->size + hm->size) % hm->size;
}

void hm_put(HashMap* hm, int key, int value) {
  int index = hm_hash(hm, key);
  Node* node = hm->buckets[index];

  while (node) {
    if (node->key == key) {
      node->value = value;
      return;
    }
    node = node->next;
  }

  Node* newNode = malloc(sizeof(Node));
  newNode->key = key;
  newNode->value = value;
  newNode->next = hm->buckets[index];
  hm->buckets[index] = newNode;
}

int hm_get(HashMap* hm, int key, int* out_value) {
  int index = hm_hash(hm ,key);
  Node* node = hm->buckets[index];
  while (node) {
    if (node->key == key) {
      *out_value = node->value;
      return 1;
    }
    node = node->next;
  }
  return 0;
}

void hm_free(HashMap* hm) {
  for (int i = 0; i < hm->size; i++) {
    Node* node = hm->buckets[i];
    while (node) {
      Node* temp = node;
      node = node->next;
      free(temp);
    }
  }
  free(hm->buckets);
  free(hm);
}

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
  HashMap* hm = hm_create();
  int* result = malloc(2 * sizeof(int));
  *returnSize = 2;

  for (int i = 0; i < numsSize; i++) {
    int complement = target - nums[i];
    int index;
    if (hm_get(hm, complement, &index)) {
      result[0] = index;
      result[1] = i;
      hm_free(hm);
      return result;
    }
    hm_put(hm, nums[i], i);
  }

  hm_free(hm);
  *returnSize = 0;
  return NULL;
}

int main() {
  int nums[] = {2, 7, 11, 15};
  int target = 9;
  int returnSize;
  int* result = twoSum(nums, 4, target, &returnSize);
  printf("[%d, %d]\n", result[0], result[1]);
  free(result);
  return 0;
}

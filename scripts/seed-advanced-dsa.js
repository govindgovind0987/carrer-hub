import { prisma } from '../lib/prisma.js';

const DSA_TOPIC_PROBLEMS = [
  {
    slug: 'sliding-window-maximum-deque',
    title: 'Sliding Window Maximum (Monotonic Queue)',
    difficulty: 'HARD',
    category: 'DSA',
    tags: ['Sliding Window', 'Monotonic Queue', 'Deque', 'Heap'],
    companyTags: ['FAANG', 'Tier-1 Tech'],
    inputFormat: 'First line contains integer N and K. Second line contains N space-separated integers.',
    outputFormat: 'Print space-separated maximums for each sliding window of size K.',
    complexityAnalysis: 'Time Complexity: O(N) using Monotonic Deque. Space Complexity: O(K).',
    description: `You are given an array of integers \`nums\`, there is a sliding window of size \`k\` which is moving from the very left of the array to the very right. You can only see the \`k\` numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window.`,
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', '1 <= k <= nums.length'],
    examples: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7', explanation: 'Window positions and max elements.' }
    ],
    hints: ['Use a Deque (Double Ended Queue) to store indices of useful elements in decreasing order.'],
    editorial: `### Monotonic Deque Approach (O(N) Time)`,
    starterCode: {
      python: `def solve():
    import sys
    from collections import deque
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    k = int(tokens[1])
    nums = [int(x) for x in tokens[2:n+2]]
    
    dq = deque()
    res = []
    for i in range(n):
        if dq and dq[0] == i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= nums[i]:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            res.append(str(nums[dq[0]]))
    print(" ".join(res))
solve()`,
      javascript: `const fs = require('fs');
function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0], k = tokens[1];
  const nums = tokens.slice(2, n + 2);
  const dq = [];
  const res = [];
  for (let i = 0; i < n; i++) {
    if (dq.length && dq[0] === i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) res.push(nums[dq[0]]);
  }
  console.log(res.join(' '));
}
solve();`,
      typescript: `const fs = require('fs');
function solve(): void {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0], k = tokens[1];
  const nums = tokens.slice(2, n + 2);
  const dq: number[] = [];
  const res: number[] = [];
  for (let i = 0; i < n; i++) {
    if (dq.length && dq[0] === i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) res.push(nums[dq[0]]);
  }
  console.log(res.join(' '));
}
solve();`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();

        Deque<Integer> dq = new ArrayDeque<>();
        List<String> res = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peekFirst() == i - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.offerLast(i);
            if (i >= k - 1) res.add(String.valueOf(nums[dq.peekFirst()]));
        }
        System.out.println(String.join(" ", res));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <deque>
#include <string>
using namespace std;
int main() {
    int n, k; if (!(cin >> n >> k)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    deque<int> dq;
    vector<int> res;
    for (int i = 0; i < n; i++) {
        if (!dq.empty() && dq.front() == i - k) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    for (size_t i = 0; i < res.size(); i++) {
        cout << res[i] << (i == res.size() - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
      nodejs: `const fs = require('fs');
function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0], k = tokens[1];
  const nums = tokens.slice(2, n + 2);
  const dq = [];
  const res = [];
  for (let i = 0; i < n; i++) {
    if (dq.length && dq[0] === i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) res.push(nums[dq[0]]);
  }
  console.log(res.join(' '));
}
solve();`,
    },
    testCases: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', expectedOutput: '3 3 5 5 6 7', isHidden: false },
    ],
  },
  {
    slug: 'fenwick-tree-range-sum',
    title: 'Range Sum Query (Fenwick Tree / BIT)',
    difficulty: 'MEDIUM',
    category: 'DSA',
    tags: ['Fenwick Tree', 'Binary Indexed Tree', 'Segment Tree', 'Prefix Sum'],
    companyTags: ['FinTech', 'Tier-1 Tech'],
    inputFormat: 'First line N Q. Second line N integers. Next Q lines query operations.',
    outputFormat: 'Print result for each SUM query.',
    complexityAnalysis: 'Time Complexity: O(Q log N). Space Complexity: O(N).',
    description: `Given an array of \`n\` elements, construct a Binary Indexed Tree (Fenwick Tree) to support point updates and range sum queries efficiently.`,
    constraints: ['1 <= N, Q <= 10^5'],
    examples: [
      { input: '5 3\n1 3 5 7 9\nSUM 1 3\nUPDATE 2 6\nSUM 1 3', output: '9 12', explanation: 'Range sum update and queries.' }
    ],
    hints: ['Fenwick tree uses lower bit (i & -i) for prefix sums.'],
    editorial: `### Fenwick Tree Implementation`,
    starterCode: {
      python: `def solve():
    import sys
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    q = int(tokens[1])
    arr = [0] + [int(x) for x in tokens[2:n+2]]
    
    bit = [0] * (n + 1)
    def update(idx, val):
        while idx <= n:
            bit[idx] += val
            idx += idx & (-idx)
            
    def query(idx):
        s = 0
        while idx > 0:
            s += bit[idx]
            idx -= idx & (-idx)
        return s

    for i in range(1, n + 1):
        update(i, arr[i])
        
    idx = n + 2
    res = []
    for _ in range(q):
        op = tokens[idx]
        if op == 'SUM':
            l, r = int(tokens[idx+1]), int(tokens[idx+2])
            res.append(str(query(r) - query(l-1)))
            idx += 3
        elif op == 'UPDATE':
            i, val = int(tokens[idx+1]), int(tokens[idx+2])
            diff = val - arr[i]
            arr[i] = val
            update(i, diff)
            idx += 3
    print(" ".join(res))
solve()`,
      javascript: `const fs = require('fs');
function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (tokens.length < 3) return;
  const n = parseInt(tokens[0]), q = parseInt(tokens[1]);
  const arr = [0];
  for (let i = 0; i < n; i++) arr.push(parseInt(tokens[2 + i]));

  const bit = new Array(n + 1).fill(0);
  function update(idx, val) {
    while (idx <= n) {
      bit[idx] += val;
      idx += idx & (-idx);
    }
  }
  function query(idx) {
    let s = 0;
    while (idx > 0) {
      s += bit[idx];
      idx -= idx & (-idx);
    }
    return s;
  }

  for (let i = 1; i <= n; i++) update(i, arr[i]);

  let idx = 2 + n;
  const res = [];
  for (let k = 0; k < q; k++) {
    const op = tokens[idx];
    if (op === 'SUM') {
      const l = parseInt(tokens[idx + 1]), r = parseInt(tokens[idx + 2]);
      res.push(query(r) - query(l - 1));
      idx += 3;
    } else if (op === 'UPDATE') {
      const i = parseInt(tokens[idx + 1]), val = parseInt(tokens[idx + 2]);
      const diff = val - arr[i];
      arr[i] = val;
      update(i, diff);
      idx += 3;
    }
  }
  console.log(res.join(' '));
}
solve();`,
      typescript: `const fs = require('fs');
function solve(): void {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (tokens.length < 3) return;
  const n = parseInt(tokens[0]), q = parseInt(tokens[1]);
  const arr = [0];
  for (let i = 0; i < n; i++) arr.push(parseInt(tokens[2 + i]));

  const bit = new Array(n + 1).fill(0);
  function update(idx: number, val: number) {
    while (idx <= n) {
      bit[idx] += val;
      idx += idx & (-idx);
    }
  }
  function query(idx: number): number {
    let s = 0;
    while (idx > 0) {
      s += bit[idx];
      idx -= idx & (-idx);
    }
    return s;
  }

  for (let i = 1; i <= n; i++) update(i, arr[i]);

  let idx = 2 + n;
  const res: number[] = [];
  for (let k = 0; k < q; k++) {
    const op = tokens[idx];
    if (op === 'SUM') {
      const l = parseInt(tokens[idx + 1]), r = parseInt(tokens[idx + 2]);
      res.push(query(r) - query(l - 1));
      idx += 3;
    } else if (op === 'UPDATE') {
      const i = parseInt(tokens[idx + 1]), val = parseInt(tokens[idx + 2]);
      const diff = val - arr[i];
      arr[i] = val;
      update(i, diff);
      idx += 3;
    }
  }
  console.log(res.join(' '));
}
solve();`,
      java: `import java.util.*;
public class Solution {
    static int n;
    static int[] bit;
    static void update(int idx, int val) {
        while (idx <= n) {
            bit[idx] += val;
            idx += idx & (-idx);
        }
    }
    static int query(int idx) {
        int s = 0;
        while (idx > 0) {
            s += bit[idx];
            idx -= idx & (-idx);
        }
        return s;
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        n = sc.nextInt();
        int q = sc.nextInt();
        int[] arr = new int[n + 1];
        bit = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            arr[i] = sc.nextInt();
            update(i, arr[i]);
        }
        List<String> res = new ArrayList<>();
        for (int k = 0; k < q; k++) {
            String op = sc.next();
            if (op.equals("SUM")) {
                int l = sc.nextInt(), r = sc.nextInt();
                res.add(String.valueOf(query(r) - query(l - 1)));
            } else if (op.equals("UPDATE")) {
                int i = sc.nextInt(), val = sc.nextInt();
                int diff = val - arr[i];
                arr[i] = val;
                update(i, diff);
            }
        }
        System.out.println(String.join(" ", res));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;
int n;
vector<int> bit;
void update(int idx, int val) {
    while (idx <= n) {
        bit[idx] += val;
        idx += idx & (-idx);
    }
}
int query(int idx) {
    int s = 0;
    while (idx > 0) {
        s += bit[idx];
        idx -= idx & (-idx);
    }
    return s;
}
int main() {
    int q; if (!(cin >> n >> q)) return 0;
    vector<int> arr(n + 1);
    bit.assign(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        cin >> arr[i];
        update(i, arr[i]);
    }
    vector<int> res;
    while (q--) {
        string op; cin >> op;
        if (op == "SUM") {
            int l, r; cin >> l >> r;
            res.push_back(query(r) - query(l - 1));
        } else if (op == "UPDATE") {
            int i, val; cin >> i >> val;
            int diff = val - arr[i];
            arr[i] = val;
            update(i, diff);
        }
    }
    for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");
    cout << endl;
    return 0;
}`,
      nodejs: `const fs = require('fs');
function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (tokens.length < 3) return;
  const n = parseInt(tokens[0]), q = parseInt(tokens[1]);
  const arr = [0];
  for (let i = 0; i < n; i++) arr.push(parseInt(tokens[2 + i]));

  const bit = new Array(n + 1).fill(0);
  function update(idx, val) {
    while (idx <= n) {
      bit[idx] += val;
      idx += idx & (-idx);
    }
  }
  function query(idx) {
    let s = 0;
    while (idx > 0) {
      s += bit[idx];
      idx -= idx & (-idx);
    }
    return s;
  }

  for (let i = 1; i <= n; i++) update(i, arr[i]);

  let idx = 2 + n;
  const res = [];
  for (let k = 0; k < q; k++) {
    const op = tokens[idx];
    if (op === 'SUM') {
      const l = parseInt(tokens[idx + 1]), r = parseInt(tokens[idx + 2]);
      res.push(query(r) - query(l - 1));
      idx += 3;
    } else if (op === 'UPDATE') {
      const i = parseInt(tokens[idx + 1]), val = parseInt(tokens[idx + 2]);
      const diff = val - arr[i];
      arr[i] = val;
      update(i, diff);
      idx += 3;
    }
  }
  console.log(res.join(' '));
}
solve();`,
    },
    testCases: [
      { input: '5 3\n1 3 5 7 9\nSUM 1 3\nUPDATE 2 6\nSUM 1 3', expectedOutput: '9 12', isHidden: false },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding Advanced DSA Problems...');
  for (const pData of DSA_TOPIC_PROBLEMS) {
    const { testCases, ...probFields } = pData;
    const existing = await prisma.problem.findUnique({ where: { slug: probFields.slug } });
    let problem;
    if (existing) {
      problem = await prisma.problem.update({ where: { slug: probFields.slug }, data: probFields });
    } else {
      problem = await prisma.problem.create({ data: probFields });
    }
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
    for (const tc of testCases) {
      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden || false,
        },
      });
    }
  }
  console.log('✅ Advanced DSA topics seeded successfully!');
}

main().finally(async () => await prisma.$disconnect());

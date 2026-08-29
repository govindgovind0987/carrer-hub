import { prisma } from '../lib/prisma.js';

const SEED_MORE_PROBLEMS = [
  {
    slug: 'valid-parentheses-stack',
    title: 'Valid Parentheses String Matching',
    difficulty: 'EASY',
    category: 'DSA',
    tags: ['Stacks', 'Strings'],
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` or \`false\`.`,
    constraints: ['1 <= s.length <= 10^4', 's consists of brackets only.'],
    examples: [
      { input: '()[]{}', output: 'true', explanation: 'All brackets closed in order.' },
      { input: '(]', output: 'false', explanation: 'Bracket type mismatch.' },
    ],
    hints: ['Use a stack data structure. Push open brackets, pop and check matching on closing brackets.'],
    editorial: `### Stack Algorithm (O(N) Time, O(N) Space)`,
    starterCode: {
      python: `def solve():
    import sys
    s = sys.stdin.read().strip()
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in pairs:
            if not stack or stack.pop() != pairs[char]:
                print("false")
                return
        else:
            stack.append(char)
    print("true" if not stack else "false")
solve()`,
      javascript: `const fs = require('fs');
function solve() {
  const s = fs.readFileSync(0, 'utf-8').trim();
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let c of s) {
    if (map[c]) {
      if (stack.pop() !== map[c]) {
        console.log('false');
        return;
      }
    } else {
      stack.push(c);
    }
  }
  console.log(stack.length === 0 ? 'true' : 'false');
}
solve();`,
      typescript: `const fs = require('fs');
function solve(): void {
  const s = fs.readFileSync(0, 'utf-8').trim();
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (let c of s) {
    if (map[c]) {
      if (stack.pop() !== map[c]) {
        console.log('false');
        return;
      }
    } else {
      stack.push(c);
    }
  }
  console.log(stack.length === 0 ? 'true' : 'false');
}
solve();`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Stack<Character> st = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == ')') { if (st.isEmpty() || st.pop() != '(') { System.out.println("false"); return; } }
            else if (c == '}') { if (st.isEmpty() || st.pop() != '{') { System.out.println("false"); return; } }
            else if (c == ']') { if (st.isEmpty() || st.pop() != '[') { System.out.println("false"); return; } }
            else st.push(c);
        }
        System.out.println(st.isEmpty() ? "true" : "false");
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;
int main() {
    string s; if (!(cin >> s)) return 0;
    stack<char> st;
    for (char c : s) {
        if (c == ')') { if (st.empty() || st.top() != '(') { cout << "false" << endl; return 0; } st.pop(); }
        else if (c == '}') { if (st.empty() || st.top() != '{') { cout << "false" << endl; return 0; } st.pop(); }
        else if (c == ']') { if (st.empty() || st.top() != '[') { cout << "false" << endl; return 0; } st.pop(); }
        else st.push(c);
    }
    cout << (st.empty() ? "true" : "false") << endl;
    return 0;
}`,
      nodejs: `const fs = require('fs');
function solve() {
  const s = fs.readFileSync(0, 'utf-8').trim();
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let c of s) {
    if (map[c]) {
      if (stack.pop() !== map[c]) {
        console.log('false');
        return;
      }
    } else {
      stack.push(c);
    }
  }
  console.log(stack.length === 0 ? 'true' : 'false');
}
solve();`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['python', 'java', 'cpp', 'javascript', 'typescript', 'nodejs'],
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '(]', expectedOutput: 'false', isHidden: false },
      { input: '{[]}', expectedOutput: 'true', isHidden: true },
    ],
  },
  {
    slug: 'binary-search-rotated-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'MEDIUM',
    category: 'DSA',
    tags: ['Binary Search', 'Arrays', 'Searching'],
    description: `Given a rotated sorted array \`nums\` and a target integer \`target\`, return the 0-indexed position of \`target\` if present, or \`-1\` if not present.`,
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4'],
    examples: [{ input: '7\n4 5 6 7 0 1 2\n0', output: '4', explanation: '0 is at index 4.' }],
    hints: ['Determine which half (left or right) is sorted at each binary search step.'],
    editorial: `### Modified Binary Search (O(log N) Time)`,
    starterCode: {
      python: `def solve():
    import sys
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    target = int(tokens[n+1])

    l, r = 0, n - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            print(mid)
            return
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]:
                r = mid - 1
            else:
                l = mid + 1
        else:
            if nums[mid] < target <= nums[r]:
                l = mid + 1
            else:
                r = mid - 1
    print(-1)
solve()`,
      javascript: `const fs = require('fs');
function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);
  const target = tokens[n + 1];

  let l = 0, r = n - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (nums[mid] === target) { console.log(mid); return; }
    if (nums[l] <= nums[mid]) {
      if (nums[l] <= target && target < nums[mid]) r = mid - 1;
      else l = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[r]) l = mid + 1;
      else r = mid - 1;
    }
  }
  console.log(-1);
}
solve();`,
      typescript: `const fs = require('fs');
function solve(): void {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);
  const target = tokens[n + 1];

  let l = 0, r = n - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (nums[mid] === target) { console.log(mid); return; }
    if (nums[l] <= nums[mid]) {
      if (nums[l] <= target && target < nums[mid]) r = mid - 1;
      else l = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[r]) l = mid + 1;
      else r = mid - 1;
    }
  }
  console.log(-1);
}
solve();`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();

        int l = 0, r = n - 1;
        while (l <= r) {
            int mid = (l + r) / 2;
            if (nums[mid] == target) { System.out.println(mid); return; }
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        System.out.println(-1);
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    int l = 0, r = n - 1;
    while (l <= r) {
        int mid = (l + r) / 2;
        if (nums[mid] == target) { cout << mid << endl; return 0; }
        if (nums[l] <= nums[mid]) {
            if (nums[l] <= target && target < nums[mid]) r = mid - 1;
            else l = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[r]) l = mid + 1;
            else r = mid - 1;
        }
    }
    cout << -1 << endl;
    return 0;
}`,
      nodejs: `const fs = require('fs');
function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);
  const target = tokens[n + 1];

  let l = 0, r = n - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (nums[mid] === target) { console.log(mid); return; }
    if (nums[l] <= nums[mid]) {
      if (nums[l] <= target && target < nums[mid]) r = mid - 1;
      else l = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[r]) l = mid + 1;
      else r = mid - 1;
    }
  }
  console.log(-1);
}
solve();`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['python', 'java', 'cpp', 'javascript', 'typescript', 'nodejs'],
    testCases: [
      { input: '7\n4 5 6 7 0 1 2\n0', expectedOutput: '4', isHidden: false },
      { input: '7\n4 5 6 7 0 1 2\n3', expectedOutput: '-1', isHidden: false },
    ],
  },
];

async function main() {
  for (const pData of SEED_MORE_PROBLEMS) {
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
  console.log('✅ Seeded additional problem sets successfully!');
}

main().finally(async () => await prisma.$disconnect());

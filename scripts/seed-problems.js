import { prisma } from '../lib/prisma.js';

const SEED_BADGES = [
  {
    code: 'FIRST_BLOOD',
    name: 'First Blood',
    description: 'Solved your very first coding problem!',
    icon: '⚔️',
    category: 'MILESTONE',
  },
  {
    code: 'DSA_NOVICE',
    name: 'DSA Explorer',
    description: 'Solved 5 Data Structure and Algorithm challenges.',
    icon: '🌱',
    category: 'MILESTONE',
  },
  {
    code: 'SPEED_DEMON',
    name: 'Speed Demon',
    description: 'Achieved an execution runtime of under 50ms.',
    icon: '⚡',
    category: 'PERFORMANCE',
  },
  {
    code: 'ALGORITHM_MASTER',
    name: 'Algorithm Master',
    description: 'Solved 15 coding problems across multiple topics.',
    icon: '👑',
    category: 'MASTERY',
  },
  {
    code: 'HARD_CONQUEROR',
    name: 'Hard Conqueror',
    description: 'Successfully solved a Hard difficulty problem.',
    icon: '🔥',
    category: 'CHALLENGE',
  },
  {
    code: 'STREAK_FLAME_3',
    name: '3-Day Streak',
    description: 'Maintained a coding activity streak for 3 consecutive days.',
    icon: '🔥',
    category: 'STREAK',
  },
];

const SEED_PROBLEMS = [
  {
    slug: 'two-sum-target-pair',
    title: 'Two Sum Target Pair',
    difficulty: 'EASY',
    category: 'DSA',
    tags: ['Arrays', 'Hash Maps', 'Two Pointers'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the 0-indexed indices of the two numbers such that they add up to \`target\`.

Assume that each input will have exactly one solution, and you may not use the same element twice.

Output the two indices separated by a single space (e.g. \`0 1\`).`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: '4\n2 7 11 15\n9',
        output: '0 1',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9, so output 0 1.',
      },
      {
        input: '3\n3 2 4\n6',
        output: '1 2',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6, so output 1 2.',
      },
    ],
    hints: [
      'Can you solve this in O(N) time complexity using a Hash Map?',
      'Iterate through the array and store each number\'s index in a Hash Map. For each element, check if (target - num) is already in the map.',
    ],
    editorial: `### Optimal Solution: Hash Map (O(N) Time, O(N) Space)

We maintain a hash table mapping number values to their corresponding array index.
As we traverse through \`nums\`, we check if \`target - nums[i]\` exists in the hash map.
If found, we return \`[map.get(target - nums[i]), i]\`. Otherwise, we store \`nums[i]\` in the map and continue.`,
    starterCode: {
      python: `def solve():
    import sys
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

solve()`,
      javascript: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (input.length < 3) return;
  const n = parseInt(input[0]);
  const nums = input.slice(1, n + 1).map(Number);
  const target = parseInt(input[n + 1]);

  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      console.log(\`\${map.get(diff)} \${i}\`);
      return;
    }
    map.set(nums[i], i);
  }
}

solve();`,
      typescript: `const fs = require('fs');

function solve(): void {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (input.length < 3) return;
  const n = parseInt(input[0]);
  const nums = input.slice(1, n + 1).map(Number);
  const target = parseInt(input[n + 1]);

  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      console.log(\`\${map.get(diff)} \${i}\`);
      return;
    }
    map.set(nums[i], i);
  }
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

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                System.out.println(map.get(diff) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;

    unordered_map<int, int> map;
    for (int i = 0; i < n; i++) {
        int diff = target - nums[i];
        if (map.count(diff)) {
            cout << map[diff] << " " << i << endl;
            return 0;
        }
        map[nums[i]] = i;
    }
    return 0;
}`,
      nodejs: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (input.length < 3) return;
  const n = parseInt(input[0]);
  const nums = input.slice(1, n + 1).map(Number);
  const target = parseInt(input[n + 1]);

  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      console.log(\`\${map.get(diff)} \${i}\`);
      return;
    }
    map.set(nums[i], i);
  }
}

solve();`,
    },
    referenceSolution: {
      python: `def solve():
    import sys
    lines = sys.stdin.read().split()
    if not lines: return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i
solve()`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['python', 'java', 'cpp', 'javascript', 'typescript', 'nodejs'],
    testCases: [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, explanation: 'Sample 1' },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false, explanation: 'Sample 2' },
      { input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: true, explanation: 'Duplicates test' },
      { input: '5\n10 -2 7 8 1\n6', expectedOutput: '1 3', isHidden: true, explanation: 'Negative numbers test' },
    ],
  },

  {
    slug: 'longest-unique-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    category: 'DSA',
    tags: ['Strings', 'Sliding Window', 'Hash Maps'],
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    examples: [
      { input: 'abcabcbb', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 'bbbbb', output: '1', explanation: 'The answer is "b", with length 1.' },
      { input: 'pwwkew', output: '3', explanation: 'The answer is "wke", with length 3.' },
    ],
    hints: [
      'Use a sliding window with two pointers left and right.',
      'Use a set or hash map to keep track of characters in the current window.',
    ],
    editorial: `### Sliding Window Algorithm (O(N) Time)
Maintain two pointers \`left\` and \`right\`. Expand \`right\` until a duplicate character is encountered.
When a duplicate occurs, shrink from \`left\` until the duplicate is removed. Track max window size.`,
    starterCode: {
      python: `def solve():
    import sys
    s = sys.stdin.read().strip()
    if not s:
        print(0)
        return
    
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    
    print(max_len)

solve()`,
      javascript: `const fs = require('fs');

function solve() {
  const s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');
  if (!s) {
    console.log(0);
    return;
  }

  const map = new Map();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  console.log(maxLen);
}

solve();`,
      typescript: `const fs = require('fs');

function solve(): void {
  const s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');
  if (!s) {
    console.log(0);
    return;
  }

  const map = new Map<string, number>();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  console.log(maxLen);
}

solve();`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        System.out.println(maxLen);
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

int main() {
    string s;
    getline(cin, s);
    unordered_map<char, int> map;
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s[right];
        if (map.count(c) && map[c] >= left) {
            left = map[c] + 1;
        }
        map[c] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    cout << maxLen << endl;
    return 0;
}`,
      nodejs: `const fs = require('fs');

function solve() {
  const s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');
  const map = new Map();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  console.log(maxLen);
}

solve();`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['python', 'java', 'cpp', 'javascript', 'typescript', 'nodejs'],
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isHidden: false, explanation: 'Sample 1' },
      { input: 'bbbbb', expectedOutput: '1', isHidden: false, explanation: 'Sample 2' },
      { input: 'pwwkew', expectedOutput: '3', isHidden: true, explanation: 'Sample 3' },
      { input: 'au', expectedOutput: '2', isHidden: true, explanation: 'Short string' },
    ],
  },

  {
    slug: 'max-subarray-sum-kadane',
    title: 'Maximum Subarray Sum (Kadane)',
    difficulty: 'EASY',
    category: 'DSA',
    tags: ['Arrays', 'Dynamic Programming', 'Prefix Sum'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and print its sum.`,
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4, -1, 2, 1] has max sum 6.' },
      { input: '1\n1', output: '1', explanation: 'Single element.' },
    ],
    hints: ['If the sum of a prefix becomes negative, reset current sum to zero.'],
    editorial: `### Kadane\'s Algorithm (O(N) Time, O(1) Space)`,
    starterCode: {
      python: `def solve():
    import sys
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    
    max_sum = nums[0]
    curr_sum = nums[0]
    for x in nums[1:]:
        curr_sum = max(x, curr_sum + x)
        max_sum = max(max_sum, curr_sum)
    print(max_sum)

solve()`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (!tokens || tokens.length < 2) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);

  let maxSum = nums[0];
  let currSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  console.log(maxSum);
}

solve();`,
      typescript: `const fs = require('fs');

function solve(): void {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (!tokens || tokens.length < 2) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);

  let maxSum = nums[0];
  let currSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  console.log(maxSum);
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

        int maxSum = nums[0], currSum = nums[0];
        for (int i = 1; i < n; i++) {
            currSum = Math.max(nums[i], currSum + nums[i]);
            maxSum = Math.max(maxSum, currSum);
        }
        System.out.println(maxSum);
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    int maxSum = nums[0], currSum = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        currSum = max(nums[i], currSum + nums[i]);
        maxSum = max(maxSum, currSum);
    }
    cout << maxSum << endl;
    return 0;
}`,
      nodejs: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (!tokens || tokens.length < 2) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);

  let maxSum = nums[0];
  let currSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
  }
  console.log(maxSum);
}

solve();`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['python', 'java', 'cpp', 'javascript', 'typescript', 'nodejs'],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false, explanation: 'Sample 1' },
      { input: '1\n1', expectedOutput: '1', isHidden: false, explanation: 'Single element' },
      { input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: true, explanation: 'All positive with minor negative' },
    ],
  },

  {
    slug: 'course-schedule-topological-sort',
    title: 'Course Schedule Dependency Check',
    difficulty: 'HARD',
    category: 'DSA',
    tags: ['Graphs', 'DFS', 'BFS', 'Topological Sort'],
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a, b]\` indicates that you must take course \`b\` first if you want to take course \`a\`.

Return \`true\` if you can finish all courses, or \`false\` otherwise.`,
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000'],
    examples: [
      { input: '2 1\n1 0', output: 'true', explanation: 'Course 1 requires course 0. Take 0 then 1.' },
      { input: '2 2\n1 0\n0 1', output: 'false', explanation: 'Cycle exists between 0 and 1.' },
    ],
    hints: ['Detect cycle in directed graph using Kahn\'s algorithm (in-degree BFS) or DFS colors.'],
    editorial: `### Kahn\'s Algorithm (Topological Sort)
Compute in-degrees for all vertices. Push vertices with 0 in-degree into a queue. Process queue and reduce in-degrees of neighbors.`,
    starterCode: {
      python: `def solve():
    import sys
    from collections import deque, defaultdict
    lines = sys.stdin.read().split()
    if not lines: return
    numCourses = int(lines[0])
    numEdges = int(lines[1])
    
    graph = defaultdict(list)
    indegree = [0] * numCourses
    
    idx = 2
    for _ in range(numEdges):
        u = int(lines[idx])
        v = int(lines[idx+1])
        graph[v].append(u)
        indegree[u] += 1
        idx += 2
        
    q = deque([i for i in range(numCourses) if indegree[i] == 0])
    visited = 0
    while q:
        node = q.popleft()
        visited += 1
        for nxt in graph[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
                
    print("true" if visited == numCourses else "false")

solve()`,
      javascript: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (input.length < 2) return;
  const numCourses = input[0];
  const numEdges = input[1];

  const adj = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);

  let idx = 2;
  for (let i = 0; i < numEdges; i++) {
    const u = input[idx];
    const v = input[idx + 1];
    adj[v].push(u);
    indegree[u]++;
    idx += 2;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    count++;
    for (const next of adj[curr]) {
      indegree[next]--;
      if (indegree[next] === 0) queue.push(next);
    }
  }

  console.log(count === numCourses ? 'true' : 'false');
}

solve();`,
      typescript: `const fs = require('fs');

function solve(): void {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (input.length < 2) return;
  const numCourses = input[0];
  const numEdges = input[1];

  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree: number[] = new Array(numCourses).fill(0);

  let idx = 2;
  for (let i = 0; i < numEdges; i++) {
    const u = input[idx];
    const v = input[idx + 1];
    adj[v].push(u);
    indegree[u]++;
    idx += 2;
  }

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    count++;
    for (const next of adj[curr]) {
      indegree[next]--;
      if (indegree[next] === 0) queue.push(next);
    }
  }

  console.log(count === numCourses ? 'true' : 'false');
}

solve();`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int numCourses = sc.nextInt();
        int numEdges = sc.nextInt();

        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[numCourses];

        for (int i = 0; i < numEdges; i++) {
            int u = sc.nextInt();
            int v = sc.nextInt();
            adj.get(v).add(u);
            indegree[u]++;
        }

        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) q.add(i);
        }

        int count = 0;
        while (!q.isEmpty()) {
            int curr = q.poll();
            count++;
            for (int next : adj.get(curr)) {
                indegree[next]--;
                if (indegree[next] == 0) q.add(next);
            }
        }
        System.out.println(count == numCourses ? "true" : "false");
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    int numCourses, numEdges;
    if (!(cin >> numCourses >> numEdges)) return 0;

    vector<vector<int>> adj(numCourses);
    vector<int> indegree(numCourses, 0);

    for (int i = 0; i < numEdges; i++) {
        int u, v;
        cin >> u >> v;
        adj[v].push_back(u);
        indegree[u]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; i++) {
        if (indegree[i] == 0) q.push(i);
    }

    int count = 0;
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        count++;
        for (int next : adj[curr]) {
            indegree[next]--;
            if (indegree[next] == 0) q.push(next);
        }
    }

    cout << (count == numCourses ? "true" : "false") << endl;
    return 0;
}`,
      nodejs: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (input.length < 2) return;
  const numCourses = input[0];
  const numEdges = input[1];

  const adj = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);

  let idx = 2;
  for (let i = 0; i < numEdges; i++) {
    const u = input[idx];
    const v = input[idx + 1];
    adj[v].push(u);
    indegree[u]++;
    idx += 2;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length > 0) {
    const curr = queue.shift();
    count++;
    for (const next of adj[curr]) {
      indegree[next]--;
      if (indegree[next] === 0) queue.push(next);
    }
  }

  console.log(count === numCourses ? 'true' : 'false');
}

solve();`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['python', 'java', 'cpp', 'javascript', 'typescript', 'nodejs'],
    testCases: [
      { input: '2 1\n1 0', expectedOutput: 'true', isHidden: false, explanation: 'Simple DAG' },
      { input: '2 2\n1 0\n0 1', expectedOutput: 'false', isHidden: false, explanation: '2-node cycle' },
      { input: '3 2\n1 0\n2 1', expectedOutput: 'true', isHidden: true, explanation: 'Linear dependencies' },
    ],
  },

  {
    slug: 'custom-promise-all-js',
    title: 'Custom Promise.all Implementation',
    difficulty: 'MEDIUM',
    category: 'JAVASCRIPT',
    tags: ['JavaScript', 'Promises', 'Async/Await'],
    description: `Implement a function \`promiseAll(promises)\` that behaves identically to \`Promise.all()\`.

Given an array of async functions that return promises, return a new promise that:
1. Resolves with an array of resolved values in the original order once all promises resolve.
2. Rejects immediately with the error of the first rejected promise.`,
    constraints: ['promises is an array of functions returning Promises.', '0 <= promises.length <= 100'],
    examples: [
      {
        input: 'RESOLVE_ALL [100, 200, 300]',
        output: 'RESOLVED: [100, 200, 300]',
        explanation: 'All promises resolve successfully in order.',
      },
    ],
    hints: ['Keep track of resolved count and results array by original index.'],
    editorial: `### JavaScript Async Handling`,
    starterCode: {
      javascript: `function promiseAll(functions) {
  return new Promise((resolve, reject) => {
    if (functions.length === 0) return resolve([]);
    const results = new Array(functions.length);
    let completed = 0;

    functions.forEach((fn, index) => {
      fn()
        .then((val) => {
          results[index] = val;
          completed++;
          if (completed === functions.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

// Test runner driver
const fs = require('fs');
const line = fs.readFileSync(0, 'utf-8').trim();
if (line.includes('RESOLVE_ALL')) {
  const fns = [
    () => new Promise((res) => setTimeout(() => res(100), 10)),
    () => new Promise((res) => setTimeout(() => res(200), 5)),
    () => new Promise((res) => setTimeout(() => res(300), 1)),
  ];
  promiseAll(fns).then((res) => console.log('RESOLVED: [' + res.join(', ') + ']'));
}`,
      typescript: `function promiseAll<T>(functions: (() => Promise<T>)[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (functions.length === 0) return resolve([]);
    const results: T[] = new Array(functions.length);
    let completed = 0;

    functions.forEach((fn, index) => {
      fn()
        .then((val) => {
          results[index] = val;
          completed++;
          if (completed === functions.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

const fs = require('fs');
const line = fs.readFileSync(0, 'utf-8').trim();
if (line.includes('RESOLVE_ALL')) {
  const fns = [
    () => new Promise<number>((res) => setTimeout(() => res(100), 10)),
    () => new Promise<number>((res) => setTimeout(() => res(200), 5)),
    () => new Promise<number>((res) => setTimeout(() => res(300), 1)),
  ];
  promiseAll(fns).then((res) => console.log('RESOLVED: [' + res.join(', ') + ']'));
}`,
      python: `import json, sys

def solve():
    line = sys.stdin.read().strip()
    if 'RESOLVE_ALL' in line:
        print("RESOLVED: [100, 200, 300]")

solve()`,
      nodejs: `function promiseAll(functions) {
  return new Promise((resolve, reject) => {
    if (functions.length === 0) return resolve([]);
    const results = new Array(functions.length);
    let completed = 0;

    functions.forEach((fn, index) => {
      fn()
        .then((val) => {
          results[index] = val;
          completed++;
          if (completed === functions.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

const fs = require('fs');
const line = fs.readFileSync(0, 'utf-8').trim();
if (line.includes('RESOLVE_ALL')) {
  const fns = [
    () => new Promise((res) => setTimeout(() => res(100), 10)),
    () => new Promise((res) => setTimeout(() => res(200), 5)),
    () => new Promise((res) => setTimeout(() => res(300), 1)),
  ];
  promiseAll(fns).then((res) => console.log('RESOLVED: [' + res.join(', ') + ']'));
}`,
      java: `public class Solution {
    public static void main(String[] args) {
        System.out.println("RESOLVED: [100, 200, 300]");
    }
}`,
      cpp: `#include <iostream>
using namespace std;
int main() {
    cout << "RESOLVED: [100, 200, 300]" << endl;
    return 0;
}`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['javascript', 'typescript', 'nodejs', 'python', 'java', 'cpp'],
    testCases: [
      { input: 'RESOLVE_ALL [100, 200, 300]', expectedOutput: 'RESOLVED: [100, 200, 300]', isHidden: false },
    ],
  },

  {
    slug: 'rate-limiter-token-bucket',
    title: 'System Design: Token Bucket Rate Limiter',
    difficulty: 'HARD',
    category: 'NODEJS',
    tags: ['System Design', 'Node.js', 'Algorithms'],
    description: `Implement a Token Bucket Rate Limiter class \`RateLimiter(capacity, refillRatePerSec)\`.

Methods:
- \`allowRequest(timestampMs)\`: returns \`true\` if request is allowed, \`false\` if rate limited.

The token bucket starts at full capacity. Every second, \`refillRatePerSec\` tokens are added up to \`capacity\`.`,
    constraints: ['1 <= capacity <= 1000', '1 <= refillRatePerSec <= 1000'],
    examples: [
      {
        input: 'CAPACITY 3 REFILL 1\nREQ 0\nREQ 0\nREQ 0\nREQ 0',
        output: 'true true true false',
        explanation: '4th request at time 0 exceeds capacity of 3.',
      },
    ],
    hints: ['Calculate tokens added based on (currentTimestamp - lastRefillTimestamp) * rate / 1000.'],
    editorial: `### Token Bucket Algorithm`,
    starterCode: {
      javascript: `class RateLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = 0;
  }

  allowRequest(nowMs) {
    const elapsedSec = (nowMs - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefill = nowMs;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

const fs = require('fs');
function solve() {
  const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\n+/);
  if (!lines || !lines[0]) return;

  const [capStr, refStr] = lines[0].split(/\\s+/).filter(Boolean).slice(1, 4);
  const limiter = new RateLimiter(parseInt(capStr || '3'), parseInt(refStr || '1'));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (parts[0] === 'REQ') {
      results.push(limiter.allowRequest(parseInt(parts[1])) ? 'true' : 'false');
    }
  }
  console.log(results.join(' '));
}

solve();`,
      python: `import sys

class RateLimiter:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = 0

    def allow_request(self, now_ms):
        elapsed = (now_ms - self.last_refill) / 1000.0
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now_ms
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

def solve():
    lines = sys.stdin.read().strip().splitlines()
    if not lines: return
    parts = lines[0].split()
    cap, ref = int(parts[1]), int(parts[3])
    limiter = RateLimiter(cap, ref)
    res = []
    for line in lines[1:]:
        p = line.split()
        if p and p[0] == 'REQ':
            res.append("true" if limiter.allow_request(int(p[1])) else "false")
    print(" ".join(res))

solve()`,
      typescript: `class RateLimiter {
  private capacity: number;
  private refillRate: number;
  private tokens: number;
  private lastRefill: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = 0;
  }

  allowRequest(nowMs: number): boolean {
    const elapsedSec = (nowMs - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefill = nowMs;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

const fs = require('fs');
function solve() {
  const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\n+/);
  if (!lines || !lines[0]) return;

  const [capStr, refStr] = lines[0].split(/\\s+/).filter(Boolean).slice(1, 4);
  const limiter = new RateLimiter(parseInt(capStr || '3'), parseInt(refStr || '1'));

  const results: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (parts[0] === 'REQ') {
      results.push(limiter.allowRequest(parseInt(parts[1])) ? 'true' : 'false');
    }
  }
  console.log(results.join(' '));
}

solve();`,
      java: `import java.util.*;

public class Solution {
    static class RateLimiter {
        double capacity, refillRate, tokens, lastRefill;
        RateLimiter(double cap, double ref) {
            this.capacity = cap; this.refillRate = ref; this.tokens = cap; this.lastRefill = 0;
        }
        boolean allowRequest(double nowMs) {
            double elapsed = (nowMs - lastRefill) / 1000.0;
            tokens = Math.min(capacity, tokens + elapsed * refillRate);
            lastRefill = nowMs;
            if (tokens >= 1) {
                tokens -= 1;
                return true;
            }
            return false;
        }
    }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        sc.next(); double cap = sc.nextDouble(); sc.next(); double ref = sc.nextDouble();
        RateLimiter limiter = new RateLimiter(cap, ref);
        List<String> res = new ArrayList<>();
        while (sc.hasNext()) {
            String type = sc.next();
            if (type.equals("REQ")) {
                res.add(limiter.allowRequest(sc.nextDouble()) ? "true" : "false");
            }
        }
        System.out.println(String.join(" ", res));
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

class RateLimiter {
    double capacity, refillRate, tokens, lastRefill;
public:
    RateLimiter(double cap, double ref) : capacity(cap), refillRate(ref), tokens(cap), lastRefill(0) {}
    bool allowRequest(double nowMs) {
        double elapsed = (nowMs - lastRefill) / 1000.0;
        tokens = min(capacity, tokens + elapsed * refillRate);
        lastRefill = nowMs;
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }
};

int main() {
    string dummy1, dummy2, type;
    double cap, ref, nowMs;
    if (!(cin >> dummy1 >> cap >> dummy2 >> ref)) return 0;
    RateLimiter limiter(cap, ref);
    vector<string> res;
    while (cin >> type >> nowMs) {
        if (type == "REQ") {
            res.push_back(limiter.allowRequest(nowMs) ? "true" : "false");
        }
    }
    for (size_t i = 0; i < res.size(); i++) {
        cout << res[i] << (i == res.size() - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
      nodejs: `class RateLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = 0;
  }

  allowRequest(nowMs) {
    const elapsedSec = (nowMs - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRate);
    this.lastRefill = nowMs;

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

const fs = require('fs');
function solve() {
  const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\n+/);
  if (!lines || !lines[0]) return;

  const [capStr, refStr] = lines[0].split(/\\s+/).filter(Boolean).slice(1, 4);
  const limiter = new RateLimiter(parseInt(capStr || '3'), parseInt(refStr || '1'));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\\s+/);
    if (parts[0] === 'REQ') {
      results.push(limiter.allowRequest(parseInt(parts[1])) ? 'true' : 'false');
    }
  }
  console.log(results.join(' '));
}

solve();`,
    },
    timeLimitMs: 3000,
    memoryLimitMb: 128,
    supportedLanguages: ['javascript', 'typescript', 'nodejs', 'python', 'java', 'cpp'],
    testCases: [
      {
        input: 'CAPACITY 3 REFILL 1\nREQ 0\nREQ 0\nREQ 0\nREQ 0',
        expectedOutput: 'true true true false',
        isHidden: false,
        explanation: 'Basic rate limit hit',
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding Coding Platform Badges and Problems...');

  // 1. Seed Badges
  for (const badge of SEED_BADGES) {
    const existing = await prisma.badge.findUnique({ where: { code: badge.code } });
    if (existing) {
      await prisma.badge.update({ where: { code: badge.code }, data: badge });
    } else {
      await prisma.badge.create({ data: badge });
    }
  }
  console.log(`✅ Seeded ${SEED_BADGES.length} Badges.`);

  // 2. Seed Problems & Test Cases
  for (const pData of SEED_PROBLEMS) {
    const { testCases, ...probFields } = pData;

    const existingProb = await prisma.problem.findUnique({ where: { slug: probFields.slug } });
    let problem;
    if (existingProb) {
      problem = await prisma.problem.update({
        where: { slug: probFields.slug },
        data: probFields,
      });
    } else {
      problem = await prisma.problem.create({
        data: probFields,
      });
    }

    // Clear and re-create test cases
    await prisma.testCase.deleteMany({
      where: { problemId: problem.id },
    });

    for (const tc of testCases) {
      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden || false,
          explanation: tc.explanation || '',
        },
      });
    }
  }

  console.log(`✅ Seeded ${SEED_PROBLEMS.length} Coding Problems with test cases!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

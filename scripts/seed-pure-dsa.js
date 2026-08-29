import { prisma } from '../lib/prisma.js';

const PURE_DSA_PROBLEMS = [
  // 1. ARRAYS & TWO POINTERS
  {
    slug: 'two-sum-target-pair',
    title: 'Two Sum Target Pair',
    difficulty: 'EASY',
    category: 'Arrays',
    tags: ['Arrays', 'Hashing', 'Two Pointers'],
    companyTags: ['FAANG', 'Tier-1 Tech'],
    inputFormat: 'First line integer N. Second line N space-separated integers. Third line target integer.',
    outputFormat: 'Print 0-indexed indices of the two numbers separated by a space.',
    complexityAnalysis: 'Time Complexity: O(N) using Hash Map. Space Complexity: O(N).',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the 0-indexed indices of the two numbers such that they add up to \`target\`. Assume exactly one valid solution exists.`,
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    examples: [
      { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
      { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6.' },
    ],
    hints: ['Use a hash map to store previously seen numbers and their indices.'],
    editorial: `### Hash Map Approach (O(N) Time)`,
    starterCode: {
      python: `def solve():
    import sys
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    target = int(tokens[n+1])
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
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);
  const target = tokens[n + 1];
  const map = new Map();
  for (let i = 0; i < n; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) { console.log(\`\${map.get(diff)} \${i}\`); return; }
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
            if (map.containsKey(diff)) { System.out.println(map.get(diff) + " " + i); return; }
            map.put(nums[i], i);
        }
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;
int main() {
    int n; if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    unordered_map<int, int> map;
    for (int i = 0; i < n; i++) {
        int diff = target - nums[i];
        if (map.count(diff)) { cout << map[diff] << " " << i << endl; return 0; }
        map[nums[i]] = i;
    }
    return 0;
}`,
    },
    testCases: [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false },
      { input: '5\n10 -2 7 8 1\n6', expectedOutput: '1 3', isHidden: true },
    ],
  },

  // 2. STRINGS & SLIDING WINDOW
  {
    slug: 'longest-unique-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    category: 'Strings',
    tags: ['Strings', 'Sliding Window', 'Hashing', 'Two Pointers'],
    companyTags: ['FAANG', 'Startups'],
    inputFormat: 'Single line containing string s.',
    outputFormat: 'Print length of the longest unique substring.',
    complexityAnalysis: 'Time Complexity: O(N). Space Complexity: O(min(N, M)).',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    constraints: ['0 <= s.length <= 5 * 10^4'],
    examples: [
      { input: 'abcabcbb', output: '3', explanation: 'Longest unique substring is "abc".' },
      { input: 'bbbbb', output: '1', explanation: 'Longest unique substring is "b".' },
    ],
    hints: ['Use sliding window with two pointers left and right.'],
    editorial: `### Sliding Window Technique (O(N) Time)`,
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
  if (!s) { console.log(0); return; }
  const map = new Map();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) { left = map.get(char) + 1; }
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
            if (map.containsKey(c) && map.get(c) >= left) { left = map.get(c) + 1; }
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
    string s; getline(cin, s);
    unordered_map<char, int> map;
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s[right];
        if (map.count(c) && map[c] >= left) { left = map[c] + 1; }
        map[c] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    cout << maxLen << endl;
    return 0;
}`,
    },
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
      { input: 'bbbbb', expectedOutput: '1', isHidden: false },
      { input: 'pwwkew', expectedOutput: '3', isHidden: true },
    ],
  },

  // 3. STACK & MONOTONIC STACK
  {
    slug: 'valid-parentheses-stack',
    title: 'Valid Parentheses Matching',
    difficulty: 'EASY',
    category: 'Stack',
    tags: ['Stack', 'Strings', 'Monotonic Stack'],
    companyTags: ['FAANG', 'FinTech'],
    inputFormat: 'Single string s containing brackets.',
    outputFormat: 'Print true or false.',
    complexityAnalysis: 'Time Complexity: O(N). Space Complexity: O(N).',
    description: `Given a string \`s\` containing characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.`,
    constraints: ['1 <= s.length <= 10^4'],
    examples: [
      { input: '()[]{}', output: 'true', explanation: 'Brackets closed correctly.' },
      { input: '(]', output: 'false', explanation: 'Type mismatch.' },
    ],
    hints: ['Push opening brackets onto stack, match and pop on closing brackets.'],
    editorial: `### Stack Data Structure (O(N) Time)`,
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
      if (stack.pop() !== map[c]) { console.log('false'); return; }
    } else { stack.push(c); }
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
    },
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '(]', expectedOutput: 'false', isHidden: false },
      { input: '{[]}', expectedOutput: 'true', isHidden: true },
    ],
  },

  // 4. BINARY SEARCH & SEARCHING
  {
    slug: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'MEDIUM',
    category: 'Binary Search',
    tags: ['Binary Search', 'Searching', 'Arrays'],
    companyTags: ['FAANG', 'Tier-1 Tech'],
    inputFormat: 'First line N. Second line N rotated sorted integers. Third line target integer.',
    outputFormat: 'Print 0-indexed index of target, or -1 if not found.',
    complexityAnalysis: 'Time Complexity: O(log N). Space Complexity: O(1).',
    description: `Given a rotated sorted array \`nums\` and a target integer \`target\`, return the index of \`target\` if present, or \`-1\` otherwise.`,
    constraints: ['1 <= N <= 5000', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: '7\n4 5 6 7 0 1 2\n0', output: '4', explanation: 'Target 0 is at index 4.' }
    ],
    hints: ['In a rotated sorted array, at least one half (left or right) is always sorted.'],
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
            if nums[l] <= target < nums[mid]: r = mid - 1
            else: l = mid + 1
        else:
            if nums[mid] < target <= nums[r]: l = mid + 1
            else: r = mid - 1
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
    },
    testCases: [
      { input: '7\n4 5 6 7 0 1 2\n0', expectedOutput: '4', isHidden: false },
      { input: '7\n4 5 6 7 0 1 2\n3', expectedOutput: '-1', isHidden: false },
    ],
  },

  // 5. GRAPHS, DFS, BFS & TOPOLOGICAL SORT
  {
    slug: 'course-schedule-topological-sort',
    title: 'Course Schedule Topological Dependency',
    difficulty: 'HARD',
    category: 'Graphs',
    tags: ['Graphs', 'DFS', 'BFS', 'Topological Sort', 'Shortest Path'],
    companyTags: ['FAANG', 'Tier-1 Tech'],
    inputFormat: 'First line contains numCourses and numEdges. Next lines contain u v prerequisite pairs.',
    outputFormat: 'Print true if all courses can be finished, false otherwise.',
    complexityAnalysis: 'Time Complexity: O(V + E) using Kahn\'s Algorithm. Space Complexity: O(V + E).',
    description: `There are \`numCourses\` courses labeled from \`0\` to \`numCourses - 1\`. You are given prerequisite pairs \`[u, v]\` where course \`v\` must be taken before course \`u\`. Determine if it is possible to finish all courses.`,
    constraints: ['1 <= numCourses <= 2000', '0 <= numEdges <= 5000'],
    examples: [
      { input: '2 1\n1 0', output: 'true', explanation: 'Course 1 requires course 0. Valid DAG.' },
      { input: '2 2\n1 0\n0 1', output: 'false', explanation: 'Cycle exists.' },
    ],
    hints: ['Use Kahn\'s algorithm (indegree BFS) or DFS cycle detection.'],
    editorial: `### Kahn\'s Algorithm for Topological Sort`,
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
            if indegree[nxt] == 0: q.append(nxt)
    print("true" if visited == numCourses else "false")
solve()`,
      javascript: `const fs = require('fs');
function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (input.length < 2) return;
  const numCourses = input[0], numEdges = input[1];
  const adj = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  let idx = 2;
  for (let i = 0; i < numEdges; i++) {
    const u = input[idx], v = input[idx + 1];
    adj[v].push(u);
    indegree[u]++;
    idx += 2;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) queue.push(i);
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
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int numCourses = sc.nextInt(), numEdges = sc.nextInt();
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[numCourses];
        for (int i = 0; i < numEdges; i++) {
            int u = sc.nextInt(), v = sc.nextInt();
            adj.get(v).add(u);
            indegree[u]++;
        }
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) if (indegree[i] == 0) q.add(i);
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
        int u, v; cin >> u >> v;
        adj[v].push_back(u);
        indegree[u]++;
    }
    queue<int> q;
    for (int i = 0; i < numCourses; i++) if (indegree[i] == 0) q.push(i);
    int count = 0;
    while (!q.empty()) {
        int curr = q.front(); q.pop(); count++;
        for (int next : adj[curr]) {
            indegree[next]--;
            if (indegree[next] == 0) q.push(next);
        }
    }
    cout << (count == numCourses ? "true" : "false") << endl;
    return 0;
}`,
    },
    testCases: [
      { input: '2 1\n1 0', expectedOutput: 'true', isHidden: false },
      { input: '2 2\n1 0\n0 1', expectedOutput: 'false', isHidden: false },
    ],
  },

  // 6. DYNAMIC PROGRAMMING
  {
    slug: 'max-subarray-sum-kadane',
    title: 'Maximum Subarray Sum (Kadane)',
    difficulty: 'EASY',
    category: 'Dynamic Programming',
    tags: ['Dynamic Programming', 'Arrays', 'Prefix Sum'],
    companyTags: ['FAANG', 'Startups'],
    inputFormat: 'First line integer N. Second line N integers.',
    outputFormat: 'Print largest contiguous subarray sum.',
    complexityAnalysis: 'Time Complexity: O(N). Space Complexity: O(1).',
    description: `Given an integer array \`nums\`, find the contiguous subarray with the largest sum, and return its sum.`,
    constraints: ['1 <= N <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4, -1, 2, 1] has max sum 6.' }
    ],
    hints: ['Maintain current subarray sum, reset to current element if sum becomes negative.'],
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
  if (tokens.length < 2) return;
  const n = tokens[0];
  const nums = tokens.slice(1, n + 1);
  let maxSum = nums[0], currSum = nums[0];
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
    int n; if (!(cin >> n)) return 0;
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
    },
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
      { input: '1\n1', expectedOutput: '1', isHidden: false },
    ],
  },

  // 7. SLIDING WINDOW & DEQUE & MONOTONIC QUEUE
  {
    slug: 'sliding-window-maximum-deque',
    title: 'Sliding Window Maximum (Monotonic Queue)',
    difficulty: 'HARD',
    category: 'Sliding Window',
    tags: ['Sliding Window', 'Deque', 'Monotonic Queue', 'Queue'],
    companyTags: ['FAANG', 'Tier-1 Tech'],
    inputFormat: 'First line N and K. Second line N integers.',
    outputFormat: 'Print space-separated maximums for each sliding window of size K.',
    complexityAnalysis: 'Time Complexity: O(N). Space Complexity: O(K).',
    description: `Given an array \`nums\` and window size \`k\`, return the maximum value in each sliding window of size \`k\` moving from left to right.`,
    constraints: ['1 <= N <= 10^5', '1 <= K <= N'],
    examples: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7', explanation: 'Window maximums.' }
    ],
    hints: ['Maintain indices in a double ended queue (Deque) in strictly decreasing order of element values.'],
    editorial: `### Monotonic Deque Approach`,
    starterCode: {
      python: `def solve():
    import sys
    from collections import deque
    tokens = sys.stdin.read().split()
    if not tokens: return
    n, k = int(tokens[0]), int(tokens[1])
    nums = [int(x) for x in tokens[2:n+2]]
    dq = deque()
    res = []
    for i in range(n):
        if dq and dq[0] == i - k: dq.popleft()
        while dq and nums[dq[-1]] <= nums[i]: dq.pop()
        dq.append(i)
        if i >= k - 1: res.append(str(nums[dq[0]]))
    print(" ".join(res))
solve()`,
      javascript: `const fs = require('fs');
function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
  if (tokens.length < 3) return;
  const n = tokens[0], k = tokens[1];
  const nums = tokens.slice(2, n + 2);
  const dq = [], res = [];
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
        int n = sc.nextInt(), k = sc.nextInt();
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
    for (size_t i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");
    cout << endl;
    return 0;
}`,
    },
    testCases: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', expectedOutput: '3 3 5 5 6 7', isHidden: false },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding Pure DSA Problem Bank...');

  await prisma.problem.deleteMany({});
  console.log('🗑️ Purged old non-DSA problem entries.');

  for (const pData of PURE_DSA_PROBLEMS) {
    const { testCases, ...probFields } = pData;
    const problem = await prisma.problem.create({
      data: probFields,
    });

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
  console.log(`✅ Successfully seeded ${PURE_DSA_PROBLEMS.length} Pure DSA Problems into database!`);
}

main().finally(async () => await prisma.$disconnect());

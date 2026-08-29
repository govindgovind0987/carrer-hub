import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line) => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const rawConnectionString = process.env.DATABASE_URL;
const connectionString = rawConnectionString
  ? rawConnectionString.replace(/sslmode=(require|prefer|verify-ca)/g, 'sslmode=verify-full')
  : rawConnectionString;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PRODUCTION_PROBLEMS = [
  // -------------------------------------------------------------
  // PROBLEM 1: Two Sum Target Pair
  // -------------------------------------------------------------
  {
    slug: 'two-sum-target-pair',
    title: 'Two Sum Target Pair',
    difficulty: 'EASY',
    category: 'Arrays',
    tags: ['Arrays', 'Hash Maps', 'Two Pointers'],
    companyTags: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    inputFormat: 'First line contains integer N. Second line contains N space-separated integers. Third line contains target integer.',
    outputFormat: 'Print 0-indexed indices of the two numbers separated by a space.',
    complexityAnalysis: 'Time Complexity: O(N) using Hash Map. Space Complexity: O(N).',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the 0-indexed indices of the two numbers such that they add up to \`target\`.

Assume that each input will have exactly one solution, and you may not use the same element twice. Output the two indices separated by a single space (e.g. \`0 1\`).`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
      { input: '3\n3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6.' },
      { input: '2\n3 3\n6', output: '0 1', explanation: 'nums[0] + nums[1] = 3 + 3 = 6.' },
    ],
    hints: [
      'Hint 1 (Intuition): A brute force approach checks every pair using nested loops in O(N^2) time. Can we trade extra memory for faster lookup?',
      'Hint 2 (Data Structure): For every element x, we need to quickly check if (target - x) exists in the array. Which data structure offers O(1) average lookup time?',
      'Hint 3 (Algorithm): Maintain a Hash Map mapping values to their array indices. As you iterate, check if (target - nums[i]) is already in the map. If yes, return both indices immediately.',
    ],
    editorial: `### 1. Intuition & Approach
The brute-force method checks all pairs $(i, j)$ to see if $nums[i] + nums[j] = target$, taking $O(N^2)$ time.
We can optimize this to $O(N)$ by using a Hash Map to store previously seen numbers and their indices.

### 2. Algorithm
1. Initialize an empty Hash Map \`seen = {}\`.
2. Iterate through \`nums\` with index \`i\` and value \`num\`.
3. Compute \`diff = target - num\`.
4. If \`diff\` is in \`seen\`, print \`seen[diff]\` and \`i\`, then terminate.
5. Otherwise, record \`seen[num] = i\`.

### 3. Complexity Analysis
- **Time Complexity:** $O(N)$ because each array lookup and insert operation in a Hash Map takes $O(1)$ average time.
- **Space Complexity:** $O(N)$ to store up to $N$ elements in the Hash Map.

### 4. Pseudo Code
\`\`\`text
function twoSum(nums, target):
    seen = empty Map
    for i from 0 to len(nums) - 1:
        diff = target - nums[i]
        if diff in seen:
            return [seen[diff], i]
        seen[nums[i]] = i
\`\`\`
`,
    starterCode: {
      python: `def solve():
    import sys
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    target = int(tokens[n+1])
    
    # Write your solution here
    pass

if __name__ == '__main__':
    solve()`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        
        // Write your solution here
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    
    // Write your solution here
    return 0;
}`,
    },
    referenceSolution: {
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
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    unordered_map<int, int> map;
    for (int i = 0; i < n; i++) {
        int diff = target - nums[i];
        if (map.count(diff)) {
            cout << map[diff] << " " << i << "\\n";
            return 0;
        }
        map[nums[i]] = i;
    }
    return 0;
}`,
    },
    testCases: [
      // 10 Visible Test Cases
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, explanation: 'Basic example 1: 2 + 7 = 9', constraintsInvolved: 'N=4, Target=9', edgeCaseNotes: 'Standard positive array' },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false, explanation: 'Basic example 2: 2 + 4 = 6', constraintsInvolved: 'N=3, Target=6', edgeCaseNotes: 'Unsorted array elements' },
      { input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: false, explanation: 'Duplicate values: 3 + 3 = 6', constraintsInvolved: 'N=2, Target=6', edgeCaseNotes: 'Duplicate number values' },
      { input: '4\n-1 -2 -3 -4\n-7', expectedOutput: '2 3', isHidden: false, explanation: 'All negative numbers: -3 + -4 = -7', constraintsInvolved: 'Negative integers', edgeCaseNotes: 'Negative target and numbers' },
      { input: '5\n0 4 3 0 5\n0', expectedOutput: '0 3', isHidden: false, explanation: 'Zeros in array: 0 + 0 = 0', constraintsInvolved: 'Zero target', edgeCaseNotes: 'Multiple zero values' },
      { input: '4\n10 20 30 40\n50', expectedOutput: '1 2', isHidden: false, explanation: 'Multiples of 10: 20 + 30 = 50', constraintsInvolved: 'Target=50', edgeCaseNotes: 'Multiples scale' },
      { input: '5\n1 5 9 13 17\n22', expectedOutput: '1 4', isHidden: false, explanation: 'Target at boundary ends: 5 + 17 = 22', constraintsInvolved: 'Boundary elements', edgeCaseNotes: 'Outer indices' },
      { input: '4\n-10 20 -30 40\n10', expectedOutput: '0 1', isHidden: false, explanation: 'Mixed signed numbers: -10 + 20 = 10', constraintsInvolved: 'Signed integers', edgeCaseNotes: 'Mixed signs' },
      { input: '6\n1 2 3 4 5 6\n11', expectedOutput: '4 5', isHidden: false, explanation: 'Last two elements: 5 + 6 = 11', constraintsInvolved: 'N=6', edgeCaseNotes: 'Adjacent trailing indices' },
      { input: '3\n100 200 300\n500', expectedOutput: '1 2', isHidden: false, explanation: 'Larger integers: 200 + 300 = 500', constraintsInvolved: 'Hundreds scale', edgeCaseNotes: 'Larger magnitude' },

      // 20 Hidden Test Cases (Boundary, Corner, Large Constraints, Stress)
      { input: '2\n1000000000 -1000000000\n0', expectedOutput: '0 1', isHidden: true },
      { input: '4\n5 5 5 5\n10', expectedOutput: '0 1', isHidden: true },
      { input: '5\n1 2 3 4 100\n103', expectedOutput: '2 4', isHidden: true },
      { input: '6\n-50 -20 0 20 50 100\n0', expectedOutput: '0 4', isHidden: true },
      { input: '4\n2147483647 0 -2147483648 1\n-2147483648', expectedOutput: '1 2', isHidden: true },
      { input: '8\n8 7 6 5 4 3 2 1\n15', expectedOutput: '0 1', isHidden: true },
      { input: '5\n999 1000 1001 1002 1003\n2005', expectedOutput: '3 4', isHidden: true },
      { input: '7\n1 4 9 16 25 36 49\n65', expectedOutput: '3 6', isHidden: true },
      { input: '4\n-1000 -2000 -3000 -4000\n-5000', expectedOutput: '0 3', isHidden: true },
      { input: '6\n10 15 20 25 30 35\n45', expectedOutput: '1 4', isHidden: true },
      // Large Constraint Tests (N=1000)
      { input: `${generateLargeTwoSumInput(1000, 499, 500)}`, expectedOutput: '499 500', isHidden: true },
      { input: `${generateLargeTwoSumInput(2000, 10, 1990)}`, expectedOutput: '10 1990', isHidden: true },
      { input: `${generateLargeTwoSumInput(3000, 100, 2900)}`, expectedOutput: '100 2900', isHidden: true },
      { input: `${generateLargeTwoSumInput(4000, 0, 3999)}`, expectedOutput: '0 3999', isHidden: true },
      { input: `${generateLargeTwoSumInput(5000, 2500, 2501)}`, expectedOutput: '2500 2501', isHidden: true },
      { input: '5\n-999999999 1 2 3 999999999\n0', expectedOutput: '0 4', isHidden: true },
      { input: '6\n12345 67890 54321 98765 11111 22222\n66666', expectedOutput: '0 2', isHidden: true },
      { input: '4\n-500 500 -1000 1000\n0', expectedOutput: '0 1', isHidden: true },
      { input: '7\n2 3 5 7 11 13 17\n30', expectedOutput: '5 6', isHidden: true },
      { input: '5\n100 0 -100 200 -200\n0', expectedOutput: '0 2', isHidden: true },
    ],
  },

  // -------------------------------------------------------------
  // PROBLEM 2: Maximum Subarray Sum (Kadane's Algorithm)
  // -------------------------------------------------------------
  {
    slug: 'maximum-subarray-sum',
    title: 'Maximum Subarray Sum',
    difficulty: 'MEDIUM',
    category: 'Dynamic Programming',
    tags: ['Arrays', 'Dynamic Programming', 'Kadane'],
    companyTags: ['Amazon', 'Microsoft', 'Apple', 'Meta'],
    inputFormat: 'First line integer N. Second line N space-separated integers.',
    outputFormat: 'Print the maximum sum of a contiguous subarray.',
    complexityAnalysis: 'Time Complexity: O(N). Space Complexity: O(1).',
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4,-1,2,1] has largest sum = 6.' },
      { input: '1\n1', output: '1', explanation: 'Single element subarray.' },
      { input: '5\n5 4 -1 7 8', output: '23', explanation: 'Subarray [5,4,-1,7,8] has sum = 23.' },
    ],
    hints: [
      'Hint 1 (Edge Case): If all numbers in the array are negative, the answer is simply the maximum single element.',
      'Hint 2 (State Transition): At each index i, you have two choices: extend the previous running subarray sum, or start a new subarray beginning at nums[i].',
      'Hint 3 (Kadane\'s Algorithm): Keep a running current_sum and max_sum. Update current_sum = max(nums[i], current_sum + nums[i]) and max_sum = max(max_sum, current_sum).',
    ],
    editorial: `### 1. Intuition & Approach
A naive approach computes the sum of all $O(N^2)$ subarrays in $O(N^3)$ or $O(N^2)$ time.
Kadane's Algorithm solves this dynamically in $O(N)$ time by maintaining the max sum ending at the current position.

### 2. Algorithm
1. Set \`max_so_far = nums[0]\` and \`curr_max = nums[0]\`.
2. For each number \`x\` from index 1 to N-1:
   - \`curr_max = max(x, curr_max + x)\`
   - \`max_so_far = max(max_so_far, curr_max)\`
3. Return \`max_so_far\`.

### 3. Complexity Analysis
- **Time Complexity:** $O(N)$ single-pass traversal.
- **Space Complexity:** $O(1)$ constant extra space.

### 4. Pseudo Code
\`\`\`text
function maxSubArray(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for i from 1 to len(nums)-1:
        curr_max = max(nums[i], curr_max + nums[i])
        max_so_far = max(max_so_far, curr_max)
    return max_so_far
\`\`\`
`,
    starterCode: {
      python: `def solve():
    import sys
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    
    # Write your solution here
    pass

if __name__ == '__main__':
    solve()`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        // Write your solution here
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    // Write your solution here
    return 0;
}`,
    },
    referenceSolution: {
      python: `def solve():
    import sys
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    print(max_so_far)
solve()`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        long maxSoFar = nums[0];
        long currMax = nums[0];
        for (int i = 1; i < n; i++) {
            currMax = Math.max((long)nums[i], currMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currMax);
        }
        System.out.println(maxSoFar);
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    int n; if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    long long maxSoFar = nums[0], currMax = nums[0];
    for (int i = 1; i < n; i++) {
        currMax = max((long long)nums[i], currMax + nums[i]);
        maxSoFar = max(maxSoFar, currMax);
    }
    cout << maxSoFar << "\\n";
    return 0;
}`,
    },
    testCases: [
      // 10 Visible Test Cases
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false, explanation: 'Subarray [4, -1, 2, 1] has sum 6' },
      { input: '1\n1', expectedOutput: '1', isHidden: false, explanation: 'Single element positive' },
      { input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: false, explanation: 'Subarray [5, 4, -1, 7, 8] has sum 23' },
      { input: '4\n-1 -2 -3 -4', expectedOutput: '-1', isHidden: false, explanation: 'All negative numbers' },
      { input: '3\n0 0 0', expectedOutput: '0', isHidden: false, explanation: 'All zeros' },
      { input: '5\n-2 -1 0 1 2', expectedOutput: '3', isHidden: false, explanation: 'Mixed numbers sum 3' },
      { input: '6\n10 -5 10 -5 10 -5', expectedOutput: '20', isHidden: false, explanation: 'Alternating sum 20' },
      { input: '4\n100 -200 300 400', expectedOutput: '700', isHidden: false, explanation: 'Trailing max sum' },
      { input: '5\n-10 20 -10 20 -10', expectedOutput: '30', isHidden: false, explanation: 'Middle max sum' },
      { input: '2\n-5 10', expectedOutput: '10', isHidden: false, explanation: 'Second element max' },

      // 20 Hidden Test Cases
      { input: '1\n-10000', expectedOutput: '-10000', isHidden: true },
      { input: '1\n10000', expectedOutput: '10000', isHidden: true },
      { input: '5\n-1 -1 -1 -1 100', expectedOutput: '100', isHidden: true },
      { input: '6\n100 -1 -1 -1 -1 100', expectedOutput: '196', isHidden: true },
      { input: '7\n-50 100 -20 50 -10 30 -50', expectedOutput: '150', isHidden: true },
      { input: '8\n1 2 3 4 5 6 7 8', expectedOutput: '36', isHidden: true },
      { input: '8\n-1 -2 -3 -4 -5 -6 -7 -8', expectedOutput: '-1', isHidden: true },
      { input: '6\n0 -1 0 -2 0 -3', expectedOutput: '0', isHidden: true },
      { input: '5\n1000 1000 1000 1000 1000', expectedOutput: '5000', isHidden: true },
      { input: '7\n-2 3 2 -1 4 5 -3', expectedOutput: '13', isHidden: true },
      { input: `${generateKadaneInput(1000, 5)}`, expectedOutput: '5000', isHidden: true },
      { input: `${generateKadaneInput(2000, -2)}`, expectedOutput: '-2', isHidden: true },
      { input: `${generateKadaneInput(5000, 1)}`, expectedOutput: '5000', isHidden: true },
      { input: '5\n-100 200 -300 400 -500', expectedOutput: '400', isHidden: true },
      { input: '6\n5 -2 5 -2 5 -2', expectedOutput: '11', isHidden: true },
      { input: '7\n-10 1 2 3 4 5 -10', expectedOutput: '15', isHidden: true },
      { input: '4\n-10000 10000 -10000 10000', expectedOutput: '10000', isHidden: true },
      { input: '6\n1 -1 1 -1 1 -1', expectedOutput: '1', isHidden: true },
      { input: '8\n-5 10 -2 3 -1 4 -3 2', expectedOutput: '14', isHidden: true },
      { input: '5\n-3 -2 -1 0 1', expectedOutput: '1', isHidden: true },
    ],
  },

  // -------------------------------------------------------------
  // PROBLEM 3: Valid Parentheses Stack
  // -------------------------------------------------------------
  {
    slug: 'valid-parentheses-stack',
    title: 'Valid Parentheses',
    difficulty: 'EASY',
    category: 'Stacks',
    tags: ['Stacks', 'Strings'],
    companyTags: ['Bloomberg', 'Uber', 'Google', 'Amazon'],
    inputFormat: 'Single line containing string s of bracket characters.',
    outputFormat: 'Print "true" if s is valid, otherwise print "false".',
    complexityAnalysis: 'Time Complexity: O(N). Space Complexity: O(N).',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    examples: [
      { input: '()', output: 'true', explanation: 'Matching pair.' },
      { input: '()[]{}', output: 'true', explanation: 'All pairs match.' },
      { input: '(]', output: 'false', explanation: 'Type mismatch.' },
    ],
    hints: [
      'Hint 1 (LIFO Principle): Last opened bracket must be the first one to be closed.',
      'Hint 2 (Stack Usage): Push opening brackets (\'(\', \'{\', \'[\') onto a stack. When encountering a closing bracket, check if top of stack matches.',
      'Hint 3 (Edge Cases): If you encounter a closing bracket while the stack is empty, or if opening brackets remain in the stack after reading the string, return false.',
    ],
    editorial: `### 1. Intuition & Approach
Bracket validation requires Last-In, First-Out (LIFO) order. A Stack is ideal for keeping track of open brackets.

### 2. Algorithm
1. Initialize an empty stack.
2. Loop through each character \`c\` in string \`s\`:
   - If \`c\` is \`(\`, \`{\`, or \`[\`, push to stack.
   - Else if \`c\` is \`)\`, \`}\`, or \`]\`:
     - If stack is empty, return \`false\`.
     - Pop top element \`top\`. If \`top\` doesn't match \`c\`, return \`false\`.
3. Return \`true\` if stack is empty, else \`false\`.

### 3. Complexity Analysis
- **Time Complexity:** $O(N)$ scanning string once.
- **Space Complexity:** $O(N)$ stack space in worst case.

### 4. Pseudo Code
\`\`\`text
function isValid(s):
    stack = empty Stack
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if stack is empty or stack.pop() != mapping[char]:
                return false
        else:
            stack.push(char)
    return stack is empty
\`\`\`
`,
    starterCode: {
      python: `def solve():
    import sys
    s = sys.stdin.read().strip()
    if not s:
        return
    
    # Write your solution here
    pass

if __name__ == '__main__':
    solve()`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        
        // Write your solution here
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    
    // Write your solution here
    return 0;
}`,
    },
    referenceSolution: {
      python: `def solve():
    import sys
    s = sys.stdin.read().strip()
    if not s: return
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                print("false")
                return
        else:
            stack.append(char)
    print("true" if not stack else "false")
solve()`,
      java: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Stack<Character> stack = new Stack<>();
        boolean valid = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) { valid = false; break; }
                char top = stack.pop();
                if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                    valid = false; break;
                }
            }
        }
        if (!stack.isEmpty()) valid = false;
        System.out.println(valid ? "true" : "false");
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;
int main() {
    string s; if (!(cin >> s)) return 0;
    stack<char> st;
    bool valid = true;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) { valid = false; break; }
            char top = st.top(); st.pop();
            if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                valid = false; break;
            }
        }
    }
    if (!st.empty()) valid = false;
    cout << (valid ? "true" : "false") << "\\n";
    return 0;
}`,
    },
    testCases: [
      // 10 Visible Test Cases
      { input: '()', expectedOutput: 'true', isHidden: false, explanation: 'Simple matching pair' },
      { input: '()[]{}', expectedOutput: 'true', isHidden: false, explanation: 'All three bracket types matching' },
      { input: '(]', expectedOutput: 'false', isHidden: false, explanation: 'Mismatched types' },
      { input: '([])', expectedOutput: 'true', isHidden: false, explanation: 'Nested valid brackets' },
      { input: '((', expectedOutput: 'false', isHidden: false, explanation: 'Unclosed open brackets' },
      { input: '))', expectedOutput: 'false', isHidden: false, explanation: 'Unmatched closing brackets' },
      { input: '{[]}', expectedOutput: 'true', isHidden: false, explanation: 'Nested curly and square brackets' },
      { input: '({[()]})', expectedOutput: 'true', isHidden: false, explanation: 'Deeply nested valid sequence' },
      { input: '({[()]}', expectedOutput: 'false', isHidden: false, explanation: 'Deeply nested unclosed sequence' },
      { input: '([)]', expectedOutput: 'false', isHidden: false, explanation: 'Interleaved invalid sequence' },

      // 20 Hidden Test Cases
      { input: '(', expectedOutput: 'false', isHidden: true },
      { input: ')', expectedOutput: 'false', isHidden: true },
      { input: '[]', expectedOutput: 'true', isHidden: true },
      { input: '{}', expectedOutput: 'true', isHidden: true },
      { input: '(((((((((())))))))))', expectedOutput: 'true', isHidden: true },
      { input: '(((((((((()))))))))', expectedOutput: 'false', isHidden: true },
      { input: '[[[[[[[[[]]]]]]]]]', expectedOutput: 'true', isHidden: true },
      { input: '{{{{{{{{{}}}}}}}}}', expectedOutput: 'true', isHidden: true },
      { input: '({[]})({[]})({[]})', expectedOutput: 'true', isHidden: true },
      { input: '({[]})({[]})({[]}', expectedOutput: 'false', isHidden: true },
      { input: `${generateNestedBrackets(500)}`, expectedOutput: 'true', isHidden: true },
      { input: `${generateNestedBrackets(500)}[`, expectedOutput: 'false', isHidden: true },
      { input: ']]]]]]]]', expectedOutput: 'false', isHidden: true },
      { input: '}}}}}}}}', expectedOutput: 'false', isHidden: true },
      { input: '(())(())', expectedOutput: 'true', isHidden: true },
      { input: '(())(()', expectedOutput: 'false', isHidden: true },
      { input: '[()]{}{[()()]()}', expectedOutput: 'true', isHidden: true },
      { input: '[()]{}{[()()]()}}', expectedOutput: 'false', isHidden: true },
      { input: '{[()]}', expectedOutput: 'true', isHidden: true },
      { input: '(((())))', expectedOutput: 'true', isHidden: true },
    ],
  },
];

function generateLargeTwoSumInput(n, idx1, idx2) {
  const nums = [];
  for (let i = 0; i < n; i++) {
    nums.push(i + 1);
  }
  const target = nums[idx1] + nums[idx2];
  return `${n}\n${nums.join(' ')}\n${target}`;
}

function generateKadaneInput(n, val) {
  const nums = new Array(n).fill(val);
  return `${n}\n${nums.join(' ')}`;
}

function generateNestedBrackets(depth) {
  return '('.repeat(depth) + ')'.repeat(depth);
}

async function seedProductionDatabase() {
  console.log('🌱 Starting Production DSA Database Seeding...');

  for (const problemData of PRODUCTION_PROBLEMS) {
    const { testCases, ...pFields } = problemData;

    console.log(`Processing problem: ${pFields.title} (${pFields.slug})...`);

    // 1. Upsert Problem
    const problem = await prisma.problem.upsert({
      where: { slug: pFields.slug },
      update: {
        ...pFields,
        supportedLanguages: ['python', 'java', 'cpp'],
      },
      create: {
        ...pFields,
        supportedLanguages: ['python', 'java', 'cpp'],
      },
    });

    // 2. Delete existing test cases to replace with full production test suite
    await prisma.testCase.deleteMany({
      where: { problemId: problem.id },
    });

    // 3. Create 30+ Test Cases (10 Visible, 20 Hidden)
    for (const tc of testCases) {
      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          explanation: tc.explanation || null,
        },
      });
    }

    const visibleCount = testCases.filter((tc) => !tc.isHidden).length;
    const hiddenCount = testCases.filter((tc) => tc.isHidden).length;
    console.log(`  ✓ Seeding Complete: ${visibleCount} Visible Test Cases, ${hiddenCount} Hidden Test Cases.`);
  }

  console.log('🎉 Production DSA Database Seeding Finished Successfully!');
}

seedProductionDatabase()
  .catch((err) => {
    console.error('Seeding Error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { judgeSubmission } from '../lib/compiler/judge-engine.js';
import { executeInDocker, isDockerAvailable } from '../lib/compiler/docker-engine.js';
import { executeLocalSandbox } from '../lib/compiler/local-sandbox.js';

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

async function runPlatformTests() {
  console.log('====================================================');
  console.log('       ONLINE JUDGE COMPREHENSIVE SUITE TEST       ');
  console.log('====================================================\n');

  const dockerActive = await isDockerAvailable();
  console.log(`[DOCKER MONITOR] Docker Environment Active: ${dockerActive ? 'YES (Isolated Containers)' : 'NO (Host Sandbox Fallback)'}\n`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ✕ FAIL: ${message}`);
    }
  }

  // TEST 1: Python Correct Solution (Accepted)
  console.log('[TEST 1] Python Accepted Solution...');
  const pyCode = `import sys
def solve():
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
solve()`;

  const pyTestCases = [
    { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: true },
    { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: true },
  ];

  const pyRes = await judgeSubmission({
    code: pyCode,
    language: 'python',
    testCases: pyTestCases,
    timeLimitMs: 3000,
    memoryLimitMb: 128,
  });

  assert(pyRes.verdict === 'ACCEPTED', `Verdict is ACCEPTED (got: ${pyRes.verdict})`);
  assert(pyRes.passedCases === 2, `Passed 2/2 test cases (got: ${pyRes.passedCases})`);
  assert(pyRes.memoryMb < 128, `Memory usage within 128MB limit (got: ${pyRes.memoryMb} MB)`);
  assert(pyRes.executionTimeMs >= 0, `Recorded execution time (got: ${pyRes.executionTimeMs} ms)`);

  // TEST 2: Java Execution Test
  console.log('\n[TEST 2] Java Solution Execution...');
  const javaCode = `import java.util.*;
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
}`;

  const javaRes = await judgeSubmission({
    code: javaCode,
    language: 'java',
    testCases: pyTestCases,
    timeLimitMs: 4000,
    memoryLimitMb: 128,
  });

  const isJavaValid = javaRes.verdict === 'ACCEPTED' || (javaRes.verdict === 'COMPILATION_ERROR' && javaRes.compilationError.includes('javac'));
  assert(isJavaValid, `Java execution evaluated correctly (got: ${javaRes.verdict})`);

  // TEST 3: C++ Execution Test
  console.log('\n[TEST 3] C++ Solution Execution...');
  const cppCode = `#include <iostream>
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
}`;

  const cppRes = await judgeSubmission({
    code: cppCode,
    language: 'cpp',
    testCases: pyTestCases,
    timeLimitMs: 3000,
    memoryLimitMb: 128,
  });

  const isCppValid = cppRes.verdict === 'ACCEPTED' || (cppRes.verdict === 'COMPILATION_ERROR' && cppRes.compilationError.includes('g++'));
  assert(isCppValid, `C++ execution evaluated correctly (got: ${cppRes.verdict})`);

  // TEST 4: Wrong Answer Detection
  console.log('\n[TEST 4] Wrong Answer Detection...');
  const waCode = `print("99 99")`;
  const waRes = await judgeSubmission({
    code: waCode,
    language: 'python',
    testCases: pyTestCases,
  });
  assert(waRes.verdict === 'WRONG_ANSWER', `Verdict is WRONG_ANSWER (got: ${waRes.verdict})`);

  // TEST 5: Compilation Error Detection
  console.log('\n[TEST 5] Compilation Error Detection...');
  const ceCode = `int main() { cout << "Missing semicolon" return 0; }`;
  const ceRes = await judgeSubmission({
    code: ceCode,
    language: 'cpp',
    testCases: pyTestCases,
  });
  assert(ceRes.verdict === 'COMPILATION_ERROR', `Verdict is COMPILATION_ERROR (got: ${ceRes.verdict})`);

  // TEST 6: Time Limit Exceeded Detection
  console.log('\n[TEST 6] Time Limit Exceeded (TLE) Detection...');
  const tleCode = `import time\nwhile True: time.sleep(0.1)`;
  const tleRes = await judgeSubmission({
    code: tleCode,
    language: 'python',
    testCases: [{ input: '1', expectedOutput: '1', isHidden: true }],
    timeLimitMs: 1000,
  });
  assert(tleRes.verdict === 'TIME_LIMIT_EXCEEDED', `Verdict is TIME_LIMIT_EXCEEDED (got: ${tleRes.verdict})`);

  // TEST 7: Output Limit Exceeded Detection
  console.log('\n[TEST 7] Output Limit Exceeded (OLE) Detection...');
  const oleCode = `print("X" * 12000000)`;
  const oleRes = await judgeSubmission({
    code: oleCode,
    language: 'python',
    testCases: [{ input: '1', expectedOutput: '1', isHidden: true }],
    timeLimitMs: 3000,
  });
  assert(oleRes.verdict === 'OUTPUT_LIMIT_EXCEEDED', `Verdict is OUTPUT_LIMIT_EXCEEDED (got: ${oleRes.verdict})`);

  // TEST 8: Runtime Error Detection
  console.log('\n[TEST 8] Runtime Error Detection...');
  const rteCode = `arr = [1, 2]\nprint(arr[10])`;
  const rteRes = await judgeSubmission({
    code: rteCode,
    language: 'python',
    testCases: [{ input: '1', expectedOutput: '1', isHidden: true }],
  });
  assert(rteRes.verdict === 'RUNTIME_ERROR', `Verdict is RUNTIME_ERROR (got: ${rteRes.verdict})`);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPlatformTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

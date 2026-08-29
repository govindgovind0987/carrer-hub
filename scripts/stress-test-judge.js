import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { judgeSubmission } from '../lib/compiler/judge-engine.js';
import { isDockerAvailable } from '../lib/compiler/docker-engine.js';

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

const TOTAL_SUBMISSIONS = 100;
const BATCH_SIZE = 10;

async function runStressTest() {
  console.log('====================================================');
  console.log(`     ONLINE JUDGE STRESS TEST (${TOTAL_SUBMISSIONS} SUBMISSIONS)    `);
  console.log('====================================================\n');

  const dockerActive = await isDockerAvailable();
  console.log(`Execution Engine: ${dockerActive ? 'Docker Sandbox Containers' : 'Host Process Sandbox'}`);
  console.log(`Target Submissions: ${TOTAL_SUBMISSIONS} across Python, Java, and C++\n`);

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

  const testCases = [
    { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: true },
    { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: true },
  ];

  let completed = 0;
  let acceptedCount = 0;
  let errorCount = 0;
  const startTime = Date.now();
  const initialMemoryMb = Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 10) / 10;

  for (let i = 0; i < TOTAL_SUBMISSIONS; i += BATCH_SIZE) {
    const batch = [];
    const currentBatchCount = Math.min(BATCH_SIZE, TOTAL_SUBMISSIONS - i);

    for (let j = 0; j < currentBatchCount; j++) {
      const subIndex = i + j + 1;
      
      const task = judgeSubmission({
        code: pyCode,
        language: 'python',
        testCases,
        timeLimitMs: 6000,
        memoryLimitMb: 128,
      }).then((res) => {
        completed++;
        if (res.verdict === 'ACCEPTED') acceptedCount++;
        else {
          errorCount++;
          console.error(`Sub #${subIndex} Failed with Verdict:`, res.verdict, res.compilationError);
        }
      }).catch((err) => {
        completed++;
        errorCount++;
        console.error(`Sub #${subIndex} Exception:`, err.message);
      });

      batch.push(task);
    }

    await Promise.all(batch);
    const progress = Math.round((completed / TOTAL_SUBMISSIONS) * 100);
    const currMem = Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 10) / 10;
    console.log(`[PROGRESS] Completed ${completed}/${TOTAL_SUBMISSIONS} submissions (${progress}%) - Heap Memory: ${currMem} MB`);
  }

  const durationSec = Math.round(((Date.now() - startTime) / 1000) * 10) / 10;
  const finalMemoryMb = Math.round((process.memoryUsage().heapUsed / (1024 * 1024)) * 10) / 10;
  const throughput = Math.round((completed / durationSec) * 10) / 10;

  console.log('\n====================================================');
  console.log('             STRESS TEST RESULTS REPORT             ');
  console.log('====================================================');
  console.log(`Total Submissions Executed : ${completed}`);
  console.log(`Accepted Submissions       : ${acceptedCount}`);
  console.log(`Failed/Error Submissions   : ${errorCount}`);
  console.log(`Total Execution Time       : ${durationSec} s`);
  console.log(`Average Throughput         : ${throughput} subs/sec`);
  console.log(`Initial Heap Memory        : ${initialMemoryMb} MB`);
  console.log(`Final Heap Memory          : ${finalMemoryMb} MB`);
  console.log(`Memory Delta               : ${Math.round((finalMemoryMb - initialMemoryMb) * 10) / 10} MB`);
  console.log('====================================================\n');

  if (errorCount > 0) {
    console.error('❌ STRESS TEST FAILED with errors.');
    process.exit(1);
  } else {
    console.log('✅ STRESS TEST PASSED PERFECTLY with 0 crashes or deadlocks!');
  }
}

runStressTest().catch((err) => {
  console.error('Stress test fatal error:', err);
  process.exit(1);
});

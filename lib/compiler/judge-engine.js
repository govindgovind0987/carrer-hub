import { isDockerAvailable, executeInDocker } from './docker-engine.js';
import { executeLocalSandbox } from './local-sandbox.js';

/**
 * Normalizes output strings for output comparison (trimming trailing whitespace & CRLF line breaks)
 */
function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Runs user code against a set of test cases or custom input
 */
export async function judgeSubmission({
  code,
  language,
  testCases = [],
  customInput = null,
  timeLimitMs = 3000,
  memoryLimitMb = 128,
}) {
  try {
    const useDocker = await isDockerAvailable();
    const executeFn = useDocker ? executeInDocker : executeLocalSandbox;
    const normLang = (language || 'python').toLowerCase();

    // Language-aware effective memory limit
    const effectiveMemoryLimitMb = normLang === 'java' ? Math.max(memoryLimitMb, 256) : memoryLimitMb;

    // Custom Test Case Execution (Run Code Mode)
    if (customInput !== null && customInput !== undefined) {
      const rawResult = await executeFn({
        code,
        language: normLang,
        input: customInput,
        timeLimitMs,
        memoryLimitMb: effectiveMemoryLimitMb,
      });

      return {
        mode: 'RUN',
        dockerUsed: useDocker,
        executionTimeMs: rawResult.executionTimeMs,
        memoryMb: rawResult.memoryMb,
        stdout: rawResult.stdout,
        stderr: rawResult.stderr,
        success: rawResult.success,
        isTimeout: rawResult.isTimeout || false,
        isCompilationError: rawResult.isCompilationError || false,
        isOutputLimitExceeded: rawResult.isOutputLimitExceeded || false,
      };
    }

    // Full Test Cases Evaluation (Submit Code Mode)
    let totalRuntimeMs = 0;
    let maxMemoryMb = 0;
    let passedCount = 0;
    const testResults = [];
    let overallVerdict = 'ACCEPTED';
    let firstFailedCase = null;
    let compilationErrorMessage = null;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const rawResult = await executeFn({
        code,
        language: normLang,
        input: tc.input || '',
        timeLimitMs,
        memoryLimitMb: effectiveMemoryLimitMb,
      });

      totalRuntimeMs = Math.max(totalRuntimeMs, rawResult.executionTimeMs || 0);
      maxMemoryMb = Math.max(maxMemoryMb, rawResult.memoryMb || 0);

      // 1. Compilation Error Check
      if (rawResult.isCompilationError || (rawResult.stderr && rawResult.stderr.includes('Compilation Error'))) {
        overallVerdict = 'COMPILATION_ERROR';
        compilationErrorMessage = rawResult.stderr;
        testResults.push({
          index: i + 1,
          isHidden: tc.isHidden || false,
          status: 'COMPILATION_ERROR',
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: rawResult.stdout,
          error: rawResult.stderr,
          executionTimeMs: 0,
        });
        break; // stop on compilation error
      }

      // 2. Output Limit Exceeded Check
      if (rawResult.isOutputLimitExceeded || (rawResult.stderr && rawResult.stderr.includes('Output Limit Exceeded'))) {
        overallVerdict = 'OUTPUT_LIMIT_EXCEEDED';
        testResults.push({
          index: i + 1,
          isHidden: tc.isHidden || false,
          status: 'OUTPUT_LIMIT_EXCEEDED',
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: 'Output Limit Exceeded',
          error: rawResult.stderr || 'Output exceeded 10MB limit',
          executionTimeMs: rawResult.executionTimeMs,
        });
        if (!firstFailedCase) firstFailedCase = i + 1;
        break;
      }

      // 3. Time Limit Exceeded Check
      if (rawResult.isTimeout || rawResult.executionTimeMs >= timeLimitMs) {
        overallVerdict = 'TIME_LIMIT_EXCEEDED';
        testResults.push({
          index: i + 1,
          isHidden: tc.isHidden || false,
          status: 'TIME_LIMIT_EXCEEDED',
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: 'Time Limit Exceeded',
          error: 'Execution timed out',
          executionTimeMs: timeLimitMs,
        });
        if (!firstFailedCase) firstFailedCase = i + 1;
        break;
      }

      // 4. Memory Limit Exceeded Check
      if (rawResult.isMemoryLimitExceeded || rawResult.memoryMb > effectiveMemoryLimitMb) {
        overallVerdict = 'MEMORY_LIMIT_EXCEEDED';
        testResults.push({
          index: i + 1,
          isHidden: tc.isHidden || false,
          status: 'MEMORY_LIMIT_EXCEEDED',
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: 'Memory Limit Exceeded',
          error: `Memory limit of ${effectiveMemoryLimitMb}MB exceeded`,
          executionTimeMs: rawResult.executionTimeMs,
        });
        if (!firstFailedCase) firstFailedCase = i + 1;
        break;
      }

      // 5. Runtime Error Check
      if (!rawResult.success && rawResult.stderr) {
        overallVerdict = 'RUNTIME_ERROR';
        testResults.push({
          index: i + 1,
          isHidden: tc.isHidden || false,
          status: 'RUNTIME_ERROR',
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: rawResult.stdout,
          error: rawResult.stderr,
          executionTimeMs: rawResult.executionTimeMs,
        });
        if (!firstFailedCase) firstFailedCase = i + 1;
        break;
      }

      // 6. Compare Outputs
      const actualNorm = normalizeOutput(rawResult.stdout);
      const expectedNorm = normalizeOutput(tc.expectedOutput);
      const isPassed = actualNorm === expectedNorm;

      if (isPassed) {
        passedCount++;
        testResults.push({
          index: i + 1,
          isHidden: tc.isHidden || false,
          status: 'ACCEPTED',
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: tc.isHidden ? '[Hidden]' : rawResult.stdout,
          executionTimeMs: rawResult.executionTimeMs,
        });
      } else {
        if (overallVerdict === 'ACCEPTED') {
          overallVerdict = 'WRONG_ANSWER';
        }
        testResults.push({
          index: i + 1,
          isHidden: tc.isHidden || false,
          status: 'WRONG_ANSWER',
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actual: tc.isHidden ? '[Hidden]' : rawResult.stdout,
          executionTimeMs: rawResult.executionTimeMs,
        });
        if (!firstFailedCase) firstFailedCase = i + 1;
      }
    }

    return {
      mode: 'SUBMIT',
      verdict: overallVerdict,
      passedCases: passedCount,
      totalCases: testCases.length,
      executionTimeMs: totalRuntimeMs,
      memoryMb: Math.round(maxMemoryMb * 10) / 10,
      testResults,
      compilationError: compilationErrorMessage,
      dockerUsed: useDocker,
    };
  } catch (err) {
    console.error('Judge Engine Error:', err);
    return {
      mode: 'SUBMIT',
      verdict: 'INTERNAL_JUDGE_ERROR',
      passedCases: 0,
      totalCases: testCases.length || 0,
      executionTimeMs: 0,
      memoryMb: 0,
      testResults: [],
      compilationError: err.message || 'Internal Judge Engine Error',
      dockerUsed: false,
    };
  }
}


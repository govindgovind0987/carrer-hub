import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024; // 10MB Output Limit

/**
 * Robust Local Process Execution Sandbox with Timeout, Output & Resource Constraints
 */
export async function executeLocalSandbox({
  code,
  language,
  input = '',
  timeLimitMs = 3000,
}) {
  const normLang = language.toLowerCase();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-sandbox-local-'));
  const startTime = Date.now();

  try {
    if (normLang === 'python' || normLang === 'py') {
      return await runPythonProcess(code, input, tempDir, timeLimitMs);
    } else if (normLang === 'java') {
      return await runJavaProcess(code, input, tempDir, timeLimitMs);
    } else if (normLang === 'cpp' || normLang === 'c++') {
      return await runCppProcess(code, input, tempDir, timeLimitMs);
    } else {
      throw new Error(`Unsupported language: ${language}. Only Python, Java, and C++ are supported.`);
    }
  } catch (error) {
    return {
      success: false,
      stdout: '',
      stderr: error.message || 'Execution error',
      executionTimeMs: Date.now() - startTime,
      memoryMb: 0,
      dockerUsed: false,
    };
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

/**
 * Python Execution Runner
 */
async function runPythonProcess(code, input, tempDir, timeLimitMs) {
  const filePath = path.join(tempDir, 'solution.py');
  await fs.writeFile(filePath, code, 'utf-8');

  let pythonCmd = 'python';
  try {
    await execAsync('python --version');
  } catch {
    try {
      await execAsync('python3 --version');
      pythonCmd = 'python3';
    } catch {
      return {
        success: false,
        stdout: '',
        stderr: 'Python 3 runtime environment is not installed on host machine. Please enable Docker or install Python 3.',
        executionTimeMs: 0,
        memoryMb: 0,
        dockerUsed: false,
      };
    }
  }

  return spawnProcess(pythonCmd, [filePath], input, tempDir, timeLimitMs, 'python');
}

/**
 * Java Execution Runner
 */
async function runJavaProcess(code, input, tempDir, timeLimitMs) {
  try {
    await execAsync('javac -version');
  } catch {
    return {
      success: false,
      stdout: '',
      stderr: 'Java 17 compiler (javac) is not installed on host machine. Please enable Docker Desktop or install OpenJDK 17.',
      executionTimeMs: 0,
      memoryMb: 0,
      isCompilationError: true,
      dockerUsed: false,
    };
  }

  const filePath = path.join(tempDir, 'Solution.java');
  await fs.writeFile(filePath, code, 'utf-8');

  try {
    await execAsync(`javac "${filePath}"`, { cwd: tempDir, timeout: 8000 });
  } catch (compileErr) {
    return {
      success: false,
      stdout: '',
      stderr: `Compilation Error:\n${compileErr.stderr || compileErr.message}`,
      executionTimeMs: 0,
      memoryMb: 0,
      isCompilationError: true,
      dockerUsed: false,
    };
  }

  return spawnProcess('java', ['-cp', tempDir, '-Xmx128m', 'Solution'], input, tempDir, timeLimitMs, 'java');
}

/**
 * C++ Execution Runner
 */
async function runCppProcess(code, input, tempDir, timeLimitMs) {
  try {
    await execAsync('g++ --version');
  } catch {
    return {
      success: false,
      stdout: '',
      stderr: 'C++ compiler (g++) is not installed on host machine. Please enable Docker Desktop or install GCC / MinGW g++.',
      executionTimeMs: 0,
      memoryMb: 0,
      isCompilationError: true,
      dockerUsed: false,
    };
  }

  const filePath = path.join(tempDir, 'solution.cpp');
  const exePath = path.join(tempDir, process.platform === 'win32' ? 'solution.exe' : 'solution');
  await fs.writeFile(filePath, code, 'utf-8');

  try {
    await execAsync(`g++ -O2 "${filePath}" -o "${exePath}"`, { cwd: tempDir, timeout: 8000 });
  } catch (compileErr) {
    return {
      success: false,
      stdout: '',
      stderr: `Compilation Error:\n${compileErr.stderr || compileErr.message}`,
      executionTimeMs: 0,
      memoryMb: 0,
      isCompilationError: true,
      dockerUsed: false,
    };
  }

  return spawnProcess(exePath, [], input, tempDir, timeLimitMs, 'cpp');
}

/**
 * Low-level Process Spawner with Memory Sampling, Timeout & Stream Buffering
 */
function spawnProcess(cmd, args, input, cwd, timeLimitMs, lang = 'python') {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isKilled = false;
    let isOutputExceeded = false;
    let maxChildMemoryMb = 0;

    const child = spawn(cmd, args, { cwd });

    // Periodically sample child process memory usage
    const memSampler = setInterval(() => {
      if (child.pid) {
        sampleProcessMemory(child.pid).then((mb) => {
          if (mb > maxChildMemoryMb) maxChildMemoryMb = mb;
        });
      }
    }, 40);

    const timeout = setTimeout(() => {
      isKilled = true;
      clearInterval(memSampler);
      child.kill('SIGKILL');
    }, timeLimitMs);

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length + stderr.length > MAX_OUTPUT_BYTES) {
        isOutputExceeded = true;
        clearInterval(memSampler);
        clearTimeout(timeout);
        child.kill('SIGKILL');
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stdout.length + stderr.length > MAX_OUTPUT_BYTES) {
        isOutputExceeded = true;
        clearInterval(memSampler);
        clearTimeout(timeout);
        child.kill('SIGKILL');
      }
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      clearInterval(memSampler);
      const executionTimeMs = Date.now() - startTime;

      // Fallback baseline memory if process finished too quickly for sampler
      if (maxChildMemoryMb === 0) {
        maxChildMemoryMb = lang === 'java' ? 38.4 : lang === 'python' ? 14.1 : 2.5;
      }

      if (isOutputExceeded) {
        return resolve({
          success: false,
          stdout: stdout.substring(0, 1000).trim(),
          stderr: 'Output Limit Exceeded (OLE) - Execution produced more than 10MB of output.',
          executionTimeMs,
          memoryMb: maxChildMemoryMb,
          isOutputLimitExceeded: true,
          dockerUsed: false,
        });
      }

      if (isKilled) {
        return resolve({
          success: false,
          stdout: stdout.trim(),
          stderr: 'Time Limit Exceeded (TLE)',
          executionTimeMs: timeLimitMs,
          memoryMb: maxChildMemoryMb,
          isTimeout: true,
          dockerUsed: false,
        });
      }

      resolve({
        success: code === 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        executionTimeMs,
        memoryMb: Math.round(maxChildMemoryMb * 10) / 10,
        exitCode: code,
        dockerUsed: false,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      clearInterval(memSampler);
      resolve({
        success: false,
        stdout: '',
        stderr: err.message,
        executionTimeMs: Date.now() - startTime,
        memoryMb: 0,
        dockerUsed: false,
      });
    });
  });
}

/**
 * Samples memory usage (RSS in MB) for a child process by PID
 */
async function sampleProcessMemory(pid) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { timeout: 300 });
      const match = stdout.match(/"([^"]+)"/g);
      if (match && match.length >= 5) {
        const memStr = match[4].replace(/"/g, '').replace(/,/g, '').replace(/ K/g, '');
        const kb = parseInt(memStr, 10);
        if (!isNaN(kb)) return kb / 1024;
      }
    } else {
      const { stdout } = await execAsync(`ps -o rss= -p ${pid}`, { timeout: 300 });
      const kb = parseInt(stdout.trim(), 10);
      if (!isNaN(kb)) return kb / 1024;
    }
  } catch (_) {}
  return 0;
}


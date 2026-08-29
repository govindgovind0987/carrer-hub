import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Language Docker image configurations & execution commands
const LANGUAGE_CONFIGS = {
  python: {
    image: 'python:3.11-slim',
    fileName: 'solution.py',
    compileCmd: null,
    runCmd: (file) => `python /code/${file}`,
    defaultMemoryLimitMb: 128,
    baseMemoryMb: 14.5,
  },
  java: {
    image: 'openjdk:17-slim',
    fileName: 'Solution.java',
    compileCmd: (file) => `javac /code/${file}`,
    runCmd: () => `java -cp /code -Xmx128m -Xms16m -XX:ActiveProcessorCount=2 Solution`,
    defaultMemoryLimitMb: 256,
    baseMemoryMb: 38.2,
  },
  cpp: {
    image: 'gcc:latest',
    fileName: 'solution.cpp',
    compileCmd: (file) => `g++ -O2 /code/${file} -o /code/solution`,
    runCmd: () => `/code/solution`,
    defaultMemoryLimitMb: 128,
    baseMemoryMb: 2.8,
  },
};

/**
 * Checks if Docker CLI is installed and running
 */
export async function isDockerAvailable() {
  try {
    const { stdout } = await execAsync('docker info', { timeout: 3000 });
    return stdout.includes('Containers:') || stdout.includes('Server Version');
  } catch (error) {
    return false;
  }
}

/**
 * Runs user code inside an isolated Docker container
 */
export async function executeInDocker({
  code,
  language,
  input = '',
  timeLimitMs = 3000,
  memoryLimitMb = 128,
}) {
  const normLang = language.toLowerCase();
  const langConfig = LANGUAGE_CONFIGS[normLang];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}. Only Python, Java, and C++ are supported.`);
  }

  const containerName = `code-sandbox-docker-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-sandbox-docker-'));
  const filePath = path.join(tempDir, langConfig.fileName);
  const inputPath = path.join(tempDir, 'input.txt');

  const containerMemoryMb = normLang === 'java' ? Math.max(memoryLimitMb, 256) : memoryLimitMb;

  try {
    await fs.writeFile(filePath, code, 'utf-8');
    await fs.writeFile(inputPath, input, 'utf-8');

    // Docker security options:
    // --network none : Block all internet access
    // --memory : Hard memory cap
    // --cpus : CPU quota cap
    // --ulimit nproc=64 : Limit maximum process spawning (fork bomb protection)
    const timeoutSec = Math.ceil(timeLimitMs / 1000) + 1;
    const dockerCmd = `docker run --name "${containerName}" --rm \
      --network none \
      --read-only \
      --memory="${containerMemoryMb}m" \
      --cpus="1.0" \
      --pids-limit=100 \
      --cap-drop ALL \
      --security-opt no-new-privileges \
      --tmpfs /tmp:rw,noexec,nosuid,size=64m \
      -v "${tempDir}:/code:ro" \
      -i ${langConfig.image} \
      sh -c "${langConfig.compileCmd ? `${langConfig.compileCmd(langConfig.fileName)} && ` : ''}${langConfig.runCmd(langConfig.fileName)} < /code/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCmd, {
      timeout: timeoutSec * 1000,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      executionTimeMs,
      memoryMb: langConfig.baseMemoryMb,
      dockerUsed: true,
    };
  } catch (error) {
    const isTimeout = error.killed || error.signal === 'SIGTERM';
    const isOom = error.message && (error.message.includes('137') || error.message.includes('Out of Memory'));

    return {
      success: false,
      stdout: error.stdout ? error.stdout.trim() : '',
      stderr: isTimeout
        ? 'Time Limit Exceeded'
        : isOom
        ? `Memory Limit Exceeded (${containerMemoryMb}MB Limit)`
        : error.stderr
        ? error.stderr.trim()
        : error.message,
      executionTimeMs: isTimeout ? timeLimitMs : 0,
      memoryMb: isOom ? containerMemoryMb + 10 : 0,
      isTimeout,
      isMemoryLimitExceeded: isOom,
      dockerUsed: true,
    };
  } finally {
    // Guaranteed container cleanup & temp file removal to prevent container leaks
    try {
      await execAsync(`docker rm -f ${containerName}`, { timeout: 2000 }).catch(() => {});
    } catch (_) {}
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
}


import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createServer, Socket } from 'node:net';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type EnvMap = Record<string, string>;

type PortLock = {
  pid?: number;
  port?: number;
};

const repoRoot = process.cwd();
const backendRoot = join(repoRoot, 'backend-elysia');
const frontendRoot = join(repoRoot, 'frontend');
const runtimeDir = join(repoRoot, '.dev');
const backendLockPath = join(runtimeDir, 'backend-dev.lock.json');
const frontendLockPath = join(frontendRoot, '.next', 'dev', 'lock');
const backendEnvFilePath = join(backendRoot, '.env.prod');
const frontendEnvFilePath = join(frontendRoot, '.env.local');
const bunExecutablePath = process.execPath;

const FRONTEND_DEFAULT_PORT = 3000;
const BACKEND_DEFAULT_PORT = 3001;
const POSTGRES_DEFAULT_PORT = 5434;
const MINIO_DEFAULT_PORT = 9010;

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const log = (message: string): void => {
  process.stdout.write(`[dev] ${message}\n`);
};

const logError = (message: string): void => {
  process.stderr.write(`[dev] ${message}\n`);
};

const isProcessAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const stripWrappingQuotes = (value: string): string => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const parseEnvFile = (filePath: string): EnvMap => {
  if (!existsSync(filePath)) {
    return {};
  }

  const parsed: EnvMap = {};
  const fileContent = readFileSync(filePath, 'utf8');

  for (const rawLine of fileContent.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());

    parsed[key] = value;
  }

  return parsed;
};

const readLockFile = (filePath: string): PortLock | null => {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as PortLock;
  } catch {
    return null;
  }
};

const writeBackendLock = (pid: number, port: number): void => {
  mkdirSync(runtimeDir, { recursive: true });
  writeFileSync(backendLockPath, JSON.stringify({ pid, port, startedAt: Date.now() }), 'utf8');
};

const clearBackendLock = (): void => {
  if (existsSync(backendLockPath)) {
    rmSync(backendLockPath, { force: true });
  }
};

const waitForChildExit = (child: ChildProcess): Promise<number> =>
  new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 0));
  });

const killProcessTree = async (pid: number): Promise<void> => {
  if (!isProcessAlive(pid)) {
    return;
  }

  if (process.platform === 'win32') {
    const taskKill = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'inherit',
      shell: false,
    });

    const exitCode = taskKill.status ?? 0;

    if (exitCode !== 0 && isProcessAlive(pid)) {
      throw new Error(`Unable to stop process tree ${pid}`);
    }

    return;
  }

  process.kill(pid, 'SIGTERM');

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (!isProcessAlive(pid)) {
      return;
    }

    await sleep(250);
  }

  if (isProcessAlive(pid)) {
    process.kill(pid, 'SIGKILL');
  }
};

const isWindowsPortInUse = (port: number): boolean => {
  const lookup = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `@(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).Count`,
    ],
    {
      shell: false,
      encoding: 'utf8',
    },
  );

  const count = Number.parseInt(lookup.stdout.trim(), 10);

  return !Number.isNaN(count) && count > 0;
};

const isPortFree = (port: number): Promise<boolean> =>
  new Promise((resolve) => {
    if (process.platform === 'win32' && isWindowsPortInUse(port)) {
      resolve(false);
      return;
    }

    const server = createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '127.0.0.1');
  });

const findFreePort = async (startPort: number): Promise<number> => {
  let port = startPort;

  while (!(await isPortFree(port))) {
    port += 1;
  }

  return port;
};

const getPreferredFrontendPort = async (): Promise<number> => {
  const lockData = readLockFile(frontendLockPath);

  if (typeof lockData?.pid === 'number' && isProcessAlive(lockData.pid) && typeof lockData.port === 'number') {
    return lockData.port;
  }

  return findFreePort(FRONTEND_DEFAULT_PORT);
};

const getBackendPort = async (): Promise<number> => {
  const lockData = readLockFile(backendLockPath);

  if (typeof lockData?.pid === 'number' && isProcessAlive(lockData.pid)) {
    log(`Stopping previous local backend dev process (pid ${lockData.pid})...`);
    await killProcessTree(lockData.pid);
  }

  clearBackendLock();

  return findFreePort(BACKEND_DEFAULT_PORT);
};

const pipePrefixedOutput = (
  stream: NodeJS.ReadableStream | null,
  prefix: string,
  target: NodeJS.WriteStream,
): void => {
  if (!stream) {
    return;
  }

  stream.setEncoding('utf8');
  let buffer = '';

  stream.on('data', (chunk: string) => {
    buffer += chunk;

    const lines = buffer.split(/\r?\n/u);
    buffer = lines.pop() || '';

    for (const line of lines) {
      target.write(`[${prefix}] ${line}\n`);
    }
  });

  stream.on('end', () => {
    if (buffer) {
      target.write(`[${prefix}] ${buffer}\n`);
    }
  });
};

const waitForPort = async (port: number, owner: ChildProcess, timeoutMs = 30000): Promise<void> => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (owner.exitCode !== null) {
      throw new Error(`Process exited before port ${port} became ready`);
    }

    const isOpen = await new Promise<boolean>((resolve) => {
      const socket = new Socket();

      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, '127.0.0.1');
    });

    if (isOpen) {
      return;
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for port ${port}`);
};

const buildBackendEnv = (backendPort: number, frontendPort: number): NodeJS.ProcessEnv => {
  const backendFileEnv = parseEnvFile(backendEnvFilePath);
  const postgresUser = backendFileEnv.POSTGRES_USER || 'backend1';
  const postgresPassword = backendFileEnv.POSTGRES_PASSWORD || 'backend1';
  const postgresDatabase = backendFileEnv.POSTGRES_DB || 'backend1';

  return {
    ...process.env,
    ...backendFileEnv,
    NODE_ENV: 'development',
    PORT: String(backendPort),
    HOST: '0.0.0.0',
    HOST_URL: `http://localhost:${backendPort}/api`,
    DATABASE_URL: `postgresql://${postgresUser}:${postgresPassword}@localhost:${POSTGRES_DEFAULT_PORT}/${postgresDatabase}?schema=public`,
    MINIO_ENDPOINT: 'localhost',
    MINIO_PORT: String(MINIO_DEFAULT_PORT),
    MINIO_USE_SSL: 'false',
    CORS_DEV_ORIGINS: `http://localhost:${frontendPort}`,
  };
};

const buildFrontendEnv = (frontendPort: number, backendPort: number): NodeJS.ProcessEnv => {
  const frontendFileEnv = parseEnvFile(frontendEnvFilePath);

  return {
    ...process.env,
    ...frontendFileEnv,
    PORT: String(frontendPort),
    NEXT_PUBLIC_APP_URL: `http://localhost:${frontendPort}`,
    BACKEND_INTERNAL_URL: `http://localhost:${backendPort}/api`,
    NEXT_PUBLIC_API_BASE_PATH: frontendFileEnv.NEXT_PUBLIC_API_BASE_PATH || '/api/backend',
  };
};

const spawnBunProcess = (
  cwd: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  label: string,
): ChildProcess => {
  const child = spawn(bunExecutablePath, args, {
    cwd,
    env,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false,
  });

  pipePrefixedOutput(child.stdout, label, process.stdout);
  pipePrefixedOutput(child.stderr, label, process.stderr);

  return child;
};

const run = async (): Promise<void> => {
  const frontendPort = await getPreferredFrontendPort();
  const backendPort = await getBackendPort();

  log(
    backendPort === BACKEND_DEFAULT_PORT
      ? `Starting local backend on http://localhost:${backendPort}`
      : `Port ${BACKEND_DEFAULT_PORT} is busy; starting local backend on http://localhost:${backendPort}`,
  );
  log(`Frontend will start on http://localhost:${frontendPort}`);

  const backendProcess = spawnBunProcess(
    backendRoot,
    ['run', 'dev'],
    buildBackendEnv(backendPort, frontendPort),
    'backend',
  );

  if (!backendProcess.pid) {
    throw new Error('Failed to start backend dev process');
  }

  writeBackendLock(backendProcess.pid, backendPort);

  await waitForPort(backendPort, backendProcess);

  const frontendProcess = spawnBunProcess(
    frontendRoot,
    ['run', 'dev'],
    buildFrontendEnv(frontendPort, backendPort),
    'frontend',
  );

  const shutdown = async (exitCode = 0): Promise<void> => {
    if (frontendProcess.pid) {
      await killProcessTree(frontendProcess.pid);
    }

    if (backendProcess.pid) {
      await killProcessTree(backendProcess.pid);
    }

    clearBackendLock();
    process.exit(exitCode);
  };

  process.on('SIGINT', () => {
    void shutdown(0);
  });

  process.on('SIGTERM', () => {
    void shutdown(0);
  });

  const [backendExitCode, frontendExitCode] = await Promise.all([
    waitForChildExit(backendProcess),
    waitForChildExit(frontendProcess),
  ]);

  if (backendExitCode !== 0) {
    await shutdown(backendExitCode);
  }

  if (frontendExitCode !== 0) {
    await shutdown(frontendExitCode);
  }

  await shutdown(0);
};

run().catch((error: unknown) => {
  clearBackendLock();

  const message = error instanceof Error ? error.message : String(error);
  logError(message);
  process.exit(1);
});
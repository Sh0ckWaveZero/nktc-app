import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

type NextDevLock = {
  pid?: number;
  port?: number;
  appUrl?: string;
};

const projectRoot = process.cwd();
const lockFilePath = join(projectRoot, '.next', 'dev', 'lock');
const nextExecutablePath = join(
  projectRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.exe' : 'next',
);

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const readLockFile = (): NextDevLock | null => {
  if (!existsSync(lockFilePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(lockFilePath, 'utf8')) as NextDevLock;
  } catch {
    return null;
  }
};

const isProcessAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const waitForChildExit = (child: ChildProcess): Promise<number> =>
  new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 0));
  });

const getWindowsProcessInfo = async (
  pid: number,
): Promise<{ pid: number; parentPid: number; name: string } | null> => {
  const processInfo = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `$proc = Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}"; if ($proc) { $proc | Select-Object ProcessId,ParentProcessId,Name | ConvertTo-Json -Compress }`,
    ],
    {
      shell: false,
      encoding: 'utf8',
    },
  );

  const stdout = processInfo.stdout;

  if (!stdout.trim()) {
    return null;
  }

  const parsed = JSON.parse(stdout) as {
    ProcessId?: number;
    ParentProcessId?: number;
    Name?: string;
  };

  if (typeof parsed.ProcessId !== 'number' || typeof parsed.ParentProcessId !== 'number') {
    return null;
  }

  return {
    pid: parsed.ProcessId,
    parentPid: parsed.ParentProcessId,
    name: parsed.Name || '',
  };
};

const findKillTargetPid = async (pid: number): Promise<number> => {
  if (process.platform !== 'win32') {
    return pid;
  }

  let currentPid = pid;

  for (let depth = 0; depth < 8; depth += 1) {
    const currentInfo = await getWindowsProcessInfo(currentPid);

    if (!currentInfo || currentInfo.parentPid <= 0) {
      return currentPid;
    }

    const parentInfo = await getWindowsProcessInfo(currentInfo.parentPid);

    if (!parentInfo) {
      return currentPid;
    }

    const parentName = parentInfo.name.toLowerCase();

    if (parentName === 'node.exe' || parentName === 'node' || parentName === 'next.exe' || parentName === 'next') {
      currentPid = parentInfo.pid;
      continue;
    }

    return currentPid;
  }

  return currentPid;
};

const killProcess = async (pid: number): Promise<void> => {
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
      throw new Error(`Unable to stop existing Next.js process ${pid}`);
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

const waitForProcessExit = async (pid: number): Promise<void> => {
  while (isProcessAlive(pid)) {
    await sleep(250);
  }
};

const clearExistingDevLock = async (): Promise<void> => {
  const lockData = readLockFile();

  if (!lockData) {
    return;
  }

  if (typeof lockData?.pid === 'number' && isProcessAlive(lockData.pid)) {
    const target = lockData.appUrl || `port ${lockData.port || 'unknown'}`;
    const killTargetPid = await findKillTargetPid(lockData.pid);
    console.log(`Stopping existing Next.js dev server (${target}, pid ${killTargetPid})...`);
    await killProcess(killTargetPid);
    await waitForProcessExit(killTargetPid);
  }

  if (existsSync(lockFilePath)) {
    rmSync(lockFilePath, { force: true });
  }
};

const waitForServerPid = async (launcherPid: number): Promise<number | null> => {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const lockData = readLockFile();

    if (typeof lockData?.pid === 'number' && lockData.pid !== launcherPid && isProcessAlive(lockData.pid)) {
      return lockData.pid;
    }

    if (!isProcessAlive(launcherPid) && !existsSync(lockFilePath)) {
      return null;
    }

    await sleep(100);
  }

  return null;
};

const run = async (): Promise<void> => {
  if (!existsSync(nextExecutablePath)) {
    throw new Error(`Next.js executable not found at ${nextExecutablePath}`);
  }

  await clearExistingDevLock();

  const nextProcess = spawn(nextExecutablePath, ['dev'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });
  const launcherPid = nextProcess.pid ?? 0;

  let activeKillPid = launcherPid;
  const serverPid = await waitForServerPid(launcherPid);

  if (typeof serverPid === 'number') {
    activeKillPid = await findKillTargetPid(serverPid);
  }

  let shuttingDown = false;

  const shutdown = async () => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    await killProcess(activeKillPid);
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });

  if (typeof serverPid === 'number') {
    await waitForProcessExit(serverPid);
    process.exit(0);
  }

  const exitCode = await waitForChildExit(nextProcess);

  process.exit(exitCode);
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
import { spawnSync } from 'node:child_process';

type CliOptions = {
  baseBranch: string;
  branch?: string;
  create: boolean;
  dryRun: boolean;
  forkOwner?: string;
  noBrowser: boolean;
  repoName?: string;
  upstreamOwner?: string;
};

type GitHubRemote = {
  owner: string;
  repo: string;
};

type ResolvedOptions = {
  baseBranch: string;
  branch: string;
  create: boolean;
  dryRun: boolean;
  forkOwner: string;
  noBrowser: boolean;
  repoName: string;
  upstreamOwner: string;
};

type CommandResult = {
  status: number;
  stdout: string;
  stderr: string;
};

type BranchDivergence = {
  baseAhead: number;
  headAhead: number;
};

type PullRequestInfo = {
  mergedAt: string | null;
  number: number;
  state: 'closed' | 'open';
  title: string;
  url: string;
};

const DEFAULT_OPTIONS: CliOptions = {
  baseBranch: 'main',
  create: false,
  dryRun: false,
  noBrowser: false,
};

const HELP_TEXT = `Usage: bun run pr -- [options]

Push the current branch to origin and open or create a pull request against upstream.

Options:
  --branch <name>          Override the branch to push and open as a PR
  --base <name>            Base branch on upstream (default: main)
  --fork-owner <owner>     Override the fork owner used for origin/auth
  --upstream-owner <owner> Override the upstream owner used for the PR target
  --repo <name>            Override the repository name
  --create                 Create the pull request directly with gh instead of opening the compare page
  --no-browser             Print the compare URL instead of opening a browser window
  --dry-run                Show the actions without changing auth, pushing, or opening the browser
  --help                   Show this help text

Examples:
  bun run pr
  bun run pr:create
  bun run pr -- --fork-owner thetha77
  bun run pr -- --branch fix/visit-report --create
`;

const log = (message: string): void => {
  process.stdout.write(`[pr] ${message}\n`);
};

const logWarning = (message: string): void => {
  process.stderr.write(`[pr] ${message}\n`);
};

const formatCommand = (command: string, args: string[]): string => [command, ...args].join(' ');

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  const options: CliOptions = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];

    const readValue = (flag: string): string => {
      const value = args[index + 1];

      if (!value || value.startsWith('-')) {
        throw new Error(`Missing value for ${flag}`);
      }

      index += 1;
      return value;
    };

    switch (current) {
      case '--branch':
      case '-b':
        options.branch = readValue(current);
        break;
      case '--base':
        options.baseBranch = readValue(current);
        break;
      case '--fork-owner':
        options.forkOwner = readValue(current);
        break;
      case '--upstream-owner':
        options.upstreamOwner = readValue(current);
        break;
      case '--repo':
        options.repoName = readValue(current);
        break;
      case '--create':
        options.create = true;
        break;
      case '--no-browser':
        options.noBrowser = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        process.stdout.write(HELP_TEXT);
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${current}`);
    }
  }

  return options;
};

const runCapture = (command: string, args: string[], allowFailure = false): CommandResult => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: false,
  });

  if (result.error) {
    throw new Error(`Unable to run ${command}: ${result.error.message}`);
  }

  const status = result.status ?? 1;
  const stdout = result.stdout?.trim() ?? '';
  const stderr = result.stderr?.trim() ?? '';

  if (status !== 0 && !allowFailure) {
    throw new Error(`${formatCommand(command, args)} failed\n${stderr || stdout}`.trim());
  }

  return { status, stdout, stderr };
};

const runInteractive = (command: string, args: string[], dryRun: boolean): void => {
  if (dryRun) {
    log(`[dry-run] ${formatCommand(command, args)}`);
    return;
  }

  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    shell: false,
    stdio: 'inherit',
  });

  if (result.error) {
    throw new Error(`Unable to run ${command}: ${result.error.message}`);
  }

  if ((result.status ?? 1) !== 0) {
    throw new Error(`${formatCommand(command, args)} failed`);
  }
};

const parseGitHubRemote = (remoteUrl: string): GitHubRemote | null => {
  const trimmed = remoteUrl.trim();
  const httpsMatch = trimmed.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/u);

  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/u);

  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  return null;
};

const getRemoteUrl = (remoteName: string, allowFailure = false): string =>
  runCapture('git', ['remote', 'get-url', remoteName], allowFailure).stdout;

const getActiveGitHubUser = (): string | null => {
  const apiResult = runCapture('gh', ['api', 'user', '--jq', '.login'], true);

  if (apiResult.status === 0 && apiResult.stdout) {
    return apiResult.stdout;
  }

  const statusResult = runCapture('gh', ['auth', 'status', '-h', 'github.com'], true);
  const combinedOutput = `${statusResult.stdout}\n${statusResult.stderr}`;
  const match = combinedOutput.match(/Logged in to github\.com account ([^\s]+)/u);

  return match?.[1] ?? null;
};

const getWorkingTreeStatus = (): string => runCapture('git', ['status', '--short']).stdout;

const hasGitRef = (ref: string): boolean => runCapture('git', ['show-ref', '--verify', '--quiet', ref], true).status === 0;

const getBranchDivergence = (baseRef: string, headRef: string): BranchDivergence => {
  const counts = runCapture('git', ['rev-list', '--left-right', '--count', `${baseRef}...${headRef}`]).stdout;
  const [baseAheadRaw = '0', headAheadRaw = '0'] = counts.split(/\s+/u);
  const baseAhead = Number.parseInt(baseAheadRaw, 10);
  const headAhead = Number.parseInt(headAheadRaw, 10);

  if (Number.isNaN(baseAhead) || Number.isNaN(headAhead)) {
    throw new Error(`Unable to read branch divergence for ${baseRef}...${headRef}.`);
  }

  return { baseAhead, headAhead };
};

const getExistingPullRequest = (options: ResolvedOptions): PullRequestInfo | null => {
  const headRef = encodeURIComponent(`${options.forkOwner}:${options.branch}`);
  const result = runCapture(
    'gh',
    ['api', `repos/${options.upstreamOwner}/${options.repoName}/pulls?state=all&head=${headRef}`],
    true,
  );

  if (result.status !== 0 || !result.stdout) {
    return null;
  }

  const [pullRequest] = JSON.parse(result.stdout) as Array<{
    merged_at: string | null;
    number: number;
    state: 'closed' | 'open';
    title: string;
    url: string;
    html_url?: string;
  }>;

  if (!pullRequest) {
    return null;
  }

  return {
    mergedAt: pullRequest.merged_at,
    number: pullRequest.number,
    state: pullRequest.state,
    title: pullRequest.title,
    url: pullRequest.html_url ?? pullRequest.url,
  };
};

const clearWindowsGhCredentials = (username: string | null): void => {
  if (process.platform !== 'win32') {
    return;
  }

  const targets = username
    ? [`LegacyGeneric:target=gh:github.com:${username}`, 'LegacyGeneric:target=gh:github.com:']
    : ['LegacyGeneric:target=gh:github.com:'];

  for (const target of targets) {
    runCapture('cmdkey', [`/delete:${target}`], true);
  }
};

const resolveOptions = (options: CliOptions): ResolvedOptions => {
  const originRemote = parseGitHubRemote(getRemoteUrl('origin'));
  const upstreamRemote = parseGitHubRemote(getRemoteUrl('upstream', true));
  const repoName = options.repoName ?? upstreamRemote?.repo ?? originRemote?.repo;
  const forkOwner = options.forkOwner ?? originRemote?.owner;
  const upstreamOwner = options.upstreamOwner ?? upstreamRemote?.owner;
  const branch = options.branch ?? runCapture('git', ['branch', '--show-current']).stdout;

  if (!repoName) {
    throw new Error('Unable to determine the repository name. Pass --repo explicitly.');
  }

  if (!forkOwner) {
    throw new Error('Unable to determine the fork owner from origin. Pass --fork-owner explicitly.');
  }

  if (!upstreamOwner) {
    throw new Error('Unable to determine the upstream owner from the upstream remote. Pass --upstream-owner explicitly.');
  }

  if (!branch) {
    throw new Error('Unable to determine the current branch. Pass --branch explicitly.');
  }

  return {
    baseBranch: options.baseBranch,
    branch,
    create: options.create,
    dryRun: options.dryRun,
    forkOwner,
    noBrowser: options.noBrowser,
    repoName,
    upstreamOwner,
  };
};

const ensureOriginRemote = (options: ResolvedOptions): void => {
  const desiredUrl = `https://github.com/${options.forkOwner}/${options.repoName}.git`;
  const currentUrl = getRemoteUrl('origin');

  if (currentUrl === desiredUrl) {
    return;
  }

  log(`Updating origin remote to ${desiredUrl}`);
  runInteractive('git', ['remote', 'set-url', 'origin', desiredUrl], options.dryRun);
};

const ensureForkAuth = (forkOwner: string, dryRun: boolean): void => {
  const currentUser = getActiveGitHubUser();

  if (currentUser === forkOwner) {
    log(`GitHub CLI is already authenticated as ${forkOwner}.`);
    return;
  }

  if (dryRun) {
    log(`[dry-run] Would authenticate GitHub CLI as ${forkOwner} instead of ${currentUser ?? 'no active account'}.`);
    return;
  }

  if (currentUser) {
    log(`Switching GitHub CLI authentication from ${currentUser} to ${forkOwner}...`);
    runInteractive('gh', ['auth', 'logout', '-h', 'github.com', '-u', currentUser], false);
  } else {
    log(`No active GitHub CLI session found. Logging in as ${forkOwner}...`);
  }

  clearWindowsGhCredentials(currentUser);
  runInteractive('gh', ['auth', 'login', '-h', 'github.com', '-p', 'https', '-w'], false);

  const verifiedUser = getActiveGitHubUser();

  if (verifiedUser !== forkOwner) {
    throw new Error(`GitHub CLI is authenticated as ${verifiedUser ?? 'unknown'}, expected ${forkOwner}.`);
  }

  log(`GitHub CLI is ready as ${verifiedUser}.`);
};

const warnIfWorkingTreeDirty = (status: string): void => {
  if (status) {
    logWarning('Working tree has uncommitted changes. Only committed changes will be pushed and included in the pull request.');
  }
};

const buildBaseBranchMessage = (options: ResolvedOptions, workingTreeStatus: string): string => {
  const lines = [`Current branch is ${options.baseBranch}.`];
  const upstreamRef = `refs/remotes/upstream/${options.baseBranch}`;

  if (hasGitRef(upstreamRef)) {
    const divergence = getBranchDivergence(`upstream/${options.baseBranch}`, 'HEAD');

    if (divergence.headAhead > 0) {
      lines.push(`Local ${options.baseBranch} is ahead of upstream/${options.baseBranch} by ${divergence.headAhead} commit(s).`);
      lines.push('Create a feature/fix branch from the current HEAD so those commits are included in the PR branch:');
      lines.push(`git switch -c fix/your-change`);
      lines.push('bun run pr');
    } else if (divergence.baseAhead > 0) {
      lines.push(`Local ${options.baseBranch} is behind upstream/${options.baseBranch} by ${divergence.baseAhead} commit(s).`);
      lines.push(`Update ${options.baseBranch}, then create a feature/fix branch:`);
      lines.push(`git pull upstream ${options.baseBranch}`);
      lines.push('git switch -c fix/your-change');
      lines.push('bun run pr');
    } else {
      lines.push('Create a feature/fix branch first, then rerun the command:');
      lines.push('git switch -c fix/your-change');
      lines.push('bun run pr');
    }
  } else {
    lines.push('Switch to a feature/fix branch or pass --branch explicitly.');
    lines.push('Example: git switch -c fix/your-change');
    lines.push('Then rerun: bun run pr');
  }

  if (workingTreeStatus) {
    lines.push('Uncommitted changes will stay in your working tree when you switch branches.');
  }

  return lines.join('\n');
};

const openBrowser = (url: string, dryRun: boolean): void => {
  if (dryRun) {
    log(`[dry-run] Open browser: ${url}`);
    return;
  }

  if (process.platform === 'win32') {
    runCapture('cmd', ['/c', 'start', '', url]);
    return;
  }

  if (process.platform === 'darwin') {
    runCapture('open', [url]);
    return;
  }

  runCapture('xdg-open', [url]);
};

const main = (): void => {
  const repoRoot = runCapture('git', ['rev-parse', '--show-toplevel']).stdout;

  if (!repoRoot) {
    throw new Error('This script must be run inside a git repository.');
  }

  process.chdir(repoRoot);

  const options = resolveOptions(parseArgs());
  const workingTreeStatus = getWorkingTreeStatus();

  if (options.branch === options.baseBranch) {
    throw new Error(buildBaseBranchMessage(options, workingTreeStatus));
  }

  warnIfWorkingTreeDirty(workingTreeStatus);
  ensureOriginRemote(options);
  ensureForkAuth(options.forkOwner, options.dryRun);

  log(`Pushing ${options.branch} to origin...`);
  runInteractive('git', ['push', '-u', 'origin', options.branch], options.dryRun);

  log(`Refreshing upstream/${options.baseBranch}...`);
  runInteractive('git', ['fetch', 'upstream', options.baseBranch], options.dryRun);

  const divergence = getBranchDivergence(`upstream/${options.baseBranch}`, 'HEAD');
  const existingPullRequest = getExistingPullRequest(options);

  if (divergence.headAhead === 0) {
    if (workingTreeStatus) {
      logWarning(`No committed changes are ahead of upstream/${options.baseBranch}. Commit your current edits, then rerun bun run pr.`);
    } else if (existingPullRequest?.mergedAt) {
      logWarning(`PR #${existingPullRequest.number} is already merged. Start a new branch from the latest ${options.baseBranch} for new work.`);
    } else {
      logWarning(`This branch has no commits ahead of upstream/${options.baseBranch}. Nothing new to open as a pull request.`);
    }

    if (divergence.baseAhead > 0) {
      log(`Suggested next steps:`);
      process.stdout.write(`git switch ${options.baseBranch}\n`);
      process.stdout.write(`git pull upstream ${options.baseBranch}\n`);
      process.stdout.write('git switch -c feature/your-next-change\n');
    }

    if (existingPullRequest?.url) {
      log(`Existing pull request: ${existingPullRequest.url}`);
    }

    return;
  }

  const compareUrl = `https://github.com/${options.upstreamOwner}/${options.repoName}/compare/${options.baseBranch}...${options.forkOwner}:${options.branch}?expand=1`;

  if (existingPullRequest?.state === 'open') {
    log(`Branch already has PR #${existingPullRequest.number}: ${existingPullRequest.title}`);

    if (options.noBrowser) {
      process.stdout.write(`${existingPullRequest.url}\n`);
      return;
    }

    openBrowser(existingPullRequest.url, options.dryRun);
    log('Existing pull request opened. New commits were pushed to that PR.');
    return;
  }

  if (options.create) {
    if (existingPullRequest?.mergedAt) {
      log(`Branch was previously merged via PR #${existingPullRequest.number}. Creating a new pull request for the new commits on this branch...`);
    }

    log(`Creating pull request ${options.forkOwner}:${options.branch} -> ${options.upstreamOwner}/${options.repoName}:${options.baseBranch}...`);
    runInteractive(
      'gh',
      [
        'pr',
        'create',
        '--repo',
        `${options.upstreamOwner}/${options.repoName}`,
        '--base',
        options.baseBranch,
        '--head',
        `${options.forkOwner}:${options.branch}`,
        '--fill',
      ],
      options.dryRun,
    );
    return;
  }

  if (options.noBrowser) {
    log(`Open this URL to create the pull request:`);
    process.stdout.write(`${compareUrl}\n`);
    return;
  }

  openBrowser(compareUrl, options.dryRun);
  log('Compare page opened for a new pull request.');
};

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  logWarning(message);
  process.exit(1);
}
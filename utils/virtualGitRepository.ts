export type VirtualGitCommit = {
  branch: string;
  changedFiles?: string[];
  createdAt: string;
  files: Record<string, string>;
  id: string;
  message: string;
};

export type VirtualGitStatus = {
  staged: string[];
  unstaged: string[];
  untracked: string[];
};

export type VirtualGitRepository = {
  branchHeads?: Record<string, string>;
  branches: string[];
  commits: VirtualGitCommit[];
  currentBranch: string;
  files: Record<string, string>;
  initialized: boolean;
  lastError?: string;
  lastPush?: {
    branch: string;
    remote: string;
  };
  lastStatus?: VirtualGitStatus;
  remotes: Record<string, string>;
  rootPath?: string;
  staged: string[];
  stagedFiles?: Record<string, string>;
};

const normalizePath = (path: string): string =>
  path
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");

const normalizeFiles = (
  files: Record<string, string> = {}
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(files)
      .map(([path, content]) => [normalizePath(path), content] as const)
      .filter(([path]) => Boolean(path))
  );

const CSS_PULL_LAB_REMOTE = "https://github.com/winsim-labs/css-pull-lab.git";
const PULL_BEFORE_PUSH_REMOTE =
  "https://github.com/estudiante/pull-before-push.git";
const PULL_BEFORE_PUSH_STYLE = `h1 {
  color: #2563eb;
  letter-spacing: 0.04em;
}

body {
  background: #eef6ff;
}
`;
const CSS_PULL_LAB_FILES: Record<string, string> = {
  "README.md":
    "# css-pull-lab\n\nSimulador para practicar `git pull` y ver cambios reales en styles.css.\n",
  "index.html": `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Landing Demo</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="hero">
      <h1>Curso Git Pull Lab</h1>
      <p>Version inicial del estilo.</p>
      <button>Ver cambios</button>
    </main>
  </body>
</html>
`,
  "styles.css": `:root {
  --bg: #f7f7f7;
  --card: #ffffff;
  --text: #1f2430;
  --accent: #2d7ff9;
}

body {
  background: var(--bg);
  color: var(--text);
}
`,
};

const cloneRepository = (repo: VirtualGitRepository): VirtualGitRepository => ({
  ...repo,
  branchHeads: { ...repo.branchHeads },
  branches: [...repo.branches],
  commits: repo.commits.map((commit) => ({
    ...commit,
    changedFiles: commit.changedFiles ? [...commit.changedFiles] : undefined,
    files: { ...commit.files },
  })),
  files: { ...repo.files },
  lastPush: repo.lastPush ? { ...repo.lastPush } : undefined,
  lastStatus: repo.lastStatus
    ? {
        staged: [...repo.lastStatus.staged],
        unstaged: [...repo.lastStatus.unstaged],
        untracked: [...repo.lastStatus.untracked],
      }
    : undefined,
  remotes: { ...repo.remotes },
  staged: [...repo.staged],
  stagedFiles: { ...repo.stagedFiles },
});

const withError = (
  repo: VirtualGitRepository,
  message: string
): VirtualGitRepository => ({
  ...cloneRepository(repo),
  lastError: message,
});

const getHeadCommit = (
  repo: VirtualGitRepository
): VirtualGitCommit | undefined => {
  const headId = repo.branchHeads?.[repo.currentBranch];

  if (headId) return repo.commits.find(({ id }) => id === headId);

  return [...repo.commits]
    .reverse()
    .find(({ branch }) => branch === repo.currentBranch);
};

const hasChanged = (
  path: string,
  files: Record<string, string>,
  headFiles: Record<string, string>,
  stagedFiles: Record<string, string>
): boolean =>
  files[path] !== headFiles[path] && files[path] !== stagedFiles[path];

const parseCommitMessage = (command: string): string => {
  const match = command.match(
    /(?:^|\s)(?:-m|--message)(?:\s+|=)(?:"([^"]*)"|'([^']*)'|(\S+))/
  );

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
};

const parseCommand = (command: string): string[] =>
  command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

const createCommitId = (
  repo: VirtualGitRepository,
  message: string,
  files: Record<string, string>
): string => {
  const input = `${repo.commits.length}:${repo.currentBranch}:${message}:${JSON.stringify(
    files
  )}`;
  let hash = 2166136261;

  for (const character of input) {
    hash ^= character.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0)
    .toString(16)
    .padStart(8, "0");
};

export const createInitialGitRepository = (): VirtualGitRepository => ({
  branchHeads: { main: "" },
  branches: ["main"],
  commits: [],
  currentBranch: "main",
  files: {},
  initialized: false,
  remotes: {},
  staged: [],
  stagedFiles: {},
});

export const gitInit = (repo: VirtualGitRepository): VirtualGitRepository => {
  const next = cloneRepository(repo);

  next.initialized = true;
  next.lastError = undefined;

  return next;
};

export const gitAdd = (
  repo: VirtualGitRepository,
  target: string,
  files: Record<string, string>
): VirtualGitRepository => {
  if (!repo.initialized) {
    return withError(repo, "fatal: not a git repository");
  }

  const next = cloneRepository(repo);
  const workingFiles = normalizeFiles(files);
  const normalizedTarget = normalizePath(target || ".");
  const headFiles = getHeadCommit(repo)?.files || {};
  const stagedFiles = repo.stagedFiles || {};
  const candidates =
    normalizedTarget === "." || !normalizedTarget
      ? Object.keys(workingFiles).filter(
          (path) =>
            !(path in headFiles) ||
            hasChanged(path, workingFiles, headFiles, stagedFiles)
        )
      : Object.keys(workingFiles).filter(
          (path) =>
            path === normalizedTarget || path.startsWith(`${normalizedTarget}/`)
        );

  if (candidates.length === 0) {
    return withError(
      repo,
      `fatal: pathspec '${target}' did not match any files`
    );
  }

  next.files = workingFiles;
  next.staged = [...new Set([...next.staged, ...candidates])].sort();
  next.stagedFiles = {
    ...next.stagedFiles,
    ...Object.fromEntries(candidates.map((path) => [path, workingFiles[path]])),
  };
  next.lastError = undefined;

  return next;
};

export const gitCommit = (
  repo: VirtualGitRepository,
  message: string
): VirtualGitRepository => {
  if (!repo.initialized) {
    return withError(repo, "fatal: not a git repository");
  }

  if (repo.staged.length === 0) {
    return withError(repo, "nothing to commit, working tree clean");
  }

  const next = cloneRepository(repo);
  const headFiles = getHeadCommit(repo)?.files || {};
  const snapshot = {
    ...headFiles,
    ...Object.fromEntries(
      repo.staged.map((path) => [
        path,
        repo.stagedFiles?.[path] ?? repo.files[path],
      ])
    ),
  };
  const id = createCommitId(repo, message, snapshot);

  next.commits.push({
    branch: repo.currentBranch,
    changedFiles: [...repo.staged],
    createdAt: new Date().toISOString(),
    files: snapshot,
    id,
    message,
  });
  next.branchHeads = {
    ...next.branchHeads,
    [repo.currentBranch]: id,
  };
  next.staged = [];
  next.stagedFiles = {};
  next.lastError = undefined;

  return next;
};

export const gitStatus = (
  repo: VirtualGitRepository,
  files: Record<string, string>
): VirtualGitStatus => {
  const workingFiles = normalizeFiles(files);
  const headFiles = getHeadCommit(repo)?.files || {};
  const stagedFiles = repo.stagedFiles || {};
  const staged = [...repo.staged].sort();
  const untracked = Object.keys(workingFiles)
    .filter((path) => !(path in headFiles) && !staged.includes(path))
    .sort();
  const unstaged = Object.keys(workingFiles)
    .filter(
      (path) =>
        (!untracked.includes(path) &&
          path in headFiles &&
          hasChanged(path, workingFiles, headFiles, stagedFiles)) ||
        (staged.includes(path) &&
          path in stagedFiles &&
          workingFiles[path] !== stagedFiles[path])
    )
    .sort();

  return { staged, unstaged, untracked };
};

export const gitPull = (
  repo: VirtualGitRepository,
  remote: string,
  branch: string
): VirtualGitRepository => {
  if (!repo.initialized) {
    return withError(repo, "fatal: not a git repository");
  }

  if (!repo.remotes[remote]) {
    return withError(
      repo,
      `fatal: '${remote}' does not appear to be a git repository`
    );
  }

  const hasActivityRemote = repo.remotes[remote] === PULL_BEFORE_PUSH_REMOTE;
  const alreadyPulled = repo.commits.some(
    ({ message: commitMessage }) =>
      commitMessage === "style: actualiza estilos remotos"
  );

  if (!hasActivityRemote || alreadyPulled) {
    const unchangedRepo = cloneRepository(repo);

    unchangedRepo.lastError = undefined;

    return unchangedRepo;
  }

  const next = cloneRepository(repo);
  const headFiles = getHeadCommit(repo)?.files || repo.files;
  const snapshot = {
    ...headFiles,
    "style.css": PULL_BEFORE_PUSH_STYLE,
  };
  const message = "style: actualiza estilos remotos";
  const id = createCommitId(repo, message, snapshot);

  next.commits.push({
    branch: branch || repo.currentBranch,
    changedFiles: ["style.css"],
    createdAt: new Date().toISOString(),
    files: snapshot,
    id,
    message,
  });
  next.branchHeads = {
    ...next.branchHeads,
    [branch || repo.currentBranch]: id,
  };
  next.files = snapshot;
  next.lastError = undefined;

  return next;
};

export const gitBranch = (
  repo: VirtualGitRepository,
  branchName: string
): VirtualGitRepository => {
  if (!repo.initialized) {
    return withError(repo, "fatal: not a git repository");
  }

  const normalizedBranch = branchName.trim();

  if (!normalizedBranch) return withError(repo, "fatal: branch name required");
  if (repo.branches.includes(normalizedBranch)) {
    return withError(
      repo,
      `fatal: a branch named '${normalizedBranch}' already exists`
    );
  }

  const next = cloneRepository(repo);

  next.branches.push(normalizedBranch);
  next.branchHeads = {
    ...next.branchHeads,
    [normalizedBranch]: repo.branchHeads?.[repo.currentBranch] || "",
  };
  next.lastError = undefined;

  return next;
};

export const gitCheckout = (
  repo: VirtualGitRepository,
  branchName: string
): VirtualGitRepository => {
  if (!repo.initialized) {
    return withError(repo, "fatal: not a git repository");
  }

  if (!repo.branches.includes(branchName)) {
    return withError(
      repo,
      `error: pathspec '${branchName}' did not match any branch`
    );
  }

  const next = cloneRepository(repo);
  const targetHeadId = repo.branchHeads?.[branchName];
  const targetCommit = targetHeadId
    ? repo.commits.find(({ id }) => id === targetHeadId)
    : undefined;

  next.currentBranch = branchName;
  next.files = targetCommit ? { ...targetCommit.files } : { ...repo.files };
  next.lastError = undefined;

  return next;
};

export const gitRemoteAdd = (
  repo: VirtualGitRepository,
  name: string,
  url: string
): VirtualGitRepository => {
  if (!repo.initialized) {
    return withError(repo, "fatal: not a git repository");
  }

  if (!name || !url)
    return withError(repo, "usage: git remote add <name> <url>");

  const next = cloneRepository(repo);

  next.remotes[name] = url;
  next.lastError = undefined;

  return next;
};

export const gitClone = (
  repo: VirtualGitRepository,
  source: string,
  destination: string,
  cwd: string
): VirtualGitRepository => {
  if (!source) {
    return withError(repo, "fatal: repository URL required");
  }

  const sourceName =
    source
      .replace(/\/+$/, "")
      .split("/")
      .pop()
      ?.replace(/\.git$/, "") || "repository";
  const destinationName = normalizePath(destination || sourceName);
  const rootPath = normalizePath(
    [normalizePath(cwd), destinationName].filter(Boolean).join("/")
  );
  const next = createInitialGitRepository();

  next.initialized = true;
  next.remotes.origin = source;
  next.rootPath = rootPath;

  if (source === CSS_PULL_LAB_REMOTE) {
    return gitCommit(
      gitAdd(next, ".", CSS_PULL_LAB_FILES),
      "feat: base web styles"
    );
  }

  return next;
};

export const gitPush = (
  repo: VirtualGitRepository,
  remote: string,
  branch: string
): VirtualGitRepository => {
  if (!repo.initialized) {
    return withError(repo, "fatal: not a git repository");
  }

  if (!repo.remotes[remote]) {
    return withError(
      repo,
      `fatal: '${remote}' does not appear to be a git repository`
    );
  }

  if (!getHeadCommit(repo)) {
    return withError(repo, "Could not find HEAD.");
  }

  const next = cloneRepository(repo);

  next.lastPush = { branch: branch || repo.currentBranch, remote };
  next.lastError = undefined;

  return next;
};

const getPushPositionals = (tokens: string[]): string[] => {
  const positionals: string[] = [];

  for (let index = 2; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === "-u" || token === "--set-upstream") {
      continue;
    }

    if (token.startsWith("--set-upstream=")) {
      continue;
    }

    if (token.startsWith("-")) {
      continue;
    }

    positionals.push(token);
  }

  return positionals;
};

export const applyGitCommand = (
  repo: VirtualGitRepository,
  command: string,
  files: Record<string, string> = repo.files,
  cwd = ""
): VirtualGitRepository => {
  const tokens = parseCommand(command.trim());

  if (tokens[0]?.toLowerCase() !== "git") return cloneRepository(repo);

  const action = tokens[1]?.toLowerCase();

  switch (action) {
    case "init": {
      const next = gitInit(repo);

      next.rootPath = normalizePath(cwd);

      return next;
    }
    case "clone":
      return gitClone(repo, tokens[2] || "", tokens[3] || "", cwd);
    case "add":
      return gitAdd(repo, tokens.slice(2).join(" ") || ".", files);
    case "commit":
      return gitCommit(repo, parseCommitMessage(command));
    case "status": {
      const next = cloneRepository(repo);

      next.files = normalizeFiles(files);
      next.lastStatus = gitStatus(next, files);
      next.lastError = next.initialized
        ? undefined
        : "fatal: not a git repository";

      return next;
    }
    case "branch":
      return tokens[2] && !tokens[2].startsWith("-")
        ? gitBranch(repo, tokens[2])
        : cloneRepository(repo);
    case "checkout":
    case "switch":
      return gitCheckout(
        repo,
        tokens.find((token, index) => index > 1 && !token.startsWith("-")) || ""
      );
    case "remote":
      return tokens[2] === "add"
        ? gitRemoteAdd(repo, tokens[3] || "", tokens[4] || "")
        : cloneRepository(repo);
    case "push": {
      const positional = getPushPositionals(tokens);
      const remote = positional[0] || repo.lastPush?.remote || "origin";
      const branch = positional[1] || repo.currentBranch;

      return gitPush(repo, remote, branch);
    }
    case "pull": {
      const remote =
        tokens.find((token, index) => index > 1 && !token.startsWith("-")) ||
        "origin";
      const branch =
        tokens.find((token, index) => index > 2 && !token.startsWith("-")) ||
        repo.currentBranch;

      return gitPull(repo, remote, branch);
    }
    default:
      return cloneRepository(repo);
  }
};

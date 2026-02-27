import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useFileSystem } from "contexts/fileSystem";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { trackActivityEvent } from "utils/activityRuntime";

const HISTORY_KEY = "gitbash_history";
const GIT_CONFIG_KEY = "gitbash_global_config";
const HOME = "/Users/Public";

type Line = {
  id: number;
  text: string;
};

type GitCommit = {
  hash: string;
  message: string;
  parentHash?: string;
  snapshot: Record<string, string>;
  timestamp: number;
};

type GitGlobalConfig = {
  colorUi: boolean;
  userEmail: string;
  userName: string;
};

type GitRepoState = {
  branch: string;
  branches: Record<string, GitCommit[]>;
  initialized: boolean;
  remotes: Record<string, string>;
  staged: Set<string>;
  tags: Record<string, { hash: string; message?: string }>;
  tracked: Set<string>;
};

const parseArgs = (command: string): string[] =>
  (command.match(/(?:[^\s"]|"[^"]*")+/g) || []).map((entry) =>
    entry.replace(/^"|"$/g, "")
  );

const formatPathForPrompt = (cwd: string): string =>
  cwd.startsWith(HOME) ? cwd.replace(HOME, "~") : cwd;

const normalizePath = (path: string): string => {
  const normalized = path.replace(/\\/g, "/").replace(/\/+/g, "/");

  if (!normalized) return "/";
  if (normalized === "/") return "/";

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
};

const joinPath = (base: string, next: string): string =>
  normalizePath(`${normalizePath(base)}/${next}`);

const parentPath = (path: string): string => {
  const normalized = normalizePath(path);

  if (normalized === "/") return "/";

  const separatorIndex = normalized.lastIndexOf("/");

  return separatorIndex <= 0 ? "/" : normalized.slice(0, separatorIndex);
};

const isPathInside = (basePath: string, fullPath: string): boolean => {
  const base = normalizePath(basePath);
  const full = normalizePath(fullPath);

  return full === base || full.startsWith(`${base}/`);
};

const toRelativePath = (basePath: string, fullPath: string): string => {
  const base = normalizePath(basePath);
  const full = normalizePath(fullPath);

  if (full === base) return ".";
  if (full.startsWith(`${base}/`)) return full.slice(base.length + 1);

  return full;
};

const wildcardToRegex = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, String.raw`\$&`).replace(/\*/g, ".*");

  return new RegExp(`^${escaped}$`);
};

const GitBash: React.FC<ComponentProcessProps> = () => {
  const fs = useFileSystem();
  const fsRef = useRef(fs);
  const [cwd, setCwd] = useState<string>(HOME);
  const cwdRef = useRef<string>(HOME);
  const previousCwdRef = useRef<string>(HOME);
  const lineIdRef = useRef(1);
  const [lines, setLines] = useState<Line[]>([
    { id: 0, text: "Welcome to Git Bash (simulated). Type 'help' to begin." },
  ]);
  const [input, setInput] = useState("");
  const outputRef = useRef<HTMLDivElement | null>(null);
  const [historyEntries, setHistoryEntries] = useState<string[]>([]);
  const historyCursorRef = useRef<number>(-1);
  const gitRepos = useRef<Record<string, GitRepoState>>({});
  const gitConfig = useRef<GitGlobalConfig>({
    colorUi: true,
    userEmail: "user@winsim.local",
    userName: "user",
  });

  const prompt = useMemo(
    () => `MINGW64 ${formatPathForPrompt(cwd)}$`,
    [cwd]
  );

  const appendLine = useCallback((value: string): void => {
    const id = lineIdRef.current;

    lineIdRef.current += 1;
    setLines((current) => [...current, { id, text: value }]);
  }, []);

  const pushHistory = useCallback((command: string): void => {
    if (!command.trim()) return;

    try {
      const history = window.localStorage.getItem(HISTORY_KEY) || "";
      const nextHistory = history ? `${history}\n${command}` : command;

      window.localStorage.setItem(HISTORY_KEY, nextHistory);
      setHistoryEntries(nextHistory.split("\n"));
    } catch {
      setHistoryEntries((current) => [...current, command]);
    }
  }, []);

  useEffect(() => {
    fsRef.current = fs;
  }, [fs]);

  useEffect(() => {
    try {
      const history = window.localStorage.getItem(HISTORY_KEY) || "";

      if (history) setHistoryEntries(history.split("\n"));
    } catch {
      setHistoryEntries([]);
    }
  }, []);

  useEffect(() => {
    try {
      const storedConfig = window.localStorage.getItem(GIT_CONFIG_KEY);

      if (!storedConfig) return;

      const parsedConfig = JSON.parse(storedConfig) as Partial<GitGlobalConfig>;

      gitConfig.current = {
        colorUi:
          typeof parsedConfig.colorUi === "boolean"
            ? parsedConfig.colorUi
            : gitConfig.current.colorUi,
        userEmail:
          typeof parsedConfig.userEmail === "string" && parsedConfig.userEmail
            ? parsedConfig.userEmail
            : gitConfig.current.userEmail,
        userName:
          typeof parsedConfig.userName === "string" && parsedConfig.userName
            ? parsedConfig.userName
            : gitConfig.current.userName,
      };
    } catch {
      // Ignore invalid saved config
    }
  }, []);

  useEffect(() => {
    if (!outputRef.current || lines.length === 0) return;

    outputRef.current.scrollTo({
      top: outputRef.current.scrollHeight,
    });
  }, [lines]);

  const runCommand = useCallback(
    async (command: string): Promise<void> => {
      const fileSystem = fsRef.current;
      const currentCwd = cwdRef.current;
      const args = parseArgs(command.trim());
      const cmd = args[0] || "";
      const params = args.slice(1);
      const print = (message: string): void => appendLine(message);
      const resolvePath = (value: string): string => {
        if (!value || value === "~") return HOME;
        if (value === "-") return previousCwdRef.current;
        if (value.startsWith("~/")) return `${HOME}/${value.slice(2)}`;
        if (value.startsWith("/")) return value;

        return `${currentCwd}/${value}`;
      };
      const ensureDir = async (path: string): Promise<void> =>
        fileSystem.mkdirRecursive(normalizePath(path));
      const findRepoRoot = async (startPath: string): Promise<string | undefined> => {
        const probePath = normalizePath(startPath);
        const gitDirPath = joinPath(probePath, ".git");

        if (await fileSystem.exists(gitDirPath)) {
          const gitStats = await fileSystem.lstat(gitDirPath);

          if (gitStats.isDirectory()) return probePath;
        }

        if (probePath === "/") return undefined;

        return findRepoRoot(parentPath(probePath));
      };
      const getRepoState = (repoRoot: string): GitRepoState => {
        if (!gitRepos.current[repoRoot]) {
          gitRepos.current[repoRoot] = {
            branch: "main",
            branches: { main: [] },
            initialized: true,
            remotes: {},
            staged: new Set(),
            tags: {},
            tracked: new Set(),
          };
        }

        return gitRepos.current[repoRoot];
      };
      const saveGitConfig = (): void => {
        try {
          window.localStorage.setItem(
            GIT_CONFIG_KEY,
            JSON.stringify(gitConfig.current)
          );
        } catch {
          // Ignore failures saving config
        }
      };
      const collectFiles = async (basePath: string, fromPath = basePath): Promise<string[]> => {
        const entries = (await fileSystem.readdir(fromPath)).filter(
          (entry) => entry !== ".git"
        );
        const fileGroups = await Promise.all(
          entries.map(async (entry) => {
            const entryPath = joinPath(fromPath, entry);
            const stats = await fileSystem.lstat(entryPath);

            if (stats.isDirectory()) {
              return collectFiles(basePath, entryPath);
            }

            return [toRelativePath(basePath, entryPath)];
          })
        );

        return fileGroups.flat();
      };
      const getHeadCommit = (repo: GitRepoState): GitCommit | undefined =>
        (repo.branches[repo.branch] || [])[0];
      const createSnapshot = async (repoRoot: string): Promise<Record<string, string>> => {
        const snapshotFiles = await collectFiles(repoRoot);
        const snapshotEntries = await Promise.all(
          snapshotFiles.map(async (file) => {
            const content = await fileSystem.readFile(joinPath(repoRoot, file));

            return [file, content.toString()] as const;
          })
        );

        return Object.fromEntries(snapshotEntries);
      };
      const diffSnapshots = (
        baseSnapshot: Record<string, string>,
        currentSnapshot: Record<string, string>
      ): { added: string[]; deleted: string[]; modified: string[] } => {
        const added = Object.keys(currentSnapshot).filter(
          (file) => !Object.hasOwn(baseSnapshot, file)
        );
        const deleted = Object.keys(baseSnapshot).filter(
          (file) => !Object.hasOwn(currentSnapshot, file)
        );
        const modified = Object.keys(currentSnapshot).filter(
          (file) =>
            Object.hasOwn(baseSnapshot, file) &&
            currentSnapshot[file] !== baseSnapshot[file]
        );

        const sortedAdded = [...added].sort((left, right) =>
          left.localeCompare(right)
        );
        const sortedDeleted = [...deleted].sort((left, right) =>
          left.localeCompare(right)
        );
        const sortedModified = [...modified].sort((left, right) =>
          left.localeCompare(right)
        );

        return {
          added: sortedAdded,
          deleted: sortedDeleted,
          modified: sortedModified,
        };
      };
      const resolveCommitRef = (
        commits: GitCommit[],
        ref = "HEAD"
      ): GitCommit | undefined => {
        if (ref === "HEAD") return commits[0];

        if (ref.startsWith("HEAD")) {
          const match = /^HEAD(\^+)$/.exec(ref);

          if (!match) return undefined;

          const hops = match[1].length;

          return commits[hops];
        }

        return commits.find((commit) => commit.hash.startsWith(ref));
      };
      const collectTargetFiles = async (
        repoRoot: string,
        targetInput?: string
      ): Promise<string[]> => {
        if (!targetInput || targetInput === ".") {
          return collectFiles(repoRoot);
        }

        const absoluteTarget = normalizePath(resolvePath(targetInput));

        if (!isPathInside(repoRoot, absoluteTarget)) {
          return [];
        }

        if (!(await fileSystem.exists(absoluteTarget))) {
          return [toRelativePath(repoRoot, absoluteTarget)];
        }

        const stats = await fileSystem.lstat(absoluteTarget);

        if (stats.isDirectory()) {
          return collectFiles(repoRoot, absoluteTarget);
        }

        return [toRelativePath(repoRoot, absoluteTarget)];
      };
      const writeSnapshotFile = async (
        repoRoot: string,
        relativeFile: string,
        content: string
      ): Promise<void> => {
        const fullPath = joinPath(repoRoot, relativeFile);

        await ensureDir(parentPath(fullPath));
        await fileSystem.writeFile(fullPath, content);
      };
      const applyCommitSnapshot = async (
        repoRoot: string,
        snapshot: Record<string, string>
      ): Promise<void> => {
        const currentFiles = await collectFiles(repoRoot);

        await Promise.all(
          currentFiles
            .filter((file) => !Object.hasOwn(snapshot, file))
            .map(async (file) => {
              const fullPath = joinPath(repoRoot, file);

              if (await fileSystem.exists(fullPath)) {
                await fileSystem.unlink(fullPath);
              }
            })
        );

        await Promise.all(
          Object.entries(snapshot).map(([file, content]) =>
            writeSnapshotFile(repoRoot, file, content)
          )
        );
      };
      const copyDirectoryRecursive = async (
        sourceDir: string,
        destinationDir: string
      ): Promise<void> => {
        await ensureDir(destinationDir);

        const entries = await fileSystem.readdir(sourceDir);

        await Promise.all(
          entries.map(async (entry) => {
            const sourcePath = joinPath(sourceDir, entry);
            const destinationPath = joinPath(destinationDir, entry);
            const sourceStats = await fileSystem.lstat(sourcePath);

            if (sourceStats.isDirectory()) {
              await copyDirectoryRecursive(sourcePath, destinationPath);
              return;
            }

            const sourceContent = await fileSystem.readFile(sourcePath);

            await fileSystem.writeFile(destinationPath, sourceContent);
          })
        );
      };

      try {
        switch (cmd) {
          case "ll":
            await runCommand("ls -la");
            break;
          case "rm":
            if (params[0]) {
              const filePath = resolvePath(params[0]).replace(/\/+/g, "/");

              if (await fileSystem.exists(filePath)) {
                await fileSystem.unlink(filePath);
              } else {
                print(
                  `rm: no se puede borrar '${params[0]}': No such file or directory`
                );
              }
            } else {
              print("rm: falta el operando del archivo");
            }
            break;
          case "cp":
            if (params[0] && params[1]) {
              const src = resolvePath(params[0]).replace(/\/+/g, "/");
              const dest = resolvePath(params[1]).replace(/\/+/g, "/");

              if (await fileSystem.exists(src)) {
                const content = await fileSystem.readFile(src);

                await fileSystem.writeFile(dest, content);
              } else {
                print(`cp: no se puede copiar '${params[0]}': No such file`);
              }
            } else {
              print("cp: falta archivo origen o destino");
            }
            break;
          case "mv":
            if (params[0] && params[1]) {
              const src = resolvePath(params[0]).replace(/\/+/g, "/");
              const dest = resolvePath(params[1]).replace(/\/+/g, "/");

              if (await fileSystem.exists(src)) {
                const content = await fileSystem.readFile(src);

                await fileSystem.writeFile(dest, content);
                await fileSystem.unlink(src);
              } else {
                print(`mv: no se puede mover '${params[0]}': No such file`);
              }
            } else {
              print("mv: falta archivo origen o destino");
            }
            break;
          case "history":
            if (historyEntries.length === 0) {
              print("Sin historial");
            } else {
              historyEntries.forEach((entry, index) => {
                print(`${index + 1}  ${entry}`);
              });
            }
            break;
          case "ls": {
            const showAll =
              params.includes("-a") || params.includes("-la") || params.includes("-al");
            const longFormat =
              params.includes("-l") || params.includes("-la") || params.includes("-al");
            const files = await fileSystem.readdir(currentCwd);
            const filteredFiles = showAll
              ? files
              : files.filter((file) => !file.startsWith("."));

            if (!longFormat) {
              print(filteredFiles.join("  "));
              break;
            }

            const details = await Promise.all(
              filteredFiles.map(async (file) => {
                const filePath = `${currentCwd}/${file}`.replace(/\/+/g, "/");
                const stats = await fileSystem.lstat(filePath);
                const perms = stats.isDirectory() ? "drwxr-xr-x" : "-rw-r--r--";

                return `${perms} 1 user user 0 Jan 1 00:00 ${file}`;
              })
            );

            for (const detail of details) {
              print(detail);
            }
            break;
          }
          case "pwd":
            print(currentCwd);
            break;
          case "cd":
            if (!params[0]) {
              previousCwdRef.current = currentCwd;
              cwdRef.current = HOME;
              setCwd(HOME);
              break;
            }

            {
              const newPath = resolvePath(params[0])
                .replace(/\/+/g, "/")
                .replace(/\/.\$/, "");

              if (await fileSystem.exists(newPath)) {
                const stat = await fileSystem.lstat(newPath);

                if (stat.isDirectory()) {
                  previousCwdRef.current = currentCwd;
                  cwdRef.current = newPath;
                  setCwd(newPath);
                } else {
                  print(`cd: ${params[0]}: Not a directory`);
                }
              } else {
                print(`cd: ${params[0]}: No such file or directory`);
              }
            }
            break;
          case "mkdir":
            if (params[0]) {
              const dirPath = resolvePath(params[0]).replace(/\/+/g, "/");

              await fileSystem.mkdir(dirPath);
            }
            break;
          case "touch":
            if (params[0]) {
              const filePath = resolvePath(params[0]).replace(/\/+/g, "/");

              await fileSystem.writeFile(filePath, "");
            }
            break;
          case "cat":
            if (params[0]) {
              const filePath = resolvePath(params[0]).replace(/\/+/g, "/");

              if (await fileSystem.exists(filePath)) {
                const contentBuffer = await fileSystem.readFile(filePath);

                print(contentBuffer.toString());
              } else {
                print(`cat: ${params[0]}: No such file`);
              }
            }
            break;
          case "echo":
            print(params.join(" ").replace(/\$PWD/g, currentCwd));
            break;
          case "whoami":
            print("user");
            break;
          case "uname":
            print(
              params[0] === "-a"
                ? "MINGW64_NT winsim 5.15.0-0 x86_64 GNU/Linux"
                : "MINGW64_NT"
            );
            break;
          case "date":
            print(new Date().toString());
            break;
          case "git": {
            const subCommand = params[0];

            if (subCommand === "--version") {
              print("git version 2.42.0");
              break;
            }

            if (subCommand === "config") {
              if (params[1] !== "--global") {
                print("Solo se soporta git config --global en esta simulación.");
                break;
              }

              const configKey = params[2];
              const configValue = params.slice(3).join(" ");

              if (!configKey) {
                print("git config --global <key> <value>");
                break;
              }

              if (!configValue) {
                print("fatal: missing value for config key");
                break;
              }

              if (configKey === "user.name") {
                gitConfig.current.userName = configValue;
                saveGitConfig();
                print(`Set global user.name to '${configValue}'`);
                break;
              }

              if (configKey === "user.email") {
                gitConfig.current.userEmail = configValue;
                saveGitConfig();
                print(`Set global user.email to '${configValue}'`);
                break;
              }

              if (configKey === "color.ui") {
                gitConfig.current.colorUi =
                  configValue === "true" || configValue === "auto";
                saveGitConfig();
                print(`Set global color.ui to '${configValue}'`);
                break;
              }

              print(
                "Config soportado: user.name, user.email, color.ui (solo --global)"
              );
              break;
            }

            if (subCommand === "init") {
              const repoInitRoot = currentCwd;
              const gitDirPath = joinPath(repoInitRoot, ".git");

              if (await fileSystem.exists(gitDirPath)) {
                getRepoState(repoInitRoot);
                print("Reinitialized existing Git repository.");
              } else {
                await ensureDir(joinPath(gitDirPath, "objects"));
                await ensureDir(joinPath(gitDirPath, "refs/heads"));
                await ensureDir(joinPath(gitDirPath, "refs/tags"));
                await ensureDir(joinPath(gitDirPath, "hooks"));
                await ensureDir(joinPath(gitDirPath, "info"));
                await fileSystem.writeFile(
                  joinPath(gitDirPath, "HEAD"),
                  "ref: refs/heads/main\n"
                );
                await fileSystem.writeFile(
                  joinPath(gitDirPath, "config"),
                  "[core]\n\trepositoryformatversion = 0\n\tfilemode = false\n\tbare = false\n"
                );
                await fileSystem.writeFile(
                  joinPath(gitDirPath, "description"),
                  "Unnamed repository; edit this file 'description' to name the repository.\n"
                );
                await fileSystem.writeFile(
                  joinPath(gitDirPath, "refs/heads/main"),
                  ""
                );

                getRepoState(repoInitRoot);

                print(`Initialized empty Git repository in ${repoInitRoot}/.git/`);
              }
              break;
            }

            if (subCommand === "clone") {
              const sourceInput = params[1];
              const destinationInput = params[2];

              if (!sourceInput) {
                print("git clone: falta la ruta origen");
                break;
              }

              const isRemoteClone =
                sourceInput.startsWith("http://") ||
                sourceInput.startsWith("https://") ||
                sourceInput.startsWith("git@");
              const remoteName = sourceInput
                .split("/")
                .pop()
                ?.replace(/\.git$/, "") || "git-demo";
              const cloneFolderName = destinationInput || remoteName;
              const destinationPath = normalizePath(resolvePath(cloneFolderName));

              if (await fileSystem.exists(destinationPath)) {
                print(
                  `fatal: destination path '${cloneFolderName}' already exists and is not an empty directory.`
                );
                break;
              }

              if (isRemoteClone) {
                await ensureDir(destinationPath);
                await ensureDir(joinPath(destinationPath, ".git/objects"));
                await ensureDir(joinPath(destinationPath, ".git/refs/heads"));
                await ensureDir(joinPath(destinationPath, ".git/refs/tags"));
                await fileSystem.writeFile(
                  joinPath(destinationPath, ".git/HEAD"),
                  "ref: refs/heads/main\n"
                );
                await fileSystem.writeFile(
                  joinPath(destinationPath, "README.md"),
                  `# ${remoteName}\n\nCloned from ${sourceInput}\n`
                );

                const clonedRepo = getRepoState(destinationPath);

                clonedRepo.remotes.origin = sourceInput;
                print(`Cloning into '${cloneFolderName}'...`);
                print("remote: Enumerating objects: 12, done.");
                print("Receiving objects: 100% (12/12), done.");
                print("done.");
                break;
              }

              const sourcePath = normalizePath(resolvePath(sourceInput));

              if (!(await fileSystem.exists(sourcePath))) {
                print(`fatal: repository '${sourceInput}' does not exist`);
                break;
              }

              const sourceStats = await fileSystem.lstat(sourcePath);

              if (!sourceStats.isDirectory()) {
                print(`fatal: '${sourceInput}' is not a directory`);
                break;
              }

              const sourceGitDir = joinPath(sourcePath, ".git");

              if (!(await fileSystem.exists(sourceGitDir))) {
                print(`fatal: '${sourceInput}' is not a git repository`);
                break;
              }

              await copyDirectoryRecursive(sourcePath, destinationPath);

              const sourceRepoState = gitRepos.current[sourcePath];

              if (sourceRepoState) {
                const clonedBranches = Object.fromEntries(
                  Object.entries(sourceRepoState.branches).map(
                    ([branchName, commits]) => [
                      branchName,
                      commits.map((commit) => ({
                        ...commit,
                        snapshot: { ...commit.snapshot },
                      })),
                    ]
                  )
                );

                gitRepos.current[destinationPath] = {
                  branch: sourceRepoState.branch,
                  branches: clonedBranches,
                  initialized: true,
                  remotes: { ...sourceRepoState.remotes },
                  staged: new Set(),
                  tags: { ...sourceRepoState.tags },
                  tracked: new Set(sourceRepoState.tracked),
                };
              } else {
                getRepoState(destinationPath);
              }

              print(`Cloning into '${cloneFolderName}'...`);
              print("done.");
              break;
            }

            const repoRoot = await findRepoRoot(currentCwd);

            if (!repoRoot) {
              print("fatal: not a git repository (or any of the parent directories): .git");
              break;
            }

            const repo = getRepoState(repoRoot);
            const headCommit = getHeadCommit(repo);

            if (subCommand === "add") {
              const addArg = params[1];
              const allFiles = await collectFiles(repoRoot);

              if (!addArg || addArg === "." || addArg === "--all") {
                allFiles.forEach((file) => repo.staged.add(file));
                print(`Se agregaron ${allFiles.length} archivo(s) al staging area.`);
                break;
              }

              if (addArg.includes("*")) {
                const matcher = wildcardToRegex(addArg);
                const matched = allFiles.filter((file) => matcher.test(file));

                if (matched.length === 0) {
                  print(`fatal: pathspec '${addArg}' did not match any files`);
                  break;
                }

                matched.forEach((file) => repo.staged.add(file));
                print(`Se agregaron ${matched.length} archivo(s) por patrón.`);
                break;
              }

              const addPath = normalizePath(resolvePath(addArg));

              if (!isPathInside(repoRoot, addPath)) {
                print(`fatal: pathspec '${addArg}' is outside repository`);
                break;
              }

              if (!(await fileSystem.exists(addPath))) {
                print(`fatal: pathspec '${addArg}' did not match any files`);
                break;
              }

              const addStats = await fileSystem.lstat(addPath);

              if (addStats.isDirectory()) {
                const matched = await collectFiles(repoRoot, addPath);

                matched.forEach((file) => repo.staged.add(file));
                print(`Se agregaron ${matched.length} archivo(s) de '${addArg}'.`);
                break;
              }

              const relativeTarget = toRelativePath(repoRoot, addPath);

              repo.staged.add(relativeTarget);
              print(`${relativeTarget} agregado al staging area.`);
              break;
            }

            if (subCommand === "status") {
              const workingSnapshot = await createSnapshot(repoRoot);
              const baseSnapshot = headCommit?.snapshot || {};
              const workingDiff = diffSnapshots(baseSnapshot, workingSnapshot);
              const stagedFiles = [...repo.staged].sort((left, right) =>
                left.localeCompare(right)
              );

              print(`On branch ${repo.branch}`);

              if (stagedFiles.length > 0) {
                print("");
                print("Changes to be committed:");
                stagedFiles.forEach((file) => print(`  ${file}`));
              }

              const unstaged = [...workingDiff.modified, ...workingDiff.deleted].filter(
                (file) => !repo.staged.has(file)
              );

              if (unstaged.length > 0) {
                print("");
                print("Changes not staged for commit:");
                unstaged.forEach((file) => print(`  ${file}`));
              }

              const untracked = workingDiff.added.filter(
                (file) => !repo.staged.has(file)
              );

              if (untracked.length > 0) {
                print("");
                print("Untracked files:");
                untracked.forEach((file) => print(`  ${file}`));
              }

              if (
                stagedFiles.length === 0 &&
                unstaged.length === 0 &&
                untracked.length === 0
              ) {
                print("nothing to commit, working tree clean");
              }

              break;
            }

            if (subCommand === "diff") {
              const stagedMode = params[1] === "--staged";
              const workingSnapshot = await createSnapshot(repoRoot);
              const baseSnapshot = headCommit?.snapshot || {};
              const diff = diffSnapshots(baseSnapshot, workingSnapshot);
              const candidateFiles = stagedMode
                ? [...repo.staged].sort((left, right) => left.localeCompare(right))
                : [...diff.added, ...diff.modified, ...diff.deleted].sort((left, right) =>
                  left.localeCompare(right)
                );

              if (candidateFiles.length === 0) {
                print("No differences");
                break;
              }

              candidateFiles.forEach((file) => {
                const isDeleted = !Object.hasOwn(workingSnapshot, file);
                const oldValue = baseSnapshot[file] || "";
                const newValue = workingSnapshot[file] || "";

                print(`diff --git a/${file} b/${file}`);

                if (isDeleted) {
                  print(`- ${oldValue}`);
                } else if (!Object.hasOwn(baseSnapshot, file)) {
                  print(`+ ${newValue}`);
                } else if (oldValue !== newValue) {
                  print(`- ${oldValue}`);
                  print(`+ ${newValue}`);
                }
              });
              break;
            }

            if (subCommand === "commit") {
              const hasAllFlag = params.includes("-a");
              const isAmend = params.includes("--amend");
              const messageIndex = params.indexOf("-m");
              const message =
                messageIndex !== -1 && params[messageIndex + 1]
                  ? params[messageIndex + 1]
                  : "update";

              if (hasAllFlag) {
                const workingSnapshot = await createSnapshot(repoRoot);
                const baseSnapshot = headCommit?.snapshot || {};
                const trackedChanges = diffSnapshots(baseSnapshot, workingSnapshot);

                [...trackedChanges.modified, ...trackedChanges.deleted].forEach((file) => {
                  repo.staged.add(file);
                });
              }

              if (repo.staged.size === 0) {
                print("nothing to commit, working tree clean");
                break;
              }

              const commitHash = Math.random().toString(16).slice(2, 9);
              const snapshot = await createSnapshot(repoRoot);
              const timestamp = Date.now();

              repo.branches[repo.branch] = repo.branches[repo.branch] || [];

              if (isAmend && repo.branches[repo.branch].length > 0) {
                const previous = repo.branches[repo.branch][0];

                repo.branches[repo.branch][0] = {
                  hash: commitHash,
                  message,
                  parentHash: previous.parentHash,
                  snapshot,
                  timestamp,
                };
              } else {
                repo.branches[repo.branch].unshift({
                  hash: commitHash,
                  message,
                  parentHash: headCommit?.hash,
                  snapshot,
                  timestamp,
                });
              }

              Object.keys(snapshot).forEach((entry) => repo.tracked.add(entry));
              repo.staged.clear();

              await fileSystem.writeFile(
                joinPath(repoRoot, `.git/refs/heads/${repo.branch}`),
                `${commitHash}\n`
              );
              await fileSystem.writeFile(
                joinPath(repoRoot, ".git/COMMIT_EDITMSG"),
                `${message}\n`
              );

              print(`[${repo.branch} ${commitHash}] ${message}`);
              break;
            }

            if (subCommand === "log") {
              const branchCommits = repo.branches[repo.branch] || [];
              const oneLine = params.includes("--oneline");
              const withStat = params.includes("--stat");
              const withGraph = params.includes("--graph");

              if (branchCommits.length === 0) {
                print("fatal: your current branch has no commits yet");
                break;
              }

              branchCommits.forEach((entry, index) => {
                const prefix = withGraph ? "* " : "";

                if (oneLine) {
                  print(`${prefix}${entry.hash} ${entry.message}`);

                  if (withStat) {
                    const parent = branchCommits[index + 1]?.snapshot || {};
                    const stat = diffSnapshots(parent, entry.snapshot);
                    const changedCount =
                      stat.added.length + stat.deleted.length + stat.modified.length;

                    print(
                      ` ${changedCount} files changed (${stat.added.length} additions, ${stat.deleted.length} deletions)`
                    );
                  }
                } else {
                  print(`${prefix}commit ${entry.hash}`);
                  print(
                    `Author: ${gitConfig.current.userName} <${gitConfig.current.userEmail}>`
                  );
                  print(`Date:   ${new Date(entry.timestamp).toString()}`);
                  print("");
                  print(`    ${entry.message}`);
                  print("");
                }
              });
              break;
            }

            if (subCommand === "restore") {
              const stagedMode = params[1] === "--staged";
              const targetInput = stagedMode ? params[2] : params[1];

              if (stagedMode) {
                const stagedTargets = await collectTargetFiles(repoRoot, targetInput);

                if (stagedTargets.length === 0) {
                  print(
                    `fatal: pathspec '${targetInput || "."}' did not match any files`
                  );
                  break;
                }

                stagedTargets.forEach((file) => {
                  repo.staged.delete(file);
                });
                print(`Unstaged ${stagedTargets.length} file(s).`);
                break;
              }

              if (!headCommit) {
                print("fatal: could not restore, no commits yet");
                break;
              }

              const restoreTargets = await collectTargetFiles(repoRoot, targetInput);
              const restorableFiles = restoreTargets.filter((file) =>
                Object.hasOwn(headCommit.snapshot, file)
              );

              if (restorableFiles.length === 0) {
                print(
                  `error: pathspec '${targetInput || "."}' did not match any file(s) known to git`
                );
                break;
              }

              await Promise.all(
                restorableFiles.map((file) =>
                  writeSnapshotFile(repoRoot, file, headCommit.snapshot[file])
                )
              );
              print(`Restored ${restorableFiles.length} file(s).`);
              break;
            }

            if (subCommand === "reset") {
              const headKeyword = params[1] === "HEAD";

              if (headKeyword && params[2]) {
                const target = params[2];
                const headResetTargets = await collectTargetFiles(
                  repoRoot,
                  target
                );

                headResetTargets.forEach((file) => repo.staged.delete(file));
                print("Unstaged changes after reset.");
                break;
              }

              if (params[1] === "--soft" || params[1] === "--hard") {
                const hardMode = params[1] === "--hard";
                const ref = params[2] || "HEAD";
                const branchCommits = repo.branches[repo.branch] || [];
                const targetCommit = resolveCommitRef(branchCommits, ref);

                if (!targetCommit) {
                  print(`fatal: ambiguous argument '${ref}'`);
                  break;
                }

                const targetIndex = branchCommits.findIndex(
                  (commit) => commit.hash === targetCommit.hash
                );

                repo.branches[repo.branch] = branchCommits.slice(targetIndex);

                if (hardMode) {
                  await applyCommitSnapshot(repoRoot, targetCommit.snapshot);
                  repo.staged.clear();
                  print(`HEAD is now at ${targetCommit.hash} ${targetCommit.message}`);
                } else {
                  const previousHead = branchCommits[0];
                  const diff = diffSnapshots(
                    targetCommit.snapshot,
                    previousHead?.snapshot || targetCommit.snapshot
                  );

                  [...diff.added, ...diff.modified, ...diff.deleted].forEach((file) =>
                    repo.staged.add(file)
                  );
                  print(`Soft reset to ${targetCommit.hash}`);
                }

                await fileSystem.writeFile(
                  joinPath(repoRoot, `.git/refs/heads/${repo.branch}`),
                  `${targetCommit.hash}\n`
                );
                break;
              }

              const targetInput = params[1];
              const targetFiles = await collectTargetFiles(repoRoot, targetInput);

              if (targetInput && targetFiles.length === 0) {
                print(`fatal: pathspec '${targetInput}' did not match any files`);
                break;
              }

              const filesToReset =
                targetFiles.length > 0 ? targetFiles : [...repo.staged, ...repo.tracked];

              filesToReset.forEach((file) => {
                repo.staged.delete(file);
              });
              print("Unstaged changes after reset.");
              break;
            }

            if (subCommand === "remote") {
              const action = params[1];

              if (action === "add" && params[2] && params[3]) {
                const [remoteName, remoteUrl] = params.slice(2);

                repo.remotes[remoteName] = remoteUrl;
                print(`Remote '${remoteName}' agregado.`);
                break;
              }

              if (action === "set-url" && params[2] && params[3]) {
                if (!repo.remotes[params[2]]) {
                  print(`fatal: No such remote '${params[2]}'`);
                  break;
                }

                const [remoteName, remoteUrl] = params.slice(2);

                repo.remotes[remoteName] = remoteUrl;
                print(`Remote '${remoteName}' actualizado.`);
                break;
              }

              if ((action === "rm" || action === "remove") && params[2]) {
                if (!repo.remotes[params[2]]) {
                  print(`fatal: No such remote '${params[2]}'`);
                  break;
                }

                delete repo.remotes[params[2]];
                print(`Remote '${params[2]}' eliminado.`);
                break;
              }

              if (action === "-v") {
                Object.entries(repo.remotes).forEach(([name, url]) => {
                  print(`${name}\t${url} (fetch)`);
                  print(`${name}\t${url} (push)`);
                });

                if (Object.keys(repo.remotes).length === 0) {
                  print("No remotes configured.");
                }
                break;
              }

              if (action === "show" && params[2]) {
                const remoteUrl = repo.remotes[params[2]];

                if (!remoteUrl) {
                  print(`fatal: No such remote '${params[2]}'`);
                  break;
                }

                print(`* remote ${params[2]}`);
                print(`  Fetch URL: ${remoteUrl}`);
                print(`  Push  URL: ${remoteUrl}`);
                print(`  HEAD branch: ${repo.branch}`);
                break;
              }

              if (action === "prune" && params[2]) {
                print(`Pruned stale tracking branches from '${params[2]}'.`);
                break;
              }

              print("Uso: git remote add|set-url|rm|-v|show|prune");
              break;
            }

            if (subCommand === "push") {
              if (params[1] === "--tags") {
                print("Pushing tags...");
                print("Everything up-to-date");
                break;
              }

              const remoteName = params[1] || "origin";
              const branchName = params[2] || repo.branch;

              if (!repo.remotes[remoteName]) {
                print(`fatal: '${remoteName}' does not appear to be a git repository`);
                break;
              }

              print(`To ${repo.remotes[remoteName]}`);
              print(` * [new branch]      ${branchName} -> ${branchName}`);
              break;
            }

            if (subCommand === "fetch") {
              print("Fetching origin");
              print("Already up to date.");
              break;
            }

            if (subCommand === "pull") {
              const remoteName = params[1] || "origin";
              const branchName = params[2] || repo.branch;

              if (!repo.remotes[remoteName]) {
                print(`fatal: '${remoteName}' does not appear to be a git repository`);
                break;
              }

              print(`From ${repo.remotes[remoteName]}`);
              print(` * branch            ${branchName} -> FETCH_HEAD`);
              print("Already up to date.");
              break;
            }

            if (subCommand === "branch") {
              if (params[1] === "-d" || params[1] === "-D") {
                const forceDelete = params[1] === "-D";
                const branchName = params[2];

                if (!branchName) {
                  print("fatal: branch name required");
                  break;
                }

                if (branchName === repo.branch) {
                  print("error: Cannot delete branch checked out.");
                  break;
                }

                if (!repo.branches[branchName]) {
                  print(`error: branch '${branchName}' not found.`);
                  break;
                }

                if (!forceDelete && (repo.branches[branchName] || []).length > 0) {
                  print(`error: The branch '${branchName}' is not fully merged.`);
                  break;
                }

                delete repo.branches[branchName];
                print(`Deleted branch ${branchName}.`);
                break;
              }

              if (!params[1]) {
                Object.keys(repo.branches)
                  .sort((left, right) => left.localeCompare(right))
                  .forEach((branchName) => {
                    print(
                      branchName === repo.branch
                        ? `* ${branchName}`
                        : `  ${branchName}`
                    );
                  });
                break;
              }

              const newBranch = params[1];

              if (repo.branches[newBranch]) {
                print(`fatal: a branch named '${newBranch}' already exists`);
                break;
              }

              repo.branches[newBranch] = [...(repo.branches[repo.branch] || [])];
              await fileSystem.writeFile(
                joinPath(repoRoot, `.git/refs/heads/${newBranch}`),
                ""
              );
              print(`Branch '${newBranch}' created.`);
              break;
            }

            if (subCommand === "tag") {
              if (params[1] === "-a" && params[2]) {
                const tagName = params[2];
                const messageIndex = params.indexOf("-m");
                const tagMessage =
                  messageIndex !== -1 && params[messageIndex + 1]
                    ? params[messageIndex + 1]
                    : "";

                if (!headCommit) {
                  print("fatal: Failed to resolve 'HEAD' as a valid ref.");
                  break;
                }

                repo.tags[tagName] = {
                  hash: headCommit.hash,
                  message: tagMessage,
                };
                await fileSystem.writeFile(
                  joinPath(repoRoot, `.git/refs/tags/${tagName}`),
                  `${headCommit.hash}\n`
                );
                print(`Tag '${tagName}' created.`);
                break;
              }

              Object.keys(repo.tags)
                .sort((left, right) => left.localeCompare(right))
                .forEach((tagName) => print(tagName));

              if (Object.keys(repo.tags).length === 0) {
                print("No tags.");
              }
              break;
            }

            if (subCommand === "switch" || subCommand === "checkout") {
              if (params[1] === "--" && params[2]) {
                if (!headCommit) {
                  print("fatal: no commits yet");
                  break;
                }

                const checkoutFiles = await collectTargetFiles(repoRoot, params[2]);
                const knownFiles = checkoutFiles.filter((file) =>
                  Object.hasOwn(headCommit.snapshot, file)
                );

                await Promise.all(
                  knownFiles.map((file) =>
                    writeSnapshotFile(repoRoot, file, headCommit.snapshot[file])
                  )
                );
                print(`Updated ${knownFiles.length} path(s) from HEAD.`);
                break;
              }

              if (params[1] === "-b" && params[2] && params[3]?.startsWith("origin/")) {
                const localName = params[2];

                if (repo.branches[localName]) {
                  print(`fatal: a branch named '${localName}' already exists`);
                  break;
                }

                repo.branches[localName] = [...(repo.branches[repo.branch] || [])];
                repo.branch = localName;
                print(`Branch '${localName}' set up to track '${params[3]}'.`);
                print(`Switched to a new branch '${localName}'`);
                break;
              }

              const createFlag = params[1] === "-c" || params[1] === "-b";
              const branchArgIndex = createFlag ? 2 : 1;
              const branchName = params[branchArgIndex];

              if (!branchName) {
                print(
                  `${subCommand}: falta el nombre de rama (usa '${subCommand} -c nombre' para crear)`
                );
                break;
              }

              if (createFlag) {
                if (repo.branches[branchName]) {
                  print(`fatal: a branch named '${branchName}' already exists`);
                  break;
                }

                repo.branches[branchName] = [...(repo.branches[repo.branch] || [])];
                await fileSystem.writeFile(
                  joinPath(repoRoot, `.git/refs/heads/${branchName}`),
                  ""
                );
                repo.branch = branchName;
                await fileSystem.writeFile(
                  joinPath(repoRoot, ".git/HEAD"),
                  `ref: refs/heads/${branchName}\n`
                );
                print(`Switched to a new branch '${branchName}'`);
                break;
              }

              if (repo.branches[branchName]) {
                repo.branch = branchName;
                await fileSystem.writeFile(
                  joinPath(repoRoot, ".git/HEAD"),
                  `ref: refs/heads/${branchName}\n`
                );
                print(`Switched to branch '${branchName}'`);
                break;
              }

              if (repo.tags[branchName]) {
                const commit = resolveCommitRef(
                  repo.branches[repo.branch] || [],
                  repo.tags[branchName].hash
                );

                if (commit) {
                  await applyCommitSnapshot(repoRoot, commit.snapshot);
                  print(`Note: switching to '${branchName}'.`);
                  print("You are in 'detached HEAD' state.");
                  break;
                }
              }

              print(`error: pathspec '${branchName}' did not match any branch or tag`);
              break;
            }

            if (subCommand === "merge") {
              const sourceBranch = params[1];

              if (!sourceBranch) {
                print("merge: falta el nombre del branch");
                break;
              }

              if (!repo.branches[sourceBranch]) {
                print(`merge: branch '${sourceBranch}' not found`);
                break;
              }

              if (sourceBranch === repo.branch) {
                print("Already up to date.");
                break;
              }

              const sourceHead = repo.branches[sourceBranch][0];

              if (!sourceHead) {
                print("Already up to date.");
                break;
              }

              await applyCommitSnapshot(repoRoot, sourceHead.snapshot);

              const mergeHash = Math.random().toString(16).slice(2, 9);
              repo.branches[repo.branch].unshift({
                hash: mergeHash,
                message: `Merge branch '${sourceBranch}' into ${repo.branch}`,
                parentHash: headCommit?.hash,
                snapshot: sourceHead.snapshot,
                timestamp: Date.now(),
              });
              print(`Merge made by the 'recursive' strategy.`);
              break;
            }

            if (subCommand === "rebase") {
              const rebaseAction = params[1];

              if (!rebaseAction) {
                print(`Successfully rebased and updated ${repo.branch}.`);
                break;
              }

              if (
                rebaseAction === "--continue" ||
                rebaseAction === "--skip" ||
                rebaseAction === "--abort"
              ) {
                print(`Rebase ${rebaseAction.replace("--", "")} completed.`);
                break;
              }

              if (!repo.branches[rebaseAction]) {
                print(`fatal: invalid upstream '${rebaseAction}'`);
                break;
              }

              repo.branches[repo.branch] = [...repo.branches[rebaseAction]];
              print(`Successfully rebased and updated ${repo.branch}.`);
              break;
            }

            if (subCommand === "rm") {
              const targetFile = params[1];

              if (!targetFile) {
                print("git rm: falta archivo");
                break;
              }

              const targetPath = normalizePath(resolvePath(targetFile));

              if (!(await fileSystem.exists(targetPath))) {
                print(`fatal: pathspec '${targetFile}' did not match any files`);
                break;
              }

              await fileSystem.unlink(targetPath);
              repo.staged.add(toRelativePath(repoRoot, targetPath));
              print(`rm '${targetFile}'`);
              break;
            }

            if (subCommand === "rev-parse" && params[1] === "--show-toplevel") {
              print(repoRoot);
              break;
            }

            print(
              "Comando git soportado: config, init, clone, add, status, diff, commit, log, push, pull, fetch, remote, tag, branch, switch, checkout, merge, rebase, reset, restore, rm, rev-parse"
            );
            break;
          }
          case "help":
            [
              "Comandos básicos disponibles:",
              "",
              "  ls / ls -la     Lista archivos",
              "  ll              Alias de ls -la",
              "  pwd             Muestra el directorio actual",
              "  cd DIR          Cambia de directorio",
              "  mkdir DIR       Crea un directorio",
              "  touch FILE      Crea un archivo vacío",
              "  cat FILE        Muestra el contenido de un archivo",
              "  echo TEXT       Imprime texto",
              "  rm FILE         Elimina un archivo",
              "  cp SRC DST      Copia archivo",
              "  mv SRC DST      Mueve/renombra archivo",
              "  history         Muestra historial",
              "  whoami          Usuario actual",
              "  uname -a        Info del sistema simulado",
              "  date            Fecha actual",
              "  clear           Limpia la pantalla",
              "  git --version",
              "  git config --global user.name|user.email|color.ui",
              "  git init / clone / add / status / diff / commit / log",
              "  git restore / git reset / git branch / git checkout / git switch",
              "  git remote / git push / git pull / git fetch / git merge / git rebase",
              "  git tag / git rm",
              "  git rev-parse --show-toplevel",
            ].forEach((helpLine) => {
              print(helpLine);
            });
            break;
          case "clear":
            lineIdRef.current = 0;
            setLines([]);
            break;
          case "exit":
            print("logout");
            break;
          case "":
            break;
          default:
            print(`${cmd}: comando no encontrado`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";

        print(`Error: ${message}`);
      }
    },
    [appendLine, historyEntries]
  );

  const runInput = useCallback(async (): Promise<void> => {
    const command = input;
    const trimmedCommand = command.trim();

    appendLine(`${prompt} ${command}`);
    setInput("");
    historyCursorRef.current = -1;
    pushHistory(command);

    if (trimmedCommand) {
      trackActivityEvent({
        command: trimmedCommand,
        cwd: cwdRef.current,
        type: "commandExecuted",
      });
    }

    await runCommand(command);
  }, [appendLine, input, prompt, pushHistory, runCommand]);

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === "Enter") {
        event.preventDefault();
        runInput().catch(() => {
          appendLine("Error ejecutando comando.");
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (historyEntries.length === 0) return;

        const nextCursor =
          historyCursorRef.current < 0
            ? historyEntries.length - 1
            : Math.max(0, historyCursorRef.current - 1);

        historyCursorRef.current = nextCursor;
        setInput(historyEntries[nextCursor] || "");
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyEntries.length === 0 || historyCursorRef.current < 0) return;

        const nextCursor = historyCursorRef.current + 1;

        if (nextCursor >= historyEntries.length) {
          historyCursorRef.current = -1;
          setInput("");
        } else {
          historyCursorRef.current = nextCursor;
          setInput(historyEntries[nextCursor] || "");
        }
      }
    },
    [appendLine, historyEntries, runInput]
  );

  return (
    <div
      style={{
        background: "#1d1f21",
        color: "#c5c8c6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Consolas, Lucida Console, Courier New, monospace",
        fontSize: 14,
        height: "100%",
        lineHeight: 1.5,
        padding: 8,
        width: "100%",
      }}
    >
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {lines.map((line) => (
          <div key={line.id}>{line.text}</div>
        ))}
      </div>

      <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
        <span style={{ color: "#32cd32" }}>{prompt}</span>
        <input
          onChange={({ target }) => setInput(target.value)}
          onKeyDown={onInputKeyDown}
          spellCheck={false}
          style={{
            background: "transparent",
            border: "none",
            color: "#c5c8c6",
            flex: 1,
            fontFamily: "inherit",
            fontSize: "inherit",
            outline: "none",
          }}
          value={input}
          autoFocus
        />
      </div>
    </div>
  );
};

export default GitBash;

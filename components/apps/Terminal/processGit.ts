import { join } from "path";
import { type FSModule } from "browserfs/dist/node/core/FS";
import {
  type AuthCallback,
  type GitAuth,
  type ReadCommitResult,
  type MessageCallback,
  type ProgressCallback,
  type default as index,
} from "isomorphic-git";
import { type ParsedArgs } from "minimist";
import { help } from "components/apps/Terminal/functions";

const corsProxy = "https://cors.isomorphic-git.org";
const GIT_CONFIG_KEY = "gitbash_global_config";
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
  font-family: "Segoe UI", Tahoma, sans-serif;
  color: var(--text);
}

.hero {
  background: var(--card);
  border: 1px solid #d8dce4;
  border-radius: 12px;
  padding: 28px;
  width: min(560px, 92vw);
}

button {
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  padding: 10px 16px;
}
`,
};

const UPDATE_FOLDER_COMMANDS = new Set([
  "checkout",
  "clone",
  "fetch",
  "init",
  "merge",
  "pull",
]);

export const commands: Record<string, string> = {
  add: "Add a file to the git index (aka staging area)",
  branch: "Create a branch",
  checkout: "Checkout a branch",
  clone: "Clone a repository",
  commit: "Create a new commit",
  diff: "Show changes between the working tree and the last commit",
  fetch: "Fetch commits from a remote repository",
  init: "Initialize a new repository",
  log: "Get commit descriptions from the git history",
  merge: "Merge two branches",
  pull: "Fetch and merge commits from a remote repository",
  push: "Push a branch or tag",
  show: "Show a commit and its changed files",
  status: "Tell whether a file has been changed",
  tag: "Create a lightweight tag",
  version: "Return the version number of isomorphic-git",
};

type GitOptions = Record<string, unknown>;
type GitFunction = (options: GitOptions) => Promise<string | void>;
type StatusMatrixRow = [string, number, number, number];

const normalizePath = (path: string): string => {
  const normalized = path.replace(/\\/g, "/").replace(/\/+/g, "/");

  if (!normalized || normalized === "/") return "/";

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

const toRelativePath = (basePath: string, fullPath: string): string => {
  const base = normalizePath(basePath);
  const full = normalizePath(fullPath);

  if (full === base) return ".";
  if (full.startsWith(`${base}/`)) return full.slice(base.length + 1);

  return full;
};

const fsExists = (fs: FSModule, path: string): Promise<boolean> =>
  new Promise((resolve) => {
    fs.exists(path, resolve);
  });

const fsLstat = (
  fs: FSModule,
  path: string
): Promise<{ isDirectory: () => boolean }> =>
  new Promise((resolve, reject) => {
    fs.lstat(path, (error, stats) =>
      error || !stats
        ? reject(error || new Error(`Unable to stat ${path}`))
        : resolve(stats)
    );
  });

const fsReaddir = (fs: FSModule, path: string): Promise<string[]> =>
  new Promise((resolve, reject) => {
    fs.readdir(path, (error, entries = []) =>
      error ? reject(error) : resolve(entries)
    );
  });

const fsMkdir = (fs: FSModule, path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.mkdir(path, (error?: unknown) => (error ? reject(error) : resolve()));
  });

const fsWriteFile = (
  fs: FSModule,
  path: string,
  content: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, content, (error?: unknown) =>
      error ? reject(error) : resolve()
    );
  });

const fsReadFile = (fs: FSModule, path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (error, content) =>
      error ? reject(error) : resolve(content?.toString() || "")
    );
  });

const mkdirRecursive = async (fs: FSModule, path: string): Promise<void> => {
  const normalizedPath = normalizePath(path);

  if (normalizedPath === "/" || (await fsExists(fs, normalizedPath))) return;

  await mkdirRecursive(fs, parentPath(normalizedPath));
  await fsMkdir(fs, normalizedPath);
};

const findRepoRoot = async (
  fs: FSModule,
  startPath: string
): Promise<string | undefined> => {
  let currentPath = normalizePath(startPath);

  while (currentPath) {
    // eslint-disable-next-line no-await-in-loop
    if (await fsExists(fs, joinPath(currentPath, ".git"))) return currentPath;
    if (currentPath === "/") return undefined;

    currentPath = parentPath(currentPath);
  }

  return undefined;
};

const collectFiles = async (
  fs: FSModule,
  rootPath: string,
  currentPath = rootPath
): Promise<string[]> => {
  const entries = await fsReaddir(fs, currentPath);
  const files = await Promise.all(
    entries
      .filter((entry) => entry !== ".git")
      .map(async (entry) => {
        const fullPath = joinPath(currentPath, entry);
        const stats = await fsLstat(fs, fullPath);

        if (stats.isDirectory()) return collectFiles(fs, rootPath, fullPath);

        return [toRelativePath(rootPath, fullPath)];
      })
  );

  return files.flat().sort((left, right) => left.localeCompare(right));
};

const resolveRepoFilepath = (
  inputPath: string,
  repoRoot: string,
  cd: string
): string => {
  const normalizedInput = normalizePath(inputPath || ".");
  const fullPath = normalizedInput.startsWith("/")
    ? normalizedInput
    : joinPath(cd, normalizedInput);

  return toRelativePath(repoRoot, fullPath);
};

const getAuthor = (): { email: string; name: string } => {
  try {
    const config = JSON.parse(
      window.localStorage.getItem(GIT_CONFIG_KEY) || "{}"
    ) as { userEmail?: string; userName?: string };

    return {
      email: config.userEmail || "user@winsim.local",
      name: config.userName || "user",
    };
  } catch {
    return { email: "user@winsim.local", name: "user" };
  }
};

const printCommit = (
  printLn: (message: string) => void,
  entry: ReadCommitResult
): void => {
  printLn(`commit ${entry.oid}`);
  printLn(`Author: ${entry.commit.author.name} <${entry.commit.author.email}>`);
  printLn(
    `Date:   ${new Date(entry.commit.author.timestamp * 1000).toString()}`
  );
  printLn("");
  printLn(`    ${entry.commit.message.trim()}`);
};

const printFileDiff = (
  printLn: (message: string) => void,
  filepath: string,
  previousContent: string,
  nextContent: string
): void => {
  printLn(`diff --git a/${filepath} b/${filepath}`);
  printLn(previousContent ? `--- a/${filepath}` : "--- /dev/null");
  printLn(nextContent ? `+++ b/${filepath}` : "+++ /dev/null");
  printLn("@@");

  previousContent
    .split("\n")
    .filter(Boolean)
    .forEach((line) => printLn(`-${line}`));
  nextContent
    .split("\n")
    .filter(Boolean)
    .forEach((line) => printLn(`+${line}`));
};

const ensureRepoRoot = async (
  fs: FSModule,
  cd: string,
  printLn: (message: string) => void
): Promise<string | undefined> => {
  const repoRoot = await findRepoRoot(fs, cd);

  if (!repoRoot) {
    printLn(
      "fatal: not a git repository (or any of the parent directories): .git"
    );
  }

  return repoRoot;
};

const processCliGit = async (
  git: typeof index,
  [command, ...args]: string[],
  cd: string,
  printLn: (message: string) => void,
  fs: FSModule
): Promise<boolean> => {
  const repoCommand = async (): Promise<string | undefined> =>
    ensureRepoRoot(fs, cd, printLn);

  switch (command) {
    case "--version":
    case "version":
      printLn("git version 2.42.0");
      return true;

    case "init":
      await git.init({ defaultBranch: "main", dir: cd, fs });
      printLn(`Initialized empty Git repository in ${joinPath(cd, ".git")}/`);
      return true;

    case "clone": {
      const [sourceInput, destinationInput] = args;

      if (sourceInput !== CSS_PULL_LAB_REMOTE) return false;

      const destinationName = destinationInput || "css-pull-lab";
      const destinationPath = joinPath(cd, destinationName);

      if (await fsExists(fs, destinationPath)) {
        const destinationEntries = await fsReaddir(fs, destinationPath);

        if (destinationEntries.length > 0) {
          printLn(
            `fatal: destination path '${destinationName}' already exists and is not an empty directory.`
          );
          return true;
        }
      } else {
        await mkdirRecursive(fs, destinationPath);
      }

      printLn(`Cloning into '${destinationName}'...`);
      await Promise.all(
        Object.entries(CSS_PULL_LAB_FILES).map(([filePath, content]) =>
          fsWriteFile(fs, joinPath(destinationPath, filePath), content)
        )
      );
      await git.init({ defaultBranch: "main", dir: destinationPath, fs });
      await Promise.all(
        Object.keys(CSS_PULL_LAB_FILES).map((filepath) =>
          git.add({ dir: destinationPath, filepath, fs })
        )
      );
      await git.commit({
        author: getAuthor(),
        dir: destinationPath,
        fs,
        message: "feat: base web styles",
      });
      await git.addRemote({
        dir: destinationPath,
        fs,
        remote: "origin",
        url: sourceInput,
      });
      printLn("remote: Enumerating objects: 12, done.");
      printLn("Receiving objects: 100% (12/12), done.");
      printLn("done.");
      return true;
    }

    case "add": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const targets = args.length > 0 ? args : ["."];
      const allFiles = await collectFiles(fs, repoRoot);
      const filepaths = new Set<string>();

      targets.forEach((target) => {
        const filepath = resolveRepoFilepath(target, repoRoot, cd);

        if (filepath === ".") {
          allFiles.forEach((file) => filepaths.add(file));
        } else {
          allFiles
            .filter(
              (file) => file === filepath || file.startsWith(`${filepath}/`)
            )
            .forEach((file) => filepaths.add(file));
        }
      });

      if (filepaths.size === 0) {
        printLn(
          `fatal: pathspec '${targets.join(" ")}' did not match any files`
        );
        return true;
      }

      await Promise.all(
        [...filepaths].map((filepath) =>
          git.add({ dir: repoRoot, filepath, fs })
        )
      );
      return true;
    }

    case "status": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const short = args.includes("-s") || args.includes("--short");
      const branch = await git.currentBranch({
        dir: repoRoot,
        fs,
        fullname: false,
      });
      const matrix = (await git.statusMatrix({
        dir: repoRoot,
        fs,
      })) as StatusMatrixRow[];
      const staged: string[] = [];
      const unstaged: string[] = [];
      const untracked: string[] = [];

      matrix.forEach(([filepath, head, workdir, stage]) => {
        if (head === 0 && workdir !== 0 && stage === 0) {
          untracked.push(filepath);
        } else {
          if (stage !== head) staged.push(filepath);
          if (workdir !== stage) unstaged.push(filepath);
        }
      });

      if (short) {
        staged.forEach((file) => printLn(`A  ${file}`));
        unstaged.forEach((file) => printLn(` M ${file}`));
        untracked.forEach((file) => printLn(`?? ${file}`));
        return true;
      }

      printLn(`On branch ${branch || "main"}`);

      if (staged.length > 0) {
        printLn("");
        printLn("Changes to be committed:");
        staged.forEach((file) => printLn(`  ${file}`));
      }

      if (unstaged.length > 0) {
        printLn("");
        printLn("Changes not staged for commit:");
        unstaged.forEach((file) => printLn(`  ${file}`));
      }

      if (untracked.length > 0) {
        printLn("");
        printLn("Untracked files:");
        untracked.forEach((file) => printLn(`  ${file}`));
      }

      if (
        staged.length === 0 &&
        unstaged.length === 0 &&
        untracked.length === 0
      ) {
        printLn("nothing to commit, working tree clean");
      }

      return true;
    }

    case "commit": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const statusMatrix = (await git.statusMatrix({
        dir: repoRoot,
        fs,
      })) as StatusMatrixRow[];
      const hasStagedChanges = statusMatrix.some(
        ([, head, , stage]) => stage !== head
      );

      if (!hasStagedChanges) {
        printLn("nothing to commit, working tree clean");
        return true;
      }

      const messageFlag = args.findIndex(
        (arg) => arg === "-m" || arg === "--message"
      );
      const message =
        messageFlag !== -1 && args[messageFlag + 1]
          ? args[messageFlag + 1]
          : "";

      if (!message) {
        printLn("error: switch `m' requires a value");
        return true;
      }

      const oid = await git.commit({
        author: getAuthor(),
        dir: repoRoot,
        fs,
        message,
      });
      const branch = await git.currentBranch({
        dir: repoRoot,
        fs,
        fullname: false,
      });

      printLn(`[${branch || "main"} ${oid.slice(0, 7)}] ${message}`);
      return true;
    }

    case "diff": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      let headOid = "";

      try {
        headOid = await git.resolveRef({
          dir: repoRoot,
          fs,
          ref: "HEAD",
        });
      } catch {
        printLn("fatal: the activity repository has no initial commit (HEAD)");
        printLn(
          "hint: reopen the activity or press Retry and wait for the project to finish loading"
        );
        printLn("hint: do not run git add before git diff");
        return true;
      }

      const matrix = (await git.statusMatrix({
        dir: repoRoot,
        fs,
      })) as StatusMatrixRow[];
      const changedFiles = matrix.filter(
        ([, head, workdir]) => head !== workdir
      );

      if (changedFiles.length === 0) {
        printLn("No unstaged changes to show.");
        printLn(
          "hint: edit and save index.html, then run git status --short"
        );
        printLn("hint: git diff must run before git add");
        return true;
      }

      for (const [filepath, head, workdir] of changedFiles) {
        let previousContent = "";
        let nextContent = "";

        if (head !== 0) {
          const { blob } = await git.readBlob({
            dir: repoRoot,
            filepath,
            fs,
            oid: headOid,
          });

          previousContent = new TextDecoder().decode(blob);
        }

        if (workdir !== 0) {
          nextContent = await new Promise<string>((resolve, reject) => {
            fs.readFile(joinPath(repoRoot, filepath), (error, content) =>
              error
                ? reject(error)
                : resolve(content?.toString("utf8") || "")
            );
          });
        }

        printFileDiff(printLn, filepath, previousContent, nextContent);
      }

      return true;
    }

    case "log": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      if (args.includes("--online")) {
        printLn("error: unknown option `online`");
        printLn("hint: Did you mean `git log --oneline`?");
        return true;
      }

      const oneline = args.includes("--oneline");
      const depthFlag = args.findIndex(
        (arg) => arg === "-n" || arg === "--max-count"
      );
      const depth =
        depthFlag !== -1 && Number.isFinite(Number(args[depthFlag + 1]))
          ? Number(args[depthFlag + 1])
          : undefined;
      const entries = await git.log({ depth, dir: repoRoot, fs });

      entries.forEach((entry) => {
        if (oneline) {
          printLn(`${entry.oid.slice(0, 7)} ${entry.commit.message.trim()}`);
        } else {
          printCommit(printLn, entry);
          printLn("");
        }
      });

      return true;
    }

    case "show": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const requestedOid = args.find((arg) => !arg.startsWith("-"));

      if (!requestedOid) {
        printLn("usage: git show <hash>");
        return true;
      }

      const oid = await git.expandOid({
        dir: repoRoot,
        fs,
        oid: requestedOid,
      });
      const entry = await git.readCommit({ dir: repoRoot, fs, oid });

      printCommit(printLn, entry);

      const filepaths = await git.listFiles({ dir: repoRoot, fs, ref: oid });

      for (const filepath of filepaths) {
        const { blob } = await git.readBlob({
          dir: repoRoot,
          filepath,
          fs,
          oid,
        });

        printFileDiff(
          printLn,
          filepath,
          "",
          new TextDecoder().decode(blob)
        );
      }

      return true;
    }

    case "branch": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const branchName = args.find((arg) => !arg.startsWith("-"));

      if (branchName) {
        await git.branch({
          checkout: args.includes("--checkout"),
          dir: repoRoot,
          force: args.includes("-f") || args.includes("--force"),
          fs,
          ref: branchName,
        });
        return true;
      }

      const current = await git.currentBranch({
        dir: repoRoot,
        fs,
        fullname: false,
      });
      const branches = await git.listBranches({ dir: repoRoot, fs });

      branches.forEach((branch) =>
        printLn(`${branch === current ? "*" : " "} ${branch}`)
      );
      return true;
    }

    case "checkout":
    case "switch": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const createBranch = args.includes("-b") || args.includes("-c");
      const ref = args.find((arg) => !arg.startsWith("-"));

      if (!ref) {
        printLn(`usage: git ${command} <branch>`);
        return true;
      }

      if (createBranch) await git.branch({ dir: repoRoot, fs, ref });
      await git.checkout({ dir: repoRoot, fs, ref });
      printLn(`Switched to branch '${ref}'`);
      return true;
    }

    case "remote": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      if (args[0] === "add" && args[1] && args[2]) {
        await git.addRemote({
          dir: repoRoot,
          fs,
          remote: args[1],
          url: args[2],
        });
        return true;
      }

      if (args[0] === "rm" && args[1]) {
        await git.deleteRemote({ dir: repoRoot, fs, remote: args[1] });
        return true;
      }

      const remotes = await git.listRemotes({ dir: repoRoot, fs });

      remotes.forEach((remote) => {
        if (args[0] === "-v") {
          printLn(`${remote.remote}\t${remote.url} (fetch)`);
          printLn(`${remote.remote}\t${remote.url} (push)`);
        } else {
          printLn(remote.remote);
        }
      });

      return true;
    }

    case "push": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const positionals = args.filter(
        (arg) =>
          arg !== "-u" &&
          arg !== "--set-upstream" &&
          !arg.startsWith("--set-upstream=") &&
          !arg.startsWith("-")
      );
      const remoteName = positionals[0] || "origin";
      const branchName =
        positionals[1] ||
        (await git.currentBranch({
          dir: repoRoot,
          fs,
          fullname: false,
        })) ||
        "main";
      const remotes = await git.listRemotes({ dir: repoRoot, fs });
      const remote = remotes.find((entry) => entry.remote === remoteName);

      if (!remote) {
        printLn(
          `fatal: '${remoteName}' does not appear to be a git repository`
        );
        return true;
      }

      try {
        await git.resolveRef({
          dir: repoRoot,
          fs,
          ref: "HEAD",
        });
      } catch {
        printLn("Could not find HEAD.");
        return true;
      }

      if (args.includes("-u") || args.includes("--set-upstream")) {
        await git.setConfig({
          dir: repoRoot,
          fs,
          path: `branch.${branchName}.remote`,
          value: remoteName,
        });
        await git.setConfig({
          dir: repoRoot,
          fs,
          path: `branch.${branchName}.merge`,
          value: `refs/heads/${branchName}`,
        });
      }

      printLn(`To ${remote.url}`);
      printLn(` * [new branch]      ${branchName} -> ${branchName}`);
      return true;
    }

    case "pull": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const remoteName = args.find((arg) => !arg.startsWith("-")) || "origin";
      const branchName =
        args.find((arg, index) => index > 0 && !arg.startsWith("-")) ||
        (await git.currentBranch({
          dir: repoRoot,
          fs,
          fullname: false,
        })) ||
        "main";
      const remotes = await git.listRemotes({ dir: repoRoot, fs });
      const remote = remotes.find((entry) => entry.remote === remoteName);

      if (!remote) {
        printLn(
          `fatal: '${remoteName}' does not appear to be a git repository`
        );
        return true;
      }

      if (remote.url === PULL_BEFORE_PUSH_REMOTE) {
        const stylePath = joinPath(repoRoot, "style.css");
        const currentStyle = (await fsExists(fs, stylePath))
          ? await fsReadFile(fs, stylePath)
          : "";

        if (currentStyle !== PULL_BEFORE_PUSH_STYLE) {
          await fsWriteFile(fs, stylePath, PULL_BEFORE_PUSH_STYLE);
          await git.add({
            dir: repoRoot,
            filepath: "style.css",
            fs,
          });
          const oid = await git.commit({
            author: {
              email: "remote@winsim.local",
              name: "origin",
            },
            dir: repoRoot,
            fs,
            message: "style: actualiza estilos remotos",
          });

          printLn(`From ${remote.url}`);
          printLn(
            `   ${oid.slice(0, 7)}..8f3a91b  ${branchName}       -> ${remoteName}/${branchName}`
          );
          printLn("Updating local branch");
          printLn("Fast-forward");
          printLn(" style.css | 9 ++++++++-");
          printLn(" 1 file changed, 8 insertions(+), 1 deletion(-)");
          return true;
        }
      }

      printLn(`From ${remote.url}`);
      printLn(` * branch            ${branchName} -> FETCH_HEAD`);
      printLn("Already up to date.");
      return true;
    }

    case "tag": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const tagName = args.find((arg) => !arg.startsWith("-"));

      if (tagName) {
        await git.tag({
          dir: repoRoot,
          force: args.includes("-f") || args.includes("--force"),
          fs,
          ref: tagName,
        });
      } else {
        const tags = await git.listTags({ dir: repoRoot, fs });

        tags.forEach((tag) => printLn(tag));
      }

      return true;
    }

    case "rm": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;

      const targets = args.filter((arg) => !arg.startsWith("-"));

      if (targets.length === 0) {
        printLn("git rm: falta archivo");
        return true;
      }

      await Promise.all(
        targets.map((target) =>
          git.remove({
            dir: repoRoot,
            filepath: resolveRepoFilepath(target, repoRoot, cd),
            fs,
          })
        )
      );
      return true;
    }

    case "rev-parse": {
      const repoRoot = await repoCommand();

      if (!repoRoot) return true;
      if (args[0] === "--show-toplevel") printLn(repoRoot);

      return true;
    }

    default:
      return false;
  }
};

const processGit = async (
  [command, ...args]: string[],
  cd: string,
  printLn: (message: string) => void,
  fs: FSModule,
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void
): Promise<void> => {
  const git = await import("isomorphic-git");

  try {
    if (await processCliGit(git, [command, ...args], cd, printLn, fs)) {
      if (UPDATE_FOLDER_COMMANDS.has(command)) updateFolder(cd);

      return;
    }
  } catch (error) {
    printLn((error as Error).message);

    return;
  }

  if (command in git) {
    const http = await import("isomorphic-git/http/web");
    const { default: minimist } = await import("minimist");
    const { username, password, ...cliArgs } = minimist(args) as GitAuth &
      ParsedArgs;
    const onAuth: AuthCallback = () => ({ password, username });
    const onMessage: MessageCallback = (message) =>
      printLn(`remote: ${message.trim()}`);
    const events: string[] = [];
    const onProgress: ProgressCallback = ({ phase }): void => {
      if (events[events.length - 1] !== phase) {
        printLn(phase);
        events.push(phase);
      }
    };
    const options: GitOptions = {
      ...cliArgs,
      corsProxy,
      dir: cd,
      fs,
      http,
      onAuth,
      onMessage,
      onProgress,
    };

    if (command === "clone") {
      if (
        !options.url &&
        cliArgs._ &&
        Array.isArray(cliArgs._) &&
        cliArgs._.length === 1
      ) {
        const [url] = cliArgs._;

        options.url = url;
      }

      const dirName =
        (options.url as string)
          ?.split("/")
          .pop()
          ?.replace(/\.git$/, "") || "";

      if (dirName) {
        printLn(`Cloning into '${dirName}'...`);

        options.dir = join(cd, dirName);
      }
    }

    try {
      const result = await (
        git[command as keyof typeof index] as GitFunction
      )?.(options);

      if (typeof result === "string") {
        printLn(result);
      }
    } catch (error) {
      printLn((error as Error).message);
    }

    if (UPDATE_FOLDER_COMMANDS.has(command)) {
      updateFolder(cd);
    }
  } else {
    help(printLn, commands);
  }
};

export default processGit;

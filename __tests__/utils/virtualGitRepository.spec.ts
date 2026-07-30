import {
  applyGitCommand,
  createInitialGitRepository,
  gitAdd,
  gitBranch,
  gitCheckout,
  gitCommit,
  gitInit,
  gitPush,
  gitRemoteAdd,
  gitStatus,
} from "utils/virtualGitRepository";

const files = {
  "index.html": "<h1>Hola</h1>",
  "style.css": "body { color: black; }",
};

describe("VirtualGitRepository", () => {
  test("git init initializes a repository", () => {
    expect(gitInit(createInitialGitRepository()).initialized).toBe(true);
  });

  test("git add is rejected before git init", () => {
    const repo = gitAdd(createInitialGitRepository(), "index.html", files);

    expect(repo.staged).toEqual([]);
    expect(repo.lastError).toMatch(/not a git repository/i);
  });

  test("git add rejects a missing file", () => {
    const repo = gitAdd(
      gitInit(createInitialGitRepository()),
      "missing.txt",
      files
    );

    expect(repo.staged).toEqual([]);
    expect(repo.lastError).toMatch(/pathspec/i);
  });

  test("git add stages one existing file", () => {
    const repo = gitAdd(
      gitInit(createInitialGitRepository()),
      "index.html",
      files
    );

    expect(repo.staged).toEqual(["index.html"]);
  });

  test("git add dot expands real changed and untracked files", () => {
    const initialized = gitInit(createInitialGitRepository());
    const firstCommit = gitCommit(gitAdd(initialized, ".", files), "base");
    const changedFiles = {
      ...files,
      "index.html": "<h1>Actualizado</h1>",
      "app.js": "console.log('nuevo');",
    };
    const repo = gitAdd(firstCommit, ".", changedFiles);

    expect(repo.staged).toEqual(["app.js", "index.html"]);
  });

  test("git commit fails without staged files", () => {
    const repo = gitCommit(gitInit(createInitialGitRepository()), "empty");

    expect(repo.commits).toHaveLength(0);
    expect(repo.lastError).toMatch(/nothing to commit/i);
  });

  test("git commit stores a real snapshot and clears staging", () => {
    const staged = gitAdd(
      gitInit(createInitialGitRepository()),
      "index.html",
      files
    );
    const repo = gitCommit(staged, "add index");

    expect(repo.commits[0].files).toEqual({
      "index.html": files["index.html"],
    });
    expect(repo.commits[0].changedFiles).toEqual(["index.html"]);
    expect(repo.staged).toEqual([]);
  });

  test("git status separates staged, unstaged and untracked files", () => {
    const initialized = gitInit(createInitialGitRepository());
    const committed = gitCommit(gitAdd(initialized, ".", files), "base");
    const changed = {
      ...files,
      "index.html": "<h1>Cambio</h1>",
      "app.js": "console.log('nuevo');",
    };
    const staged = gitAdd(committed, "index.html", changed);

    expect(gitStatus(staged, changed)).toEqual({
      staged: ["index.html"],
      unstaged: [],
      untracked: ["app.js"],
    });
  });

  test("git branch creates a branch from the current commit", () => {
    const committed = gitCommit(
      gitAdd(gitInit(createInitialGitRepository()), ".", files),
      "base"
    );
    const repo = gitBranch(committed, "feature");

    expect(repo.branches).toContain("feature");
    expect(repo.branchHeads?.feature).toBe(repo.branchHeads?.main);
  });

  test("git checkout changes to an existing branch", () => {
    const initialized = gitInit(createInitialGitRepository());
    const repo = gitCheckout(gitBranch(initialized, "feature"), "feature");

    expect(repo.currentBranch).toBe("feature");
    expect(repo.lastError).toBeUndefined();
  });

  test("git checkout rejects a missing branch", () => {
    const repo = gitCheckout(gitInit(createInitialGitRepository()), "missing");

    expect(repo.currentBranch).toBe("main");
    expect(repo.lastError).toMatch(/did not match any branch/i);
  });

  test("git remote add stores origin", () => {
    const repo = gitRemoteAdd(
      gitInit(createInitialGitRepository()),
      "origin",
      "https://example.com/repo.git"
    );

    expect(repo.remotes.origin).toBe("https://example.com/repo.git");
  });

  test("git push rejects a missing origin", () => {
    const repo = gitPush(
      gitInit(createInitialGitRepository()),
      "origin",
      "main"
    );

    expect(repo.lastPush).toBeUndefined();
    expect(repo.lastError).toMatch(/does not appear/i);
  });

  test("git push rejects a branch without commits", () => {
    const repo = gitRemoteAdd(
      gitInit(createInitialGitRepository()),
      "origin",
      "https://example.com/repo.git"
    );
    const pushed = gitPush(repo, "origin", "main");

    expect(pushed.lastPush).toBeUndefined();
    expect(pushed.lastError).toMatch(/could not find head/i);
  });

  test("applyGitCommand parses push -u origin main as remote and branch", () => {
    const committed = gitCommit(
      gitAdd(gitInit(createInitialGitRepository()), ".", files),
      "base"
    );
    const withRemote = gitRemoteAdd(
      committed,
      "origin",
      "https://example.com/repo.git"
    );
    const pushed = applyGitCommand(withRemote, "git push -u origin main");

    expect(pushed.lastPush).toEqual({ branch: "main", remote: "origin" });
    expect(pushed.lastError).toBeUndefined();
  });

  test("applyGitCommand parses quoted commit messages", () => {
    const initialized = applyGitCommand(
      createInitialGitRepository(),
      "git init"
    );
    const staged = applyGitCommand(initialized, "git add index.html", files);
    const repo = applyGitCommand(staged, 'git commit -m "Agrega portada"');

    expect(repo.commits[0].message).toBe("Agrega portada");
  });
});

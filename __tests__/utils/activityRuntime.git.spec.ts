jest.mock("utils/pg-events", () => ({
  sendActivityPgEvent: jest.fn(),
}));

import {
  getActivityById,
  trackActivityEvent,
  validateActivity,
} from "utils/activityRuntime";

describe("activityRuntime virtual Git integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("an existing REPO_STATE rule reads the virtual repository", () => {
    const activityId = "sch_git_c04_a01";

    trackActivityEvent({
      activityId,
      command: "git remote add origin https://example.com/repo.git",
      cwd: "/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      command: "git remote -v",
      cwd: "/repo",
      type: "commandExecuted",
    });

    const result = validateActivity(activityId, "es");
    const repoCheck = result.results.find(
      ({ checkId }) => checkId === "c04_a01_origin_registered"
    );
    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;

    expect(repoCheck?.passed).toBe(true);
    expect(telemetry.commands).toHaveLength(2);
    expect(telemetry.inferredRepo.remotes.origin).toBe(
      "https://example.com/repo.git"
    );
    expect(telemetry.virtualRepo.remotes.origin).toBe(
      "https://example.com/repo.git"
    );
  });

  test("a legacy catalog activity still completes", () => {
    const activityId = "sch_git_c02_a01";
    const commands = [
      ["mkdir miProyecto", "/"],
      ["cd miProyecto", "/"],
      ["touch index.html style.css app.js", "/miProyecto"],
      ["git init", "/miProyecto"],
    ] as const;

    commands.forEach(([command, cwd]) =>
      trackActivityEvent({
        activityId,
        command,
        cwd,
        type: "commandExecuted",
      })
    );

    expect(getActivityById(activityId, "es")).toBeDefined();
    expect(validateActivity(activityId, "es").completed).toBe(true);
  });

  test("saved workspace files can be staged and committed as real snapshots", () => {
    const activityId = "sch_git_c02_a03";

    trackActivityEvent({
      activityId,
      content: "<h1>Contenido actualizado</h1>",
      path: "/repo/index.html",
      type: "fileSaved",
    });
    trackActivityEvent({
      activityId,
      command: "git add index.html",
      cwd: "/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      command: 'git commit -m "Actualiza contenido principal"',
      cwd: "/repo",
      type: "commandExecuted",
    });

    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;
    const commit = telemetry.virtualRepo.commits.at(-1);

    expect(commit.files["index.html"]).toBe("<h1>Contenido actualizado</h1>");
    expect(commit.changedFiles).toEqual(["index.html"]);
    expect(telemetry.virtualRepo.staged).toEqual([]);
  });

  test("legacy telemetry without virtualRepo keeps validating", () => {
    const activityId = "sch_git_c04_a01";

    window.localStorage.setItem(
      `winsim_activity_telemetry_${activityId}`,
      JSON.stringify({
        commands: [
          {
            command: "git remote add origin https://example.com/repo.git",
            cwd: "/repo",
            timestamp: Date.now(),
          },
          {
            command: "git remote -v",
            cwd: "/repo",
            timestamp: Date.now(),
          },
        ],
        fileContents: {},
        fileSavedPaths: [],
        inferredRepo: {
          author: "user",
          commitsCount: 0,
          initialized: false,
          lastCommitIncludes: [],
          lastCommitMessage: "",
          remoteInSync: false,
          remotes: { origin: "https://example.com/repo.git" },
          staged: [],
        },
        publishedUrls: [],
      })
    );

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });
});

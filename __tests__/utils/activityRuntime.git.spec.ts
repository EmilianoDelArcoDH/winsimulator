jest.mock("utils/pg-events", () => ({
  sendActivityPgEvent: jest.fn(),
}));

import {
  getActivityById,
  saveActivityAnswers,
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

  test("activity 3 requires ordering, a selected change and a relevant justification", () => {
    const activityId = "sch_git_c01_a03";
    const activity = getActivityById(activityId, "es");
    const englishActivity = getActivityById(activityId, "en");

    expect(activity?.data.initialOrder).toEqual([
      "t3",
      "t1",
      "t5",
      "t2",
      "t4",
    ]);
    expect(activity?.data.initialOrder).not.toEqual(activity?.data.answerOrder);
    expect(
      (englishActivity?.data.question as { label: string }).label
    ).toBe("Which change could have broken something? (choose 1)");
    expect(
      (
        englishActivity?.data.question as {
          options: { id: string; label: string }[];
        }
      ).options[0]
    ).toEqual({
      id: "t2",
      label: "I added a contact section.",
    });

    saveActivityAnswers(activityId, {
      itemsOrder: ["t1", "t2", "t3", "t4", "t5"],
      justificacion: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    });

    const incomplete = validateActivity(activityId, "es");

    expect(incomplete.completed).toBe(false);
    expect(
      incomplete.results.find(
        ({ checkId }) => checkId === "c01_a03_culpable_required"
      )?.passed
    ).toBe(false);
    expect(
      incomplete.results.find(
        ({ checkId }) => checkId === "c01_a03_justificacion_alineada"
      )?.passed
    ).toBe(false);

    saveActivityAnswers(activityId, {
      culpable: "t3",
      justificacion:
        "El formulario podría fallar si la corrección rompe la validación de un campo.",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });

  test("activity 3 rejects a justification unrelated to the selected change", () => {
    const activityId = "sch_git_c01_a03";

    saveActivityAnswers(activityId, {
      culpable: "t4",
      itemsOrder: ["t1", "t2", "t3", "t4", "t5"],
      justificacion:
        "El formulario podría fallar si la validación deja de revisar un campo.",
    });

    const result = validateActivity(activityId, "es");

    expect(result.completed).toBe(false);
    expect(
      result.results.find(
        ({ checkId }) => checkId === "c01_a03_justificacion_alineada"
      )?.passed
    ).toBe(false);
  });

  test("activity 4 rejects filler text with isolated keywords", () => {
    const activityId = "sch_git_c01_a04";

    saveActivityAnswers(activityId, {
      detectoConflicto: true,
      explicacion:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Conflicto / resolución.",
      resolution: "combine",
    });

    const result = validateActivity(activityId, "es");

    expect(result.completed).toBe(false);
    expect(
      result.results.find(
        ({ checkId }) => checkId === "c01_a04_text_aligned"
      )?.passed
    ).toBe(false);
  });

  test("activity 4 requires the explanation to match the selected resolution", () => {
    const activityId = "sch_git_c01_a04";

    saveActivityAnswers(activityId, {
      detectoConflicto: true,
      explicacion:
        "Como dos personas cambiaron la misma línea, combinar ambas ideas conserva los aportes y resuelve el conflicto.",
      resolution: "combine",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);

    saveActivityAnswers(activityId, {
      explicacion:
        "Como dos personas cambiaron la misma línea, elijo la versión A porque expresa mejor el título.",
      resolution: "keepB",
    });

    const mismatched = validateActivity(activityId, "es");

    expect(mismatched.completed).toBe(false);
    expect(
      mismatched.results.find(
        ({ checkId }) => checkId === "c01_a04_text_aligned"
      )?.passed
    ).toBe(false);
  });
});

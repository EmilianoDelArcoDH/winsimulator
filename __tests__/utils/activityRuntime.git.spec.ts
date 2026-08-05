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

  test("the clone lab records origin and completes the expected workflow", () => {
    const activityId = "sch_git_c04_a05";

    [
      [
        "git clone https://github.com/winsim-labs/css-pull-lab.git",
        "/git-labs",
      ],
      ["cd css-pull-lab", "/git-labs"],
      ["ls", "/git-labs/css-pull-lab"],
    ].forEach(([command, cwd]) =>
      trackActivityEvent({
        activityId,
        command,
        cwd,
        type: "commandExecuted",
      })
    );

    const result = validateActivity(activityId, "es");
    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;

    expect(telemetry.virtualRepo).toMatchObject({
      initialized: true,
      remotes: {
        origin: "https://github.com/winsim-labs/css-pull-lab.git",
      },
      rootPath: "git-labs/css-pull-lab",
    });
    expect(result.completed).toBe(true);
  });

  test("the upstream push activity starts with HEAD and validates origin/main", () => {
    const activityId = "sch_git_c04_a02";

    [
      "git push -u origin main",
      "git push",
    ].forEach((command) =>
      trackActivityEvent({
        activityId,
        command,
        cwd: "/repo",
        type: "commandExecuted",
      })
    );

    const result = validateActivity(activityId, "es");
    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;

    expect(telemetry.virtualRepo.commits).toHaveLength(1);
    expect(telemetry.virtualRepo.remotes.origin).toBe(
      "https://github.com/estudiante/push-upstream.git"
    );
    expect(telemetry.virtualRepo.lastPush).toEqual({
      branch: "main",
      remote: "origin",
    });
    expect(result.completed).toBe(true);
  });

  test("pull-before-push requires a real local commit after pulling remote changes", () => {
    const activityId = "sch_git_c04_a03";

    ["git pull", "git push"].forEach((command) =>
      trackActivityEvent({
        activityId,
        command,
        cwd: "/repo",
        type: "commandExecuted",
      })
    );

    const emptyFlow = validateActivity(activityId, "es");

    expect(emptyFlow.completed).toBe(false);
    expect(
      emptyFlow.results.find(
        ({ checkId }) => checkId === "c04_a03_commit_exists"
      )?.passed
    ).toBe(false);

    window.localStorage.clear();

    trackActivityEvent({
      activityId,
      command: "git pull",
      cwd: "/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      content:
        "<!doctype html>\n<html><body><h1>Pull before push actualizado</h1></body></html>\n",
      path: "/repo/index.html",
      type: "fileSaved",
    });
    [
      "git status",
      "git add index.html",
      'git commit -m "Actualizo portada despues del pull"',
      "git push",
    ].forEach((command) =>
      trackActivityEvent({
        activityId,
        command,
        cwd: "/repo",
        type: "commandExecuted",
      })
    );

    const result = validateActivity(activityId, "es");
    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;

    expect(telemetry.virtualRepo.commits).toHaveLength(3);
    expect(telemetry.virtualRepo.commits[1].changedFiles).toEqual([
      "style.css",
    ]);
    expect(result.completed).toBe(true);
  });

  test("a legacy catalog activity still completes", () => {
    const activityId = "sch_git_c02_a01";
    const setupCommands = [
      ["mkdir miProyecto", "/Users/Public/Desktop"],
      ["cd miProyecto", "/Users/Public/Desktop"],
      ["git init", "/Users/Public/Desktop/miProyecto"],
      ["touch index.html", "/Users/Public/Desktop/miProyecto"],
    ] as const;

    setupCommands.forEach(([command, cwd]) =>
      trackActivityEvent({
        activityId,
        command,
        cwd,
        type: "commandExecuted",
      })
    );
    trackActivityEvent({
      activityId,
      path: "/Users/Public/Desktop/miProyecto/index.html",
      type: "fileSaved",
    });
    [
      ["git add index.html", "/Users/Public/Desktop/miProyecto"],
      [
        'git commit -m "Crear archivo index.html"',
        "/Users/Public/Desktop/miProyecto",
      ],
    ].forEach(([command, cwd]) =>
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

  test("the three Git states activity accepts the normal post-commit empty staging area", () => {
    const activityId = "sch_git_c02_a02";

    [
      {
        content: "<h1>Contenido actualizado</h1>",
        path: "/miProyecto/index.html",
        type: "fileSaved" as const,
      },
      {
        content: "body { color: #222; }",
        path: "/miProyecto/style.css",
        type: "fileSaved" as const,
      },
    ].forEach((event) => trackActivityEvent({ activityId, ...event }));

    [
      "git status",
      "git add index.html",
      "git status",
      'git commit -m "Actualiza contenido principal"',
    ].forEach((command) =>
      trackActivityEvent({
        activityId,
        command,
        cwd: "/miProyecto",
        type: "commandExecuted",
      })
    );

    const result = validateActivity(activityId, "es");
    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;

    expect(telemetry.virtualRepo.staged).toEqual([]);
    expect(
      result.results.find(
        ({ checkId }) => checkId === "c02_a02_not_added_other"
      )?.passed
    ).toBe(true);
    expect(result.completed).toBe(true);
  });

  test("activity 1 accepts relevant examples without hidden required words", () => {
    const activityId = "sch_git_c01_a01";

    saveActivityAnswers(activityId, {
      cards: {
        c1: "Control de versiones",
        c2: "Copias/caos",
        c3: "Control de versiones",
        c4: "Copias/caos",
        c5: "Control de versiones",
        c6: "Copias/caos",
        c7: "Control de versiones",
        c8: "Copias/caos",
        c9: "Control de versiones",
        c10: "Copias/caos",
      },
      justificacion: [
        "Trabajamos en un cuento con varios amigos y usamos git.",
        "Estoy construyendo un contrato de negocio con el equipo y usamos git.",
      ],
    });

    const result = validateActivity(activityId, "es");

    expect(
      result.results.find(
        ({ checkId }) => checkId === "c01_a01_relevancia"
      )?.passed
    ).toBe(true);
    expect(result.completed).toBe(true);
  });

  test("activity 1 rejects unrelated filler text", () => {
    const activityId = "sch_git_c01_a01";

    saveActivityAnswers(activityId, {
      justificacion: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      ],
    });

    const result = validateActivity(activityId, "es");

    expect(
      result.results.find(
        ({ checkId }) => checkId === "c01_a01_relevancia"
      )?.passed
    ).toBe(false);
  });

  test("the three Git states activity rejects adding style.css explicitly", () => {
    const activityId = "sch_git_c02_a02";

    trackActivityEvent({
      activityId,
      command: "git add style.css",
      cwd: "/miProyecto",
      type: "commandExecuted",
    });

    const result = validateActivity(activityId, "es");

    expect(
      result.results.find(
        ({ checkId }) => checkId === "c02_a02_not_added_other"
      )?.passed
    ).toBe(false);
  });

  test("the oneline history activity seeds a repository and requires two new commits", () => {
    const activityId = "sch_git_c03_a02";
    const activity = getActivityById(activityId, "es");

    expect(activity?.data.form).toEqual([
      { id: "commit1", label: "Primer commit (hash + mensaje)" },
      { id: "commit2", label: "Segundo commit (hash + mensaje)" },
    ]);
    expect(activity?.data.workspace).toMatchObject({
      git: { initialCommit: true },
      resetOnEnter: true,
      rootPath: "/Users/Public/Desktop/repo",
    });
    expect(
      (activity?.data.workspace as { files: unknown[] }).files
    ).toHaveLength(3);

    trackActivityEvent({
      activityId,
      content: "<h1>Primer cambio</h1>",
      path: "/Users/Public/Desktop/repo/index.html",
      type: "fileSaved",
    });
    trackActivityEvent({
      activityId,
      command: "git add index.html",
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      command: 'git commit -m "Actualiza contenido principal"',
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      content: "body { color: #222; }",
      path: "/Users/Public/Desktop/repo/style.css",
      type: "fileSaved",
    });
    trackActivityEvent({
      activityId,
      command: "git add style.css",
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      command: 'git commit -m "Mejora estilos principales"',
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      command: "git log --oneline",
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    saveActivityAnswers(activityId, {
      commit1: "abcdef1 Mejora estilos principales",
      commit2: "1234567 Actualiza contenido principal",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });

  test("the git log activity starts with a readable commit", () => {
    const activityId = "sch_git_c03_a01";
    const activity = getActivityById(activityId, "es");

    expect(activity?.data.workspace).toMatchObject({
      git: { initialCommit: true },
      rootPath: "/Users/Public/Desktop/repo",
    });

    trackActivityEvent({
      activityId,
      command: "git log",
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;

    const commitMessage = telemetry.virtualRepo.commits.at(-1)
      .message as string;

    expect(commitMessage.length).toBeGreaterThan(10);
    saveActivityAnswers(activityId, {
      author: "user",
      message: commitMessage,
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });

  test("the git diff activity can be completed from its seeded workspace", () => {
    const activityId = "sch_git_c03_a03";
    const changedContent =
      "<!doctype html>\n<html><body><h1>Título actualizado</h1></body></html>\n";

    trackActivityEvent({
      activityId,
      content: changedContent,
      path: "/Users/Public/Desktop/repo/index.html",
      type: "fileSaved",
    });
    trackActivityEvent({
      activityId,
      command: "git diff",
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    saveActivityAnswers(activityId, {
      linea: "+<html><body><h1>Título actualizado</h1></body></html>",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });

  test("the git show activity starts with a culprit commit to inspect", () => {
    const activityId = "sch_git_c03_a04";

    trackActivityEvent({
      activityId,
      command: "git log --oneline",
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });

    const telemetry = JSON.parse(
      window.localStorage.getItem(`winsim_activity_telemetry_${activityId}`) ||
        "{}"
    ) as Record<string, any>;
    const culpritHash = telemetry.virtualRepo.commits.at(-1).id as string;

    trackActivityEvent({
      activityId,
      command: `git show ${culpritHash.slice(0, 7)}`,
      cwd: "/Users/Public/Desktop/repo",
      type: "commandExecuted",
    });
    saveActivityAnswers(activityId, {
      hash: culpritHash.slice(0, 7),
      queCambio:
        "El commit agregó un espaciado problemático al título principal.",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });

  test("the first local repository activity starts from Desktop without seeded files", () => {
    const activity = getActivityById("sch_git_c02_a01", "es");

    expect(activity?.data.workspace).toMatchObject({
      files: [],
      rootPath: "/Users/Public/Desktop",
    });
  });

  test("saved workspace files can be staged and committed as real snapshots", () => {
    const activityId = "sch_git_c02_a03";
    const activity = getActivityById(activityId, "es");

    expect(activity?.data.workspace).toMatchObject({
      git: {
        initialCommit: true,
      },
      rootPath: "/repo",
    });

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

  test("commit message rules use the latest commit -m command message", () => {
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
      command: 'git commit -m "Agrega commit"',
      cwd: "/repo",
      type: "commandExecuted",
    });
    trackActivityEvent({
      activityId,
      command: 'git commit -m "Elimina h2 de los encabezados principales"',
      cwd: "/repo",
      type: "commandExecuted",
    });

    const result = validateActivity(activityId, "es");

    expect(
      result.results.find(
        ({ checkId }) => checkId === "c02_a03_message_quality"
      )?.passed
    ).toBe(true);
  });

  test("commit -m with only dots is not accepted as a real message", () => {
    const activityId = "sch_git_c02_a03";

    trackActivityEvent({
      activityId,
      command: 'git commit -m "..."',
      cwd: "/repo",
      type: "commandExecuted",
    });

    const result = validateActivity(activityId, "es");

    expect(
      result.results.find(({ checkId }) => checkId === "c02_a03_commit_with_m")
        ?.passed
    ).toBe(false);
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

    expect(activity?.data.initialOrder).toEqual(["t3", "t1", "t5", "t2", "t4"]);
    expect(activity?.data.initialOrder).not.toEqual(activity?.data.answerOrder);
    expect((englishActivity?.data.question as { label: string }).label).toBe(
      "Which change could have broken something? (choose 1)"
    );
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

  test("activity 2.3 accepts a concise and specific commit message", () => {
    const activityId = "sch_git_c02_a03";

    trackActivityEvent({
      activityId,
      content: "<h1>Título corregido</h1>",
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
      command: 'git commit -m "Corregido el h1"',
      cwd: "/repo",
      type: "commandExecuted",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });

  test("activity 3 accepts any coherent order for the intermediate changes", () => {
    const activityId = "sch_git_c01_a03";

    saveActivityAnswers(activityId, {
      culpable: "t3",
      itemsOrder: ["t1", "t4", "t3", "t2", "t5"],
      justificacion:
        "Puedo cometer un error en el formulario al corregir uno, por eso pienso que este puede ser el error.",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
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
      result.results.find(({ checkId }) => checkId === "c01_a04_text_aligned")
        ?.passed
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

  test("activity 4 accepts combining provisionally and consulting the team", () => {
    const activityId = "sch_git_c01_a04";

    saveActivityAnswers(activityId, {
      detectoConflicto: true,
      explicacion:
        "Combino ambas para poder publicar pero me pongo en contacto con ellos para ver cuál es la correcta",
      resolution: "combine",
    });

    expect(validateActivity(activityId, "es").completed).toBe(true);
  });
});

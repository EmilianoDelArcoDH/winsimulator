import {
  getActivityById,
  saveActivityAnswers,
  trackActivityEvent,
  validateActivity,
} from "utils/activityRuntime";

jest.mock("utils/pg-events", () => ({ sendActivityPgEvent: jest.fn() }));

const cases = {
  en: {
    cleanup:
      "Keep:\n- index.html\n\nRemove:\n- notas.txt\n- prueba-layout-viejo.html\n- copia_final_ahora_si.png\n\nKeep only the files the site needs to work.",
    commit: "Fix the h1",
    conflict:
      "I would keep version A after asking the team which wording we should use.",
    content: "Changes ready to publish",
    diff: "Updated title",
    examples: [
      "The team can track each change in the project.",
      "I can recover an earlier version of a file.",
    ],
    ready: "Ready to publish: relative paths and images have been checked.",
    rename:
      "mi-foto-final.png\nbanner-home.png\nestilos-finales.css\nUse lowercase letters and hyphens, without spaces.",
    report:
      "The latest commit was not pushed. I would reload the page after git push.",
    title: "Updated site",
  },
  pt: {
    cleanup:
      "Manter:\n- index.html\n\nRemover:\n- notas.txt\n- prueba-layout-viejo.html\n- copia_final_ahora_si.png\n\nManter apenas os arquivos necessários para o site funcionar.",
    commit: "Corrige o h1",
    conflict:
      "Vou manter a versão A depois de consultar a equipe e decidir o texto em conjunto.",
    content: "Alterações prontas para publicar",
    diff: "Título atualizado",
    examples: [
      "A equipe acompanha as alterações do projeto.",
      "Posso recuperar uma versão anterior de um arquivo.",
    ],
    ready:
      "Pronto para publicar: caminhos relativos e imagens foram conferidos.",
    rename:
      "mi-foto-final.png\nbanner-home.png\nestilos-finales.css\nUsar letras minúsculas e hífens, sem espaços.",
    report:
      "Faltou fazer push do último commit. Eu verificaria a mudança ao recarregar a página.",
    title: "Site atualizado",
  },
};

const save = (activityId: string, path: string, content: string): void => {
  trackActivityEvent({ activityId, content, path, type: "fileSaved" });
};
const command = (activityId: string, text: string, cwd = "/repo"): void => {
  trackActivityEvent({
    activityId,
    command: text,
    cwd,
    type: "commandExecuted",
  });
};

describe.each(["en", "pt"] as const)(
  "activities can be completed in %s",
  (language) => {
    const sample = cases[language];
    const expectContentChecks = (activityId: string): void => {
      const activity = getActivityById(activityId, language);
      const contentChecks = new Set(
        activity?.validation.checks
          .filter(({ type }) => type === "FILE_CONTENT_REGEX")
          .map(({ checkId }) => checkId)
      );
      const results = validateActivity(activityId, language).results.filter(
        ({ checkId }) => contentChecks.has(checkId)
      );
      expect(results.length).toBeGreaterThan(0);
      expect(results.filter(({ passed }) => !passed)).toEqual([]);
    };

    beforeEach(() => {
      window.localStorage.clear();
      document.documentElement.lang = language;
    });

    afterEach(() => {
      document.documentElement.lang = "";
    });

    test("classification accepts localized explanations while keeping answer keys stable", () => {
      const activityId = "sch_git_c01_a01";
      const key = getActivityById(activityId, language)?.data
        .answerKey as Record<string, string[]>;
      const cards = Object.fromEntries(
        Object.entries(key).flatMap(([column, ids]) =>
          ids.map((id) => [id, column])
        )
      );
      saveActivityAnswers(activityId, {
        cards,
        justificacion: sample.examples,
      });
      expect(validateActivity(activityId, language).completed).toBe(true);
    });

    test("conflict checkbox remains connected to validation", () => {
      const activityId = "sch_git_c01_a04";
      const activity = getActivityById(activityId, language);
      saveActivityAnswers(activityId, {
        [(activity?.data.required as { checkboxId: string }).checkboxId]: true,
        explicacion: sample.conflict,
        resolution: "keepA",
      });
      expect(validateActivity(activityId, language).completed).toBe(true);
    });

    test("the suggested commit message passes the actual commit rules", () => {
      const activityId = "sch_git_c02_a03";
      save(activityId, "/repo/index.html", "<h1>Heading</h1>\n");
      command(activityId, "git add index.html");
      command(activityId, `git commit -m "${sample.commit}"`);
      expect(validateActivity(activityId, language).completed).toBe(true);
      command(activityId, 'git commit -m "fix"');
      expect(validateActivity(activityId, language).completed).toBe(false);
    });

    test("translated cleanup plans and filename guidelines pass", () => {
      expect.assertions(4);
      save(
        "sch_publish_c01_a02",
        "/Users/Public/Desktop/publish-c01-a02/plan-limpieza.txt",
        sample.cleanup
      );
      expectContentChecks("sch_publish_c01_a02");
      save(
        "sch_publish_c01_a04",
        "/Users/Public/Desktop/publish-c01-a04/renombres-sugeridos.txt",
        sample.rename
      );
      expectContentChecks("sch_publish_c01_a04");
    });

    test.each([
      ["sch_publish_c01_a05", "checklist-previo.txt"],
      ["sch_pages_c01_a04", "checklist-post-publicacion.txt"],
    ])(
      "checked starter checklist passes and unchecked items fail: %s",
      (activityId, filename) => {
        const workspace = getActivityById(activityId, language)?.data
          .workspace as {
          files: { content: string; path: string }[];
        };
        const file = workspace.files.find(({ path }) =>
          path?.endsWith(filename)
        );
        expect(file).toBeDefined();
        if (!file) throw new Error("Missing checklist");
        save(activityId, file.path, file.content);
        const unchecked = validateActivity(activityId, language).results;
        expect(unchecked.some(({ passed }) => !passed)).toBe(true);
        save(activityId, file.path, file.content.replaceAll("[ ]", "[x]"));
        expectContentChecks(activityId);
      }
    );

    test("publishing assessments, edited headings, and troubleshooting accept localized text", () => {
      [
        [
          "sch_pages_c01_a01",
          "/Users/Public/Desktop/pages-c01-a01/estado-previo.txt",
          sample.ready,
        ],
        [
          "sch_pages_c02_a01",
          "/Users/Public/Desktop/pages-c02-a01/index.html",
          `<h1>${sample.title}</h1>`,
        ],
        [
          "sch_pages_c02_a02",
          "/Users/Public/Desktop/pages-c02-a02/index.html",
          `<body>${sample.content}</body>`,
        ],
        [
          "sch_pages_c02_a04",
          "/Users/Public/Desktop/pages-c02-a04/reporte-errores.txt",
          sample.report,
        ],
      ].forEach(([activityId, path, content]) => {
        save(activityId, path, content);
        expectContentChecks(activityId);
        save(activityId, path, "unrelated text");
        expect(validateActivity(activityId, language).completed).toBe(false);
      });
    });

    test("repository step order accepts the translated commit message", () => {
      const activityId = "sch_pages_c01_a02";
      const cwd = "/Users/Public/Desktop/pages-c01-a02";
      command(activityId, "git init", cwd);
      command(activityId, "git add .", cwd);
      command(
        activityId,
        `git commit -m "${language === "en" ? "Prepare project for publishing" : "Prepara projeto para publicar"}"`,
        cwd
      );
      expect(validateActivity(activityId, language).completed).toBe(true);
    });

    test("diff answers match the localized saved file", () => {
      const activityId = "sch_git_c03_a03";
      const cwd = "/Users/Public/Desktop/repo";
      const line = `<html><body><h1>${sample.diff}</h1></body></html>`;
      save(activityId, `${cwd}/index.html`, `<!doctype html>\n${line}\n`);
      command(activityId, "git diff", cwd);
      saveActivityAnswers(activityId, { linea: `+${line}` });
      expect(validateActivity(activityId, language).completed).toBe(true);
    });
  }
);

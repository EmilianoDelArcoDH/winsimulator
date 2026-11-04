/* eslint-disable sonarjs/null-dereference -- The fixture paths are required strings. */
import catalog from "utils/activitiesCatalog.json";
import {
  getActivityById,
  saveActivityAnswers,
  trackActivityEvent,
  validateActivity,
  type ActivityDefinition,
} from "utils/activityRuntime";

jest.mock("utils/pg-events", () => ({ sendActivityPgEvent: jest.fn() }));

type StoredTelemetry = {
  inferredRepo: { author: string };
  virtualRepo: {
    commits: { id: string; message: string }[];
    files: Record<string, string>;
  };
};

type Language = "en" | "pt";
type SeedFile = { content: string; path: string };
type Harness = {
  activity: ActivityDefinition;
  answer: (answers: Record<string, unknown>) => void;
  commit: (message?: string) => void;
  files: SeedFile[];
  language: Language;
  latest: () => { author: string; hash: string; message: string };
  publish: (slug?: string) => string;
  run: (command: string, cwd?: string) => void;
  save: (name: string, content: string) => void;
  seed: (name: string) => string;
  text: (english: string, portuguese: string) => string;
};

const classify = ({ activity, answer, text }: Harness): void => {
  const key = activity.data.answerKey as Record<string, string[]>;
  const cards = Object.fromEntries(
    Object.entries(key).flatMap(([column, ids]) =>
      ids.map((id) => [id, column])
    )
  );
  answer({
    cards,
    explicacion: text(
      "Git tracks changes locally; GitHub hosts repositories on the web.",
      "O Git controla alterações localmente; o GitHub hospeda repositórios na web."
    ),
    justificacion: [
      text(
        "The team can recover an earlier version of the project.",
        "A equipe pode recuperar uma versão anterior do projeto."
      ),
      text(
        "Each commit describes the changes to the files.",
        "Cada commit descreve as alterações nos arquivos."
      ),
    ],
  });
};
const stageAndCommit = ({ commit, run, save, text }: Harness): void => {
  save(
    "index.html",
    `<h1>${text("My updated project", "Meu projeto atualizado")}</h1>`
  );
  run("git status");
  run("git add index.html");
  run("git status");
  commit();
};
const remoteWorkflow = (h: Harness): void => {
  h.run("git pull");
  stageAndCommit(h);
  h.run("git push");
};
const clone = ({ run }: Harness): void => {
  run("git clone https://github.com/winsim-labs/css-pull-lab.git");
  run("cd css-pull-lab");
  run("ls", "/git-labs/css-pull-lab");
};
const checklist = (h: Harness, name: string): void =>
  h.save(name, h.seed(name).replaceAll("[ ]", "[x]"));

// Each scenario follows a complete learner workflow, using localized answers
// and messages. These are independent of the validation regexes and answer rules.
const solutions: Record<string, (h: Harness) => void> = {
  sch_git_c01_a01: classify,
  sch_git_c01_a02: classify,
  sch_git_c01_a03: ({ answer, text }) =>
    answer({
      culpable: "t3",
      itemsOrder: ["t1", "t2", "t3", "t4", "t5"],
      justificacion: text(
        "Fixing the form could cause the field validation to fail.",
        "Ao corrigir o formulário, a validação de um campo poderia falhar."
      ),
    }),
  sch_git_c01_a04: ({ answer, text }) =>
    answer({
      detectoConflicto: true,
      explicacion: text(
        "I would keep version A after discussing the intended wording with the team.",
        "Vou manter a versão A depois de conversar com a equipe sobre o texto desejado."
      ),
      resolution: "keepA",
    }),
  sch_git_c02_a00: ({ run }) => {
    run('git config --global user.name "Alex Morgan"');
    run('git config --global user.email "alex@example.com"');
  },
  sch_git_c02_a01: ({ run, save, text }) => {
    run("mkdir miProyecto");
    run("cd miProyecto");
    const cwd = "/Users/Public/Desktop/miProyecto";
    run("git init", cwd);
    run("touch index.html", cwd);
    save("miProyecto/index.html", "<h1>Git</h1>");
    run("git add index.html", cwd);
    run(
      `git commit -m "${text("Add index.html file", "Adiciona arquivo index.html")}"`,
      cwd
    );
  },
  sch_git_c02_a02: (h) => {
    h.save("style.css", "h1 { color: blue; }");
    stageAndCommit(h);
  },
  sch_git_c02_a03: stageAndCommit,
  sch_git_c02_a04: (h) => {
    h.run("git init");
    stageAndCommit(h);
  },
  sch_git_c03_a01: ({ answer, latest, run }) => {
    run("git log");
    const { author, message } = latest();
    answer({ author, message });
  },
  sch_git_c03_a02: (h) => {
    stageAndCommit(h);
    const first = h.latest();
    h.save("style.css", "h1 { color: blue; }");
    h.run("git add style.css");
    h.commit(h.text("Improve main styles", "Melhora estilos principais"));
    h.run("git log --oneline");
    const second = h.latest();
    h.answer({
      commit1: `${second.hash} ${second.message}`,
      commit2: `${first.hash} ${first.message}`,
    });
  },
  sch_git_c03_a03: ({ answer, run, save, text }) => {
    const line = `<html><body><h1>${text("Updated title", "Título atualizado")}</h1></body></html>`;
    save("index.html", `<!doctype html>\n${line}\n`);
    run("git diff");
    answer({ linea: `+${line}` });
  },
  sch_git_c03_a04: ({ answer, latest, run, text }) => {
    run("git log --oneline");
    const { hash } = latest();
    run(`git show ${hash}`);
    answer({
      hash,
      queCambio: text(
        "The heading spacing changed, affecting the page layout.",
        "O espaçamento do título mudou, afetando o layout da página."
      ),
    });
  },
  sch_git_c04_a01: ({ run }) => {
    run("git remote add origin https://github.com/estudiante/remote-setup.git");
    run("git remote -v");
  },
  sch_git_c04_a02: ({ run }) => {
    run("git push -u origin main");
    run("git push");
  },
  sch_git_c04_a03: remoteWorkflow,
  sch_git_c04_a04: remoteWorkflow,
  sch_git_c04_a05: clone,
  sch_git_c04_a06: ({ run }) => {
    run("git pull");
    run("cat styles.css");
  },
  sch_git_c04_a07: (h) => {
    clone(h);
    h.run("git pull", "/git-labs/css-pull-lab");
  },
  sch_pages_c01_a01: ({ save, text }) =>
    save(
      "estado-previo.txt",
      text(
        "Ready to publish. Check relative paths and images.",
        "Pronto para publicar. Conferir caminhos relativos e imagens."
      )
    ),
  sch_pages_c01_a02: ({ commit, run }) => {
    run("git init");
    run("git add .");
    commit();
  },
  sch_pages_c01_a03: ({ publish, save }) => save("url-publica.txt", publish()),
  sch_pages_c01_a04: (h) => {
    h.publish();
    checklist(h, "checklist-post-publicacion.txt");
  },
  sch_pages_c02_a01: ({ save, text }) =>
    save("index.html", `<h1>${text("Updated site", "Site atualizado")}</h1>`),
  sch_pages_c02_a02: ({ commit, run, save, text }) => {
    save(
      "index.html",
      `<body>${text("Changes ready to publish", "Alterações prontas para publicar")}</body>`
    );
    run("git init");
    run("git add .");
    commit();
  },
  sch_pages_c02_a03: ({ commit, publish, run, save, text }) => {
    save(
      "index.html",
      `<h1>${text("Republished site", "Site republicado")}</h1>`
    );
    const url = publish("ciclo-pages");
    run("git init");
    run("git add .");
    commit();
    run("git push");
    save("url-republicada.txt", url);
  },
  sch_pages_c02_a04: ({ save, text }) =>
    save(
      "reporte-errores.txt",
      text(
        "I forgot to push the commit. I would push and reload the page.",
        "Esqueci de fazer push do commit. Vou fazer push e recarregar a página."
      )
    ),
  sch_pages_c03_a01: ({ commit, files, publish, run, save, seed, text }) => {
    files.forEach(({ content, path }) => save(path, content));
    run("git init");
    run("git add .");
    commit();
    run("git remote add origin https://github.com/estudiante/demo-final.git");
    run("git push origin main");
    const url = publish("demo-final");
    save(
      "js/app.js",
      seed("js/app.js").replace(
        /textContent = '[^']*'/,
        `textContent = '${text("Updated demo", "Demo atualizada")}'`
      )
    );
    save(
      "css/styles.css",
      seed("css/styles.css").replace("#4f46e5", "#2563eb")
    );
    run("git add .");
    commit(text("Update published demo", "Atualiza demo publicada"));
    run("git push origin main");
    save("url-demo.txt", url);
  },
  sch_publish_c01_a01: ({ save }) =>
    save(
      "propuesta-estructura.txt",
      "index.html\ncss/estilos.css\njs/script.js\nimg/logo.png"
    ),
  sch_publish_c01_a02: ({ save, text }) =>
    save(
      "plan-limpieza.txt",
      text(
        "Keep:\nindex.html\nRemove:\nnotas.txt\nprueba-layout-viejo.html\ncopia_final_ahora_si.png\nKeep only the files the site needs to work.",
        "Manter:\nindex.html\nRemover:\nnotas.txt\nprueba-layout-viejo.html\ncopia_final_ahora_si.png\nManter apenas os arquivos necessários para o site funcionar."
      )
    ),
  sch_publish_c01_a03: ({ save, seed }) =>
    save(
      "index.html",
      seed("index.html")
        .replace(
          "C:/Users/Ana/Desktop/proyecto/css/estilos.css",
          "css/estilos.css"
        )
        .replace("/Users/ana/Desktop/proyecto/img/logo.png", "img/logo.png")
        .replace("D:/trabajos/final/js/app.js", "js/app.js")
    ),
  sch_publish_c01_a04: ({ save, text }) =>
    save(
      "renombres-sugeridos.txt",
      `mi-foto-final.png\nbanner-home.png\nestilos-finales.css\n${text("Use lowercase letters and hyphens without spaces.", "Use letras minúsculas e hífens, sem espaços.")}`
    ),
  sch_publish_c01_a05: (h) => checklist(h, "checklist-previo.txt"),
};

const activityIds = catalog.classes.flatMap(({ activities }) =>
  activities.map(({ id }) => id)
);

test("every catalog activity has a complete localization scenario", () => {
  expect(Object.keys(solutions).sort((a, b) => a.localeCompare(b))).toEqual(
    [...activityIds].sort((a, b) => a.localeCompare(b))
  );
});

describe.each(["en", "pt"] as const)(
  "complete activity workflows in %s",
  (language) => {
    beforeEach(() => {
      window.localStorage.clear();
      document.documentElement.lang = language;
    });

    afterEach(() => {
      document.documentElement.lang = "";
    });

    test.each(activityIds)(
      "%s accepts a complete localized solution and returns translated feedback",
      (id) => {
        const activity = getActivityById(id, language) as ActivityDefinition;
        const workspace = activity.data.workspace as
          | { files?: SeedFile[]; rootPath: string }
          | undefined;
        const root = workspace?.rootPath || "/";
        const files = workspace?.files || [];
        const text = (english: string, portuguese: string): string =>
          language === "en" ? english : portuguese;
        const run = (command: string, cwd = root): void => {
          trackActivityEvent({
            activityId: id,
            command,
            cwd,
            type: "commandExecuted",
          });
        };
        const h: Harness = {
          activity,
          answer: (answers) => saveActivityAnswers(id, answers),
          commit: (
            message = text("Update main heading", "Atualiza título principal")
          ) => run(`git commit -m "${message}"`),
          files,
          language,
          latest: () => {
            const telemetry = JSON.parse(
              window.localStorage.getItem(`winsim_activity_telemetry_${id}`) ||
                "{}"
            ) as StoredTelemetry;
            const { commits } = telemetry.virtualRepo;
            const last = commits[commits.length - 1];
            return {
              author: telemetry.inferredRepo.author,
              hash: last.id,
              message: last.message,
            };
          },
          publish: (slug = "mi-sitio") => {
            run(`pages publish ${slug}`);
            const url = `https://estudiante.pages.dev/${slug}`;
            trackActivityEvent({ activityId: id, type: "pagesPublished", url });
            return url;
          },
          run,
          save: (name, content) =>
            trackActivityEvent({
              activityId: id,
              content,
              path: name.startsWith("/") ? name : `${root}/${name}`,
              type: "fileSaved",
            }),
          seed: (name) =>
            files.find(({ path }) => path === `${root}/${name}`)?.content || "",
          text,
        };
        solutions[id](h);
        const result = validateActivity(id, language);
        expect(result.results.filter(({ passed }) => !passed)).toEqual([]);
        expect(result.completed).toBe(true);
        result.results.forEach(({ message }) =>
          expect(message?.length).toBeGreaterThan(0)
        );
      }
    );
  }
);

describe.each(["en", "pt"] as const)(
  "localization regressions in %s",
  (language) => {
    beforeEach(() => {
      window.localStorage.clear();
      document.documentElement.lang = language;
    });

    afterEach(() => {
      document.documentElement.lang = "";
    });

    test("cloning the practice lab localizes both HTML and README", () => {
      const id = "sch_git_c04_a05";
      trackActivityEvent({
        activityId: id,
        command: "git clone https://github.com/winsim-labs/css-pull-lab.git",
        cwd: "/git-labs",
        type: "commandExecuted",
      });
      const telemetry = JSON.parse(
        window.localStorage.getItem(`winsim_activity_telemetry_${id}`) || "{}"
      ) as StoredTelemetry;
      const { files } = telemetry.virtualRepo;
      expect(files["index.html"]).toContain(
        `lang="${language === "en" ? "en-US" : "pt-BR"}"`
      );
      expect(files["index.html"]).toContain(
        language === "en" ? "View changes" : "Ver alterações"
      );
      expect(files["README.md"]).toContain(
        language === "en"
          ? "Practice `git pull`"
          : "Pratique o comando `git pull`"
      );
      expect(files["styles.css"]).toContain("--bg: #f7f7f7;");
    });

    test.each([
      "changes",
      "fixed stuff",
      "alterações",
      "corrigi coisas",
      "cambios",
      "arreglé cosas",
    ])("rejects the vague commit message %s", (message) => {
      const id = "sch_pages_c02_a02";
      trackActivityEvent({
        activityId: id,
        command: `git commit -m "${message}"`,
        cwd: "/repo",
        type: "commandExecuted",
      });
      const activity = getActivityById(id, language);
      const check = activity?.validation.checks.find(
        ({ type }) => type === "TERMINAL_REGEX"
      );
      expect(check).toBeDefined();
      expect(
        validateActivity(id, language).results.find(
          ({ checkId }) => checkId === check?.checkId
        )?.passed
      ).toBe(false);
    });

    test.each([
      "action-button",
      "status-message",
      "css/styles.css",
      "js/app.js",
    ])("final HTML still requires %s", (required) => {
      const id = "sch_pages_c03_a01";
      const activity = getActivityById(id, language) as ActivityDefinition;
      const workspace = activity.data.workspace as { files: SeedFile[] };
      const html = workspace.files.find(({ path }) =>
        path.endsWith("/index.html")
      ) as SeedFile;
      trackActivityEvent({
        activityId: id,
        content: html.content.replace(required, "missing"),
        path: html.path,
        type: "fileSaved",
      });
      expect(
        validateActivity(id, language).results.find(
          ({ checkId }) => checkId === "final_html_saved_and_linked"
        )?.passed
      ).toBe(false);
    });
  }
);

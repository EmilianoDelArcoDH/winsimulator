import { memo, useEffect, useMemo, useRef, useState } from "react";
import git from "isomorphic-git";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import {
  type ActivityCard,
  type ActivityClass,
  type ActivityDefinition,
  type ActivityOption,
  getActivitiesCatalog,
  getActivityById,
  getActivityState,
  saveActivityAnswers,
  setCurrentActivityId,
  retryActivity,
  type ValidationResult,
  validateActivity,
} from "utils/activityRuntime";
import { getSearchParam } from "utils/functions";
import { translateActivityText } from "utils/activityI18n";
import { getLanguageFromValue } from "utils/i18n";

type ActivitiesProps = ComponentProcessProps & {
  forcedActivityId?: string;
  standalone?: boolean;
};

type CardAnswers = Record<string, string>;

type FreeTextConfig = {
  id: string;
  label: string;
  minItems?: number;
};

type QuestionData = {
  label?: string;
  options?: (ActivityOption | string)[];
};

type FormField = {
  id: string;
  label: string;
};

type WorkspaceSeedFile = {
  content: string;
  path: string;
  source?: string;
};

type WorkspaceSeed = {
  files: WorkspaceSeedFile[];
  folders: string[];
  git?: {
    initialCommit: boolean;
    message: string;
    remotes: Record<string, string>;
  };
  openFile: string;
  openInVscode: boolean;
  overwriteFiles: boolean;
  resetOnEnter: boolean;
  rootPath: string;
};

const containerStyle: React.CSSProperties = {
  background:
    "radial-gradient(circle at top, rgba(50, 95, 255, 0.10), transparent 38%), linear-gradient(180deg, #0f1116 0%, #0b0d12 100%)",
  color: "#f1f1f1",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  height: "100%",
  minHeight: 0,
  overflow: "auto",
  padding: 16,
  paddingBottom: 88,
};

const panelStyle: React.CSSProperties = {
  background: "rgba(20, 22, 28, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 14,
  boxShadow: "0 18px 48px rgba(0, 0, 0, 0.24)",
  minWidth: 0,
  overflow: "hidden",
  padding: 16,
};

const inputStyle: React.CSSProperties = {
  background: "rgba(11, 13, 18, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.10)",
  borderRadius: 10,
  color: "#f1f1f1",
  padding: "10px 12px",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #4b74ff 0%, #2d5fff 100%)",
  border: "1px solid rgba(111, 146, 255, 0.75)",
  borderRadius: 10,
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 40,
  padding: "10px 16px",
};

const actionsStyle: React.CSSProperties = {
  backdropFilter: "blur(10px)",
  background: "rgba(11, 13, 18, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 14,
  bottom: 12,
  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.25)",
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  justifyContent: "flex-start",
  marginTop: "auto",
  padding: 12,
  position: "sticky",
  zIndex: 8,
};

const shellStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const heroStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(45, 95, 255, 0.18), rgba(16, 18, 24, 0.92) 45%, rgba(16, 18, 24, 0.98))",
  border: "1px solid rgba(111, 146, 255, 0.22)",
  borderRadius: 16,
  padding: 18,
};

const eyebrowStyle: React.CSSProperties = {
  color: "#8ea8ff",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  marginBottom: 8,
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  fontSize: 30,
  lineHeight: 1.05,
  margin: 0,
};

const objectiveStyle: React.CSSProperties = {
  color: "#d1d7e0",
  fontSize: 14,
  lineHeight: 1.6,
  margin: "10px 0 0",
  maxWidth: 820,
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#9fb6ff",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  marginBottom: 10,
  textTransform: "uppercase",
};

const promptStyle: React.CSSProperties = {
  color: "#f3f5f8",
  fontSize: 16,
  lineHeight: 1.55,
  margin: 0,
};

const helperTextStyle: React.CSSProperties = {
  color: "#d2d7e0",
  fontSize: 13,
  lineHeight: 1.55,
  margin: 0,
};

const fieldGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const fieldLabelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const answerChoiceStyle: React.CSSProperties = {
  alignItems: "flex-start",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: 12,
  display: "flex",
  gap: 10,
  padding: 12,
};

const resultCardStyle: React.CSSProperties = {
  background: "rgba(20, 22, 28, 0.92)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 14,
  boxShadow: "0 18px 48px rgba(0, 0, 0, 0.24)",
  padding: 16,
};

const resultListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
};

const resultItemStyle = (passed: boolean): React.CSSProperties => ({
  color: passed ? "#78e39b" : "#ff8e8e",
  lineHeight: 1.55,
});

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const normalizeWorkspacePath = (value: string): string => {
  const normalized = value.replace(/\\/g, "/").replace(/\/+/g, "/").trim();

  if (!normalized) return "";

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

const getParentPath = (value: string): string => {
  const lastSlash = value.lastIndexOf("/");

  if (lastSlash <= 0) return "/";

  return value.slice(0, lastSlash);
};

const toWorkspaceRelativePath = (
  rootPath: string,
  filePath: string
): string => {
  const normalizedRoot = normalizeWorkspacePath(rootPath);
  const normalizedPath = normalizeWorkspacePath(filePath);

  if (normalizedPath === normalizedRoot) return ".";
  if (normalizedPath.startsWith(`${normalizedRoot}/`)) {
    return normalizedPath.slice(normalizedRoot.length + 1);
  }

  return normalizedPath.replace(/^\/+/, "");
};

const gitHeadExists = async (
  fs: NonNullable<ReturnType<typeof useFileSystem>["fs"]>,
  rootPath: string
): Promise<boolean> => {
  try {
    await git.resolveRef({
      dir: rootPath,
      fs,
      ref: "HEAD",
    });

    return true;
  } catch {
    return false;
  }
};

const resolveWorkspaceSeed = (
  activity: ActivityDefinition
): WorkspaceSeed | undefined => {
  const workspace = asRecord(activity.data.workspace);
  const rootPath = normalizeWorkspacePath(asString(workspace.rootPath));

  if (!rootPath) {
    return undefined;
  }

  const files = (workspace.files as unknown[])
    ?.map((entry) => asRecord(entry))
    .map((entry) => ({
      content: asString(entry.content),
      path: normalizeWorkspacePath(asString(entry.path)),
      source: asString(entry.source) || undefined,
    }))
    .filter((entry) => Boolean(entry.path)) as WorkspaceSeedFile[];
  const folders = asStringArray(workspace.folders)
    .map((entry) => normalizeWorkspacePath(entry))
    .filter(Boolean);
  const gitConfig = asRecord(workspace.git);
  const configuredOpenFile = normalizeWorkspacePath(
    asString(workspace.openFile)
  );
  const defaultOpenFile =
    files.find(
      ({ path }) =>
        typeof path === "string" &&
        getParentPath(path) === rootPath &&
        path.toLowerCase().endsWith("/index.html")
    )?.path ||
    files.find(({ path }) => getParentPath(path) === rootPath)?.path ||
    files[0]?.path ||
    "";

  return {
    files,
    folders,
    git:
      gitConfig.initialCommit === true
        ? {
            initialCommit: true,
            message:
              asString(gitConfig.message) || "Initial activity workspace",
            remotes: Object.fromEntries(
              Object.entries(asRecord(gitConfig.remotes)).filter(
                (entry): entry is [string, string] =>
                  typeof entry[0] === "string" &&
                  typeof entry[1] === "string"
              )
            ),
          }
        : undefined,
    openFile: configuredOpenFile || defaultOpenFile,
    openInVscode: workspace.openInVscode !== false,
    overwriteFiles: workspace.overwriteFiles === true,
    resetOnEnter: workspace.resetOnEnter === true,
    rootPath,
  };
};

const getInitialAnswers = (
  activity: ActivityDefinition
): Record<string, unknown> => {
  const saved = getActivityState(activity.id).answers;

  if (Object.keys(saved).length > 0) {
    return saved;
  }

  if (activity.mode === "classify") {
    return { cards: {} };
  }

  if (activity.mode === "order") {
    const items = (activity.data.items || []) as { id: string }[];
    const initialOrder = asStringArray(activity.data.initialOrder);

    return {
      itemsOrder:
        initialOrder.length === items.length
          ? initialOrder
          : items.map(({ id }) => id),
    };
  }

  return {};
};

const getFallbackActivity = (
  language?: "es" | "en" | "pt"
): ActivityDefinition | undefined => {
  const classes = (getActivitiesCatalog(language).classes ||
    []) as ActivityClass[];

  return classes[0]?.activities[0];
};

const Activities: FC<ActivitiesProps> = ({ forcedActivityId, standalone }) => {
  const preparedWorkspaceRef = useRef<Record<string, true>>({});
  const lastPreparedActivityIdRef = useRef("");
  const { deletePath, exists, fs, mkdirRecursive, writeFile } = useFileSystem();
  const { open: openProcess, processes, url: setProcessUrl } = useProcesses();
  const { language, setLanguage } = useSession();
  const uiText = useMemo(() => {
    if (language === "pt") {
      return {
        activity: "Atividade",
        empty: "Nenhuma atividade carregada.",
        instructions: "Instrucoes",
        position: "Posicao",
        result: "Resultado",
        runCommandsHint:
          "Execute os comandos no GitBash e depois valide aqui. A validacao usa historico real de comandos e eventos.",
        response: "Resposta",
        workspaceHint:
          "Para esta atividade, trabalhe o projeto no Visual Studio Code e use o botao Validar no menu superior do editor.",
        select: "Selecionar",
        selectColumn: "Selecionar coluna",
      };
    }

    if (language === "en") {
      return {
        activity: "Activity",
        empty: "No activities loaded.",
        instructions: "Instructions",
        position: "Position",
        result: "Result",
        runCommandsHint:
          "Run the commands in GitBash and then validate here. Validation uses real command and event history.",
        response: "Answer",
        workspaceHint:
          "For this activity, work on the project in Visual Studio Code and use the Validate button in the editor top menu.",
        select: "Select",
        selectColumn: "Select column",
      };
    }

    return {
      activity: "Actividad",
      empty: "No hay actividades cargadas.",
      instructions: "Consigna",
      position: "Posicion",
      result: "Resultado",
      runCommandsHint:
        "Ejecuta los comandos en GitBash y luego valida aca. La validacion usa historial real de comandos y eventos.",
      response: "Respuesta",
      workspaceHint:
        "Para esta actividad, trabaja el proyecto en Visual Studio Code y usa el boton Validar del menu superior del editor.",
      select: "Seleccionar",
      selectColumn: "Seleccionar columna",
    };
  }, [language]);
  const classes = useMemo(
    () => (getActivitiesCatalog(language).classes || []) as ActivityClass[],
    [language]
  );
  const activities = useMemo(
    () => classes.flatMap((activityClass) => activityClass.activities),
    [classes]
  );
  const initialActivityId =
    forcedActivityId || getSearchParam("activityId") || activities[0]?.id || "";
  const [activityId, setActivityId] = useState(initialActivityId);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [workspaceResetNonce, setWorkspaceResetNonce] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>(() => {
    const selectedActivity =
      getActivityById(initialActivityId, language) ||
      getFallbackActivity(language);

    return selectedActivity ? getInitialAnswers(selectedActivity) : {};
  });

  const fallbackActivity = useMemo(
    () => activities[0] || getFallbackActivity(language),
    [activities, language]
  );
  const activity = useMemo(
    () =>
      activities.find((entry) => entry.id === activityId) || fallbackActivity,
    [activities, activityId, fallbackActivity]
  );

  useEffect(() => {
    const urlLanguage = getLanguageFromValue(getSearchParam("lang"));

    if (urlLanguage && urlLanguage !== language) {
      setLanguage(urlLanguage);
    }
  }, [language, setLanguage]);

  useEffect(() => {
    if (!activity) return;

    setCurrentActivityId(activity.id);
    setAnswers(getInitialAnswers(activity));
    setResults([]);
  }, [activity]);

  useEffect(() => {
    if (!activity) return;

    const workspaceSeed = resolveWorkspaceSeed(activity);

    if (!workspaceSeed) {
      return;
    }

    // A seeded Git activity must wait for BrowserFS before it can be marked as
    // prepared. Otherwise VS Code can open after git init but before the base
    // commit exists, leaving main without a resolvable HEAD.
    if (workspaceSeed.git?.initialCommit && !fs) {
      return;
    }

    if (
      preparedWorkspaceRef.current[activity.id] &&
      (!workspaceSeed.resetOnEnter ||
        lastPreparedActivityIdRef.current === activity.id)
    ) {
      return;
    }

    preparedWorkspaceRef.current[activity.id] = true;
    lastPreparedActivityIdRef.current = activity.id;

    const prepareWorkspace = async (): Promise<void> => {
      try {
        if (
          workspaceSeed.resetOnEnter &&
          (await exists(workspaceSeed.rootPath))
        ) {
          await deletePath(workspaceSeed.rootPath);
        }

        const folderSet = new Set<string>([
          workspaceSeed.rootPath,
          ...workspaceSeed.folders,
          ...workspaceSeed.files.map(({ path }) => getParentPath(path)),
        ]);

        await Promise.all(
          [...folderSet]
            .filter(Boolean)
            .map((folderPath) => mkdirRecursive(folderPath))
        );

        await Promise.all(
          workspaceSeed.files.map(async ({ content, path, source }) => {
            let fileContent: Buffer | string = content;

            if (source) {
              const response = await fetch(source);

              if (!response.ok) {
                throw new Error(`Unable to load workspace asset: ${source}`);
              }

              fileContent = Buffer.from(await response.arrayBuffer());
            }

            return writeFile(path, fileContent, workspaceSeed.overwriteFiles);
          })
        );

        if (workspaceSeed.git?.initialCommit && fs) {
          await git.init({
            defaultBranch: "main",
            dir: workspaceSeed.rootPath,
            fs,
          });

          await Promise.all(
            Object.entries(workspaceSeed.git.remotes).map(
              async ([remote, url]) => {
                const remotes = await git.listRemotes({
                  dir: workspaceSeed.rootPath,
                  fs,
                });

                if (!remotes.some((entry) => entry.remote === remote)) {
                  await git.addRemote({
                    dir: workspaceSeed.rootPath,
                    fs,
                    remote,
                    url,
                  });
                }
              }
            )
          );

          if (!(await gitHeadExists(fs, workspaceSeed.rootPath))) {
            await workspaceSeed.files.reduce<Promise<void>>(
              (previousAdd, { path }) =>
                previousAdd.then(async () => {
                  await git.add({
                    dir: workspaceSeed.rootPath,
                    filepath: toWorkspaceRelativePath(
                      workspaceSeed.rootPath,
                      path
                    ),
                    fs,
                  });
                }),
              Promise.resolve()
            );

            await git.commit({
              author: {
                email: "user@winsim.local",
                name: "user",
              },
              dir: workspaceSeed.rootPath,
              fs,
              message: workspaceSeed.git.message,
            });
          }

          await git.resolveRef({
            dir: workspaceSeed.rootPath,
            fs,
            ref: "HEAD",
          });
        }

        if (lastPreparedActivityIdRef.current !== activity.id) return;

        if (workspaceSeed.openInVscode) {
          const vscodeUrl =
            workspaceSeed.openFile &&
            workspaceSeed.openFile.startsWith(`${workspaceSeed.rootPath}/`)
              ? workspaceSeed.openFile
              : workspaceSeed.rootPath;
          const monacoId = Object.keys(processes).find((processId) =>
            processId.startsWith("MonacoEditor")
          );

          if (monacoId) {
            setProcessUrl(monacoId, vscodeUrl);
          } else {
            openProcess("MonacoEditor", { url: vscodeUrl });
          }
        }
      } catch {
        if (lastPreparedActivityIdRef.current === activity.id) {
          delete preparedWorkspaceRef.current[activity.id];
        }

        // Ignore workspace seeding failures to avoid blocking activity flow.
      }
    };

    void prepareWorkspace();
  }, [
    activity,
    deletePath,
    exists,
    fs,
    mkdirRecursive,
    openProcess,
    processes,
    setProcessUrl,
    workspaceResetNonce,
    writeFile,
  ]);

  const saveAnswers = (nextAnswers: Record<string, unknown>): void => {
    if (!activity) return;

    setAnswers(nextAnswers);
    saveActivityAnswers(activity.id, nextAnswers);
  };

  const updateCardAnswer = (cardId: string, column: string): void => {
    const cardAnswers = asRecord(answers.cards) as CardAnswers;

    saveAnswers({
      ...answers,
      cards: {
        ...cardAnswers,
        [cardId]: column,
      },
    });
  };

  const updateTextAnswer = (fieldId: string, value: string): void => {
    saveAnswers({
      ...answers,
      [fieldId]: value,
    });
  };

  const validate = (): void => {
    if (!activity) return;

    const output = validateActivity(activity.id, language);

    setResults(output.results);
  };

  const retry = (): void => {
    if (!activity) return;

    const workspaceSeed = resolveWorkspaceSeed(activity);

    retryActivity(activity.id, language);
    delete preparedWorkspaceRef.current[activity.id];
    lastPreparedActivityIdRef.current = "";
    setAnswers(getInitialAnswers(activity));
    setResults([]);

    if (workspaceSeed?.resetOnEnter) {
      window.dispatchEvent(
        new CustomEvent("winsim:activity-retry", {
          detail: {
            activityId: activity.id,
            rootPath: workspaceSeed.rootPath,
          },
        })
      );
      setWorkspaceResetNonce((current) => current + 1);
    }
  };

  if (!activity) {
    return <div style={containerStyle}>{uiText.empty}</div>;
  }

  const selectedClass = classes.find(
    ({ classId }) => classId === activity.classId
  );
  const freeText = asRecord(activity.data.freeText) as FreeTextConfig;
  const question = asRecord(activity.data.question) as QuestionData;
  const requiredData = asRecord(activity.data.required);
  const requiredCheckboxId = asString(requiredData.checkboxId);
  const requiredCheckboxLabel = asString(requiredData.checkboxLabel);
  const formFields = ((activity.data.form || []) as FormField[]).filter(
    ({ id, label }) => Boolean(id && label)
  );
  const instructions = asStringArray(activity.data.instructions);
  const freeTextMinItems =
    typeof freeText.minItems === "number" && freeText.minItems > 1
      ? freeText.minItems
      : 0;

  return (
    <div
      data-tour="activity-structure"
      style={{
        ...containerStyle,
        ...(standalone
          ? {
              height: "100vh",
              margin: "0 auto",
              maxWidth: 1100,
            }
          : {}),
      }}
    >
      <div style={shellStyle}>
        <section style={heroStyle}>
          <div style={eyebrowStyle}>
            {selectedClass?.title || uiText.activity}
          </div>
          <h2 style={titleStyle}>{activity.title}</h2>
          <p style={objectiveStyle}>{activity.objective}</p>
        </section>

        <section style={panelStyle}>
          {(asString(activity.data.scenario) || asString(question.label)) && (
            <div style={{ marginBottom: 14 }}>
              {asString(activity.data.scenario) && (
                <p style={promptStyle}>{asString(activity.data.scenario)}</p>
              )}
              {asString(question.label) && (
                <p style={{ ...helperTextStyle, marginTop: 8 }}>
                  {asString(question.label)}
                </p>
              )}
            </div>
          )}

          {instructions.length > 0 && (
            <div style={{ marginBottom: 16, userSelect: "text" }}>
              <div style={sectionTitleStyle}>{uiText.instructions}</div>
              <ol style={{ margin: 0, paddingLeft: 20, userSelect: "text" }}>
                {instructions.map((instruction, index) => (
                  <li
                    key={`${activity.id}-instruction-${index + 1}`}
                    style={{ marginBottom: 6, userSelect: "text" }}
                  >
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activity.mode === "workspace" && (
            <div style={{ ...helperTextStyle, marginBottom: 16 }}>
              {uiText.workspaceHint}
            </div>
          )}

          {activity.mode === "classify" && (
            <div style={fieldGridStyle}>
              {((activity.data.cards || []) as ActivityCard[]).map((card) => (
                <label
                  key={card.id}
                  htmlFor={`card-${card.id}`}
                  style={fieldLabelStyle}
                >
                  <span>{card.text}</span>
                  <select
                    id={`card-${card.id}`}
                    onChange={({ target }) =>
                      updateCardAnswer(card.id, target.value)
                    }
                    style={inputStyle}
                    value={asString(asRecord(answers.cards)[card.id])}
                  >
                    <option value="">{uiText.selectColumn}</option>
                    {((activity.data.columns || []) as string[]).map(
                      (column) => (
                        <option key={column} value={column}>
                          {translateActivityText(language, column)}
                        </option>
                      )
                    )}
                  </select>
                </label>
              ))}
            </div>
          )}

          {activity.mode === "order" && (
            <div style={fieldGridStyle}>
              {(
                (activity.data.items || []) as { id: string; text: string }[]
              ).map((item) => {
                const currentOrder = asStringArray(answers.itemsOrder);

                return (
                  <label
                    key={item.id}
                    htmlFor={`order-${item.id}`}
                    style={fieldLabelStyle}
                  >
                    <span>{item.text}</span>
                    <select
                      id={`order-${item.id}`}
                      onChange={({ target }) => {
                        const nextOrder = [...currentOrder];
                        const currentIndex = nextOrder.indexOf(item.id);
                        const targetIndex = Number(target.value);

                        if (currentIndex !== -1) {
                          nextOrder.splice(currentIndex, 1);
                        }

                        nextOrder.splice(targetIndex, 0, item.id);
                        saveAnswers({
                          ...answers,
                          itemsOrder: nextOrder,
                        });
                      }}
                      style={inputStyle}
                      value={String(Math.max(currentOrder.indexOf(item.id), 0))}
                    >
                      {((activity.data.items || []) as { id: string }[]).map(
                        (positionItem, indexPosition) => (
                          <option
                            key={`${item.id}-${positionItem.id}`}
                            value={indexPosition}
                          >
                            {uiText.position} {indexPosition + 1}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                );
              })}

              {Array.isArray(question.options) &&
                question.options.length > 0 && (
                  <label htmlFor="culpable" style={fieldLabelStyle}>
                    <span>{asString(question.label)}</span>
                    <select
                      id="culpable"
                      onChange={({ target }) =>
                        updateTextAnswer("culpable", target.value)
                      }
                      style={inputStyle}
                      value={asString(answers.culpable)}
                    >
                      <option value="">{uiText.select}</option>
                      {question.options.map((option) => {
                        const optionId =
                          typeof option === "string" ? option : option.id;
                        const optionLabel =
                          typeof option === "string" ? option : option.label;

                        return (
                          <option key={optionId} value={optionId}>
                            {optionLabel}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                )}
            </div>
          )}

          {activity.mode === "decision" && (
            <div style={fieldGridStyle}>
              {((activity.data.options || []) as ActivityOption[]).map(
                (option) => (
                  <label
                    key={option.id}
                    htmlFor={option.id}
                    style={answerChoiceStyle}
                  >
                    <input
                      checked={asString(answers.resolution) === option.id}
                      id={option.id}
                      name="resolution"
                      onChange={() => updateTextAnswer("resolution", option.id)}
                      type="radio"
                      style={{ marginTop: 2 }}
                    />
                    <span>{option.label}</span>
                  </label>
                )
              )}

              {requiredCheckboxId && (
                <label htmlFor={requiredCheckboxId} style={answerChoiceStyle}>
                  <input
                    checked={Boolean(answers[requiredCheckboxId])}
                    id={requiredCheckboxId}
                    onChange={({ target }) =>
                      saveAnswers({
                        ...answers,
                        [requiredCheckboxId]: target.checked,
                      })
                    }
                    type="checkbox"
                    style={{ marginTop: 2 }}
                  />
                  <span>{requiredCheckboxLabel}</span>
                </label>
              )}
            </div>
          )}

          {(activity.mode.startsWith("terminal") ||
            activity.mode === "terminal") && (
            <div style={{ ...helperTextStyle, marginBottom: 16 }}>
              {uiText.runCommandsHint}
            </div>
          )}

          {formFields.length > 0 && (
            <div style={fieldGridStyle}>
              {formFields.map((field) => (
                <label
                  key={field.id}
                  htmlFor={field.id}
                  style={fieldLabelStyle}
                >
                  <span>{field.label}</span>
                  <textarea
                    id={field.id}
                    onChange={({ target }) =>
                      updateTextAnswer(field.id, target.value)
                    }
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    value={asString(answers[field.id])}
                  />
                </label>
              ))}
            </div>
          )}

          {freeText.id && !formFields.some(({ id }) => id === freeText.id) && (
            <div style={fieldGridStyle}>
              <label style={fieldLabelStyle}>
                <span>{freeText.label}</span>
                {freeTextMinItems > 1 ? (
                  Array.from({ length: freeTextMinItems }).map(
                    (_, indexItem) => {
                      const existing = asStringArray(answers[freeText.id]);
                      const currentValue = existing[indexItem] || "";

                      return (
                        <textarea
                          key={`${freeText.id}-${indexItem + 1}`}
                          onChange={({ target }) => {
                            const next = [...existing];

                            next[indexItem] = target.value;
                            saveAnswers({
                              ...answers,
                              [freeText.id]: next,
                            });
                          }}
                          placeholder={`${uiText.response} ${indexItem + 1}`}
                          rows={2}
                          style={{ ...inputStyle, resize: "vertical" }}
                          value={currentValue}
                        />
                      );
                    }
                  )
                ) : (
                  <textarea
                    onChange={({ target }) =>
                      updateTextAnswer(freeText.id, target.value)
                    }
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    value={asString(answers[freeText.id])}
                  />
                )}
              </label>
            </div>
          )}
        </section>

        {activity.mode !== "workspace" && (
          <div data-tour="activity-validation" style={actionsStyle}>
            <button
              data-tour="activity-validation-button"
              onClick={validate}
              style={buttonStyle}
              type="button"
            >
              {activity.ui?.submitLabel || "Validar"}
            </button>
            <button
              onClick={retry}
              style={{
                ...buttonStyle,
                background: "#454545",
                borderColor: "#6a6a6a",
              }}
              type="button"
            >
              {activity.ui?.retryLabel || "Reintentar"}
            </button>
          </div>
        )}

        {results.length > 0 && (
          <section style={resultCardStyle}>
            <h3 style={{ marginTop: 0 }}>{uiText.result}</h3>
            <ul style={resultListStyle}>
              {results.map((result) => (
                <li key={result.checkId} style={resultItemStyle(result.passed)}>
                  {result.message}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default memo(Activities);

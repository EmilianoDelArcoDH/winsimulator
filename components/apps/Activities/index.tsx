import { memo, useEffect, useMemo, useRef, useState } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import {
    clearActivityProgress,
    type ActivityCard,
    type ActivityClass,
    type ActivityDefinition,
    type ActivityOption,
    getActivitiesCatalog,
    getActivityById,
    getActivityState,
    saveActivityAnswers,
    setCurrentActivityId,
    type ValidationResult,
    validateActivity,
} from "utils/activityRuntime";
import { getSearchParam } from "utils/functions";

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
    options?: string[];
};

type FormField = {
    id: string;
    label: string;
};

type WorkspaceSeedFile = {
    content: string;
    path: string;
};

type WorkspaceSeed = {
    files: WorkspaceSeedFile[];
    folders: string[];
    openInVscode: boolean;
    overwriteFiles: boolean;
    resetOnEnter: boolean;
    rootPath: string;
};

const containerStyle: React.CSSProperties = {
    background: "#111",
    color: "#f1f1f1",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    height: "100%",
    minHeight: 0,
    overflow: "auto",
    padding: 12,
    paddingBottom: 72,
};

const panelStyle: React.CSSProperties = {
    background: "#1b1b1b",
    border: "1px solid #2f2f2f",
    borderRadius: 8,
    minWidth: 0,
    overflow: "hidden",
    padding: 12,
};

const inputStyle: React.CSSProperties = {
    background: "#0f0f0f",
    border: "1px solid #3a3a3a",
    borderRadius: 6,
    color: "#f1f1f1",
    padding: "8px 10px",
};

const buttonStyle: React.CSSProperties = {
    background: "#2d5fff",
    border: "1px solid #6f92ff",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    minHeight: 36,
    padding: "8px 14px",
};

const actionsStyle: React.CSSProperties = {
    background: "#111",
    borderTop: "1px solid #2f2f2f",
    bottom: 8,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: "auto",
    paddingBottom: 4,
    paddingTop: 8,
    position: "sticky",
    zIndex: 8,
};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

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

const resolveWorkspaceSeed = (activity: ActivityDefinition): WorkspaceSeed | undefined => {
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
        }))
        .filter((entry) => Boolean(entry.path)) as WorkspaceSeedFile[];
    const folders = asStringArray(workspace.folders)
        .map((entry) => normalizeWorkspacePath(entry))
        .filter(Boolean);

    return {
        files,
        folders,
        openInVscode: workspace.openInVscode !== false,
        overwriteFiles: workspace.overwriteFiles === true,
        resetOnEnter: workspace.resetOnEnter === true,
        rootPath,
    };
};

const getInitialAnswers = (activity: ActivityDefinition): Record<string, unknown> => {
    const saved = getActivityState(activity.id).answers;

    if (Object.keys(saved).length > 0) {
        return saved;
    }

    if (activity.mode === "classify") {
        return { cards: {} };
    }

    if (activity.mode === "order") {
        const items = (activity.data.items || []) as { id: string }[];

        return { itemsOrder: items.map(({ id }) => id) };
    }

    return {};
};

const getFallbackActivity = (
    language?: "es" | "en" | "pt"
): ActivityDefinition | undefined => {
    const classes = (getActivitiesCatalog(language).classes || []) as ActivityClass[];

    return classes[0]?.activities[0];
};

const Activities: FC<ActivitiesProps> = ({ forcedActivityId, standalone }) => {
    const preparedWorkspaceRef = useRef<Record<string, true>>({});
    const { mkdirRecursive, writeFile } = useFileSystem();
    const { open: openProcess, processes, url: setProcessUrl } = useProcesses();
    const { language } = useSession();
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
    const [answers, setAnswers] = useState<Record<string, unknown>>(() => {
        const selectedActivity =
            getActivityById(initialActivityId, language) || getFallbackActivity(language);

        return selectedActivity ? getInitialAnswers(selectedActivity) : {};
    });

    const fallbackActivity = useMemo(
        () => activities[0] || getFallbackActivity(language),
        [activities, language]
    );
    const activity = useMemo(
        () => activities.find((entry) => entry.id === activityId) || fallbackActivity,
        [activities, activityId, fallbackActivity]
    );

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

        if (preparedWorkspaceRef.current[activity.id] && !workspaceSeed.resetOnEnter) {
            return;
        }

        let cancelled = false;

        const prepareWorkspace = async (): Promise<void> => {
            try {
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
                    workspaceSeed.files.map(({ content, path }) =>
                        writeFile(path, content, workspaceSeed.overwriteFiles)
                    )
                );

                if (cancelled) return;

                preparedWorkspaceRef.current[activity.id] = true;

                if (workspaceSeed.openInVscode) {
                    const monacoId = Object.keys(processes).find((processId) =>
                        processId.startsWith("MonacoEditor")
                    );

                    if (monacoId) {
                        setProcessUrl(monacoId, workspaceSeed.rootPath);
                    } else {
                        openProcess("MonacoEditor", { url: workspaceSeed.rootPath });
                    }
                }
            } catch {
                // Ignore workspace seeding failures to avoid blocking activity flow.
            }
        };

        prepareWorkspace();

        return () => {
            cancelled = true;
        };
    }, [activity, mkdirRecursive, openProcess, processes, setProcessUrl, writeFile]);

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

        saveActivityAnswers(activity.id, answers);
        const output = validateActivity(activity.id, language);

        setResults(output.results);
    };

    const retry = (): void => {
        if (!activity) return;

        clearActivityProgress(activity.id);
        setAnswers(getInitialAnswers(activity));
        setResults([]);
    };

    if (!activity) {
        return <div style={containerStyle}>{uiText.empty}</div>;
    }

    const selectedClass = classes.find(({ classId }) => classId === activity.classId);
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
            style={{
                ...containerStyle,
                ...(standalone
                    ? {
                        height: "100vh",
                        margin: "0 auto",
                        maxWidth: 980,
                    }
                    : {}),
            }}
        >
            <div style={panelStyle}>
                <div
                    style={{
                        alignItems: "flex-start",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div style={{ color: "#7ea0ff", fontSize: 12 }}>{selectedClass?.title}</div>
                        <h2 style={{ margin: "6px 0" }}>{activity.title}</h2>
                        <div style={{ color: "#d0d0d0", fontSize: 13 }}>{activity.objective}</div>
                    </div>

                    <div style={{ flex: "1 1 260px", maxWidth: "100%", minWidth: 240 }}>
                        <label htmlFor="activity-select" style={{ display: "block", fontSize: 12 }}>
                            {uiText.activity}
                        </label>
                        <select
                            id="activity-select"
                            onChange={({ target }) => setActivityId(target.value)}
                            style={{ ...inputStyle, width: "100%" }}
                            value={activity.id}
                        >
                            {activities.map((entry) => (
                                <option key={entry.id} value={entry.id}>
                                    {entry.id} · {entry.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div style={panelStyle}>
                {(asString(activity.data.scenario) || asString(question.label)) && (
                    <div style={{ marginBottom: 10 }}>
                        <div>{asString(activity.data.scenario)}</div>
                        {asString(question.label) && (
                            <div style={{ color: "#d8d8d8", marginTop: 4 }}>{asString(question.label)}</div>
                        )}
                    </div>
                )}

                {instructions.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ color: "#9fb6ff", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            {uiText.instructions}
                        </div>
                        <ol style={{ margin: 0, paddingLeft: 20 }}>
                            {instructions.map((instruction, index) => (
                                <li key={`${activity.id}-instruction-${index + 1}`} style={{ marginBottom: 4 }}>
                                    {instruction}
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {activity.mode === "classify" && (
                    <div style={{ display: "grid", gap: 8 }}>
                        {((activity.data.cards || []) as ActivityCard[]).map((card) => (
                            <label key={card.id} htmlFor={`card-${card.id}`} style={{ display: "grid", gap: 6 }}>
                                <span>{card.text}</span>
                                <select
                                    id={`card-${card.id}`}
                                    onChange={({ target }) => updateCardAnswer(card.id, target.value)}
                                    style={inputStyle}
                                    value={asString(asRecord(answers.cards)[card.id])}
                                >
                                    <option value="">{uiText.selectColumn}</option>
                                    {((activity.data.columns || []) as string[]).map((column) => (
                                        <option key={column} value={column}>
                                            {column}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                )}

                {activity.mode === "order" && (
                    <div style={{ display: "grid", gap: 8 }}>
                        {((activity.data.items || []) as { id: string; text: string }[]).map((item) => {
                            const currentOrder = asStringArray(answers.itemsOrder);

                            return (
                                <label key={item.id} htmlFor={`order-${item.id}`} style={{ display: "grid", gap: 6 }}>
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
                                                <option key={`${item.id}-${positionItem.id}`} value={indexPosition}>
                                                    {uiText.position} {indexPosition + 1}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>
                            );
                        })}

                        {Array.isArray(question.options) && question.options.length > 0 && (
                            <label htmlFor="culpable" style={{ display: "grid", gap: 6 }}>
                                <span>{asString(question.label)}</span>
                                <select
                                    id="culpable"
                                    onChange={({ target }) => updateTextAnswer("culpable", target.value)}
                                    style={inputStyle}
                                    value={asString(answers.culpable)}
                                >
                                    <option value="">{uiText.select}</option>
                                    {question.options.map((optionId) => (
                                        <option key={optionId} value={optionId}>
                                            {optionId}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                )}

                {activity.mode === "decision" && (
                    <div style={{ display: "grid", gap: 8 }}>
                        {((activity.data.options || []) as ActivityOption[]).map((option) => (
                            <label key={option.id} htmlFor={option.id} style={{ alignItems: "center", display: "flex", gap: 8 }}>
                                <input
                                    checked={asString(answers.resolution) === option.id}
                                    id={option.id}
                                    name="resolution"
                                    onChange={() => updateTextAnswer("resolution", option.id)}
                                    type="radio"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}

                        {requiredCheckboxId && (
                            <label
                                htmlFor={requiredCheckboxId}
                                style={{ alignItems: "center", display: "flex", gap: 8 }}
                            >
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
                                />
                                <span>{requiredCheckboxLabel}</span>
                            </label>
                        )}
                    </div>
                )}

                {(activity.mode.startsWith("terminal") || activity.mode === "terminal") && (
                    <div style={{ color: "#d9d9d9", fontSize: 13, marginBottom: 12 }}>
                        {uiText.runCommandsHint}
                    </div>
                )}

                {formFields.length > 0 && (
                    <div style={{ display: "grid", gap: 10 }}>
                        {formFields.map((field) => (
                            <label key={field.id} htmlFor={field.id} style={{ display: "grid", gap: 6 }}>
                                <span>{field.label}</span>
                                <textarea
                                    id={field.id}
                                    onChange={({ target }) => updateTextAnswer(field.id, target.value)}
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                    value={asString(answers[field.id])}
                                />
                            </label>
                        ))}
                    </div>
                )}

                {freeText.id && !formFields.some(({ id }) => id === freeText.id) && (
                    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            <span>{freeText.label}</span>
                            {freeTextMinItems > 1 ? (
                                Array.from({ length: freeTextMinItems }).map((_, indexItem) => {
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
                                            placeholder={`Respuesta ${indexItem + 1}`}
                                            rows={2}
                                            style={{ ...inputStyle, resize: "vertical" }}
                                            value={currentValue}
                                        />
                                    );
                                })
                            ) : (
                                <textarea
                                    onChange={({ target }) => updateTextAnswer(freeText.id, target.value)}
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                    value={asString(answers[freeText.id])}
                                />
                            )}
                        </label>
                    </div>
                )}
            </div>

            <div style={actionsStyle}>
                <button onClick={validate} style={buttonStyle} type="button">
                    {activity.ui?.submitLabel || "Validar"}
                </button>
                <button
                    onClick={retry}
                    style={{ ...buttonStyle, background: "#454545", borderColor: "#6a6a6a" }}
                    type="button"
                >
                    {activity.ui?.retryLabel || "Reintentar"}
                </button>
            </div>

            {results.length > 0 && (
                <div style={panelStyle}>
                    <h3 style={{ marginTop: 0 }}>{uiText.result}</h3>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {results.map((result) => (
                            <li key={result.checkId} style={{ color: result.passed ? "#6af58b" : "#ff8e8e" }}>
                                {result.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default memo(Activities);

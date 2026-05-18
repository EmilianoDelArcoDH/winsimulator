import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { driver, type DriveStep } from "driver.js";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { getClassTour } from "utils/classTours";

type ChecklistState = {
  editorOpen: boolean;
  terminalOpen: boolean;
  workspaceReady: boolean;
};

const panelStyle: React.CSSProperties = {
  background: "rgba(12, 16, 24, 0.94)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: 10,
  bottom: 16,
  boxShadow: "0 20px 52px rgba(0, 0, 0, 0.32)",
  color: "#f7f9ff",
  display: "grid",
  gap: 12,
  left: 16,
  maxWidth: 420,
  padding: 16,
  position: "fixed",
  zIndex: 50,
};

const buttonStyle: React.CSSProperties = {
  background: "#3867ff",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  borderRadius: 8,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  minHeight: 38,
  padding: "8px 12px",
};

const mutedButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "rgba(255, 255, 255, 0.08)",
};

const checklistLabel = {
  editorOpen: "Visual Studio Code abierto",
  terminalOpen: "Terminal integrada abierta",
  workspaceReady: "Workspace demo preparado",
} satisfies Record<keyof ChecklistState, string>;

const waitForElement = (
  selector: string,
  timeoutMs = 6000
): Promise<Element | null> =>
  new Promise((resolve) => {
    const existing = document.querySelector(selector);

    if (existing) {
      resolve(existing);
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const element = document.querySelector(selector);

      if (element || Date.now() - startedAt > timeoutMs) {
        window.clearInterval(interval);
        resolve(element);
      }
    }, 120);
  });

const ClassTourRunner = (): React.ReactElement | null => {
  const router = useRouter();
  const classId = String(router.query.classId || "");
  const tour = useMemo(() => getClassTour(classId), [classId]);
  const { fs, mkdirRecursive, writeFile } = useFileSystem();
  const { open, processes } = useProcesses();
  const [completed, setCompleted] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistState>({
    editorOpen: false,
    terminalOpen: false,
    workspaceReady: false,
  });
  const driverRef = useRef<ReturnType<typeof driver> | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const prepareWorkspace = async (): Promise<void> => {
      if (!tour || !fs) return;

      await mkdirRecursive(tour.workspaceRoot);
      await Promise.all(
        tour.files.map(({ content, path }) => writeFile(path, content, true))
      );

      if (!cancelled) {
        setChecklist((current) => ({ ...current, workspaceReady: true }));
      }
    };

    prepareWorkspace().catch(() => {
      setChecklist((current) => ({ ...current, workspaceReady: false }));
    });

    return () => {
      cancelled = true;
    };
  }, [fs, mkdirRecursive, tour, writeFile]);

  useEffect(() => {
    const monacoOpen = Object.keys(processes).some((id) =>
      id.startsWith("MonacoEditor")
    );
    const terminalOpen = Boolean(
      document.querySelector('[data-tour="monaco-terminal-panel"]')
    );

    setChecklist((current) => ({
      ...current,
      editorOpen: monacoOpen,
      terminalOpen,
    }));
  }, [processes]);

  const openDemoEditor = useCallback(async (): Promise<void> => {
    if (!tour) return;

    open("MonacoEditor", { url: tour.workspaceRoot });
    await waitForElement('[data-tour="monaco-workbench"]');
  }, [open, tour]);

  const startTour = useCallback(async (): Promise<void> => {
    if (!tour) return;

    await openDemoEditor();

    const commandList = tour.commands
      .map(
        ({ description, value }) =>
          `<li><code>${value}</code><br/><span>${description}</span></li>`
      )
      .join("");
    const steps: DriveStep[] = [
      {
        element: '[data-tour="class-tour-panel"]',
        popover: {
          align: "start",
          description:
            "Esta guia es independiente de las actividades. Practica el recorrido una vez y despues resolve las consignas reales.",
          side: "right",
          title: `Guia de clase: ${tour.title}`,
        },
      },
      {
        element: '[data-tour="monaco-workbench"]',
        popover: {
          align: "start",
          description:
            "Este es el espacio donde vas a editar archivos, revisar carpetas y usar la terminal integrada.",
          side: "left",
          title: "Visual Studio Code",
        },
      },
      {
        element: '[data-tour="monaco-explorer-panel"]',
        popover: {
          align: "start",
          description:
            "Aca se ven las carpetas y archivos del workspace de ejemplo. En las actividades vas a trabajar sobre estructuras similares.",
          side: "right",
          title: "Explorador del proyecto",
        },
      },
      {
        element: '[data-tour="monaco-editor-area"]',
        popover: {
          align: "center",
          description:
            "Cuando abras un archivo, el contenido aparece aca. Guarda tus cambios antes de validar.",
          side: "left",
          title: "Editor",
        },
      },
      {
        element: '[data-tour="monaco-terminal-menu"]',
        popover: {
          align: "start",
          description:
            "Desde Terminal > Toggle Terminal abris la consola integrada. Usala para ejecutar comandos del tema.",
          side: "bottom",
          title: "Abrir terminal",
        },
      },
      {
        popover: {
          align: "start",
          description: `<ol>${commandList}</ol>`,
          side: "left",
          title: "Comandos ejemplo",
        },
      },
      {
        element: '[data-tour="class-tour-checklist"]',
        popover: {
          align: "start",
          description:
            "El panel confirma que el workspace esta preparado y que abriste las herramientas clave.",
          side: "right",
          title: "Validacion de la guia",
        },
      },
    ];

    driverRef.current?.destroy();
    driverRef.current = driver({
      allowClose: true,
      animate: true,
      doneBtnText: "Finalizar",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      progressText: "{{current}} de {{total}}",
      showButtons: ["next", "previous", "close"],
      showProgress: true,
      steps,
    });
    driverRef.current.drive();
  }, [openDemoEditor, tour]);

  const openTerminal = useCallback(async (): Promise<void> => {
    const terminalButton = document.querySelector<HTMLButtonElement>(
      '[data-tour="monaco-terminal-menu"]'
    );

    terminalButton?.click();
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 100);
    });

    const toggleButton = [...document.querySelectorAll<HTMLButtonElement>("button")]
      .find((button) => button.textContent?.trim() === "Toggle Terminal");

    toggleButton?.click();
    await waitForElement('[data-tour="monaco-terminal-panel"]', 2000);
    setChecklist((current) => ({ ...current, terminalOpen: true }));
  }, []);

  const markCompleted = useCallback((): void => {
    if (!tour) return;

    window.localStorage.setItem(`winsim_class_tour_completed_${tour.classId}`, "true");
    setCompleted(true);
  }, [tour]);

  if (!tour) {
    return (
      <section data-tour="class-tour-panel" style={panelStyle}>
        <strong>Guia no encontrada</strong>
        <span>No hay una guia configurada para esta clase.</span>
      </section>
    );
  }

  const canComplete = Object.values(checklist).every(Boolean);

  return (
    <section data-tour="class-tour-panel" style={panelStyle}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.76 }}>Tour independiente</div>
        <h1 style={{ fontSize: 20, lineHeight: 1.2, margin: "4px 0 6px" }}>
          {tour.title}
        </h1>
        <p style={{ lineHeight: 1.45, margin: 0 }}>{tour.description}</p>
      </div>

      <div data-tour="class-tour-checklist">
        {(Object.keys(checklist) as (keyof ChecklistState)[]).map((key) => (
          <div key={key} style={{ marginBottom: 5 }}>
            <strong style={{ color: checklist[key] ? "#8ff0b0" : "#ffd37a" }}>
              {checklist[key] ? "OK" : "Pendiente"}
            </strong>{" "}
            {checklistLabel[key]}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={startTour} style={buttonStyle} type="button">
          Iniciar guia
        </button>
        <button onClick={openTerminal} style={mutedButtonStyle} type="button">
          Abrir terminal
        </button>
        <button
          disabled={!canComplete}
          onClick={markCompleted}
          style={{
            ...buttonStyle,
            cursor: canComplete ? "pointer" : "not-allowed",
            opacity: canComplete ? 1 : 0.52,
          }}
          type="button"
        >
          {completed ? "Guia completada" : "Marcar completada"}
        </button>
      </div>
    </section>
  );
};

export default ClassTourRunner;

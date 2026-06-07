import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EVENTS,
  STATUS,
  type Controls,
  type EventData,
  type Step,
  type StepTarget,
  useJoyride,
} from "react-joyride";
import OnboardingTooltip from "components/onboarding/OnboardingTooltip";

export const ONBOARDING_COMPLETED_KEY = "winsim_onboarding_completed";

export type OnboardingStepData = {
  actionLabel?: string;
  followUpTarget?: string;
  requiresAction?: boolean;
};

const safeTooltipPosition = {
  autoUpdate: {
    ancestorResize: true,
    ancestorScroll: true,
    animationFrame: true,
    elementResize: true,
  },
  flipOptions: {
    fallbackStrategy: "bestFit",
    padding: 18,
  },
  shiftOptions: {
    padding: 18,
  },
  strategy: "fixed",
} satisfies NonNullable<Step["floatingOptions"]>;

const safeStep = (step: Step): Step => ({
  isFixed: true,
  offset: 12,
  scrollOffset: 86,
  spotlightPadding: 8,
  ...step,
  floatingOptions: {
    ...safeTooltipPosition,
    ...step.floatingOptions,
    autoUpdate: {
      ...safeTooltipPosition.autoUpdate,
      ...step.floatingOptions?.autoUpdate,
    },
    flipOptions:
      step.floatingOptions?.flipOptions === false
        ? false
        : {
            ...safeTooltipPosition.flipOptions,
            ...step.floatingOptions?.flipOptions,
          },
    shiftOptions: {
      ...safeTooltipPosition.shiftOptions,
      ...step.floatingOptions?.shiftOptions,
    },
  },
});

const actionStep = (
  step: Step,
  actionLabel: string,
  followUpTarget?: string
): Step => ({
  ...step,
  disableFocusTrap: true,
  hideOverlay: Boolean(followUpTarget),
  data: {
    actionLabel,
    followUpTarget,
    requiresAction: true,
  } satisfies OnboardingStepData,
});

export const getOnboardingTourSteps = (): Step[] => {
  const tourSteps: Step[] = [
    {
      content:
        "Bienvenido a DH Console. Vas a recorrer la plataforma usando sus controles y aplicaciones reales.",
      id: "welcome",
      placement: "center",
      target: '[data-tour="welcome"]',
      title: "Bienvenido a DH Console",
    },
    {
      content:
        "Este es el escritorio real. Aquí aparecen accesos, ventanas abiertas y la barra de tareas.",
      id: "desktop",
      placement: "center",
      target: '[data-tour="desktop"]',
      title: "El escritorio",
    },
    actionStep(
      {
        content:
          "Haz clic en Inicio y luego en Terminal. La ventana solo se abrirá cuando selecciones la aplicación.",
        id: "open-terminal",
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
        title: "Abre Terminal",
      },
      "Haz clic en Inicio y luego en Terminal",
      '[data-tour="start-menu-terminal"]'
    ),
    {
      content:
        "En Terminal puedes escribir comandos y ejecutarlos con Enter. Las actividades Git registran los comandos y el estado resultante.",
      id: "terminal",
      placement: "auto",
      target: '[data-tour="terminal"]',
      title: "Usar Terminal",
    },
    {
      content:
        "Todas las aplicaciones usan estos controles reales para minimizar, maximizar o cerrar la ventana.",
      id: "window-controls",
      placement: "auto",
      target: '[data-tour="window-controls"]',
      title: "Controles de ventana",
    },
    actionStep(
      {
        content:
          "Abre Inicio y selecciona Visual Studio Code para conocer el editor real.",
        id: "open-vscode",
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
        title: "Abre Visual Studio Code",
      },
      "Haz clic en Inicio y luego en Visual Studio Code",
      '[data-tour="start-menu-vscode"]'
    ),
    {
      content:
        "Aquí puedes editar los archivos de los proyectos, usar la terminal integrada y validar actividades de workspace.",
      id: "vscode",
      placement: "auto",
      target: '[data-tour="monaco-shell"]',
      title: "Visual Studio Code",
    },
    actionStep(
      {
        content:
          "Abre Inicio y selecciona Documents para conocer el Explorador de Archivos.",
        id: "open-files",
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
        title: "Abre Documents",
      },
      "Haz clic en Inicio y luego en Documents",
      '[data-tour="start-menu-documents"]'
    ),
    {
      content:
        "El Explorador permite navegar carpetas, abrir archivos y organizar el workspace usado por las aplicaciones.",
      id: "file-explorer",
      placement: "auto",
      target: '[data-tour="file-explorer"]',
      title: "Explorador de Archivos",
    },
    {
      content:
        "Las actividades combinan objetivos, instrucciones, herramientas y validaciones. Se abren cuando eliges una actividad, no durante este recorrido general.",
      id: "activities-info",
      placement: "center",
      target: '[data-tour="welcome"]',
      title: "Cómo funcionan las actividades",
    },
    {
      content:
        "Ya conoces el escritorio, Inicio, Terminal, Visual Studio Code, el Explorador y los controles de ventana. Puedes empezar a practicar.",
      id: "finish",
      placement: "center",
      target: '[data-tour="welcome"]',
      title: "Tour completado",
    },
  ];

  return tourSteps.map(safeStep);
};

export type OnboardingTour = {
  completed: boolean;
  currentStep: number;
  isPaused: boolean;
  isRunning: boolean;
  resetTour: () => void;
  resumeTour: () => void;
  startTour: () => void;
  Tour: React.ReactElement | null;
};

const resolveTarget = (target: StepTarget): HTMLElement | null => {
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target);
  }

  if (typeof target === "function") return target();
  if (target && "current" in target) return target.current;

  return target instanceof HTMLElement ? target : null;
};

export const useOnboardingTour = (): OnboardingTour => {
  const [completed, setCompleted] = useState(false);
  const actionCleanupRef = useRef<() => void>(() => {});
  const steps = useMemo(getOnboardingTourSteps, []);
  const onEvent = useCallback((event: EventData, controls: Controls): void => {
    actionCleanupRef.current();
    actionCleanupRef.current = () => {};

    const stepData = event.step.data as OnboardingStepData | undefined;

    if (event.type === EVENTS.TOOLTIP && stepData?.requiresAction) {
      const target = resolveTarget(event.step.target);

      if (target) {
        const cleanups: Array<() => void> = [];
        const advance = (): void => {
          window.setTimeout(() => controls.next(), 150);
        };

        if (!stepData.followUpTarget) {
          target.addEventListener("click", advance, { once: true });
          cleanups.push(() => target.removeEventListener("click", advance));
        } else {
          const attachFollowUp = (): void => {
            let attempts = 0;

            document.body.classList.add("onboarding-follow-up-active");

            const interval = window.setInterval(() => {
              attempts += 1;
              const followUp = resolveTarget(stepData.followUpTarget!);

              if (followUp) {
                window.clearInterval(interval);
                followUp.addEventListener("click", advance, { once: true });
                cleanups.push(() =>
                  followUp.removeEventListener("click", advance)
                );
              } else if (attempts >= 50) {
                window.clearInterval(interval);
                document.body.classList.remove("onboarding-follow-up-active");
              }
            }, 100);

            cleanups.push(() => window.clearInterval(interval));
          };

          target.addEventListener("click", attachFollowUp, { once: true });
          cleanups.push(() =>
            target.removeEventListener("click", attachFollowUp)
          );
        }

        actionCleanupRef.current = () => {
          document.body.classList.remove("onboarding-follow-up-active");
          cleanups.forEach((cleanup) => cleanup());
        };
      }
    }

    if (event.type === EVENTS.TOUR_END && event.status === STATUS.FINISHED) {
      window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      setCompleted(true);
    }
  }, []);
  const { controls, state, Tour } = useJoyride({
    continuous: true,
    locale: {
      back: "Atrás",
      close: "Cerrar",
      last: "Finalizar",
      next: "Siguiente",
      nextWithProgress: "Siguiente ({current} de {total})",
      open: "Abrir explicación",
      skip: "Saltar tour",
    },
    onEvent,
    options: {
      blockTargetInteraction: false,
      buttons: ["back", "skip", "primary"],
      closeButtonAction: "skip",
      overlayClickAction: false,
      primaryColor: "#0078d4",
      showProgress: true,
      skipBeacon: true,
      spotlightRadius: 6,
      targetWaitTimeout: 5000,
      textColor: "#f3f3f3",
      zIndex: 200_000,
    },
    steps,
    tooltipComponent: OnboardingTooltip,
  });

  useEffect(() => {
    setCompleted(
      window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true"
    );

    return () => {
      actionCleanupRef.current();
      controls.stop();
    };
  }, [controls]);

  const startTour = useCallback((): void => {
    setCompleted(false);
    controls.reset();
    controls.start();
  }, [controls]);
  const resumeTour = useCallback(
    (): void => controls.start(state.index),
    [controls, state.index]
  );
  const resetTour = useCallback((): void => {
    window.localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    setCompleted(false);
    controls.reset();
  }, [controls]);

  return {
    completed,
    currentStep: state.index,
    isPaused: state.status === STATUS.PAUSED,
    isRunning: state.status === STATUS.RUNNING,
    resetTour,
    resumeTour,
    startTour,
    Tour,
  };
};

export default useOnboardingTour;

import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS, type EventData, type Step, useJoyride } from "react-joyride";
import OnboardingTooltip from "components/onboarding/OnboardingTooltip";
import { type OnboardingStepData } from "hooks/useOnboardingTour";
import { getLocaleFromPathname } from "components/onboarding/translations";
import {
  getVscodeTutorialText,
  type VscodeTutorialStepId,
  type VscodeTutorialText,
} from "components/onboarding/vscodeTranslations";
import { useFileSystem } from "contexts/fileSystem";
import { DESKTOP_PATH } from "utils/constants";

export const VSCODE_TUTORIAL_COMPLETED_KEY = "winsim_vscode_tutorial_completed";
export const VSCODE_TUTORIAL_FOLDER = `${DESKTOP_PATH}/mi-sitio`;
export const VSCODE_TUTORIAL_FILE = `${VSCODE_TUTORIAL_FOLDER}/index.html`;

export type VscodeStepData = OnboardingStepData & {
  validation?: VscodeTutorialStepId;
};

const safeStep = (step: Step): Step => ({
  beaconTrigger: "click",
  isFixed: true,
  offset: 12,
  scrollOffset: 86,
  spotlightPadding: 8,
  ...step,
  floatingOptions: {
    autoUpdate: {
      ancestorResize: true,
      ancestorScroll: true,
      animationFrame: true,
      elementResize: true,
      ...step.floatingOptions?.autoUpdate,
    },
    flipOptions: {
      fallbackPlacements: ["bottom", "top", "right", "left"],
      fallbackStrategy: "bestFit",
      padding: 12,
      ...(step.floatingOptions?.flipOptions === false
        ? {}
        : step.floatingOptions?.flipOptions),
    },
    shiftOptions: {
      padding: 12,
      ...step.floatingOptions?.shiftOptions,
    },
    strategy: "fixed",
    ...step.floatingOptions,
  },
});

export const getVscodeTutorialSteps = (text: VscodeTutorialText): Step[] => {
  const translatedStep = (
    id: VscodeTutorialStepId,
    step: Omit<Step, "content" | "data" | "id" | "title">,
    requiresAction = false
  ): Step => {
    const stepText = text.steps[id];

    return safeStep({
      ...step,
      content: stepText.description,
      data: {
        actionLabel: stepText.optionalHint,
        buttonBack: text.controls.back,
        buttonFinish: text.controls.finish,
        buttonNext: text.controls.next,
        buttonPause: text.controls.pause,
        buttonSkip: text.controls.skip,
        progress: text.controls.progress,
        requiresAction,
        validation: requiresAction ? id : undefined,
      } satisfies VscodeStepData,
      disableFocusTrap: requiresAction,
      hideOverlay: requiresAction,
      id,
      title: stepText.title,
    });
  };

  return [
    translatedStep("welcome", {
      placement: "center",
      target: '[data-tour="welcome"]',
    }),
    translatedStep(
      "open-vscode",
      {
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
      },
      true
    ),
    translatedStep(
      "create-folder",
      {
        placement: "auto",
        target: '[data-tour="monaco-shell"]',
      },
      true
    ),
    translatedStep(
      "create-file",
      {
        placement: "auto",
        target: '[data-tour="monaco-shell"]',
      },
      true
    ),
    translatedStep(
      "open-file",
      {
        placement: "auto",
        target: '[data-tour="monaco-editor-area"]',
      },
      true
    ),
    translatedStep(
      "open-terminal",
      {
        placement: "auto",
        target: '[data-tour="monaco-terminal-menu"]',
      },
      true
    ),
    translatedStep("finish", {
      placement: "center",
      target: '[data-tour="welcome"]',
    }),
  ];
};

export type VscodeTutorial = {
  Tour: React.ReactElement | null;
  completed: boolean;
  currentStep: number;
  isPaused: boolean;
  isRunning: boolean;
  resetTour: () => void;
  resumeTour: () => void;
  startTour: () => void;
  text: VscodeTutorialText;
};

export const useVscodeTutorial = (): VscodeTutorial => {
  const router = useRouter();
  const { exists } = useFileSystem();
  const locale = getLocaleFromPathname(router.asPath);
  const text = useMemo(() => getVscodeTutorialText(locale), [locale]);
  const steps = useMemo(() => getVscodeTutorialSteps(text), [text]);
  const [completed, setCompleted] = useState(false);
  const validateStep = useCallback(
    async (validation: VscodeTutorialStepId): Promise<boolean> => {
      switch (validation) {
        case "open-vscode":
          return Boolean(document.querySelector('[data-tour="monaco-shell"]'));
        case "create-folder":
          return (
            (await exists(VSCODE_TUTORIAL_FOLDER)) ||
            Boolean(
              document.querySelector(`[data-path="${VSCODE_TUTORIAL_FOLDER}"]`)
            ) ||
            document
              .querySelector('[data-tour="monaco-shell"]')
              ?.getAttribute("data-selected-path") === VSCODE_TUTORIAL_FOLDER
          );
        case "create-file":
          return (
            (await exists(VSCODE_TUTORIAL_FILE)) ||
            document
              .querySelector('[data-tour="monaco-shell"]')
              ?.getAttribute("data-active-file") === VSCODE_TUTORIAL_FILE
          );
        case "open-file":
          return (
            document
              .querySelector('[data-tour="monaco-shell"]')
              ?.getAttribute("data-active-file") === VSCODE_TUTORIAL_FILE
          );
        case "open-terminal":
          return Boolean(
            document.querySelector('[data-tour="monaco-terminal-panel"]')
          );
        default:
          return false;
      }
    },
    [exists]
  );
  const onEvent = useCallback((event: EventData): void => {
    if (event.status === STATUS.FINISHED) {
      window.localStorage.setItem(VSCODE_TUTORIAL_COMPLETED_KEY, "true");
      setCompleted(true);
    }
  }, []);
  const { controls, state, Tour } = useJoyride({
    continuous: true,
    locale: {
      back: text.controls.back,
      last: text.controls.finish,
      next: text.controls.next,
      nextWithProgress: `${text.controls.next} (${text.controls.progress})`,
      skip: text.controls.skip,
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
      targetWaitTimeout: 8000,
      textColor: "#f3f3f3",
      zIndex: 200_000,
    },
    steps,
    tooltipComponent: OnboardingTooltip,
  });

  useEffect(() => {
    if (state.status !== STATUS.RUNNING) return undefined;

    const { validation } =
      (steps[state.index]?.data as VscodeStepData | undefined) || {};

    if (!validation) return undefined;

    let cancelled = false;
    let validating = false;
    let advanceTimer = 0;
    const checkValidation = (): void => {
      if (validating || cancelled) return;
      validating = true;

      validateStep(validation)
        .then((valid) => {
          if (!valid || cancelled) return;

          window.clearInterval(interval);
          advanceTimer = window.setTimeout(() => controls.next(), 150);
        })
        .finally(() => {
          validating = false;
        });
    };
    const interval = window.setInterval(checkValidation, 250);

    checkValidation();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(advanceTimer);
    };
  }, [controls, state.index, state.status, steps, validateStep]);

  useEffect(() => {
    setCompleted(
      window.localStorage.getItem(VSCODE_TUTORIAL_COMPLETED_KEY) === "true"
    );

    return () => {
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
    window.localStorage.removeItem(VSCODE_TUTORIAL_COMPLETED_KEY);
    setCompleted(false);
    controls.reset();
  }, [controls]);

  return {
    Tour,
    completed,
    currentStep: state.index,
    isPaused: state.status === STATUS.PAUSED,
    isRunning: state.status === STATUS.RUNNING,
    resetTour,
    resumeTour,
    startTour,
    text,
  };
};

export default useVscodeTutorial;

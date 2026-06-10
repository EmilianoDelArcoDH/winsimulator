import { useRouter } from "next/router";
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
import {
  getLocaleFromPathname,
  getTutorialText,
  type TutorialLocale,
  type TutorialStepId,
  type TutorialText,
} from "components/onboarding/translations";

export const ONBOARDING_COMPLETED_KEY = "winsim_onboarding_completed";

export type OnboardingStepData = {
  actionLabel?: string;
  buttonBack: string;
  buttonFinish: string;
  buttonNext: string;
  buttonPause: string;
  buttonSkip: string;
  followUpTarget?: string;
  progress: string;
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

const actionStep = (step: Step, followUpTarget?: string): Step => ({
  ...step,
  data: {
    ...(step.data as OnboardingStepData),
    followUpTarget,
    requiresAction: true,
  } satisfies OnboardingStepData,
  disableFocusTrap: true,
  hideOverlay: Boolean(followUpTarget),
});

export const getOnboardingTourSteps = (
  locale: TutorialLocale = "es"
): Step[] => {
  const text = getTutorialText(locale);
  const translatedStep = (
    id: TutorialStepId,
    step: Omit<Step, "content" | "data" | "id" | "title">
  ): Step => {
    const stepText = text.steps[id];

    return {
      ...step,
      content: stepText.description,
      data: {
        actionLabel: stepText.optionalHint,
        buttonBack: stepText.buttonBack,
        buttonFinish: stepText.buttonFinish,
        buttonNext: stepText.buttonNext,
        buttonPause: text.controls.pause,
        buttonSkip: text.controls.skip,
        progress: text.controls.progress,
      } satisfies OnboardingStepData,
      id,
      title: stepText.title,
    };
  };
  const tourSteps: Step[] = [
    translatedStep("welcome", {
      placement: "center",
      target: '[data-tour="welcome"]',
    }),
    translatedStep("desktop", {
      placement: "center",
      target: '[data-tour="desktop"]',
    }),
    actionStep(
      translatedStep("open-terminal", {
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
      }),
      '[data-tour="start-menu-terminal"]'
    ),
    translatedStep("terminal", {
      placement: "auto",
      target: '[data-tour="terminal"]',
    }),
    translatedStep("window-controls", {
      placement: "auto",
      target: '[data-tour="window-controls"]',
    }),
    actionStep(
      translatedStep("open-vscode", {
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
      }),
      '[data-tour="start-menu-vscode"]'
    ),
    translatedStep("vscode", {
      placement: "auto",
      target: '[data-tour="monaco-shell"]',
    }),
    actionStep(
      translatedStep("open-files", {
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
      }),
      '[data-tour="start-menu-documents"]'
    ),
    translatedStep("file-explorer", {
      placement: "auto",
      target: '[data-tour="file-explorer"]',
    }),
    translatedStep("activities-info", {
      placement: "center",
      target: '[data-tour="welcome"]',
    }),
    translatedStep("finish", {
      placement: "center",
      target: '[data-tour="welcome"]',
    }),
  ];

  return tourSteps.map((step) => safeStep(step));
};

export type OnboardingTour = {
  Tour: React.ReactElement | null;
  completed: boolean;
  currentStep: number;
  isPaused: boolean;
  isRunning: boolean;
  resetTour: () => void;
  resumeTour: () => void;
  startTour: () => void;
  text: TutorialText;
};

const resolveTarget = (target: StepTarget): HTMLElement | undefined => {
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target) || undefined;
  }

  if (typeof target === "function") {
    const resolvedTarget = target();

    return resolvedTarget === null ? undefined : resolvedTarget;
  }

  if (target && "current" in target) {
    return target.current === null ? undefined : target.current;
  }

  return target instanceof HTMLElement ? target : undefined;
};

const noop = (): void => {
  // No cleanup is registered until an action step is active.
};

export const useOnboardingTour = (): OnboardingTour => {
  const router = useRouter();
  const locale = getLocaleFromPathname(router.asPath);
  const text = useMemo(() => getTutorialText(locale), [locale]);
  const [completed, setCompleted] = useState(false);
  const actionCleanupRef = useRef<() => void>(noop);
  const steps = useMemo(() => getOnboardingTourSteps(locale), [locale]);
  const onEvent = useCallback(
    (event: EventData, eventControls: Controls): void => {
      actionCleanupRef.current();
      actionCleanupRef.current = noop;

      const stepData = event.step.data as OnboardingStepData | undefined;

      if (event.type === EVENTS.TOOLTIP && stepData?.requiresAction) {
        const target = resolveTarget(event.step.target);

        if (target) {
          const cleanups: (() => void)[] = [];
          const advance = (): void => {
            window.setTimeout(() => eventControls.next(), 150);
          };

          if (stepData.followUpTarget) {
            const { followUpTarget } = stepData;
            const attachFollowUp = (): void => {
              let attempts = 0;

              document.body.classList.add("onboarding-follow-up-active");

              const interval = window.setInterval(() => {
                attempts += 1;
                const followUp = resolveTarget(followUpTarget);

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
          } else {
            target.addEventListener("click", advance, { once: true });
            cleanups.push(() => target.removeEventListener("click", advance));
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
    },
    []
  );
  const { controls, state, Tour } = useJoyride({
    continuous: true,
    locale: {
      back: text.steps.welcome.buttonBack,
      close: text.controls.close,
      last: text.steps.welcome.buttonFinish,
      next: text.steps.welcome.buttonNext,
      nextWithProgress: `${text.steps.welcome.buttonNext} (${text.controls.progress})`,
      open: text.controls.open,
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

export default useOnboardingTour;

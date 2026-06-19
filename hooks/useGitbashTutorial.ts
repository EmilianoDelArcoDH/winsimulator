import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS, type EventData, type Step, useJoyride } from "react-joyride";
import OnboardingTooltip from "components/onboarding/OnboardingTooltip";
import { type OnboardingStepData } from "hooks/useOnboardingTour";
import { getLocaleFromPathname } from "components/onboarding/translations";
import {
  getGitbashTutorialText,
  type GitbashTutorialStepId,
  type GitbashTutorialText,
} from "components/onboarding/gitbashTranslations";
import { DESKTOP_PATH } from "utils/constants";

export const GITBASH_TUTORIAL_COMPLETED_KEY =
  "winsim_gitbash_tutorial_completed";

type GitbashCommandEvent = CustomEvent<{
  command: string;
  cwd: string;
}>;

export type GitbashStepData = OnboardingStepData & {
  validation?: GitbashTutorialStepId;
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

export const getGitbashTutorialSteps = (
  text: GitbashTutorialText
): Step[] => {
  const translatedStep = (
    id: GitbashTutorialStepId,
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
      } satisfies GitbashStepData,
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
      "open-gitbash",
      {
        placement: "center",
        target: '[data-tour="taskbar-start-button"]',
      },
      true
    ),
    translatedStep(
      "run-ls",
      {
        placement: "auto",
        target: '[data-tour="gitbash-input"]',
      },
      true
    ),
    translatedStep("finish", {
      placement: "center",
      target: '[data-tour="welcome"]',
    }),
  ];
};

export type GitbashTutorial = {
  Tour: React.ReactElement | null;
  completed: boolean;
  currentStep: number;
  isPaused: boolean;
  isRunning: boolean;
  resetTour: () => void;
  resumeTour: () => void;
  startTour: () => void;
  text: GitbashTutorialText;
};

export const useGitbashTutorial = (): GitbashTutorial => {
  const router = useRouter();
  const locale = getLocaleFromPathname(router.asPath);
  const text = useMemo(() => getGitbashTutorialText(locale), [locale]);
  const steps = useMemo(() => getGitbashTutorialSteps(text), [text]);
  const [completed, setCompleted] = useState(false);
  const [lsCommandCaptured, setLsCommandCaptured] = useState(false);
  const validateStep = useCallback(
    async (validation: GitbashTutorialStepId): Promise<boolean> => {
      switch (validation) {
        case "open-gitbash":
          return Boolean(document.querySelector('[data-tour="gitbash-shell"]'));
        case "run-ls":
          return lsCommandCaptured;
        default:
          return false;
      }
    },
    [lsCommandCaptured]
  );
  const onEvent = useCallback((event: EventData): void => {
    if (event.status === STATUS.FINISHED) {
      window.localStorage.setItem(GITBASH_TUTORIAL_COMPLETED_KEY, "true");
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
    const onGitbashCommand = (event: Event): void => {
      const { command, cwd } = (event as GitbashCommandEvent).detail || {};

      if (command === "ls" && cwd === DESKTOP_PATH) {
        setLsCommandCaptured(true);
      }
    };

    window.addEventListener("winsim:gitbash-command", onGitbashCommand);

    return () => {
      window.removeEventListener("winsim:gitbash-command", onGitbashCommand);
    };
  }, []);

  useEffect(() => {
    if (state.status !== STATUS.RUNNING) return undefined;

    const { validation } =
      (steps[state.index]?.data as GitbashStepData | undefined) || {};

    if (!validation) return undefined;

    document.body.classList.add("onboarding-follow-up-active");

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
      document.body.classList.remove("onboarding-follow-up-active");
      window.clearInterval(interval);
      window.clearTimeout(advanceTimer);
    };
  }, [controls, state.index, state.status, steps, validateStep]);

  useEffect(() => {
    setCompleted(
      window.localStorage.getItem(GITBASH_TUTORIAL_COMPLETED_KEY) === "true"
    );

    return () => {
      controls.stop();
    };
  }, [controls]);

  const startTour = useCallback((): void => {
    setCompleted(false);
    setLsCommandCaptured(false);
    controls.reset();
    controls.start();
  }, [controls]);
  const resumeTour = useCallback(
    (): void => controls.start(state.index),
    [controls, state.index]
  );
  const resetTour = useCallback((): void => {
    window.localStorage.removeItem(GITBASH_TUTORIAL_COMPLETED_KEY);
    setCompleted(false);
    setLsCommandCaptured(false);
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

export default useGitbashTutorial;

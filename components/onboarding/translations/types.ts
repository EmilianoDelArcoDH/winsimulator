import { type SessionLanguage } from "contexts/session/types";

export type TutorialLocale = SessionLanguage;

export type TutorialStepId =
  | "activities-info"
  | "desktop"
  | "file-explorer"
  | "finish"
  | "open-files"
  | "open-terminal"
  | "open-vscode"
  | "terminal"
  | "vscode"
  | "welcome"
  | "window-controls";

export type TutorialStepText = {
  buttonBack: string;
  buttonFinish: string;
  buttonNext: string;
  description: string;
  optionalHint?: string;
  title: string;
};

export type TutorialText = {
  controls: {
    close: string;
    open: string;
    pause: string;
    progress: string;
    skip: string;
  };
  panel: {
    completed: string;
    description: string;
    inProgress: string;
    reset: string;
    resume: string;
    start: string;
  };
  steps: Record<TutorialStepId, TutorialStepText>;
};

export type TutorialTranslation = {
  controls?: Partial<TutorialText["controls"]>;
  panel?: Partial<TutorialText["panel"]>;
  steps?: Partial<Record<TutorialStepId, Partial<TutorialStepText>>>;
};

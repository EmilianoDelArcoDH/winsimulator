import { type TutorialLocale } from "components/onboarding/translations";

export type VscodeTutorialLocale = TutorialLocale;

export type VscodeTutorialStepId =
  | "create-file"
  | "create-folder"
  | "finish"
  | "open-file"
  | "open-terminal"
  | "open-vscode"
  | "select-vscode"
  | "welcome";

export type VscodeTutorialStepText = {
  description: string;
  optionalHint?: string;
  title: string;
};

export type VscodeTutorialText = {
  controls: {
    back: string;
    finish: string;
    next: string;
    pause: string;
    progress: string;
    skip: string;
    skipStep: string;
  };
  panel: {
    completed: string;
    description: string;
    inProgress: string;
    reset: string;
    resume: string;
    start: string;
  };
  steps: Record<VscodeTutorialStepId, VscodeTutorialStepText>;
};

export type VscodeTutorialTranslation = {
  controls?: Partial<VscodeTutorialText["controls"]>;
  panel?: Partial<VscodeTutorialText["panel"]>;
  steps?: Partial<
    Record<VscodeTutorialStepId, Partial<VscodeTutorialStepText>>
  >;
};

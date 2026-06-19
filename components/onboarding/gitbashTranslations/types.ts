import { type TutorialLocale } from "components/onboarding/translations";

export type GitbashTutorialLocale = TutorialLocale;

export type GitbashTutorialStepId =
  | "finish"
  | "open-gitbash"
  | "run-ls"
  | "welcome";

export type GitbashTutorialStepText = {
  description: string;
  optionalHint?: string;
  title: string;
};

export type GitbashTutorialText = {
  controls: {
    back: string;
    finish: string;
    next: string;
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
  steps: Record<GitbashTutorialStepId, GitbashTutorialStepText>;
};

export type GitbashTutorialTranslation = {
  controls?: Partial<GitbashTutorialText["controls"]>;
  panel?: Partial<GitbashTutorialText["panel"]>;
  steps?: Partial<
    Record<GitbashTutorialStepId, Partial<GitbashTutorialStepText>>
  >;
};

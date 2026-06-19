import gitbashTutorialEn from "components/onboarding/gitbashTranslations/gitbashTutorial.en";
import gitbashTutorialEs from "components/onboarding/gitbashTranslations/gitbashTutorial.es";
import gitbashTutorialPt from "components/onboarding/gitbashTranslations/gitbashTutorial.pt";
import {
  type GitbashTutorialLocale,
  type GitbashTutorialText,
  type GitbashTutorialTranslation,
} from "components/onboarding/gitbashTranslations/types";

const translations: Record<GitbashTutorialLocale, GitbashTutorialTranslation> =
  {
    en: gitbashTutorialEn,
    es: gitbashTutorialEs,
    pt: gitbashTutorialPt,
  };

export const getGitbashTutorialText = (
  locale: GitbashTutorialLocale
): GitbashTutorialText => {
  const translation = translations[locale];

  return {
    controls: {
      ...gitbashTutorialEs.controls,
      ...translation.controls,
    },
    panel: {
      ...gitbashTutorialEs.panel,
      ...translation.panel,
    },
    steps: Object.fromEntries(
      Object.entries(gitbashTutorialEs.steps).map(([id, step]) => [
        id,
        {
          ...step,
          ...translation.steps?.[id as keyof typeof gitbashTutorialEs.steps],
        },
      ])
    ) as GitbashTutorialText["steps"],
  };
};

export type {
  GitbashTutorialLocale,
  GitbashTutorialStepId,
  GitbashTutorialStepText,
  GitbashTutorialText,
  GitbashTutorialTranslation,
} from "components/onboarding/gitbashTranslations/types";

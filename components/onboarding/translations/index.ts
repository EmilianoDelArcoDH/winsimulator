import tutorialEn from "components/onboarding/translations/tutorial.en";
import tutorialEs from "components/onboarding/translations/tutorial.es";
import tutorialPt from "components/onboarding/translations/tutorial.pt";
import {
  type TutorialLocale,
  type TutorialText,
  type TutorialTranslation,
} from "components/onboarding/translations/types";

const translations: Record<TutorialLocale, TutorialTranslation> = {
  en: tutorialEn,
  es: tutorialEs,
  pt: tutorialPt,
};

export const getLocaleFromPathname = (pathname: string): TutorialLocale => {
  if (!pathname) return "es";

  const localeMatch = /^\/(en|es|pt)(?:\/|$)/u.exec(pathname);
  const locale = localeMatch?.[1];

  return locale === "en" || locale === "pt" || locale === "es" ? locale : "es";
};

export const getTutorialText = (
  locale: TutorialLocale,
  translation: TutorialTranslation = translations[locale]
): TutorialText => {
  const localizedSteps = translation.steps || {};

  return {
    controls: {
      ...tutorialEs.controls,
      ...translation.controls,
    },
    panel: {
      ...tutorialEs.panel,
      ...translation.panel,
    },
    steps: Object.fromEntries(
      Object.entries(tutorialEs.steps).map(([id, step]) => [
        id,
        {
          ...step,
          ...localizedSteps[id as keyof typeof localizedSteps],
        },
      ])
    ) as TutorialText["steps"],
  };
};

export type {
  TutorialLocale,
  TutorialStepId,
  TutorialStepText,
  TutorialText,
  TutorialTranslation,
} from "components/onboarding/translations/types";

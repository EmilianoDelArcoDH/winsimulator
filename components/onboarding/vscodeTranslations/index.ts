import vscodeTutorialEn from "components/onboarding/vscodeTranslations/vscodeTutorial.en";
import vscodeTutorialEs from "components/onboarding/vscodeTranslations/vscodeTutorial.es";
import vscodeTutorialPt from "components/onboarding/vscodeTranslations/vscodeTutorial.pt";
import {
  type VscodeTutorialLocale,
  type VscodeTutorialText,
  type VscodeTutorialTranslation,
} from "components/onboarding/vscodeTranslations/types";

const translations: Record<VscodeTutorialLocale, VscodeTutorialTranslation> = {
  en: vscodeTutorialEn,
  es: vscodeTutorialEs,
  pt: vscodeTutorialPt,
};

export const getVscodeTutorialText = (
  locale: VscodeTutorialLocale
): VscodeTutorialText => {
  const translation = translations[locale];
  const localizedSteps = translation.steps || {};

  return {
    controls: {
      ...vscodeTutorialEs.controls,
      ...translation.controls,
    },
    panel: {
      ...vscodeTutorialEs.panel,
      ...translation.panel,
    },
    steps: Object.fromEntries(
      Object.entries(vscodeTutorialEs.steps).map(([id, step]) => [
        id,
        {
          ...step,
          ...localizedSteps[id as keyof typeof localizedSteps],
        },
      ])
    ) as VscodeTutorialText["steps"],
  };
};

export type {
  VscodeTutorialLocale,
  VscodeTutorialStepId,
  VscodeTutorialStepText,
  VscodeTutorialText,
  VscodeTutorialTranslation,
} from "components/onboarding/vscodeTranslations/types";

import {
  getOnboardingTourSteps,
  type OnboardingStepData,
  ONBOARDING_COMPLETED_KEY,
} from "hooks/useOnboardingTour";
import {
  getLocaleFromPathname,
  getTutorialText,
} from "components/onboarding/translations";

describe("onboarding tour configuration", () => {
  test("contains every required platform step in order", () => {
    expect(getOnboardingTourSteps().map(({ id }) => id)).toEqual([
      "welcome",
      "desktop",
      "open-terminal",
      "terminal",
      "window-controls",
      "open-vscode",
      "vscode",
      "open-files",
      "file-explorer",
      "activities-info",
      "finish",
    ]);
  });

  test("application launches require a real user action", () => {
    const actionSteps = getOnboardingTourSteps().filter(
      ({ data }) => (data as OnboardingStepData | undefined)?.requiresAction
    );

    expect(actionSteps.map(({ id }) => id)).toEqual([
      "open-terminal",
      "open-vscode",
      "open-files",
    ]);
    expect(
      actionSteps.map(
        ({ data }) => (data as OnboardingStepData | undefined)?.followUpTarget
      )
    ).toEqual([
      '[data-tour="start-menu-terminal"]',
      '[data-tour="start-menu-vscode"]',
      '[data-tour="start-menu-documents"]',
    ]);
  });

  test("uses a stable localStorage key", () => {
    expect(ONBOARDING_COMPLETED_KEY).toBe("winsim_onboarding_completed");
  });

  test.each([
    ["/es/tutorial", "es", "Bienvenido a DH Console"],
    ["/en/tutorial", "en", "Welcome to DH Console"],
    ["/pt/tutorial", "pt", "Boas-vindas ao DH Console"],
    ["/tutorial", "es", "Bienvenido a DH Console"],
    ["/otra-ruta/tutorial", "es", "Bienvenido a DH Console"],
  ] as const)(
    "%s renders the expected tutorial language",
    (pathname, locale, expectedTitle) => {
      const resolvedLocale = getLocaleFromPathname(pathname);
      const [welcomeStep] = getOnboardingTourSteps(resolvedLocale);

      expect(resolvedLocale).toBe(locale);
      expect(welcomeStep.title).toBe(expectedTitle);
    }
  );

  test("localizes the progress pattern", () => {
    expect(getTutorialText("en").controls.progress).toBe(
      "{current} of {total}"
    );
    expect(getTutorialText("pt").controls.progress).toBe(
      "{current} de {total}"
    );
  });

  test("falls back to Spanish when a translated key is missing", () => {
    const text = getTutorialText("en", {
      steps: {
        welcome: {
          title: "Welcome",
        },
      },
    });

    expect(text.steps.welcome.title).toBe("Welcome");
    expect(text.steps.welcome.description).toContain("Bienvenido a DH Console");
    expect(text.steps.welcome.buttonFinish).toBe("Finalizar");
  });
});

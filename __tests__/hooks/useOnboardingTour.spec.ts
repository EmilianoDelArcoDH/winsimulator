import {
  getOnboardingTourSteps,
  ONBOARDING_COMPLETED_KEY,
} from "hooks/useOnboardingTour";

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
      ({ data }) => data?.requiresAction
    );

    expect(actionSteps.map(({ id }) => id)).toEqual([
      "open-terminal",
      "open-vscode",
      "open-files",
    ]);
    expect(actionSteps.map(({ data }) => data.followUpTarget)).toEqual([
      '[data-tour="start-menu-terminal"]',
      '[data-tour="start-menu-vscode"]',
      '[data-tour="start-menu-documents"]',
    ]);
  });

  test("uses a stable localStorage key", () => {
    expect(ONBOARDING_COMPLETED_KEY).toBe("winsim_onboarding_completed");
  });
});

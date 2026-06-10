import {
  getVscodeTutorialSteps,
  type VscodeStepData,
  VSCODE_TUTORIAL_COMPLETED_KEY,
  VSCODE_TUTORIAL_FILE,
  VSCODE_TUTORIAL_FOLDER,
} from "hooks/useVscodeTutorial";
import { getVscodeTutorialText } from "components/onboarding/vscodeTranslations";

describe("Visual Studio Code tutorial", () => {
  test("contains the expected steps in order", () => {
    const steps = getVscodeTutorialSteps(getVscodeTutorialText("es"));

    expect(steps.map(({ id }) => id)).toEqual([
      "welcome",
      "open-vscode",
      "create-folder",
      "create-file",
      "open-file",
      "open-terminal",
      "finish",
    ]);
  });

  test("waits for every required user action", () => {
    const actionSteps = getVscodeTutorialSteps(
      getVscodeTutorialText("es")
    ).filter(
      ({ data }) => (data as VscodeStepData | undefined)?.requiresAction
    );

    expect(actionSteps.map(({ id }) => id)).toEqual([
      "open-vscode",
      "create-folder",
      "create-file",
      "open-file",
      "open-terminal",
    ]);
  });

  test("includes the Start icon in every language", () => {
    expect(
      getVscodeTutorialText("es").steps["open-vscode"].optionalHint
    ).toContain("Inicio 🏠");
    expect(
      getVscodeTutorialText("en").steps["open-vscode"].optionalHint
    ).toContain("Start 🏠");
    expect(
      getVscodeTutorialText("pt").steps["open-vscode"].optionalHint
    ).toContain("Iniciar 🏠");
  });

  test("uses stable paths and completion storage", () => {
    expect(VSCODE_TUTORIAL_FOLDER).toBe("/Users/Public/Desktop/mi-sitio");
    expect(VSCODE_TUTORIAL_FILE).toBe(
      "/Users/Public/Desktop/mi-sitio/index.html"
    );
    expect(VSCODE_TUTORIAL_COMPLETED_KEY).toBe(
      "winsim_vscode_tutorial_completed"
    );
  });
});

import { type VscodeTutorialTranslation } from "components/onboarding/vscodeTranslations/types";

const vscodeTutorialEn: VscodeTutorialTranslation = {
  controls: {
    back: "Back",
    finish: "Finish",
    next: "Next",
    pause: "Pause",
    progress: "{current} of {total}",
    skip: "Skip",
  },
  panel: {
    completed:
      "Tutorial completed. You created a web project and opened the Visual Studio Code terminal.",
    description:
      "Learn to create a folder, an index.html file, and open the integrated terminal.",
    inProgress:
      "Tutorial in progress. Each step advances after you complete the requested action.",
    reset: "Restart",
    resume: "Continue from step {step}",
    start: "Start VS Code tutorial",
  },
  steps: {
    "create-file": {
      description:
        "With the mi-sitio folder selected, open File > New File and enter index.html. This step advances when the file exists inside the folder.",
      optionalHint: "Create mi-sitio/index.html",
      title: "Create index.html",
    },
    "create-folder": {
      description:
        "Open File > New Folder, enter mi-sitio, and confirm with Enter. We will wait until the folder exists.",
      optionalHint: "Create the mi-sitio folder",
      title: "Create a folder",
    },
    finish: {
      description:
        "You created the mi-sitio folder, its index.html file, and opened the integrated terminal. You can start editing your site.",
      title: "Tutorial completed",
    },
    "open-file": {
      description:
        "index.html must be open in the editor. If it is not open, select it in Explorer.",
      optionalHint: "Open index.html",
      title: "Open the file",
    },
    "open-terminal": {
      description:
        "Open the Terminal menu and select the option that shows the integrated terminal.",
      optionalHint: "Open the integrated terminal",
      title: "Open the terminal",
    },
    "open-vscode": {
      description:
        "Open Start 🏠 and select Visual Studio Code. We will wait until the editor is ready.",
      optionalHint: "Click Start 🏠, then Visual Studio Code",
      title: "Open Visual Studio Code",
    },
    welcome: {
      description:
        "In this tour, you will use the real Visual Studio Code to create the mi-sitio folder, add index.html, and open the terminal.",
      title: "Visual Studio Code tutorial",
    },
  },
};

export default vscodeTutorialEn;

import { type TutorialTranslation } from "components/onboarding/translations/types";

const navigation = {
  buttonBack: "Back",
  buttonFinish: "Finish",
  buttonNext: "Next",
};

const tutorialEn: TutorialTranslation = {
  controls: {
    close: "Close",
    open: "Open explanation",
    pause: "Pause",
    progress: "{current} of {total}",
    skip: "Skip",
  },
  panel: {
    completed: "Tour completed. You now have an overview of the platform.",
    description:
      "Explore the desktop, its applications, and the complete flow of a Git activity.",
    inProgress: "Tour in progress. You can pause it from the panel.",
    reset: "Restart",
    resume: "Continue from step {step}",
    start: "Start Guided Tour",
  },
  steps: {
    "activities-info": {
      ...navigation,
      description:
        "Activities combine goals, instructions, tools, and validations. They open when you choose an activity, not during this general tour.",
      title: "How activities work",
    },
    desktop: {
      ...navigation,
      description:
        "This is the actual desktop. Shortcuts, open windows, and the taskbar appear here.",
      title: "The desktop",
    },
    "file-explorer": {
      ...navigation,
      description:
        "File Explorer lets you browse folders, open files, and organize the workspace used by applications.",
      title: "File Explorer",
    },
    finish: {
      ...navigation,
      description:
        "You now know the desktop, Start, Terminal, Visual Studio Code, File Explorer, and the window controls. You can start practicing.",
      title: "Tour completed",
    },
    "open-files": {
      ...navigation,
      description:
        "Open Start 🏠 and select Documents to explore File Explorer.",
      optionalHint: "Click Start 🏠, then Documents",
      title: "Open Documents",
    },
    "open-terminal": {
      ...navigation,
      description:
        "Click Start 🏠 and then Terminal. The window opens only after you select the application.",
      optionalHint: "Click Start 🏠, then Terminal",
      title: "Open Terminal",
    },
    "open-vscode": {
      ...navigation,
      description:
        "Open Start 🏠 and select Visual Studio Code to explore the actual editor.",
      optionalHint: "Click Start 🏠, then Visual Studio Code",
      title: "Open Visual Studio Code",
    },
    terminal: {
      ...navigation,
      description:
        "In Terminal, you can type commands and run them with Enter. Git activities record the commands and the resulting state.",
      title: "Using Terminal",
    },
    vscode: {
      ...navigation,
      description:
        "Here you can edit project files, use the integrated terminal, and validate workspace activities.",
      title: "Visual Studio Code",
    },
    welcome: {
      ...navigation,
      description:
        "Welcome to DH Console. You will explore the platform using its actual controls and applications.",
      title: "Welcome to DH Console",
    },
    "window-controls": {
      ...navigation,
      description:
        "All applications use these actual controls to minimize, maximize, or close the window.",
      title: "Window controls",
    },
  },
};

export default tutorialEn;

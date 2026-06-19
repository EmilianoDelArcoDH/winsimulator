import { type VscodeTutorialText } from "components/onboarding/vscodeTranslations/types";

const vscodeTutorialEn: VscodeTutorialText = {
  controls: {
    back: "Back",
    finish: "Finish",
    next: "Next",
    pause: "Pause",
    progress: "{current} of {total}",
    skip: "Skip",
    skipStep: "Skip step",
  },
  panel: {
    completed:
      "Tutorial completed. You created the mi-sitio project with index.html and opened the Visual Studio Code terminal.",
    description:
      "Learn to use Visual Studio Code: create folders, HTML files, and open the integrated terminal, step by step.",
    inProgress:
      "Tutorial in progress. Each step advances after you complete the requested action.",
    reset: "Restart",
    resume: "Continue from step {step}",
    start: "Start VS Code tutorial",
  },
  steps: {
    "create-file": {
      description:
        "First, click the mi-sitio folder in the Explorer to select it. Then click the highlighted New File icon (the first of the two icons). Type index.html and press Enter.",
      optionalHint: "Select mi-sitio, then create index.html",
      title: "Create index.html",
    },
    "create-folder": {
      description:
        "In the Explorer panel on the left, click the highlighted New Folder icon (the second icon next to the EXPLORER title). Type mi-sitio and press Enter. The folder will appear in the file tree.",
      optionalHint: "Create the mi-sitio folder",
      title: "Create a folder",
    },
    finish: {
      description:
        "Great work! You learned how to create folders and files in VS Code and how to open the integrated terminal. Your mi-sitio project with index.html is ready to edit.",
      title: "Tutorial completed!",
    },
    "open-file": {
      description:
        "The index.html file opened automatically in the editor. You can see its HTML content in the central area. Notice the active tab at the top of the editor. When you are ready, click Next.",
      title: "Review the editor",
    },
    "open-terminal": {
      description:
        "Click the Terminal button highlighted in the top menu bar. In the submenu that appears, select Toggle Terminal. The integrated terminal will open at the bottom of the editor.",
      optionalHint: "Terminal → Toggle Terminal",
      title: "Open the terminal",
    },
    "open-vscode": {
      description:
        "Click the Start button (🏠) in the taskbar to open the app menu. In the next step you will choose Visual Studio Code.",
      optionalHint: "Click Start 🏠",
      title: "Open Start",
    },
    "select-vscode": {
      description:
        "Now select Visual Studio Code in the Start menu. The tutorial will advance automatically once the editor is ready.",
      optionalHint: "Select Visual Studio Code",
      title: "Choose Visual Studio Code",
    },
    welcome: {
      description:
        "In this tutorial you will learn to open Visual Studio Code, create a project folder called mi-sitio, create your first HTML file, and open the integrated terminal.",
      title: "Visual Studio Code tutorial",
    },
  },
};

export default vscodeTutorialEn;

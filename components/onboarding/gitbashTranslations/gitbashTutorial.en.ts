import { type GitbashTutorialTranslation } from "components/onboarding/gitbashTranslations/types";

const gitbashTutorialEn: GitbashTutorialTranslation = {
  controls: {
    back: "Back",
    finish: "Finish",
    next: "Next",
    pause: "Pause",
    skip: "Skip",
  },
  panel: {
    completed: "Tutorial completed. You ran ls from the Desktop in GitBash.",
    description:
      "Learn to open GitBash from the desktop and list the available folders.",
    inProgress:
      "Tutorial in progress. Each step advances after you complete the requested action.",
    start: "Start GitBash tutorial",
  },
  steps: {
    finish: {
      description:
        "You used GitBash from Desktop and ran ls to see the desktop contents.",
      title: "Tutorial completed",
    },
    "open-gitbash": {
      description:
        "Open Start and select GitBash. The console should start in the desktop folder.",
      optionalHint: "Click Start, then GitBash",
      title: "Open GitBash",
    },
    "run-ls": {
      description:
        "In the console, type ls and press Enter to show the folders and files on the desktop.",
      optionalHint: "Type ls and press Enter",
      title: "List the desktop",
    },
    welcome: {
      description:
        "In this walkthrough, you will practice your first GitBash command. You will start from Desktop and use ls to see what is in that folder.",
      title: "GitBash tutorial",
    },
  },
};

export default gitbashTutorialEn;

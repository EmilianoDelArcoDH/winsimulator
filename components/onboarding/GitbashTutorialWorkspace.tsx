import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import StyledOnboarding from "components/onboarding/StyledOnboarding";
import GitbashTutorial from "components/onboarding/GitbashTutorial";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";

const GitbashTutorialWorkspace: FC = () => {
  useIFrameFocuser();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
      <StyledOnboarding>
        <GitbashTutorial />
      </StyledOnboarding>
    </Desktop>
  );
};

export default GitbashTutorialWorkspace;

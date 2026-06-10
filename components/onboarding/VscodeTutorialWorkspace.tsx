import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import StyledOnboarding from "components/onboarding/StyledOnboarding";
import VscodeTutorial from "components/onboarding/VscodeTutorial";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";

const VscodeTutorialWorkspace: FC = () => {
  useIFrameFocuser();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
      <StyledOnboarding>
        <VscodeTutorial />
      </StyledOnboarding>
    </Desktop>
  );
};

export default VscodeTutorialWorkspace;

import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import OnboardingTour from "components/onboarding/OnboardingTour";
import StyledOnboarding from "components/onboarding/StyledOnboarding";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";

const TutorialWorkspace: FC = () => {
  useIFrameFocuser();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
      <StyledOnboarding>
        <OnboardingTour />
      </StyledOnboarding>
    </Desktop>
  );
};

export default TutorialWorkspace;

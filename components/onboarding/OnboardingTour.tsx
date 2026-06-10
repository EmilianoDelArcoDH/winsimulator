import useTour from "hooks/useOnboardingTour";

const OnboardingTour: FC = () => {
  const {
    completed,
    currentStep,
    isPaused,
    isRunning,
    resetTour,
    resumeTour,
    startTour,
    text,
    Tour,
  } = useTour();

  return (
    <>
      {Tour}
      <div className="onboarding-actions" data-tour="welcome">
        <p>{text.panel.description}</p>
        <div>
          {!isRunning && !isPaused && (
            <button className="primary" onClick={startTour} type="button">
              {text.panel.start}
            </button>
          )}
          {isRunning && <span>{text.panel.inProgress}</span>}
          {isPaused && (
            <button className="primary" onClick={resumeTour} type="button">
              {text.panel.resume.replace("{step}", String(currentStep + 1))}
            </button>
          )}
          {(completed || isPaused) && (
            <button onClick={resetTour} type="button">
              {text.panel.reset}
            </button>
          )}
        </div>
        {completed && (
          <strong className="completed-message">{text.panel.completed}</strong>
        )}
      </div>
    </>
  );
};

export default OnboardingTour;

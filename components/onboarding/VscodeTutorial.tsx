import useTutorial from "hooks/useVscodeTutorial";

const VscodeTutorial: FC = () => {
  const {
    Tour,
    completed,
    currentStep,
    isPaused,
    isRunning,
    resetTour,
    resumeTour,
    startTour,
    text,
    totalSteps,
  } = useTutorial();
  const showPanel = !isRunning || currentStep === 0;

  return (
    <>
      {Tour}
      {showPanel && (
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
              <>
                <div className="progress-bar" aria-hidden="true">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.round(
                        ((currentStep + 1) / totalSteps) * 100
                      )}%`,
                    }}
                  />
                </div>
                <button className="primary" onClick={resumeTour} type="button">
                  {text.panel.resume.replace(
                    "{step}",
                    String(currentStep + 1)
                  )}
                </button>
              </>
            )}
            {(completed || isPaused) && (
              <button onClick={resetTour} type="button">
                {text.panel.reset}
              </button>
            )}
          </div>
          {completed && (
            <strong className="completed-message">
              {text.panel.completed}
            </strong>
          )}
        </div>
        )}
    </>
  );
};

export default VscodeTutorial;

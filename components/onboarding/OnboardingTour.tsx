import useOnboardingTour from "hooks/useOnboardingTour";

const OnboardingTour: FC = () => {
  const {
    completed,
    currentStep,
    isPaused,
    isRunning,
    resetTour,
    resumeTour,
    startTour,
    Tour,
  } = useOnboardingTour();

  return (
    <>
      {Tour}
      <div className="onboarding-actions" data-tour="welcome">
        <p>
          Recorre el escritorio, las aplicaciones y el flujo completo de una
          actividad Git.
        </p>
        <div>
          {!isRunning && !isPaused && (
            <button className="primary" onClick={startTour} type="button">
              Iniciar Tour Guiado
            </button>
          )}
          {isRunning && (
            <span>Tour en curso. Puedes pausarlo desde el panel.</span>
          )}
          {isPaused && (
            <button className="primary" onClick={resumeTour} type="button">
              Continuar desde el paso {currentStep + 1}
            </button>
          )}
          {(completed || isPaused) && (
            <button onClick={resetTour} type="button">
              Reiniciar
            </button>
          )}
        </div>
        {completed && (
          <strong className="completed-message">
            Tour completado. Ya tienes el mapa general de la plataforma.
          </strong>
        )}
      </div>
    </>
  );
};

export default OnboardingTour;

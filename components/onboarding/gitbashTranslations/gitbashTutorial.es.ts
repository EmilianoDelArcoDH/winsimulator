import { type GitbashTutorialText } from "components/onboarding/gitbashTranslations/types";

const gitbashTutorialEs: GitbashTutorialText = {
  controls: {
    back: "Atras",
    finish: "Finalizar",
    next: "Siguiente",
    pause: "Pausar",
    progress: "{current} de {total}",
    skip: "Saltar",
  },
  panel: {
    completed:
      "Tutorial completado. Ejecutaste ls desde el escritorio en GitBash.",
    description:
      "Aprende a abrir GitBash desde el escritorio y listar las carpetas disponibles.",
    inProgress:
      "Tutorial en curso. Cada paso avanza cuando completas la accion indicada.",
    reset: "Reiniciar",
    resume: "Continuar desde el paso {step}",
    start: "Iniciar tutorial de GitBash",
  },
  steps: {
    finish: {
      description:
        "Ya usaste GitBash desde Desktop y ejecutaste ls para ver el contenido del escritorio.",
      title: "Tutorial completado",
    },
    "open-gitbash": {
      description:
        "Abre Inicio y selecciona GitBash. La consola debe iniciar ubicada en el escritorio.",
      optionalHint: "Haz clic en Inicio y luego en GitBash",
      title: "Abre GitBash",
    },
    "run-ls": {
      description:
        "En la consola escribe ls y presiona Enter para mostrar las carpetas y archivos que se encuentran en el escritorio.",
      optionalHint: "Escribe ls y presiona Enter",
      title: "Lista el escritorio",
    },
    welcome: {
      description:
        "En este recorrido vas a practicar tu primer comando en GitBash. Empezaras desde Desktop y usaras ls para ver que hay en esa carpeta.",
      title: "Tutorial de GitBash",
    },
  },
};

export default gitbashTutorialEs;

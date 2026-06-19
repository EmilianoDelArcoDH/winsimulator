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
        "Haz clic en el botón Inicio de la barra de tareas para abrir el menú de aplicaciones. En el siguiente paso vas a elegir GitBash.",
      optionalHint: "Haz clic en Inicio",
      title: "Abre Inicio",
    },
    "run-ls": {
      description:
        "En la consola escribe ls y presiona Enter para mostrar las carpetas y archivos que se encuentran en el escritorio.",
      optionalHint: "Escribe ls y presiona Enter",
      title: "Lista el escritorio",
    },
    "select-gitbash": {
      description:
        "Ahora selecciona GitBash en el menú Inicio. La consola se abrirá ubicada en Desktop para que puedas ejecutar tu primer comando.",
      optionalHint: "Selecciona GitBash",
      title: "Elige GitBash",
    },
    welcome: {
      description:
        "En este recorrido vas a practicar tu primer comando en GitBash. Empezaras desde Desktop y usaras ls para ver que hay en esa carpeta.",
      title: "Tutorial de GitBash",
    },
  },
};

export default gitbashTutorialEs;

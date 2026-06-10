import { type TutorialText } from "components/onboarding/translations/types";

const navigation = {
  buttonBack: "Atrás",
  buttonFinish: "Finalizar",
  buttonNext: "Siguiente",
};

const tutorialEs: TutorialText = {
  controls: {
    close: "Cerrar",
    open: "Abrir explicación",
    pause: "Pausar",
    progress: "{current} de {total}",
    skip: "Saltar",
  },
  panel: {
    completed: "Tour completado. Ya tienes el mapa general de la plataforma.",
    description:
      "Recorre el escritorio, las aplicaciones y el flujo completo de una actividad Git.",
    inProgress: "Tour en curso. Puedes pausarlo desde el panel.",
    reset: "Reiniciar",
    resume: "Continuar desde el paso {step}",
    start: "Iniciar Tour Guiado",
  },
  steps: {
    "activities-info": {
      ...navigation,
      description:
        "Las actividades combinan objetivos, instrucciones, herramientas y validaciones. Se abren cuando eliges una actividad, no durante este recorrido general.",
      title: "Cómo funcionan las actividades",
    },
    desktop: {
      ...navigation,
      description:
        "Este es el escritorio real. Aquí aparecen accesos, ventanas abiertas y la barra de tareas.",
      title: "El escritorio",
    },
    "file-explorer": {
      ...navigation,
      description:
        "El Explorador permite navegar carpetas, abrir archivos y organizar el workspace usado por las aplicaciones.",
      title: "Explorador de Archivos",
    },
    finish: {
      ...navigation,
      description:
        "Ya conoces el escritorio, Inicio, Terminal, Visual Studio Code, el Explorador y los controles de ventana. Puedes empezar a practicar.",
      title: "Tour completado",
    },
    "open-files": {
      ...navigation,
      description:
        "Abre Inicio y selecciona Documents para conocer el Explorador de Archivos.",
      optionalHint: "Haz clic en Inicio y luego en Documents",
      title: "Abre Documents",
    },
    "open-terminal": {
      ...navigation,
      description:
        "Haz clic en Inicio y luego en Terminal. La ventana solo se abrirá cuando selecciones la aplicación.",
      optionalHint: "Haz clic en Inicio y luego en Terminal",
      title: "Abre Terminal",
    },
    "open-vscode": {
      ...navigation,
      description:
        "Abre Inicio y selecciona Visual Studio Code para conocer el editor real.",
      optionalHint: "Haz clic en Inicio y luego en Visual Studio Code",
      title: "Abre Visual Studio Code",
    },
    terminal: {
      ...navigation,
      description:
        "En Terminal puedes escribir comandos y ejecutarlos con Enter. Las actividades Git registran los comandos y el estado resultante.",
      title: "Usar Terminal",
    },
    vscode: {
      ...navigation,
      description:
        "Aquí puedes editar los archivos de los proyectos, usar la terminal integrada y validar actividades de workspace.",
      title: "Visual Studio Code",
    },
    welcome: {
      ...navigation,
      description:
        "Bienvenido a DH Console. Vas a recorrer la plataforma usando sus controles y aplicaciones reales.",
      title: "Bienvenido a DH Console",
    },
    "window-controls": {
      ...navigation,
      description:
        "Todas las aplicaciones usan estos controles reales para minimizar, maximizar o cerrar la ventana.",
      title: "Controles de ventana",
    },
  },
};

export default tutorialEs;

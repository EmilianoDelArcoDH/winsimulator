import { type VscodeTutorialText } from "components/onboarding/vscodeTranslations/types";

const vscodeTutorialEs: VscodeTutorialText = {
  controls: {
    back: "Atrás",
    finish: "Finalizar",
    next: "Siguiente",
    pause: "Pausar",
    progress: "{current} de {total}",
    skip: "Saltar",
    skipStep: "Saltar paso",
  },
  panel: {
    completed:
      "Tutorial completado. Creaste el proyecto mi-sitio con index.html y abriste la terminal de Visual Studio Code.",
    description:
      "Aprende a usar Visual Studio Code: crea carpetas, archivos HTML y abre la terminal integrada, paso a paso.",
    inProgress:
      "Tutorial en curso. Cada paso avanza cuando completas la acción indicada.",
    reset: "Reiniciar",
    resume: "Continuar desde el paso {step}",
    start: "Iniciar tutorial de VS Code",
  },
  steps: {
    "create-file": {
      description:
        "Primero haz clic en la carpeta mi-sitio en el Explorador para seleccionarla. Luego haz clic en el ícono Nuevo Archivo (el primero de los dos íconos resaltados). Escribe index.html y presiona Enter.",
      optionalHint: "Selecciona mi-sitio, luego crea index.html",
      title: "Crea index.html",
    },
    "create-folder": {
      description:
        "En el panel Explorador de la izquierda, haz clic en el ícono Nueva Carpeta resaltado (el segundo ícono junto al título EXPLORADOR). Escribe mi-sitio y presiona Enter. La carpeta aparecerá en el árbol de archivos.",
      optionalHint: "Crea la carpeta mi-sitio",
      title: "Crea una carpeta",
    },
    finish: {
      description:
        "¡Excelente trabajo! Aprendiste a crear carpetas y archivos en VS Code y a abrir la terminal integrada. Tu proyecto mi-sitio con index.html está listo para editar.",
      title: "¡Tutorial completado!",
    },
    "open-file": {
      description:
        "El archivo index.html se abrió automáticamente en el editor. Puedes ver su contenido HTML en el área central. Observa la pestaña activa en la parte superior del editor. Cuando estés listo, haz clic en Siguiente.",
      title: "Revisa el editor",
    },
    "open-terminal": {
      description:
        "Haz clic en el botón Terminal resaltado en la barra de menú superior. En el submenú que aparece, selecciona Toggle Terminal. La terminal integrada se abrirá en la parte inferior del editor.",
      optionalHint: "Terminal → Toggle Terminal",
      title: "Abre la terminal",
    },
    "open-vscode": {
      description:
        "Haz clic en el botón Inicio (🏠) de la barra de tareas para abrir el menú de aplicaciones. En el siguiente paso vas a elegir Visual Studio Code.",
      optionalHint: "Haz clic en Inicio 🏠",
      title: "Abre Inicio",
    },
    "select-vscode": {
      description:
        "Ahora selecciona Visual Studio Code en el menú Inicio. El tutorial avanzará automáticamente cuando el editor esté listo.",
      optionalHint: "Selecciona Visual Studio Code",
      title: "Elige Visual Studio Code",
    },
    welcome: {
      description:
        "En este tutorial aprenderás a abrir Visual Studio Code, crear una carpeta de proyecto llamada mi-sitio, crear tu primer archivo HTML y abrir la terminal integrada.",
      title: "Tutorial de Visual Studio Code",
    },
  },
};

export default vscodeTutorialEs;

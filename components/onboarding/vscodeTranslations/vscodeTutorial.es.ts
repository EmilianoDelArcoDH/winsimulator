import { type VscodeTutorialText } from "components/onboarding/vscodeTranslations/types";

const vscodeTutorialEs: VscodeTutorialText = {
  controls: {
    back: "Atrás",
    finish: "Finalizar",
    next: "Siguiente",
    pause: "Pausar",
    progress: "{current} de {total}",
    skip: "Saltar",
  },
  panel: {
    completed:
      "Tutorial completado. Creaste un proyecto web y abriste la terminal de Visual Studio Code.",
    description:
      "Aprende a crear una carpeta, un archivo index.html y abrir la terminal integrada.",
    inProgress:
      "Tutorial en curso. Cada paso avanza cuando completas la acción indicada.",
    reset: "Reiniciar",
    resume: "Continuar desde el paso {step}",
    start: "Iniciar tutorial de VS Code",
  },
  steps: {
    "create-file": {
      description:
        "Con la carpeta mi-sitio seleccionada, abre File > New File y escribe index.html. Este paso avanzará cuando el archivo exista dentro de la carpeta.",
      optionalHint: "Crea mi-sitio/index.html",
      title: "Crea index.html",
    },
    "create-folder": {
      description:
        "Abre File > New Folder, escribe mi-sitio y confirma con Enter. Esperaremos hasta que la carpeta exista.",
      optionalHint: "Crea la carpeta mi-sitio",
      title: "Crea una carpeta",
    },
    finish: {
      description:
        "Ya creaste la carpeta mi-sitio, su index.html y abriste la terminal integrada. Puedes comenzar a editar tu sitio.",
      title: "Tutorial completado",
    },
    "open-file": {
      description:
        "index.html debe quedar abierto en el editor. Si no está abierto, selecciónalo en el Explorador.",
      optionalHint: "Abre index.html",
      title: "Abre el archivo",
    },
    "open-terminal": {
      description:
        "Abre el menú Terminal y selecciona la opción para mostrar la terminal integrada.",
      optionalHint: "Abre la terminal integrada",
      title: "Abre la terminal",
    },
    "open-vscode": {
      description:
        "Abre Inicio 🏠 y selecciona Visual Studio Code. Esperaremos hasta que el editor esté listo.",
      optionalHint: "Haz clic en Inicio 🏠 y luego en Visual Studio Code",
      title: "Abre Visual Studio Code",
    },
    welcome: {
      description:
        "En este recorrido usarás Visual Studio Code de verdad para crear la carpeta mi-sitio, agregar index.html y abrir la terminal.",
      title: "Tutorial de Visual Studio Code",
    },
  },
};

export default vscodeTutorialEs;

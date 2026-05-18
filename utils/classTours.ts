import activitiesCatalog from "utils/activitiesCatalog.json";

export type ClassTourKind = "concept" | "git" | "pages" | "publish";

export type ClassTourCommand = {
  description: string;
  value: string;
};

export type ClassTourFile = {
  content: string;
  path: string;
};

export type ClassTourDefinition = {
  classId: string;
  commands: ClassTourCommand[];
  description: string;
  files: ClassTourFile[];
  kind: ClassTourKind;
  title: string;
  workspaceRoot: string;
};

const baseFiles = (root: string): ClassTourFile[] => [
  {
    content: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Tour Winsim</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>Proyecto de practica</h1>
    <p>Este proyecto acompana la guia de la clase.</p>
    <script src="app.js"></script>
  </body>
</html>
`,
    path: `${root}/index.html`,
  },
  {
    content: `body {
  font-family: "Segoe UI", sans-serif;
  margin: 0;
  padding: 24px;
}

h1 {
  color: #2455d6;
}
`,
    path: `${root}/style.css`,
  },
  {
    content: `console.log("Tour listo");
`,
    path: `${root}/app.js`,
  },
];

const tourOverrides: Record<
  string,
  Pick<ClassTourDefinition, "commands" | "description" | "kind">
> = {
  sch_git_c01: {
    commands: [
      {
        description: "Ubicar la carpeta actual antes de trabajar.",
        value: "pwd",
      },
      {
        description: "Listar archivos para reconocer el proyecto de practica.",
        value: "ls",
      },
    ],
    description:
      "Ejemplo guiado para entender donde leer instrucciones, responder y validar actividades conceptuales.",
    kind: "concept",
  },
  sch_git_c02: {
    commands: [
      {
        description: "Revisar que cambios detecta Git.",
        value: "git status",
      },
      {
        description: "Preparar un archivo especifico para staging.",
        value: "git add index.html",
      },
      {
        description: "Crear un commit con mensaje claro.",
        value: 'git commit -m "Practica estados"',
      },
    ],
    description:
      "Ejemplo guiado de working tree, staging area y commit dentro de Visual Studio Code.",
    kind: "git",
  },
  sch_git_c03: {
    commands: [
      {
        description: "Ver el historial resumido.",
        value: "git log --oneline",
      },
      {
        description: "Comparar cambios antes de commitear.",
        value: "git diff",
      },
      {
        description: "Inspeccionar un commit puntual.",
        value: "git show <hash>",
      },
    ],
    description:
      "Ejemplo guiado para consultar historial, comparar cambios y leer commits.",
    kind: "git",
  },
  sch_git_c04: {
    commands: [
      {
        description: "Verificar remotos configurados.",
        value: "git remote -v",
      },
      {
        description: "Traer cambios antes de enviar.",
        value: "git pull",
      },
      {
        description: "Enviar el trabajo local al remoto.",
        value: "git push",
      },
    ],
    description:
      "Ejemplo guiado del flujo con remoto: remote, pull y push.",
    kind: "git",
  },
  sch_pages_c01: {
    commands: [
      {
        description: "Publicar el proyecto desde la terminal.",
        value: "pages publish mi-sitio",
      },
      {
        description: "Revisar el estado antes de guardar cambios.",
        value: "git status",
      },
    ],
    description:
      "Ejemplo guiado para publicar un sitio con Pages y guardar la URL generada.",
    kind: "pages",
  },
  sch_pages_c02: {
    commands: [
      {
        description: "Preparar cambios revisados.",
        value: "git add .",
      },
      {
        description: "Guardar el cambio con un mensaje descriptivo.",
        value: 'git commit -m "Actualiza sitio publicado"',
      },
      {
        description: "Actualizar la version publicada.",
        value: "git push",
      },
    ],
    description:
      "Ejemplo guiado para modificar un sitio publicado y republicarlo correctamente.",
    kind: "pages",
  },
  sch_publish_c01: {
    commands: [
      {
        description: "Confirmar los archivos del sitio.",
        value: "ls",
      },
      {
        description: "Publicar una version de practica.",
        value: "pages publish portfolio-demo",
      },
    ],
    description:
      "Ejemplo guiado para crear, revisar y preparar un sitio antes de publicarlo.",
    kind: "publish",
  },
};

const classes = activitiesCatalog.classes as {
  classId: string;
  title: string;
}[];

export const classTours: Record<string, ClassTourDefinition> = Object.fromEntries(
  classes.map(({ classId, title }) => {
    const workspaceRoot = `/Users/Public/Tours/${classId}`;
    const override = tourOverrides[classId] || {
      commands: [{ description: "Ver comandos disponibles.", value: "help" }],
      description:
        "Ejemplo guiado para reconocer el entorno y completar actividades de la clase.",
      kind: "concept" as ClassTourKind,
    };

    return [
      classId,
      {
        classId,
        commands: override.commands,
        description: override.description,
        files: baseFiles(workspaceRoot),
        kind: override.kind,
        title,
        workspaceRoot,
      },
    ];
  })
);

export const getClassTour = (
  classId: string
): ClassTourDefinition | undefined => classTours[classId];


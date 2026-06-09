# Validacion Git de actividades

## Dos capas complementarias

`command telemetry` conserva cada comando ejecutado, su directorio y fecha. Las
reglas de secuencia, expresiones regulares y cantidad de comandos siguen usando
esta informacion.

`VirtualGitRepository` modela el resultado de los comandos Git: inicializacion,
archivos, staging, commits, ramas y remotos. Sus operaciones son puras y no
modifican el filesystem real.

`activityRuntime.ts` persiste ambas capas en el mismo registro de localStorage:

- `inferredRepo`: estado historico, mantenido para compatibilidad.
- `virtualRepo`: estado Git estricto usado preferentemente por `REPO_STATE`.

La ausencia de `virtualRepo` en telemetria antigua es valida. En ese caso, las
reglas siguen leyendo `inferredRepo`.

## Archivos y snapshots

El repositorio virtual se hidrata con `data.workspace.files` del catalogo y
superpone los eventos `fileSaved`. Esto permite validar que `git add` apunte a
archivos reales y que cada commit guarde el contenido preparado.

`git add .` incluye solamente archivos modificados o no trackeados. Un commit
sin staging y operaciones sobre repositorios, ramas o remotos inexistentes
registran un error y no alteran el estado exitoso.

## Agregar reglas

No hace falta cambiar el formato de `activitiesCatalog.json`. Las reglas
existentes continúan funcionando:

```json
{
  "type": "REPO_STATE",
  "target": "repo",
  "rules": {
    "initialized": true,
    "stagedIncludes": ["index.html"],
    "stagedExcludes": ["notes.tmp"],
    "hasAtLeastCommits": 1,
    "currentBranch": "main",
    "remotesIncludes": ["origin"]
  }
}
```

También se admite `commitsCount` para una cantidad exacta. Para validar que el
alumno escribió o ejecutó algo concreto, se deben conservar las reglas de
telemetría (`TERMINAL_COMMAND_EXECUTED`, `TERMINAL_REGEX`, `TERMINAL_ORDER`,
etc.). Para validar el efecto del comando, se debe usar `REPO_STATE`.

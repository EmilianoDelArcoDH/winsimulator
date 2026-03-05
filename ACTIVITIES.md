# Activities (Git)

Este documento describe las actividades implementadas desde `utils/activitiesCatalog.json`, con URL directa y solución esperada por actividad.

## Rutas base

- App integrada (canónica): `/?app=Activities&activityId={id}`
- Standalone (Next): `/activities/{id}`
- Standalone (template del catálogo): `/activities/{id}/index.html`

## Señal de completitud

Cuando una actividad cumple todos los checks de validación, se registra en consola:

- `Actividad completada: {activityId}`

## Workspace Semilla (Git)

En varias actividades prácticas de Git (`c02`, `c03`, `c04`) el sistema ahora:

- crea automáticamente carpeta(s) y archivo(s) base del ejercicio,
- y abre `Visual Studio Code` con esa carpeta como raíz.

Esto evita que el alumno tenga que empezar siempre desde cero y permite enfocarse en el objetivo de la actividad.

## Clase `sch_git_c01` — Control de versiones y trabajo colaborativo

### `sch_git_c01_a01` — Versiones vs copias
- Modo: `classify`
- URL app: `/?app=Activities&activityId=sch_git_c01_a01`
- URL standalone: `/activities/sch_git_c01_a01`
- Solución esperada:
  - Clasificar correctamente las 10 tarjetas entre `control_versiones` y `copias_caos`.
  - Completar `porqueImporta` y `cuandoSirve` (mínimo 20 chars cada una).
  - Incluir al menos 2 keywords de versión/cambio/decisión/historia por respuesta.

### `sch_git_c01_a02` — Git vs GitHub
- Modo: `classify`
- URL app: `/?app=Activities&activityId=sch_git_c01_a02`
- URL standalone: `/activities/sch_git_c01_a02`
- Solución esperada:
  - Clasificar correctamente tarjetas entre `git` y `github` (con umbral mínimo de aciertos).
  - Responder explicación de mínimo 30 chars.
  - Mencionar que Git es local y GitHub es plataforma remota/web.

### `sch_git_c01_a03` — Ordenar la historia de cambios
- Modo: `order`
- URL app: `/?app=Activities&activityId=sch_git_c01_a03`
- URL standalone: `/activities/sch_git_c01_a03`
- Solución esperada:
  - Ordenar los eventos exactamente como define la secuencia correcta del ejercicio.
  - Escribir justificación de al menos 15 caracteres.

### `sch_git_c01_a04` — Conflicto no es “error”
- Modo: `decision`
- URL app: `/?app=Activities&activityId=sch_git_c01_a04`
- URL standalone: `/activities/sch_git_c01_a04`
- Solución esperada:
  - Indicar que hay conflicto (`hayConflicto=true`).
  - Seleccionar una resolución válida.
  - Explicar decisión con mínimo 20 chars incluyendo términos de conflicto/resolución.

## Clase `sch_git_c02` — Crear y guardar cambios

### `sch_git_c02_a00` — Configuración inicial de Git
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a00`
- URL standalone: `/activities/sch_git_c02_a00`
- Solución esperada:
  - Ejecutar `git config --global user.name "Tu Nombre"`.
  - Ejecutar `git config --global user.email "tu@email.com"`.
  - Realizar esta configuración antes de `git init`.

### `sch_git_c02_a01` — Inicializar repo
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a01`
- URL standalone: `/activities/sch_git_c02_a01`
- Solución esperada:
  - Abrir GitBash y crear la carpeta `repo`.
  - Entrar a `/repo` y trabajar ahí.
  - Crear archivos base del proyecto web: `index.html`, `style.css`, `app.js`.
  - Ejecutar `git init`.
  - Quedar con repositorio detectado como inicializado en `/repo`.

### `sch_git_c02_a02` — 3 estados: working / staging / commit
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a02`
- URL standalone: `/activities/sch_git_c02_a02`
- Solución esperada:
  - Trabajar sobre archivos web del repo (`index.html`, `style.css`, `app.js`).
  - Ejecutar `git status` al menos 2 veces.
  - Ejecutar `git add index.html`.
  - No incluir `style.css` en staging ni en el commit final.

### `sch_git_c02_a03` — Mensaje de commit profesional
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a03`
- URL standalone: `/activities/sch_git_c02_a03`
- Solución esperada:
  - Hacerlo en contexto de proyecto web (`html/css/js`) dentro de `/repo`.
  - Ejecutar `git commit -m "..."`.
  - Mensaje con mínimo 15 caracteres.
  - Empezar con verbo sugerido (`Agrega`, `Corrige`, `Elimina`, `Actualiza`, `Mejora`, `Refactoriza`) y evitar mensajes genéricos (`fix`, `update`, etc.).

### `sch_git_c02_a04` — Evitar el git add . ciego
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a04`
- URL standalone: `/activities/sch_git_c02_a04`
- Solución esperada:
  - Trabajar con `index.html`, `style.css` y `app.js`.
  - Hacer commit sin `notes.tmp`.
  - Ejecutar `git status` antes de `git commit`.
  - Evitar `git add .` ciego (si se usa, la validación muestra warning).

## Clase `sch_git_c03` — Revisar historial y versiones

### `sch_git_c03_a01` — Leer el historial (git log)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a01`
- URL standalone: `/activities/sch_git_c03_a01`
- Solución esperada:
  - Ejecutar `git log`.
  - Completar `author` y `message` exactamente iguales al último commit del repo.

### `sch_git_c03_a02` — Vista resumida (git log --oneline)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a02`
- URL standalone: `/activities/sch_git_c03_a02`
- Solución esperada:
  - Ejecutar `git log --oneline`.
  - Completar `commit1` y `commit2` con formato válido `<hash> <mensaje>` (hash hexadecimal de 7+ caracteres).

### `sch_git_c03_a03` — git diff antes del commit
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a03`
- URL standalone: `/activities/sch_git_c03_a03`
- Solución esperada:
  - Ejecutar `git diff`.
  - Asegurar `git diff` antes de `git commit`.
  - Copiar en `linea` un contenido que incluya la línea esperada del diff del ejercicio.

### `sch_git_c03_a04` — Debugging histórico (git show)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a04`
- URL standalone: `/activities/sch_git_c03_a04`
- Solución esperada:
  - Ejecutar `git log --oneline` y luego `git show <hash>`.
  - Completar `hash` con el commit culpable correcto.
  - Completar `queCambio` con explicación mínima de 30 caracteres.

## Clase `sch_git_c04` — Repositorios remotos y trabajo compartido

### `sch_git_c04_a01` — Configurar origin
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a01`
- URL standalone: `/activities/sch_git_c04_a01`
- Solución esperada:
  - Ejecutar `git remote add origin <URL>`.
  - Ejecutar `git remote -v`.
  - Ver `origin` registrado en el estado del repo.

### `sch_git_c04_a02` — Primer push con upstream
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a02`
- URL standalone: `/activities/sch_git_c04_a02`
- Solución esperada:
  - Ejecutar `git push -u origin main` (o `git push --set-upstream origin main`).
  - Dejar tracking configurado para `main` con `origin`.
  - Realizar luego un `git push` simple.

### `sch_git_c04_a03` — Pull antes de push
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a03`
- URL standalone: `/activities/sch_git_c04_a03`
- Solución esperada:
  - Ejecutar `git pull`.
  - Hacer `pull` antes de `push`.
  - Dejar repositorio sincronizado con remoto.

### `sch_git_c04_a04` — Flujo completo con remoto
- Modo: `terminal+rubric`
- URL app: `/?app=Activities&activityId=sch_git_c04_a04`
- URL standalone: `/activities/sch_git_c04_a04`
- Solución esperada:
  - Cumplir el flujo `pull -> status -> add -> commit -> push` (en ese orden lógico).
  - Registrar al menos un commit.
  - Usar mensaje de commit de mínimo 12 caracteres.
  - Terminar con remoto actualizado/sincronizado.

### `sch_git_c04_a05` — Lab: solo clone
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a05`
- URL standalone: `/activities/sch_git_c04_a05`
- Solución esperada:
  - Ejecutar `git clone https://github.com/winsim-labs/css-pull-lab.git`.
  - Ingresar al repo con `cd css-pull-lab`.
  - Verificar presencia de archivos del proyecto (`index.html`, `styles.css`).

### `sch_git_c04_a06` — Lab: solo pull
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a06`
- URL standalone: `/activities/sch_git_c04_a06`
- Solución esperada:
  - Estar dentro del repo `css-pull-lab`.
  - Ejecutar `git pull` (sin `origin main`).
  - Confirmar que el repo quedó sincronizado.

### `sch_git_c04_a07` — Lab: clone + pull
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a07`
- URL standalone: `/activities/sch_git_c04_a07`
- Solución esperada:
  - Ejecutar `git clone https://github.com/winsim-labs/css-pull-lab.git`.
  - Entrar con `cd css-pull-lab`.
  - Ejecutar `git pull` (sin `origin main`).
  - Verificar con `cat styles.css` que cambió tras el pull.

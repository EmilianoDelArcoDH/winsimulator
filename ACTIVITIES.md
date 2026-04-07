# Activities (Git y Publicacion)

Este documento resume las actividades implementadas desde `utils/activitiesCatalog.json`, con URL directa y solucion esperada por actividad.

## Rutas base

- App integrada: `/?app=Activities&activityId={id}`
- Standalone (Next): `/activities/{id}`
- Standalone (template del catalogo): `/activities/{id}/index.html`

## Senal de completitud

Cuando una actividad cumple todos los checks de validacion, se registra en consola:

- `Actividad completada: {activityId}`

## Workspace semilla

En varias actividades practicas el sistema:

- crea automaticamente carpetas y archivos base del ejercicio
- abre `Visual Studio Code` con esa carpeta como raiz
- y, en algunas actividades de publicacion, deja solo un archivo editable y mantiene el resto en solo lectura

## Pages simulado

El simulador ahora incluye una primera version de `Pages` para practicar publicacion:

- comando disponible en la terminal de Monaco: `pages publish [nombre-del-proyecto]`
- genera una URL publica simulada con formato `https://estudiante.pages.dev/mi-proyecto`
- abre automaticamente esa URL en el navegador interno
- el navegador renderiza un snapshot publicado del proyecto, incluyendo HTML, CSS, JS e imagenes locales
- tambien permite navegar links internos basicos dentro de la version publicada

## Clase `sch_git_c01` - Control de versiones y trabajo colaborativo

### `sch_git_c01_a01` - Versiones vs copias
- Modo: `classify`
- URL app: `/?app=Activities&activityId=sch_git_c01_a01`
- URL standalone: `/activities/sch_git_c01_a01`
- Solucion esperada:
  - Clasificar correctamente las tarjetas entre control de versiones y caos por copias.
  - Completar las justificaciones minimas pedidas.

### `sch_git_c01_a02` - Git vs GitHub
- Modo: `classify`
- URL app: `/?app=Activities&activityId=sch_git_c01_a02`
- URL standalone: `/activities/sch_git_c01_a02`
- Solucion esperada:
  - Distinguir Git como herramienta local y GitHub como plataforma remota/web.

### `sch_git_c01_a03` - Ordenar la historia de cambios
- Modo: `order`
- URL app: `/?app=Activities&activityId=sch_git_c01_a03`
- URL standalone: `/activities/sch_git_c01_a03`
- Solucion esperada:
  - Ordenar correctamente la secuencia del ejercicio.

### `sch_git_c01_a04` - Conflicto no es error
- Modo: `decision`
- URL app: `/?app=Activities&activityId=sch_git_c01_a04`
- URL standalone: `/activities/sch_git_c01_a04`
- Solucion esperada:
  - Detectar el conflicto y justificar una resolucion valida.

## Clase `sch_git_c02` - Crear y guardar cambios

### `sch_git_c02_a00` - Configuracion inicial de Git
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a00`
- URL standalone: `/activities/sch_git_c02_a00`
- Solucion esperada:
  - Ejecutar `git config --global user.name "..."`
  - Ejecutar `git config --global user.email "..."`

### `sch_git_c02_a01` - Inicializar repo
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a01`
- URL standalone: `/activities/sch_git_c02_a01`
- Solucion esperada:
  - Crear el proyecto base y ejecutar `git init`.

### `sch_git_c02_a02` - 3 estados: working / staging / commit
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a02`
- URL standalone: `/activities/sch_git_c02_a02`
- Solucion esperada:
  - Usar `git status`, preparar solo lo indicado y evitar agregar archivos no pedidos.

### `sch_git_c02_a03` - Mensaje de commit profesional
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a03`
- URL standalone: `/activities/sch_git_c02_a03`
- Solucion esperada:
  - Ejecutar `git commit -m "..."` con un mensaje claro y suficientemente descriptivo.

### `sch_git_c02_a04` - Evitar el git add . ciego
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a04`
- URL standalone: `/activities/sch_git_c02_a04`
- Solucion esperada:
  - Revisar el estado antes de commitear y evitar sumar basura al repo.

## Clase `sch_git_c03` - Revisar historial y versiones

### `sch_git_c03_a01` - Leer el historial (git log)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a01`
- URL standalone: `/activities/sch_git_c03_a01`

### `sch_git_c03_a02` - Vista resumida (git log --oneline)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a02`
- URL standalone: `/activities/sch_git_c03_a02`

### `sch_git_c03_a03` - git diff antes del commit
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a03`
- URL standalone: `/activities/sch_git_c03_a03`

### `sch_git_c03_a04` - Debugging historico (git show)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a04`
- URL standalone: `/activities/sch_git_c03_a04`

## Clase `sch_git_c04` - Repositorios remotos y trabajo compartido

### `sch_git_c04_a01` - Configurar origin
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a01`
- URL standalone: `/activities/sch_git_c04_a01`

### `sch_git_c04_a02` - Primer push con upstream
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a02`
- URL standalone: `/activities/sch_git_c04_a02`

### `sch_git_c04_a03` - Pull antes de push
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a03`
- URL standalone: `/activities/sch_git_c04_a03`

### `sch_git_c04_a04` - Flujo completo con remoto
- Modo: `terminal+rubric`
- URL app: `/?app=Activities&activityId=sch_git_c04_a04`
- URL standalone: `/activities/sch_git_c04_a04`

### `sch_git_c04_a05` - Lab: solo clone
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a05`
- URL standalone: `/activities/sch_git_c04_a05`

### `sch_git_c04_a06` - Lab: solo pull
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a06`
- URL standalone: `/activities/sch_git_c04_a06`

### `sch_git_c04_a07` - Lab: clone + pull
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a07`
- URL standalone: `/activities/sch_git_c04_a07`

## Clase `sch_publish_c01` - Preparar un proyecto para publicacion

### `sch_publish_c01_a01` - Estructura clara vs desordenada
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a01`
- URL standalone: `/activities/sch_publish_c01_a01`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a01`.
  - Solo queda editable `/Users/Public/Desktop/publish-c01-a01/propuesta-estructura.txt`.
  - La validacion exige proponer `index.html` en raiz, `css/estilos.css`, `js/script.js` e `img/...`.

### `sch_publish_c01_a02` - Limpiar antes de publicar
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a02`
- URL standalone: `/activities/sch_publish_c01_a02`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a02`.
  - Solo queda editable `/Users/Public/Desktop/publish-c01-a02/plan-limpieza.txt`.
  - La validacion exige conservar `index.html`.
  - La validacion exige eliminar `notas.txt`, `prueba-layout-viejo.html` y `copia_final_ahora_si.png`.
  - La justificacion debe explicar que solo debe quedar lo que el proyecto necesita para funcionar o mostrarse.

### `sch_publish_c01_a03` - Rutas absolutas vs relativas
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a03`
- URL standalone: `/activities/sch_publish_c01_a03`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a03`.
  - Esta actividad sigue siendo practica real: se edita `index.html`.
  - La validacion acepta `css/estilos.css`, `img/logo.png`, `js/app.js` y tambien variantes relativas validas como `./css/estilos.css`, `./img/logo.png` y `./js/app.js`.
  - La validacion rechaza rutas que dependan de `C:/`, `D:/`, `E:/` o `/Users/`.

### `sch_publish_c01_a04` - Nombres de archivo seguros para publicar
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a04`
- URL standalone: `/activities/sch_publish_c01_a04`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a04`.
  - Solo queda editable `/Users/Public/Desktop/publish-c01-a04/renombres-sugeridos.txt`.
  - La validacion exige proponer `mi-foto-final.png`, `banner-home.png` y `estilos-finales.css`.
  - El criterio aceptado incluye minusculas, guiones y evitar espacios, tildes, simbolos o caracteres especiales.

### `sch_publish_c01_a05` - Checklist antes de mostrar
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a05`
- URL standalone: `/activities/sch_publish_c01_a05`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a05`.
  - Solo queda editable `/Users/Public/Desktop/publish-c01-a05/checklist-previo.txt`.
  - La validacion acepta checklist marcado con `[x]` o `[X]`.
  - Deben quedar marcados estructura, limpieza, rutas, navegacion y claridad del sitio.

## Clase `sch_pages_c01` - Publicar un sitio con Pages

### `sch_pages_c01_a01` - Antes de publicar: comprobar que esta listo
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c01_a01`
- URL standalone: `/activities/sch_pages_c01_a01`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c01-a01`.
  - Solo queda editable `/Users/Public/Desktop/pages-c01-a01/estado-previo.txt`.
  - La validacion exige guardar el diagnostico y mencionar si el proyecto esta listo para publicar.
  - El texto debe mencionar elementos del checklist previo como `index.html`, rutas relativas, imagenes o archivos innecesarios.

### `sch_pages_c01_a02` - Guardar el proyecto en el repositorio
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c01_a02`
- URL standalone: `/activities/sch_pages_c01_a02`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c01-a02`.
  - La actividad se resuelve desde la terminal de Monaco.
  - La validacion exige `git init`, `git add .` y `git commit -m "..."`.

### `sch_pages_c01_a03` - Activar Pages y obtener la URL
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c01_a03`
- URL standalone: `/activities/sch_pages_c01_a03`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c01-a03`.
  - Solo queda editable `/Users/Public/Desktop/pages-c01-a03/url-publica.txt`.
  - La validacion exige ejecutar `pages publish ...` desde la terminal.
  - La validacion exige detectar una URL publicada real en el runtime de Pages.
  - Tambien exige guardar esa URL en `url-publica.txt`.

### `sch_pages_c01_a04` - Verificar que la URL publicada funciona
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c01_a04`
- URL standalone: `/activities/sch_pages_c01_a04`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c01-a04`.
  - Solo queda editable `/Users/Public/Desktop/pages-c01-a04/checklist-post-publicacion.txt`.
  - La validacion exige haber publicado antes con Pages.
  - El checklist debe marcar revision de URL, assets y parte de la verificacion final del sitio.

## Clase `sch_pages_c02` - Gestionar cambios y republicar

### `sch_pages_c02_a01` - Editar, guardar y dejar listo el cambio
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c02_a01`
- URL standalone: `/activities/sch_pages_c02_a01`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c02-a01`.
  - La actividad exige editar y guardar `index.html`.
  - La validacion comprueba que el `h1` pase a `Sitio actualizado`.

### `sch_pages_c02_a02` - Registrar el cambio con commit
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c02_a02`
- URL standalone: `/activities/sch_pages_c02_a02`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c02-a02`.
  - La actividad exige un cambio real en `index.html`.
  - La validacion exige `git add .` y `git commit -m "..."` con mensaje descriptivo.

### `sch_pages_c02_a03` - Push y sitio actualizado
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c02_a03`
- URL standalone: `/activities/sch_pages_c02_a03`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c02-a03`.
  - Quedan editables `index.html` y `url-republicada.txt`.
  - La actividad exige ejecutar `pages publish ciclo-pages`.
  - Despues exige completar el ciclo `git init`, `git add .`, `git commit -m "..."` y `git push`.
  - El runtime de Pages actualiza el snapshot publicado cuando detecta `git push` sobre un sitio ya publicado.

### `sch_pages_c02_a04` - Errores frecuentes despues del push
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c02_a04`
- URL standalone: `/activities/sch_pages_c02_a04`
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c02-a04`.
  - Solo queda editable `/Users/Public/Desktop/pages-c02-a04/reporte-errores.txt`.
  - La validacion exige mencionar causas reales como `push`, `git add`, `commit` o cache.
  - Tambien exige describir como verificar o recargar el sitio publicado.

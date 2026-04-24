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
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Versiones vs copias</h2>

        <p class="contexto-consigna">
            Vas a practicar la diferencia entre trabajar con control de versiones y guardar copias sueltas del mismo proyecto. Esto te ayuda a reconocer cuando un equipo puede seguir una historia clara de cambios.
        </p>

        <p class="copy-warning">
            Clasifica cada tarjeta con atencion y escribe justificaciones propias. No agregues contenido extra fuera de los campos de la actividad.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>No edites archivos del proyecto; resuelve la clasificacion en la interfaz de la actividad.</li>
            <li>Ubica cada tarjeta en la columna que corresponda: control de versiones o copias desordenadas.</li>
            <li>Completa las justificaciones minimas explicando por que esos casos representan historial, versiones o cambios.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Clasificar correctamente las tarjetas entre control de versiones y caos por copias.
  - Completar las justificaciones minimas pedidas.

### `sch_git_c01_a02` - Git vs GitHub
- Modo: `classify`
- URL app: `/?app=Activities&activityId=sch_git_c01_a02`
- URL standalone: `/activities/sch_git_c01_a02`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Git vs GitHub</h2>

        <p class="contexto-consigna">
            Vas a distinguir Git como herramienta local y GitHub como plataforma web para alojar y compartir repositorios. Esta diferencia es clave antes de trabajar con proyectos remotos.
        </p>

        <p class="copy-warning">
            Usa tus palabras en la explicacion y respeta la consigna de la interfaz. No agregues respuestas fuera de los campos pedidos.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>No edites archivos del proyecto; resuelve la clasificacion en la interfaz de la actividad.</li>
            <li>Clasifica cada afirmacion segun corresponda a Git o a GitHub.</li>
            <li>Escribe una explicacion breve que incluya la idea de herramienta local y plataforma en la nube.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Distinguir Git como herramienta local y GitHub como plataforma remota/web.

### `sch_git_c01_a03` - Ordenar la historia de cambios
- Modo: `order`
- URL app: `/?app=Activities&activityId=sch_git_c01_a03`
- URL standalone: `/activities/sch_git_c01_a03`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Ordenar la historia de cambios</h2>

        <p class="contexto-consigna">
            Vas a reconstruir una secuencia de cambios para entender como se forma un historial de versiones. Tambien vas a pensar que cambio podria haber introducido un problema.
        </p>

        <p class="copy-warning">
            Respeta el orden logico de los cambios y justifica tu eleccion sin escribir contenido fuera de los campos de la actividad.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>No edites archivos del proyecto; resuelve el ordenamiento en la interfaz de la actividad.</li>
            <li>Ordena las tarjetas para que formen una historia coherente desde el inicio del proyecto hasta la version estable.</li>
            <li>Elige el cambio que podria haber roto algo y justifica brevemente tu decision.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Ordenar correctamente la secuencia del ejercicio.

### `sch_git_c01_a04` - Conflicto no es error
- Modo: `decision`
- URL app: `/?app=Activities&activityId=sch_git_c01_a04`
- URL standalone: `/activities/sch_git_c01_a04`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Conflicto no es error</h2>

        <p class="contexto-consigna">
            Vas a analizar un caso donde dos personas cambiaron la misma linea. La actividad sirve para reconocer un conflicto y elegir una forma razonable de resolverlo.
        </p>

        <p class="copy-warning">
            No hay una unica frase final obligatoria, pero si tienes que detectar el conflicto y justificar la resolucion elegida.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>No edites archivos del proyecto; resuelve la decision en la interfaz de la actividad.</li>
            <li>Marca que identificas un conflicto porque hay cambios sobre la misma linea.</li>
            <li>Elige una estrategia de resolucion y explica por que tiene sentido en ese caso.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Detectar el conflicto y justificar una resolucion valida.

## Clase `sch_git_c02` - Crear y guardar cambios

### `sch_git_c02_a00` - Configuracion inicial de Git
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a00`
- URL standalone: `/activities/sch_git_c02_a00`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Configuracion inicial de Git</h2>

        <p class="contexto-consigna">
            Vas a configurar tu identidad global de Git para que los commits puedan registrar autor y correo. Esta configuracion se realiza una vez antes de empezar a crear repositorios.
        </p>

        <p class="copy-warning">
            Usa GitBash y no cambies el orden de trabajo: primero configura la identidad y despues continua con repositorios.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa GitBash para configurar tu identidad global de Git.</li>
            <li>Configura el nombre global de usuario.</li>
            <li>Configura el correo global de usuario y verifica que ambos datos queden cargados.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Ejecutar `git config --global user.name "..."`
  - Ejecutar `git config --global user.email "..."`

### `sch_git_c02_a01` - Inicializar repo
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a01`
- URL standalone: `/activities/sch_git_c02_a01`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Inicializar repo</h2>

        <p class="contexto-consigna">
            Vas a crear una carpeta de proyecto web, generar archivos base e inicializar Git en el lugar correcto. El objetivo es practicar el inicio ordenado de un repositorio.
        </p>

        <p class="copy-warning">
            Usa GitBash y ejecuta la inicializacion dentro de la carpeta del proyecto, no en otra ubicacion.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa GitBash para crear la carpeta <input class="texto-copiable" size="10" value="miProyecto" disabled> y entra en ella.</li>
            <li>Dentro de esa carpeta, crea los archivos <input class="texto-copiable" size="10" value="index.html" disabled>, <input class="texto-copiable" size="9" value="style.css" disabled> y <input class="texto-copiable" size="6" value="app.js" disabled>.</li>
            <li>Inicializa el repositorio dentro de <input class="texto-copiable" size="10" value="miProyecto" disabled> y verifica el estado si lo necesitas.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Crear el proyecto base y ejecutar `git init`.

### `sch_git_c02_a02` - 3 estados: working / staging / commit
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a02`
- URL standalone: `/activities/sch_git_c02_a02`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>3 estados: working / staging / commit</h2>

        <p class="contexto-consigna">
            Vas a observar como cambia el estado de los archivos cuando trabajas, preparas cambios y confirmas una version. La practica se centra en preparar solo el archivo indicado.
        </p>

        <p class="copy-warning">
            No uses agregados generales si la consigna pide seleccionar un archivo especifico. Revisa el estado antes y despues de preparar cambios.
        </p>

        <h3>En tu HTML:</h3>
        <ul>
            <li>Trabaja dentro de <input class="texto-copiable" size="10" value="miProyecto" disabled>.</li>
            <li>Haz un cambio pequeno en <input class="texto-copiable" size="10" value="index.html" disabled> y otro en <input class="texto-copiable" size="9" value="style.css" disabled>.</li>
            <li>Prepara para staging solamente <input class="texto-copiable" size="10" value="index.html" disabled> y deja el cambio de CSS fuera del commit.</li>
        </ul>

        <h3>Coloca estilos en tu CSS:</h3>
        <ul>
            <li>Modifica <input class="texto-copiable" size="9" value="style.css" disabled> solo para observar su estado, pero no lo incluyas en staging ni en el commit.</li>
        </ul>

        <h3>En el archivo JS:</h3>
        <ul>
            <li>En esta actividad no es necesario agregar codigo JavaScript.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Usar `git status`, preparar solo lo indicado y evitar agregar archivos no pedidos.

### `sch_git_c02_a03` - Mensaje de commit profesional
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a03`
- URL standalone: `/activities/sch_git_c02_a03`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Mensaje de commit profesional</h2>

        <p class="contexto-consigna">
            Vas a practicar como registrar cambios con un mensaje claro y especifico. Un buen mensaje ayuda a entender que se cambio sin tener que abrir todos los archivos.
        </p>

        <p class="copy-warning">
            Usa GitBash y evita mensajes vagos. El mensaje debe ser descriptivo y tener la longitud minima esperada.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Trabaja dentro del repositorio indicado por la actividad.</li>
            <li>Prepara los cambios del proyecto antes de confirmar la version.</li>
            <li>Escribe un mensaje de commit claro, relacionado con los cambios realizados y con la longitud minima esperada.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Ejecutar `git commit -m "..."` con un mensaje claro y suficientemente descriptivo.

### `sch_git_c02_a04` - Evitar el git add . ciego
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c02_a04`
- URL standalone: `/activities/sch_git_c02_a04`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Evitar el git add . ciego</h2>

        <p class="contexto-consigna">
            Vas a practicar la seleccion cuidadosa de archivos antes de un commit. La actividad muestra por que revisar el estado evita subir archivos temporales o basura.
        </p>

        <p class="copy-warning">
            Usa GitBash y no incluyas <input class="texto-copiable" size="9" value="notes.tmp" disabled> en el commit final.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Haz cambios en los archivos web del proyecto.</li>
            <li>Revisa el estado del repositorio antes de preparar cambios.</li>
            <li>Agrega de forma explicita solo los archivos que deben entrar al commit y deja fuera <input class="texto-copiable" size="9" value="notes.tmp" disabled>.</li>
        </ul>
    </article>
</div>
- Solucion esperada:
  - Revisar el estado antes de commitear y evitar sumar basura al repo.

## Clase `sch_git_c03` - Revisar historial y versiones

### `sch_git_c03_a01` - Leer el historial (git log)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a01`
- URL standalone: `/activities/sch_git_c03_a01`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Leer el historial (git log)</h2>

        <p class="contexto-consigna">
            Vas a consultar el historial de Git para identificar quien hizo el ultimo commit y con que mensaje. Esta lectura permite reconstruir decisiones del proyecto.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad. Copia los datos del historial tal como aparecen, sin cambiar nombres ni mensajes.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Consulta el historial desde la terminal.</li>
            <li>Identifica el autor del ultimo commit.</li>
            <li>Completa el formulario con el autor y el mensaje del ultimo commit tal como aparecen.</li>
        </ul>
    </article>
</div>

### `sch_git_c03_a02` - Vista resumida (git log --oneline)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a02`
- URL standalone: `/activities/sch_git_c03_a02`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Vista resumida (git log --oneline)</h2>

        <p class="contexto-consigna">
            Vas a leer una version resumida del historial para reconocer hash corto y mensaje de commit. Este formato sirve para ubicar cambios rapidamente.
        </p>

        <p class="copy-warning">
            Copia cada linea con hash y mensaje respetando el formato que muestra la terminal.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Consulta el historial en formato resumido desde la terminal.</li>
            <li>Identifica el hash corto y el mensaje de los commits pedidos.</li>
            <li>Copia el primer y el segundo commit con el formato que muestra la terminal.</li>
        </ul>
    </article>
</div>

### `sch_git_c03_a03` - git diff antes del commit
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a03`
- URL standalone: `/activities/sch_git_c03_a03`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>git diff antes del commit</h2>

        <p class="contexto-consigna">
            Vas a revisar diferencias antes de confirmar cambios. Esto ayuda a detectar que linea cambio y evita commits hechos sin revisar.
        </p>

        <p class="copy-warning">
            Usa la comparacion antes de hacer commit y copia la linea cambiada respetando lo que muestra la terminal.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Consulta las diferencias antes de confirmar cambios.</li>
            <li>Identifica la linea que cambio segun el diff.</li>
            <li>Completa el formulario con esa linea respetando lo que muestra la terminal.</li>
        </ul>
    </article>
</div>

### `sch_git_c03_a04` - Debugging historico (git show)
- Modo: `terminal+form`
- URL app: `/?app=Activities&activityId=sch_git_c03_a04`
- URL standalone: `/activities/sch_git_c03_a04`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Debugging historico (git show)</h2>

        <p class="contexto-consigna">
            Vas a buscar en el historial que commit introdujo un cambio problematico. La practica combina una vista resumida del historial con la inspeccion de un commit especifico.
        </p>

        <p class="copy-warning">
            Pega el hash correcto y explica que cambio con tus palabras. No inventes datos que no aparezcan en el historial.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa una vista resumida para ubicar commits candidatos.</li>
            <li>Inspecciona el commit correspondiente con su hash.</li>
            <li>Completa el formulario con el hash y una explicacion breve sobre que cambio.</li>
        </ul>
    </article>
</div>

## Clase `sch_git_c04` - Repositorios remotos y trabajo compartido

### `sch_git_c04_a01` - Configurar origin
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a01`
- URL standalone: `/activities/sch_git_c04_a01`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Configurar origin</h2>

        <p class="contexto-consigna">
            Vas a conectar un repositorio local con un remoto llamado origin. Esto permite preparar el proyecto para compartirlo o publicarlo.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad. El remoto debe llamarse exactamente <input class="texto-copiable" size="6" value="origin" disabled>.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Trabaja con el repositorio desde la terminal.</li>
            <li>Agrega un remoto con el nombre exacto <input class="texto-copiable" size="6" value="origin" disabled>.</li>
            <li>Verifica que el remoto haya quedado registrado correctamente.</li>
        </ul>
    </article>
</div>

### `sch_git_c04_a02` - Primer push con upstream
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a02`
- URL standalone: `/activities/sch_git_c04_a02`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Primer push con upstream</h2>

        <p class="contexto-consigna">
            Vas a publicar por primera vez una rama local y dejar configurado su seguimiento remoto. Despues de eso, los siguientes envios pueden ser mas simples.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad y respeta la rama y el remoto esperados.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Trabaja desde la terminal.</li>
            <li>Realiza el primer push configurando upstream hacia <input class="texto-copiable" size="11" value="origin main" disabled>.</li>
            <li>Despues comprueba que puedes enviar cambios usando un push simple.</li>
        </ul>
    </article>
</div>

### `sch_git_c04_a03` - Pull antes de push
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a03`
- URL standalone: `/activities/sch_git_c04_a03`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Pull antes de push</h2>

        <p class="contexto-consigna">
            Vas a practicar la sincronizacion con cambios remotos antes de enviar los tuyos. Este flujo evita rechazos cuando el repositorio remoto esta mas actualizado.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad. Primero trae los cambios remotos y recien despues envia los tuyos.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Trabaja desde la terminal.</li>
            <li>Sincroniza el repositorio local con los cambios remotos antes de enviar los tuyos.</li>
            <li>Luego envia tus cambios y verifica que el repositorio quede actualizado.</li>
        </ul>
    </article>
</div>

### `sch_git_c04_a04` - Flujo completo con remoto
- Modo: `terminal+rubric`
- URL app: `/?app=Activities&activityId=sch_git_c04_a04`
- URL standalone: `/activities/sch_git_c04_a04`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Flujo completo con remoto</h2>

        <p class="contexto-consigna">
            Vas a practicar el ciclo completo de trabajo con un repositorio remoto: traer cambios, revisar estado, preparar archivos, confirmar y enviar.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad y respeta el orden del flujo. El mensaje de commit debe ser claro.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa GitBash o la terminal de la actividad.</li>
            <li>Sigue el ciclo remoto completo en orden: traer cambios, revisar estado, preparar, confirmar y enviar.</li>
            <li>Verifica que el remoto quede sincronizado despues del push.</li>
        </ul>
    </article>
</div>

### `sch_git_c04_a05` - Lab: solo clone
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a05`
- URL standalone: `/activities/sch_git_c04_a05`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Lab: solo clone</h2>

        <p class="contexto-consigna">
            Vas a clonar un repositorio remoto simulado y entrar al proyecto descargado. Esto te permite practicar como obtener una copia local desde una URL.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad y respeta la URL del laboratorio.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa GitBash o la terminal de la actividad.</li>
            <li>Clona el laboratorio remoto indicado por la actividad.</li>
            <li>Entra en la carpeta clonada y verifica que exista el archivo CSS del proyecto.</li>
        </ul>
    </article>
</div>

### `sch_git_c04_a06` - Lab: solo pull
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a06`
- URL standalone: `/activities/sch_git_c04_a06`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Lab: solo pull</h2>

        <p class="contexto-consigna">
            Vas a traer cambios remotos dentro de un repositorio ya clonado. El objetivo es practicar una actualizacion simple del proyecto local.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad y ejecuta la actualizacion dentro del repositorio correcto.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa GitBash o la terminal de la actividad.</li>
            <li>Entra al proyecto <input class="texto-copiable" size="12" value="css-pull-lab" disabled>.</li>
            <li>Trae los cambios remotos y revisa el contenido actualizado del CSS.</li>
        </ul>
    </article>
</div>

### `sch_git_c04_a07` - Lab: clone + pull
- Modo: `terminal`
- URL app: `/?app=Activities&activityId=sch_git_c04_a07`
- URL standalone: `/activities/sch_git_c04_a07`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Lab: clone + pull</h2>

        <p class="contexto-consigna">
            Vas a completar un flujo breve de clonado y actualizacion remota. La actividad une obtener el proyecto y luego traer cambios nuevos.
        </p>

        <p class="copy-warning">
            Usa GitBash o la terminal de la actividad y respeta el orden: clonar, entrar al proyecto y actualizar.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa GitBash o la terminal de la actividad.</li>
            <li>Clona el repositorio del laboratorio y entra en la carpeta creada.</li>
            <li>Trae las actualizaciones remotas y verifica el archivo CSS.</li>
        </ul>
    </article>
</div>

## Clase `sch_publish_c01` - Preparar un proyecto para publicacion

### `sch_publish_c01_a01` - Estructura clara vs desordenada
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a01`
- URL standalone: `/activities/sch_publish_c01_a01`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Estructura clara vs desordenada</h2>

        <p class="contexto-consigna">
            Vas a revisar un proyecto con archivos mezclados y proponer una estructura clara para publicarlo. Ordenar carpetas ayuda a que el sitio sea mantenible y facil de revisar.
        </p>

        <p class="copy-warning">
            No modifiques la estructura tecnica del simulador. Edita solo el archivo de propuesta y respeta el orden y la anidacion de carpetas esperados.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Abre el proyecto semilla que se carga automaticamente en Monaco.</li>
            <li>Revisa la estructura desordenada de la carpeta raiz.</li>
            <li>Edita y guarda <input class="texto-copiable" size="22" value="propuesta-estructura.txt" disabled> proponiendo <input class="texto-copiable" size="10" value="index.html" disabled> en raiz y carpetas separadas para CSS, JS e imagenes.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a01`.
  - Solo queda editable `/Users/Public/Desktop/publish-c01-a01/propuesta-estructura.txt`.
  - La validacion exige proponer `index.html` en raiz, `css/estilos.css`, `js/script.js` e `img/...`.

### `sch_publish_c01_a02` - Limpiar antes de publicar
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a02`
- URL standalone: `/activities/sch_publish_c01_a02`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Limpiar antes de publicar</h2>

        <p class="contexto-consigna">
            Vas a identificar que archivos son necesarios para mostrar un sitio y cuales sobran antes de publicarlo. Esta revision evita subir pruebas, copias o material innecesario.
        </p>

        <p class="copy-warning">
            Edita solo el plan de limpieza. Conserva el sitio base y no agregues contenido extra fuera del archivo pedido.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Abre el proyecto semilla en Monaco y revisa los archivos de la raiz.</li>
            <li>Edita y guarda <input class="texto-copiable" size="17" value="plan-limpieza.txt" disabled>.</li>
            <li>Indica que conservarias, que eliminarias y justifica que solo debe quedar lo necesario para que el proyecto funcione o se muestre.</li>
        </ul>
    </article>
</div>
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
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Rutas absolutas vs relativas</h2>

        <p class="contexto-consigna">
            Vas a corregir rutas que dependen de una computadora especifica y reemplazarlas por rutas relativas del proyecto. Esto permite que el sitio funcione al publicarse.
        </p>

        <p class="copy-warning">
            Corrige el codigo existente, no crees todo desde cero. Evita rutas que dependan de discos locales o carpetas de usuario.
        </p>

        <h3>En tu HTML:</h3>
        <ul>
            <li>Abre <input class="texto-copiable" size="10" value="index.html" disabled> en Monaco.</li>
            <li>Corrige las rutas del HTML para que apunten a archivos dentro del proyecto.</li>
            <li>Guarda el archivo cuando las referencias a CSS, imagenes y JS usen rutas relativas validas.</li>
        </ul>

        <h3>Coloca estilos en tu CSS:</h3>
        <ul>
            <li>No es necesario agregar estilos; solo verifica que la ruta al CSS quede correctamente enlazada desde el HTML.</li>
        </ul>

        <h3>En el archivo JS:</h3>
        <ul>
            <li>No es necesario agregar codigo JavaScript; solo verifica que la ruta al archivo JS quede correctamente enlazada desde el HTML.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a03`.
  - Esta actividad sigue siendo practica real: se edita `index.html`.
  - La validacion acepta `css/estilos.css`, `img/logo.png`, `js/app.js` y tambien variantes relativas validas como `./css/estilos.css`, `./img/logo.png` y `./js/app.js`.
  - La validacion rechaza rutas que dependan de `C:/`, `D:/`, `E:/` o `/Users/`.

### `sch_publish_c01_a04` - Nombres de archivo seguros para publicar
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a04`
- URL standalone: `/activities/sch_publish_c01_a04`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Nombres de archivo seguros para publicar</h2>

        <p class="contexto-consigna">
            Vas a detectar nombres de archivo poco seguros y proponer alternativas aptas para publicar. Usar nombres simples reduce errores de rutas y compatibilidad.
        </p>

        <p class="copy-warning">
            Edita solo el archivo de renombres sugeridos. Las propuestas deben respetar minusculas, guiones y evitar espacios, tildes, simbolos o caracteres especiales.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Abre la carpeta del ejercicio en Monaco y revisa los nombres de archivo.</li>
            <li>Edita y guarda <input class="texto-copiable" size="23" value="renombres-sugeridos.txt" disabled>.</li>
            <li>Propone nombres seguros para la imagen final, el banner de inicio y el archivo de estilos.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/publish-c01-a04`.
  - Solo queda editable `/Users/Public/Desktop/publish-c01-a04/renombres-sugeridos.txt`.
  - La validacion exige proponer `mi-foto-final.png`, `banner-home.png` y `estilos-finales.css`.
  - El criterio aceptado incluye minusculas, guiones y evitar espacios, tildes, simbolos o caracteres especiales.

### `sch_publish_c01_a05` - Checklist antes de mostrar
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_publish_c01_a05`
- URL standalone: `/activities/sch_publish_c01_a05`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Checklist antes de mostrar</h2>

        <p class="contexto-consigna">
            Vas a completar una revision previa a la publicacion de un sitio. El checklist ayuda a confirmar estructura, limpieza, rutas, navegacion y claridad antes de mostrar el proyecto.
        </p>

        <p class="copy-warning">
            Edita solo el checklist y marca los puntos revisados con el formato esperado. No agregues contenido extra que cambie la estructura del archivo.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Explora el proyecto en Monaco.</li>
            <li>Edita y guarda <input class="texto-copiable" size="19" value="checklist-previo.txt" disabled>.</li>
            <li>Marca los puntos de estructura, limpieza, rutas, navegacion y claridad del sitio usando casillas con [x] o [X].</li>
        </ul>
    </article>
</div>
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
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Antes de publicar: comprobar que esta listo</h2>

        <p class="contexto-consigna">
            Vas a revisar un proyecto antes de activar Pages y dejar un diagnostico escrito. Esta practica ayuda a decidir si un sitio esta listo para publicarse.
        </p>

        <p class="copy-warning">
            No modifiques los archivos del sitio. Edita solo el diagnostico y menciona elementos concretos del checklist previo.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Explora el proyecto en Monaco sin cambiar sus archivos base.</li>
            <li>Edita y guarda <input class="texto-copiable" size="17" value="estado-previo.txt" disabled>.</li>
            <li>Indica si el proyecto esta listo para publicarse y menciona aspectos como index.html, rutas relativas, imagenes o archivos innecesarios.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c01-a01`.
  - Solo queda editable `/Users/Public/Desktop/pages-c01-a01/estado-previo.txt`.
  - La validacion exige guardar el diagnostico y mencionar si el proyecto esta listo para publicar.
  - El texto debe mencionar elementos del checklist previo como `index.html`, rutas relativas, imagenes o archivos innecesarios.

### `sch_pages_c01_a02` - Guardar el proyecto en el repositorio
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c01_a02`
- URL standalone: `/activities/sch_pages_c01_a02`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Guardar el proyecto en el repositorio</h2>

        <p class="contexto-consigna">
            Vas a registrar el proyecto en un repositorio local antes de publicarlo. Guardar una version con Git permite tener un punto claro de partida.
        </p>

        <p class="copy-warning">
            Usa la terminal de Monaco o GitBash y ejecuta los pasos dentro de la carpeta del proyecto.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa la terminal de Monaco o GitBash dentro de la carpeta del proyecto.</li>
            <li>Inicializa el repositorio local.</li>
            <li>Prepara los archivos y registra un commit con un mensaje relacionado con preparar el proyecto para publicar.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c01-a02`.
  - La actividad se resuelve desde la terminal de Monaco.
  - La validacion exige `git init`, `git add .` y `git commit -m "..."`.

### `sch_pages_c01_a03` - Activar Pages y obtener la URL
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c01_a03`
- URL standalone: `/activities/sch_pages_c01_a03`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Activar Pages y obtener la URL</h2>

        <p class="contexto-consigna">
            Vas a publicar el sitio con Pages simulado y guardar la URL publica generada. Esta URL representa el enlace que podrias compartir para mostrar el proyecto.
        </p>

        <p class="copy-warning">
            Usa la terminal de Monaco o GitBash. Guarda la URL generada exactamente en el archivo pedido.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Usa la terminal de Monaco o GitBash.</li>
            <li>Ejecuta la publicacion con Pages para el nombre de proyecto indicado.</li>
            <li>Copia la URL publica generada y guarda la URL en <input class="texto-copiable" size="14" value="url-publica.txt" disabled>.</li>
        </ul>
    </article>
</div>
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
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Verificar que la URL publicada funciona</h2>

        <p class="contexto-consigna">
            Vas a revisar el sitio despues de publicarlo para comprobar que la URL, los recursos y la navegacion funcionan. Publicar no termina hasta verificar el resultado.
        </p>

        <p class="copy-warning">
            Publica primero con Pages y edita solo el checklist post-publicacion.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Publica primero el proyecto con Pages desde la terminal.</li>
            <li>Abre la URL generada en el navegador interno.</li>
            <li>Edita y guarda <input class="texto-copiable" size="31" value="checklist-post-publicacion.txt" disabled> marcando con [x] los puntos revisados.</li>
        </ul>
    </article>
</div>
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
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Editar, guardar y dejar listo el cambio</h2>

        <p class="contexto-consigna">
            Vas a hacer un cambio local en un sitio ya publicado y guardarlo antes de seguir con commit y push. Esta practica separa editar de publicar.
        </p>

        <p class="copy-warning">
            Corrige el codigo existente, no crees un archivo nuevo. El texto esperado debe respetarse sin diferencias.
        </p>

        <h3>En tu HTML:</h3>
        <ul>
            <li>Abre <input class="texto-copiable" size="10" value="index.html" disabled> en Monaco.</li>
            <li>Cambia el titulo principal para que diga exactamente <input class="texto-copiable" size="17" value="Sitio actualizado" disabled>.</li>
            <li>Guarda el archivo para dejar listo el cambio local.</li>
        </ul>

        <h3>Coloca estilos en tu CSS:</h3>
        <ul>
            <li>No es necesario agregar estilos.</li>
        </ul>

        <h3>En el archivo JS:</h3>
        <ul>
            <li>En esta actividad no es necesario agregar codigo JavaScript.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c02-a01`.
  - La actividad exige editar y guardar `index.html`.
  - La validacion comprueba que el `h1` pase a `Sitio actualizado`.

### `sch_pages_c02_a02` - Registrar el cambio con commit
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c02_a02`
- URL standalone: `/activities/sch_pages_c02_a02`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Registrar el cambio con commit</h2>

        <p class="contexto-consigna">
            Vas a modificar el contenido del sitio y registrar ese cambio con Git. El objetivo es practicar add y commit con un mensaje descriptivo.
        </p>

        <p class="copy-warning">
            Agrega el texto exacto dentro del body y no borres el codigo base del HTML.
        </p>

        <h3>En tu HTML:</h3>
        <ul>
            <li>Abre el proyecto en Monaco.</li>
            <li>En <input class="texto-copiable" size="10" value="index.html" disabled>, agrega dentro del body el texto exacto <input class="texto-copiable" size="29" value="Cambios listos para publicar" disabled>.</li>
            <li>Guarda el archivo y registra el cambio con Git desde la terminal.</li>
        </ul>

        <h3>Coloca estilos en tu CSS:</h3>
        <ul>
            <li>No es necesario agregar estilos.</li>
        </ul>

        <h3>En el archivo JS:</h3>
        <ul>
            <li>En esta actividad no es necesario agregar codigo JavaScript.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c02-a02`.
  - La actividad exige un cambio real en `index.html`.
  - La validacion exige `git add .` y `git commit -m "..."` con mensaje descriptivo.

### `sch_pages_c02_a03` - Push y sitio actualizado
- Modo: `workspace`
- URL app: `/?app=Activities&activityId=sch_pages_c02_a03`
- URL standalone: `/activities/sch_pages_c02_a03`
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Push y sitio actualizado</h2>

        <p class="contexto-consigna">
            Vas a completar el ciclo de editar, confirmar, enviar y verificar que Pages refleje el nuevo estado del sitio. Es una practica completa de republicacion.
        </p>

        <p class="copy-warning">
            Respeta el texto exacto del h1 y guarda la URL republicada en el archivo indicado.
        </p>

        <h3>En tu HTML:</h3>
        <ul>
            <li>Abre <input class="texto-copiable" size="10" value="index.html" disabled> en Monaco y cambia el h1 para que diga exactamente <input class="texto-copiable" size="16" value="Sitio republicado" disabled>.</li>
            <li>Publica el sitio inicial con Pages usando el nombre de proyecto indicado por la actividad.</li>
            <li>Completa el ciclo de Git, verifica la URL publicada y guarda la URL en <input class="texto-copiable" size="18" value="url-republicada.txt" disabled>.</li>
        </ul>

        <h3>Coloca estilos en tu CSS:</h3>
        <ul>
            <li>No es necesario agregar estilos.</li>
        </ul>

        <h3>En el archivo JS:</h3>
        <ul>
            <li>En esta actividad no es necesario agregar codigo JavaScript.</li>
        </ul>
    </article>
</div>
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
- Consigna:

<div>
    <style>
        #consigna-schools p,
        #consigna-schools li {
            font-size: 18px;
        }

        #consigna-schools h2 {
            font-family: SourceSansPro, sans-serif;
            font-size: 24px;
            font-weight: bold;
        }

        #consigna-schools h3 {
            font-family: SourceSansPro, sans-serif;
            font-size: 18px;
            font-weight: bold;
        }

        #consigna-schools p.copy-warning {
            font-style: italic;
            font-weight: bold;
        }

        #consigna-schools p.contexto-consigna {
            font-style: italic;
        }

        #consigna-schools .texto-copiable {
            padding: 2px;
            background-color: #E0E0E0;
            border: 1px solid #D9D9D9;
            font-size: 15px;
            color: #222;
            font-style: italic;
        }

        #consigna-schools input.texto-copiable {
            text-align: center;
        }
    </style>

    <article id="consigna-schools">
        <h2>Errores frecuentes despues del push</h2>

        <p class="contexto-consigna">
            Vas a escribir un mini reporte sobre por que un cambio puede no verse online despues de editar. La actividad ayuda a revisar pasos omitidos y formas de comprobacion.
        </p>

        <p class="copy-warning">
            No modifiques los archivos del sitio. Edita solo el reporte y menciona causas realistas sin inventar cambios.
        </p>

        <h3>Qu&eacute; hacer:</h3>
        <ul>
            <li>Explora el proyecto en Monaco sin modificar los archivos del sitio.</li>
            <li>Edita y guarda <input class="texto-copiable" size="20" value="reporte-errores.txt" disabled>.</li>
            <li>Explica posibles causas, como olvidar preparar o commitear cambios, no hacer push o tener problemas de cache, y como verificarias el sitio.</li>
        </ul>
    </article>
</div>
- Estado vigente:
  - Monaco se abre sobre `/Users/Public/Desktop/pages-c02-a04`.
  - Solo queda editable `/Users/Public/Desktop/pages-c02-a04/reporte-errores.txt`.
  - La validacion exige mencionar causas reales como `push`, `git add`, `commit` o cache.
  - Tambien exige describir como verificar o recargar el sitio publicado.

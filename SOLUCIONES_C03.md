# Soluciones C01 - Control de versiones y trabajo colaborativo

Actividades incluidas: `sch_git_c01_a01` a `sch_git_c01_a04`.

## `sch_git_c01_a01` - Versiones vs copias

### Clasificacion

Control de versiones:

- c1: Puedo ver el historial de cambios y volver a una version anterior.
- c3: Veo quien hizo cada cambio y cuando.
- c5: Puedo comparar cambios entre versiones (diff).
- c7: Trabajo en paralelo sin pisar el trabajo de otros.
- c9: Puedo crear versiones con mensajes (commits) y entender el contexto.

Copias/caos:

- c2: Me paso archivos por WhatsApp con nombres tipo final_final2.
- c4: Guardo una carpeta por dia y espero no equivocarme.
- c6: No se cual es el ultimo archivo correcto.
- c8: Si algo se rompe, no puedo volver atras con seguridad.
- c10: Cada integrante guarda su copia y despues se juntan como se pueda.

### Texto posible

```text
Con Git puedo revisar el historial de commits y recuperar una version anterior si algo falla.
Las copias final_final2 generan confusion porque nadie sabe cual archivo es el actualizado.
```

## `sch_git_c01_a02` - Git vs GitHub

### Clasificacion

Git:

- g1: Funciona en tu computadora para llevar historial.
- g3: Usa commits para registrar cambios.
- g5: Te deja volver a una version anterior en tu maquina.
- g7: Maneja ramas y merges.

GitHub:

- g2: Permite alojar repositorios en la nube.
- g4: Sirve para colaborar mediante repositorios remotos y Pull Requests.
- g6: Es una empresa/plataforma web de hosting de repos.
- g8: Se usa para compartir y revisar codigo con otras personas.

### Texto posible

```text
Git es la herramienta local que guarda el historial en mi computadora. GitHub es la plataforma web en la nube para alojar y compartir repositorios.
```

## `sch_git_c01_a03` - Ordenar la historia de cambios

Orden:

```text
1. Cree el proyecto inicial.
2. Agregue una seccion de contacto.
3. Corregi un error en el formulario.
4. Mejore estilos del boton principal.
5. Publique la primera version estable.
```

Cambio que podria haber roto algo: `t3`.

Justificacion posible:

```text
Al corregir el formulario podria fallar la validacion de un campo y dejar de enviarse correctamente.
```

## `sch_git_c01_a04` - Conflicto no es error

Marca la casilla de conflicto y elige una estrategia. Una respuesta valida:

```text
Estrategia: Combino ambas ideas en una nueva frase.
Explicacion: Combinaria ambas ideas despues de hablar con el equipo para acordar cual titulo comunica mejor lo que se quiere publicar.
```

---

# Soluciones C02 - Crear y guardar cambios

Actividades incluidas: `sch_git_c02_a00` a `sch_git_c02_a04`.

## `sch_git_c02_a00` - Configuracion inicial de Git

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

## `sch_git_c02_a01` - Crear un repositorio local

```bash
mkdir miProyecto
cd miProyecto
git init
touch index.html
git add index.html
git commit -m "Crear archivo index.html"
```

## `sch_git_c02_a02` - 3 estados: working / staging / commit

Modificar `index.html` y `style.css`. Despues ejecutar:

```bash
git status
git add index.html
git status
git commit -m "Actualiza index principal"
```

Importante: no agregar `style.css` al staging ni al commit.

## `sch_git_c02_a03` - Mensaje de commit profesional

Modificar y guardar algun archivo del proyecto. Por ejemplo `index.html`.

```bash
git status
git add index.html
git commit -m "Actualiza el titulo principal"
```

El mensaje debe ser descriptivo. Evitar mensajes genericos como `cambios`, `fix` o `update`.

## `sch_git_c02_a04` - Evitar el git add . ciego

Modificar un archivo web, pero no incluir `notes.tmp`.

```bash
git status
git add index.html
git commit -m "Actualiza contenido web"
```

Tambien puede usarse `git add style.css` o `git add app.js` si ese fue el archivo modificado. No usar `git add .`.

---

# Soluciones C03 - Revisar historial y versiones

Actividades incluidas: `sch_git_c03_a01` a `sch_git_c03_a04`.

> Nota: los hashes de commits pueden variar. Cuando una actividad pide un hash,
> copia el hash que muestra tu propia terminal.

## `sch_git_c03_a01` - Leer el historial (`git log`)

### Comandos

```bash
cd /Users/Public/Desktop/repo
git log
```

### Respuestas del formulario

Autor del ultimo commit:

```text
user
```

Mensaje del ultimo commit:

```text
Crea proyecto para revisar el historial
```

## `sch_git_c03_a02` - Vista resumida (`git log --oneline`)

La terminal ya abre en `/Users/Public/Desktop/repo`.

### Comandos

Haz dos cambios y dos commits separados. Por ejemplo:

```bash
git add index.html
git commit -m "Actualiza contenido principal"
git add style.css
git commit -m "Mejora estilos principales"
git log --oneline
```

### Respuestas del formulario

Copia exactamente las primeras dos lineas que devuelve:

```bash
git log --oneline
```

Ejemplo de formato esperado:

```text
<hash-del-commit-mas-reciente> Mejora estilos principales
<hash-del-commit-anterior> Actualiza contenido principal
```

## `sch_git_c03_a03` - Comparar un cambio con `git diff`

### Cambio en `index.html`

Cambia:

```html
<html><body><h1>Diff practice</h1></body></html>
```

por:

```html
<html><body><h1>Título actualizado</h1></body></html>
```

Guarda el archivo.

### Comando

```bash
git diff
```

### Respuesta del formulario

Copia la linea agregada que empieza con un solo `+`:

```text
+<html><body><h1>Título actualizado</h1></body></html>
```

## `sch_git_c03_a04` - Debugging historico (`git show`)

### Comandos

```bash
cd /Users/Public/Desktop/repo
git log --oneline
git show <hash-del-commit>
```

Usa el hash del commit que aparece con el mensaje:

```text
Introduce espaciado problemático en el título
```

### Respuestas del formulario

Hash del commit culpable:

```text
<hash-del-commit-que-muestra-git-log>
```

Que cambio:

```text
El commit agregó un espaciado problemático al título principal mediante la regla de CSS letter-spacing.
```

---

# Soluciones C04 - Repositorios remotos y trabajo compartido

Actividades incluidas: `sch_git_c04_a01` a `sch_git_c04_a07`.

## `sch_git_c04_a01` - Configurar origin

El repo ya esta inicializado. No hace falta `git init`, `git add` ni `git commit`.

```bash
git remote add origin https://github.com/estudiante/remote-setup.git
git remote -v
```

## `sch_git_c04_a02` - Primer push con upstream

```bash
git push -u origin main
git push
```

El primer comando configura el seguimiento entre `main` y `origin`. El segundo verifica que despues se puede usar `git push` simple.

## `sch_git_c04_a03` - Pull antes de push

```bash
git pull
git push
```

La validacion espera que `git pull` ocurra antes de `git push`.

## `sch_git_c04_a04` - Flujo completo con remoto

Modificar y guardar algun archivo. Luego:

```bash
git pull
git status
git add index.html
git commit -m "Actualiza contenido remoto"
git push
```

El mensaje del commit debe tener al menos 12 caracteres.

## `sch_git_c04_a05` - Lab: solo clone

La terminal comienza en `/git-labs`. Si necesitas verificarlo:

```bash
pwd
```

### Comandos

```bash
git clone https://github.com/winsim-labs/css-pull-lab.git
cd css-pull-lab
ls
```

### Resultado esperado

El comando `ls` debe mostrar, entre otros archivos:

```text
styles.css
```

La validacion espera que:

- primero ejecutes `git clone https://github.com/winsim-labs/css-pull-lab.git`;
- despues entres con `cd css-pull-lab`;
- dentro del repositorio ejecutes `ls`;
- el clone deje configurado el remoto `origin`.

## `sch_git_c04_a06` - Lab: solo pull

```bash
cd css-pull-lab
git pull
cat styles.css
```

## `sch_git_c04_a07` - Lab: clone + pull

```bash
git clone https://github.com/winsim-labs/css-pull-lab.git
cd css-pull-lab
git pull
cat styles.css
```

---

# Soluciones Publish C01 - Preparar un proyecto para publicacion

Actividades incluidas: `sch_publish_c01_a01` a `sch_publish_c01_a05`.

## `sch_publish_c01_a01` - Estructura clara vs desordenada

Editar y guardar `propuesta-estructura.txt` con una estructura como esta:

```text
mi-proyecto/
  index.html
  css/estilos.css
  js/script.js
  img/logo-principal.png
```

## `sch_publish_c01_a02` - Limpiar antes de publicar

Editar y guardar `plan-limpieza.txt`:

```text
Se queda:
- index.html
- css/estilos.css
- script.js
- img/banner-home.jpg

Se elimina:
- notas.txt
- prueba-layout-viejo.html
- copia_final_ahora_si.png

Justificacion:
- Solo deben publicarse los archivos que el sitio necesita para funcionar o mostrarse correctamente.
```

## `sch_publish_c01_a03` - Rutas absolutas vs relativas

En `index.html`, reemplazar las rutas absolutas por relativas:

```html
<link rel="stylesheet" href="css/estilos.css" />
<img src="img/logo.png" alt="Logo" />
<script src="js/app.js"></script>
```

No deben quedar rutas con `C:`, `D:` ni `/Users/`.

## `sch_publish_c01_a04` - Nombres de archivo seguros para publicar

Editar y guardar `renombres-sugeridos.txt`:

```text
Mi Foto Final.png -> mi-foto-final.png
banner!!home.png -> banner-home.png
Estilos Finales.css -> estilos-finales.css

Criterio:
- usar minusculas
- usar guiones
- evitar espacios, tildes o simbolos raros
```

## `sch_publish_c01_a05` - Checklist antes de mostrar

Editar y guardar `checklist-previo.txt` con todos los puntos marcados:

```text
[x] Revisar estructura
[x] Limpiar archivos innecesarios
[x] Corregir rutas
[x] Probar toda la navegacion
[x] Confirmar que el sitio se entiende solo
```

---

# Soluciones Pages C01 - Publicar un sitio con Pages

Actividades incluidas: `sch_pages_c01_a01` a `sch_pages_c01_a04`.

## `sch_pages_c01_a01` - Antes de publicar: comprobar que esta listo

Editar y guardar `estado-previo.txt`:

```text
El proyecto esta listo para publicar si index.html esta en la raiz, las rutas relativas funcionan, las imagenes cargan y no hay archivos innecesarios.
Antes de publicarlo revisaria index.html, rutas relativas, imagenes y limpieza del proyecto.
```

## `sch_pages_c01_a02` - Guardar el proyecto en el repositorio

```bash
git init
git add .
git commit -m "Preparar proyecto para publicar"
```

## `sch_pages_c01_a03` - Activar Pages y obtener la URL

```bash
pages publish mi-sitio
```

Luego guardar en `url-publica.txt`:

```text
https://estudiante.pages.dev/mi-sitio
```

## `sch_pages_c01_a04` - Verificar que la URL publicada funciona

Publicar con Pages:

```bash
pages publish mi-sitio
```

Editar y guardar `checklist-post-publicacion.txt`:

```text
[x] La URL abre sin errores
[x] Las imagenes cargan
[x] Los estilos se aplican
[x] Los links internos funcionan
```

Tambien valida si en lugar del ultimo punto se marca que se probo desde el celular.

---

# Soluciones Pages C02 - Gestionar cambios y republicar

Actividades incluidas: `sch_pages_c02_a01` a `sch_pages_c02_a04`.

## `sch_pages_c02_a01` - Editar, guardar y dejar listo el cambio

En `index.html`, cambiar el titulo principal:

```html
<h1>Sitio actualizado</h1>
```

Guardar el archivo.

## `sch_pages_c02_a02` - Registrar el cambio con commit

Agregar dentro del `body` de `index.html`:

```html
<p>Cambios listos para publicar</p>
```

Luego ejecutar:

```bash
git init
git add .
git commit -m "Actualizo contenido del sitio"
```

## `sch_pages_c02_a03` - Push y sitio actualizado

Cambiar el `h1` a:

```html
<h1>Sitio republicado</h1>
```

Despues ejecutar:

```bash
pages publish ciclo-pages
git init
git add .
git commit -m "Actualizo el titulo del sitio"
git push
```

Guardar en `url-republicada.txt`:

```text
https://estudiante.pages.dev/ciclo-pages
```

## `sch_pages_c02_a04` - Errores frecuentes despues del push

Editar y guardar `reporte-errores.txt`:

```text
Posibles causas:
- El cambio no se ve online porque falto hacer git add, commit o push.
- Tambien puede verse una version vieja por cache del navegador.

Como lo verificaria:
- Revisaria git status y el ultimo commit.
- Haria git push nuevamente si falta subir cambios.
- Recargaria fuerte con Ctrl+Shift+R para evitar cache.
```

---

# Soluciones Pages C03 - Proyecto final de publicacion

Actividades incluidas: `sch_pages_c03_a01`.

## `sch_pages_c03_a01` - Crear, publicar y actualizar una web funcional

Conservar en `index.html` los enlaces a `css/styles.css` y `js/app.js`, el boton `id="action-button"` y el mensaje `id="status-message"`.

En `css/styles.css`, mantener reglas para `.card` y `button`, incluyendo algun color:

```css
.card {
  background: white;
  padding: 40px;
}

button {
  background: #2563eb;
  color: white;
}
```

En `js/app.js`, dejar el mensaje final con `Demo actualizada`:

```js
const actionButton = document.querySelector('#action-button');
const statusMessage = document.querySelector('#status-message');

actionButton.addEventListener('click', () => {
  statusMessage.textContent = 'Demo actualizada: la interaccion funciona correctamente.';
});
```

Flujo de Git y Pages:

```bash
git init
git add .
git commit -m "Creo sitio funcional"
git remote add origin https://github.com/estudiante/demo-final.git
git push origin main
pages publish demo-final
git add .
git commit -m "Actualizo demo publicada"
git push origin main
```

Guardar en `url-demo.txt`:

```text
https://estudiante.pages.dev/demo-final
```

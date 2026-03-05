# DH console

## 🌌 **DH console** 🌌

## _Desktop environment in the browser_

## Project Overview

DH Console (WinSimulator) is a browser-based desktop environment for interactive learning.
It combines a full desktop simulation (windows, apps, file system, start menu, taskbar)
with guided educational activities focused on Git and collaborative workflows.

It is designed for:

- Classroom training and guided labs
- Hands-on Git practice without local machine setup
- Repeatable scenarios with automatic validation and feedback

# System 🧠

### Educational Activities

- Activities app with guided lessons and validation checks
- Class-based progression (`sch_git_c01` to `sch_git_c04`)
- Terminal + form + rubric activity modes
- Automatic command telemetry and activity completion tracking
- Shared validation between Git Bash and Visual Studio Code terminal

### Localization

- Multi-language user experience: **ES / EN / PT**
- Language-aware UI text handling
- Activity content localization integrated with active language

### [File System](https://github.com/jvilk/BrowserFS)

- File Explorer
  - Back, Forward, Recent locations, Up one level, Address bar, Search
  - Thumbnail & Details Views
- [Drag & Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) File Support (internal & external)
  - Loading progress dialog
- ZIP ([write support](https://www.npmjs.com/package/fflate)), [ZIP](https://github.com/jvilk/BrowserFS/blob/master/src/backends/ZipFS.ts)/[ISO](https://github.com/jvilk/BrowserFS/blob/master/src/backends/IsoFS.ts) read support, [7Z/GZ/RAR/TAR/etc. extract](https://github.com/use-strict/7z-wasm) support
- Writes to [IndexedDb](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- Group selection/manipulation & drag to sort/arrange
- Dynamic and auto cached icons for [music](https://github.com/Borewit/music-metadata-browser), images, video & emulator states
- Context Menus
  - Cut, Copy, Create shortcut, Delete, Rename
  - [Add file(s)](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications), [Map directory](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
  - Open with options/dialog, Open file/folder location, Open in new window, Open Terminal here
  - Download, Add to archive, Extract here, Set as wallpaper, Convert audio/video/photo/spreadsheets, Properties (w/Details)
  - Sort by, New Folder, New Text Document
  - Screen Capture
- Keyboard Shortcuts
  - CTRL+C, CTRL+V, CTRL+X, CTRL+A, Delete
  - F2, F5, Backspace, Arrows, Enter
  - SHIFT+CTRL+R, SHIFT+F10, SHIFT+F12
  - In Fullscreen: Windows Key, Windows Key + R
- File information tooltips
- Allow sorting by name, size, type or date
  - Persists icon position/sort order

### Windows

- [Resizable and Draggable](https://github.com/bokuweb/react-rnd)
- Minimize, Maximize & Close
- Persists size/position/maximized states
- [Animates](https://www.framer.com/motion/) opening and closing

### Start Menu

- Expandable Sidebar
  - Apps list, Documents/Pictures/Videos shortcuts, Power (clears session)
- Spotlight visual effect
- Folder support
- Keyboard shortcut opens with **_SHIFT+ESC_**
  - Or Windows Key when in fullscreen

### Taskbar

- [Peek](https://github.com/bubkoo/html-to-image) hover preview of windows
- Focused window indicator
- Search menu (w/Recent files)
- AI Chat Agent ([Prompt API](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit) & [WebLLM](https://github.com/mlc-ai/web-llm)) (w/Summarize & Image Generation)

### Clock

- Runs in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
  - Drawn in an [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- NTP server time mode ([ntp.js](http://www.ntpjs.org/))
- Synced to system clock on load
- Date tooltip
- Calendar popup

### Background & Screensaver

- Dynamic animated wallpapers ([OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)/[Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers))
  - [Waves](https://www.vantajs.com/?effect=waves)
  - [Hexells](https://znah.net/hexells/)
  - [Matrix](https://rezmason.github.io/matrix/)
  - [Coastal Landscape](https://www.shadertoy.com/view/fstyD4)
- Set via image/video (Fill, Fit, Stretch, Tile, Center)
- Picture Slideshow
- [Astronomy Picture of the Day](https://api.nasa.gov/#apod)
- [Art Institute of Chicago](https://api.artic.edu/docs/)
- [Lorem Picsum](https://picsum.photos/)
- AI Generated Wallpapers [Stable Diffusion](https://stability.ai/stable-diffusion)
- Custom screen saver file support
  - [3D FlowerBox](https://github.com/kevin-shannon/3D-FlowerBox)
  - [3D Maze](https://github.com/ibid-11962/Windows-95-3D-Maze-Screensaver)
  - [Pipes](https://github.com/1j01/pipes)

### URL

- Query parameter loading
  - Examples:
    - `/?url=/CREDITS.md`
    - `/?app=Browser`
    - `/?app=Activities&activityId=sch_git_c01_a01`
    - `/activities/sch_git_c01_a01`

# Apps 🧪

### Activities

- Guided educational app for Git and collaboration skills
- Includes scenarios, instructions, and automatic grading
- Supports seeded workspaces by activity
  - Auto-creates folders/files per exercise
  - Opens Visual Studio Code at the exercise root
  - Optional reset-on-enter flow for repeatable labs

### Git Bash

- Git-focused training terminal
- Supports realistic Git learning workflows
- Includes enhanced simulation for `git clone` and `git pull`
  - Realistic console output style
  - Real file updates for lab scenarios

### [BoxedWine](http://www.boxedwine.org/) (**_.exe, .zip_**)

- Runs 16/32-bit Windows applications

### Browser (**_.htm, .html_**)

- Loads websites (_w/CORS support_)
- Bookmark bar
- Favicon support
- Back/Forward & Reload
- Google search via Address bar
- IPFS protocol support
- [chrome://dino](https://github.com/wayou/t-rex-runner) game

### [DevTools](https://eruda.liriliri.io/)

- Console, Elements, Network, Resources, Sources, DOM
- Activate from Start Menu or **_SHIFT+F12_**

### [EmulatorJS](https://github.com/ethanaobrien/emulatorjs) (**_.32x, .a26, .a52, .a78, .gb, .gba, .gbc, .gen, .gg, .j64, .jag, .lnx, .n64, .nds, .nes, .ngc, .ngp, .pce, .sfc, .smc, .smd, .sms, .v64, .vb, .vboy, .ws, .wsc, .z64_**)

- Plays console game roms

### [IRC](https://kiwiirc.com/)

- Internet Relay Chat Client
- Connects over WebSockets

### [js-dos](https://js-dos.com/) (**_.exe, .jsdos, .zip_**)

- DOS emulator
- Automatic save states on close
  - /Users/Public/Snapshots
- Automatic window resize

### [Marked](https://marked.js.org/) (**_.md_**)

- Markdown Viewer

### [Visual Studio Code](https://microsoft.github.io/monaco-editor/)

- Code/text editor
- Supports all file types
- Save files via **_CTRL+S_**
- Line count, cursor position, language id
- [Prettier](https://prettier.io/) formatting
  - json, js/ts, css/sass/less, html, markdown
- Terminal supports Git activity validation flow

### [Paint](https://github.com/1j01/jspaint) (**_.bmp, .gif, .ico, .jpg, .png, .tiff, .webp,_**)

- Create & edit images

### [PDF](https://mozilla.github.io/pdf.js/) (**_.pdf_**)

- Render/Print PDF's
- Page current/count & Zoom

### Photos

- [Supported Formats](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#supported_image_formats)
  - [HEIF](https://github.com/catdad-experiments/libheif-js) (**_.heic, .heif_**)
  - [JPEG XL](https://github.com/niutech/jxl.js) (**_.jxl_**)
  - [QOI](https://gist.github.com/nicolaslegland/f0577cb49b1e56b729a2c0fc0aa151ba) (**_.qoi_**)
  - [TIFF](https://github.com/photopea/UTIF.js) (**_.tif, .tiff_**)
- Fullscreen & [Zoom](https://github.com/anvaka/panzoom)

### [Ruffle](https://ruffle.rs/) (**_.swf, .spl_**)

- Flash Player emulator

### [Stable Diffusion](https://stability.ai/stable-diffusion)

- Creates 512x512 images using artificial intelligence
- Runs locally using [WebSD](https://mlc.ai/web-stable-diffusion/)

### [Terminal](https://xtermjs.org/)

- File system support
- Autocomplete & history
- Pipe commands together
- Command list via `help`
- [Git support](https://isomorphic-git.org/) (checkout & clone)
- [Python support](https://pyodide.org/) (**_.py_**)
- [WebAssembly Package Manager](https://wapm.io/)
  - Ex: `wapm cowsay moo` ([#](https://wapm.io/package/cowsay))
- [Weather information](https://wttr.in/)
- [eSheep](https://adrianotiger.github.io/web-esheep/)
- Activate from Start Menu or **_SHIFT+F10_**
- Neofetch

### [TinyMCE](https://www.tiny.cloud/tinymce/) (**_.rtf, .whtml_**)

- Read & WYSIWYG modes
- File save support

### [Virtual x86](https://copy.sh/v86/) (**_.img, .iso_**)

- x86 emulator
- Automatic save states on close
  - /Users/Public/Snapshots
- Automatic window resize

### [Video Player](https://videojs.com/)

- [Supported Formats](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs)
- Plays [YouTube](https://github.com/videojs/videojs-youtube) videos/shortcuts
- Keyboard Shortcuts (Volume, Seek, Scale, Fullscreen)

### [Vim](https://github.com/coolwanglu/vim.js)

- Code/text editor
- Supports all file types

### [Webamp](https://webamp.org/) (**_.mp3, .wsz_**)

- Winamp audio player
- [Skin support](https://skins.webamp.org/)
- Playlist & streaming support
- Visualization support ("Milkdrop")

# Games 🎮

### [ClassiCube](https://www.classicube.net/)

- Minecraft Classic compatible client

### [DX-Ball](https://habr.com/en/post/147339/)

- Block breaker arcade game like Arkanoid

### [Space Cadet Pinball](https://github.com/alula/SpaceCadetPinball)

- Reverse engineering of 3D Pinball from Windows

### [Quake III Arena](https://github.com/lrusso/Quake3)

- Port of the classic first-person shooter

# Recent Enhancements ✨

- Realistic Git lab simulation for `clone` + `pull` with observable file changes
- New Git activities for:
  - Initial Git identity setup
  - Clone-only
  - Pull-only
  - Clone + pull combined flow
- Workspace seeding for activities (auto project scaffolding)
- Resettable activity environments for repeatable classroom practice
- Visual consistency updates:
  - Monaco renamed to **Visual Studio Code** in visible UI
  - Start Menu shortcut updated accordingly
- Git Bash UX improvements (window controls fallback)
- Default app launch behavior set to maximized (fullscreen-like)
- Build validated for production export and Vercel deployment flow

# Try It 🚀

##### Requirements

- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/en/)

##### Development

```
yarn install
yarn build:prebuild
yarn dev
```

##### Production

```
yarn install
yarn build
yarn serve
```

##### Docker

```
docker build -t dhconsole .
docker run -dp 3000:3000 --rm --name dhconsole dhconsole
```

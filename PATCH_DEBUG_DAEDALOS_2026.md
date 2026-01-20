# PATCH DEBUG DH console (enero 2026)

---

## 1) pages/index.tsx

```tsx
import { memo, useState } from "react";
import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  // Dev-only error boundary and fallback UI
  const [error, setError] = useState<Error | null>(null);

  if (process.env.NODE_ENV === "development") {
    try {
      // Instrument: log render attempt
      // eslint-disable-next-line no-console
      console.log("[DH console] Rendering Desktop (dev mode)");
      if (error) throw error;
      return (
        <Desktop>
          <Taskbar />
          <AppsLoader />
        </Desktop>
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[DH console] Desktop failed to render:", err);
      if (!error) setError(err instanceof Error ? err : new Error(String(err)));
      return (
        <div
          style={{
            background: "#fff",
            color: "#b00",
            fontFamily: "monospace",
            padding: 32,
            border: "2px solid #b00",
            borderRadius: 8,
            margin: 32,
            maxWidth: 600,
            wordBreak: "break-word",
          }}
        >
          <h1>Desktop failed to render</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(err)}</pre>
          <p>Check the console for details.</p>
        </div>
      );
    }
  }

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export default memo(Index);
```

---

## 2) pages/\_app.tsx

```tsx
import { type AppProps } from "next/app";
import { memo } from "react";
import { ErrorBoundary } from "components/pages/ErrorBoundary";
import Metadata from "components/pages/Metadata";
import StyledApp from "components/pages/StyledApp";
import { FileSystemProvider } from "contexts/fileSystem";
import { MenuProvider } from "contexts/menu";
import { ProcessProvider } from "contexts/process";
import { SessionProvider } from "contexts/session";
import { ViewportProvider } from "contexts/viewport";

import { useEffect } from "react";

const App = ({ Component: Index, pageProps }: AppProps): React.ReactElement => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Global error handler
      const onError = (event: ErrorEvent) => {
        // eslint-disable-next-line no-console
        console.error(
          "[DH console] Global error:",
          event.error || event.message
        );
      };
      // Global unhandledrejection handler
      const onRejection = (event: PromiseRejectionEvent) => {
        // eslint-disable-next-line no-console
        console.error(
          "[DH console] Unhandled promise rejection:",
          event.reason
        );
      };
      window.addEventListener("error", onError);
      window.addEventListener("unhandledrejection", onRejection);
      return () => {
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onRejection);
      };
    }
    return undefined;
  }, []);

  return (
    <ViewportProvider>
      <ProcessProvider>
        <FileSystemProvider>
          <SessionProvider>
            <ErrorBoundary>
              <Metadata />
              <StyledApp>
                <MenuProvider>
                  <Index {...pageProps} />
                </MenuProvider>
              </StyledApp>
            </ErrorBoundary>
          </SessionProvider>
        </FileSystemProvider>
      </ProcessProvider>
    </ViewportProvider>
  );
};

export default memo(App);
```

---

## 3) components/system/Desktop/index.tsx (Panel DEV)

```tsx
import { memo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import StyledDesktop from "components/system/Desktop/StyledDesktop";
import useWallpaper from "components/system/Desktop/Wallpapers/useWallpaper";
import FileManager from "components/system/Files/FileManager";
import { DESKTOP_PATH } from "utils/constants";

const DEV_ASSETS = [
  "/.index/desktopIcons.json",
  "/.index/startMenuIcons.json",
  "/.index/fs.9p.json",
];

const Desktop: FC = ({ children }) => {
  const desktopRef = useRef<HTMLElement | null>(null);
  const router =
    typeof window !== "undefined"
      ? require("next/router").useRouter()
      : { asPath: "" };
  const [assetStatus, setAssetStatus] = useState<{
    [key: string]: "idle" | "loading" | "ok" | "error";
  }>({});
  const [showPanel, setShowPanel] = useState(false);

  useWallpaper(desktopRef);

  // DEV panel logic (only in dev)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    setShowPanel(true);
    DEV_ASSETS.forEach((asset) => {
      setAssetStatus((prev) => ({ ...prev, [asset]: "loading" }));
      fetch(asset)
        .then((res) => {
          if (res.ok) setAssetStatus((prev) => ({ ...prev, [asset]: "ok" }));
          else setAssetStatus((prev) => ({ ...prev, [asset]: "error" }));
        })
        .catch(() => setAssetStatus((prev) => ({ ...prev, [asset]: "error" })));
    });
  }, []);

  return (
    <StyledDesktop ref={desktopRef}>
      {showPanel && process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            zIndex: 9999,
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 16,
            fontSize: 14,
            minWidth: 320,
            boxShadow: "0 2px 16px #0003",
            color: "#222",
            maxWidth: 400,
            fontFamily: "monospace",
          }}
        >
          <b>DEV PANEL</b>
          <div style={{ margin: "8px 0" }}>
            <b>Ruta actual:</b> <span>{router?.asPath}</span>
          </div>
          <div style={{ margin: "8px 0" }}>
            <b>Assets .index:</b>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {DEV_ASSETS.map((asset) => (
                <li key={asset}>
                  <span>{asset}</span>
                  {" \u00009 "}
                  <span
                    style={{
                      color:
                        assetStatus[asset] === "ok"
                          ? "green"
                          : assetStatus[asset] === "loading"
                            ? "#888"
                            : "red",
                    }}
                  >
                    {assetStatus[asset] === "ok"
                      ? "OK"
                      : assetStatus[asset] === "loading"
                        ? "Cargando..."
                        : "ERROR"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ margin: "8px 0" }}>
            <b>Estado de carga:</b>
            <span>
              {Object.values(assetStatus).every((s) => s === "ok")
                ? "ready"
                : Object.values(assetStatus).some((s) => s === "loading")
                  ? "loading"
                  : "error"}
            </span>
          </div>
        </div>
      )}
      <FileManager
        url={DESKTOP_PATH}
        allowMovingDraggableEntries
        hideLoading
        hideScrolling
        isDesktop
        loadIconsImmediately
      />
      {children}
    </StyledDesktop>
  );
};

export default memo(Desktop);
```

---

## 4) next.config.js (fragmento relevante)

```js
const nextConfig = {
  // ...otros settings...
  output: "export",
  // ...otros settings...
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
  // ...otros settings...
};
```

---

## URLs que fetchea el Panel DEV

- `/.index/desktopIcons.json`
- `/.index/startMenuIcons.json`
- `/.index/fs.9p.json`

---

## Output real del panel (pantalla en blanco, assets con error)

```
DEV PANEL
Ruta actual: /
Assets .index:
  /.index/desktopIcons.json   ERROR
  /.index/startMenuIcons.json ERROR
  /.index/fs.9p.json         ERROR
Estado de carga: error
```

---

## Ejemplo de error rojo capturado en consola

```
[DH console] Global error: TypeError: Cannot read properties of undefined (reading 'map')
    at Desktop (components/system/Desktop/index.tsx:42:18)
    at renderWithHooks (react-dom.development.js:16305:18)
    ...
```

---

## Instrucciones para reproducir

```sh
yarn build:prebuild
yarn dev
# Abrir http://localhost:3000/ en el navegador
```

---

## Comandos básicos para emular consola (cmd)

Puedes probar estos comandos en una terminal de Windows (cmd.exe) o en la consola integrada de VS Code para validar el entorno y simular operaciones básicas:

```cmd
REM Ver versión de Node y Yarn
node -v
yarn -v

REM Listar archivos y carpetas
cd C:\Users\emiliano.delarco\Desktop\DH console
dir

REM Iniciar el servidor de desarrollo
call yarn dev

REM Verificar si el puerto 3000 está escuchando
netstat -ano | findstr :3000

REM Hacer una petición HTTP local (requiere curl en Windows 10+)
curl -i http://localhost:3000/

REM Limpiar la caché de yarn
call yarn cache clean

REM Instalar dependencias
call yarn install

REM Construir el proyecto
call yarn build:prebuild

REM Abrir el navegador en la app
start http://localhost:3000/
```

Estos comandos te permiten:

- Verificar dependencias y entorno
- Navegar y listar archivos
- Iniciar/parar el servidor
- Probar conectividad local
- Limpiar y reinstalar dependencias
- Simular acciones típicas de consola para debugging

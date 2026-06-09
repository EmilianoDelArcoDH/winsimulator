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
  const router = useRouter();
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
    <StyledDesktop ref={desktopRef} data-tour="desktop">
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
                  {" -> "}
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

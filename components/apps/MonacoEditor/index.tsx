import { basename, dirname } from "path";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { getSaveFileInfo } from "components/apps/MonacoEditor/functions";
import StatusBar from "components/apps/MonacoEditor/StatusBar";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import useMonaco from "components/apps/MonacoEditor/useMonaco";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { DEFAULT_TEXT_FILE_SAVE_PATH } from "utils/constants";

type ExplorerEntry = {
  isDirectory: boolean;
  name: string;
};

const MonacoWorkbench: FC<ComponentProcessProps> = ({ id }) => {
  const {
    processes: { [id]: process },
    open,
    url: setProcessUrl,
  } = useProcesses();
  const {
    exists,
    lstat,
    mkdir,
    readdir,
    rename,
    rmdir,
    unlink,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const currentUrl = process?.url || DEFAULT_TEXT_FILE_SAVE_PATH;
  const currentEditor = process?.editor;
  const explorerRoot = useMemo(() => dirname(currentUrl), [currentUrl]);
  const [entries, setEntries] = useState<ExplorerEntry[]>([]);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [activeView, setActiveView] = useState<"explorer" | "search" | "git">(
    "explorer"
  );
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [creatingEntry, setCreatingEntry] = useState<"file" | "folder" | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const normalizeFsPath = useCallback((value: string): string => value.replace(/\/+/g, "/"), []);
  const openFile = useCallback(
    (filePath: string): void => {
      const normalizedPath = normalizeFsPath(filePath);

      setOpenFiles((currentFiles) =>
        currentFiles.includes(normalizedPath)
          ? currentFiles
          : [...currentFiles, normalizedPath]
      );
      setProcessUrl(id, normalizedPath);
      setSelectedPath(normalizedPath);
    },
    [id, normalizeFsPath, setProcessUrl]
  );
  const closeFile = useCallback(
    (filePath: string): void => {
      setOpenFiles((currentFiles) => {
        const nextFiles = currentFiles.filter((openFilePath) => openFilePath !== filePath);
        const nextActiveFile = nextFiles[nextFiles.length - 1] || DEFAULT_TEXT_FILE_SAVE_PATH;

        if (filePath === currentUrl) {
          setProcessUrl(id, nextActiveFile);
          setSelectedPath(nextActiveFile);
        }

        return nextFiles;
      });
    },
    [currentUrl, id, setProcessUrl]
  );
  const loadEntries = useCallback(async () => {
    if (!explorerRoot.startsWith("/")) {
      setEntries([]);
      return;
    }

    try {
      const names = await readdir(explorerRoot);
      const details = await Promise.all(
        names.map(async (name) => {
          const stats = await lstat(`${explorerRoot}/${name}`.replace(/\/+/g, "/"));

          return {
            isDirectory: stats.isDirectory(),
            name,
          };
        })
      );

      setEntries(
        details.sort((left, right) => {
          if (left.isDirectory !== right.isDirectory) {
            return left.isDirectory ? -1 : 1;
          }

          return left.name.localeCompare(right.name);
        })
      );
    } catch {
      setEntries([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explorerRoot]);

  useEffect(() => {
    const normalizedUrl = normalizeFsPath(currentUrl);

    setOpenFiles((currentFiles) =>
      currentFiles.includes(normalizedUrl)
        ? currentFiles
        : [...currentFiles, normalizedUrl]
    );
    setSelectedPath((currentSelectedPath) => currentSelectedPath || normalizedUrl);
  }, [currentUrl, normalizeFsPath]);

  useEffect(() => {
    loadEntries().catch(() => {
      // Ignore explorer refresh failures
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explorerRoot]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-bar') && !target.closest('.context-menu')) {
        setContextMenu(null);
        setActiveMenu("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTemplateContent = useCallback((fileType: string): string => {
    const templates: Record<string, string> = {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World</h1>
  <script src="script.js"><\/script>
</body>
</html>`,
      css: `/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}`,
      js: `// JavaScript Template
console.log('Hello World');

function example() {
  // Add your code here
}

// Export for use in modules
// module.exports = { example };`,
    };
    return templates[fileType] || "";
  }, []);

  const createEntry = useCallback(
    async (isDirectory: boolean, fileName?: string): Promise<void> => {
      if (!fileName) {
        setCreatingEntry(isDirectory ? "folder" : "file");
        return;
      }

      const nextPath = normalizeFsPath(`${explorerRoot}/${fileName}`);

      try {
        if (isDirectory) {
          await mkdir(nextPath);
        } else {
          const extension = fileName.split(".").pop()?.toLowerCase() || "";
          const fileType =
            extension === "html"
              ? "html"
              : extension === "css"
                ? "css"
                : extension === "js"
                  ? "js"
                  : "";
          const content = fileType ? getTemplateContent(fileType) : "";
          await writeFile(nextPath, content);
          openFile(nextPath);
        }

        await loadEntries();
        setSelectedPath(nextPath);
        setRenamingPath(nextPath);
        setRenameValue(fileName);
        setCreatingEntry(null);
      } catch (error) {
        // Error handling without alert
        console.error(
          `Could not create ${isDirectory ? "folder" : "file"}:`,
          error
        );
        setCreatingEntry(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [explorerRoot, getTemplateContent, mkdir, normalizeFsPath, openFile, writeFile]
  );

  const startRename = useCallback((path: string): void => {
    setRenamingPath(path);
    setRenameValue(basename(path));
  }, []);
  const deleteSelectedEntry = useCallback(
    async (confirmed = false): Promise<void> => {
      if (!selectedPath) return;

      if (!confirmed) {
        setConfirmDelete(selectedPath);
        return;
      }

      try {
        const selectedStats = await lstat(selectedPath);

        if (selectedStats.isDirectory()) {
          await rmdir(selectedPath);
        } else {
          await unlink(selectedPath);
          closeFile(selectedPath);
        }

        await loadEntries();
        setConfirmDelete(null);
      } catch (error) {
        console.error("Could not delete entry:", error);
        setConfirmDelete(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeFile, lstat, rmdir, selectedPath, unlink]
  );

  const commitRename = useCallback(async (): Promise<void> => {
    if (!renamingPath) return;

    const nextName = renameValue.trim();

    if (!nextName) {
      setRenamingPath(null);
      setRenameValue("");
      return;
    }

    const nextPath = normalizeFsPath(`${dirname(renamingPath)}/${nextName}`);

    if (nextPath === renamingPath) {
      setRenamingPath(null);
      setRenameValue("");
      return;
    }

    try {
      if (await exists(nextPath)) {
        console.error("Could not rename entry: name already exists.");
        return;
      }

      const renamed = await rename(renamingPath, nextPath);

      if (!renamed) {
        console.error("Could not rename entry.");
        return;
      }

      setOpenFiles((currentFiles) =>
        currentFiles.map((openFilePath) =>
          openFilePath === renamingPath ? nextPath : openFilePath
        )
      );

      if (selectedPath === renamingPath) {
        setSelectedPath(nextPath);
      }

      if (currentUrl === renamingPath) {
        setProcessUrl(id, nextPath);
      }

      await loadEntries();
      setRenamingPath(null);
      setRenameValue("");
    } catch (error) {
      console.error("Could not rename entry:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, exists, id, normalizeFsPath, rename, renameValue, renamingPath, selectedPath]);
  const saveCurrentFile = useCallback(async (): Promise<void> => {
    const [saveUrl, saveData] = getSaveFileInfo(currentUrl, currentEditor);

    if (saveUrl && saveData) {
      await writeFile(saveUrl, saveData, true);
      updateFolder(dirname(saveUrl), basename(saveUrl));
      await loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEditor, currentUrl, updateFolder, writeFile]);
  const runMenuAction = useCallback(
    async (menuAction: string): Promise<void> => {
      setActiveMenu("");

      if (menuAction === "new-file") {
        await createEntry(false);
        return;
      }

      if (menuAction === "new-folder") {
        await createEntry(true);
        return;
      }

      if (menuAction === "open-folder") {
        try {
          const handles = await (window as any).showDirectoryPicker?.();
          if (handles) {
            setProcessUrl(id, "/Users/Documents");
            await loadEntries();
          }
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Could not open folder:", error);
          }
        }
        return;
      }

      if (menuAction === "save") {
        await saveCurrentFile();
        return;
      }

      if (menuAction === "delete") {
        await deleteSelectedEntry();
        return;
      }

      if (menuAction === "refresh") {
        await loadEntries();
        return;
      }

      if (menuAction === "palette") {
        currentEditor?.focus();
        currentEditor?.getAction("editor.action.quickCommand")?.run();
        return;
      }

      if (menuAction === "format") {
        currentEditor?.focus();
        currentEditor?.getAction("editor.action.formatDocument")?.run();
        return;
      }

      if (menuAction === "toggle-sidebar") {
        setPanelOpen((currentOpen) => !currentOpen);
        return;
      }

      if (menuAction === "open-gitbash") {
        open("GitBash", { url: explorerRoot });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      createEntry,
      currentEditor,
      deleteSelectedEntry,
      explorerRoot,
      id,
      open,
      saveCurrentFile,
      setProcessUrl,
    ]
  );

  useEffect(() => {
    if (selectedPath) return;

    const initialSelection = openFiles[openFiles.length - 1] || currentUrl;

    setSelectedPath(initialSelection);
  }, [currentUrl, openFiles, selectedPath]);

  return (
    <>
      <AppContainer
        StyledComponent={StyledMonacoEditor}
        id={id}
        useHook={useMonaco}
      >
        <div className="workbench">
          <header className="menu-bar">
            <ol>
              <li>
                <button
                  className={activeMenu === "file" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu((currentMenu) => (currentMenu === "file" ? "" : "file"));
                  }}
                  type="button"
                >
                  File
                </button>
                {activeMenu === "file" && (
                  <menu>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("new-file"); }} type="button">New File</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("new-folder"); }} type="button">New Folder</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("open-folder"); }} type="button">Open Folder</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("save"); }} type="button">Save</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("delete"); }} type="button">Delete Selected</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("refresh"); }} type="button">Refresh Explorer</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "edit" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu((currentMenu) => (currentMenu === "edit" ? "" : "edit"));
                  }}
                  type="button"
                >
                  Edit
                </button>
                {activeMenu === "edit" && (
                  <menu>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("palette"); }} type="button">Command Palette</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("format"); }} type="button">Format Document</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "view" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu((currentMenu) => (currentMenu === "view" ? "" : "view"));
                  }}
                  type="button"
                >
                  View
                </button>
                {activeMenu === "view" && (
                  <menu>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("toggle-sidebar"); }} type="button">Toggle Side Bar</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "terminal" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu((currentMenu) => (currentMenu === "terminal" ? "" : "terminal"));
                  }}
                  type="button"
                >
                  Terminal
                </button>
                {activeMenu === "terminal" && (
                  <menu>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("open-gitbash"); }} type="button">Open Git Bash</button></li>
                  </menu>
                )}
              </li>
            </ol>
          </header>
          <aside className="activity-bar">
            <button
              className={activeView === "explorer" ? "active" : ""}
              onClick={() => {
                setActiveView("explorer");
                setPanelOpen(true);
              }}
              type="button"
              title="Explorer"
            >
              📁
            </button>
            <button
              className={activeView === "search" ? "active" : ""}
              onClick={() => {
                setActiveView("search");
                setPanelOpen(true);
              }}
              type="button"
              title="Search"
            >
              🔎
            </button>
            <button
              className={activeView === "git" ? "active" : ""}
              onClick={() => {
                setActiveView("git");
                setPanelOpen(true);
              }}
              type="button"
              title="Source Control"
            >
              ⎇
            </button>
            <button
              onClick={() => setPanelOpen((currentOpen) => !currentOpen)}
              type="button"
              title="Toggle Side Bar"
            >
              ☰
            </button>
          </aside>

          {panelOpen && (
            <aside className="side-panel">
              <header>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <span>
                    {activeView === "explorer" && "EXPLORER"}
                    {activeView === "search" && "SEARCH"}
                    {activeView === "git" && "SOURCE CONTROL"}
                  </span>
                  {activeView === "explorer" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-file");
                        }}
                        type="button"
                        title="New File"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
                      >
                        📄
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-folder");
                        }}
                        type="button"
                        title="New Folder"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
                      >
                        📁
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {activeView === "explorer" && (
                <>
                  <p className="section-title">Open Editors</p>
                  <ol className="open-editors">
                    {openFiles.map((openFilePath) => (
                      <li key={openFilePath}>
                        <button
                          className={openFilePath === currentUrl ? "active" : ""}
                          onClick={() => openFile(openFilePath)}
                          type="button"
                          title={openFilePath}
                        >
                          <span>●</span>
                          {basename(openFilePath)}
                        </button>
                        <button
                          className="close"
                          onClick={(event) => {
                            event.stopPropagation();
                            closeFile(openFilePath);
                          }}
                          type="button"
                          title={`Close ${basename(openFilePath)}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ol>
                  <p className="section-title">Folder</p>
                  <p className="folder-title">{basename(explorerRoot) || "Root"}</p>
                  <ol
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseDown={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.closest('input')) {
                        setContextMenu(null);
                      }
                    }}
                  >
                    {creatingEntry && (
                      <li>
                        <div
                          style={{
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ color: "rgb(135 135 135)" }}>
                            {creatingEntry === "folder" ? "📁" : "📄"}
                          </span>
                          <input
                            type="text"
                            autoFocus
                            placeholder={
                              creatingEntry === "folder"
                                ? "Folder name"
                                : "File name (e.g., index.html)"
                            }
                            onBlur={() => setCreatingEntry(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const fileName = e.currentTarget.value.trim();
                                if (fileName) {
                                  createEntry(
                                    creatingEntry === "folder",
                                    fileName
                                  );
                                }
                              } else if (e.key === "Escape") {
                                setCreatingEntry(null);
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: "4px 6px",
                              background: "rgb(60 60 60)",
                              border: "1px solid rgb(14 99 156)",
                              borderRadius: "2px",
                              color: "rgb(255 255 255)",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          />
                        </div>
                      </li>
                    )}
                    {entries.length === 0 && !creatingEntry && (
                      <li className="placeholder">No files</li>
                    )}
                    {entries.map(({ isDirectory, name }) => {
                      const itemPath = `${explorerRoot}/${name}`.replace(/\/+/g, "/");
                      const isActive = !isDirectory && itemPath === currentUrl;

                      if (renamingPath === itemPath) {
                        return (
                          <li key={itemPath}>
                            <div
                              style={{
                                padding: "4px 8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span style={{ color: "rgb(135 135 135)" }}>
                                {isDirectory ? "▸" : ""}
                              </span>
                              <input
                                type="text"
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.currentTarget.value)}
                                onBlur={commitRename}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    commitRename();
                                  } else if (e.key === "Escape") {
                                    setRenamingPath(null);
                                    setRenameValue("");
                                  }
                                }}
                                style={{
                                  flex: 1,
                                  padding: "4px 6px",
                                  background: "rgb(60 60 60)",
                                  border: "1px solid rgb(14 99 156)",
                                  borderRadius: "2px",
                                  color: "rgb(255 255 255)",
                                  fontSize: "12px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li key={itemPath}>
                          <button
                            className={
                              isActive || selectedPath === itemPath ? "active" : ""
                            }
                            onClick={async () => {
                              setSelectedPath(itemPath);

                              if (!isDirectory) {
                                if (!(await exists(itemPath))) return;
                                openFile(itemPath);
                              }
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setSelectedPath(itemPath);
                              setContextMenu({ x: e.clientX, y: e.clientY });
                            }}
                            type="button"
                            title={itemPath}
                          >
                            <span>{isDirectory ? "▸" : ""}</span>
                            {name}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}

              {activeView === "search" && (
                <p className="placeholder">Use Ctrl+F inside editor to search.</p>
              )}

              {activeView === "git" && (
                <p className="placeholder">
                  Source control simulated. Open GitBash for full git workflow.
                </p>
              )}

              {confirmDelete && (
                <>
                  <div
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      zIndex: 10001,
                    }}
                  />
                  <div
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setConfirmDelete(null);
                      if (e.key === "Enter") deleteSelectedEntry(true);
                    }}
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "#2d2d2d",
                      border: "1px solid #555",
                      borderRadius: "4px",
                      padding: "1.5rem",
                      zIndex: 10002,
                      minWidth: "300px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                    }}
                  >
                    <p style={{ color: "#fff", marginBottom: "1rem", fontSize: "14px" }}>
                      Delete '{basename(confirmDelete)}'?
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "rgb(60 60 60)",
                          border: "1px solid rgb(80 80 80)",
                          borderRadius: "2px",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteSelectedEntry(true)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "rgb(180 50 50)",
                          border: "1px solid rgb(200 70 70)",
                          borderRadius: "2px",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}

              {contextMenu && (
                <div
                  className="context-menu"
                  style={{
                    position: "fixed",
                    top: `${contextMenu.y}px`,
                    left: `${contextMenu.x}px`,
                    backgroundColor: "#2d2d2d",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    zIndex: 10000,
                    minWidth: "150px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runMenuAction("new-file");
                      setContextMenu(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#ccc",
                      fontSize: "0.875rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    type="button"
                  >
                    New File
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runMenuAction("new-folder");
                      setContextMenu(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#ccc",
                      fontSize: "0.875rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    type="button"
                  >
                    New Folder
                  </button>
                  {selectedPath && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(selectedPath);
                        setContextMenu(null);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.5rem 1rem",
                        border: "none",
                        background: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        color: "#ccc",
                        fontSize: "0.875rem",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#3d3d3d")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      type="button"
                    >
                      Rename
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runMenuAction("delete");
                      setContextMenu(null);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#ccc",
                      fontSize: "0.875rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3d3d3d")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              )}
            </aside>
          )}

          <main className="editor-area">
            <div className="breadcrumbs">
              {explorerRoot}
              {" > "}
              {basename(currentUrl)}
            </div>
            <header className="tabs">
              {openFiles.length === 0 && <span className="empty-tab">No open files</span>}
              {openFiles.map((openFilePath) => (
                <div
                  className={`tab ${openFilePath === currentUrl ? "active" : ""}`}
                  key={openFilePath}
                >
                  <button
                    className="open"
                    onClick={() => openFile(openFilePath)}
                    type="button"
                    title={openFilePath}
                  >
                    {basename(openFilePath)}
                  </button>
                  <button
                    className="close"
                    onClick={() => closeFile(openFilePath)}
                    type="button"
                    title={`Close ${basename(openFilePath)}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </header>
            <div className="editor-host" data-monaco-editor-host />
          </main>
        </div>
      </AppContainer>
      <StatusBar id={id} />
    </>
  );
};

const MonacoEditor: FC<ComponentProcessProps> = (props) => (
  <MonacoWorkbench {...props} />
);

export default memo(MonacoEditor);

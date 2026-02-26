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
  const { exists, lstat, mkdir, readdir, rmdir, unlink, updateFolder, writeFile } =
    useFileSystem();
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
  }, [explorerRoot, lstat, normalizeFsPath, readdir]);

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
  }, [loadEntries]);

  const createEntry = useCallback(
    async (isDirectory: boolean): Promise<void> => {
      const inputName = window.prompt(isDirectory ? "Folder name" : "File name");

      if (!inputName) return;

      const nextPath = normalizeFsPath(`${explorerRoot}/${inputName}`);

      try {
        if (isDirectory) {
          await mkdir(nextPath);
        } else {
          await writeFile(nextPath, "");
          openFile(nextPath);
        }

        await loadEntries();
      } catch (error) {
        window.alert(
          `Could not create ${isDirectory ? "folder" : "file"}: ${error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [explorerRoot, loadEntries, mkdir, normalizeFsPath, openFile, writeFile]
  );
  const deleteSelectedEntry = useCallback(async (): Promise<void> => {
    if (!selectedPath) {
      window.alert("Select a file or folder first.");
      return;
    }

    if (!window.confirm(`Delete '${basename(selectedPath)}'?`)) return;

    try {
      const selectedStats = await lstat(selectedPath);

      if (selectedStats.isDirectory()) {
        await rmdir(selectedPath);
      } else {
        await unlink(selectedPath);
        closeFile(selectedPath);
      }

      await loadEntries();
    } catch (error) {
      window.alert(
        `Could not delete entry: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }, [closeFile, loadEntries, lstat, rmdir, selectedPath, unlink]);
  const saveCurrentFile = useCallback(async (): Promise<void> => {
    const [saveUrl, saveData] = getSaveFileInfo(currentUrl, currentEditor);

    if (saveUrl && saveData) {
      await writeFile(saveUrl, saveData, true);
      updateFolder(dirname(saveUrl), basename(saveUrl));
      await loadEntries();
    }
  }, [currentEditor, currentUrl, loadEntries, updateFolder, writeFile]);
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
    [
      createEntry,
      currentEditor,
      deleteSelectedEntry,
      explorerRoot,
      loadEntries,
      open,
      saveCurrentFile,
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
                  onClick={() => setActiveMenu((currentMenu) => (currentMenu === "file" ? "" : "file"))}
                  type="button"
                >
                  File
                </button>
                {activeMenu === "file" && (
                  <menu>
                    <li><button onClick={() => runMenuAction("new-file")} type="button">New File</button></li>
                    <li><button onClick={() => runMenuAction("new-folder")} type="button">New Folder</button></li>
                    <li><button onClick={() => runMenuAction("save")} type="button">Save</button></li>
                    <li><button onClick={() => runMenuAction("delete")} type="button">Delete Selected</button></li>
                    <li><button onClick={() => runMenuAction("refresh")} type="button">Refresh Explorer</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "edit" ? "active" : ""}
                  onClick={() => setActiveMenu((currentMenu) => (currentMenu === "edit" ? "" : "edit"))}
                  type="button"
                >
                  Edit
                </button>
                {activeMenu === "edit" && (
                  <menu>
                    <li><button onClick={() => runMenuAction("palette")} type="button">Command Palette</button></li>
                    <li><button onClick={() => runMenuAction("format")} type="button">Format Document</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "view" ? "active" : ""}
                  onClick={() => setActiveMenu((currentMenu) => (currentMenu === "view" ? "" : "view"))}
                  type="button"
                >
                  View
                </button>
                {activeMenu === "view" && (
                  <menu>
                    <li><button onClick={() => runMenuAction("toggle-sidebar")} type="button">Toggle Side Bar</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "terminal" ? "active" : ""}
                  onClick={() => setActiveMenu((currentMenu) => (currentMenu === "terminal" ? "" : "terminal"))}
                  type="button"
                >
                  Terminal
                </button>
                {activeMenu === "terminal" && (
                  <menu>
                    <li><button onClick={() => runMenuAction("open-gitbash")} type="button">Open Git Bash</button></li>
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
                {activeView === "explorer" && "EXPLORER"}
                {activeView === "search" && "SEARCH"}
                {activeView === "git" && "SOURCE CONTROL"}
              </header>

              {activeView === "explorer" && (
                <>
                  <p className="location">OPEN EDITORS</p>
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
                  <p className="location">{basename(explorerRoot).toUpperCase() || "ROOT"}</p>
                  <ol>
                    {entries.length === 0 && <li className="placeholder">No files</li>}
                    {entries.map(({ isDirectory, name }) => {
                      const itemPath = `${explorerRoot}/${name}`.replace(/\/+/g, "/");
                      const isActive = !isDirectory && itemPath === currentUrl;

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

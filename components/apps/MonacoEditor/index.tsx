import { basename, dirname } from "path";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type ExplorerListEntry = ExplorerEntry & {
  depth: number;
  id: string;
  isNew?: boolean;
  parentPath: string;
  path: string;
};

type WindowWithDirectoryPicker = Window & {
  showDirectoryPicker?: () => Promise<unknown>;
};

const INVALID_ENTRY_NAME = /[\\/:*?"<>|]/;

const MonacoWorkbench: FC<ComponentProcessProps> = ({ id }) => {
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const folderEntriesRef = useRef<HTMLOListElement | null>(null);
  const newEntryInputRef = useRef<HTMLInputElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const terminalHistoryRef = useRef<HTMLDivElement | null>(null);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  const {
    processes: { [id]: process },
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
  const normalizeFsPath = useCallback(
    (value: string): string => value.replace(/\\/g, "/").replace(/\/+/g, "/"),
    []
  );
  const currentUrl = normalizeFsPath(process?.url || DEFAULT_TEXT_FILE_SAVE_PATH);
  const currentEditor = process?.editor;
  const explorerRoot = useMemo(
    () => normalizeFsPath(dirname(currentUrl)),
    [currentUrl, normalizeFsPath]
  );
  const [entries, setEntries] = useState<ExplorerEntry[]>([]);
  const [folderContents, setFolderContents] = useState<
    Record<string, ExplorerEntry[]>
  >({});
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isTerminalPanelOpen, setIsTerminalPanelOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 34 });
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [activeView, setActiveView] = useState<"explorer" | "search" | "git">(
    "explorer"
  );
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number }>();
  const [creatingEntry, setCreatingEntry] = useState<"file" | "folder">();
  const [creatingParentPath, setCreatingParentPath] = useState<string>(explorerRoot);
  const [newEntryName, setNewEntryName] = useState("");
  const [newEntryError, setNewEntryError] = useState("");
  const [renamingId, setRenamingId] = useState<string>();
  const [draftName, setDraftName] = useState("");
  const [renameError, setRenameError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string>();
  const [terminalHistory, setTerminalHistory] = useState<
    { id: string; value: string }[]
  >([
    { id: "terminal-init", value: "VS Code Terminal initialized." },
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const logExplorer = useCallback(
    (message: string, details?: Record<string, unknown>): void => {
      // eslint-disable-next-line no-console
      console.log(`[EXPLORER] ${message}`, details);
    },
    []
  );
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
  const sortEntries = useCallback(
    (unsortedEntries: ExplorerEntry[]): ExplorerEntry[] =>
      [...unsortedEntries].sort((left, right) => {
        if (left.isDirectory !== right.isDirectory) {
          return left.isDirectory ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      }),
    []
  );
  const readFolderEntries = useCallback(
    async (folderPath: string): Promise<ExplorerEntry[]> => {
      const normalizedFolderPath = normalizeFsPath(folderPath);

      if (!normalizedFolderPath) {
        return [];
      }

      try {
        const names = await readdir(normalizedFolderPath);
        const details = await Promise.all(
          names.map(async (name) => {
            const stats = await lstat(
              normalizeFsPath(`${normalizedFolderPath}/${name}`)
            );

            return {
              isDirectory: stats.isDirectory(),
              name,
            };
          })
        );

        return sortEntries(details);
      } catch {
        return [];
      }
    },
    [lstat, normalizeFsPath, readdir, sortEntries]
  );
  const getSiblingNameError = useCallback(
    async (value: string, parentPath: string, ignorePath?: string): Promise<string> => {
      const trimmedName = value.trim();

      if (!trimmedName) {
        return "Name cannot be empty.";
      }

      if (INVALID_ENTRY_NAME.test(trimmedName)) {
        return String.raw`Invalid characters: \/:*?"<>|`;
      }

      const siblingEntries =
        folderContents[parentPath] || (await readFolderEntries(parentPath));
      const ignoreName = ignorePath ? basename(ignorePath).toLowerCase() : "";
      const existsInFolder = siblingEntries.some(
        ({ name }) =>
          name.toLowerCase() === trimmedName.toLowerCase() &&
          name.toLowerCase() !== ignoreName
      );

      if (existsInFolder) {
        return "A file or folder with that name already exists.";
      }

      return "";
    },
    [folderContents, readFolderEntries]
  );
  const loadFolder = useCallback(
    async (folderPath: string): Promise<ExplorerEntry[]> => {
      const folderEntries = await readFolderEntries(folderPath);

      setFolderContents((currentMap) => ({
        ...currentMap,
        [folderPath]: folderEntries,
      }));

      if (folderPath === explorerRoot) {
        setEntries(folderEntries);
      }

      return folderEntries;
    },
    [explorerRoot, readFolderEntries]
  );
  const loadEntries = useCallback(async () => {
    if (!explorerRoot) {
      setEntries([]);
      setFolderContents({});
      return;
    }

    const foldersToRefresh = new Set<string>([
      explorerRoot,
      ...expandedFolders,
    ]);

    await Promise.all([...foldersToRefresh].map((folderPath) => loadFolder(folderPath)));

  }, [expandedFolders, explorerRoot, loadFolder]);

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
    setExpandedFolders([explorerRoot]);
    setCreatingParentPath(explorerRoot);
  }, [explorerRoot]);

  useEffect(() => {
    loadEntries().catch(() => {
      // Ignore explorer refresh failures
    });
  }, [loadEntries]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;

      if (
        newEntryInputRef.current?.contains(target) ||
        renameInputRef.current?.contains(target) ||
        Boolean(target.closest(".entry-input"))
      ) {
        return;
      }

      if (
        !target.closest('.menu-bar') &&
        !target.closest('.menu-dropdown') &&
        !target.closest('.context-menu')
      ) {
        setContextMenu(undefined);
        setActiveMenu("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscClose = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;

      setActiveMenu("");
      setContextMenu(undefined);
    };

    document.addEventListener("keydown", handleEscClose);

    return () => document.removeEventListener("keydown", handleEscClose);
  }, []);

  const toggleTopMenu = useCallback(
    (menuName: string, triggerButton: HTMLButtonElement): void => {
      const triggerRect = triggerButton.getBoundingClientRect();
      const estimatedMenuWidth = 220;
      const maxLeft = Math.max(8, window.innerWidth - estimatedMenuWidth - 8);
      const nextLeft = Math.max(8, Math.min(triggerRect.left, maxLeft));

      setMenuPosition({
        left: nextLeft,
        top: triggerRect.bottom,
      });
      setActiveMenu((currentMenu) => (currentMenu === menuName ? "" : menuName));
    },
    []
  );

  useEffect(() => {
    const currentWorkbench = workbenchRef.current;

    if (!currentWorkbench || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      const compact = (entry?.contentRect.width || 0) < 820;

      setIsCompactLayout(compact);
      if (compact) {
        setPanelOpen(false);
      }
    });

    observer.observe(currentWorkbench);

  }, []);

  useEffect(() => {
    if (!creatingEntry) return;

    requestAnimationFrame(() => {
      newEntryInputRef.current?.focus();
      newEntryInputRef.current?.scrollIntoView({ block: "nearest" });
    });
  }, [creatingEntry]);

  useEffect(() => {
    if (!renamingId || !renameInputRef.current) return;

    const renameInput = renameInputRef.current;
    const extensionIndex = draftName.lastIndexOf(".");
    const hasSelectableBaseName = extensionIndex > 0;
    const selectionEnd = hasSelectableBaseName ? extensionIndex : draftName.length;

    requestAnimationFrame(() => {
      renameInput.focus();
      renameInput.setSelectionRange(0, selectionEnd);
    });
  }, [draftName, renamingId]);

  useEffect(() => {
    const lineCount = terminalHistory.length;

    if (lineCount < 0) {
      return;
    }

    terminalHistoryRef.current?.scrollTo({
      top: terminalHistoryRef.current.scrollHeight,
    });
  }, [terminalHistory]);

  useEffect(() => {
    if (!isTerminalPanelOpen) return;

    requestAnimationFrame(() => terminalInputRef.current?.focus());
  }, [isTerminalPanelOpen]);

  const explorerEntries = useMemo<ExplorerListEntry[]>(() => {
    const rootEntries = folderContents[explorerRoot] || entries;
    const flattenedEntries: ExplorerListEntry[] = [];

    const pushFolderEntries = (
      folderPath: string,
      currentDepth: number,
      folderEntries: ExplorerEntry[]
    ): void => {
      const shouldInsertNewEntry = creatingEntry && creatingParentPath === folderPath;

      if (shouldInsertNewEntry) {
        flattenedEntries.push({
          depth: currentDepth,
          id: "__new__",
          isDirectory: creatingEntry === "folder",
          isNew: true,
          name: newEntryName,
          parentPath: folderPath,
          path: "__new__",
        });
      }

      folderEntries.forEach(({ isDirectory, name }) => {
        const entryPath = normalizeFsPath(`${folderPath}/${name}`);

        flattenedEntries.push({
          depth: currentDepth,
          id: entryPath,
          isDirectory,
          name,
          parentPath: folderPath,
          path: entryPath,
        });

        if (!isDirectory || !expandedFolders.includes(entryPath)) {
          return;
        }

        pushFolderEntries(
          entryPath,
          currentDepth + 1,
          folderContents[entryPath] || []
        );
      });
    };

    pushFolderEntries(explorerRoot, 0, rootEntries);

    return flattenedEntries;
  }, [
    creatingEntry,
    creatingParentPath,
    entries,
    expandedFolders,
    explorerRoot,
    folderContents,
    newEntryName,
    normalizeFsPath,
  ]);

  const getTemplateContent = useCallback((fileType: string): string => {
    const templates: Record<string, string> = {
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
  <script src="script.js"></script>
</body>
</html>`,
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
    async (
      parentPath: string,
      isDirectory: boolean,
      fileName: string
    ): Promise<string | undefined> => {
      const nextPath = normalizeFsPath(`${parentPath}/${fileName.trim()}`);

      try {
        logExplorer("createEntry:start", {
          entriesCount: (folderContents[parentPath] || []).length,
          entryType: isDirectory ? "folder" : "file",
          parentPath,
        });

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
        await loadFolder(parentPath);
        setSelectedPath(nextPath);

        logExplorer("createEntry:success", {
          nextPath,
          parentPath,
        });

        return nextPath;
      } catch (error) {
        // Error handling without alert
        console.error(
          `Could not create ${isDirectory ? "folder" : "file"}:`,
          error
        );
        return undefined;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      folderContents,
      getTemplateContent,
      loadFolder,
      logExplorer,
      mkdir,
      normalizeFsPath,
      openFile,
      writeFile,
    ]
  );

  const resolveTargetFolder = useCallback(async (): Promise<string> => {
    if (!selectedPath) {
      return explorerRoot;
    }

    try {
      const normalizedSelectedPath = normalizeFsPath(selectedPath);
      const selectedStats = await lstat(normalizedSelectedPath);

      return selectedStats.isDirectory()
        ? normalizedSelectedPath
        : normalizeFsPath(dirname(normalizedSelectedPath));
    } catch {
      return explorerRoot;
    }
  }, [explorerRoot, lstat, normalizeFsPath, selectedPath]);

  const toggleFolder = useCallback(
    async (folderPath: string): Promise<void> => {
      setSelectedPath(folderPath);

      if (expandedFolders.includes(folderPath)) {
        setExpandedFolders((currentFolders) =>
          currentFolders.filter((entryPath) => entryPath !== folderPath)
        );

        return;
      }

      await loadFolder(folderPath);
      setExpandedFolders((currentFolders) => [...currentFolders, folderPath]);
    },
    [expandedFolders, loadFolder]
  );

  const startRename = useCallback((path: string): void => {
    setContextMenu(undefined);
    setRenamingId(path);
    setDraftName(basename(path));
    setRenameError("");
  }, []);

  const commitNewEntry = useCallback(async (): Promise<void> => {
    if (!creatingEntry) return;

    logExplorer("commitNewEntry", {
      creatingEntry,
      creatingParentPath,
      entriesCount: (folderContents[creatingParentPath] || []).length,
      newEntryName,
    });

    const nameError = await getSiblingNameError(newEntryName, creatingParentPath);

    if (nameError) {
      setNewEntryError(nameError);
      requestAnimationFrame(() => newEntryInputRef.current?.focus());
      return;
    }

    const createdPath = await createEntry(
      creatingParentPath,
      creatingEntry === "folder",
      newEntryName.trim()
    );

    if (createdPath) {
      setExpandedFolders((currentFolders) =>
        currentFolders.includes(creatingParentPath)
          ? currentFolders
          : [...currentFolders, creatingParentPath]
      );
      setCreatingEntry(undefined);
      setNewEntryName("");
      setNewEntryError("");
    }
  }, [
    createEntry,
    creatingEntry,
    creatingParentPath,
    folderContents,
    getSiblingNameError,
    logExplorer,
    newEntryName,
  ]);
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
        setConfirmDelete(undefined);
      } catch (error) {
        console.error("Could not delete entry:", error);
        setConfirmDelete(undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeFile, lstat, rmdir, selectedPath, unlink]
  );

  const commitRename = useCallback(async (): Promise<void> => {
    if (!renamingId) return;

    const parentPath = dirname(renamingId);

    logExplorer("commitRename", {
      draftName,
      entriesCount: (folderContents[parentPath] || []).length,
      parentPath,
      renamingId,
    });

    const nameError = await getSiblingNameError(draftName, parentPath, renamingId);

    if (nameError) {
      setRenameError(nameError);
      requestAnimationFrame(() => renameInputRef.current?.focus());
      return;
    }

    const nextName = draftName.trim();
    const nextPath = normalizeFsPath(`${dirname(renamingId)}/${nextName}`);

    if (nextPath === renamingId) {
      setRenamingId(undefined);
      setDraftName("");
      setRenameError("");
      return;
    }

    try {
      const renamed = await rename(renamingId, nextPath);

      if (!renamed) {
        console.error("Could not rename entry.");
        return;
      }

      setOpenFiles((currentFiles) =>
        currentFiles.map((openFilePath) =>
          openFilePath === renamingId ? nextPath : openFilePath
        )
      );

      if (selectedPath === renamingId) {
        setSelectedPath(nextPath);
      }

      if (currentUrl === renamingId) {
        setProcessUrl(id, nextPath);
      }

      await loadEntries();
      setRenamingId(undefined);
      setDraftName("");
      setRenameError("");

      logExplorer("commitRename:success", {
        nextPath,
        parentPath,
      });
    } catch (error) {
      console.error("Could not rename entry:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentUrl,
    draftName,
    folderContents,
    getSiblingNameError,
    id,
    logExplorer,
    normalizeFsPath,
    rename,
    renamingId,
    selectedPath,
  ]);
  const saveCurrentFile = useCallback(async (): Promise<void> => {
    const [saveUrl, saveData] = getSaveFileInfo(currentUrl, currentEditor);

    if (saveUrl && saveData) {
      await writeFile(saveUrl, saveData, true);
      updateFolder(dirname(saveUrl), basename(saveUrl));
      await loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEditor, currentUrl, updateFolder, writeFile]);

  const runTerminalCommand = useCallback(
    (value: string): void => {
      const command = value.trim();

      if (!command) {
        return;
      }

      if (command === "clear") {
        setTerminalHistory([]);
        setTerminalInput("");
        return;
      }

      const nextLines = [`$ ${command}`];

      if (command === "help") {
        nextLines.push("Available commands: help, pwd, ls, clear");
      } else if (command === "pwd") {
        nextLines.push(explorerRoot);
      } else if (command === "ls") {
        const visibleEntries = folderContents[explorerRoot] || entries;

        nextLines.push(
          visibleEntries.length > 0
            ? visibleEntries.map(({ name }) => name).join("  ")
            : "(empty)"
        );
      } else {
        nextLines.push(`Command not found: ${command}`);
      }

      setTerminalHistory((currentHistory) => [
        ...currentHistory,
        ...nextLines.map((line, lineIndex) => ({
          id: `${Date.now()}-${lineIndex}-${line}`,
          value: line,
        })),
      ]);
      setTerminalInput("");
    },
    [entries, explorerRoot, folderContents]
  );

  const runMenuAction = useCallback(
    async (menuAction: string): Promise<void> => {
      setActiveMenu("");

      if (menuAction === "new-file") {
        const targetFolder = normalizeFsPath(await resolveTargetFolder());

        logExplorer("menu:new-file", {
          entriesCount: (folderContents[targetFolder] || []).length,
          targetFolder,
        });

        setCreatingParentPath(targetFolder);
        setExpandedFolders((currentFolders) =>
          currentFolders.includes(targetFolder)
            ? currentFolders
            : [...currentFolders, targetFolder]
        );
        setCreatingEntry("file");
        setNewEntryName("");
        setNewEntryError("");
        setContextMenu(undefined);
        return;
      }

      if (menuAction === "new-folder") {
        const targetFolder = normalizeFsPath(await resolveTargetFolder());

        logExplorer("menu:new-folder", {
          entriesCount: (folderContents[targetFolder] || []).length,
          targetFolder,
        });

        setCreatingParentPath(targetFolder);
        setExpandedFolders((currentFolders) =>
          currentFolders.includes(targetFolder)
            ? currentFolders
            : [...currentFolders, targetFolder]
        );
        setCreatingEntry("folder");
        setNewEntryName("");
        setNewEntryError("");
        setContextMenu(undefined);
        return;
      }

      if (menuAction === "open-folder") {
        try {
          const handles = await (window as WindowWithDirectoryPicker).showDirectoryPicker?.();
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
        if (isCompactLayout) {
          setPanelOpen(false);
          return;
        }

        setPanelOpen((currentOpen) => !currentOpen);
        return;
      }

      if (menuAction === "toggle-terminal") {
        setIsTerminalPanelOpen((currentOpen) => !currentOpen);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentEditor,
      deleteSelectedEntry,
      folderContents,
      id,
      isCompactLayout,
      logExplorer,
      normalizeFsPath,
      resolveTargetFolder,
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
    <AppContainer
      StyledComponent={StyledMonacoEditor}
      id={id}
      useHook={useMonaco}
    >
      <div className={`editor-shell ${isTerminalPanelOpen ? "terminal-open" : ""}`}>
        <div
          ref={workbenchRef}
          className={`workbench ${panelOpen ? "panel-open" : "panel-closed"}`}
        >
          <header className="menu-bar">
            <ol>
              <li>
                <button
                  className={activeMenu === "file" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("file", e.currentTarget);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  File
                </button>
                {activeMenu === "file" && (
                  <menu
                    className="menu-dropdown"
                    style={{
                      left: `${menuPosition.left}px`,
                      position: "fixed",
                      top: `${menuPosition.top}px`,
                    }}
                  >
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("new-file"); }} onMouseDown={(e) => e.preventDefault()} type="button">New File</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("new-folder"); }} onMouseDown={(e) => e.preventDefault()} type="button">New Folder</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("open-folder"); }} onMouseDown={(e) => e.preventDefault()} type="button">Open Folder</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("save"); }} onMouseDown={(e) => e.preventDefault()} type="button">Save</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("delete"); }} onMouseDown={(e) => e.preventDefault()} type="button">Delete Selected</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("refresh"); }} onMouseDown={(e) => e.preventDefault()} type="button">Refresh Explorer</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "edit" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("edit", e.currentTarget);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  Edit
                </button>
                {activeMenu === "edit" && (
                  <menu
                    className="menu-dropdown"
                    style={{
                      left: `${menuPosition.left}px`,
                      position: "fixed",
                      top: `${menuPosition.top}px`,
                    }}
                  >
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("palette"); }} onMouseDown={(e) => e.preventDefault()} type="button">Command Palette</button></li>
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("format"); }} onMouseDown={(e) => e.preventDefault()} type="button">Format Document</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "view" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("view", e.currentTarget);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  View
                </button>
                {activeMenu === "view" && (
                  <menu
                    className="menu-dropdown"
                    style={{
                      left: `${menuPosition.left}px`,
                      position: "fixed",
                      top: `${menuPosition.top}px`,
                    }}
                  >
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("toggle-sidebar"); }} onMouseDown={(e) => e.preventDefault()} type="button">Toggle Side Bar</button></li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "terminal" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("terminal", e.currentTarget);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  Terminal
                </button>
                {activeMenu === "terminal" && (
                  <menu
                    className="menu-dropdown"
                    style={{
                      left: `${menuPosition.left}px`,
                      position: "fixed",
                      top: `${menuPosition.top}px`,
                    }}
                  >
                    <li><button onClick={(e) => { e.stopPropagation(); runMenuAction("toggle-terminal"); }} onMouseDown={(e) => e.preventDefault()} type="button">Toggle Terminal</button></li>
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
                if (!isCompactLayout) {
                  setPanelOpen(true);
                }
              }}
              title="Explorer"
              type="button"
            >
              📁
            </button>
            <button
              className={activeView === "search" ? "active" : ""}
              onClick={() => {
                setActiveView("search");
                if (!isCompactLayout) {
                  setPanelOpen(true);
                }
              }}
              title="Search"
              type="button"
            >
              🔎
            </button>
            <button
              className={activeView === "git" ? "active" : ""}
              onClick={() => {
                setActiveView("git");
                if (!isCompactLayout) {
                  setPanelOpen(true);
                }
              }}
              title="Source Control"
              type="button"
            >
              ⎇
            </button>
            <button
              onClick={() => {
                if (isCompactLayout) {
                  setPanelOpen(false);
                  return;
                }

                setPanelOpen((currentOpen) => !currentOpen);
              }}
              title={
                isCompactLayout
                  ? "Side Bar hidden in compact layout"
                  : "Toggle Side Bar"
              }
              type="button"
            >
              ☰
            </button>
          </aside>

          {panelOpen && (
            <aside className="side-panel">
              <header>
                <div className="panel-header-row">
                  <span>
                    {activeView === "explorer" && "EXPLORER"}
                    {activeView === "search" && "SEARCH"}
                    {activeView === "git" && "SOURCE CONTROL"}
                  </span>
                  {activeView === "explorer" && (
                    <div className="panel-actions">
                      <button
                        className="icon-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-file");
                        }}
                        title="New File"
                        type="button"
                      >
                        📄
                      </button>
                      <button
                        className="icon-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-folder");
                        }}
                        title="New Folder"
                        type="button"
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
                          title={openFilePath}
                          type="button"
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
                          title={`Close ${basename(openFilePath)}`}
                          type="button"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ol>
                  <p className="section-title">Folder</p>
                  <p className="folder-title">{basename(explorerRoot) || "Root"}</p>
                  <ol
                    ref={folderEntriesRef}
                    className="folder-entries"
                  >
                    {explorerEntries.length === 0 && !creatingEntry && (
                      <li className="placeholder">No files</li>
                    )}
                    {explorerEntries.map(
                      ({
                        depth,
                        id: itemId,
                        isDirectory,
                        isNew,
                        name,
                        path,
                      }) => {
                        const explorerPadding = `${8 + depth * 14}px`;

                        if (isNew) {
                          return (
                            <li key={itemId} className="entry-editing">
                              <div
                                className="entry-editor-row"
                                style={{ paddingLeft: explorerPadding }}
                              >
                                <span className="entry-icon">
                                  {isDirectory ? "📁" : "📄"}
                                </span>
                                <div className="entry-input-wrap">
                                  <input
                                    ref={newEntryInputRef}
                                    className="entry-input"
                                    onBlur={() => {
                                      if (newEntryName.trim()) {
                                        commitNewEntry();
                                        return;
                                      }

                                      setCreatingEntry(undefined);
                                      setNewEntryName("");
                                      setNewEntryError("");
                                    }}
                                    onChange={(event) => {
                                      setNewEntryName(event.currentTarget.value);
                                      if (newEntryError) {
                                        setNewEntryError("");
                                      }
                                    }}
                                    onClick={(event) => event.stopPropagation()}
                                    onKeyDown={(event) => {
                                      event.stopPropagation();

                                      if (event.key === "Enter") {
                                        event.preventDefault();
                                        commitNewEntry();
                                      } else if (event.key === "Escape") {
                                        setCreatingEntry(undefined);
                                        setNewEntryName("");
                                        setNewEntryError("");
                                      }
                                    }}
                                    placeholder={
                                      isDirectory
                                        ? "Folder name"
                                        : "File name (e.g., index.html)"
                                    }
                                    type="text"
                                    value={newEntryName}
                                    autoFocus
                                  />
                                  {newEntryError && (
                                    <span className="entry-error">{newEntryError}</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        }

                        const itemPath = path;
                        const isExpandedFolder =
                          isDirectory && expandedFolders.includes(itemPath);
                        const isActive = !isDirectory && itemPath === currentUrl;

                        if (renamingId === itemPath) {
                          return (
                            <li key={itemId} className="entry-editing">
                              <div
                                className="entry-editor-row"
                                style={{ paddingLeft: explorerPadding }}
                              >
                                <span className="entry-icon">
                                  {isDirectory ? (isExpandedFolder ? "📂" : "📁") : "📄"}
                                </span>
                                <div className="entry-input-wrap">
                                  <input
                                    ref={renameInputRef}
                                    className="entry-input"
                                    onBlur={commitRename}
                                    onChange={(event) => {
                                      setDraftName(event.currentTarget.value);
                                      if (renameError) {
                                        setRenameError("");
                                      }
                                    }}
                                    onClick={(event) => event.stopPropagation()}
                                    onKeyDown={(e) => {
                                      e.stopPropagation();

                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        commitRename();
                                      } else if (e.key === "Escape") {
                                        setRenamingId(undefined);
                                        setDraftName("");
                                        setRenameError("");
                                      }
                                    }}
                                    type="text"
                                    value={draftName}
                                  />
                                  {renameError && (
                                    <span className="entry-error">{renameError}</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        }

                        return (
                          <li key={itemId}>
                            <button
                              className={
                                isActive || selectedPath === itemPath ? "active" : ""
                              }
                              onClick={async () => {
                                setSelectedPath(itemPath);

                                if (isDirectory) {
                                  await toggleFolder(itemPath);
                                  return;
                                }

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
                              onDoubleClick={() => {
                                if (!isDirectory) {
                                  startRename(itemPath);
                                }
                              }}
                              style={{ paddingLeft: explorerPadding }}
                              title={itemPath}
                              type="button"
                            >
                              <span>
                                {isDirectory ? (isExpandedFolder ? "▾" : "▸") : "•"}
                              </span>
                              <span className="entry-icon">
                                {isDirectory ? (isExpandedFolder ? "📂" : "📁") : "📄"}
                              </span>
                              <span className="entry-label">{name}</span>
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
                  Source control simulated in this workbench.
                </p>
              )}

              {confirmDelete && (
                <>
                  <button
                    aria-label="Close delete confirmation"
                    className="modal-backdrop"
                    onClick={() => setConfirmDelete(undefined)}
                    type="button"
                  />
                  <div
                    className="confirm-dialog"
                  >
                    <p className="confirm-message">
                      Delete &apos;{basename(confirmDelete)}&apos;?
                    </p>
                    <div className="confirm-actions">
                      <button
                        className="dialog-action"
                        onClick={() => setConfirmDelete(undefined)}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="dialog-action danger"
                        onClick={() => deleteSelectedEntry(true)}
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
                    left: `${contextMenu.x}px`,
                    position: "fixed",
                    top: `${contextMenu.y}px`,
                  }}
                >
                  <button
                    className="context-menu-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      runMenuAction("new-file");
                      setContextMenu(undefined);
                    }}
                    type="button"
                  >
                    New File
                  </button>
                  <button
                    className="context-menu-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      runMenuAction("new-folder");
                      setContextMenu(undefined);
                    }}
                    type="button"
                  >
                    New Folder
                  </button>
                  {selectedPath && (
                    <button
                      className="context-menu-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(selectedPath);
                        setContextMenu(undefined);
                      }}
                      type="button"
                    >
                      Rename
                    </button>
                  )}
                  <button
                    className="context-menu-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      runMenuAction("delete");
                      setContextMenu(undefined);
                    }}
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
                  key={openFilePath}
                  className={`tab ${openFilePath === currentUrl ? "active" : ""}`}
                >
                  <button
                    className="open"
                    onClick={() => openFile(openFilePath)}
                    title={openFilePath}
                    type="button"
                  >
                    {basename(openFilePath)}
                  </button>
                  <button
                    className="close"
                    onClick={() => closeFile(openFilePath)}
                    title={`Close ${basename(openFilePath)}`}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </header>
            <div className="editor-host" data-monaco-editor-host />
          </main>
        </div>
        {isTerminalPanelOpen && (
          <section aria-label="Terminal" className="bottom-panel">
            <div className="bottom-panel-header">TERMINAL</div>
            <div ref={terminalHistoryRef} className="terminal-history">
              {terminalHistory.length === 0 && (
                <div className="terminal-line">Terminal cleared.</div>
              )}
              {terminalHistory.map(({ id: lineId, value }) => (
                <div key={lineId} className="terminal-line">
                  {value}
                </div>
              ))}
            </div>
            <form
              className="terminal-input-row"
              onSubmit={(event) => {
                event.preventDefault();
                runTerminalCommand(terminalInput);
              }}
            >
              <span>$</span>
              <input
                ref={terminalInputRef}
                className="terminal-input"
                onChange={(event) => setTerminalInput(event.currentTarget.value)}
                type="text"
                value={terminalInput}
              />
            </form>
          </section>
        )}
        <div className="status-bar-host">
          <StatusBar id={id} />
        </div>
      </div>
    </AppContainer>
  );
};

const MonacoEditor: FC<ComponentProcessProps> = (props) => (
  <MonacoWorkbench {...props} />
);

export default memo(MonacoEditor);

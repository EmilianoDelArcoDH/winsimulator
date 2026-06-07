import { basename, dirname, extname } from "path";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import AudiotrackRoundedIcon from "@mui/icons-material/AudiotrackRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import CreateNewFolderRoundedIcon from "@mui/icons-material/CreateNewFolderRounded";
import { getSaveFileInfo } from "components/apps/MonacoEditor/functions";
import StatusBar from "components/apps/MonacoEditor/StatusBar";
import StyledMonacoEditor from "components/apps/MonacoEditor/StyledMonacoEditor";
import useMonaco from "components/apps/MonacoEditor/useMonaco";
import { parseCommand } from "components/apps/Terminal/functions";
import processGit from "components/apps/Terminal/processGit";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import {
  getActivityById,
  getCurrentActivityId,
  trackActivityEvent,
  type ValidationResult,
  validateActivity,
} from "utils/activityRuntime";
import {
  getPagesUsername,
  getPublishedSitesBySourceRoot,
  registerPublishedSite,
  updatePublishedSite,
} from "utils/pagesRuntime";
import { DEFAULT_TEXT_FILE_SAVE_PATH, DESKTOP_PATH } from "utils/constants";

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

type ContextMenuState = {
  directoryPath?: string;
  targetIsDirectory: boolean;
  targetPath?: string;
  x: number;
  y: number;
};

type UrlTargetType = "none" | "file" | "directory";

type ActivityValidationState = {
  activityId: string;
  completed: boolean;
  progress: { completed: number; total: number };
  results: ValidationResult[];
};

const INVALID_ENTRY_NAME = /[\\/:*?"<>|]/;
const SIDEBAR_WIDTH_STORAGE_KEY = "monaco:sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 210;
const GIT_CONFIG_KEY = "gitbash_global_config";

const getEditorUiText = (language: "en" | "es" | "pt") => {
  if (language === "pt") {
    return {
      cancel: "Cancelar",
      closeDeleteConfirmation: "Fechar confirmacao de exclusao",
      closeSaveAsDialog: "Fechar dialogo Salvar como",
      delete: "Excluir",
      deleteEntry: (name: string): string => `Excluir '${name}'?`,
      fileNamePlaceholder: "Nome do arquivo (ex.: index.html)",
      folderNamePlaceholder: "Nome da pasta",
      readOnlyActivityMessage:
        "Nesta atividade, voce so pode editar o arquivo de proposta.",
      saveAs: "Salvar como",
      saveAsPathPlaceholder: "index.html ou src/app.js",
      saveAsSubtitle: (root: string): string =>
        `Informe um nome de arquivo ou caminho relativo de ${root}`,
      searchPlaceholder: "Use Ctrl+F dentro do editor para pesquisar.",
      sourceControlPlaceholder:
        "Controle de codigo-fonte simulado neste ambiente.",
    };
  }

  if (language === "es") {
    return {
      cancel: "Cancelar",
      closeDeleteConfirmation: "Cerrar confirmacion de eliminacion",
      closeSaveAsDialog: "Cerrar dialogo Guardar como",
      delete: "Eliminar",
      deleteEntry: (name: string): string => `Eliminar '${name}'?`,
      fileNamePlaceholder: "Nombre de archivo (ej.: index.html)",
      folderNamePlaceholder: "Nombre de carpeta",
      readOnlyActivityMessage:
        "En esta actividad solo puedes editar el archivo de propuesta.",
      saveAs: "Guardar como",
      saveAsPathPlaceholder: "index.html o src/app.js",
      saveAsSubtitle: (root: string): string =>
        `Ingresa un nombre de archivo o ruta relativa desde ${root}`,
      searchPlaceholder: "Usa Ctrl+F dentro del editor para buscar.",
      sourceControlPlaceholder:
        "Control de codigo fuente simulado en este entorno.",
    };
  }

  return {
    cancel: "Cancel",
    closeDeleteConfirmation: "Close delete confirmation",
    closeSaveAsDialog: "Close save as dialog",
    delete: "Delete",
    deleteEntry: (name: string): string => `Delete '${name}'?`,
    fileNamePlaceholder: "File name (e.g., index.html)",
    folderNamePlaceholder: "Folder name",
    readOnlyActivityMessage:
      "In this activity, you can only edit the proposal file.",
    saveAs: "Save As",
    saveAsPathPlaceholder: "index.html or src/app.js",
    saveAsSubtitle: (root: string): string =>
      `Enter a file name or relative path from ${root}`,
    searchPlaceholder: "Use Ctrl+F inside editor to search.",
    sourceControlPlaceholder: "Source control simulated in this workbench.",
  };
};

const getTemplateCursorOffset = (filePath: string, content: string): number => {
  const extension = extname(filePath).toLowerCase();

  if (extension === ".html") {
    const marker = "<h1>Hello World</h1>";
    const markerIndex = content.indexOf(marker);

    if (markerIndex !== -1) {
      return markerIndex + marker.length;
    }
  }

  if (extension === ".css") {
    const marker = "h1 {";
    const markerIndex = content.indexOf(marker);

    if (markerIndex !== -1) {
      return markerIndex + marker.length;
    }
  }

  if (extension === ".js") {
    const marker = "// Add your code here";
    const markerIndex = content.indexOf(marker);

    if (markerIndex !== -1) {
      return markerIndex + marker.length;
    }
  }

  return content.length;
};

const getEntryIcon = (
  entryName: string,
  isDirectory: boolean
): ReactElement => {
  if (isDirectory) {
    return <FolderRoundedIcon sx={{ color: "rgb(219 176 92)" }} />;
  }

  const extension = extname(entryName).toLowerCase();
  const imageExtensions = new Set([
    ".avif",
    ".bmp",
    ".gif",
    ".heic",
    ".ico",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
    ".webp",
  ]);
  const audioExtensions = new Set([
    ".aac",
    ".flac",
    ".m4a",
    ".mp3",
    ".ogg",
    ".wav",
    ".wma",
  ]);
  const videoExtensions = new Set([
    ".avi",
    ".m4v",
    ".mkv",
    ".mov",
    ".mp4",
    ".webm",
    ".wmv",
  ]);
  const codeExtensions = new Set([
    ".c",
    ".cpp",
    ".css",
    ".go",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".php",
    ".py",
    ".rb",
    ".rs",
    ".scss",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
  ]);

  if (imageExtensions.has(extension)) {
    return <ImageRoundedIcon sx={{ color: "rgb(171 136 255)" }} />;
  }

  if (audioExtensions.has(extension)) {
    return <AudiotrackRoundedIcon sx={{ color: "rgb(255 179 102)" }} />;
  }

  if (videoExtensions.has(extension)) {
    return <MovieRoundedIcon sx={{ color: "rgb(255 140 140)" }} />;
  }

  if (codeExtensions.has(extension)) {
    return <CodeRoundedIcon sx={{ color: "rgb(97 197 255)" }} />;
  }

  return <DescriptionRoundedIcon sx={{ color: "rgb(188 188 188)" }} />;
};

const MonacoWorkbench: FC<ComponentProcessProps> = ({ id }) => {
  const workbenchRef = useRef<HTMLDivElement | null>(null);
  const folderEntriesRef = useRef<HTMLOListElement | null>(null);
  const newEntryInputRef = useRef<HTMLInputElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const saveAsInputRef = useRef<HTMLInputElement | null>(null);
  const terminalHistoryRef = useRef<HTMLDivElement | null>(null);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  const renameInProgressRef = useRef(false);
  const createInProgressRef = useRef(false);
  const lastExplorerRefreshKeyRef = useRef("");
  const {
    open: openProcess,
    processes: { [id]: process },
    url: setProcessUrl,
  } = useProcesses();
  const {
    exists,
    fs,
    lstat,
    mkdir,
    mkdirRecursive,
    readFile,
    readdir,
    rename,
    rmdir,
    unlink,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const { language } = useSession();
  const uiText = useMemo(() => getEditorUiText(language), [language]);
  const normalizeFsPath = useCallback(
    (value: string): string => value.replace(/\\/g, "/").replace(/\/+/g, "/"),
    []
  );
  const currentUrl = normalizeFsPath(process?.url || "");
  const latestUrlRef = useRef(currentUrl);
  const [currentUrlTargetType, setCurrentUrlTargetType] =
    useState<UrlTargetType>("none");
  const activeFileUrl = currentUrlTargetType === "file" ? currentUrl : "";
  const currentEditor = process?.editor;
  const explorerRoot = useMemo(
    () =>
      currentUrlTargetType === "directory"
        ? currentUrl
        : currentUrl?.startsWith("/")
          ? normalizeFsPath(dirname(currentUrl))
          : DESKTOP_PATH,
    [currentUrl, currentUrlTargetType, normalizeFsPath]
  );
  const [entries, setEntries] = useState<ExplorerEntry[]>([]);
  const [folderContents, setFolderContents] = useState<
    Record<string, ExplorerEntry[]>
  >({});
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    explorerRoot,
  ]);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isTerminalPanelOpen, setIsTerminalPanelOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [activeView, setActiveView] = useState<"explorer" | "search" | "git">(
    "explorer"
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuState>();
  const [creatingEntry, setCreatingEntry] = useState<"file" | "folder">();
  const [creatingParentPath, setCreatingParentPath] =
    useState<string>(explorerRoot);
  const [newEntryName, setNewEntryName] = useState("");
  const [newEntryError, setNewEntryError] = useState("");
  const [renamingId, setRenamingId] = useState<string>();
  const [draftName, setDraftName] = useState("");
  const [renameError, setRenameError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string>();
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  const [saveAsPath, setSaveAsPath] = useState("");
  const [saveAsError, setSaveAsError] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<
    { id: string; value: string }[]
  >([{ id: "terminal-init", value: "VS Code Terminal initialized." }]);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalCwd, setTerminalCwd] = useState<string>(explorerRoot);
  const [pendingEditorFocusPath, setPendingEditorFocusPath] =
    useState<string>("");
  const [pendingCursorOffset, setPendingCursorOffset] = useState<
    number | undefined
  >();
  const [draggedPath, setDraggedPath] = useState("");
  const [dragOverPath, setDragOverPath] = useState("");
  const [activityValidationState, setActivityValidationState] =
    useState<ActivityValidationState>();
  const [sidePanelWidth, setSidePanelWidth] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;

    const storedWidth = Number.parseInt(
      window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY) || "",
      10
    );

    return Number.isFinite(storedWidth) ? storedWidth : DEFAULT_SIDEBAR_WIDTH;
  });
  const hasActiveFile = Boolean(activeFileUrl);
  const currentActivityId = getCurrentActivityId();
  const currentActivity = getActivityById(currentActivityId);
  const activityWorkspace = currentActivity?.data?.workspace as
    | {
        editablePaths?: string[];
        rootPath?: string;
      }
    | undefined;
  const activityWorkspaceRoot = normalizeFsPath(
    activityWorkspace?.rootPath || ""
  );
  const activityEditablePaths = useMemo(
    () =>
      (activityWorkspace?.editablePaths || [])
        .map((entry) => normalizeFsPath(entry))
        .filter(Boolean),
    [activityWorkspace?.editablePaths, normalizeFsPath]
  );
  const canValidateCurrentActivity =
    Boolean(currentActivityId) &&
    Boolean(activityWorkspaceRoot) &&
    (explorerRoot.startsWith(activityWorkspaceRoot) ||
      currentUrl.startsWith(activityWorkspaceRoot));
  const hasWorkspaceEditRestrictions =
    canValidateCurrentActivity && activityEditablePaths.length > 0;
  const isPathInsideCurrentWorkspace = useCallback(
    (path: string): boolean => {
      const normalizedPath = normalizeFsPath(path);

      return (
        Boolean(activityWorkspaceRoot) &&
        (normalizedPath === activityWorkspaceRoot ||
          normalizedPath.startsWith(`${activityWorkspaceRoot}/`))
      );
    },
    [activityWorkspaceRoot, normalizeFsPath]
  );
  const isEditableActivityPath = useCallback(
    (path: string): boolean => {
      const normalizedPath = normalizeFsPath(path);

      if (!hasWorkspaceEditRestrictions) return true;
      if (!isPathInsideCurrentWorkspace(normalizedPath)) return true;

      return activityEditablePaths.includes(normalizedPath);
    },
    [
      activityEditablePaths,
      hasWorkspaceEditRestrictions,
      isPathInsideCurrentWorkspace,
      normalizeFsPath,
    ]
  );
  const isActiveFileEditable = activeFileUrl
    ? isEditableActivityPath(activeFileUrl)
    : !hasWorkspaceEditRestrictions;
  const canMutateSelectedPath = selectedPath
    ? isEditableActivityPath(selectedPath)
    : !hasWorkspaceEditRestrictions;
  const canCreateEntriesInWorkspace = !hasWorkspaceEditRestrictions;
  const readOnlyActivityMessage = hasWorkspaceEditRestrictions
    ? uiText.readOnlyActivityMessage
    : "";

  useEffect(() => {
    latestUrlRef.current = currentUrl;
  }, [currentUrl]);

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

      setCurrentUrlTargetType("file");

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
        const nextFiles = currentFiles.filter(
          (openFilePath) => openFilePath !== filePath
        );
        const nextActiveFile = nextFiles[nextFiles.length - 1] || "";

        if (filePath === activeFileUrl) {
          setProcessUrl(id, nextActiveFile);
          setSelectedPath(nextActiveFile);
        }

        return nextFiles;
      });
    },
    [activeFileUrl, id, setProcessUrl]
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
    async (
      value: string,
      parentPath: string,
      ignorePath?: string
    ): Promise<string> => {
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

    await Promise.all(
      [...foldersToRefresh].map((folderPath) => loadFolder(folderPath))
    );
  }, [expandedFolders, explorerRoot, loadFolder]);

  useEffect(() => {
    if (!currentUrl) {
      setCurrentUrlTargetType("none");
      return;
    }

    const urlAtRequest = currentUrl;

    lstat(currentUrl)
      .then((stats) => {
        if (latestUrlRef.current !== urlAtRequest) return;

        setCurrentUrlTargetType(stats.isDirectory() ? "directory" : "file");
      })
      .catch(() => {
        if (latestUrlRef.current !== urlAtRequest) return;

        setCurrentUrlTargetType("file");
      });
  }, [currentUrl, lstat]);

  useEffect(() => {
    if (!activeFileUrl) return;

    const normalizedUrl = normalizeFsPath(activeFileUrl);

    setOpenFiles((currentFiles) =>
      currentFiles.includes(normalizedUrl)
        ? currentFiles
        : [...currentFiles, normalizedUrl]
    );
    setSelectedPath(
      (currentSelectedPath) => currentSelectedPath || normalizedUrl
    );
  }, [activeFileUrl, normalizeFsPath]);

  useEffect(() => {
    if (currentUrlTargetType !== "directory" || !currentUrl) return;

    setOpenFiles((currentFiles) =>
      currentFiles.filter((openFilePath) => openFilePath !== currentUrl)
    );
    setSelectedPath((currentSelectedPath) => currentSelectedPath || currentUrl);
  }, [currentUrl, currentUrlTargetType]);

  useEffect(() => {
    setExpandedFolders((curr) =>
      curr.includes(explorerRoot) ? curr : [explorerRoot, ...curr]
    );
    setCreatingParentPath(explorerRoot);
  }, [explorerRoot]);

  useEffect(() => {
    const refreshKey = `${explorerRoot}|${expandedFolders.join("|")}`;

    if (lastExplorerRefreshKeyRef.current === refreshKey) return;

    lastExplorerRefreshKeyRef.current = refreshKey;

    loadEntries().catch(() => {
      // Ignore explorer refresh failures
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explorerRoot, expandedFolders]);

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
        !target.closest(".menu-bar") &&
        !target.closest(".menu-dropdown") &&
        !target.closest(".context-menu")
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

      if (creatingEntry) {
        setCreatingEntry(undefined);
        setNewEntryName("");
        setNewEntryError("");
      }

      if (renamingId) {
        setRenamingId(undefined);
        setDraftName("");
        setRenameError("");
      }
    };

    document.addEventListener("keydown", handleEscClose);

    return () => document.removeEventListener("keydown", handleEscClose);
  }, [creatingEntry, renamingId]);

  const toggleTopMenu = useCallback((menuName: string): void => {
    setActiveMenu((currentMenu) => (currentMenu === menuName ? "" : menuName));
  }, []);

  const startSidebarResize = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      event.stopPropagation();

      const workbench = workbenchRef.current;

      if (!workbench) return;

      const workbenchRect = workbench.getBoundingClientRect();
      const activityBarWidth = 52;
      const splitterWidth = 4;
      const minWidth = 150;
      const maxWidth = Math.max(
        minWidth,
        workbenchRect.width - activityBarWidth - splitterWidth - 260
      );

      const onMouseMove = (moveEvent: MouseEvent): void => {
        const desiredWidth =
          moveEvent.clientX - workbenchRect.left - activityBarWidth;

        setSidePanelWidth(Math.max(minWidth, Math.min(maxWidth, desiredWidth)));
      };
      const onMouseUp = (): void => {
        window.removeEventListener("mousemove", onMouseMove);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp, { once: true });
    },
    []
  );

  useEffect(() => {
    const currentWorkbench = workbenchRef.current;

    if (!currentWorkbench || typeof ResizeObserver === "undefined") return;

    const applyCompactState = (width: number): void => {
      const compact = width < 960;

      setIsCompactLayout((currentCompact) =>
        currentCompact === compact ? currentCompact : compact
      );

      if (compact) {
        setPanelOpen((currentOpen) => (currentOpen ? false : currentOpen));
      }

      if (!compact) {
        const minWidth = 150;
        const maxWidth = Math.max(minWidth, width - 52 - 4 - 260);

        setSidePanelWidth((currentWidth) =>
          Math.max(minWidth, Math.min(maxWidth, currentWidth))
        );
      }
    };

    applyCompactState(currentWorkbench.getBoundingClientRect().width || 0);

    const observer = new ResizeObserver(([entry]) => {
      applyCompactState(entry?.contentRect.width || 0);
    });

    observer.observe(currentWorkbench);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTerminalCwd((currentCwd) => currentCwd || explorerRoot);
  }, [explorerRoot]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      SIDEBAR_WIDTH_STORAGE_KEY,
      `${Math.round(sidePanelWidth)}`
    );
  }, [sidePanelWidth]);

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
    const initialName = basename(renamingId);
    const extensionIndex = initialName.lastIndexOf(".");
    const hasSelectableBaseName = extensionIndex > 0;
    const selectionEnd = hasSelectableBaseName
      ? extensionIndex
      : initialName.length;

    requestAnimationFrame(() => {
      renameInput.focus();
      renameInput.setSelectionRange(0, selectionEnd);
    });
  }, [renamingId]);

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
      const shouldInsertNewEntry =
        creatingEntry && creatingParentPath === folderPath;

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

  const startRename = useCallback(
    (path: string): void => {
      if (!isEditableActivityPath(path)) return;

      setContextMenu(undefined);
      setRenamingId(path);
      setDraftName(basename(path));
      setRenameError("");
    },
    [isEditableActivityPath]
  );

  useEffect(() => {
    if (!renamingId) return;

    requestAnimationFrame(() => {
      const list = folderEntriesRef.current;
      if (!list) return;

      // Buscar el item en el DOM y “revelarlo” aunque esté al final
      const el = list.querySelector<HTMLElement>(`[data-path="${renamingId}"]`);
      el?.scrollIntoView({ block: "center" });
    });
  }, [renamingId]);

  useEffect(() => {
    if (!selectedPath) return;

    requestAnimationFrame(() => {
      const list = folderEntriesRef.current;
      if (!list) return;

      const el = list.querySelector<HTMLElement>(
        `[data-path="${selectedPath}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    });
  }, [selectedPath]);

  const commitNewEntry = useCallback(async (): Promise<void> => {
    if (!creatingEntry) return;
    if (!canCreateEntriesInWorkspace) {
      setCreatingEntry(undefined);
      setNewEntryError(readOnlyActivityMessage);
      return;
    }
    if (createInProgressRef.current) return;

    createInProgressRef.current = true;

    try {
      logExplorer("commitNewEntry", {
        creatingEntry,
        creatingParentPath,
        entriesCount: (folderContents[creatingParentPath] || []).length,
        newEntryName,
      });

      const nameError = await getSiblingNameError(
        newEntryName,
        creatingParentPath
      );

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

        if (creatingEntry === "file") {
          setPendingEditorFocusPath(createdPath);

          const createdContent =
            (
              await readFile(createdPath).catch(() => Buffer.from(""))
            )?.toString() || "";

          setPendingCursorOffset(
            getTemplateCursorOffset(createdPath, createdContent)
          );
        }
      }
    } finally {
      createInProgressRef.current = false;
    }
  }, [
    canCreateEntriesInWorkspace,
    createEntry,
    creatingEntry,
    creatingParentPath,
    folderContents,
    getSiblingNameError,
    logExplorer,
    newEntryName,
    readFile,
    readOnlyActivityMessage,
  ]);
  const deleteSelectedEntry = useCallback(
    async (confirmed = false): Promise<void> => {
      if (!selectedPath) return;
      if (!isEditableActivityPath(selectedPath)) return;

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
    [closeFile, isEditableActivityPath, lstat, rmdir, selectedPath, unlink]
  );

  const commitRename = useCallback(async (): Promise<void> => {
    if (!renamingId) return;
    if (!isEditableActivityPath(renamingId)) {
      setRenamingId(undefined);
      setDraftName("");
      setRenameError("");
      return;
    }
    if (renameInProgressRef.current) return;

    renameInProgressRef.current = true;

    try {
      const parentPath = dirname(renamingId);

      logExplorer("commitRename", {
        draftName,
        entriesCount: (folderContents[parentPath] || []).length,
        parentPath,
        renamingId,
      });

      const nameError = await getSiblingNameError(
        draftName,
        parentPath,
        renamingId
      );

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

      let renameCompleted = false;
      const sourceExists = await exists(renamingId);

      if (!sourceExists && currentUrl === renamingId && currentEditor) {
        await writeFile(nextPath, currentEditor.getValue(), true);
        renameCompleted = true;
      } else {
        renameCompleted = await rename(renamingId, nextPath);
      }

      if (!renameCompleted) {
        try {
          const previousEntryStats = await lstat(renamingId);

          if (previousEntryStats.isDirectory()) {
            setRenameError("Could not rename folder.");
            requestAnimationFrame(() => renameInputRef.current?.focus());
            return;
          }

          const previousContent = await readFile(renamingId);

          await writeFile(nextPath, previousContent, true);
          await unlink(renamingId);
          renameCompleted = true;
        } catch {
          const [oldExists, newExists] = await Promise.all([
            exists(renamingId),
            exists(nextPath),
          ]);

          if (newExists) {
            if (oldExists) {
              await unlink(renamingId).catch(() => {
                // Ignore cleanup failures for stale source path
              });
            }

            renameCompleted = true;
          }
        }
      }

      if (!renameCompleted) {
        setRenameError("Could not rename entry.");
        requestAnimationFrame(() => renameInputRef.current?.focus());
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
    } finally {
      renameInProgressRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentEditor,
    currentUrl,
    draftName,
    exists,
    folderContents,
    getSiblingNameError,
    id,
    isEditableActivityPath,
    lstat,
    logExplorer,
    normalizeFsPath,
    readFile,
    rename,
    renamingId,
    selectedPath,
    unlink,
    writeFile,
  ]);
  const moveEntry = useCallback(
    async (sourcePath: string, targetDirectoryPath: string): Promise<void> => {
      const normalizedSourcePath = normalizeFsPath(sourcePath);
      const normalizedTargetDirectoryPath =
        normalizeFsPath(targetDirectoryPath);

      if (!normalizedSourcePath || !normalizedTargetDirectoryPath) return;
      if (
        !isEditableActivityPath(normalizedSourcePath) ||
        !isEditableActivityPath(normalizedTargetDirectoryPath)
      ) {
        return;
      }
      if (normalizedSourcePath === normalizedTargetDirectoryPath) return;

      const sourceName = basename(normalizedSourcePath);
      const nextPath = normalizeFsPath(
        `${normalizedTargetDirectoryPath}/${sourceName}`
      );

      if (nextPath === normalizedSourcePath) return;
      if (
        normalizedTargetDirectoryPath === normalizedSourcePath ||
        normalizedTargetDirectoryPath.startsWith(`${normalizedSourcePath}/`)
      ) {
        return;
      }

      try {
        const sourceStats = await lstat(normalizedSourcePath);
        const targetStats = await lstat(normalizedTargetDirectoryPath);

        if (!targetStats.isDirectory()) return;

        let moved = await rename(normalizedSourcePath, nextPath);

        if (!moved && !sourceStats.isDirectory()) {
          const sourceContent = await readFile(normalizedSourcePath);

          await writeFile(nextPath, sourceContent, true);
          await unlink(normalizedSourcePath);
          moved = true;
        }

        if (!moved) return;

        setOpenFiles((currentFiles) =>
          currentFiles.map((openFilePath) =>
            openFilePath === normalizedSourcePath ? nextPath : openFilePath
          )
        );

        if (selectedPath === normalizedSourcePath) {
          setSelectedPath(nextPath);
        }

        if (currentUrl === normalizedSourcePath) {
          setProcessUrl(id, nextPath);
        }

        setExpandedFolders((currentFolders) =>
          currentFolders.includes(normalizedTargetDirectoryPath)
            ? currentFolders
            : [...currentFolders, normalizedTargetDirectoryPath]
        );

        await loadEntries();
      } catch (error) {
        console.error("Could not move entry:", error);
      }
    },
    [
      currentUrl,
      id,
      isEditableActivityPath,
      loadEntries,
      lstat,
      normalizeFsPath,
      readFile,
      rename,
      selectedPath,
      setProcessUrl,
      unlink,
      writeFile,
    ]
  );

  const snapshotDirectory = useCallback(
    async (sourceRoot: string, targetRoot: string): Promise<void> => {
      await mkdirRecursive(targetRoot);

      const sourceEntries = await readFolderEntries(sourceRoot);

      await Promise.all(
        sourceEntries.map(async ({ isDirectory, name }) => {
          const sourcePath = normalizeFsPath(`${sourceRoot}/${name}`);
          const targetPath = normalizeFsPath(`${targetRoot}/${name}`);

          if (isDirectory) {
            await snapshotDirectory(sourcePath, targetPath);
            return;
          }

          const fileContent = await readFile(sourcePath);

          await writeFile(targetPath, fileContent, true);
        })
      );
    },
    [mkdirRecursive, normalizeFsPath, readFile, readFolderEntries, writeFile]
  );
  const saveCurrentFile = useCallback(async (): Promise<void> => {
    const [saveUrl, saveData] = getSaveFileInfo(currentUrl, currentEditor);

    if (saveUrl && !isEditableActivityPath(saveUrl)) {
      return;
    }

    if (saveUrl && saveData) {
      await writeFile(saveUrl, saveData, true);
      updateFolder(dirname(saveUrl), basename(saveUrl));
      await loadEntries();
      trackActivityEvent({
        content: saveData.toString(),
        path: saveUrl,
        type: "fileSaved",
      });
    }
  }, [
    currentEditor,
    currentUrl,
    isEditableActivityPath,
    loadEntries,
    updateFolder,
    writeFile,
  ]);

  const openSaveAsDialog = useCallback((): void => {
    const suggestedName = basename(currentUrl || DEFAULT_TEXT_FILE_SAVE_PATH);

    setSaveAsPath(suggestedName);
    setSaveAsError("");
    setIsSaveAsOpen(true);
    setContextMenu(undefined);
  }, [currentUrl]);

  const saveCurrentFileAs = useCallback(async (): Promise<void> => {
    if (!currentEditor) {
      setSaveAsError("No active editor to save.");
      return;
    }

    const trimmedPath = saveAsPath.trim();

    if (!trimmedPath) {
      setSaveAsError("File name cannot be empty.");
      requestAnimationFrame(() => saveAsInputRef.current?.focus());
      return;
    }

    const targetPath = normalizeFsPath(
      trimmedPath.startsWith("/")
        ? trimmedPath
        : `${explorerRoot}/${trimmedPath}`
    );

    if (!isEditableActivityPath(targetPath)) {
      setSaveAsError(readOnlyActivityMessage || "This path is read-only.");
      requestAnimationFrame(() => saveAsInputRef.current?.focus());
      return;
    }

    const nextName = basename(targetPath);

    if (!nextName || INVALID_ENTRY_NAME.test(nextName)) {
      setSaveAsError(String.raw`Invalid characters: \\/:*?"<>|`);
      requestAnimationFrame(() => saveAsInputRef.current?.focus());
      return;
    }

    await writeFile(targetPath, currentEditor.getValue(), true);
    updateFolder(dirname(targetPath), basename(targetPath));
    await loadEntries();
    setOpenFiles((currentFiles) =>
      currentFiles.includes(targetPath)
        ? currentFiles
        : [...currentFiles, targetPath]
    );
    setProcessUrl(id, targetPath);
    setSelectedPath(targetPath);
    setIsSaveAsOpen(false);
    setSaveAsPath("");
    setSaveAsError("");
    trackActivityEvent({
      content: currentEditor.getValue(),
      path: targetPath,
      type: "fileSaved",
    });
  }, [
    currentEditor,
    explorerRoot,
    id,
    isEditableActivityPath,
    loadEntries,
    normalizeFsPath,
    readOnlyActivityMessage,
    saveAsPath,
    setProcessUrl,
    updateFolder,
    writeFile,
  ]);

  const resolveTerminalPath = useCallback(
    (inputPath: string, basePath: string): string => {
      const normalizedInput = inputPath.trim().replace(/\\/g, "/");
      const isAbsolute = normalizedInput.startsWith("/");
      const sourcePath = isAbsolute
        ? normalizedInput
        : normalizeFsPath(`${basePath}/${normalizedInput}`);
      const segments = sourcePath.split("/");
      const resolvedSegments: string[] = [];

      segments.forEach((segment) => {
        if (!segment || segment === ".") return;
        if (segment === "..") {
          resolvedSegments.pop();
          return;
        }

        resolvedSegments.push(segment);
      });

      return `/${resolvedSegments.join("/")}`.replace(/\/+/g, "/") || "/";
    },
    [normalizeFsPath]
  );

  const runTerminalCommand = useCallback(
    async (value: string): Promise<void> => {
      const command = value.trim();

      if (!command) {
        return;
      }

      trackActivityEvent({
        command,
        cwd: terminalCwd,
        type: "commandExecuted",
      });

      if (command === "clear") {
        setTerminalHistory([]);
        setTerminalInput("");
        return;
      }

      const nextLines = [`$ ${command}`];
      const [instruction = "", ...args] = parseCommand(command);

      if (command === "help") {
        nextLines.push(
          "Available commands: help, pwd, ls, cd, mkdir, touch, cat, echo, clear, git, pages"
        );
      } else if (command === "pwd") {
        nextLines.push(terminalCwd);
      } else if (instruction === "ls") {
        const listingPath = args[0]
          ? resolveTerminalPath(args[0], terminalCwd)
          : terminalCwd;

        try {
          const listingStat = await lstat(listingPath);

          if (listingStat.isDirectory()) {
            const visibleEntries = await readFolderEntries(listingPath);

            nextLines.push(
              visibleEntries.length > 0
                ? visibleEntries.map(({ name }) => name).join("  ")
                : "(empty)"
            );
          } else {
            nextLines.push(`ls: ${args[0] || listingPath}: Not a directory`);
          }
        } catch {
          nextLines.push(
            `ls: ${args[0] || listingPath}: No such file or directory`
          );
        }
      } else if (instruction === "cd") {
        const targetPath = args[0]
          ? resolveTerminalPath(args[0], terminalCwd)
          : explorerRoot;

        try {
          const targetStat = await lstat(targetPath);

          if (targetStat.isDirectory()) {
            setTerminalCwd(targetPath);
          } else {
            nextLines.push(`cd: ${args[0]}: Not a directory`);
          }
        } catch {
          nextLines.push(
            `cd: ${args[0] || targetPath}: No such file or directory`
          );
        }
      } else if (instruction === "mkdir") {
        if (args[0]) {
          const targetPath = resolveTerminalPath(args[0], terminalCwd);

          try {
            await mkdir(targetPath);
            await loadFolder(dirname(targetPath));
            await loadEntries();
          } catch {
            nextLines.push(`mkdir: cannot create directory '${args[0]}'`);
          }
        } else {
          nextLines.push("mkdir: missing operand");
        }
      } else if (instruction === "touch") {
        if (args.length === 0) {
          nextLines.push("touch: missing file operand");
        } else {
          for (const target of args) {
            const targetPath = resolveTerminalPath(target, terminalCwd);

            try {
              await writeFile(targetPath, "", true);
              await loadFolder(dirname(targetPath));
              trackActivityEvent({ path: targetPath, type: "fileSaved" });
            } catch {
              nextLines.push(`touch: cannot touch '${target}'`);
            }
          }

          await loadEntries();
        }
      } else if (instruction === "cat") {
        if (args[0]) {
          const targetPath = resolveTerminalPath(args[0], terminalCwd);

          try {
            const targetStat = await lstat(targetPath);

            if (targetStat.isDirectory()) {
              nextLines.push(`cat: ${args[0]}: Is a directory`);
            } else {
              const content = (await readFile(targetPath)).toString();

              nextLines.push(content || "");
            }
          } catch {
            nextLines.push(`cat: ${args[0]}: No such file or directory`);
          }
        } else {
          nextLines.push("cat: missing file operand");
        }
      } else if (instruction === "echo") {
        nextLines.push(args.join(" "));
      } else if (instruction === "git") {
        const gitSubCommand = args[0] || "";

        if (!gitSubCommand) {
          nextLines.push("usage: git <command> [options]");
        } else if (gitSubCommand === "config") {
          const scope = args[1] || "";
          const key = args[2] || "";
          const configValue = args.slice(3).join(" ");

          if (scope !== "--global") {
            nextLines.push(
              "Only git config --global is supported in this terminal."
            );
          } else if (!key || !configValue) {
            nextLines.push(
              "usage: git config --global user.name|user.email <value>"
            );
          } else if (key !== "user.name" && key !== "user.email") {
            nextLines.push("Supported keys: user.name, user.email");
          } else {
            try {
              const currentConfig = JSON.parse(
                window.localStorage.getItem(GIT_CONFIG_KEY) || "{}"
              ) as { userEmail?: string; userName?: string };

              const nextConfig = {
                ...currentConfig,
                ...(key === "user.name"
                  ? { userName: configValue }
                  : { userEmail: configValue }),
              };

              window.localStorage.setItem(
                GIT_CONFIG_KEY,
                JSON.stringify(nextConfig)
              );
              nextLines.push(`Set global ${key} to '${configValue}'`);
            } catch {
              nextLines.push("Failed to save git config in local storage.");
            }
          }
        } else if (fs) {
          await processGit(
            args,
            terminalCwd,
            (message) => nextLines.push(message),
            fs,
            (folder) => {
              updateFolder(folder).catch(() => {
                // Ignore updateFolder failures triggered by git side effects.
              });
            }
          );

          if (gitSubCommand === "push") {
            const publishedSites = getPublishedSitesBySourceRoot(terminalCwd);

            if (publishedSites.length > 0) {
              await Promise.all(
                publishedSites.map(async (site) => {
                  await snapshotDirectory(site.sourceRoot, site.snapshotRoot);
                  updatePublishedSite(site.publicUrl, {
                    snapshotRoot: site.snapshotRoot,
                    sourceRoot: site.sourceRoot,
                  });
                })
              );
              nextLines.push("Pages updated from latest push.");
            }
          }

          await loadEntries();
        } else {
          nextLines.push("git is not available: file system not ready");
        }
      } else if (instruction === "pages") {
        const pagesSubCommand = args[0] || "";

        if (pagesSubCommand !== "publish") {
          nextLines.push("usage: pages publish [project-name]");
        } else {
          const sourceRoot = terminalCwd || explorerRoot;
          const inferredProjectName =
            args.slice(1).join(" ").trim() ||
            basename(sourceRoot) ||
            "mi-proyecto";
          const snapshotRoot = normalizeFsPath(
            `/Users/Public/Pages/${inferredProjectName}-${Date.now()}`
          );

          try {
            const sourceStats = await lstat(sourceRoot);

            if (!sourceStats.isDirectory()) {
              nextLines.push(
                "pages publish must be run from a project folder."
              );
            } else {
              await snapshotDirectory(sourceRoot, snapshotRoot);

              const publishedSite = registerPublishedSite({
                projectName: inferredProjectName,
                snapshotRoot,
                sourceRoot,
                username: getPagesUsername(),
              });

              trackActivityEvent({
                type: "pagesPublished",
                url: publishedSite.publicUrl,
              });
              nextLines.push("Pages published successfully.");
              nextLines.push(`Public URL: ${publishedSite.publicUrl}`);
              openProcess("Browser", { url: publishedSite.publicUrl });
            }
          } catch (error) {
            nextLines.push(
              `pages publish failed: ${(error as Error)?.message || "unknown error"}`
            );
          }
        }
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
    [
      explorerRoot,
      openProcess,
      loadEntries,
      loadFolder,
      fs,
      lstat,
      mkdir,
      readFile,
      readFolderEntries,
      resolveTerminalPath,
      snapshotDirectory,
      terminalCwd,
      updateFolder,
      writeFile,
      normalizeFsPath,
    ]
  );

  const runMenuAction = useCallback(
    async (menuAction: string): Promise<void> => {
      setActiveMenu("");

      if (menuAction === "new-file") {
        if (!canCreateEntriesInWorkspace) return;
        setPanelOpen(true);
        setActiveView("explorer");
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
        if (!canCreateEntriesInWorkspace) return;
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
        let virtualWorkspacePath = normalizeFsPath(
          selectedPath || DESKTOP_PATH || "/Users/Documents"
        );

        try {
          const selectedStats = await lstat(virtualWorkspacePath);

          if (!selectedStats.isDirectory()) {
            virtualWorkspacePath = normalizeFsPath(
              dirname(virtualWorkspacePath)
            );
          }
        } catch {
          virtualWorkspacePath = normalizeFsPath(
            DESKTOP_PATH || "/Users/Documents"
          );
        }

        await loadFolder(virtualWorkspacePath);
        setProcessUrl(id, virtualWorkspacePath);
        setPanelOpen(true);
        setActiveView("explorer");
        setSelectedPath(virtualWorkspacePath);
        setTerminalCwd(virtualWorkspacePath);
        setExpandedFolders((currentFolders) =>
          currentFolders.includes(virtualWorkspacePath)
            ? currentFolders
            : [virtualWorkspacePath, ...currentFolders]
        );
        return;
      }

      if (menuAction === "save") {
        await saveCurrentFile();
        return;
      }

      if (menuAction === "save-as") {
        if (!isActiveFileEditable) return;
        openSaveAsDialog();
        return;
      }

      if (menuAction === "delete") {
        await deleteSelectedEntry();
        return;
      }

      if (menuAction === "rename") {
        if (selectedPath) {
          startRename(selectedPath);
        }

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

      if (menuAction === "reset-sidebar-width") {
        setSidePanelWidth(DEFAULT_SIDEBAR_WIDTH);
        return;
      }

      if (menuAction === "toggle-terminal") {
        setIsTerminalPanelOpen((currentOpen) => !currentOpen);
        return;
      }

      if (menuAction === "validate-activity") {
        if (!canValidateCurrentActivity || !currentActivityId) return;

        const validationOutput = validateActivity(currentActivityId);

        setActivityValidationState({
          activityId: currentActivityId,
          completed: validationOutput.completed,
          progress: validationOutput.progress,
          results: validationOutput.results,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentEditor,
      currentActivityId,
      canValidateCurrentActivity,
      canCreateEntriesInWorkspace,
      deleteSelectedEntry,
      folderContents,
      id,
      isActiveFileEditable,
      isCompactLayout,
      loadFolder,
      logExplorer,
      normalizeFsPath,
      openSaveAsDialog,
      resolveTargetFolder,
      saveCurrentFile,
      selectedPath,
      setProcessUrl,
      startRename,
    ]
  );

  useEffect(() => {
    const handleWorkbenchShortcuts = (event: KeyboardEvent): void => {
      const keyboardTarget = event.target as HTMLElement | null;
      const isTextInputTarget =
        keyboardTarget?.tagName === "INPUT" ||
        keyboardTarget?.tagName === "TEXTAREA" ||
        keyboardTarget?.isContentEditable;
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (isCtrlOrMeta && event.shiftKey && event.key.toLowerCase() === "s") {
        if (!isActiveFileEditable) return;
        event.preventDefault();
        openSaveAsDialog();
        return;
      }

      if (isCtrlOrMeta && !event.shiftKey && event.key.toLowerCase() === "w") {
        event.preventDefault();
        closeFile(activeFileUrl);
        return;
      }

      if (event.key === "F2" && selectedPath) {
        if (!isEditableActivityPath(selectedPath)) return;
        event.preventDefault();
        startRename(selectedPath);
        return;
      }

      if (event.key === "Delete" && selectedPath && !isTextInputTarget) {
        if (!isEditableActivityPath(selectedPath)) return;
        event.preventDefault();
        runMenuAction("delete").catch(() => {
          // Ignore delete shortcut errors
        });
      }
    };

    document.addEventListener("keydown", handleWorkbenchShortcuts);

    return () =>
      document.removeEventListener("keydown", handleWorkbenchShortcuts);
  }, [
    activeFileUrl,
    closeFile,
    isActiveFileEditable,
    isEditableActivityPath,
    openSaveAsDialog,
    runMenuAction,
    selectedPath,
    startRename,
  ]);

  useEffect(() => {
    if (!isSaveAsOpen) return;

    requestAnimationFrame(() => {
      const input = saveAsInputRef.current;

      input?.focus();
      input?.select();
    });
  }, [isSaveAsOpen]);

  useEffect(() => {
    if (selectedPath) return;

    const initialSelection =
      openFiles[openFiles.length - 1] ||
      (currentUrlTargetType === "directory" ? currentUrl : activeFileUrl);

    setSelectedPath(initialSelection);
  }, [
    activeFileUrl,
    currentUrl,
    currentUrlTargetType,
    openFiles,
    selectedPath,
  ]);

  useEffect(() => {
    if (!currentEditor) return;

    const frameId = requestAnimationFrame(() => {
      currentEditor.layout();
    });

    return () => cancelAnimationFrame(frameId);
  }, [currentEditor, isTerminalPanelOpen, panelOpen]);

  useEffect(() => {
    if (!currentEditor) return;
    currentEditor.updateOptions({
      domReadOnly: !isActiveFileEditable,
      readOnly: !isActiveFileEditable,
    });
  }, [currentEditor, isActiveFileEditable]);

  useEffect(() => {
    if (!currentEditor) return;
    if (creatingEntry || renamingId) return;

    const frameId = requestAnimationFrame(() => {
      currentEditor.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [creatingEntry, currentEditor, renamingId]);

  useEffect(() => {
    if (!pendingEditorFocusPath) return;
    if (creatingEntry) return;
    if (!currentEditor) return;
    if (activeFileUrl !== pendingEditorFocusPath) return;

    const frameId = requestAnimationFrame(() => {
      currentEditor.updateOptions({
        domReadOnly: !isActiveFileEditable,
        readOnly: !isActiveFileEditable,
      });
      currentEditor.focus();

      const model = currentEditor.getModel();

      if (model && typeof pendingCursorOffset === "number") {
        const position = model.getPositionAt(
          Math.max(0, Math.min(pendingCursorOffset, model.getValueLength()))
        );

        currentEditor.setPosition(position);
        currentEditor.revealPositionInCenterIfOutsideViewport(position);
      }

      setPendingEditorFocusPath("");
      setPendingCursorOffset(undefined);
    });

    return () => cancelAnimationFrame(frameId);
  }, [
    creatingEntry,
    currentEditor,
    activeFileUrl,
    isActiveFileEditable,
    pendingCursorOffset,
    pendingEditorFocusPath,
  ]);

  return (
    <AppContainer
      StyledComponent={StyledMonacoEditor}
      id={id}
      useHook={useMonaco}
    >
      <div
        className={`editor-shell ${isTerminalPanelOpen ? "terminal-open" : ""}`}
        data-tour="monaco-shell"
      >
        <div
          ref={workbenchRef}
          className={`workbench ${panelOpen ? "panel-open" : "panel-closed"} ${
            isCompactLayout ? "compact-layout" : ""
          }`}
          data-tour="monaco-workbench"
          style={{ ["--side-panel-width" as string]: `${sidePanelWidth}px` }}
        >
          <header className="menu-bar">
            <ol>
              <li>
                <button
                  className={activeMenu === "file" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("file");
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  File
                </button>
                {activeMenu === "file" && (
                  <menu className="menu-dropdown">
                    <li>
                      <button
                        disabled={!canCreateEntriesInWorkspace}
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-file");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        New File
                      </button>
                    </li>
                    <li>
                      <button
                        disabled={!canCreateEntriesInWorkspace}
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-folder");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        New Folder
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("open-folder");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Open Folder
                      </button>
                    </li>
                    <li>
                      <button
                        disabled={!isActiveFileEditable}
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("save");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Save
                      </button>
                    </li>
                    <li>
                      <button
                        disabled={!isActiveFileEditable}
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("save-as");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Save As...
                      </button>
                    </li>
                    <li>
                      <button
                        disabled={!canMutateSelectedPath}
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("delete");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Delete Selected
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("refresh");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Refresh Explorer
                      </button>
                    </li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "edit" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("edit");
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  Edit
                </button>
                {activeMenu === "edit" && (
                  <menu className="menu-dropdown">
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("palette");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Command Palette
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("format");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Format Document
                      </button>
                    </li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "view" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("view");
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  View
                </button>
                {activeMenu === "view" && (
                  <menu className="menu-dropdown">
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("toggle-sidebar");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Toggle Side Bar
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("reset-sidebar-width");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Reset Sidebar Width
                      </button>
                    </li>
                  </menu>
                )}
              </li>
              <li>
                <button
                  className={activeMenu === "terminal" ? "active" : ""}
                  data-tour="monaco-terminal-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopMenu("terminal");
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  Terminal
                </button>
                {activeMenu === "terminal" && (
                  <menu className="menu-dropdown">
                    <li>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("toggle-terminal");
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                      >
                        Toggle Terminal
                      </button>
                    </li>
                  </menu>
                )}
              </li>
              {canValidateCurrentActivity && (
                <li className="validate-item">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void runMenuAction("validate-activity");
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    type="button"
                  >
                    Validar
                  </button>
                </li>
              )}
            </ol>
          </header>
          {activityValidationState && (
            <section className="validation-panel">
              <header>
                <strong>Validacion</strong>
                <span>
                  {activityValidationState.progress.completed}/
                  {activityValidationState.progress.total}
                </span>
                <button
                  onClick={() => setActivityValidationState(undefined)}
                  type="button"
                >
                  Cerrar
                </button>
              </header>
              <ol>
                {activityValidationState.results.map((result) => (
                  <li
                    key={result.checkId}
                    className={result.passed ? "passed" : "failed"}
                  >
                    {result.message}
                  </li>
                ))}
              </ol>
            </section>
          )}
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
              🗂
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
              🔍
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

          {panelOpen && !isCompactLayout && (
            <aside className="side-panel" data-tour="monaco-explorer-panel">
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
                        disabled={!canCreateEntriesInWorkspace}
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-file");
                        }}
                        title="New File"
                        type="button"
                      >
                        <NoteAddRoundedIcon fontSize="small" />
                      </button>
                      <button
                        className="icon-action"
                        disabled={!canCreateEntriesInWorkspace}
                        onClick={(e) => {
                          e.stopPropagation();
                          runMenuAction("new-folder");
                        }}
                        title="New Folder"
                        type="button"
                      >
                        <CreateNewFolderRoundedIcon fontSize="small" />
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {activeView === "explorer" && (
                <>
                  <p className="section-title">Open Editors</p>
                  <ol className="open-editors">
                    {openFiles.map((openFilePath) => {
                      if (renamingId === openFilePath) {
                        return (
                          <li
                            key={openFilePath}
                            className="entry-editing"
                            data-path={openFilePath}
                          >
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
                                onKeyDown={(event) => {
                                  event.stopPropagation();

                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    commitRename();
                                  } else if (event.key === "Escape") {
                                    setRenamingId(undefined);
                                    setDraftName("");
                                    setRenameError("");
                                  }
                                }}
                                type="text"
                                value={draftName}
                              />
                              {renameError && (
                                <span className="entry-error">
                                  {renameError}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li key={openFilePath}>
                          <button
                            className={
                              openFilePath === activeFileUrl ? "active" : ""
                            }
                            onClick={() => openFile(openFilePath)}
                            onContextMenu={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setSelectedPath(openFilePath);
                              setContextMenu({
                                directoryPath: normalizeFsPath(
                                  dirname(openFilePath)
                                ),
                                targetIsDirectory: false,
                                targetPath: openFilePath,
                                x: event.clientX,
                                y: event.clientY,
                              });
                            }}
                            title={openFilePath}
                            type="button"
                          >
                            <span className="file-icon">
                              {getEntryIcon(basename(openFilePath), false)}
                            </span>
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
                      );
                    })}
                  </ol>
                  <p className="section-title">Folder</p>
                  <p className="folder-title">
                    {basename(explorerRoot) || "Root"}
                  </p>
                  <ol
                    ref={folderEntriesRef}
                    className="folder-entries"
                    onDragLeave={() => {
                      setDragOverPath("");
                    }}
                    onDragOver={(event) => {
                      if (!draggedPath || !canCreateEntriesInWorkspace) return;

                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      const sourcePath =
                        event.dataTransfer.getData("text/plain") || draggedPath;

                      setDraggedPath("");
                      setDragOverPath("");

                      if (sourcePath && canCreateEntriesInWorkspace) {
                        void moveEntry(sourcePath, explorerRoot);
                      }
                    }}
                    onContextMenu={(event) => {
                      const target = event.target as HTMLElement;
                      const clickedEntry = target.closest("li[data-path]");

                      if (clickedEntry) {
                        return;
                      }

                      event.preventDefault();
                      setContextMenu({
                        directoryPath: explorerRoot,
                        targetIsDirectory: true,
                        x: event.clientX,
                        y: event.clientY,
                      });
                    }}
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
                                  {getEntryIcon(name, isDirectory)}
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
                                      setNewEntryName(
                                        event.currentTarget.value
                                      );
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
                                        ? uiText.folderNamePlaceholder
                                        : uiText.fileNamePlaceholder
                                    }
                                    type="text"
                                    value={newEntryName}
                                    autoFocus
                                  />
                                  {newEntryError && (
                                    <span className="entry-error">
                                      {newEntryError}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        }

                        const itemPath = path;
                        const isExpandedFolder =
                          isDirectory && expandedFolders.includes(itemPath);
                        const isActive =
                          !isDirectory && itemPath === activeFileUrl;

                        if (
                          renamingId === itemPath &&
                          !openFiles.includes(itemPath)
                        ) {
                          return (
                            <li
                              key={itemId}
                              className="entry-editing"
                              data-path={itemPath}
                            >
                              <div
                                className="entry-editor-row"
                                style={{ paddingLeft: explorerPadding }}
                              >
                                <span className="entry-icon">
                                  {getEntryIcon(name, isDirectory)}
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
                                    <span className="entry-error">
                                      {renameError}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        }

                        return (
                          <li
                            key={itemId}
                            className={
                              dragOverPath === itemPath && isDirectory
                                ? "drag-over"
                                : ""
                            }
                            data-path={itemPath}
                            draggable={
                              !isNew && isEditableActivityPath(itemPath)
                            }
                            onDragEnd={() => {
                              setDraggedPath("");
                              setDragOverPath("");
                            }}
                            onDragOver={(event) => {
                              if (
                                !isDirectory ||
                                !draggedPath ||
                                draggedPath === itemPath ||
                                !isEditableActivityPath(itemPath)
                              ) {
                                return;
                              }

                              event.preventDefault();
                              event.stopPropagation();
                              event.dataTransfer.dropEffect = "move";
                              setDragOverPath(itemPath);
                            }}
                            onDragStart={(event) => {
                              if (!isEditableActivityPath(itemPath)) {
                                event.preventDefault();
                                return;
                              }
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData(
                                "text/plain",
                                itemPath
                              );
                              setDraggedPath(itemPath);
                              setSelectedPath(itemPath);
                            }}
                            onDragLeave={() => {
                              if (dragOverPath === itemPath) {
                                setDragOverPath("");
                              }
                            }}
                            onDrop={(event) => {
                              if (!isDirectory) {
                                return;
                              }
                              if (!isEditableActivityPath(itemPath)) {
                                return;
                              }

                              event.preventDefault();
                              event.stopPropagation();
                              const sourcePath =
                                event.dataTransfer.getData("text/plain") ||
                                draggedPath;

                              setDraggedPath("");
                              setDragOverPath("");

                              if (sourcePath) {
                                void moveEntry(sourcePath, itemPath);
                              }
                            }}
                          >
                            <button
                              className={
                                isActive || selectedPath === itemPath
                                  ? "active"
                                  : ""
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
                                setContextMenu({
                                  directoryPath: isDirectory
                                    ? itemPath
                                    : normalizeFsPath(dirname(itemPath)),
                                  targetIsDirectory: isDirectory,
                                  targetPath: itemPath,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              style={{ paddingLeft: explorerPadding }}
                              title={itemPath}
                              type="button"
                            >
                              <span>
                                {isDirectory
                                  ? isExpandedFolder
                                    ? "▾"
                                    : "▸"
                                  : "•"}
                              </span>
                              <span className="entry-icon">
                                {getEntryIcon(name, isDirectory)}
                              </span>
                              <span className="entry-label">{name}</span>
                            </button>
                          </li>
                        );
                      }
                    )}
                  </ol>
                </>
              )}

              {activeView === "search" && (
                <p className="placeholder">{uiText.searchPlaceholder}</p>
              )}

              {activeView === "git" && (
                <p className="placeholder">{uiText.sourceControlPlaceholder}</p>
              )}

              {confirmDelete && (
                <>
                  <button
                    aria-label={uiText.closeDeleteConfirmation}
                    className="modal-backdrop"
                    onClick={() => setConfirmDelete(undefined)}
                    type="button"
                  />
                  <div className="confirm-dialog">
                    <p className="confirm-message">
                      {uiText.deleteEntry(basename(confirmDelete))}
                    </p>
                    <div className="confirm-actions">
                      <button
                        className="dialog-action"
                        onClick={() => setConfirmDelete(undefined)}
                        type="button"
                      >
                        {uiText.cancel}
                      </button>
                      <button
                        className="dialog-action danger"
                        onClick={() => deleteSelectedEntry(true)}
                        type="button"
                      >
                        {uiText.delete}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {isSaveAsOpen && (
                <>
                  <button
                    aria-label={uiText.closeSaveAsDialog}
                    className="modal-backdrop"
                    onClick={() => {
                      setIsSaveAsOpen(false);
                      setSaveAsError("");
                    }}
                    type="button"
                  />
                  <div
                    aria-modal="true"
                    className="save-as-dialog"
                    role="dialog"
                  >
                    <p className="save-as-title">{uiText.saveAs}</p>
                    <p className="save-as-subtitle">
                      {uiText.saveAsSubtitle(explorerRoot)}
                    </p>
                    <input
                      ref={saveAsInputRef}
                      className="save-as-input"
                      id="save-as-path-input"
                      onChange={(event) => {
                        setSaveAsPath(event.currentTarget.value);
                        if (saveAsError) {
                          setSaveAsError("");
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void saveCurrentFileAs();
                        } else if (event.key === "Escape") {
                          setIsSaveAsOpen(false);
                          setSaveAsError("");
                        }
                      }}
                      placeholder={uiText.saveAsPathPlaceholder}
                      type="text"
                      value={saveAsPath}
                    />
                    {saveAsError && (
                      <p className="save-as-error">{saveAsError}</p>
                    )}
                    <div className="save-as-actions">
                      <button
                        className="dialog-action"
                        onClick={() => {
                          setIsSaveAsOpen(false);
                          setSaveAsError("");
                        }}
                        type="button"
                      >
                        {uiText.cancel}
                      </button>
                      <button
                        className="dialog-action primary"
                        onClick={() => {
                          void saveCurrentFileAs();
                        }}
                        type="button"
                      >
                        Save
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
                  {contextMenu.targetIsDirectory && (
                    <>
                      <button
                        className="context-menu-action"
                        disabled={!canCreateEntriesInWorkspace}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (contextMenu.directoryPath) {
                            setSelectedPath(contextMenu.directoryPath);
                          }

                          runMenuAction("new-file");
                          setContextMenu(undefined);
                        }}
                        type="button"
                      >
                        New File...
                      </button>
                      <button
                        className="context-menu-action"
                        disabled={!canCreateEntriesInWorkspace}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (contextMenu.directoryPath) {
                            setSelectedPath(contextMenu.directoryPath);
                          }

                          runMenuAction("new-folder");
                          setContextMenu(undefined);
                        }}
                        type="button"
                      >
                        New Folder...
                      </button>
                    </>
                  )}
                  {!contextMenu.targetIsDirectory && contextMenu.targetPath && (
                    <button
                      className="context-menu-action"
                      onClick={(e) => {
                        e.stopPropagation();

                        const targetPath = contextMenu.targetPath as string;
                        const targetName = basename(targetPath).toLowerCase();

                        if (
                          targetName === "index.html" ||
                          targetName === "index.htm"
                        ) {
                          openProcess("Browser", { url: targetPath });
                        } else {
                          openFile(targetPath);
                        }

                        setContextMenu(undefined);
                      }}
                      type="button"
                    >
                      Open
                    </button>
                  )}
                  {contextMenu.targetPath && (
                    <button
                      className="context-menu-action"
                      disabled={!isEditableActivityPath(contextMenu.targetPath)}
                      onClick={(e) => {
                        e.stopPropagation();

                        const targetPath = contextMenu.targetPath as string;

                        setSelectedPath(targetPath);
                        startRename(targetPath);
                        setContextMenu(undefined);
                      }}
                      type="button"
                    >
                      Rename
                    </button>
                  )}
                  {contextMenu.targetPath && (
                    <div className="context-menu-separator" />
                  )}
                  <button
                    className="context-menu-action"
                    disabled={
                      contextMenu.targetPath
                        ? !isEditableActivityPath(contextMenu.targetPath)
                        : !canMutateSelectedPath
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (contextMenu.targetPath) {
                        setSelectedPath(contextMenu.targetPath);
                      }

                      runMenuAction("delete");
                      setContextMenu(undefined);
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                  <button
                    className="context-menu-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      runMenuAction("refresh");
                      setContextMenu(undefined);
                    }}
                    type="button"
                  >
                    Refresh Explorer
                  </button>
                </div>
              )}
            </aside>
          )}

          {panelOpen && !isCompactLayout && (
            <button
              aria-label="Resize Explorer panel"
              className="sidebar-splitter"
              onMouseDown={startSidebarResize}
              type="button"
            />
          )}

          <main className="editor-area" data-tour="monaco-editor-area">
            {hasActiveFile ? (
              <>
                <div className="breadcrumbs">
                  {explorerRoot}
                  {" > "}
                  {basename(activeFileUrl)}
                </div>
                {hasWorkspaceEditRestrictions && (
                  <p className="read-only-hint">
                    {isActiveFileEditable
                      ? "Archivo editable para resolver la actividad."
                      : readOnlyActivityMessage}
                  </p>
                )}
                <header className="tabs">
                  {openFiles.length === 0 && (
                    <span className="empty-tab">No open files</span>
                  )}
                  {openFiles.map((openFilePath) => (
                    <div
                      key={openFilePath}
                      className={`tab ${openFilePath === activeFileUrl ? "active" : ""}`}
                    >
                      <button
                        className="open"
                        onClick={() => openFile(openFilePath)}
                        title={openFilePath}
                        type="button"
                      >
                        <span className="file-icon">
                          {getEntryIcon(basename(openFilePath), false)}
                        </span>
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
                <div
                  className="editor-host"
                  data-monaco-editor-host
                  data-tour="monaco-editor-host"
                />
              </>
            ) : (
              <section aria-label="No file open" className="editor-empty-state">
                <span className="editor-empty-logo">DH</span>
              </section>
            )}
          </main>
        </div>
        {isTerminalPanelOpen && (
          <section
            aria-label="Terminal"
            className="bottom-panel"
            data-tour="monaco-terminal-panel"
          >
            <div className="bottom-panel-header">
              <div className="terminal-tabs" aria-hidden="true">
                <span className="terminal-tab active">TERMINAL</span>
                <span className="terminal-tab">PROBLEMS</span>
                <span className="terminal-tab">OUTPUT</span>
              </div>
              <div className="terminal-toolbar" aria-hidden="true">
                <span className="terminal-shell">powershell</span>
                <span className="terminal-action add">+</span>
                <span className="terminal-action dropdown">⌄</span>
                <span className="terminal-action split">▯</span>
                <span className="terminal-action close">×</span>
              </div>
            </div>
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
                void runTerminalCommand(terminalInput);
              }}
            >
              <span className="terminal-prompt">
                <span className="terminal-cwd">{terminalCwd}</span>
                <span className="terminal-symbol">$</span>
              </span>
              <input
                ref={terminalInputRef}
                className="terminal-input"
                data-tour="monaco-terminal-input"
                onChange={(event) =>
                  setTerminalInput(event.currentTarget.value)
                }
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

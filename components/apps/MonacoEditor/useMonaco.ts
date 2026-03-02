import { basename, dirname } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import loader from "@monaco-editor/loader";
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  URL_DELIMITER,
  config,
  editorOptions,
  theme,
} from "components/apps/MonacoEditor/config";
import {
  detectLanguage,
  getSaveFileInfo,
  relocateShadowRoot,
} from "components/apps/MonacoEditor/functions";
import { registerEmmetSnippets } from "components/apps/MonacoEditor/emmet";
import { type Model } from "components/apps/MonacoEditor/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import {
  DEFAULT_TEXT_FILE_SAVE_PATH,
  MILLISECONDS_IN_SECOND,
} from "utils/constants";
import { getExtension } from "utils/functions";
import { shareGlobal } from "utils/globals";

const useMonaco = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { readFile, updateFolder, writeFile } = useFileSystem();
  const { argument: setArgument } = useProcesses();
  const { prependFileToTitle } = useTitle(id);
  const lastLoadedUrlRef = useRef("");
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>();
  const [monaco, setMonaco] = useState<typeof Monaco>();
  const createModelUri = useCallback(
    (modelUrl: string, instance = 0): Monaco.Uri | undefined => {
      const uriName = `${modelUrl}${URL_DELIMITER}${instance}`;
      const models = monaco?.editor.getModels();

      return models?.some(
        (model) => (model as Model)._associatedResource.path === uriName
      )
        ? createModelUri(modelUrl, instance + 1)
        : monaco?.Uri.parse(uriName);
    },
    [monaco?.Uri, monaco?.editor]
  );
  const registerVsCodeLikeCommands = useCallback(
    (currentEditor: Monaco.editor.IStandaloneCodeEditor): void => {
      if (!monaco) return;

      currentEditor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP,
        () => {
          currentEditor.getAction("editor.action.quickCommand")?.run();
        }
      );

      currentEditor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
        () => {
          currentEditor.getAction("editor.action.quickCommand")?.run();
        }
      );

      currentEditor.addCommand(
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
        () => {
          currentEditor.getAction("editor.action.formatDocument")?.run();
        }
      );

      currentEditor.addAction({
        id: "winsim.toggleWordWrap",
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
        label: "Toggle Word Wrap",
        run: (editorInstance) => {
          const currentWrap = editorInstance.getOption(
            monaco.editor.EditorOption.wordWrap
          );
          const nextWrap = currentWrap === "off" ? "on" : "off";

          editorInstance.updateOptions({ wordWrap: nextWrap });
        },
      });

      currentEditor.addAction({
        id: "winsim.toggleMinimap",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
        label: "Toggle Minimap",
        run: (editorInstance) => {
          const minimapOption = editorInstance.getOption(
            monaco.editor.EditorOption.minimap
          );

          editorInstance.updateOptions({
            minimap: { enabled: !minimapOption.enabled },
          });
        },
      });
    },
    [monaco]
  );
  const createModel = useCallback(async () => {
    let fileContent = "";

    try {
      fileContent = (await readFile(url)).toString();
    } catch {
      fileContent = "";
    }

    const newModel = monaco?.editor.createModel(
      fileContent,
      detectLanguage(getExtension(url)),
      createModelUri(url)
    );

    newModel?.onDidChangeContent(() => prependFileToTitle(basename(url), true));

    return newModel as Monaco.editor.ITextModel;
  }, [createModelUri, monaco?.editor, prependFileToTitle, readFile, url]);
  const loadFile = useCallback(async () => {
    if (!url || lastLoadedUrlRef.current === url) {
      return;
    }

    lastLoadedUrlRef.current = url;

    if (monaco && editor && url.startsWith("/")) {
      const currentModel = editor.getModel();
      const currentModelPath = (currentModel as Model | undefined)?._associatedResource
        ?.path;

      if (currentModelPath?.startsWith(`${url}${URL_DELIMITER}`)) {
        prependFileToTitle(basename(url || DEFAULT_TEXT_FILE_SAVE_PATH));
        return;
      }

      currentModel?.dispose();
      editor.setModel(await createModel());
      editor.updateOptions({
        domReadOnly: false,
        readOnly: false,
      });
      editor.layout();
      editor.focus();
    }

    prependFileToTitle(basename(url || DEFAULT_TEXT_FILE_SAVE_PATH));
  }, [createModel, editor, monaco, prependFileToTitle, url]);

  useEffect(() => {
    if (!monaco) {
      shareGlobal("define", "MonacoEditor", 2.5 * MILLISECONDS_IN_SECOND);
      loader.config(config);
      loader.init().then((monacoInstance) => setMonaco(monacoInstance));
    }
  }, [monaco]);

  useEffect(() => {
    if (!monaco?.languages.typescript?.typescriptDefaults) return;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowJs: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      strict: false,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
    });
  }, [monaco]);

  useEffect(() => {
    if (monaco) {
      registerEmmetSnippets(monaco);
    }
  }, [monaco]);

  useEffect(() => {
    const keydownDisposable = editor?.onKeyDown(async (event) => {
      const { ctrlKey, code, keyCode } = event;

      if (ctrlKey && (code === "KeyS" || (keyCode as number) === 49)) {
        event.preventDefault();

        const [saveUrl, saveData] = getSaveFileInfo(url, editor);

        if (saveUrl && typeof saveData === "string") {
          await writeFile(saveUrl, saveData, true);
          updateFolder(dirname(saveUrl), basename(saveUrl));
          prependFileToTitle(basename(saveUrl));
        }
      }
    });

    return () => keydownDisposable?.dispose();
  }, [editor, prependFileToTitle, updateFolder, url, writeFile]);

  useEffect(() => {
    if (monaco && containerRef.current) {
      const monacoHost = containerRef.current.querySelector<HTMLDivElement>(
        "[data-monaco-editor-host]"
      );
      const currentSection = containerRef.current?.closest("section");
      const currentContainer = containerRef.current;

      if (!monacoHost || editor) return;

      const currentEditor = monaco.editor.create(monacoHost, {
        ...editorOptions,
        theme,
      });
      const handleHostMouseDown = (): void => {
        currentEditor.focus();
      };
      const handleSectionFocus = (): void => {
        currentEditor.focus();
      };

      currentEditor.updateOptions({
        domReadOnly: false,
        readOnly: false,
      });

      monacoHost.addEventListener("mousedown", handleHostMouseDown, {
        passive: true,
      });

      registerVsCodeLikeCommands(currentEditor);

      currentSection?.addEventListener("focus", handleSectionFocus, {
        passive: true,
      });

      currentContainer?.addEventListener("blur", relocateShadowRoot, {
        capture: true,
        passive: true,
      });

      setEditor(currentEditor);
      setArgument(id, "editor", currentEditor);
      setLoading(false);
      requestAnimationFrame(() => {
        currentEditor.layout();
        currentEditor.focus();
      });

      return () => {
        monacoHost.removeEventListener("mousedown", handleHostMouseDown);
        currentSection?.removeEventListener("focus", handleSectionFocus);
        currentContainer?.removeEventListener("blur", relocateShadowRoot, {
          capture: true,
        });
      };
    }

    return undefined;
  }, [
    containerRef,
    id,
    editor,
    monaco,
    registerVsCodeLikeCommands,
    setArgument,
    setLoading,
  ]);

  useEffect(() => {
    if (monaco && editor && url) {
      loadFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, monaco, url]);

  useEffect(
    () => () => {
      editor?.getModel()?.dispose();
      editor?.dispose();
    },
    [editor]
  );
};

export default useMonaco;

import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

export const config = {
  paths: {
    vs: "/Program Files/MonacoEditor/vs",
  },
};

export const theme = "vs-dark";

export const editorOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  bracketPairColorization: {
    enabled: true,
  },
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  folding: true,
  fontFamily:
    "Cascadia Code, Consolas, 'Courier New', Menlo, Monaco, monospace",
  fontLigatures: true,
  fontSize: 14,
  formatOnPaste: true,
  formatOnType: true,
  glyphMargin: true,
  guides: {
    bracketPairs: true,
    indentation: true,
  },
  lineNumbers: "on",
  minimap: {
    enabled: true,
  },
  mouseWheelZoom: true,
  renderLineHighlight: "all",
  renderWhitespace: "selection",
  roundedSelection: false,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  stickyScroll: {
    enabled: true,
  },
  tabSize: 2,
  theme,
  wordWrap: "off",
};

export const customExtensionLanguages: Record<string, string> = {
  ".whtml": ".html",
};

export const URL_DELIMITER = "|";

import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { emmetCSS, emmetHTML, emmetJSX } from "emmet-monaco-es";

type SupportedLocale = "en" | "es" | "pt";

type EmmetLocaleConfig = {
  completionLabel: string;
};

type MonacoDisposable = {
  dispose: () => void;
};

const EMMET_LOCALE_CONFIG: Record<SupportedLocale, EmmetLocaleConfig> = {
  en: {
    completionLabel: "Emmet",
  },
  es: {
    completionLabel: "Emmet",
  },
  pt: {
    completionLabel: "Emmet",
  },
};

let emmetDisposables: MonacoDisposable[] = [];

const toLocale = (locale?: string): SupportedLocale => {
  const baseLocale = locale?.trim().toLowerCase().split("-")[0];

  if (baseLocale === "es" || baseLocale === "pt") {
    return baseLocale;
  }

  return "en";
};

const isDisposable = (value: unknown): value is MonacoDisposable =>
  typeof value === "object" &&
  value !== null &&
  "dispose" in value &&
  typeof Reflect.get(value, "dispose") === "function";

const toDisposables = (value: unknown): MonacoDisposable[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => isDisposable(item));
  }

  if (isDisposable(value)) {
    return [value];
  }

  return [];
};

const disposeEmmetProviders = (): void => {
  emmetDisposables.forEach((disposable) => disposable.dispose());
  emmetDisposables = [];
};

export const getEmmetLocaleConfig = (locale?: string): EmmetLocaleConfig =>
  EMMET_LOCALE_CONFIG[toLocale(locale)];

export const registerEmmetSnippets = (
  monaco: typeof Monaco,
  _locale = "en"
): void => {
  disposeEmmetProviders();

  const htmlProviders = emmetHTML(monaco, ["html"]);
  const cssProviders = emmetCSS(monaco, ["css", "less", "scss"]);
  const jsxProviders = emmetJSX(monaco, [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
  ]);

  emmetDisposables = [
    ...toDisposables(htmlProviders),
    ...toDisposables(cssProviders),
    ...toDisposables(jsxProviders),
  ];
};

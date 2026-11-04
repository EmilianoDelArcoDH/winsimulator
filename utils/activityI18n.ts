import { type SessionLanguage } from "contexts/session/types";
import activityTranslations from "utils/activityTranslations.json";

type CatalogData = Record<string, unknown>;

type ActivityTranslations = Record<
  Exclude<SessionLanguage, "es">,
  Record<string, string>
>;

const ACTIVITY_TRANSLATIONS = activityTranslations as ActivityTranslations;

// Translate learner-facing copy only. Identifiers, paths, answer keys, and
// validation rules must keep the same values in every language.
const TRANSLATABLE_KEYS = new Set([
  "checkboxLabel",
  "content",
  "instructions",
  "label",
  "message",
  "messageFail",
  "messageOk",
  "objective",
  "retryLabel",
  "scenario",
  "submitLabel",
  "text",
  "title",
]);

export const translateActivityText = (
  language: SessionLanguage,
  value: string
): string => {
  if (language === "es") return value;

  // Whole phrases are reviewed together. Word substitution produces mixed
  // languages and can corrupt commands, filenames, and starter code.
  return ACTIVITY_TRANSLATIONS[language]?.[value] ?? value;
};

const localizeValue = (
  language: SessionLanguage,
  value: unknown,
  currentKey?: string
): unknown => {
  if (typeof value === "string") {
    return currentKey && TRANSLATABLE_KEYS.has(currentKey)
      ? translateActivityText(language, value)
      : value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => localizeValue(language, entry, currentKey));
  }

  if (value && typeof value === "object") {
    if (currentKey === "rules" || currentKey === "answerKey") return value;

    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        localizeValue(language, entryValue, key),
      ])
    );
  }

  return value;
};

export const localizeActivitiesCatalog = <T extends CatalogData>(
  catalog: T,
  language: SessionLanguage
): T => {
  if (language === "es") return catalog;

  return localizeValue(language, catalog) as T;
};

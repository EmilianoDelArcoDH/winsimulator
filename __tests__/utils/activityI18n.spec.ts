/* eslint-disable sonarjs/null-dereference -- The recursive walker returns only string leaves. */
import catalog from "utils/activitiesCatalog.json";
import translations from "utils/activityTranslations.json";
import {
  localizeActivitiesCatalog,
  translateActivityText,
} from "utils/activityI18n";

const copyKeys = new Set([
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

type Leaf = { key: string; path: string; value: string };
const leaves = (value: unknown, key = "", path = ""): Leaf[] => {
  if (typeof value === "string") return [{ key, path, value }];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      leaves(entry, key, `${path}.${index}`)
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([name, entry]) =>
      leaves(entry, name, `${path}.${name}`)
    );
  }
  return [];
};
const isCopy = ({ key, path }: Leaf): boolean =>
  copyKeys.has(key) && !/\.(?:rules|answerKey)\./.test(path);

const activityCount = catalog.classes.reduce(
  (count, { activities }) => count + activities.length,
  0
);

const markup = (html: string): string =>
  html
    .replace(/lang="[^"]*"/g, 'lang="LOCALE"')
    .replace(/alt="[^"]*"/g, 'alt="TEXT"')
    .replace(/>[^<>]*</g, "><");

describe.each(["en", "pt"] as const)(
  "complete activity localization: %s",
  (language) => {
    const localized = localizeActivitiesCatalog(catalog, language);
    const dictionary = translations[language] as Record<string, string>;

    test("every learner-facing string across all 34 activities has a reviewed translation", () => {
      expect(activityCount).toBe(34);
      const source = leaves(catalog).filter((leaf) => isCopy(leaf));
      const missing = source.filter(
        ({ value }) => !Object.hasOwn(dictionary, value)
      );
      expect(missing).toEqual([]);
      const translated = new Map(
        leaves(localized).map(({ path, value }) => [path, value])
      );
      source.forEach(({ path, value }) =>
        expect(translated.get(path)).toBe(dictionary[value])
      );
      leaves(catalog)
        .filter(({ key }) => key === "columns")
        .forEach(({ value }) => expect(dictionary[value]).toBeDefined());
    });

    test("preserves identifiers, paths, answer keys, and validation rules", () => {
      expect(leaves(localized).filter((leaf) => !isCopy(leaf))).toEqual(
        leaves(catalog).filter((leaf) => !isCopy(leaf))
      );
      const decision = localized.classes[0].activities[3];
      expect(decision.data).toHaveProperty(
        "required.checkboxId",
        "detectoConflicto"
      );
    });

    test("preserves code syntax and file references in every starter file", () => {
      const entries = leaves(catalog).filter(({ key }) => key === "content");
      entries
        .filter(({ value }) => /^(?:<!doctype html>|<h1>)/.test(value))
        .forEach(({ value }) =>
          expect(markup(translateActivityText(language, value))).toBe(
            markup(value)
          )
        );
      entries
        .filter(({ value }) => /^(?:body|h1|:root)\s*\{/.test(value))
        .forEach(({ value }) =>
          expect(translateActivityText(language, value)).toBe(value)
        );
      entries
        .filter(({ value }) => value.includes("console.log"))
        .forEach(({ value }) => {
          expect(
            translateActivityText(language, value).replace(
              /console\.log\('[^']*'\)/g,
              "console.log('TEXT')"
            )
          ).toBe(
            value.replace(/console\.log\('[^']*'\)/g, "console.log('TEXT')")
          );
        });
    });

    test("keeps commands, repository names, and exercise paths usable", () => {
      expect(translateActivityText(language, "cat styles.css")).toBe(
        "cat styles.css"
      );
      expect(
        translateActivityText(
          language,
          "En la terminal, ejecuta pages publish mi-sitio."
        )
      ).toContain("pages publish mi-sitio");
      expect(
        translateActivityText(
          language,
          "Corrige el href para que apunte a css/estilos.css."
        )
      ).toContain("css/estilos.css");
      expect(
        translateActivityText(
          language,
          "Propone mi-foto-final.png como nombre seguro para la foto."
        )
      ).toContain("mi-foto-final.png");
    });
  }
);

test("Spanish remains unchanged and unknown strings are never partially translated", () => {
  expect(localizeActivitiesCatalog(catalog, "es")).toBe(catalog);
  const unknown = "Nueva actividad: revisar archivo proyecto.js";
  expect(translateActivityText("en", unknown)).toBe(unknown);
  expect(translateActivityText("pt", unknown)).toBe(unknown);
});

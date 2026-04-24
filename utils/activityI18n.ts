import { type SessionLanguage } from "contexts/session/types";

type CatalogData = Record<string, unknown>;

type Replacement = [string, string];

const NON_TRANSLATABLE_KEYS = new Set([
  "activityId",
  "allowedCommands",
  "answerOrder",
  "app",
  "appRoute",
  "before",
  "branch",
  "checkId",
  "classId",
  "command",
  "columns",
  "cwd",
  "endsWith",
  "equals",
  "expectedWorkingDir",
  "files",
  "form",
  "folders",
  "id",
  "instructionsRaw",
  "itemsOrder",
  "key",
  "mode",
  "mustAppear",
  "mustAppearAny",
  "mustInclude",
  "mustIncludeAny",
  "path",
  "pattern",
  "repoPath",
  "requiredPull",
  "rootPath",
  "rules",
  "scenarioRaw",
  "standaloneRoute",
  "target",
  "type",
  "url",
  "version",
]);

const EXACT_TEXT: Record<
  SessionLanguage,
  Record<string, string>
> = {
  en: {
    "Actividad": "Activity",
    "Consigna": "Instructions",
    "No hay actividades cargadas.": "No activities loaded.",
    "Posición": "Position",
    "Reintentar": "Retry",
    "Seleccionar": "Select",
    "Validar": "Validate",
  },
  es: {},
  pt: {
    "Actividad": "Atividade",
    "Consigna": "Instrucoes",
    "No hay actividades cargadas.": "Nenhuma atividade carregada.",
    "Posición": "Posicao",
    "Reintentar": "Tentar novamente",
    "Seleccionar": "Selecionar",
    "Validar": "Validar",
  },
};

const EN_REPLACEMENTS: Replacement[] = [
  ["Configuración inicial de Git", "Initial Git setup"],
  ["Configurar identidad global de autor para commits.", "Set global author identity for commits."],
  [
    "Antes de crear repos, configurá tu identidad global de Git en GitBash.",
    "Before creating repos, configure your global Git identity in GitBash.",
  ],
  ["Configuraste user.name.", "Configured user.name."],
  ["Configuraste user.email.", "Configured user.email."],
  ["Tenés que", "You need to"],
  ["Hacé", "Do"],
  ["Entrá", "Enter"],
  ["Verificá", "Check"],
  ["Configurar", "Configure"],
  ["configurá", "configure"],
  ["Ejecutá", "Run"],
  ["ejecutá", "run"],
  ["Después", "After"],
  ["después", "after"],
  ["continuá", "continue"],
  ["continuá", "continue"],
  ["actividad", "activity"],
  ["identidad", "identity"],
  ["global", "global"],
  ["Inicializar", "Initialize"],
  ["inicializar", "initialize"],
  ["repo", "repo"],
  ["Configuración", "Setup"],
  ["Configuracion", "Setup"],
  ["Control de versiones y trabajo colaborativo", "Version control and collaborative work"],
  ["Crear y guardar cambios", "Create and save changes"],
  ["Revisar historial y versiones", "Review history and versions"],
  ["Repositorios remotos y trabajo compartido", "Remote repositories and shared work"],
  ["Lab: solo clone", "Lab: clone only"],
  ["Lab: solo pull", "Lab: pull only"],
  ["Lab: clone + pull", "Lab: clone + pull"],
  ["flujo", "flow"],
  ["Flujo", "Flow"],
  ["Actividad", "Activity"],
  ["objetivo", "objective"],
  ["Objetivo", "Objective"],
  ["escenario", "scenario"],
  ["Escenario", "Scenario"],
  ["Consigna", "Instructions"],
  ["Antes de", "Before"],
  ["despues", "after"],
  ["Despues", "After"],
  ["primero", "first"],
  ["Primero", "First"],
  ["luego", "then"],
  ["Luego", "Then"],
  ["correcto", "correct"],
  ["Correcto", "Correct"],
  ["incorrecto", "incorrect"],
  ["Incorrecto", "Incorrect"],
  ["ejecuta", "run"],
  ["Ejecuta", "Run"],
  ["ejecutar", "run"],
  ["Ejecutar", "Run"],
  ["Usa", "Use"],
  ["usa", "use"],
  ["hace", "do"],
  ["Hace", "Do"],
  ["entra", "enter"],
  ["Entra", "Enter"],
  ["trabaja", "work"],
  ["Trabaja", "Work"],
  ["carpeta", "folder"],
  ["Carpeta", "Folder"],
  ["archivo", "file"],
  ["Archivo", "File"],
  ["archivos", "files"],
  ["Archivos", "Files"],
  ["proyecto", "project"],
  ["Proyecto", "Project"],
  ["mensaje", "message"],
  ["Mensaje", "Message"],
  ["estado", "status"],
  ["Estado", "Status"],
  ["sincronizado", "synced"],
  ["Sincronizado", "Synced"],
  ["repositorio", "repository"],
  ["Repositorio", "Repository"],
  ["clonado", "cloned"],
  ["Clonado", "Cloned"],
  ["pull antes de push", "pull before push"],
  ["Inicializar repo", "Initialize repo"],
  ["Mensaje de commit profesional", "Professional commit message"],
  ["Evitar el git add . ciego", "Avoid blind git add ."],
  ["Leer el historial (git log)", "Read history (git log)"],
  ["Vista resumida (git log --oneline)", "Compact view (git log --oneline)"],
  ["Debugging historico (git show)", "Historical debugging (git show)"],
  ["Configurar origin", "Configure origin"],
  ["Primer push con upstream", "First push with upstream"],
  ["Pull antes de push", "Pull before push"],
  ["Flujo completo con remoto", "Full remote flow"],
  ["Tenes que", "You need to"],
  ["cambió", "changed"],
  ["Cambió", "Changed"],
  ["No se detecta", "Not detected"],
  ["Bien", "Good"],
  ["Warning", "Warning"],
  ["Explica", "Explain"],
  ["Explicacion", "Explanation"],
];

const PT_REPLACEMENTS: Replacement[] = [
  ["Configuración inicial de Git", "Configuracao inicial do Git"],
  ["Configurar identidad global de autor para commits.", "Configurar identidade global de autor para commits."],
  [
    "Antes de crear repos, configurá tu identidad global de Git en GitBash.",
    "Antes de criar repositorios, configure sua identidade global do Git no GitBash.",
  ],
  ["Configuraste user.name.", "Voce configurou user.name."],
  ["Configuraste user.email.", "Voce configurou user.email."],
  ["Tenés que", "Voce precisa"],
  ["Hacé", "Faca"],
  ["Entrá", "Entre"],
  ["Verificá", "Verifique"],
  ["Configurar", "Configurar"],
  ["configurá", "configure"],
  ["Ejecutá", "Execute"],
  ["ejecutá", "execute"],
  ["Después", "Depois"],
  ["después", "depois"],
  ["continuá", "continue"],
  ["actividad", "atividade"],
  ["identidad", "identidade"],
  ["Inicializar", "Inicializar"],
  ["inicializar", "inicializar"],
  ["Configuración", "Configuracao"],
  ["Control de versiones y trabajo colaborativo", "Controle de versoes e trabalho colaborativo"],
  ["Crear y guardar cambios", "Criar e salvar alteracoes"],
  ["Revisar historial y versiones", "Revisar historico e versoes"],
  ["Repositorios remotos y trabajo compartido", "Repositorios remotos e trabalho compartilhado"],
  ["Lab: solo clone", "Lab: somente clone"],
  ["Lab: solo pull", "Lab: somente pull"],
  ["Configuracion", "Configuracao"],
  ["Inicializar repo", "Inicializar repositorio"],
  ["Mensaje", "Mensagem"],
  ["mensaje", "mensagem"],
  ["Actividad", "Atividade"],
  ["actividad", "atividade"],
  ["Consigna", "Instrucoes"],
  ["Escenario", "Cenario"],
  ["escenario", "cenario"],
  ["Primero", "Primeiro"],
  ["primero", "primeiro"],
  ["Luego", "Depois"],
  ["luego", "depois"],
  ["correcto", "correto"],
  ["Correcto", "Correto"],
  ["incorrecto", "incorreto"],
  ["Incorrecto", "Incorreto"],
  ["Ejecuta", "Execute"],
  ["ejecuta", "execute"],
  ["Ejecutar", "Executar"],
  ["ejecutar", "executar"],
  ["Usa", "Use"],
  ["usa", "use"],
  ["Entra", "Entre"],
  ["entra", "entre"],
  ["carpeta", "pasta"],
  ["Carpeta", "Pasta"],
  ["archivo", "arquivo"],
  ["Archivo", "Arquivo"],
  ["archivos", "arquivos"],
  ["Archivos", "Arquivos"],
  ["proyecto", "projeto"],
  ["Proyecto", "Projeto"],
  ["estado", "status"],
  ["Estado", "Status"],
  ["sincronizado", "sincronizado"],
  ["repositorio", "repositorio"],
  ["clonado", "clonado"],
  ["Explica", "Explique"],
  ["Explicacion", "Explicacao"],
  ["cambió", "mudou"],
  ["Cambió", "Mudou"],
  ["Validar", "Validar"],
  ["Reintentar", "Tentar novamente"],
];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

const applyReplacements = (value: string, replacements: Replacement[]): string =>
  replacements.reduce(
    (text, [from, to]) => text.replace(new RegExp(escapeRegExp(from), "g"), to),
    value
  );

const shouldSkipString = (value: string, key?: string, inRules?: boolean): boolean => {
  if (!value) return true;
  if (inRules) return true;
  if (key && NON_TRANSLATABLE_KEYS.has(key)) return true;
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return true;
  }
  if (/^git\s+/i.test(value.trim())) {
    return true;
  }

  return false;
};

const translateText = (language: SessionLanguage, value: string): string => {
  if (language === "es") return value;

  const exact = EXACT_TEXT[language][value];

  if (exact) return exact;

  return applyReplacements(value, language === "pt" ? PT_REPLACEMENTS : EN_REPLACEMENTS);
};

const localizeValue = (
  language: SessionLanguage,
  value: unknown,
  currentKey?: string,
  inRules = false
): unknown => {
  if (typeof value === "string") {
    if (shouldSkipString(value, currentKey, inRules)) {
      return value;
    }

    return translateText(language, value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => localizeValue(language, entry, currentKey, inRules));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(record).map(([key, entryValue]) => [
        key,
        localizeValue(language, entryValue, key, inRules || key === "rules"),
      ])
    );
  }

  return value;
};

export const localizeActivitiesCatalog = <T extends CatalogData>(
  catalog: T,
  language: SessionLanguage
): T => {
  if (language === "es") {
    return catalog;
  }

  return localizeValue(language, catalog) as T;
};

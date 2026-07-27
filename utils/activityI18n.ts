import { type SessionLanguage } from "contexts/session/types";
import activityTranslations from "utils/activityTranslations.json";

type CatalogData = Record<string, unknown>;

type Replacement = [string, string];

type ActivityTranslations = Record<
  Exclude<SessionLanguage, "es">,
  Record<string, string>
>;

const ACTIVITY_TRANSLATIONS = activityTranslations as ActivityTranslations;

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

const EXACT_TEXT: Record<SessionLanguage, Record<string, string>> = {
  en: {
    Actividad: "Activity",
    "Copias/caos": "Copies/chaos",
    "Control de versiones": "Version control",
    Consigna: "Instructions",
    "Distinguir control de versiones de una estrategia de copias desordenadas.":
      "Distinguish version control from a messy copy-based strategy.",
    "Versiones vs copias": "Versions vs copies",
    "No hay actividades cargadas.": "No activities loaded.",
    Posición: "Position",
    Reintentar: "Retry",
    "Borrar respuestas y reintentar": "Clear answers and retry",
    Seleccionar: "Select",
    Validar: "Validate",
    Actualiza: "Update",
    Agrega: "Add",
    arreglo: "fix",
    cambio: "change",
    cambios: "changes",
    combinar: "merge",
    computadora: "computer",
    conflicto: "conflict",
    Corrige: "Fix",
    decidir: "decide",
    decisión: "decision",
    Elimina: "Delete",
    historia: "history",
    Mejora: "Improve",
    "mi máquina": "my machine",
    nube: "cloud",
    plataforma: "platform",
    Refactoriza: "Refactor",
    remoto: "remote",
    resolver: "resolve",
    version: "version",
    "Puedo ver el historial de cambios y volver a una versión anterior.":
      "I can view the change history and go back to an earlier version.",
    "Me paso archivos por WhatsApp con nombres tipo final_final2.":
      "I send files over WhatsApp with names like final_final2.",
    "Veo quién hizo cada cambio y cuándo.":
      "I can see who made each change and when.",
    "Guardo una carpeta por día y espero no equivocarme.":
      "I save one folder per day and hope I do not make a mistake.",
    "Puedo comparar cambios entre versiones (diff).":
      "I can compare changes between versions (diff).",
    "No sé cuál es el último archivo correcto.":
      "I do not know which file is the latest correct one.",
    "Trabajo en paralelo sin pisar el trabajo de otros.":
      "I work in parallel without overwriting other people's work.",
    "Si algo se rompe, no puedo volver atrás con seguridad.":
      "If something breaks, I cannot safely go back.",
    "Puedo crear versiones con mensajes (commits) y entender el contexto.":
      "I can create versions with messages (commits) and understand the context.",
    "Cada integrante guarda su copia y después se juntan como se pueda.":
      "Each member saves their own copy and later everything is merged however possible.",
    "Explicá 2 casos (mínimo 20 caracteres cada uno).":
      "Explain 2 cases (at least 20 characters each).",
    "Leé cada situación y elegí en su menú si corresponde a Control de versiones o a Copias/caos.":
      "Read each situation and use its menu to choose Version control or Copies/chaos.",
    "Escribí dos ejemplos propios relacionados con Git, versiones, cambios, copias o trabajo colaborativo. No necesitás usar palabras exactas.":
      "Write two examples related to Git, versions, changes, copies, or collaborative work. You do not need exact words.",
    "Tus elecciones y textos se guardan automáticamente en este dispositivo.":
      "Your choices and text are saved automatically on this device.",
    "Clasificación correcta.": "Correct classification.",
    "Revisá: algunas tarjetas quedaron en la columna equivocada.":
      "Review: some cards are in the wrong column.",
    "Justificaciones completas.": "Complete justifications.",
    "Escribí 2 justificaciones, con al menos 20 caracteres cada una.":
      "Write 2 justifications, with at least 20 characters each.",
    "Tus justificaciones reflejan el concepto.":
      "Your justifications reflect the concept.",
    "Sumá idea de historia/versiones/cambios en tu justificación.":
      "Add an idea about history/versions/changes to your justification.",
    "Tus ejemplos se relacionan con el tema.": "Your examples relate to the topic.",
    "Relacioná cada ejemplo con Git, el trabajo en equipo, los cambios, las versiones o las copias. Podés expresarlo con tus propias palabras.":
      "Relate each example to Git, teamwork, changes, versions, or copies. You can use your own words.",
    "Asigná una posición del 1 al 5 a cada cambio. El proyecto inicial debe quedar primero y la publicación estable, última.":
      "Assign each change a position from 1 to 5. The initial project must be first and the stable release last.",
    "Los tres cambios intermedios pueden estar en cualquier orden coherente: no hay una única respuesta correcta entre ellos.":
      "The three intermediate changes may appear in any coherent order; there is no single correct order among them.",
    "Elegí uno de esos tres cambios y explicá qué parte concreta podría dejar de funcionar. Por ejemplo: «Al corregir el formulario podría fallar la validación de un campo».":
      "Choose one of those three changes and explain what specific part could stop working. For example: “Fixing the form could break a field's validation.”",
    "Tus elecciones y el texto se guardan automáticamente.":
      "Your choices and text are saved automatically.",
    "El proyecto inicial debe ocupar la posición 1 y la publicación estable, la posición 5. Los cambios intermedios pueden ir en cualquier orden.":
      "The initial project must be in position 1 and the stable release in position 5. Intermediate changes may appear in any order.",
  },
  es: {},
  pt: {
    Actividad: "Atividade",
    "Copias/caos": "Cópias/caos",
    "Control de versiones": "Controle de versões",
    Consigna: "Instruções",
    "Distinguir control de versiones de una estrategia de copias desordenadas.":
      "Distinguir controle de versões de uma estratégia desorganizada de cópias.",
    "Versiones vs copias": "Versões vs cópias",
    "No hay actividades cargadas.": "Nenhuma atividade carregada.",
    Posición: "Posicao",
    Reintentar: "Tentar novamente",
    "Borrar respuestas y reintentar": "Limpar respostas e tentar novamente",
    Seleccionar: "Selecionar",
    Validar: "Validar",
    Actualiza: "Atualiza",
    Agrega: "Adiciona",
    arreglo: "correção",
    cambio: "alteração",
    cambios: "alterações",
    combinar: "combinar",
    computadora: "computador",
    conflicto: "conflito",
    Corrige: "Corrige",
    decidir: "decidir",
    decisión: "decisão",
    Elimina: "Remove",
    historia: "histórico",
    Mejora: "Melhora",
    "mi máquina": "minha máquina",
    nube: "nuvem",
    plataforma: "plataforma",
    Refactoriza: "Refatora",
    remoto: "remoto",
    resolver: "resolver",
    version: "versão",
    "Puedo ver el historial de cambios y volver a una versión anterior.":
      "Posso ver o histórico de alterações e voltar para uma versão anterior.",
    "Me paso archivos por WhatsApp con nombres tipo final_final2.":
      "Envio arquivos pelo WhatsApp com nomes como final_final2.",
    "Veo quién hizo cada cambio y cuándo.":
      "Vejo quem fez cada alteração e quando.",
    "Guardo una carpeta por día y espero no equivocarme.":
      "Salvo uma pasta por dia e espero não errar.",
    "Puedo comparar cambios entre versiones (diff).":
      "Posso comparar alterações entre versões (diff).",
    "No sé cuál es el último archivo correcto.":
      "Não sei qual é o último arquivo correto.",
    "Trabajo en paralelo sin pisar el trabajo de otros.":
      "Trabalho em paralelo sem sobrescrever o trabalho de outras pessoas.",
    "Si algo se rompe, no puedo volver atrás con seguridad.":
      "Se algo quebra, não consigo voltar com segurança.",
    "Puedo crear versiones con mensajes (commits) y entender el contexto.":
      "Posso criar versões com mensagens (commits) e entender o contexto.",
    "Cada integrante guarda su copia y después se juntan como se pueda.":
      "Cada integrante salva sua cópia e depois tudo é juntado como der.",
    "Explicá 2 casos (mínimo 20 caracteres cada uno).":
      "Explique 2 casos (mínimo de 20 caracteres cada um).",
    "Leé cada situación y elegí en su menú si corresponde a Control de versiones o a Copias/caos.":
      "Leia cada situação e use o menu para escolher Controle de versões ou Cópias/caos.",
    "Escribí dos ejemplos propios relacionados con Git, versiones, cambios, copias o trabajo colaborativo. No necesitás usar palabras exactas.":
      "Escreva dois exemplos relacionados a Git, versões, alterações, cópias ou trabalho colaborativo. Não é necessário usar palavras exatas.",
    "Tus elecciones y textos se guardan automáticamente en este dispositivo.":
      "Suas escolhas e textos são salvos automaticamente neste dispositivo.",
    "Clasificación correcta.": "Classificação correta.",
    "Revisá: algunas tarjetas quedaron en la columna equivocada.":
      "Revise: alguns cartões ficaram na coluna errada.",
    "Justificaciones completas.": "Justificativas completas.",
    "Escribí 2 justificaciones, con al menos 20 caracteres cada una.":
      "Escreva 2 justificativas, com pelo menos 20 caracteres cada uma.",
    "Tus justificaciones reflejan el concepto.":
      "Suas justificativas refletem o conceito.",
    "Sumá idea de historia/versiones/cambios en tu justificación.":
      "Inclua uma ideia de histórico/versões/alterações na sua justificativa.",
    "Tus ejemplos se relacionan con el tema.": "Seus exemplos estão relacionados ao tema.",
    "Relacioná cada ejemplo con Git, el trabajo en equipo, los cambios, las versiones o las copias. Podés expresarlo con tus propias palabras.":
      "Relacione cada exemplo ao Git, ao trabalho em equipe, às alterações, às versões ou às cópias. Você pode usar suas próprias palavras.",
    "Asigná una posición del 1 al 5 a cada cambio. El proyecto inicial debe quedar primero y la publicación estable, última.":
      "Atribua a cada alteração uma posição de 1 a 5. O projeto inicial deve ficar primeiro e a publicação estável por último.",
    "Los tres cambios intermedios pueden estar en cualquier orden coherente: no hay una única respuesta correcta entre ellos.":
      "As três alterações intermediárias podem aparecer em qualquer ordem coerente; não existe uma única ordem correta entre elas.",
    "Elegí uno de esos tres cambios y explicá qué parte concreta podría dejar de funcionar. Por ejemplo: «Al corregir el formulario podría fallar la validación de un campo».":
      "Escolha uma dessas três alterações e explique qual parte específica poderia parar de funcionar. Por exemplo: “Ao corrigir o formulário, a validação de um campo poderia falhar.”",
    "Tus elecciones y el texto se guardan automáticamente.":
      "Suas escolhas e o texto são salvos automaticamente.",
    "El proyecto inicial debe ocupar la posición 1 y la publicación estable, la posición 5. Los cambios intermedios pueden ir en cualquier orden.":
      "O projeto inicial deve ocupar a posição 1 e a publicação estável, a posição 5. As alterações intermediárias podem aparecer em qualquer ordem.",
  },
};

const EN_REPLACEMENTS: Replacement[] = [
  ["Configuración inicial de Git", "Initial Git setup"],
  [
    "Configurar identidad global de autor para commits.",
    "Set global author identity for commits.",
  ],
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
  [
    "Control de versiones y trabajo colaborativo",
    "Version control and collaborative work",
  ],
  ["Crear y guardar cambios", "Create and save changes"],
  ["Revisar historial y versiones", "Review history and versions"],
  [
    "Repositorios remotos y trabajo compartido",
    "Remote repositories and shared work",
  ],
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
  [
    "Configurar identidad global de autor para commits.",
    "Configurar identidade global de autor para commits.",
  ],
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
  [
    "Control de versiones y trabajo colaborativo",
    "Controle de versoes e trabalho colaborativo",
  ],
  ["Crear y guardar cambios", "Criar e salvar alteracoes"],
  ["Revisar historial y versiones", "Revisar historico e versoes"],
  [
    "Repositorios remotos y trabajo compartido",
    "Repositorios remotos e trabalho compartilhado",
  ],
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

const applyReplacements = (
  value: string,
  replacements: Replacement[]
): string =>
  replacements.reduce(
    (text, [from, to]) => text.replace(new RegExp(escapeRegExp(from), "g"), to),
    value
  );

const shouldSkipString = (
  value: string,
  key?: string,
  inRules?: boolean
): boolean => {
  if (!value) return true;
  if (inRules) return true;
  if (key && NON_TRANSLATABLE_KEYS.has(key)) return true;
  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return true;
  }
  if (/^git\s+/i.test(value.trim())) {
    return true;
  }

  return false;
};

export const translateActivityText = (
  language: SessionLanguage,
  value: string
): string => {
  if (language === "es") return value;

  const exact = EXACT_TEXT[language][value];

  if (exact) return exact;

  const translated = ACTIVITY_TRANSLATIONS[language]?.[value];

  if (translated) return translated;

  return applyReplacements(
    value,
    language === "pt" ? PT_REPLACEMENTS : EN_REPLACEMENTS
  );
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

    return translateActivityText(language, value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      localizeValue(language, entry, currentKey, inRules)
    );
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

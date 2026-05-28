import activitiesCatalog from "utils/activitiesCatalog.json";
import { type SessionLanguage } from "contexts/session/types";
import {
  localizeActivitiesCatalog,
  translateActivityText,
} from "utils/activityI18n";
import { getSearchParam } from "utils/functions";
import { getActiveLanguage } from "utils/i18n";
import { sendActivityPgEvent } from "utils/pg-events";

const ACTIVE_ACTIVITY_ID_KEY = "winsim_active_activity_id";
const ACTIVITY_STATE_PREFIX = "winsim_activity_state_";
const TELEMETRY_PREFIX = "winsim_activity_telemetry_";

export type ActivityCheck = {
  checkId: string;
  messageFail: string;
  messageOk: string;
  rules?: Record<string, unknown>;
  target: string;
  type: string;
};

export type ActivityDefinition = {
  classId: string;
  data: Record<string, unknown>;
  id: string;
  mode: string;
  objective: string;
  title: string;
  ui?: {
    retryLabel?: string;
    submitLabel?: string;
  };
  validation: {
    checks: ActivityCheck[];
  };
};

export type ActivityClass = {
  activities: ActivityDefinition[];
  classId: string;
  title: string;
};

export type ActivityCard = {
  id: string;
  text: string;
};

export type ActivityOption = {
  id: string;
  label: string;
};

type ActivityState = {
  answers: Record<string, unknown>;
  completed: boolean;
  completedCheckIds: string[];
  lastValidatedAt?: number;
};

type TrackedCommand = {
  command: string;
  cwd: string;
  timestamp: number;
};

type InferredRepoState = {
  author: string;
  commitsCount: number;
  initialized: boolean;
  lastCommitIncludes: string[];
  lastCommitMessage: string;
  remoteInSync: boolean;
  remotes: Record<string, string>;
  staged: string[];
  tracking?: {
    branch: string;
    remote: string;
  };
};

type ActivityTelemetry = {
  commands: TrackedCommand[];
  fileContents: Record<string, string>;
  fileSavedPaths: string[];
  inferredRepo: InferredRepoState;
  publishedUrls: string[];
};

export type ActivityEvent =
  | {
      activityId?: string;
      command: string;
      cwd?: string;
      type: "commandExecuted";
    }
  | {
      activityId?: string;
      content?: string;
      path: string;
      type: "fileSaved";
    }
  | {
      activityId?: string;
      type: "pagesPublished";
      url: string;
    };

export type ValidationResult = {
  checkId: string;
  message: string;
  passed: boolean;
};

const canUseStorage = (): boolean => typeof window !== "undefined";

const normalize = (value: string): string => value.trim().toLowerCase();

const normalizePath = (value: string): string =>
  value.replace(/\\/g, "/").replace(/\/+/g, "/").toLowerCase();

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const asNumber = (value: unknown): number => (typeof value === "number" ? value : 0);

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];

const translateRuleWords = (
  language: SessionLanguage,
  words: string[]
): string[] =>
  language === "es"
    ? words
    : words.map((word) => translateActivityText(language, word));

const containsAny = (text: string, words: string[]): boolean => {
  const normalizedText = normalize(text);

  return words.some((word) => normalizedText.includes(normalize(word)));
};

const getStateKey = (activityId: string): string => `${ACTIVITY_STATE_PREFIX}${activityId}`;

const getTelemetryKey = (activityId: string): string =>
  `${TELEMETRY_PREFIX}${activityId}`;

const readJson = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, data: unknown): void => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(key, JSON.stringify(data));
};

const getDefaultRepoState = (): InferredRepoState => ({
  author: "user",
  commitsCount: 0,
  initialized: false,
  lastCommitIncludes: [],
  lastCommitMessage: "",
  remoteInSync: false,
  remotes: {},
  staged: [],
});

const getDefaultTelemetry = (): ActivityTelemetry => ({
  commands: [],
  fileContents: {},
  fileSavedPaths: [],
  inferredRepo: getDefaultRepoState(),
  publishedUrls: [],
});

const getActivityClasses = (language?: SessionLanguage): ActivityClass[] =>
  (getActivitiesCatalog(language).classes as ActivityClass[]) || [];

const getActivitiesMap = (language?: SessionLanguage): Record<string, ActivityDefinition> =>
  Object.fromEntries(
    getActivityClasses(language).flatMap(({ activities }) =>
      activities.map((activity) => [activity.id, activity])
    )
  );

const parseCommitMessage = (command: string): string => {
  const marker = "-m";
  const markerIndex = command.indexOf(marker);

  if (markerIndex === -1) return "";

  const fromMarker = command.slice(markerIndex + marker.length).trim();

  if (fromMarker.startsWith("\"") && fromMarker.endsWith("\"")) {
    return fromMarker.slice(1, -1);
  }

  if (fromMarker.startsWith("'") && fromMarker.endsWith("'")) {
    return fromMarker.slice(1, -1);
  }

  return fromMarker;
};

const inferRepoFromCommand = (
  command: string,
  currentState: InferredRepoState
): InferredRepoState => {
  const next: InferredRepoState = {
    ...currentState,
    remotes: { ...currentState.remotes },
    staged: [...currentState.staged],
  };
  const trimmed = command.trim();
  const lowered = normalize(trimmed);
  const tokens = trimmed.split(/\s+/);

  if (lowered === "git init") {
    next.initialized = true;
  }

  if (tokens[0] === "git" && tokens[1] === "add") {
    const target = tokens.slice(2).join(" ").trim();

    if (target) {
      next.staged = [...new Set([...next.staged, target])];
    }
  }

  if (tokens[0] === "git" && tokens[1] === "remote" && tokens[2] === "add") {
    const name = tokens[3] || "";
    const url = tokens[4] || "";

    if (name && url) {
      next.remotes[name] = url;
    }
  }

  if (
    tokens[0] === "git" &&
    tokens[1] === "config" &&
    tokens[2] === "--global" &&
    tokens[3] === "user.name"
  ) {
    const userName = tokens.slice(4).join(" ").replace(/^"|"$/g, "");

    if (userName) {
      next.author = userName;
    }
  }

  if (
    tokens[0] === "git" &&
    tokens[1] === "push" &&
    (tokens[2] === "-u" || tokens[2] === "--set-upstream") &&
    tokens[3] === "origin" &&
    tokens[4] === "main"
  ) {
    next.tracking = { branch: "main", remote: "origin" };
    next.remoteInSync = true;
  }

  if (tokens[0] === "git" && tokens[1] === "pull") {
    next.remoteInSync = true;
  }

  if (tokens[0] === "git" && tokens[1] === "push") {
    next.remoteInSync = true;
  }

  if (tokens[0] === "git" && tokens[1] === "commit") {
    next.commitsCount += 1;
    next.lastCommitMessage = parseCommitMessage(trimmed);
    next.lastCommitIncludes = [...next.staged];
    next.staged = [];
  }

  return next;
};

const findCommandIndex = (commands: TrackedCommand[], fragment: string): number =>
  commands.findIndex(({ command }) => normalize(command).includes(normalize(fragment)));

const hasCommand = (commands: TrackedCommand[], fragment: string): boolean =>
  findCommandIndex(commands, fragment) >= 0;

const countCommand = (commands: TrackedCommand[], fragment: string): number =>
  commands.filter(({ command }) => normalize(command).includes(normalize(fragment))).length;

const hasSavedPath = (savedPaths: string[], expectedPath: string): boolean => {
  const normalizedExpected = normalizePath(expectedPath);

  return savedPaths.some((savedPath) => normalizePath(savedPath) === normalizedExpected);
};

const getSavedFileContent = (
  fileContents: Record<string, string>,
  targetPath: string
): string => fileContents[normalizePath(targetPath)] || "";

const resolveExpectedRepoValue = (
  repoPath: string,
  telemetry: ActivityTelemetry
): string => {
  if (repoPath === "repo.lastCommit.author") {
    return telemetry.inferredRepo.author;
  }

  if (repoPath === "repo.lastCommit.message") {
    return telemetry.inferredRepo.lastCommitMessage;
  }

  if (repoPath === "repo.exercise.culpritHash") {
    const showCommand = telemetry.commands
      .map(({ command }) => command)
      .find((command) => normalize(command).startsWith("git show "));

    if (!showCommand) return "";

    return showCommand.split(/\s+/)[2] || "";
  }

  return "";
};

const evaluateCheck = (
  activity: ActivityDefinition,
  answers: Record<string, unknown>,
  telemetry: ActivityTelemetry,
  check: ActivityCheck,
  language: SessionLanguage
): ValidationResult => {
  const rules = asRecord(check.rules);
  const {commands} = telemetry;
  const fileContents = telemetry.fileContents;
  const savedPaths = telemetry.fileSavedPaths;
  const publishedUrls = telemetry.publishedUrls;
  const repo = telemetry.inferredRepo;

  switch (check.type) {
    case "CLASSIFY_EXACT": {
      const cardAnswers = asRecord(answers.cards);
      const answerKey = asRecord(activity.data.answerKey);
      const expectedPairs = Object.entries(answerKey).flatMap(([column, cardIds]) =>
        asStringArray(cardIds).map((cardId) => ({ cardId, column }))
      );
      const passed = expectedPairs.every(
        ({ cardId, column }) => normalize(asString(cardAnswers[cardId])) === normalize(column)
      );

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "CLASSIFY_THRESHOLD": {
      const cardAnswers = asRecord(answers.cards);
      const answerKey = asRecord(activity.data.answerKey);
      const expectedPairs = Object.entries(answerKey).flatMap(([column, cardIds]) =>
        asStringArray(cardIds).map((cardId) => ({ cardId, column }))
      );
      const correct = expectedPairs.filter(
        ({ cardId, column }) => normalize(asString(cardAnswers[cardId])) === normalize(column)
      ).length;
      const passed = correct >= asNumber(rules.minCorrect);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TEXT_LIST_MIN": {
      const list = asStringArray(answers[check.target]);
      const minItems = asNumber(rules.minItems);
      const minLengthEach = asNumber(rules.minLengthEach);
      const passed =
        list.length >= minItems &&
        list.every((value) => normalize(value).length >= minLengthEach);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TEXT_KEYWORDS": {
      const textValue = asString(answers[check.target]);
      const listValue = asStringArray(answers[check.target]).join(" ");
      const text = listValue || textValue;
      const passed = containsAny(
        text,
        translateRuleWords(language, asStringArray(rules.mustIncludeAny))
      );

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TEXT_KEYWORDS_GROUPS": {
      const text = asString(answers[check.target]);
      const groups = (rules.mustSatisfyGroups as { any?: string[] }[]) || [];
      const passed = groups.every((group) =>
        containsAny(text, translateRuleWords(language, group.any || []))
      );

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TEXT_MIN_LENGTH": {
      const text = asString(answers[check.target]);
      const passed = normalize(text).length >= asNumber(rules.minLength);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "ORDER_EXACT": {
      const expected = asStringArray(activity.data.answerOrder);
      const actual = asStringArray(answers.itemsOrder);
      const passed =
        expected.length === actual.length &&
        expected.every((value, index) => value === actual[index]);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "BOOLEAN_TRUE": {
      const passed = Boolean(answers[check.target]);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "REQUIRED_SELECTION": {
      const passed = normalize(asString(answers[check.target])).length > 0;

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_COMMAND_EXECUTED": {
      const mustInclude = asStringArray(rules.mustInclude);
      const mustIncludeAny = asStringArray(rules.mustIncludeAny);
      const allIncluded =
        mustInclude.every((entry) => hasCommand(commands, entry));
      const anyIncluded =
        mustIncludeAny.length === 0 ||
        mustIncludeAny.some((entry) => hasCommand(commands, entry));
      const passed = allIncluded && anyIncluded;

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_COMMAND_REGEX_EXECUTED":
    case "TERMINAL_REGEX": {
      const pattern = asString(rules.pattern);
      const regex = new RegExp(pattern, "i");
      const passed = commands.some(({ command }) => regex.test(command));

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_COMMAND_MATCH": {
      const matches = asStringArray(rules.mustMatchAny);
      const passed = matches.some((entry) =>
        commands.some(({ command }) => normalize(command) === normalize(entry))
      );

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_COMMAND_COUNT_MIN": {
      const command = asString(rules.command);
      const minCount = asNumber(rules.minCount);
      const count = countCommand(commands, command);
      let passed = count >= minCount;

      if (passed && typeof rules.mustOccurBefore === "string") {
        const left = findCommandIndex(commands, command);
        const right = findCommandIndex(commands, rules.mustOccurBefore);

        passed = left >= 0 && right >= 0 && left < right;
      }

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_IN_DIR": {
      const expectedDir = normalizePath(asString(rules.equals));
      const expectedDirSuffix = normalizePath(asString(rules.endsWith));
      const commandEvent = commands.find(({ command }) => normalize(command) === "git init");
      const commandCwd = normalizePath(commandEvent?.cwd || "");
      const matchesExact = Boolean(expectedDir) && commandCwd === expectedDir;
      const matchesExpectedAsSuffix =
        Boolean(expectedDir) &&
        expectedDir !== "/" &&
        (commandCwd === expectedDir || commandCwd.endsWith(expectedDir));
      const matchesSuffix =
        Boolean(expectedDirSuffix) &&
        (commandCwd === expectedDirSuffix ||
          commandCwd.endsWith(`${expectedDirSuffix}/`) ||
          commandCwd.endsWith(expectedDirSuffix));
      const passed =
        Boolean(commandEvent) &&
        (matchesExact || matchesExpectedAsSuffix || matchesSuffix);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_ORDER": {
      const before = asString(rules.before);
      const mustAppear = asString(rules.mustAppear);
      const mustAppearAny = asStringArray(rules.mustAppearAny);
      const beforeIndex = findCommandIndex(commands, before);
      const candidateIndexes = mustAppear
        ? [findCommandIndex(commands, mustAppear)]
        : mustAppearAny.map((entry) => findCommandIndex(commands, entry));
      const validIndexes = candidateIndexes.filter((index) => index >= 0);
      const firstMustIndex = validIndexes.length > 0 ? Math.min(...validIndexes) : -1;
      const passed = beforeIndex >= 0 && firstMustIndex >= 0 && firstMustIndex < beforeIndex;

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_COMMAND_EXECUTED_AFTER": {
      const afterAny = asStringArray(rules.afterMustIncludeAny);
      const mustInclude = asStringArray(rules.mustInclude);
      const afterIndexes = afterAny
        .map((entry) => findCommandIndex(commands, entry))
        .filter((index) => index >= 0);
      const baseIndex = afterIndexes.length > 0 ? Math.max(...afterIndexes) : -1;
      const passed =
        baseIndex >= 0 &&
        mustInclude.some((entry) =>
          commands.some(
            ({ command }, index) =>
              index > baseIndex && normalize(command).startsWith(normalize(entry))
          )
        );

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "TERMINAL_WARNING_IF_MATCH": {
      const regex = new RegExp(asString(rules.pattern), "i");
      const found = commands.some(({ command }) => regex.test(command));

      return {
        checkId: check.checkId,
        message: found ? check.messageFail : check.messageOk,
        passed: !found,
      };
    }

    case "TEXT_REGEX": {
      const regex = new RegExp(asString(rules.pattern), "i");
      const passed = regex.test(asString(answers[check.target]));

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "FILE_SAVED_PATHS_INCLUDE": {
      const requiredPaths = asStringArray(rules.paths);
      const passed =
        requiredPaths.length > 0 &&
        requiredPaths.every((path) => hasSavedPath(savedPaths, path));

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "FILE_SAVED_PATHS_EXCLUDE": {
      const forbiddenPaths = asStringArray(rules.paths);
      const passed = forbiddenPaths.every((path) => !hasSavedPath(savedPaths, path));

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "FILE_CONTENT_REGEX": {
      const path = asString(rules.path);
      const pattern = asString(rules.pattern);
      const content = getSavedFileContent(fileContents, path);
      const regex = new RegExp(pattern, "i");
      const passed = Boolean(content) && regex.test(content);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "FILE_CONTENT_NOT_REGEX": {
      const path = asString(rules.path);
      const pattern = asString(rules.pattern);
      const content = getSavedFileContent(fileContents, path);
      const regex = new RegExp(pattern, "i");
      const passed = Boolean(content) && !regex.test(content);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "PAGES_PUBLISHED_URL_REGEX": {
      const regex = new RegExp(asString(rules.pattern), "i");
      const passed = publishedUrls.some((url) => regex.test(url));

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "ANSWER_EQUALS_REPO_VALUE": {
      const repoPath = asString(rules.repoPath);
      const normalizeHash = Boolean(rules.normalizeHash);
      const key = check.target.replace("form.", "");
      const answerValue = asString(answers[key]);
      const expected = resolveExpectedRepoValue(repoPath, telemetry);
      const passed = normalizeHash
        ? normalize(answerValue).startsWith(normalize(expected))
        : normalize(answerValue) === normalize(expected);

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "ANSWER_INCLUDES_REPO_DIFF_SNIPPET": {
      const answerText = asString(answers[check.target.replace("form.", "")]);
      const passed = hasCommand(commands, "git diff") && normalize(answerText).length > 1;

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "COMMIT_MESSAGE_RULES": {
      const message = repo.lastCommitMessage;
      const minLength = asNumber(rules.minLength);
      const mustStartWithAny = translateRuleWords(
        language,
        asStringArray(rules.mustStartWithAny)
      );
      const forbiddenExact = translateRuleWords(
        language,
        asStringArray(rules.forbiddenExact)
      );
      const startsOk =
        mustStartWithAny.length === 0 ||
        mustStartWithAny.some((prefix) => message.startsWith(prefix));
      const forbidden = forbiddenExact.some(
        (word) => normalize(word) === normalize(message)
      );
      const passed = normalize(message).length >= minLength && startsOk && !forbidden;

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    case "REPO_STATE": {
      const stagedIncludes = asStringArray(rules.stagedIncludes);
      const stagedExcludes = asStringArray(rules.stagedExcludes);
      const lastCommitIncludes = asStringArray(rules.lastCommitIncludes);
      const lastCommitExcludes = asStringArray(rules.lastCommitExcludes);
      const remotesIncludes = asStringArray(rules.remotesIncludes);
      const hasTrackingRule = Boolean(rules.branchTracking);
      const trackingRule = asRecord(rules.branchTracking);
      const trackingOk =
        !hasTrackingRule ||
        (repo.tracking?.branch === asString(trackingRule.branch) &&
          repo.tracking?.remote === asString(trackingRule.remote));

      const passed =
        (typeof rules.initialized !== "boolean" || repo.initialized === rules.initialized) &&
        stagedIncludes.every((entry) => repo.staged.includes(entry)) &&
        stagedExcludes.every((entry) => !repo.staged.includes(entry)) &&
        lastCommitIncludes.every((entry) => repo.lastCommitIncludes.includes(entry)) &&
        lastCommitExcludes.every((entry) => !repo.lastCommitIncludes.includes(entry)) &&
        remotesIncludes.every((entry) => Object.hasOwn(repo.remotes, entry)) &&
        (typeof rules.remoteInSync !== "boolean" || repo.remoteInSync === rules.remoteInSync) &&
        (typeof rules.hasAtLeastCommits !== "number" ||
          repo.commitsCount >= rules.hasAtLeastCommits) &&
        trackingOk;

      return {
        checkId: check.checkId,
        message: passed ? check.messageOk : check.messageFail,
        passed,
      };
    }

    default:
      return {
        checkId: check.checkId,
        message: check.messageOk,
        passed: true,
      };
  }
};

export const getActivitiesCatalog = (
  language?: SessionLanguage
): typeof activitiesCatalog =>
  localizeActivitiesCatalog(activitiesCatalog, language || getActiveLanguage());

export const getActivityById = (
  activityId: string,
  language?: SessionLanguage
): ActivityDefinition | undefined => getActivitiesMap(language)[activityId];

export const setCurrentActivityId = (activityId = ""): void => {
  if (!canUseStorage()) return;

  if (activityId) {
    window.localStorage.setItem(ACTIVE_ACTIVITY_ID_KEY, activityId);
    return;
  }

  window.localStorage.removeItem(ACTIVE_ACTIVITY_ID_KEY);
};

export const getCurrentActivityId = (): string => {
  if (!canUseStorage()) return "";

  return (
    getSearchParam("activityId") ||
    window.localStorage.getItem(ACTIVE_ACTIVITY_ID_KEY) ||
    ""
  );
};

export const getActivityState = (activityId: string): ActivityState => {
  const fallback: ActivityState = {
    answers: {},
    completed: false,
    completedCheckIds: [],
  };

  return readJson<ActivityState>(getStateKey(activityId), fallback);
};

export const saveActivityAnswers = (
  activityId: string,
  answers: Record<string, unknown>
): ActivityState => {
  const current = getActivityState(activityId);
  const next: ActivityState = {
    ...current,
    answers: {
      ...current.answers,
      ...answers,
    },
  };

  writeJson(getStateKey(activityId), next);

  return next;
};

const readTelemetry = (activityId: string): ActivityTelemetry => {
  const parsed = readJson<ActivityTelemetry>(
    getTelemetryKey(activityId),
    getDefaultTelemetry()
  );

  return {
    commands: Array.isArray(parsed.commands)
      ? parsed.commands.filter(
          (entry): entry is TrackedCommand =>
            Boolean(entry) &&
            typeof entry.command === "string" &&
            typeof entry.cwd === "string" &&
            typeof entry.timestamp === "number"
        )
      : [],
    fileContents:
      parsed.fileContents && typeof parsed.fileContents === "object"
        ? Object.fromEntries(
            Object.entries(parsed.fileContents).filter(
              (entry): entry is [string, string] =>
                typeof entry[0] === "string" && typeof entry[1] === "string"
            )
          )
        : {},
    fileSavedPaths: asStringArray(parsed.fileSavedPaths),
    publishedUrls: asStringArray(parsed.publishedUrls),
    inferredRepo: {
      ...getDefaultRepoState(),
      ...asRecord(parsed.inferredRepo),
      lastCommitIncludes: asStringArray(parsed.inferredRepo?.lastCommitIncludes),
      remotes:
        parsed.inferredRepo && typeof parsed.inferredRepo.remotes === "object"
          ? (parsed.inferredRepo.remotes)
          : {},
      staged: asStringArray(parsed.inferredRepo?.staged),
    },
  };
};

export const clearActivityProgress = (activityId: string): void => {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(getStateKey(activityId));
  window.localStorage.removeItem(getTelemetryKey(activityId));
};

export const retryActivity = (
  activityId: string,
  language?: SessionLanguage
): void => {
  const activity = getActivityById(activityId, language);

  if (activity) {
    const currentState = getActivityState(activityId);
    const eventState = {
      activity: {
        classId: activity.classId,
        id: activity.id,
        mode: activity.mode,
        objective: activity.objective,
        title: activity.title,
      },
      answers: currentState.answers,
      completed: false,
      completedCheckIds: [],
      progress: {
        completed: 0,
        total: activity.validation.checks.length,
      },
      results: [],
      validatedAt: Date.now(),
    };

    sendActivityPgEvent({
      completed: false,
      message: "se ha reiniciado la actividad",
      reason: [],
      state: eventState,
    });
  }

  clearActivityProgress(activityId);
};

export const validateActivity = (
  activityId: string,
  language?: SessionLanguage
): {
  completed: boolean;
  progress: { completed: number; total: number };
  results: ValidationResult[];
} => {
  const activity = getActivityById(activityId, language);

  if (!activity) {
    globalThis.console?.warn?.("[validateActivity] Activity not found", {
      activityId,
      language,
    });

    return {
      completed: false,
      progress: { completed: 0, total: 0 },
      results: [],
    };
  }

  const currentState = getActivityState(activityId);
  const telemetry = readTelemetry(activityId);
  const activeLanguage = language || getActiveLanguage();
  const results = activity.validation.checks.map((check) =>
    evaluateCheck(activity, currentState.answers, telemetry, check, activeLanguage)
  );
  const completedCheckIds = results
    .filter(({ passed }) => passed)
    .map(({ checkId }) => checkId);
  const completed = results.length > 0 && results.every(({ passed }) => passed);
  const progress = {
    completed: completedCheckIds.length,
    total: results.length,
  };
  const reason = results
    .filter(({ passed }) => !passed)
    .map(({ message }) => message);
  const eventState = {
    activity: {
      classId: activity.classId,
      id: activity.id,
      mode: activity.mode,
      objective: activity.objective,
      title: activity.title,
    },
    answers: currentState.answers,
    completed,
    completedCheckIds,
    progress,
    results,
    validatedAt: Date.now(),
  };

  writeJson(getStateKey(activityId), {
    ...currentState,
    completed,
    completedCheckIds,
    lastValidatedAt: Date.now(),
  });

  globalThis.console?.log?.("[validateActivity] Sending activity event", {
    activityId,
    completed,
    reason,
  });

  sendActivityPgEvent({
    completed,
    reason,
    state: eventState,
  });

  if (completed) {
    // eslint-disable-next-line no-console
    console.log(`Actividad completada: ${activityId}`);
  }

  return {
    completed,
    progress,
    results,
  };
};

export const getActivityProgress = (
  activityId: string,
  language?: SessionLanguage
): { completed: number; total: number } => {
  const activity = getActivityById(activityId, language);
  const state = getActivityState(activityId);

  return {
    completed: state.completedCheckIds.length,
    total: activity?.validation.checks.length || 0,
  };
};

export const trackActivityEvent = (
  event: ActivityEvent
): { activityId: string; matched: boolean } => {
  const activityId = event.activityId || getCurrentActivityId();

  if (!activityId) {
    return { activityId: "", matched: false };
  }

  const telemetry = readTelemetry(activityId);

  if (event.type === "commandExecuted") {
    const command = event.command.trim();

    if (command) {
      telemetry.commands.push({
        command,
        cwd: event.cwd || "/",
        timestamp: Date.now(),
      });
      telemetry.inferredRepo = inferRepoFromCommand(command, telemetry.inferredRepo);
    }
  }

  if (event.type === "fileSaved") {
    telemetry.fileSavedPaths = [
      ...new Set([...telemetry.fileSavedPaths, normalizePath(event.path)]),
    ];

    if (typeof event.content === "string") {
      telemetry.fileContents[normalizePath(event.path)] = event.content;
    }
  }

  if (event.type === "pagesPublished" && event.url) {
    telemetry.publishedUrls = [
      ...new Set([...telemetry.publishedUrls, event.url]),
    ];
  }

  writeJson(getTelemetryKey(activityId), telemetry);

  return { activityId, matched: true };
};

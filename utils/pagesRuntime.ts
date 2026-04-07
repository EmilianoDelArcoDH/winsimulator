const PAGES_REGISTRY_KEY = "winsim_pages_registry";
const DEFAULT_PAGES_USERNAME = "estudiante";
const PAGES_HOST_SUFFIX = ".pages.dev";

export type PublishedPagesSite = {
  projectName: string;
  publicUrl: string;
  publishedAt: number;
  snapshotRoot: string;
  sourceRoot: string;
  username: string;
};

type PublishedPagesRegistry = Record<string, PublishedPagesSite>;

const canUseStorage = (): boolean => typeof window !== "undefined";

const normalizePath = (value: string): string =>
  value.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "") || "/";

const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "mi-proyecto";

const readRegistry = (): PublishedPagesRegistry => {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(PAGES_REGISTRY_KEY);

    if (!raw) return {};

    return JSON.parse(raw) as PublishedPagesRegistry;
  } catch {
    return {};
  }
};

const writeRegistry = (registry: PublishedPagesRegistry): void => {
  if (!canUseStorage()) return;

  window.localStorage.setItem(PAGES_REGISTRY_KEY, JSON.stringify(registry));
};

export const buildPagesUrl = (
  projectName: string,
  username = DEFAULT_PAGES_USERNAME
): string => `https://${slugify(username)}${PAGES_HOST_SUFFIX}/${slugify(projectName)}`;

export const registerPublishedSite = (
  site: Omit<PublishedPagesSite, "publicUrl" | "publishedAt">
): PublishedPagesSite => {
  const projectName = slugify(site.projectName || "");
  const publicUrl = buildPagesUrl(projectName, site.username);
  const nextSite: PublishedPagesSite = {
    ...site,
    projectName,
    publicUrl,
    publishedAt: Date.now(),
    snapshotRoot: normalizePath(site.snapshotRoot),
    sourceRoot: normalizePath(site.sourceRoot),
    username: slugify(site.username || DEFAULT_PAGES_USERNAME),
  };
  const registry = readRegistry();

  registry[publicUrl] = nextSite;
  writeRegistry(registry);

  return nextSite;
};

export const getPublishedSite = (publicUrl: string): PublishedPagesSite | undefined =>
  readRegistry()[publicUrl.replace(/\/$/, "")];

export const getPublishedSitesBySourceRoot = (
  sourceRoot: string
): PublishedPagesSite[] => {
  const normalizedSourceRoot = normalizePath(sourceRoot);

  return Object.values(readRegistry()).filter(
    (site) => normalizePath(site.sourceRoot) === normalizedSourceRoot
  );
};

export const updatePublishedSite = (
  publicUrl: string,
  updates: Partial<Omit<PublishedPagesSite, "publicUrl">>
): PublishedPagesSite | undefined => {
  const normalizedUrl = publicUrl.replace(/\/$/, "");
  const registry = readRegistry();
  const currentSite = registry[normalizedUrl];

  if (!currentSite) return undefined;

  const nextSite: PublishedPagesSite = {
    ...currentSite,
    ...updates,
    publishedAt: Date.now(),
    snapshotRoot: updates.snapshotRoot
      ? normalizePath(updates.snapshotRoot)
      : currentSite.snapshotRoot,
    sourceRoot: updates.sourceRoot
      ? normalizePath(updates.sourceRoot)
      : currentSite.sourceRoot,
  };

  registry[normalizedUrl] = nextSite;
  writeRegistry(registry);

  return nextSite;
};

export const isPublishedPagesUrl = (rawUrl: string): boolean => {
  try {
    const parsed = new URL(rawUrl);

    return parsed.protocol.startsWith("http") && parsed.hostname.endsWith(PAGES_HOST_SUFFIX);
  } catch {
    return false;
  }
};

export const resolvePublishedPagesUrl = (
  rawUrl: string
):
  | {
      localPath: string;
      publicPath: string;
      site: PublishedPagesSite;
    }
  | undefined => {
  try {
    const parsed = new URL(rawUrl);
    const [, projectSegment = "", ...restSegments] = parsed.pathname.split("/");
    const projectName = slugify(projectSegment);

    if (!projectName || !parsed.hostname.endsWith(PAGES_HOST_SUFFIX)) {
      return undefined;
    }

    const site = getPublishedSite(buildPagesUrl(projectName, parsed.hostname.replace(PAGES_HOST_SUFFIX, "")));

    if (!site) return undefined;

    const publicPath = `/${projectName}/${restSegments.join("/")}`.replace(/\/+/g, "/");
    const relativePath = restSegments.join("/");
    const localPath = normalizePath(
      relativePath ? `${site.snapshotRoot}/${relativePath}` : `${site.snapshotRoot}/index.html`
    );

    return {
      localPath,
      publicPath,
      site,
    };
  } catch {
    return undefined;
  }
};

export const getPagesUsername = (): string => DEFAULT_PAGES_USERNAME;

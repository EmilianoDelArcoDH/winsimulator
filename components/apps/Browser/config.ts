import { type ProxyState } from "components/apps/Browser/useProxyMenu";
import { FAVICON_BASE_PATH } from "utils/constants";

type Bookmark = {
  icon: string;
  name: string;
  path?: string;
  url: string;
};

type WaybackUrlInfo = {
  archived_snapshots: { closest: { url: string } };
};

const ADULT_HOST_PATTERNS = [
  "pornhub",
  "xvideos",
  "xnxx",
  "xhamster",
  "redtube",
  "youporn",
  "tube8",
  "spankbang",
  "beeg",
  "eporner",
  "brazzers",
  "hclips",
  "hqporner",
  "youjizz",
  "sunporno",
  "porn",
  "sex",
  "hentai",
  "rule34",
  "cam4",
  "chaturbate",
  "stripchat",
  "onlyfans",
] as const;

const ADULT_SEARCH_PATTERNS = [
  "porn",
  "porno",
  "xxx",
  "xvideos",
  "xnxx",
  "xhamster",
  "redtube",
  "youporn",
  "hentai",
  "rule34",
  "onlyfans",
  "nsfw",
  "sexo",
  "desnuda",
  "desnudo",
] as const;

export const DINO_GAME = {
  icon: "/System/Icons/Favicons/dino.webp",
  name: "T-Rex Chrome Dino Game",
  path: "/Program Files/Browser/dino/index.html",
  url: "chrome://dino",
};

export const bookmarks: Bookmark[] = [
  {
    icon: FAVICON_BASE_PATH,
    name: "DH console",
    url: "https://digitalhouse.com/",
  },
  {
    icon: "/System/Icons/Favicons/dir.webp",
    name: "Index of /",
    url: "http://localhost/",
  },
  DINO_GAME,
  {
    icon: "/System/Icons/Favicons/google.webp",
    name: "Google",
    url: "https://www.google.com/webhp?igu=1",
  },
  {
    icon: "/System/Icons/Favicons/wikipedia.webp",
    name: "Wikipedia",
    url: "https://www.wikipedia.org/",
  },
  {
    icon: "/System/Icons/Favicons/archive.webp",
    name: "Internet Archive",
    url: "https://archive.org/",
  },
  {
    icon: "/System/Icons/webamp.webp",
    name: "Winamp Skin Museum",
    url: "https://skins.webamp.org/",
  },
  {
    icon: "/System/Icons/Favicons/aos.webp",
    name: "AaronOS",
    url: "https://aaronos.dev/",
  },
];

export const HOME_PAGE = "https://www.google.com/webhp?igu=1";

export const NOT_FOUND =
  '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"><html><head><title>404 Not Found</title><style>h1{display:inline;}</style></head><body><h1>Not Found</h1><p>The requested URL was not found on this server.</p></body></html>';

export const BLOCKED_ADULT_CONTENT =
  '<!DOCTYPE html><html><head><title>Blocked</title><meta charset="utf-8"><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#101317;color:#f2f4f8;display:grid;place-items:center;min-height:100vh}main{max-width:560px;padding:24px;border:1px solid #2a2f38;border-radius:10px;background:#171c22}h1{margin:0 0 12px;font-size:22px}p{margin:0;line-height:1.5;color:#c9d1d9}</style></head><body><main><h1>Access blocked</h1><p>This browser blocks adult content links for this environment.</p></main></body></html>';

export const isBlockedAdultUrl = (url: URL): boolean => {
  const { hostname, pathname } = url;
  const normalizedHost = hostname.toLowerCase();
  const normalizedPath = pathname.toLowerCase();

  return ADULT_HOST_PATTERNS.some(
    (pattern) =>
      normalizedHost.includes(pattern) ||
      normalizedPath.includes(`/${pattern}`) ||
      normalizedPath.includes(`-${pattern}`)
  );
};

const hasBlockedSearchTerm = (value = ""): boolean => {
  const normalizedValue = decodeURIComponent(value).toLowerCase();

  return ADULT_SEARCH_PATTERNS.some((pattern) =>
    normalizedValue.includes(pattern)
  );
};

export const isBlockedAdultSearchInput = (addressInput: string): boolean =>
  hasBlockedSearchTerm(addressInput);

export const isBlockedAdultSearchUrl = (url: URL): boolean => {
  const query = new URLSearchParams(url.search.replace(";", "&"));

  return ["q", "query", "p", "search", "wd", "text"].some((key) =>
    hasBlockedSearchTerm(query.get(key) || "")
  );
};

const OLD_NET_PROXY =
  "https://theoldnet.com/get?scripts=true&decode=true&year=<year>&url=";

export const OLD_NET_SUPPORTED_YEARS = [
  1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
  2009, 2010, 2011, 2012,
];

const WAYBACK_URL_INFO = "https://archive.org/wayback/available?url=";

export const PROXIES: Record<
  ProxyState,
  ((url: string) => Promise<string> | string) | undefined
> = {
  ALL_ORIGINS: (url) => `https://api.allorigins.win/raw?url=${url}`,
  CORS: undefined,
  WAYBACK_MACHINE: async (url) => {
    try {
      const urlInfoResponse = await fetch(`${WAYBACK_URL_INFO}${url}`);
      const { archived_snapshots } =
        (await urlInfoResponse.json()) as WaybackUrlInfo;

      if (archived_snapshots.closest.url) {
        let addressUrl = archived_snapshots.closest.url;

        if (
          addressUrl.startsWith("http:") &&
          window.location.protocol === "https:"
        ) {
          addressUrl = addressUrl.replace("http:", "https:");
        }

        return addressUrl;
      }
    } catch {
      // Ignore failure to fetch url
    }

    return url;
  },
  ...Object.fromEntries(
    OLD_NET_SUPPORTED_YEARS.map((year) => [
      `OLD_NET_${year}`,
      (url) => `${OLD_NET_PROXY.replace("<year>", year.toString())}${url}`,
    ])
  ),
};

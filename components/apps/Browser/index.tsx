import { basename, dirname, join, resolve } from "path";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useProxyMenu, {
  type ProxyState,
} from "components/apps/Browser/useProxyMenu";
import { ADDRESS_INPUT_PROPS } from "components/apps/FileExplorer/AddressBar";
import useHistoryMenu from "components/apps/Browser/useHistoryMenu";
import {
  createDirectoryIndex,
  type DirectoryEntries,
} from "components/apps/Browser/directoryIndex";
import {
  Arrow,
  Network,
  Refresh,
  Stop,
} from "components/apps/Browser/NavigationIcons";
import StyledBrowser from "components/apps/Browser/StyledBrowser";
import {
  BLOCKED_ADULT_CONTENT,
  DINO_GAME,
  HOME_PAGE,
  NOT_FOUND,
  PROXIES,
  bookmarks,
  isBlockedAdultSearchInput,
  isBlockedAdultSearchUrl,
  isBlockedAdultUrl,
} from "components/apps/Browser/config";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import useHistory from "hooks/useHistory";
import Button from "styles/common/Button";
import {
  FAVICON_BASE_PATH,
  IFRAME_CONFIG,
  ONE_TIME_PASSIVE_EVENT,
  SHORTCUT_EXTENSION,
} from "utils/constants";
import {
  GOOGLE_SEARCH_QUERY,
  LOCAL_HOST,
  bufferToUrl,
  getExtension,
  getMimeType,
  getUrlOrSearch,
  haltEvent,
  label,
} from "utils/functions";
import {
  isPublishedPagesUrl,
  resolvePublishedPagesUrl,
} from "utils/pagesRuntime";
import {
  getInfoWithExtension,
  getModifiedTime,
  getShortcutInfo,
} from "components/system/Files/FileEntry/functions";
import { useSession } from "contexts/session";

declare module "react" {
  interface IframeHTMLAttributes<T> extends React.HTMLAttributes<T> {
    credentialless?: "credentialless";
  }
}

const Browser: FC<ComponentProcessProps> = ({ id }) => {
  const {
    icon: setIcon,
    linkElement,
    url: changeUrl,
    processes: { [id]: process },
    open,
  } = useProcesses();
  const { setForegroundId, updateRecentFiles } = useSession();
  const { prependFileToTitle } = useTitle(id);
  const { initialTitle = "", url = "" } = process || {};
  const initialUrl = url || HOME_PAGE;
  const { canGoBack, canGoForward, history, moveHistory, position } =
    useHistory(initialUrl, id);
  const { addFsWatcher, exists, fs, stat, readFile, readdir, removeFsWatcher } =
    useFileSystem();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const localPreviewHtmlPathRef = useRef("");
  const localPreviewDependenciesRef = useRef<Set<string>>(new Set());
  const localPreviewPublicUrlRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [srcDoc, setSrcDoc] = useState("");
  const changeHistory = (step: number): void => {
    moveHistory(step);

    if (inputRef.current) inputRef.current.value = history[position + step];
  };
  const currentUrl = useRef("");
  const changeIframeWindowLocation = (
    newUrl: string,
    contentWindow: Window
  ): void => {
    let isSrcDoc = false;

    try {
      isSrcDoc = contentWindow.location?.pathname === "srcdoc";
    } catch {
      // Ignore failure to read iframe window path
    }

    if (isSrcDoc) {
      setSrcDoc("");
      iframeRef.current?.setAttribute("src", newUrl);
    } else {
      contentWindow.location?.replace(newUrl);
    }
  };
  const goToLink = useCallback(
    (newUrl: string): void => {
      if (inputRef.current) {
        inputRef.current.value = newUrl;
      }

      changeUrl(id, newUrl);
    },
    [changeUrl, id]
  );
  const { backMenu, forwardMenu } = useHistoryMenu(
    history,
    position,
    moveHistory
  );
  const [proxyState, setProxyState] = useState<ProxyState>("CORS");
  const proxyMenu = useProxyMenu(proxyState, setProxyState);
  const normalizeLocalAssetPath = useCallback(
    (htmlPath: string, assetReference: string): string => {
      const cleanReference = assetReference
        .trim()
        .replace(/[?#].*$/, "")
        .replace(/\\/g, "/");

      if (!cleanReference) return "";

      if (
        cleanReference.startsWith("http://") ||
        cleanReference.startsWith("https://") ||
        cleanReference.startsWith("data:") ||
        cleanReference.startsWith("blob:") ||
        cleanReference.startsWith("javascript:") ||
        cleanReference.startsWith("#") ||
        cleanReference.startsWith("//")
      ) {
        return "";
      }

      const resolvedPath = cleanReference.startsWith("/")
        ? cleanReference
        : resolve(dirname(htmlPath), cleanReference);

      return resolvedPath.replace(/\\/g, "/");
    },
    []
  );
  const buildLocalHtmlPreview = useCallback(
    async (
      htmlPath: string
    ): Promise<{ dependencies: Set<string>; html: string }> => {
      const htmlContent = (await readFile(htmlPath)).toString();
      const dependencies = new Set<string>([htmlPath]);
      let previewHtml = htmlContent;

      const linkHrefRegex =
        /<link\b[^>]*\brel\s*=\s*["'][^"']*stylesheet[^"']*["'][^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
      const scriptSrcRegex =
        /<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)><\/script>/gi;
      const imageSrcRegex =
        /<img\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>/gi;

      const linkMatches = [...previewHtml.matchAll(linkHrefRegex)];

      for (const match of linkMatches) {
        const [fullTag = "", href = ""] = match;
        const localCssPath = normalizeLocalAssetPath(htmlPath, href);

        if (!localCssPath || !(await exists(localCssPath))) continue;

        try {
          const cssContent = (await readFile(localCssPath)).toString();

          dependencies.add(localCssPath);
          previewHtml = previewHtml.replace(
            fullTag,
            `<style data-preview-path="${localCssPath}">\n${cssContent}\n</style>`
          );
        } catch {
          // Ignore failure to inline stylesheet
        }
      }

      const scriptMatches = [...previewHtml.matchAll(scriptSrcRegex)];

      for (const match of scriptMatches) {
        const [fullTag = "", beforeSrc = "", src = "", afterSrc = ""] = match;
        const localJsPath = normalizeLocalAssetPath(htmlPath, src);

        if (!localJsPath || !(await exists(localJsPath))) continue;

        try {
          const jsContent = (await readFile(localJsPath)).toString();
          const scriptOpenTag = `<script${beforeSrc}${afterSrc}>`;

          dependencies.add(localJsPath);
          previewHtml = previewHtml.replace(
            fullTag,
            `${scriptOpenTag}\n${jsContent}\n</script>`
          );
        } catch {
          // Ignore failure to inline script
        }
      }

      const imageMatches = [...previewHtml.matchAll(imageSrcRegex)];

      for (const match of imageMatches) {
        const [fullTag = "", beforeSrc = "", src = "", afterSrc = ""] = match;
        const localImagePath = normalizeLocalAssetPath(htmlPath, src);

        if (!localImagePath || !(await exists(localImagePath))) continue;

        try {
          const imageBuffer = await readFile(localImagePath);
          const imageUrl = bufferToUrl(
            imageBuffer,
            getMimeType(localImagePath)
          );

          dependencies.add(localImagePath);
          previewHtml = previewHtml.replace(
            fullTag,
            `<img${beforeSrc}src="${imageUrl}"${afterSrc}>`
          );
        } catch {
          // Ignore failure to inline image
        }
      }

      return { dependencies, html: previewHtml };
    },
    [exists, normalizeLocalAssetPath, readFile]
  );
  const setUrl = useCallback(
    async (addressInput: string): Promise<void> => {
      const { contentWindow } = iframeRef.current || {};

      if (contentWindow?.location) {
        const publishedResolution = isPublishedPagesUrl(addressInput)
          ? resolvePublishedPagesUrl(addressInput)
          : undefined;
        let previewPath = addressInput;

        if (
          publishedResolution?.localPath &&
          (await exists(publishedResolution.localPath))
        ) {
          const publishedStats = await stat(publishedResolution.localPath);

          previewPath = publishedStats.isDirectory()
            ? join(publishedResolution.localPath, "index.html")
            : publishedResolution.localPath;
        } else if (publishedResolution) {
          localPreviewDependenciesRef.current = new Set();
          localPreviewHtmlPathRef.current = "";
          localPreviewPublicUrlRef.current = "";
          setSrcDoc(NOT_FOUND);
          prependFileToTitle("404 Not Found");
          setLoading(false);
          return;
        }

        const isHtml =
          [".htm", ".html"].includes(getExtension(previewPath)) &&
          (await exists(previewPath));

        setLoading(true);
        if (isHtml) {
          const { dependencies, html } =
            await buildLocalHtmlPreview(previewPath);

          localPreviewDependenciesRef.current = dependencies;
          localPreviewHtmlPathRef.current = previewPath;
          localPreviewPublicUrlRef.current = publishedResolution
            ? addressInput.endsWith(".html")
              ? addressInput
              : `${addressInput.replace(/\/$/, "")}/`
            : addressInput;
          setSrcDoc(html);
          prependFileToTitle(
            publishedResolution
              ? `${publishedResolution.site.projectName} - Pages`
              : basename(previewPath)
          );
        } else {
          localPreviewDependenciesRef.current = new Set();
          localPreviewHtmlPathRef.current = "";
          localPreviewPublicUrlRef.current = "";
        }
        setIcon(id, processDirectory.Browser.icon);

        if (addressInput.toLowerCase().startsWith(DINO_GAME.url)) {
          changeIframeWindowLocation(
            `${window.location.origin}${DINO_GAME.path}`,
            contentWindow
          );
          prependFileToTitle(`${DINO_GAME.url}/`);
        } else if (!isHtml) {
          if (isBlockedAdultSearchInput(addressInput)) {
            setSrcDoc(BLOCKED_ADULT_CONTENT);
            prependFileToTitle("Blocked content");

            return;
          }

          const processedUrl = await getUrlOrSearch(addressInput);

          if (
            isBlockedAdultUrl(processedUrl) ||
            isBlockedAdultSearchUrl(processedUrl)
          ) {
            setSrcDoc(BLOCKED_ADULT_CONTENT);
            prependFileToTitle("Blocked content");

            return;
          }

          if (
            LOCAL_HOST.has(processedUrl.host) ||
            LOCAL_HOST.has(addressInput)
          ) {
            const directory =
              decodeURI(processedUrl.pathname).replace(/\/$/, "") || "/";
            const searchParams = Object.fromEntries(
              new URLSearchParams(
                processedUrl.search.replace(";", "&")
              ).entries()
            );
            const { O: order, C: column } = searchParams;
            const isAscending = !order || order === "A";

            let newSrcDoc = NOT_FOUND;
            let newTitle = "404 Not Found";

            if (
              (await exists(directory)) &&
              (await stat(directory)).isDirectory()
            ) {
              const dirStats = (
                await Promise.all<DirectoryEntries>(
                  (await readdir(directory)).map(async (entry) => {
                    const href = join(directory, entry);
                    let description;
                    let shortcutUrl;

                    if (getExtension(entry) === SHORTCUT_EXTENSION) {
                      try {
                        ({ comment: description, url: shortcutUrl } =
                          getShortcutInfo(await readFile(href)));
                      } catch {
                        // Ignore failure to read shortcut
                      }
                    }

                    const filePath =
                      shortcutUrl && (await exists(shortcutUrl))
                        ? shortcutUrl
                        : href;
                    const stats = await stat(filePath);
                    const isDir = stats.isDirectory();

                    return {
                      description,
                      href: isDir && shortcutUrl ? shortcutUrl : href,
                      icon: isDir ? "folder" : undefined,
                      modified: getModifiedTime(filePath, stats),
                      size: isDir || shortcutUrl ? undefined : stats.size,
                    };
                  })
                )
              )
                .sort(
                  (a, b) =>
                    Number(b.icon === "folder") - Number(a.icon === "folder")
                )
                .sort((a, b) => {
                  const aIsFolder = a.icon === "folder";
                  const bIsFolder = b.icon === "folder";

                  if (aIsFolder === bIsFolder) {
                    const aName = basename(a.href);
                    const bName = basename(b.href);

                    if (isAscending) return aName < bName ? -1 : 1;

                    return aName > bName ? -1 : 1;
                  }

                  return 0;
                })
                .sort((a, b) => {
                  if (!column || column === "N") return 0;

                  const sortValue = (
                    getValue: (entry: DirectoryEntries) => number | string
                  ): number => {
                    const aValue = getValue(a);
                    const bValue = getValue(b);

                    if (aValue === bValue) return 0;
                    if (isAscending) return aValue < bValue ? -1 : 1;

                    return aValue > bValue ? -1 : 1;
                  };

                  if (column === "S") {
                    return sortValue(({ size }) => size ?? 0);
                  }

                  if (column === "M") {
                    return sortValue(({ modified }) => modified ?? 0);
                  }

                  if (column === "D") {
                    return sortValue(({ description }) => description ?? "");
                  }

                  return 0;
                })
                .sort(
                  (a, b) =>
                    Number(b.icon === "folder") - Number(a.icon === "folder")
                );

              iframeRef.current?.addEventListener(
                "load",
                () => {
                  try {
                    contentWindow.document.body
                      .querySelectorAll("a")
                      .forEach((a) => {
                        a.addEventListener("click", (event) => {
                          event.preventDefault();

                          const target =
                            event.currentTarget as HTMLAnchorElement;
                          const isDir =
                            target.getAttribute("type") === "folder";
                          const { origin, pathname, search } = new URL(
                            target.href
                          );

                          if (search) {
                            goToLink(
                              `${origin}${encodeURI(directory)}${search}`
                            );
                          } else if (isDir) {
                            goToLink(target.href);
                          } else if (fs && target.href) {
                            getInfoWithExtension(
                              fs,
                              decodeURI(pathname),
                              getExtension(pathname),
                              ({ pid, url: infoUrl }) => {
                                open(pid || "OpenWith", { url: infoUrl });

                                if (pid && infoUrl) {
                                  updateRecentFiles(infoUrl, pid);
                                }
                              }
                            );
                          }
                        });
                      });
                  } catch {
                    // Ignore failure to add click event listeners
                  }
                },
                ONE_TIME_PASSIVE_EVENT
              );

              newSrcDoc = createDirectoryIndex(
                directory,
                processedUrl.origin,
                searchParams,
                directory === "/"
                  ? dirStats
                  : [
                      {
                        href: resolve(directory, ".."),
                        icon: "back",
                      },
                      ...dirStats,
                    ]
              );

              newTitle = `Index of ${directory}`;
            }

            setSrcDoc(newSrcDoc);
            prependFileToTitle(newTitle);
          } else {
            const addressUrl = PROXIES[proxyState]
              ? await PROXIES[proxyState](processedUrl.href)
              : processedUrl.href;

            changeIframeWindowLocation(addressUrl, contentWindow);

            if (addressUrl.startsWith(GOOGLE_SEARCH_QUERY)) {
              prependFileToTitle(`${addressInput} - Google Search`);
            } else {
              const { name = initialTitle } =
                bookmarks?.find(
                  ({ url: bookmarkUrl }) => bookmarkUrl === addressInput
                ) || {};

              prependFileToTitle(name);
            }

            if (addressInput.startsWith("ipfs://")) {
              setIcon(id, "/System/Icons/Favicons/ipfs.webp");
            } else {
              const favicon = new Image();
              const faviconUrl = `${
                new URL(addressUrl).origin
              }${FAVICON_BASE_PATH}`;

              favicon.addEventListener(
                "error",
                () => {
                  const { icon } =
                    bookmarks?.find(
                      ({ url: bookmarkUrl }) => bookmarkUrl === addressUrl
                    ) || {};

                  if (icon) setIcon(id, icon);
                },
                ONE_TIME_PASSIVE_EVENT
              );
              favicon.addEventListener(
                "load",
                () => setIcon(id, faviconUrl),
                ONE_TIME_PASSIVE_EVENT
              );
              favicon.decoding = "async";
              favicon.src = faviconUrl;
            }
          }
        }
      }
    },
    [
      exists,
      fs,
      goToLink,
      id,
      initialTitle,
      open,
      buildLocalHtmlPreview,
      prependFileToTitle,
      proxyState,
      readdir,
      setIcon,
      stat,
      updateRecentFiles,
    ]
  );
  const supportsCredentialless = useMemo(
    () => "credentialless" in HTMLIFrameElement.prototype,
    []
  );

  useEffect(() => {
    if (process && history[position] !== currentUrl.current) {
      currentUrl.current = history[position];
      setUrl(history[position]);
    }
  }, [history, position, process, setUrl]);

  useEffect(() => {
    const previewHtmlPath = localPreviewHtmlPathRef.current;

    if (!previewHtmlPath) return;

    const watchedPaths = localPreviewDependenciesRef.current;
    const watcherFolders = new Set<string>(
      [...watchedPaths].map((dependencyPath) => dirname(dependencyPath))
    );

    watcherFolders.add(dirname(previewHtmlPath));

    const watcherCallbacks = new Map<
      string,
      (newFile?: string, oldFile?: string) => Promise<void>
    >();

    const createRefreshPreview =
      (watcherFolder: string) =>
      async (newFile?: string, oldFile?: string): Promise<void> => {
        const activePreviewPath = localPreviewHtmlPathRef.current;
        const activeWatchedPaths = localPreviewDependenciesRef.current;

        if (!activePreviewPath || activeWatchedPaths.size === 0) return;

        const changedPaths = [newFile, oldFile]
          .filter(Boolean)
          .map((entryName) => join(watcherFolder, entryName as string));
        const shouldRefresh =
          changedPaths.length === 0 ||
          changedPaths.some((changedPath) =>
            activeWatchedPaths.has(changedPath)
          );

        if (!shouldRefresh) return;

        await setUrl(activePreviewPath);
      };

    watcherFolders.forEach((watcherFolder) => {
      const refreshPreview = createRefreshPreview(watcherFolder);

      watcherCallbacks.set(watcherFolder, refreshPreview);
      addFsWatcher(watcherFolder, refreshPreview);
    });

    return () => {
      watcherCallbacks.forEach((refreshPreview, watcherFolder) => {
        removeFsWatcher(watcherFolder, refreshPreview);
      });
    };
  }, [addFsWatcher, removeFsWatcher, setUrl, srcDoc]);

  useEffect(() => {
    if (iframeRef.current) {
      linkElement(id, "peekElement", iframeRef.current);
    }
  }, [id, linkElement]);

  return (
    <StyledBrowser $hasSrcDoc={Boolean(srcDoc)}>
      <nav>
        <div>
          <Button
            disabled={!canGoBack}
            onClick={() => changeHistory(-1)}
            {...label("Click to go back")}
            {...backMenu}
          >
            <Arrow direction="left" />
          </Button>
          <Button
            disabled={!canGoForward}
            onClick={() => changeHistory(1)}
            {...label("Click to go forward")}
            {...forwardMenu}
          >
            <Arrow direction="right" />
          </Button>
          <Button
            disabled={loading}
            onClick={() => setUrl(history[position])}
            onContextMenu={haltEvent}
            {...label("Reload this page")}
          >
            {loading ? <Stop /> : <Refresh />}
          </Button>
        </div>
        <input
          ref={inputRef}
          defaultValue={initialUrl}
          onFocusCapture={() => inputRef.current?.select()}
          onKeyDown={({ key }) => {
            if (inputRef.current && key === "Enter") {
              changeUrl(id, inputRef.current.value);
              if (currentUrl.current === inputRef.current.value) {
                setUrl(inputRef.current.value);
              }
              window.getSelection()?.removeAllRanges();
              inputRef.current.blur();
            }
          }}
          {...ADDRESS_INPUT_PROPS}
        />
        <Button
          className="proxy"
          onClick={proxyMenu.onContextMenuCapture}
          onContextMenu={haltEvent}
          {...label("Proxy settings")}
        >
          <Network />
        </Button>
      </nav>
      <iframe
        ref={iframeRef}
        onLoad={() => {
          try {
            const previewHtmlPath = localPreviewHtmlPathRef.current;
            const previewPublicUrl = localPreviewPublicUrlRef.current;

            if (previewHtmlPath) {
              iframeRef.current?.contentWindow?.document
                ?.querySelectorAll("a[href]")
                .forEach((anchor) => {
                  anchor.addEventListener("click", (event) => {
                    const href =
                      (event.currentTarget as HTMLAnchorElement).getAttribute(
                        "href"
                      ) || "";

                    if (
                      !href ||
                      href.startsWith("#") ||
                      href.startsWith("mailto:") ||
                      href.startsWith("tel:") ||
                      href.startsWith("javascript:")
                    ) {
                      return;
                    }

                    event.preventDefault();

                    if (previewPublicUrl) {
                      void goToLink(new URL(href, previewPublicUrl).href);
                      return;
                    }

                    void goToLink(
                      resolve(dirname(previewHtmlPath), href).replace(
                        /\\/g,
                        "/"
                      )
                    );
                  });
                });
            }

            iframeRef.current?.contentWindow?.addEventListener("focus", () =>
              setForegroundId(id)
            );
          } catch {
            // Ignore failure to add focus event listener
          }

          if (loading) setLoading(false);
        }}
        srcDoc={srcDoc || undefined}
        title={id}
        {...IFRAME_CONFIG}
        credentialless={supportsCredentialless ? "credentialless" : undefined}
      />
    </StyledBrowser>
  );
};

export default memo(Browser);

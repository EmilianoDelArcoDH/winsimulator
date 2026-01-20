import { type AppProps } from "next/app";
import { memo } from "react";
import { ErrorBoundary } from "components/pages/ErrorBoundary";
import Metadata from "components/pages/Metadata";
import StyledApp from "components/pages/StyledApp";
import { FileSystemProvider } from "contexts/fileSystem";
import { MenuProvider } from "contexts/menu";
import { ProcessProvider } from "contexts/process";
import { SessionProvider } from "contexts/session";
import { ViewportProvider } from "contexts/viewport";

import { useEffect } from "react";

const App = ({ Component: Index, pageProps }: AppProps): React.ReactElement => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Global error handler
      const onError = (event: ErrorEvent) => {
        // eslint-disable-next-line no-console
        console.error(
          "[DH console] Global error:",
          event.error || event.message
        );
      };
      // Global unhandledrejection handler
      const onRejection = (event: PromiseRejectionEvent) => {
        // eslint-disable-next-line no-console
        console.error(
          "[DH console] Unhandled promise rejection:",
          event.reason
        );
      };
      window.addEventListener("error", onError);
      window.addEventListener("unhandledrejection", onRejection);
      return () => {
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onRejection);
      };
    }
    return undefined;
  }, []);

  return (
    <ViewportProvider>
      <ProcessProvider>
        <FileSystemProvider>
          <SessionProvider>
            <ErrorBoundary>
              <Metadata />
              <StyledApp>
                <MenuProvider>
                  <Index {...pageProps} />
                </MenuProvider>
              </StyledApp>
            </ErrorBoundary>
          </SessionProvider>
        </FileSystemProvider>
      </ProcessProvider>
    </ViewportProvider>
  );
};

export default memo(App);

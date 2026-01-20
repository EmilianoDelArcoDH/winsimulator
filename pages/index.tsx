import { memo, useState } from "react";
import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import useGlobalErrorHandler from "hooks/useGlobalErrorHandler";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();
  useGlobalErrorHandler();

  // Dev-only error boundary and fallback UI
  const [error, setError] = useState<Error | null>(null);

  if (process.env.NODE_ENV === "development") {
    try {
      // Instrument: log render attempt
      // eslint-disable-next-line no-console
      console.log("[DH console] Rendering Desktop (dev mode)");
      if (error) throw error;
      return (
        <Desktop>
          <Taskbar />
          <AppsLoader />
        </Desktop>
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[DH console] Desktop failed to render:", err);
      if (!error) setError(err instanceof Error ? err : new Error(String(err)));
      return (
        <div
          style={{
            background: "#fff",
            color: "#b00",
            fontFamily: "monospace",
            padding: 32,
            border: "2px solid #b00",
            borderRadius: 8,
            margin: 32,
            maxWidth: 600,
            wordBreak: "break-word",
          }}
        >
          <h1>Desktop failed to render</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(err)}</pre>
          <p>Check the console for details.</p>
        </div>
      );
    }
  }

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export default memo(Index);

import { useMemo } from "react";
import { useMenu } from "contexts/menu";
import { type ContextMenuCapture } from "contexts/menu/useMenuContextState";
import { useSession } from "contexts/session";
import { t } from "utils/i18n";

const useClockContextMenu = (
  toggleCalendar: (showCalendar?: boolean) => void
): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { clockSource, language, setClockSource } = useSession();

  return useMemo(
    () =>
      contextMenu?.(() => {
        toggleCalendar(false);

        const isLocal = clockSource === "local";

        return [
          {
            action: () => setClockSource("local"),
            label: t(language, "taskbar.clock.localTime"),
            toggle: isLocal,
          },
          {
            action: () => setClockSource("ntp"),
            label: t(language, "taskbar.clock.serverTime"),
            toggle: !isLocal,
          },
        ];
      }),
    [clockSource, contextMenu, language, setClockSource, toggleCalendar]
  );
};

export default useClockContextMenu;

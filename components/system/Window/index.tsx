import { memo, useCallback } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledPeekViewport from "components/system/Taskbar/TaskbarEntry/Peek/StyledPeekViewport";
import RndWindow from "components/system/Window/RndWindow";
import StyledWindow from "components/system/Window/StyledWindow";
import Titlebar from "components/system/Window/Titlebar";
import useFocusable from "components/system/Window/useFocusable";
import useWindowTransitions from "components/system/Window/useWindowTransitions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

type WindowProps = ComponentProcessProps & {
  docked?: boolean;
};

const Window: FC<WindowProps> = ({ children, docked = false, id }) => {
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const {
    backgroundBlur,
    backgroundColor,
    Component,
    hideTitlebar,
    peekElement,
  } = process || {};
  const resolvedHideTitlebar = id.startsWith("GitBash") ? true : hideTitlebar;
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { zIndex, ...focusableProps } = useFocusable(id);
  const windowTransitions = useWindowTransitions(id);
  const linkViewportEntry = useCallback(
    (viewportEntry: HTMLDivElement) => {
      if (Component && !peekElement && viewportEntry) {
        linkElement(id, "peekElement", viewportEntry);
      }
    },
    [Component, id, linkElement, peekElement]
  );
  const linkDockedWindow = useCallback(
    (windowEntry: HTMLElement | null) => {
      if (docked && Component && windowEntry) {
        linkElement(id, "componentWindow", windowEntry);
      }
    },
    [Component, docked, id, linkElement]
  );

  const windowShell = (
    <StyledWindow
      ref={linkDockedWindow}
      $backgroundBlur={backgroundBlur}
      $backgroundColor={backgroundColor}
      $isForeground={isForeground}
      {...focusableProps}
      {...windowTransitions}
    >
      <StyledPeekViewport ref={linkViewportEntry}>
        {!resolvedHideTitlebar && <Titlebar id={id} />}
        {children}
      </StyledPeekViewport>
    </StyledWindow>
  );

  if (docked) {
    return windowShell;
  }

  return (
    <RndWindow id={id} zIndex={zIndex}>
      {windowShell}
    </RndWindow>
  );
};

export default memo(Window);

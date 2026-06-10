import { type Props, type RndResizeCallback } from "react-rnd";
import { type DraggableEventHandler } from "react-draggable";
import { useCallback, useEffect, useMemo, useState } from "react";
import rndDefaults, {
  RESIZING_DISABLED,
  RESIZING_ENABLED,
} from "components/system/Window/RndWindow/rndDefaults";
import useDraggable from "components/system/Window/RndWindow/useDraggable";
import useResizable from "components/system/Window/RndWindow/useResizable";
import { minMaxSize } from "components/system/Window/functions";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";
import { getWindowViewport, pxToNum } from "utils/functions";
import { TOOLTIP_REPOSITION_EVENT } from "components/onboarding/tooltipPlacement";

const enableIframeCapture = (enable = true): void =>
  document.querySelectorAll("iframe").forEach((iframe) => {
    // eslint-disable-next-line no-param-reassign
    iframe.style.pointerEvents = enable ? "initial" : "none";
  });

let tooltipRepositionFrame: number | undefined;

const notifyTooltipReposition = (): void => {
  if (tooltipRepositionFrame !== undefined) return;

  tooltipRepositionFrame = window.requestAnimationFrame(() => {
    tooltipRepositionFrame = undefined;
    window.dispatchEvent(new Event(TOOLTIP_REPOSITION_EVENT));
  });
};

const useRnd = (id: string): Props => {
  const {
    processes: {
      [id]: {
        allowResizing = true,
        autoSizing = false,
        lockAspectRatio = false,
        maximized = false,
      } = {},
    },
  } = useProcesses();
  const { setWindowStates } = useSession();
  const [size, setSize] = useResizable(id, autoSizing);
  const [position, setPosition] = useDraggable(id, size);
  const [viewport, setViewport] = useState(() => getWindowViewport());
  useEffect(() => {
    const onWindowResize = (): void => {
      setViewport(getWindowViewport());
    };

    window.addEventListener("resize", onWindowResize, { passive: true });

    return () => window.removeEventListener("resize", onWindowResize);
  }, []);
  const clampPosition = useCallback(
    (
      desiredPosition: { x: number; y: number },
      currentSize: { height: number; width: number }
    ) => {
      const viewportBounds = getWindowViewport();
      const maxX = Math.max(0, viewportBounds.x - currentSize.width);
      const maxY = Math.max(0, viewportBounds.y - currentSize.height);

      return {
        x: Math.max(0, Math.min(desiredPosition.x, maxX)),
        y: Math.max(0, Math.min(desiredPosition.y, maxY)),
      };
    },
    []
  );
  const onDragStop: DraggableEventHandler = useCallback(
    (_event, { x, y }) => {
      enableIframeCapture();

      const clampedPosition = clampPosition(
        { x, y },
        {
          height: pxToNum(size.height),
          width: pxToNum(size.width),
        }
      );

      setPosition(clampedPosition);
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          ...currentWindowStates[id],
          position: clampedPosition,
        },
      }));
      notifyTooltipReposition();
    },
    [clampPosition, id, setPosition, setWindowStates, size]
  );
  const onResizeStop: RndResizeCallback = useCallback(
    (
      _event,
      _direction,
      { style: { height, width, transform } },
      _delta,
      resizePosition
    ) => {
      const [, x, y] =
        /translate\((-?\d+)px, (-?\d+)px\)/.exec(transform) || [];
      const newPosition =
        typeof x === "string" && typeof y === "string"
          ? { x: pxToNum(x), y: pxToNum(y) }
          : resizePosition;

      enableIframeCapture();

      const boundedSize = minMaxSize(
        { height: pxToNum(height), width: pxToNum(width) },
        lockAspectRatio
      );

      if (newPosition.y < 0) {
        boundedSize.height = pxToNum(boundedSize.height) + newPosition.y;
        newPosition.y = 0;
      }

      const clampedPosition = clampPosition(newPosition, {
        height: pxToNum(boundedSize.height),
        width: pxToNum(boundedSize.width),
      });

      setSize(boundedSize);
      setPosition(clampedPosition);
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          ...currentWindowStates[id],
          position: clampedPosition,
          size: boundedSize,
        },
      }));
      notifyTooltipReposition();
    },
    [clampPosition, id, lockAspectRatio, setPosition, setSize, setWindowStates]
  );
  const disableIframeCapture = useCallback(
    () => enableIframeCapture(false),
    []
  );
  const enableResizing = useMemo(
    () => (allowResizing && !maximized ? RESIZING_ENABLED : RESIZING_DISABLED),
    [allowResizing, maximized]
  );
  return {
    disableDragging: maximized,
    enableResizing,
    lockAspectRatio,
    maxHeight: viewport.y,
    maxWidth: viewport.x,
    onDrag: notifyTooltipReposition,
    onDragStart: disableIframeCapture,
    onDragStop,
    onResize: notifyTooltipReposition,
    onResizeStart: disableIframeCapture,
    onResizeStop,
    position,
    size,
    ...rndDefaults,
  };
};

export default useRnd;

export type TooltipPlacement =
  | "auto"
  | "bottom"
  | "center"
  | "left"
  | "right"
  | "top";

export type RectLike = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

export type SizeLike = {
  height: number;
  width: number;
};

export type TooltipPosition = {
  isFallback: boolean;
  margin: number;
  placement: Exclude<TooltipPlacement, "auto">;
  x: number;
  y: number;
};

export const TOOLTIP_REPOSITION_EVENT = "winsim:tooltip-reposition";
export const TOOLTIP_RESIZE_EVENT = "winsim:tooltip-resize";

const TOOLTIP_GAP = 12;

export const getTooltipViewportMargin = (viewportWidth: number): number => {
  if (viewportWidth < 600) return 8;
  if (viewportWidth <= 1024) return 12;

  return 16;
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

export const getBestTooltipPlacement = (
  targetRect: RectLike,
  tooltipSize: SizeLike,
  viewportSize: SizeLike,
  preferredPlacement?: TooltipPlacement
): TooltipPosition => {
  const margin = getTooltipViewportMargin(viewportSize.width);
  const maximumX = viewportSize.width - tooltipSize.width - margin;
  const maximumY = viewportSize.height - tooltipSize.height - margin;
  const canFitViewport = maximumX >= margin && maximumY >= margin;
  const centeredX =
    targetRect.left + (targetRect.width - tooltipSize.width) / 2;
  const centeredY =
    targetRect.top + (targetRect.height - tooltipSize.height) / 2;
  const candidates: Record<
    Exclude<TooltipPlacement, "auto" | "center">,
    { x: number; y: number }
  > = {
    bottom: {
      x: clamp(centeredX, margin, maximumX),
      y: targetRect.bottom + TOOLTIP_GAP,
    },
    left: {
      x: targetRect.left - tooltipSize.width - TOOLTIP_GAP,
      y: clamp(centeredY, margin, maximumY),
    },
    right: {
      x: targetRect.right + TOOLTIP_GAP,
      y: clamp(centeredY, margin, maximumY),
    },
    top: {
      x: clamp(centeredX, margin, maximumX),
      y: targetRect.top - tooltipSize.height - TOOLTIP_GAP,
    },
  };
  const requestedOrder = [
    preferredPlacement,
    "bottom",
    "top",
    "right",
    "left",
  ].filter(
    (placement): placement is Exclude<TooltipPlacement, "auto" | "center"> =>
      placement !== undefined && placement !== "auto" && placement !== "center"
  );
  const placements = [...new Set(requestedOrder)];

  if (preferredPlacement === "center") {
    return {
      isFallback: false,
      margin,
      placement: "center",
      x: Math.max(margin, (viewportSize.width - tooltipSize.width) / 2),
      y: Math.max(margin, (viewportSize.height - tooltipSize.height) / 2),
    };
  }

  if (canFitViewport) {
    const placement = placements.find((candidatePlacement) => {
      const { x, y } = candidates[candidatePlacement];

      return (
        x >= margin &&
        y >= margin &&
        x + tooltipSize.width <= viewportSize.width - margin &&
        y + tooltipSize.height <= viewportSize.height - margin
      );
    });

    if (placement) {
      return {
        isFallback: false,
        margin,
        placement,
        ...candidates[placement],
      };
    }
  }

  return {
    isFallback: true,
    margin,
    placement: "center",
    x: Math.max(margin, (viewportSize.width - tooltipSize.width) / 2),
    y: Math.max(margin, (viewportSize.height - tooltipSize.height) / 2),
  };
};

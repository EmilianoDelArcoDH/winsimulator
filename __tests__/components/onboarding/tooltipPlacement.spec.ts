import {
  getBestTooltipPlacement,
  type RectLike,
} from "components/onboarding/tooltipPlacement";

const tooltipSize = { height: 220, width: 360 };

const target = (values: Partial<RectLike>): RectLike => ({
  bottom: 0,
  height: 40,
  left: 0,
  right: 0,
  top: 0,
  width: 80,
  ...values,
});

describe("getBestTooltipPlacement", () => {
  test("places the tooltip above a target near the bottom", () => {
    const result = getBestTooltipPlacement(
      target({
        bottom: 980,
        left: 344,
        right: 424,
        top: 940,
      }),
      tooltipSize,
      { height: 1024, width: 768 }
    );

    expect(result.placement).toBe("top");
  });

  test("places the tooltip below a target near the top", () => {
    const result = getBestTooltipPlacement(
      target({ bottom: 60, left: 344, right: 424, top: 20 }),
      tooltipSize,
      { height: 1024, width: 768 }
    );

    expect(result.placement).toBe("bottom");
  });

  test("keeps a tooltip inside the viewport near the right edge", () => {
    const result = getBestTooltipPlacement(
      target({ bottom: 440, left: 920, right: 1000, top: 400 }),
      tooltipSize,
      { height: 768, width: 1024 },
      "right"
    );

    expect(result.x + tooltipSize.width).toBeLessThanOrEqual(
      1024 - result.margin
    );
    expect(result.placement).not.toBe("right");
  });

  test("fits within a 768x1024 tablet viewport", () => {
    const result = getBestTooltipPlacement(
      target({ bottom: 540, left: 344, right: 424, top: 500 }),
      tooltipSize,
      { height: 1024, width: 768 }
    );

    expect(result.x).toBeGreaterThanOrEqual(result.margin);
    expect(result.y).toBeGreaterThanOrEqual(result.margin);
    expect(result.x + tooltipSize.width).toBeLessThanOrEqual(
      768 - result.margin
    );
    expect(result.y + tooltipSize.height).toBeLessThanOrEqual(
      1024 - result.margin
    );
  });

  test("uses center when no side has enough room", () => {
    const result = getBestTooltipPlacement(
      target({
        bottom: 500,
        height: 400,
        left: 100,
        right: 700,
        top: 100,
        width: 600,
      }),
      { height: 360, width: 500 },
      { height: 600, width: 800 }
    );

    expect(result.isFallback).toBe(true);
    expect(result.placement).toBe("center");
  });
});

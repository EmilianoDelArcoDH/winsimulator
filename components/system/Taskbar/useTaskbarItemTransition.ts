import { type MotionProps } from "motion/react";
import { useMemo } from "react";
import { TASKBAR_HEIGHT, TRANSITIONS_IN_SECONDS } from "utils/constants";
import { viewHeight } from "utils/functions";

const useTaskbarItemTransition = (
  maxHeight: number,
  dynamicPadding = true,
  paddingOffset = 0.5,
  heightOffset = 0.75
): MotionProps => {
  const height = useMemo(
    () => Math.min(maxHeight, viewHeight() - TASKBAR_HEIGHT),
    [maxHeight]
  );

  return {
    animate: "active",
    exit: {
      height: `${height * heightOffset}px`,
      transition: {
        duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM / 10,
        ease: "circIn",
      },
    },
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM,
      ease: [0.1, 0.9, 0.2, 1],
    },
    variants: {
      active: {
        height: `${height}px`,
        opacity: 1,
        paddingTop: 0,
        scale: 1,
        y: 0,
      },
      initial: {
        height: `${height * heightOffset}px`,
        opacity: 0,
        paddingTop: dynamicPadding ? `${height * paddingOffset}px` : 0,
        scale: 0.96,
        y: 8,
      },
    },
  };
};

export default useTaskbarItemTransition;

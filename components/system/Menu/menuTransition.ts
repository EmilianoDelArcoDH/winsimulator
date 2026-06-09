import { type MotionProps } from "motion/react";
import { TRANSITIONS_IN_SECONDS } from "utils/constants";

const menuTransition: MotionProps = {
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -2 },
  initial: { opacity: 0, scale: 0.98, y: -2 },
  transition: {
    duration: TRANSITIONS_IN_SECONDS.WINDOW,
    ease: [0.1, 0.9, 0.2, 1],
  },
};

export default menuTransition;

import { useState, useRef, useCallback } from "react";

export const useMenuPreload = (
  preloadCallback: () => Promise<unknown>
): {
  onMouseOverCapture?: React.MouseEventHandler<
    HTMLButtonElement | HTMLDivElement
  >;
} => {
  const [preloaded, setPreloaded] = useState(false);
  const initalizedPreload = useRef(false);
  const preloadMenu = useCallback((): void => {
    if (initalizedPreload.current) return;

    initalizedPreload.current = true;

    preloadCallback()
      .then(() => setPreloaded(true))
      .catch(() => {
        initalizedPreload.current = false;
      });
  }, [preloadCallback]);

  return preloaded ? {} : { onMouseOverCapture: preloadMenu };
};

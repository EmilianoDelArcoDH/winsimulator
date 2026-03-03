import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Mosaic,
  type MosaicNode,
} from "react-mosaic-component";
import { useProcesses } from "contexts/process";
import { type Process } from "contexts/process/types";
import { PROCESS_DELIMITER } from "utils/constants";

const RenderComponent = dynamic(
  () => import("components/system/Apps/RenderComponent")
);

const buildMosaicTree = (
  ids: string[],
  direction: "row" | "column" = "row"
): MosaicNode<string> | null => {
  if (ids.length === 0) {
    return null;
  }

  if (ids.length === 1) {
    return ids[0] || null;
  }

  const middleIndex = Math.ceil(ids.length / 2);
  const firstGroup = ids.slice(0, middleIndex);
  const secondGroup = ids.slice(middleIndex);

  return {
    direction,
    first: buildMosaicTree(
      firstGroup,
      direction === "row" ? "column" : "row"
    ) as MosaicNode<string>,
    second: buildMosaicTree(
      secondGroup,
      direction === "row" ? "column" : "row"
    ) as MosaicNode<string>,
    splitPercentage: 50,
  };
};

const AppsLoader: FC = () => {
  const { processes = {} } = useProcesses();
  const [mosaicLayout, setMosaicLayout] = useState<MosaicNode<string> | null>(
    null
  );
  const processEntries = useMemo(
    () =>
      Object.entries(processes).filter(
        ([, { closing, Component }]) => Boolean(Component) && !closing
      ),
    [processes]
  );
  const tiledProcessIds = useMemo(
    () =>
      processEntries
        .filter(
          ([id, { dialogProcess, hasWindow = true, minimized }]) => {
            const [processId = ""] = id.split(PROCESS_DELIMITER);

            return (
              processId === "MonacoEditor" &&
              hasWindow &&
              !dialogProcess &&
              !minimized
            );
          }
        )
        .map(([id]) => id),
    [processEntries]
  );

  useEffect(() => {
    setMosaicLayout(buildMosaicTree(tiledProcessIds));
  }, [tiledProcessIds]);

  const tiledIdSet = useMemo(() => new Set(tiledProcessIds), [tiledProcessIds]);
  const floatingEntries = useMemo(
    () => processEntries.filter(([id]) => !tiledIdSet.has(id)),
    [processEntries, tiledIdSet]
  );

  if (tiledProcessIds.length <= 1 || !mosaicLayout) {
    return (
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {processEntries.map(([id, { Component, hasWindow }]) =>
          id &&
          Component && (
            <RenderComponent
              key={id}
              Component={Component}
              hasWindow={hasWindow}
              id={id}
            />
          )
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <div style={{ inset: 0, position: "fixed", zIndex: 2 }}>
        <Mosaic<string>
          renderTile={(id: string) => {
            const process = processes[id] as Process | undefined;

            if (!process?.Component) {
              return <div />;
            }

            return (
              <div style={{ height: "100%", minHeight: 0, minWidth: 0 }}>
                <RenderComponent
                  Component={process.Component}
                  hasWindow
                  id={id}
                  windowMode="docked"
                />
              </div>
            );
          }}
          value={mosaicLayout}
          onChange={(nextLayout) =>
            setMosaicLayout(nextLayout as MosaicNode<string> | null)
          }
        />
      </div>

      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {floatingEntries.map(([id, { Component, hasWindow }]) =>
          id &&
          Component && (
            <RenderComponent
              key={id}
              Component={Component}
              hasWindow={hasWindow}
              id={id}
            />
          )
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(AppsLoader);

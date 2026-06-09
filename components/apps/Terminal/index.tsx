import { memo } from "react";
import StyledTerminal from "components/apps/Terminal/StyledTerminal";
import useTerminal from "components/apps/Terminal/useTerminal";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

const Terminal: FC<ComponentProcessProps> = ({ id }) => (
  <div data-tour="terminal" style={{ height: "100%" }}>
    <AppContainer
      StyledComponent={StyledTerminal}
      id={id}
      useHook={useTerminal}
    />
  </div>
);

export default memo(Terminal);

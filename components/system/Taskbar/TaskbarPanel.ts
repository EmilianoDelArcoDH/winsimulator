import { type RuleSet, css } from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

const TaskbarPanel = (
  height: number,
  width: number,
  left = 0,
  hasBorder = false
): RuleSet<object> => css`
  backdrop-filter: blur(${({ theme }) => theme.effects.acrylic.blur});
  background-color: ${({ theme }) => theme.effects.acrylic.background};
  border: ${({ theme }) =>
    `1px solid ${
      hasBorder ? theme.effects.border.strong : theme.effects.border.subtle
    }`};
  border-radius: ${({ theme }) => theme.effects.radius.panel};
  bottom: ${TASKBAR_HEIGHT + 8}px;
  box-shadow: ${({ theme }) => theme.effects.shadow.flyout};
  contain: strict;
  display: flex;
  height: 100%;
  left: ${left}px;
  max-height: ${height}px;
  max-width: ${width}px;
  position: absolute;
  width: calc(100% - ${left}px);
  z-index: 10000;

  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    background-color: ${({ theme }) => theme.effects.acrylic.background};
  }
`;

export default TaskbarPanel;

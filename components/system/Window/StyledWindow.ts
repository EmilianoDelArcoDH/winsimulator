import { m as motion } from "motion/react";
import styled from "styled-components";
import StyledLoading from "components/system/Apps/StyledLoading";

type StyledWindowProps = {
  $backgroundBlur?: string;
  $backgroundColor?: string;
  $isForeground: boolean;
  $maximized?: boolean;
};

const StyledWindow = styled(motion.section)<StyledWindowProps>`
  background-color: ${({ $backgroundColor, $isForeground, theme }) =>
    $backgroundColor ||
    ($isForeground ? theme.effects.mica.active : theme.effects.mica.inactive)};
  border-radius: ${({ $maximized, theme }) =>
    $maximized ? 0 : theme.effects.radius.window};
  box-shadow: ${({ $isForeground, theme }) =>
    $isForeground
      ? theme.colors.window.shadow
      : theme.colors.window.shadowInactive};
  contain: strict;
  height: 100%;
  outline: ${({ $isForeground, theme }) =>
    `${theme.sizes.window.outline} solid ${
      $isForeground
        ? theme.colors.window.outline
        : theme.colors.window.outlineInactive
    }`};
  overflow: hidden;
  position: absolute;
  transition:
    background-color ${({ theme }) => theme.effects.transition.normal},
    border-radius ${({ theme }) => theme.effects.transition.normal},
    box-shadow ${({ theme }) => theme.effects.transition.normal};
  width: 100%;

  > div > header:first-child + * {
    height: ${({ theme }) => `calc(100% - ${theme.sizes.titleBar.height}px)`};
  }

  ${StyledLoading} {
    backdrop-filter: ${({ $backgroundBlur }) =>
      $backgroundBlur ? `blur(${$backgroundBlur})` : undefined};
  }
`;

export default StyledWindow;

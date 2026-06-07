import styled from "styled-components";
import Button from "styles/common/Button";

type StyledTaskbarButtonProps = {
  $active: boolean;
  $highlight?: boolean;
  $left?: number;
};

const StyledTaskbarButton = styled(Button)<StyledTaskbarButtonProps>`
  background-color: ${({ $active, $highlight, theme }) =>
    $active &&
    ($highlight
      ? theme.colors.taskbar.foreground
      : theme.colors.taskbar.active)};
  border-radius: ${({ theme }) => theme.effects.radius.control};
  display: flex;
  fill: ${({ theme }) => theme.colors.taskbar.button.color};
  height: 100%;
  left: auto;
  margin: 4px 1px;
  place-content: center;
  place-items: center;
  position: relative;
  transition:
    background-color ${({ theme }) => theme.effects.transition.fast},
    transform ${({ theme }) => theme.effects.transition.fast};

  && {
    width: ${({ theme }) => theme.sizes.taskbar.button.width}px;
  }

  svg {
    height: ${({ theme }) => theme.sizes.taskbar.button.iconSize};
  }

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.taskbar.foreground : theme.colors.taskbar.hover};

    svg {
      fill: ${({ $highlight, theme }) =>
        $highlight ? theme.colors.highlight : undefined};
    }
  }

  &:active {
    background-color: hsl(0 0% 20% / 70%);

    svg {
      fill: ${({ $highlight }) =>
        $highlight ? "hsla(207, 100%, 60%, 80%)" : undefined};
    }

    transform: scale(0.92);
  }
`;

export default StyledTaskbarButton;

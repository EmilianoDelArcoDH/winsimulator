import styled from "styled-components";

type StyledLanguageSwitcherProps = {
  $clockWidth: number;
  $hasAI: boolean;
};

const StyledLanguageSwitcher = styled.button<StyledLanguageSwitcherProps>`
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.text};
  cursor: default;
  font-size: 11px;
  font-weight: 600;
  height: 100%;
  min-width: 42px;
  padding: 0 8px;
  position: absolute;
  right: ${({ theme, $clockWidth, $hasAI }) =>
    `calc(${$clockWidth}px + ${theme.sizes.clock.padding * 2}px + ${$hasAI ? theme.sizes.taskbar.ai.buttonWidth : 0}px)`};

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.taskbar.foreground};
  }
`;

export default StyledLanguageSwitcher;

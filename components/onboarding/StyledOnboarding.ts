import styled from "styled-components";

const StyledOnboarding = styled.aside`
  backdrop-filter: blur(${({ theme }) => theme.sizes.taskbar.panelBlur});
  background: hsl(0 0% 13% / 88%);
  border: 1px solid hsl(0 0% 42% / 65%);
  border-radius: 7px;
  bottom: 58px;
  box-shadow:
    0 10px 32px rgb(0 0 0 / 52%),
    inset 0 1px rgb(255 255 255 / 7%);
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.formats.systemFont};
  max-height: calc(100vh - 76px);
  max-width: min(360px, calc(100vw - 24px));
  overflow: auto;
  padding: 16px;
  position: fixed;
  right: 12px;
  width: 360px;
  z-index: 100001;

  .onboarding-actions {
    > p {
      font-size: 14px;
      line-height: 1.45;
      margin: 0 0 14px;
    }

    > div {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    span {
      color: hsl(0 0% 78%);
      font-size: 12px;
    }

    button {
      background: hsl(0 0% 100% / 8%);
      border: 1px solid hsl(0 0% 58% / 45%);
      border-radius: 4px;
      color: ${({ theme }) => theme.colors.text};
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      min-height: 34px;
      padding: 7px 12px;

      &:hover {
        background: ${({ theme }) => theme.colors.taskbar.hover};
        border-color: hsl(0 0% 70% / 55%);
      }

      &.primary {
        background: #0078d4;
        border-color: #2387cf;
        color: white;
        font-weight: 600;

        &:hover {
          background: #1689d8;
        }
      }
    }
  }

  .completed-message {
    color: ${({ theme }) => theme.colors.progress};
    display: block;
    font-size: 13px;
    margin-top: 12px;
  }

  @media (width <= 600px) {
    bottom: 54px;
    left: 8px;
    max-width: none;
    right: 8px;
    width: auto;
  }

  @media (height <= 520px) {
    bottom: 50px;
    padding: 11px;

    .onboarding-actions {
      > p {
        font-size: 12px;
        margin-bottom: 8px;
      }

      button {
        min-height: 30px;
        padding: 5px 9px;
      }
    }
  }
`;

export default StyledOnboarding;

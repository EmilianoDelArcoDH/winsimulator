import styled from "styled-components";

const StyledStatusBar = styled.footer`
  --vscode-status-bg: #0078d4;
  --vscode-status-bg-hover: #1683d8;
  --vscode-status-bg-active: #006ab1;
  --vscode-status-foreground: #ffffff;

  background-color: var(--vscode-status-bg);
  border-top: 0;
  color: var(--vscode-status-foreground);
  display: flex;
  font-family:
    "Segoe UI Variable",
    "Segoe UI",
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 12px;
  height: 22px;
  line-height: 22px;
  min-height: 22px;
  overflow: hidden;
  place-content: space-between;
  position: relative;
  width: 100%;
  z-index: 1;

  ol.status {
    display: flex;
    height: 22px;
    place-content: flex-end;
    place-items: center;
    white-space: nowrap;

    &:first-of-type {
      justify-content: flex-start;
      min-width: 0;
      padding-left: 6px;
    }

    &:last-of-type {
      flex: 1;
      min-width: 0;
      padding-right: 6px;
    }

    li {
      align-items: center;
      display: inline-flex;
      height: 22px;
      margin: 0;
      max-width: min(320px, 40vw);
      overflow: hidden;
      padding: 0 8px;
      text-overflow: ellipsis;
      white-space: nowrap;

      button {
        align-items: center;
        background: transparent;
        border: 0;
        color: inherit;
        display: inline-flex;
        font-size: inherit;
        height: 22px;
        line-height: 22px;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        padding: 0 8px;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.pretty {
          position: relative;
          top: -1px;
        }

        svg {
          fill: currentColor;
          height: 14px;
          width: 14px;
        }
      }

      &:hover {
        background-color: var(--vscode-status-bg-hover);
      }

      &:active {
        background-color: var(--vscode-status-bg-active);
      }

      &.clickable {
        padding: 0;
      }

      &.save {
        svg {
          margin-top: 1px;
        }
      }
    }
  }
`;

export default StyledStatusBar;

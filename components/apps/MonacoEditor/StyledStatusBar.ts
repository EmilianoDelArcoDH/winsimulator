import styled from "styled-components";

const StyledStatusBar = styled.footer`
  /* stylelint-disable */
  --vscode-status-bg: #007acc;
  --vscode-status-bg-hover: rgb(255 255 255 / 12%);
  --vscode-status-bg-active: rgb(0 0 0 / 18%);
  --vscode-status-foreground: #ffffff;
  --vscode-status-foreground-muted: rgb(255 255 255 / 82%);

  background:
    linear-gradient(180deg, rgb(255 255 255 / 8%), transparent 80%),
    color-mix(in srgb, var(--vscode-status-bg) 93%, #101010);
  border-top: 0;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 10%);
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

    &.status-left {
      justify-content: flex-start;
      min-width: 0;
      padding-left: 0;
    }

    &.status-right {
      flex: 1;
      justify-content: flex-end;
      min-width: 0;
      padding-right: 2px;
    }

    li {
      align-items: center;
      display: inline-flex;
      height: 22px;
      margin: 0;
      max-width: min(320px, 40vw);
      overflow: hidden;
      padding: 0 7px;
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
        padding: 0 7px;
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

      &.branch,
      &.sync,
      &.problems,
      &.feedback,
      &.language-mode {
        color: var(--vscode-status-foreground);
      }

      &.branch::before,
      &.sync::before,
      .problem::before,
      &.feedback::before {
        background: currentColor;
        content: "";
        display: inline-block;
        height: 13px;
        margin-right: 5px;
        opacity: 0.94;
        transform: translateY(2px);
        width: 13px;
      }

      &.branch::before {
        clip-path: path(
          "M5 2a2 2 0 0 1 1 3.73v1.05A3.25 3.25 0 0 0 9.25 10H10a2 2 0 1 1 0 1.25h-.75A4.5 4.5 0 0 1 4.75 6.75V5.73A2 2 0 0 1 5 2Zm0 1.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm6.75 7a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"
        );
      }

      &.sync::before {
        clip-path: path(
          "M3.4 4.6A4.6 4.6 0 0 1 11.2 3L12 2.2V5H9.2l1.1-1.1A3.35 3.35 0 0 0 4.6 5.1l-1.2-.5Zm9.2 4.8A4.6 4.6 0 0 1 4.8 11L4 11.8V9h2.8l-1.1 1.1a3.35 3.35 0 0 0 5.7-1.2l1.2.5Z"
        );
      }

      .problem {
        align-items: center;
        display: inline-flex;
      }

      .problem + .problem {
        margin-left: 7px;
      }

      .problem::before {
        margin-right: 3px;
      }

      .error-count::before {
        clip-path: path(
          "M7 1.5A5.5 5.5 0 1 1 7 12.5 5.5 5.5 0 0 1 7 1.5Zm2.25 3.35-.9-.9L7 5.3 5.65 3.95l-.9.9L6.1 6.2 4.75 7.55l.9.9L7 7.1l1.35 1.35.9-.9L7.9 6.2l1.35-1.35Z"
        );
      }

      .warning-count::before {
        clip-path: path(
          "M7 1.25 13 12H1L7 1.25Zm-.6 4v3.4h1.2v-3.4H6.4Zm0 4.35v1.2h1.2V9.6H6.4Z"
        );
      }

      &.feedback::before {
        clip-path: path(
          "M2 2.5h10v6.75H6.2L3.35 12v-2.75H2V2.5Zm1.25 1.25V8H4.6v1.05L5.7 8H10.75V3.75h-7.5Z"
        );
      }
    }
  }
`;

export default StyledStatusBar;

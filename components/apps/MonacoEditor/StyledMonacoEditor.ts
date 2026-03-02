import styled from "styled-components";

const StyledMonacoEditor = styled.div`
  --activity-bar-width: 52px;
  --side-panel-width: clamp(220px, 18vw, 320px);
  --menu-bar-height: 34px;
  --status-bar-height: 22px;
  --explorer-row-height: 22px;

  background: rgb(30 30 30);
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;

  && {
    height: 100%;
  }

  .editor-shell {
    display: grid;
    grid-template-areas:
      "workbench"
      "statusbar";
    grid-template-rows: minmax(0, 1fr) var(--status-bar-height);
    height: 100%;
    max-height: 100%;
    min-height: 0;
    overflow: hidden;
    min-width: 0;
    width: 100%;

    &.terminal-open {
      grid-template-areas:
        "workbench"
        "terminal"
        "statusbar";
      grid-template-rows: minmax(0, 1fr) 200px var(--status-bar-height);
    }
  }

  .workbench {
    display: grid;
    gap: 0;
    grid-area: workbench;
    grid-template-areas:
      "menu menu menu"
      "activity sidebar editor";
    grid-template-columns: var(--activity-bar-width) var(--side-panel-width) minmax(
      0,
      1fr
    );
    grid-template-rows: var(--menu-bar-height) 1fr;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    width: 100%;

    > * {
      min-height: 0;
      min-width: 0;
    }

    &.panel-closed {
      grid-template-areas:
        "menu menu"
        "activity editor";
      grid-template-columns: var(--activity-bar-width) minmax(0, 1fr);

      .editor-area {
        grid-column: 2;
      }

      .side-panel {
        display: none;
      }
    }

    &.panel-open {
      .editor-area {
        grid-column: 3;
      }
    }
  }

  .menu-bar {
    align-items: center;
    background: rgb(60 60 60);
    border-bottom: 1px solid rgb(39 39 39);
    display: flex;
    grid-area: menu;
    grid-column: 1 / -1;
    height: var(--menu-bar-height);
    max-height: var(--menu-bar-height);
    min-height: var(--menu-bar-height);
    overflow: visible;
    pointer-events: auto;
    padding: 0 8px;
    position: relative;
    isolation: isolate;
    z-index: 30;

    > ol {
      align-items: center;
      display: flex;
      gap: 12px;
      height: 100%;
      margin: 0;
      min-height: 0;
      min-width: 0;
      padding: 0;
    }

    > ol > li {
      align-items: center;
      display: flex;
      height: 100%;
      min-height: 0;
      min-width: 0;
      position: relative;

      > button {
        background: transparent;
        border: 0;
        color: rgb(230 230 230);
        cursor: pointer;
        font-size: 12px;
        padding: 4px 6px;

        &:hover,
        &.active {
          background: rgb(78 78 78);
        }
      }

      > menu.menu-dropdown {
        background: rgb(49 49 49);
        border: 1px solid rgb(29 29 29);
        box-shadow: 0 6px 16px rgb(0 0 0 / 35%);
        display: block;
        left: 0;
        list-style: none;
        margin: 0;
        min-width: 196px;
        padding: 4px;
        pointer-events: auto;
        position: absolute;
        top: calc(var(--menu-bar-height) - 1px);
        z-index: 12000;

        li {
          min-width: 0;
          width: 100%;

          button {
            background: transparent;
            border: 0;
            color: rgb(235 235 235);
            cursor: pointer;
            min-width: 0;
            padding: 6px 8px;
            text-align: left;
            width: 100%;

            &:hover {
              background: rgb(9 71 113);
            }
          }
        }
      }
    }
  }

  .activity-bar {
    background: rgb(44 44 44);
    border-right: 1px solid rgb(24 24 24);
    display: flex;
    flex-direction: column;
    grid-area: activity;
    gap: 6px;
    padding: 6px 0;
    width: var(--activity-bar-width);

    button {
      background: transparent;
      border: 0;
      border-left: 2px solid transparent;
      color: rgb(168 168 168);
      cursor: pointer;
      font-size: 16px;
      height: 36px;

      &:hover,
      &.active {
        background: rgb(58 58 58);
        border-left-color: rgb(30 136 229);
        color: rgb(238 238 238);
      }
    }
  }

  .side-panel {
    background: rgb(37 37 38);
    border-right: 1px solid rgb(24 24 24);
    display: flex;
    flex-direction: column;
    grid-area: sidebar;
    min-width: 220px;
    min-height: 0;
    overflow: hidden;
    padding-bottom: 0;
    width: var(--side-panel-width);

    header {
      border-bottom: 1px solid rgb(56 56 56);
      color: rgb(198 198 198);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 10px 12px;
    }

    .panel-header-row {
      align-items: center;
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .panel-actions {
      display: inline-flex;
      gap: 6px;

      .icon-action {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 2px;
        color: rgb(220 220 220);
        font-size: 14px;
        height: 24px;
        width: 24px;

        &:hover {
          background: rgb(58 58 58);
          border-color: rgb(80 80 80);
        }
      }
    }

    .location {
      color: rgb(138 138 138);
      font-size: 11px;
      margin: 8px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .section-title {
      color: rgb(140 140 140);
      font-size: 10px;
      letter-spacing: 0.8px;
      margin: 10px 10px 4px;
      text-transform: uppercase;
    }

    .folder-title {
      color: rgb(220 220 220);
      font-size: 12px;
      font-weight: 600;
      margin: 0 10px 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .open-editors {
      flex: 0 0 auto;
      margin-bottom: 0;
      max-height: 180px;
      overflow: auto;
      padding: 0 4px;

      li {
        align-items: center;
        display: grid;
        gap: 4px;
        grid-template-columns: 1fr auto;
        min-height: var(--explorer-row-height);

        button.close {
          align-items: center;
          background: transparent;
          border: 0;
          color: rgb(175 175 175);
          display: inline-flex;
          font-size: 14px;
          height: var(--explorer-row-height);
          justify-content: center;
          width: 18px;

          &:hover {
            color: rgb(240 240 240);
          }
        }
      }
    }

    ol {
      overflow: auto;
      padding: 0 4px;
    }

    .folder-entries {
      flex: 1;
      min-height: 0;
      position: relative;
      z-index: 1;
    }

    li {
      margin: 0;
      min-width: 0;

      button {
        align-items: center;
        background: transparent;
        border: 0;
        color: rgb(212 212 212);
        display: flex;
        gap: 6px;
        height: var(--explorer-row-height);
        line-height: 1;
        min-width: 0;
        overflow: hidden;
        padding: 0 8px;
        text-align: left;
        width: 100%;

        span {
          color: rgb(135 135 135);
          flex: 0 0 auto;
          width: 10px;
        }

        .entry-icon {
          align-items: center;
          display: inline-flex;
          justify-content: center;
          width: 14px;
        }

        &:hover,
        &.active {
          background: rgb(9 71 113);
        }
      }

      &.placeholder {
        color: rgb(138 138 138);
        font-size: 12px;
        padding: 8px;
      }
    }

    .entry-editor-row {
      align-items: center;
      display: flex;
      gap: 6px;
      min-height: var(--explorer-row-height);
      min-width: 0;
      padding: 0 8px;

      .entry-input-wrap {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
      }
    }

    .entry-icon {
      color: rgb(135 135 135);
      width: 12px;
    }

    .entry-input {
      background: rgb(60 60 60);
      border: 1px solid rgb(14 99 156);
      border-radius: 2px;
      color: rgb(255 255 255);
      flex: 1;
      font-size: 12px;
      height: var(--explorer-row-height);
      line-height: 20px;
      min-width: 0;
      outline: none;
      padding: 0 6px;
    }

    .entry-error {
      color: rgb(241 76 76);
      display: block;
      font-size: 11px;
      margin-top: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entry-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .placeholder {
      color: rgb(138 138 138);
      font-size: 12px;
      margin: 8px 12px;
    }
  }

  @media (max-width: 900px) {
    .breadcrumbs {
      font-size: 11px;
      padding: 5px 8px;
    }
  }

  .editor-area {
    display: flex;
    flex: 1;
    flex-direction: column;
    grid-area: editor;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }

  .breadcrumbs {
    background: rgb(37 37 38);
    border-bottom: 1px solid rgb(46 46 46);
    color: rgb(166 166 166);
    font-size: 12px;
    overflow: hidden;
    padding: 6px 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tabs {
    align-items: center;
    background: rgb(45 45 45);
    border-bottom: 1px solid rgb(36 36 36);
    display: flex;
    flex: 0 0 auto;
    height: 35px;
    overflow-x: auto;
    padding: 0 6px;

    .tab {
      align-items: center;
      background: rgb(30 30 30);
      border: 1px solid rgb(57 57 57);
      border-bottom: 0;
      display: inline-flex;
      margin-right: 4px;
      max-width: min(320px, 70%);

      .open {
        background: transparent;
        border: 0;
        color: rgb(220 220 220);
        font-size: 12px;
        height: 30px;
        max-width: 260px;
        overflow: hidden;
        padding: 0 10px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .close {
        align-items: center;
        background: transparent;
        border: 0;
        color: rgb(170 170 170);
        display: inline-flex;
        font-size: 14px;
        height: 24px;
        justify-content: center;
        margin-right: 6px;
        width: 18px;

        &:hover {
          color: rgb(240 240 240);
        }
      }

      &.active {
        border-top: 2px solid rgb(30 136 229);

        .open {
          color: rgb(245 245 245);
        }
      }
    }

    .empty-tab {
      color: rgb(140 140 140);
      font-size: 12px;
      padding-left: 8px;
    }
  }

  .editor-host {
    flex: 1 1 auto;
    height: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    position: relative;
  }

  .bottom-panel {
    background: rgb(30 30 30);
    border-top: 1px solid rgb(45 45 45);
    display: grid;
    grid-area: terminal;
    grid-template-rows: 28px minmax(0, 1fr) 32px;
    min-height: 0;
    overflow: hidden;

    .bottom-panel-header {
      align-items: center;
      border-bottom: 1px solid rgb(45 45 45);
      color: rgb(198 198 198);
      display: flex;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      padding: 0 10px;
    }

    .terminal-history {
      color: rgb(212 212 212);
      font-family: monospace;
      font-size: 12px;
      min-height: 0;
      overflow: auto;
      padding: 8px 10px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .terminal-line {
      line-height: 1.4;
      margin-bottom: 2px;
    }

    .terminal-input-row {
      align-items: center;
      border-top: 1px solid rgb(45 45 45);
      display: grid;
      gap: 8px;
      grid-template-columns: auto minmax(0, 1fr);
      padding: 4px 10px;

      > span {
        color: rgb(197 197 197);
        font-family: monospace;
      }
    }

    .terminal-input {
      background: rgb(37 37 38);
      border: 1px solid rgb(70 70 70);
      color: rgb(245 245 245);
      font-family: monospace;
      font-size: 12px;
      height: 24px;
      outline: none;
      padding: 0 6px;
      width: 100%;
    }
  }

  .status-bar-host {
    grid-area: statusbar;
    height: var(--status-bar-height);
    min-height: var(--status-bar-height);
    overflow: hidden;
    width: 100%;
  }

  .context-menu {
    background-color: rgb(45 45 45);
    border: 1px solid rgb(85 85 85);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 30%);
    min-width: 150px;
    z-index: 10000;

    .context-menu-action {
      background: transparent;
      border: 0;
      color: rgb(204 204 204);
      cursor: pointer;
      display: block;
      font-size: 14px;
      padding: 8px 14px;
      text-align: left;
      width: 100%;

      &:hover {
        background-color: rgb(61 61 61);
      }
    }
  }

  .modal-backdrop {
    background-color: rgb(0 0 0 / 40%);
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 10001;
  }

  .confirm-dialog {
    background-color: rgb(45 45 45);
    border: 1px solid rgb(85 85 85);
    border-radius: 4px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 50%);
    left: 50%;
    min-width: 300px;
    padding: 24px;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10002;

    .confirm-message {
      color: rgb(255 255 255);
      font-size: 14px;
      margin-bottom: 16px;
    }

    .confirm-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;

      .dialog-action {
        background: rgb(60 60 60);
        border: 1px solid rgb(80 80 80);
        border-radius: 2px;
        color: rgb(255 255 255);
        cursor: pointer;
        font-size: 12px;
        padding: 8px 16px;

        &:hover {
          background: rgb(72 72 72);
        }

        &.danger {
          background: rgb(180 50 50);
          border-color: rgb(200 70 70);

          &:hover {
            background: rgb(195 58 58);
          }
        }
      }
    }
  }
`;

export default StyledMonacoEditor;

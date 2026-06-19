import styled from "styled-components";

const StyledMonacoEditor = styled.div`
  /* stylelint-disable */
  --activity-bar-width: 52px;
  --side-panel-width: clamp(150px, 12vw, 210px);
  --sidebar-splitter-width: 4px;
  --panel-splitter-height: 4px;
  --menu-bar-height: 34px;
  --status-bar-height: 22px;
  --explorer-row-height: 22px;
  --vscode-bg: #1f1f1f;
  --vscode-bg-elevated: #252526;
  --vscode-bg-hover: #2a2d2e;
  --vscode-bg-input: #313131;
  --vscode-bg-menu: #181818;
  --vscode-bg-panel: #181818;
  --vscode-bg-side: #181818;
  --vscode-border: #2b2b2b;
  --vscode-border-subtle: #242424;
  --vscode-focus: #0078d4;
  --vscode-foreground: #cccccc;
  --vscode-foreground-muted: #9d9d9d;
  --vscode-foreground-subtle: #858585;
  --vscode-list-active: #04395e;
  --vscode-list-hover: #2a2d2e;
  --vscode-shadow: rgb(0 0 0 / 36%);
  --vscode-tab-active: #1f1f1f;
  --vscode-tab-inactive: #181818;
  --vscode-terminal-bg: #181818;
  --vscode-warning-bg: #332b1f;
  --vscode-warning-border: #5a4a27;

  background: var(--vscode-bg);
  color: var(--vscode-foreground);
  display: flex;
  flex-direction: column;
  font-family:
    "Segoe UI Variable",
    "Segoe UI",
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 12px;
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
        "panel-splitter"
        "terminal"
        "statusbar";
      grid-template-rows:
        minmax(0, 1fr) var(--panel-splitter-height) var(
          --vsc-panel-height,
          220px
        )
        var(--status-bar-height);
    }
  }

  .panel-splitter {
    background: rgb(31 31 31);
    border-top: 1px solid rgb(24 24 24);
    border-bottom: 1px solid rgb(24 24 24);
    cursor: row-resize;
    grid-area: panel-splitter;
    height: var(--panel-splitter-height);
    width: 100%;

    &:hover {
      background: rgb(0 122 204);
    }
  }

  .workbench {
    display: grid;
    gap: 0;
    grid-area: workbench;
    grid-template-areas:
      "menu menu menu menu"
      "activity sidebar splitter editor";
    grid-template-columns:
      var(--activity-bar-width) var(--side-panel-width) var(
        --sidebar-splitter-width
      )
      minmax(0, 1fr);
    grid-template-rows: var(--menu-bar-height) 1fr;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    position: relative;
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

      .sidebar-splitter {
        display: none;
      }
    }

    &.compact-layout {
      grid-template-areas:
        "menu menu"
        "activity editor";
      grid-template-columns: var(--activity-bar-width) minmax(0, 1fr);

      .side-panel {
        display: none;
      }

      .sidebar-splitter {
        display: none;
      }

      .editor-area {
        grid-column: 2;
      }

      &.creating-entry .side-panel,
      &.open-folder-active .side-panel {
        bottom: 0;
        display: block;
        left: var(--activity-bar-width);
        max-width: calc(100% - var(--activity-bar-width));
        position: absolute;
        top: var(--menu-bar-height);
        width: min(260px, calc(100% - var(--activity-bar-width)));
        z-index: 8;
      }
    }

    &.panel-open {
      .editor-area {
        grid-column: 4;
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

      &.validate-item > button {
        background: rgb(18 92 59);
        border: 1px solid rgb(40 146 98);
        border-radius: 4px;
        color: rgb(232 255 243);
        font-weight: 600;
        padding: 4px 10px;

        &:hover,
        &.active {
          background: rgb(26 120 76);
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

  .validation-panel {
    background: rgb(31 31 31);
    border: 1px solid rgb(26 89 59);
    box-shadow: 0 8px 20px rgb(0 0 0 / 35%);
    color: rgb(234 234 234);
    max-height: 260px;
    overflow: auto;
    position: absolute;
    right: 16px;
    top: calc(var(--menu-bar-height) + 8px);
    width: min(420px, calc(100% - 24px));
    z-index: 40;

    header {
      align-items: center;
      background: rgb(18 92 59);
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr auto auto;
      padding: 8px 10px;

      button {
        background: transparent;
        border: 0;
        color: rgb(232 255 243);
        cursor: pointer;
        font-size: 12px;
      }
    }

    ol {
      display: grid;
      gap: 6px;
      list-style: none;
      margin: 0;
      padding: 10px;
    }

    li {
      border-left: 3px solid transparent;
      font-size: 12px;
      padding: 4px 8px;

      &.passed {
        border-left-color: rgb(56 182 109);
        color: rgb(210 255 225);
      }

      &.failed {
        border-left-color: rgb(231 95 95);
        color: rgb(255 214 214);
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
    max-width: 320px;
    min-width: 170px;
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
      margin: 8px 10px 4px;
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
      max-height: 120px;
      overflow: auto;
      padding: 0 4px;

      li {
        align-items: center;
        display: grid;
        gap: 4px;
        grid-template-columns: 1fr auto;
        min-height: var(--explorer-row-height);

        &.entry-editing {
          grid-template-columns: 1fr;
          padding-right: 4px;
        }

        > button:not(.close) {
          align-items: center;
          display: inline-flex;
          gap: 6px;
          min-width: 0;

          .file-icon {
            color: rgb(180 180 180);
            display: inline-flex;
            font-size: 14px;
            justify-content: center;
            min-width: 16px;
            width: 16px;

            svg {
              display: block;
              font-size: 14px;
              pointer-events: none;
            }
          }
        }

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

      .entry-input-wrap {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
    }

    ol {
      overflow: auto;
      padding: 0 4px;
    }

    .folder-entries {
      flex: 1;
      margin-top: 2px;
      min-height: 0;
      position: relative;
      z-index: 1;

      li.drag-over > button {
        background: rgb(9 71 113);
        outline: 1px solid rgb(78 171 255);
      }
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
          font-size: 14px;
          justify-content: center;
          min-width: 16px;
          width: 16px;

          svg {
            display: block;
            font-size: 14px;
            pointer-events: none;
          }
        }

        &:hover {
          background: rgb(42 45 46);
        }

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
      width: 16px;
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

      &:focus,
      &:focus-visible {
        border-color: rgb(0 122 204);
        box-shadow: inset 0 0 0 1px rgb(0 122 204);
      }
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

  .sidebar-splitter {
    background: rgb(31 31 31);
    border-right: 1px solid rgb(24 24 24);
    cursor: col-resize;
    grid-area: splitter;
    width: var(--sidebar-splitter-width);

    &:hover {
      background: rgb(0 122 204);
    }
  }

  @media (max-width: 900px) {
    .workbench {
      grid-template-areas:
        "menu menu"
        "activity editor";
      grid-template-columns: var(--activity-bar-width) minmax(0, 1fr);

      .side-panel {
        display: none;
      }

      .sidebar-splitter {
        display: none;
      }

      .editor-area {
        grid-column: 2;
      }
    }

    .activity-bar {
      width: 44px;

      button {
        font-size: 14px;
        height: 32px;
      }
    }

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

  .read-only-hint {
    background: rgb(48 32 12);
    border-bottom: 1px solid rgb(110 84 31);
    color: rgb(255 225 171);
    font-size: 12px;
    margin: 0;
    padding: 6px 10px;
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
      background: rgb(45 45 45);
      border: 1px solid rgb(57 57 57);
      border-bottom: 0;
      display: inline-flex;
      margin-right: 4px;
      max-width: min(320px, 70%);

      .open {
        align-items: center;
        background: transparent;
        border: 0;
        color: rgb(220 220 220);
        display: inline-flex;
        font-size: 12px;
        gap: 6px;
        height: 30px;
        max-width: 260px;
        overflow: hidden;
        padding: 0 10px;
        text-overflow: ellipsis;
        white-space: nowrap;

        .file-icon {
          color: rgb(180 180 180);
          display: inline-flex;
          font-size: 14px;
          justify-content: center;
          min-width: 16px;
          width: 16px;

          svg {
            display: block;
            font-size: 14px;
            pointer-events: none;
          }
        }
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
        opacity: 0;
        visibility: hidden;
        width: 18px;

        &:hover {
          color: rgb(240 240 240);
        }
      }

      &:hover {
        .close {
          opacity: 1;
          visibility: visible;
        }
      }

      &.active {
        background: rgb(30 30 30);
        border-top: 2px solid rgb(30 136 229);

        .open {
          color: rgb(245 245 245);
        }

        .close {
          opacity: 1;
          visibility: visible;
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

  .editor-empty-state {
    align-items: center;
    background: rgb(30 30 30);
    color: rgb(72 72 72);
    display: flex;
    flex: 1 1 auto;
    justify-content: center;
    min-height: 0;
    min-width: 0;
    user-select: none;
  }

  .editor-empty-logo {
    font-size: clamp(72px, 16vw, 180px);
    font-weight: 700;
    letter-spacing: 6px;
    line-height: 1;
    opacity: 0.35;
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

      &:focus,
      &:focus-visible {
        border-color: rgb(0 122 204);
        box-shadow: inset 0 0 0 1px rgb(0 122 204);
      }
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

    .context-menu-separator {
      border-top: 1px solid rgb(75 75 75);
      margin: 4px 0;
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

    .dialog-label {
      color: rgb(209 209 209);
      display: block;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .dialog-input {
      background: rgb(37 37 38);
      border: 1px solid rgb(78 78 78);
      color: rgb(245 245 245);
      font-size: 12px;
      height: 30px;
      margin-bottom: 8px;
      outline: none;
      padding: 0 8px;
      width: 100%;

      &:focus {
        border-color: rgb(0 122 204);
      }
    }

    .dialog-error {
      color: rgb(255 130 130);
      font-size: 11px;
      margin-bottom: 10px;
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

  .save-as-dialog {
    background: rgb(37 37 38);
    border: 1px solid rgb(69 69 69);
    box-shadow: 0 8px 24px rgb(0 0 0 / 55%);
    left: 50%;
    min-width: 460px;
    padding: 12px;
    position: fixed;
    top: 72px;
    transform: translateX(-50%);
    z-index: 10002;

    .save-as-title {
      color: rgb(245 245 245);
      font-size: 13px;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .save-as-subtitle {
      color: rgb(171 171 171);
      font-size: 11px;
      margin: 0 0 8px;
    }

    .save-as-input {
      background: rgb(30 30 30);
      border: 1px solid rgb(0 122 204);
      color: rgb(245 245 245);
      font-size: 12px;
      height: 30px;
      margin: 0;
      outline: none;
      padding: 0 8px;
      width: 100%;

      &:focus,
      &:focus-visible {
        box-shadow: inset 0 0 0 1px rgb(0 122 204);
      }
    }

    .save-as-error {
      color: rgb(255 130 130);
      font-size: 11px;
      margin: 8px 0 0;
    }

    .save-as-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 10px;

      .dialog-action {
        background: rgb(60 60 60);
        border: 1px solid rgb(80 80 80);
        border-radius: 2px;
        color: rgb(255 255 255);
        cursor: pointer;
        font-size: 12px;
        padding: 6px 12px;

        &:hover {
          background: rgb(72 72 72);
        }

        &.primary {
          background: rgb(14 99 156);
          border-color: rgb(17 116 183);

          &:hover {
            background: rgb(17 116 183);
          }
        }
      }
    }
  }

  .open-folder-dialog {
    .open-folder-browser {
      background: rgb(30 30 30);
      border: 1px solid rgb(69 69 69);
      display: flex;
      flex-direction: column;
      margin-top: 8px;
      max-height: 190px;
      min-height: 72px;
      overflow-y: auto;
      padding: 4px;
    }

    .open-folder-entry {
      background: transparent;
      border: 0;
      color: rgb(220 220 220);
      cursor: pointer;
      font-size: 12px;
      padding: 5px 7px;
      text-align: left;

      &:hover,
      &:focus-visible {
        background: rgb(55 55 61);
        outline: none;
      }
    }
  }

  * {
    scrollbar-color: rgb(121 121 121 / 40%) transparent;
    scrollbar-width: thin;
  }

  *::-webkit-scrollbar {
    height: 10px;
    width: 10px;
  }

  *::-webkit-scrollbar-thumb {
    background: rgb(121 121 121 / 38%);
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: rgb(121 121 121 / 58%);
    background-clip: padding-box;
  }

  *::-webkit-scrollbar-corner,
  *::-webkit-scrollbar-track {
    background: transparent;
  }

  .editor-shell,
  .workbench,
  .editor-area,
  .editor-host,
  .editor-empty-state {
    background: var(--vscode-bg);
  }

  .panel-splitter,
  .sidebar-splitter {
    background: var(--vscode-bg-menu);
    border-color: var(--vscode-border-subtle);
    transition: background-color 80ms ease;
  }

  .panel-splitter:hover,
  .sidebar-splitter:hover {
    background: var(--vscode-focus);
  }

  .menu-bar {
    background: var(--vscode-bg-menu);
    border-bottom: 1px solid var(--vscode-border);
    box-shadow: none;
    color: var(--vscode-foreground);
    padding: 0 10px;

    > ol {
      gap: 2px;
    }

    > ol > li > button {
      border-radius: 4px;
      color: var(--vscode-foreground);
      font-size: 12px;
      height: 24px;
      line-height: 1;
      padding: 0 8px;
    }

    > ol > li > button:hover,
    > ol > li > button.active {
      background: var(--vscode-bg-hover);
      color: #ffffff;
    }

    > ol > li.validate-item > button {
      background: #123d2a;
      border: 1px solid #2d6b49;
      border-radius: 4px;
      color: #dff6e8;
      font-weight: 600;
      height: 24px;
      padding: 0 10px;
    }

    > ol > li.validate-item > button:hover,
    > ol > li.validate-item > button.active {
      background: #1f5f3f;
      border-color: #3d8b5e;
    }

    > ol > li > menu.menu-dropdown {
      background: var(--vscode-bg-elevated);
      border: 1px solid #454545;
      border-radius: 4px;
      box-shadow:
        0 8px 24px var(--vscode-shadow),
        0 0 0 1px rgb(255 255 255 / 2%);
      min-width: 224px;
      padding: 4px 0;

      li button {
        border-radius: 0;
        color: var(--vscode-foreground);
        font-size: 12px;
        height: 26px;
        padding: 0 24px 0 24px;
      }

      li button:hover {
        background: var(--vscode-list-active);
        color: #ffffff;
      }

      li button:disabled {
        color: rgb(204 204 204 / 35%);
      }
    }
  }

  .activity-bar {
    background: var(--vscode-bg-menu);
    border-right: 1px solid var(--vscode-border);
    gap: 0;
    padding: 0;

    button {
      align-items: center;
      border-left: 2px solid transparent;
      color: var(--vscode-foreground-subtle);
      display: flex;
      font-size: 20px;
      height: 48px;
      justify-content: center;
      opacity: 0.92;
      padding: 0;
      position: relative;
      transition:
        background-color 80ms ease,
        color 80ms ease;
      width: var(--activity-bar-width);
    }

    button:hover {
      background: transparent;
      color: #ffffff;
    }

    button.active {
      background: transparent;
      border-left-color: #ffffff;
      color: #ffffff;
      opacity: 1;
    }

    button:focus-visible {
      outline: 1px solid var(--vscode-focus);
      outline-offset: -2px;
    }
  }

  .side-panel {
    background: var(--vscode-bg-side);
    border-right: 1px solid var(--vscode-border);
    color: var(--vscode-foreground);

    header {
      border-bottom: 0;
      color: var(--vscode-foreground);
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0;
      padding: 9px 12px 7px;
      text-transform: uppercase;
    }

    .panel-actions .icon-action {
      border: 0;
      border-radius: 4px;
      color: var(--vscode-foreground-muted);
      height: 22px;
      width: 22px;
    }

    .panel-actions .icon-action:hover {
      background: var(--vscode-bg-hover);
      color: #ffffff;
    }

    .location,
    .section-title {
      color: var(--vscode-foreground-subtle);
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0;
      margin: 6px 0 2px;
      padding: 3px 12px;
    }

    .folder-title {
      color: var(--vscode-foreground);
      font-size: 11px;
      font-weight: 700;
      margin: 0;
      padding: 2px 12px 4px;
      text-transform: uppercase;
    }

    ol,
    .open-editors {
      padding: 0;
    }

    li button,
    .entry-editor-row {
      color: var(--vscode-foreground);
      font-size: 13px;
      min-height: var(--explorer-row-height);
      padding: 0 10px 0 16px;
    }

    li button:hover {
      background: var(--vscode-list-hover);
    }

    li button.active,
    .folder-entries li.drag-over > button {
      background: var(--vscode-list-active);
      color: #ffffff;
      outline: 0;
    }

    .entry-icon,
    li button span,
    .open-editors li > button:not(.close) .file-icon {
      color: var(--vscode-foreground-subtle);
    }

    button.close {
      border-radius: 3px;
      color: transparent;
    }

    li:hover button.close,
    button.close:hover {
      color: var(--vscode-foreground-muted);
    }

    button.close:hover {
      background: var(--vscode-bg-hover);
      color: #ffffff;
    }

    .entry-input {
      background: var(--vscode-bg-input);
      border: 1px solid var(--vscode-focus);
      border-radius: 2px;
      color: #ffffff;
      font-family: inherit;
    }
  }

  .breadcrumbs {
    background: var(--vscode-bg);
    border-bottom: 1px solid var(--vscode-border);
    color: var(--vscode-foreground-muted);
    font-size: 12px;
    height: 24px;
    line-height: 13px;
    padding: 5px 12px;
  }

  .read-only-hint {
    background: var(--vscode-warning-bg);
    border-bottom: 1px solid var(--vscode-warning-border);
    color: #e7d7ad;
    font-size: 12px;
    padding: 5px 12px;
  }

  .tabs {
    background: var(--vscode-tab-inactive);
    border-bottom: 1px solid var(--vscode-border);
    height: 35px;
    padding: 0;

    .tab {
      background: var(--vscode-tab-inactive);
      border: 0;
      border-right: 1px solid var(--vscode-border);
      height: 35px;
      margin: 0;
      max-width: min(280px, 72%);
      position: relative;
    }

    .tab::before {
      background: transparent;
      content: "";
      height: 1px;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    .tab .open {
      color: var(--vscode-foreground-muted);
      font-size: 13px;
      height: 35px;
      max-width: 230px;
      padding: 0 10px;
    }

    .tab .close {
      border-radius: 3px;
      color: transparent;
      height: 20px;
      margin-right: 7px;
      width: 20px;
    }

    .tab:hover {
      background: #1f1f1f;
    }

    .tab:hover .close {
      color: var(--vscode-foreground-muted);
    }

    .tab .close:hover {
      background: var(--vscode-bg-hover);
      color: #ffffff;
    }

    .tab.active {
      background: var(--vscode-tab-active);
      border-top: 0;
    }

    .tab.active::before {
      background: var(--vscode-focus);
      height: 1px;
    }

    .tab.active .open {
      color: #ffffff;
    }

    .empty-tab {
      align-items: center;
      color: var(--vscode-foreground-subtle);
      display: inline-flex;
      height: 35px;
      padding-left: 12px;
    }
  }

  .editor-host .monaco-editor,
  .editor-host .monaco-editor-background,
  .editor-host .monaco-editor .margin {
    background-color: var(--vscode-bg);
  }

  .editor-empty-state {
    background: var(--vscode-bg);
  }

  .editor-empty-logo {
    color: rgb(255 255 255 / 10%);
    font-family:
      "Segoe UI Variable",
      "Segoe UI",
      system-ui,
      -apple-system,
      sans-serif;
    letter-spacing: 2px;
    opacity: 1;
  }

  .bottom-panel {
    background: var(--vscode-terminal-bg);
    border-top: 1px solid var(--vscode-border);
    grid-template-rows: 35px minmax(0, 1fr) 32px;

    .bottom-panel-header {
      background: var(--vscode-bg);
      border-bottom: 1px solid var(--vscode-border);
      color: var(--vscode-foreground);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0;
      padding: 0 12px;
    }

    .terminal-history {
      background: var(--vscode-terminal-bg);
      color: var(--vscode-foreground);
      font-family: Consolas, "Cascadia Mono", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.42;
      padding: 7px 12px;
    }

    .terminal-input-row {
      background: var(--vscode-terminal-bg);
      border-top: 1px solid var(--vscode-border);
      padding: 4px 12px;

      > span {
        color: var(--vscode-foreground);
        font-family: Consolas, "Cascadia Mono", "Courier New", monospace;
      }
    }

    .terminal-input {
      background: var(--vscode-terminal-bg);
      border: 1px solid transparent;
      color: #ffffff;
      font-family: Consolas, "Cascadia Mono", "Courier New", monospace;
      font-size: 13px;
      height: 24px;
      padding: 0 4px;
    }

    .terminal-input:focus,
    .terminal-input:focus-visible {
      border-color: var(--vscode-focus);
      box-shadow: none;
    }
  }

  .context-menu,
  .confirm-dialog,
  .save-as-dialog,
  .validation-panel {
    background: var(--vscode-bg-elevated);
    border: 1px solid #454545;
    border-radius: 4px;
    box-shadow:
      0 8px 24px var(--vscode-shadow),
      0 0 0 1px rgb(255 255 255 / 2%);
    color: var(--vscode-foreground);
  }

  .context-menu .context-menu-action {
    color: var(--vscode-foreground);
    font-size: 12px;
    min-height: 26px;
    padding: 0 14px;
  }

  .context-menu .context-menu-action:hover {
    background: var(--vscode-list-active);
    color: #ffffff;
  }

  .modal-backdrop {
    background-color: rgb(0 0 0 / 48%);
  }

  .confirm-dialog .dialog-input,
  .save-as-dialog .save-as-input {
    background: var(--vscode-bg-input);
    border: 1px solid var(--vscode-focus);
    color: #ffffff;
    font-family: inherit;
  }

  .confirm-dialog .dialog-action,
  .save-as-dialog .dialog-action {
    background: #2d2d2d;
    border: 1px solid #454545;
    border-radius: 2px;
    color: var(--vscode-foreground);
  }

  .confirm-dialog .dialog-action:hover,
  .save-as-dialog .dialog-action:hover {
    background: #3a3d41;
  }

  .save-as-dialog .dialog-action.primary {
    background: #0e639c;
    border-color: #0e639c;
    color: #ffffff;
  }

  .save-as-dialog .dialog-action.primary:hover {
    background: #1177bb;
  }

  /* Pixel skin: VS Code Windows Dark Modern */
  .workbench {
    --vsc-activitybar-bg: #2d2d2d;
    --vsc-activitybar-fg: #858585;
    --vsc-activitybar-active-fg: #fff;
    --vsc-activitybar-hover-fg: #c5c5c5;
    --vsc-commandcenter-bg: #2d2d2d;
    --vsc-commandcenter-hover: #3c3c3c;
    --vsc-editor-bg: #1f1f1f;
    --vsc-menu-border: #454545;
    --vsc-panel-bg: #181818;
    --vsc-panel-border: #2b2b2b;
    --vsc-sidebar-bg: #252526;
    --vsc-sidebar-header: #bbbbbb;
    --vsc-sidebar-row-hover: #2a2d2e;
    --vsc-sidebar-row-selected: #37373d;
    --vsc-splitter: #1f1f23;
    --vsc-tab-active-bg: #1f1f1f;
    --vsc-tab-active-border: #007acc;
    --vsc-tab-border: #2b2b2b;
    --vsc-tab-inactive-bg: #2d2d2d;
    --vsc-text: #cccccc;
    --vsc-text-muted: #969696;
    --vsc-windows-shadow: 0 8px 28px rgb(0 0 0 / 42%);
  }

  .menu-bar {
    background: var(--vsc-commandcenter-bg);
    border-bottom-color: #1f1f23;
    height: 35px;
    max-height: 35px;
    min-height: 35px;
    padding: 0 12px;

    > ol {
      gap: 1px;
    }

    > ol > li > button {
      border-radius: 3px;
      color: #cccccc;
      font-family:
        "Segoe UI Variable",
        "Segoe UI",
        system-ui,
        -apple-system,
        sans-serif;
      font-size: 12px;
      height: 25px;
      padding: 0 8px;
    }

    > ol > li > button:hover,
    > ol > li > button.active {
      background: var(--vsc-commandcenter-hover);
      color: #fff;
    }

    > ol > li > menu.menu-dropdown {
      background: #252526;
      border-color: var(--vsc-menu-border);
      border-radius: 3px;
      box-shadow: var(--vsc-windows-shadow);
      padding: 4px 0;

      li button {
        color: #cccccc;
        font-family:
          "Segoe UI Variable",
          "Segoe UI",
          system-ui,
          -apple-system,
          sans-serif;
        font-size: 12px;
        height: 26px;
        padding: 0 28px 0 24px;
      }

      li button:hover {
        background: #04395e;
        color: #fff;
      }
    }
  }

  .activity-bar {
    background: var(--vsc-activitybar-bg);
    border-right: 1px solid #1f1f23;
    box-shadow: inset -1px 0 0 rgb(255 255 255 / 2%);
    width: 50px;

    button {
      color: var(--vsc-activitybar-fg);
      font-size: 0;
      height: 48px;
      line-height: 0;
      position: relative;
      width: 50px;
    }

    button::before {
      background-color: currentColor;
      content: "";
      display: block;
      height: 24px;
      left: 50%;
      opacity: 0.96;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
    }

    button[title="Explorer"]::before {
      clip-path: path(
        "M3 2.75h4.5l1.6 1.8H13c1.1 0 2 .9 2 2v6.7c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2v-8.5c0-1.1.9-2 2-2Zm0 1.5c-.28 0-.5.22-.5.5v8.5c0 .28.22.5.5.5h10c.28 0 .5-.22.5-.5v-6.7c0-.28-.22-.5-.5-.5H8.42L6.82 4.25H3Z"
      );
    }

    button[title="Search"]::before {
      clip-path: path(
        "M6.5 2a4.5 4.5 0 0 1 3.56 7.25l3.35 3.34-1.06 1.06-3.34-3.35A4.5 4.5 0 1 1 6.5 2Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      );
    }

    button[title="Source Control"]::before {
      clip-path: path(
        "M5 2.5a2.5 2.5 0 0 1 1 4.79v1.42A3.5 3.5 0 0 0 9.5 12H10a2.5 2.5 0 1 1 0 1.5h-.5A5 5 0 0 1 4.5 8.5V7.29A2.5 2.5 0 0 1 5 2.5Zm0 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm7 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
      );
    }

    button[title*="Side Bar"]::before {
      clip-path: path(
        "M2 3h12v1.5H2V3Zm0 4.25h12v1.5H2v-1.5ZM2 11.5h12V13H2v-1.5Z"
      );
    }

    button:hover {
      color: var(--vsc-activitybar-hover-fg);
    }

    button:hover::after {
      background: rgb(0 122 204 / 18%);
      border-radius: 6px;
      content: "";
      height: 36px;
      left: 7px;
      position: absolute;
      top: 6px;
      width: 36px;
    }

    button.active {
      border-left-color: #fff;
      color: var(--vsc-activitybar-active-fg);
    }
  }

  .side-panel {
    background: var(--vsc-sidebar-bg);
    border-right-color: var(--vsc-splitter);

    header {
      color: var(--vsc-sidebar-header);
      font-size: 11px;
      font-weight: 600;
      height: 35px;
      letter-spacing: 0;
      padding: 9px 12px 0;
    }

    .section-title,
    .folder-title {
      color: var(--vsc-sidebar-header);
      font-size: 11px;
      font-weight: 700;
      height: 22px;
      line-height: 22px;
      margin: 0;
      padding: 0 12px;
    }

    li button,
    .entry-editor-row {
      color: var(--vsc-text);
      font-size: 13px;
      height: 22px;
      padding-left: 18px;
    }

    li button:hover {
      background: var(--vsc-sidebar-row-hover);
    }

    li button.active {
      background: var(--vsc-sidebar-row-selected);
      color: #fff;
    }

    button.close {
      color: transparent;
      font-size: 13px;
      height: 20px;
      width: 20px;
    }

    li:hover button.close,
    button.close:hover {
      color: #c5c5c5;
    }
  }

  .tabs {
    background: var(--vsc-tab-inactive-bg);
    border-bottom-color: var(--vsc-tab-border);
    height: 35px;

    .tab {
      background: var(--vsc-tab-inactive-bg);
      border-right: 1px solid var(--vsc-tab-border);
      height: 35px;
      min-width: 120px;
    }

    .tab .open {
      color: #bdbdbd;
      font-size: 13px;
      height: 35px;
      padding: 0 8px 0 10px;
    }

    .tab .open::after {
      color: #c5c5c5;
      content: "•";
      font-size: 18px;
      line-height: 1;
      margin-left: 6px;
      opacity: 0.54;
      transform: translateY(-1px);
    }

    .tab .close {
      border-radius: 3px;
      color: transparent;
      font-size: 14px;
      height: 20px;
      margin-right: 7px;
      position: relative;
      width: 20px;
    }

    .tab .close::before,
    .tab .close::after {
      background: currentColor;
      content: "";
      height: 1px;
      left: 5px;
      position: absolute;
      top: 9px;
      width: 10px;
    }

    .tab .close::before {
      transform: rotate(45deg);
    }

    .tab .close::after {
      transform: rotate(-45deg);
    }

    .tab:hover {
      background: #2f2f2f;
    }

    .tab:hover .close,
    .tab.active .close {
      color: #c5c5c5;
    }

    .tab .close:hover {
      background: #3c3c3c;
      color: #fff;
    }

    .tab.active {
      background: var(--vsc-tab-active-bg);
    }

    .tab.active::before {
      background: var(--vsc-tab-active-border);
      height: 1px;
    }

    .tab.active .open {
      color: #fff;
    }
  }

  .breadcrumbs {
    background: var(--vsc-editor-bg);
    border-bottom-color: #2a2a2a;
    color: var(--vsc-text-muted);
    height: 24px;
  }

  .bottom-panel {
    background: var(--vsc-panel-bg);
    border-top-color: var(--vsc-panel-border);

    .bottom-panel-header {
      background: var(--vsc-editor-bg);
      border-bottom-color: var(--vsc-panel-border);
      height: 35px;
    }

    .terminal-history,
    .terminal-input,
    .terminal-input-row {
      background: var(--vsc-panel-bg);
      font-family: Consolas, "Cascadia Mono", "Courier New", monospace;
    }
  }

  /* Integrated Terminal: VS Code Windows Dark Modern */
  .editor-shell.terminal-open {
    --vsc-terminal-bg: #1e1e1e;
    --vsc-terminal-border: #3c3c3c;
    --vsc-terminal-header-bg: #1f1f1f;
    --vsc-terminal-tab-active: #ffffff;
    --vsc-terminal-tab-inactive: #969696;
    --vsc-terminal-text: #cccccc;
    --vsc-terminal-muted: #858585;
    --vsc-terminal-prompt-path: #4ec9b0;
    --vsc-terminal-prompt-symbol: #569cd6;
    --vsc-terminal-hover: #2a2d2e;
    --vsc-terminal-focus: #007acc;
  }

  .editor-shell.terminal-open .panel-splitter {
    background:
      linear-gradient(
        to bottom,
        transparent 0,
        transparent 1px,
        var(--vsc-terminal-border) 1px,
        var(--vsc-terminal-border) 2px,
        transparent 2px
      ),
      var(--vsc-terminal-header-bg);
    border: 0;
    cursor: row-resize;
    height: var(--panel-splitter-height);
  }

  .editor-shell.terminal-open .panel-splitter:hover {
    background:
      linear-gradient(
        to bottom,
        transparent 0,
        transparent 1px,
        var(--vsc-terminal-focus) 1px,
        var(--vsc-terminal-focus) 2px,
        transparent 2px
      ),
      var(--vsc-terminal-header-bg);
  }

  .bottom-panel {
    background: var(--vsc-terminal-bg);
    border-top: 1px solid var(--vsc-terminal-border);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 2%);
    color: var(--vsc-terminal-text);
    font-family: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
    grid-template-rows: 35px minmax(0, 1fr) 30px;
  }

  .bottom-panel .bottom-panel-header {
    align-items: stretch;
    background: var(--vsc-terminal-header-bg);
    border-bottom: 1px solid #2b2b2b;
    color: var(--vsc-terminal-tab-inactive);
    display: flex;
    font-family: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
    font-size: 11px;
    font-weight: 600;
    justify-content: space-between;
    letter-spacing: 0;
    min-height: 35px;
    padding: 0 8px 0 10px;
    text-transform: uppercase;
  }

  .bottom-panel .terminal-tabs {
    align-items: stretch;
    display: flex;
    gap: 18px;
    height: 35px;
    min-width: 0;
  }

  .bottom-panel .terminal-tab {
    align-items: center;
    border-top: 1px solid transparent;
    color: var(--vsc-terminal-tab-inactive);
    display: inline-flex;
    height: 35px;
    line-height: 35px;
    position: relative;
    white-space: nowrap;
  }

  .bottom-panel .terminal-tab.active {
    color: var(--vsc-terminal-tab-active);
  }

  .bottom-panel .terminal-tab.active::after {
    background: var(--vsc-terminal-focus);
    bottom: 0;
    content: "";
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }

  .bottom-panel .terminal-toolbar {
    align-items: center;
    display: flex;
    gap: 2px;
    height: 35px;
    justify-content: flex-end;
    min-width: 0;
  }

  .bottom-panel .terminal-shell {
    align-items: center;
    border-radius: 3px;
    color: var(--vsc-terminal-text);
    display: inline-flex;
    font-size: 12px;
    font-weight: 400;
    height: 24px;
    margin-right: 4px;
    max-width: 150px;
    overflow: hidden;
    padding: 0 8px;
    text-overflow: ellipsis;
    text-transform: none;
    white-space: nowrap;
  }

  .bottom-panel .terminal-shell::before {
    color: var(--vsc-terminal-muted);
    content: ">";
    font-family: "Cascadia Mono", Consolas, monospace;
    margin-right: 6px;
  }

  .bottom-panel .terminal-shell:hover,
  .bottom-panel .terminal-action:hover {
    background: var(--vsc-terminal-hover);
    color: #ffffff;
  }

  .bottom-panel .terminal-action {
    align-items: center;
    border-radius: 3px;
    color: var(--vsc-terminal-text);
    display: inline-flex;
    font-family: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
    font-size: 15px;
    font-weight: 400;
    height: 24px;
    justify-content: center;
    line-height: 1;
    width: 24px;
  }

  .bottom-panel .terminal-action.dropdown {
    font-size: 13px;
  }

  .bottom-panel .terminal-action.split {
    font-size: 12px;
    transform: translateY(-1px);
  }

  .bottom-panel .terminal-action.close {
    font-size: 16px;
  }

  .bottom-panel .terminal-history {
    background: var(--vsc-terminal-bg);
    color: var(--vsc-terminal-text);
    font-family: "Cascadia Mono", Consolas, "Courier New", monospace;
    font-size: 13px;
    font-variant-ligatures: none;
    line-height: 19px;
    padding: 8px 14px 6px;
    scrollbar-color: rgb(121 121 121 / 42%) transparent;
    white-space: pre-wrap;
    word-break: normal;
    overflow-wrap: anywhere;
  }

  .bottom-panel .terminal-line {
    color: var(--vsc-terminal-text);
    line-height: 19px;
    margin: 0;
    min-height: 19px;
  }

  .bottom-panel .terminal-line:first-child {
    color: var(--vsc-terminal-muted);
  }

  .bottom-panel .terminal-input-row {
    align-items: center;
    background: var(--vsc-terminal-bg);
    border-top: 0;
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(0, auto) minmax(0, 1fr);
    min-height: 30px;
    padding: 2px 14px 6px;
  }

  .bottom-panel .terminal-prompt {
    align-items: center;
    display: inline-flex;
    font-family: "Cascadia Mono", Consolas, "Courier New", monospace;
    font-size: 13px;
    line-height: 20px;
    min-width: 0;
    white-space: nowrap;
  }

  .bottom-panel .terminal-cwd {
    color: var(--vsc-terminal-prompt-path);
    max-width: min(46vw, 560px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bottom-panel .terminal-symbol {
    color: var(--vsc-terminal-prompt-symbol);
    margin-left: 6px;
  }

  .bottom-panel .terminal-input {
    background: rgb(255 255 255 / 3%);
    border: 1px solid transparent;
    border-radius: 2px;
    caret-color: #ffffff;
    color: #ffffff;
    font-family: "Cascadia Mono", Consolas, "Courier New", monospace;
    font-size: 13px;
    height: 22px;
    line-height: 20px;
    outline: none;
    padding: 0 5px;
  }

  .bottom-panel .terminal-input:hover {
    background: rgb(255 255 255 / 4%);
  }

  .bottom-panel .terminal-input:focus,
  .bottom-panel .terminal-input:focus-visible {
    background: rgb(255 255 255 / 5%);
    border-color: rgb(0 122 204 / 70%);
    box-shadow: 0 0 0 1px rgb(0 122 204 / 18%);
  }

  /* High fidelity VS Code Dark Modern polish for Windows 11 */
  --activity-bar-width: 48px;
  --menu-bar-height: 32px;
  --status-bar-height: 22px;
  --explorer-row-height: 22px;
  --vscode-bg: #1f1f1f;
  --vscode-bg-elevated: #252526;
  --vscode-bg-hover: #2a2d2e;
  --vscode-bg-input: #313131;
  --vscode-bg-menu: #181818;
  --vscode-bg-panel: #181818;
  --vscode-bg-side: #252526;
  --vscode-border: #2b2b2b;
  --vscode-border-subtle: #1f1f1f;
  --vscode-focus: #007acc;
  --vscode-foreground: #cccccc;
  --vscode-foreground-muted: #9d9d9d;
  --vscode-foreground-subtle: #858585;
  --vscode-list-active: #37373d;
  --vscode-list-hover: #2a2d2e;
  --vscode-tab-active: #1f1f1f;
  --vscode-tab-inactive: #181818;

  .editor-shell {
    background: var(--vscode-bg);
    border-radius: 7px;
    box-shadow:
      inset 0 0 0 1px rgb(255 255 255 / 3%),
      0 18px 48px rgb(0 0 0 / 34%);
    color-scheme: dark;
  }

  .workbench {
    background: var(--vscode-bg);
    grid-template-rows: minmax(var(--menu-bar-height), auto) 1fr;
    overflow: hidden;
  }

  .menu-bar {
    align-items: center;
    background:
      linear-gradient(180deg, rgb(255 255 255 / 5%), rgb(255 255 255 / 0%)),
      rgb(43 43 43 / 92%);
    backdrop-filter: blur(18px) saturate(125%);
    border-bottom-color: rgb(31 31 31 / 95%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
    display: grid;
    gap: 8px;
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    max-height: none;
    min-height: var(--menu-bar-height);
    padding: 0 0 0 8px;
  }

  .menu-bar > ol {
    align-content: center;
    flex-wrap: nowrap;
    gap: 0;
    height: var(--menu-bar-height);
    min-height: var(--menu-bar-height);
    overflow: visible;
    row-gap: 0;
  }

  .menu-bar > ol > li > button {
    border-radius: 4px;
    color: #cccccc;
    height: 24px;
    line-height: 24px;
    padding: 0 8px;
    transition:
      background-color 120ms ease,
      color 120ms ease;
  }

  .menu-bar > ol > li {
    height: 24px;
  }

  .menu-bar > ol > li > button:hover,
  .menu-bar > ol > li > button.active {
    background: rgb(255 255 255 / 10%);
    color: #ffffff;
  }

  .menu-bar > ol > li.validate-item > button {
    background: rgb(45 128 83 / 82%);
    border-color: rgb(78 184 121 / 60%);
    border-radius: 4px;
    height: 24px;
    line-height: 22px;
  }

  .menu-bar > ol > li > menu.menu-dropdown {
    background: #252526;
    border: 1px solid #454545;
    border-radius: 6px;
    box-shadow:
      0 16px 36px rgb(0 0 0 / 48%),
      inset 0 1px 0 rgb(255 255 255 / 4%);
    min-width: 220px;
    padding: 5px 0;
    top: calc(var(--menu-bar-height) - 2px);
  }

  .menu-bar > ol > li > menu.menu-dropdown li button {
    border-radius: 0;
    color: #cccccc;
    font-size: 12px;
    height: 26px;
    padding: 0 28px 0 28px;
  }

  .menu-bar > ol > li > menu.menu-dropdown li button:hover {
    background: #04395e;
    color: #ffffff;
  }

  .menu-bar > ol > li > menu.menu-dropdown li button:disabled {
    color: #6a6a6a;
    cursor: default;
  }

  .activity-bar {
    background:
      linear-gradient(180deg, rgb(255 255 255 / 4%), transparent 55%),
      rgb(45 45 45 / 96%);
    backdrop-filter: blur(18px) saturate(115%);
    border-right-color: #1f1f23;
    box-shadow:
      inset -1px 0 0 rgb(0 0 0 / 26%),
      inset 1px 0 0 rgb(255 255 255 / 3%);
    gap: 2px;
    padding: 6px 0;
    width: var(--activity-bar-width);
  }

  .activity-bar button {
    border: 0;
    border-left: 2px solid transparent;
    color: #858585;
    font-size: 0;
    height: 48px;
    line-height: 0;
    overflow: hidden;
    position: relative;
    transition:
      background-color 120ms ease,
      color 120ms ease;
    width: var(--activity-bar-width);
  }

  .activity-bar button::before {
    background: currentColor;
    content: "";
    height: 25px;
    left: 50%;
    opacity: 0.96;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 25px;
    z-index: 1;
  }

  .activity-bar button::after {
    background: transparent;
    border-radius: 6px;
    content: "";
    height: 36px;
    left: 6px;
    position: absolute;
    top: 6px;
    transition: background-color 120ms ease;
    width: 36px;
  }

  .activity-bar button:hover {
    color: #cccccc;
  }

  .activity-bar button:hover::after {
    background: rgb(255 255 255 / 7%);
  }

  .activity-bar button.active {
    border-left-color: #007acc;
    color: #ffffff;
  }

  .activity-bar button.active::after {
    background: rgb(0 122 204 / 14%);
  }

  .activity-bar button[title="Explorer"]::before {
    clip-path: path(
      "M4 2.5h6.2l1.45 1.65H20c.83 0 1.5.67 1.5 1.5v13.1c0 .83-.67 1.5-1.5 1.5H4c-.83 0-1.5-.67-1.5-1.5V4c0-.83.67-1.5 1.5-1.5Zm0 2v14.25h16V6.15h-9.25L9.3 4.5H4Z"
    );
  }

  .activity-bar button[title="Search"]::before {
    clip-path: path(
      "M10.3 3a7.3 7.3 0 0 1 5.76 11.78l4.08 4.08-1.28 1.28-4.08-4.08A7.3 7.3 0 1 1 10.3 3Zm0 1.8a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"
    );
  }

  .activity-bar button[title="Source Control"]::before {
    clip-path: path(
      "M7 3.5a3.25 3.25 0 0 1 1 6.34v2.31A4.35 4.35 0 0 0 12.35 16H14a3.25 3.25 0 1 1 0 1.8h-1.65A6.15 6.15 0 0 1 6.2 11.65V9.84A3.25 3.25 0 0 1 7 3.5Zm0 1.8a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Zm10 10.5a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z"
    );
  }

  .activity-bar button[title="Run and Debug"]::before {
    clip-path: path(
      "M5 3.4 15.7 10 5 16.6V3.4Zm2 3.22v6.76L12.48 10 7 6.62ZM16 5h2.5A2.5 2.5 0 0 1 21 7.5V10h-1.8V7.5c0-.39-.31-.7-.7-.7H16V5Zm3.2 9.5V12H21v2.5a2.5 2.5 0 0 1-2.5 2.5H16v-1.8h2.5c.39 0 .7-.31.7-.7Z"
    );
  }

  .activity-bar button[title="Extensions"]::before {
    clip-path: path(
      "M4 4h6.5v6.5H4V4Zm9.5 0H20v6.5h-6.5V4ZM4 13.5h6.5V20H4v-6.5Zm9.5 0H20V20h-6.5v-6.5ZM5.8 5.8v2.9h2.9V5.8H5.8Zm9.5 0v2.9h2.9V5.8h-2.9Zm-9.5 9.5v2.9h2.9v-2.9H5.8Zm9.5 0v2.9h2.9v-2.9h-2.9Z"
    );
  }

  .activity-bar button.toggle-sidebar-control {
    margin-top: auto;
  }

  .activity-bar button[title*="Side Bar"]::before {
    clip-path: path("M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z");
  }

  .side-panel {
    background: var(--vscode-bg-side);
    border-right-color: #1f1f23;
    box-shadow: inset -1px 0 0 rgb(0 0 0 / 22%);
  }

  .side-panel header {
    border-bottom: 0;
    color: #bbbbbb;
    font-size: 11px;
    font-weight: 600;
    height: 35px;
    letter-spacing: 0;
    padding: 9px 10px 0 12px;
    text-transform: uppercase;
  }

  .side-panel .panel-actions {
    gap: 2px;
  }

  .side-panel .panel-actions .icon-action {
    border: 0;
    border-radius: 4px;
    color: #cccccc;
    height: 22px;
    opacity: 0;
    width: 22px;
  }

  .side-panel:hover .panel-actions .icon-action {
    opacity: 1;
  }

  .side-panel .panel-actions .icon-action:hover {
    background: var(--vscode-bg-hover);
  }

  .side-panel .section-title,
  .side-panel .folder-title {
    align-items: center;
    color: #bbbbbb;
    display: flex;
    font-size: 11px;
    font-weight: 700;
    height: 22px;
    line-height: 22px;
    margin: 0;
    padding: 0 12px;
    text-transform: uppercase;
  }

  .side-panel .section-title::before,
  .side-panel .folder-title::before {
    color: #cccccc;
    content: ">";
    font-size: 11px;
    margin-right: 5px;
    transform: rotate(90deg);
  }

  .side-panel .open-editors,
  .side-panel .folder-entries {
    padding: 0;
  }

  .side-panel li button,
  .side-panel .entry-editor-row {
    border: 1px solid transparent;
    border-radius: 0;
    color: #cccccc;
    font-size: 13px;
    height: var(--explorer-row-height);
    line-height: var(--explorer-row-height);
    padding-bottom: 0;
    padding-top: 0;
    transition:
      background-color 90ms ease,
      color 90ms ease;
  }

  .side-panel li button:hover {
    background: var(--vscode-list-hover);
  }

  .side-panel li button.active {
    background: var(--vscode-list-active);
    color: #ffffff;
  }

  .side-panel li button:focus-visible,
  .tabs .tab .open:focus-visible,
  .tabs .tab .close:focus-visible,
  .menu-bar button:focus-visible,
  .activity-bar button:focus-visible {
    outline: 1px solid var(--vscode-focus);
    outline-offset: -1px;
  }

  .side-panel li button span:first-child {
    color: #858585;
    font-size: 10px;
    text-align: center;
    width: 12px;
  }

  .side-panel .entry-icon,
  .side-panel .file-icon,
  .tabs .file-icon {
    align-items: center;
    display: inline-flex;
    filter: saturate(1.06);
    height: 16px;
    justify-content: center;
    min-width: 16px;
    width: 16px;
  }

  .side-panel .entry-icon svg,
  .side-panel .file-icon svg,
  .tabs .file-icon svg {
    font-size: 15px;
  }

  .side-panel button.close {
    border-radius: 4px;
    color: transparent;
    font-size: 0;
    height: 20px;
    margin-right: 2px;
    position: relative;
    width: 20px;
  }

  .side-panel button.close::before,
  .side-panel button.close::after {
    background: currentColor;
    content: "";
    height: 1px;
    left: 5px;
    position: absolute;
    top: 9px;
    width: 10px;
  }

  .side-panel button.close::before {
    transform: rotate(45deg);
  }

  .side-panel button.close::after {
    transform: rotate(-45deg);
  }

  .side-panel li:hover button.close,
  .side-panel button.close:hover {
    color: #c5c5c5;
  }

  .side-panel button.close:hover {
    background: #3c3c3c;
  }

  .sidebar-splitter,
  .panel-splitter {
    background: var(--vscode-bg);
    border: 0;
  }

  .sidebar-splitter:hover,
  .panel-splitter:hover {
    background: var(--vscode-focus);
  }

  .editor-area {
    background: var(--vscode-bg);
  }

  .breadcrumbs {
    background: var(--vscode-bg);
    border-bottom-color: #2a2a2a;
    color: #9d9d9d;
    font-size: 12px;
    height: 24px;
    line-height: 14px;
    padding: 5px 12px;
  }

  .tabs {
    background: var(--vscode-tab-inactive);
    border-bottom: 1px solid var(--vscode-border);
    box-shadow: inset 0 -1px 0 rgb(0 0 0 / 16%);
    height: 35px;
    padding: 0;
  }

  .tabs .tab {
    background: #181818;
    border: 0;
    border-right: 1px solid #2b2b2b;
    height: 35px;
    margin: 0;
    max-width: min(280px, 72%);
    min-width: 120px;
    position: relative;
    transition: background-color 100ms ease;
  }

  .tabs .tab::before {
    background: transparent;
    content: "";
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .tabs .tab:hover {
    background: #2a2a2a;
  }

  .tabs .tab.active {
    background: var(--vscode-tab-active);
  }

  .tabs .tab.active::before {
    background: var(--vscode-focus);
  }

  .tabs .tab .open {
    color: #bdbdbd;
    font-size: 13px;
    height: 35px;
    max-width: 230px;
    padding: 0 8px 0 10px;
  }

  .tabs .tab.active .open {
    color: #ffffff;
  }

  .tabs .tab .open::after {
    background: #d4d4d4;
    border-radius: 999px;
    content: "";
    height: 7px;
    margin-left: 8px;
    opacity: 0.75;
    width: 7px;
  }

  .tabs .tab .close {
    border-radius: 4px;
    color: transparent;
    font-size: 0;
    height: 20px;
    margin-right: 7px;
    opacity: 1;
    position: relative;
    visibility: visible;
    width: 20px;
  }

  .tabs .tab .close::before,
  .tabs .tab .close::after {
    background: currentColor;
    content: "";
    height: 1px;
    left: 5px;
    position: absolute;
    top: 9px;
    width: 10px;
  }

  .tabs .tab .close::before {
    transform: rotate(45deg);
  }

  .tabs .tab .close::after {
    transform: rotate(-45deg);
  }

  .tabs .tab:hover .close,
  .tabs .tab.active .close {
    color: #c5c5c5;
  }

  .tabs .tab .close:hover {
    background: #3c3c3c;
    color: #ffffff;
  }

  .editor-host,
  .editor-host .monaco-editor,
  .editor-host .monaco-editor-background,
  .editor-host .monaco-editor .margin {
    background-color: var(--vscode-bg);
  }

  .monaco-editor .quick-input-widget,
  .monaco-editor .suggest-widget {
    border: 1px solid #454545;
    border-radius: 6px;
    box-shadow: 0 16px 40px rgb(0 0 0 / 48%);
    overflow: hidden;
  }

  .context-menu,
  .confirm-dialog,
  .save-as-dialog,
  .validation-panel {
    backdrop-filter: blur(18px) saturate(115%);
    background: rgb(37 37 38 / 96%);
    border-color: #454545;
    border-radius: 6px;
    box-shadow:
      0 16px 40px rgb(0 0 0 / 50%),
      inset 0 1px 0 rgb(255 255 255 / 4%);
  }

  * {
    scrollbar-color: rgb(121 121 121 / 42%) transparent;
    scrollbar-width: thin;
  }

  *::-webkit-scrollbar {
    height: 10px;
    width: 10px;
  }

  *::-webkit-scrollbar-thumb {
    background: rgb(121 121 121 / 38%);
    background-clip: padding-box;
    border: 2px solid transparent;
    border-radius: 999px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: rgb(121 121 121 / 62%);
    background-clip: padding-box;
  }

  @media (max-width: 900px) {
    --activity-bar-width: 44px;
    --menu-bar-height: 32px;

    .menu-bar {
      align-items: center;
      grid-template-columns: minmax(0, 1fr);
      padding-left: 6px;
    }

    .menu-bar > ol {
      display: flex;
      max-width: 100%;
    }

    .activity-bar button {
      height: 44px;
      width: var(--activity-bar-width);
    }

    .activity-bar button::after {
      left: 4px;
    }
  }

  .workbench {
    grid-template-rows: var(--menu-bar-height) 1fr;
  }

  .menu-bar {
    align-items: center;
    height: var(--menu-bar-height);
    max-height: var(--menu-bar-height);
    min-height: var(--menu-bar-height);
  }

  .menu-bar > ol {
    flex-wrap: nowrap;
    height: var(--menu-bar-height);
    min-height: var(--menu-bar-height);
    overflow: visible;
    row-gap: 0;
  }

  .menu-bar > ol > li {
    height: 100%;
  }

  @media (max-width: 760px) {
    .menu-bar {
      padding-left: 4px;
    }
  }

  @media (max-width: 620px) {
    .menu-bar > ol > li > button {
      padding: 0 6px;
    }
  }
`;

export default StyledMonacoEditor;

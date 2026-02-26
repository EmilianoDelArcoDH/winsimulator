import styled from "styled-components";

const StyledMonacoEditor = styled.div`
  background: rgb(30 30 30);
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  overflow: hidden;
  width: 100%;

  && {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height}px - 31px)`};
  }

  .workbench {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-rows: 30px 1fr;
    height: 100%;
    width: 100%;
  }

  .menu-bar {
    align-items: center;
    background: rgb(60 60 60);
    border-bottom: 1px solid rgb(39 39 39);
    display: flex;
    grid-column: 1 / -1;
    overflow: hidden;
    padding: 0 8px;

    ol {
      display: flex;
      gap: 12px;
    }

    li {
      position: relative;

      > button {
        background: transparent;
        border: 0;
        color: rgb(230 230 230);
        cursor: default;
        font-size: 12px;
        padding: 4px 6px;

        &:hover,
        &.active {
          background: rgb(78 78 78);
        }
      }

      menu {
        background: rgb(49 49 49);
        border: 1px solid rgb(29 29 29);
        box-shadow: 0 6px 16px rgb(0 0 0 / 35%);
        left: 0;
        min-width: 180px;
        padding: 4px;
        position: absolute;
        top: 24px;
        z-index: 5;

        li {
          width: 100%;

          button {
            background: transparent;
            border: 0;
            color: rgb(235 235 235);
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
    gap: 6px;
    padding: 6px 0;
    width: 48px;

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
    min-width: 240px;
    padding-bottom: 8px;

    header {
      border-bottom: 1px solid rgb(56 56 56);
      color: rgb(198 198 198);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 10px 12px;
    }

    .location {
      color: rgb(138 138 138);
      font-size: 11px;
      margin: 8px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .open-editors {
      margin-bottom: 6px;
      padding: 0 4px;

      li {
        align-items: center;
        display: grid;
        gap: 4px;
        grid-template-columns: 1fr auto;

        button.close {
          align-items: center;
          background: transparent;
          border: 0;
          color: rgb(175 175 175);
          display: inline-flex;
          font-size: 14px;
          height: 26px;
          justify-content: center;
          width: 20px;

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

    li {
      margin: 0;

      button {
        align-items: center;
        background: transparent;
        border: 0;
        color: rgb(212 212 212);
        display: flex;
        gap: 6px;
        padding: 6px 8px;
        text-align: left;
        width: 100%;

        span {
          color: rgb(135 135 135);
          width: 10px;
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

    .placeholder {
      color: rgb(138 138 138);
      font-size: 12px;
      margin: 8px 12px;
    }
  }

  .editor-area {
    display: grid;
    grid-template-rows: auto auto 1fr;
    min-width: 0;
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
    height: 35px;
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
      color: rgb(220 220 220);
      font-size: 12px;
      padding-left: 8px;
    }
  }

  .editor-host {
    height: 100%;
    min-height: 0;
    position: relative;
  }
`;

export default StyledMonacoEditor;

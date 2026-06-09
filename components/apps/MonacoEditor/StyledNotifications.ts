import styled from "styled-components";

const StyledNotifications = styled.ol`
  bottom: calc(22px + 18px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  place-items: flex-end;
  position: absolute;
  right: 22px;
  width: calc(100% - 80px);

  .notification {
    background: #252526;
    border: 1px solid #454545;
    border-radius: 4px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 38%),
      0 0 0 1px rgb(255 255 255 / 2%);
    color: #cccccc;
    font-family:
      "Segoe UI Variable",
      "Segoe UI",
      system-ui,
      -apple-system,
      sans-serif;
    max-width: 100%;
    min-height: 42px;
    padding: 10px 13px 10px 11px;
    width: fit-content;

    &:hover {
      background: #2d2d30;
      border-color: #5a5a5a;
    }

    figure {
      display: flex;
      margin: 0;
      place-items: center;

      svg {
        height: 16px;
        min-width: 16px;
        width: 16px;

        &.warning {
          color: #cca700;
        }

        &.error {
          color: #f14c4c;
        }

        &.info {
          color: #3794ff;
        }
      }

      figcaption {
        font-size: 13px;
        line-height: 18px;
        max-width: calc(100% - 16px);
        overflow: hidden;
        padding-left: 8px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
`;

export default StyledNotifications;

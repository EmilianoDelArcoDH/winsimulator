import styled from "styled-components";

const StyledStatusBar = styled.footer`
  background-color: rgb(0 122 204);
  border-top: 0;
  color: rgb(255 255 255);
  display: flex;
  font-size: 11px;
  height: 22px;
  min-height: 22px;
  overflow: hidden;
  place-content: space-between;
  position: relative;
  width: 100%;
  z-index: 1;

  ol.status {
    display: flex;
    place-content: flex-end;
    place-items: center;

    &:first-of-type {
      padding-left: 8px;
    }

    &:last-of-type {
      padding-right: 8px;
    }

    li {
      margin: 0 4px;
      padding: 2px 8px;
      white-space: nowrap;

      button {
        color: inherit;
        font-size: inherit;
        padding: 2px 8px;

        &.pretty {
          position: relative;
          top: -2px;
        }

        svg {
          fill: rgb(255 255 255);
          height: 16px;
          width: 16px;
        }
      }

      &:hover {
        background-color: rgb(25 137 214);
      }

      &:active {
        background-color: rgb(0 111 186);
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

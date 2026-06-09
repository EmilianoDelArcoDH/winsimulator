import styled from "styled-components";

type StyledTaskbarEntriesProps = {
  $clockWidth: number;
  $hasAI: boolean;
};

const StyledTaskbarEntries = styled.ol<StyledTaskbarEntriesProps>`
  column-gap: 2px;
  display: flex;
  height: 100%;
  margin: 0 2px;
  max-width: min(55vw, 520px);
  overflow: hidden;
  position: relative;
`;

export default StyledTaskbarEntries;

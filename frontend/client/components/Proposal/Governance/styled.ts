import styled from 'styled-components';

const smallScreen = '1080px';

// Governance
export const GovernanceContainer = styled.div`
  display: flex;
  padding-top: 1rem;

  @media (max-width: ${smallScreen}) {
    flex-direction: column;
  }
`;

export const GovernanceDivider = styled.div`
  width: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin: 0 2rem;

  @media (max-width: ${smallScreen}) {
    height: 1px;
    width: 100%;
    margin: 2rem 0;
  }
`;

// MilestoneActions
export const MilestoneActionText = styled.p`
  font-size: 1rem;
`;

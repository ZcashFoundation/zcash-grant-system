import React from 'react';
import GovernanceMilestones from './Milestones';
import GovernanceRefunds from './Refunds';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import Placeholder from 'components/Placeholder';
import * as Styled from './styled';

interface Props {
  proposal: ProposalWithCrowdFund;
}

export default class ProposalGovernance extends React.Component<Props> {
  render() {
    const { proposal } = this.props;

    if (!proposal.crowdFund.isRaiseGoalReached) {
      return (
        <Placeholder
          style={{ minHeight: '220px' }}
          title="Governance isn’t available yet"
          subtitle={`
            Milestone history and voting will be displayed here once the
            project has been funded
          `}
        />
      );
    }

    return (
      <Styled.GovernanceContainer>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '1rem' }}>Milestone Voting</h2>
          <GovernanceMilestones proposal={proposal} />
        </div>
        <Styled.GovernanceDivider />
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '1rem' }}>Refunds</h2>
          <GovernanceRefunds proposal={proposal} />
        </div>
      </Styled.GovernanceContainer>
    );
  }
}

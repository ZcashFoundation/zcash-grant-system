import React from 'react';
import GovernanceMilestones from './Milestones';
import GovernanceRefunds from './Refunds';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';
import './style.less';

interface Props {
  proposal: ProposalWithCrowdFund;
}

export default class ProposalGovernance extends React.Component<Props> {
  render() {
    const { proposal } = this.props;
    return (
      <div className="ProposalGovernance">
        <div className="ProposalGovernance-section">
          <h2 className="ProposalGovernance-section-title">Milestone Voting</h2>
          <GovernanceMilestones proposal={proposal} />
        </div>
        <div className="ProposalGovernance-divider" />
        <div className="ProposalGovernance-section">
          <h2 className="ProposalGovernance-section-title">Refunds</h2>
          <GovernanceRefunds proposal={proposal} />
        </div>
      </div>
    );
  }
}

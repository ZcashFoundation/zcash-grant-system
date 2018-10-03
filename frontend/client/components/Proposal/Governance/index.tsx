import React from 'react';
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
        <div className="ProposalGovernance-content">
          <GovernanceRefunds proposal={proposal} />
        </div>
      </div>
    );
  }
}

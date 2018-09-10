import React from 'react';
import { connect } from 'react-redux';
import { ProposalWithCrowdFund } from 'modules/proposals/reducers';

interface Props {
  proposalId: ProposalWithCrowdFund['proposalId'];
}

class ProposalCommunity extends React.Component<Props> {
  render() {
    return <h1>Yo</h1>;
  }
}

export default connect(
  undefined,
  undefined,
)(ProposalCommunity);

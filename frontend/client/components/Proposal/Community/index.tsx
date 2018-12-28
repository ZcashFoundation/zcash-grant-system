import React from 'react';
import { connect } from 'react-redux';
import { Proposal } from 'types';

interface Props {
  proposalId: Proposal['proposalId'];
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

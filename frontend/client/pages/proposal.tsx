import React, { Component } from 'react';
import Web3Page from 'components/Web3Page';
import Proposal from 'components/Proposal';

import { withRouter, RouteComponentProps } from 'react-router';

type RouteProps = RouteComponentProps<any>;

class ProposalPage extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
  }
  render() {
    const proposalId = this.props.match.params.id;
    return (
      <Web3Page
        title={`Proposal ${proposalId}`}
        render={() => <Proposal proposalId={proposalId} />}
      />
    );
  }
}

export default withRouter(ProposalPage);

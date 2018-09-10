import React, { Component } from 'react';
import Web3Page from 'components/Web3Page';
import Proposal from 'components/Proposal';

import { WithRouterProps, withRouter } from 'next/router';

type RouteProps = WithRouterProps;

class ProposalPage extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
  }
  render() {
    const proposalId = this.props.router.query.id;
    return (
      <Web3Page
        title={`Proposal ${proposalId}`}
        render={() => <Proposal proposalId={proposalId} />}
      />
    );
  }
}

export default withRouter(ProposalPage);

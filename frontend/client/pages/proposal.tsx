import React, { Component } from 'react';
import Proposal from 'components/Proposal';
import { extractProposalIdFromUrl } from 'utils/api';

import { withRouter, RouteComponentProps } from 'react-router';

type RouteProps = RouteComponentProps<any>;

class ProposalPage extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
  }
  render() {
    const proposalId = extractProposalIdFromUrl(this.props.match.params.id);
    return <Proposal proposalId={proposalId} />;
  }
}

export default withRouter(ProposalPage);

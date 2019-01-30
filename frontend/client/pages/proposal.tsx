import React, { Component } from 'react';
import Proposal from 'components/Proposal';
import { extractIdFromSlug } from 'utils/api';

import { withRouter, RouteComponentProps } from 'react-router';

type RouteProps = RouteComponentProps<any>;

class ProposalPage extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
  }
  render() {
    const proposalId = extractIdFromSlug(this.props.match.params.id);
    return <Proposal proposalId={proposalId} />;
  }
}

export default withRouter(ProposalPage);

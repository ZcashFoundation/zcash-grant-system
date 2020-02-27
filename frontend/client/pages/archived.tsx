import React, { Component } from 'react';
import Archived from 'components/Archived';
import { extractIdFromSlug } from 'utils/api';

import { withRouter, RouteComponentProps } from 'react-router';

type RouteProps = RouteComponentProps<any>;

class ProposalPage extends Component<RouteProps> {
  render() {
    const proposalId = extractIdFromSlug(this.props.match.params.id);
    return <Archived proposalId={proposalId} />;
  }
}

export default withRouter(ProposalPage);

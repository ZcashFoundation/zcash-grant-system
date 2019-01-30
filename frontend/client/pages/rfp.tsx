import React, { Component } from 'react';
import RFP from 'components/RFP';
import { extractIdFromSlug } from 'utils/api';

import { withRouter, RouteComponentProps } from 'react-router';

type RouteProps = RouteComponentProps<any>;

class ProposalPage extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
  }
  render() {
    const rfpId = extractIdFromSlug(this.props.match.params.id);
    return <RFP rfpId={rfpId} />;
  }
}

export default withRouter(ProposalPage);
